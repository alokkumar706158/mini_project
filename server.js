require('dotenv').config();
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const upload = multer({ storage: multer.memoryStorage() });

// --- API: Get Patient Records (FIXED) ---
app.get('/api/patient/records/:id', async (req, res) => {
    try {
        const p_id = req.params.id;
        console.log("Searching records for ID:", p_id);

        const { data, error } = await supabase
            .from('medical_records')
            .select('*')
            .eq('patient_id', p_id)
            .order('upload_date', { ascending: false });

        if (error) throw error;
        
        console.log(`Found ${data.length} records for ${p_id}`);
        res.json(data);
    } catch (err) {
        console.error("Fetch Route Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- API: Login (Verify OTP) ---
app.post('/api/auth/verify-otp', async (req, res) => {
    const { aadhaar, userOTP } = req.body;
    if (userOTP !== "123456") return res.status(401).json({ success: false, message: "Invalid OTP" });

    try {
        const lastFour = aadhaar.slice(-4);
        let { data: patient } = await supabase.from('patients').select('*').eq('aadhaar_last_four', lastFour).maybeSingle();

        if (!patient) {
            const newID = `MV-${Math.floor(100000 + Math.random() * 900000)}`;
            const { data } = await supabase.from('patients').insert([{ patient_id: newID, aadhaar_last_four: lastFour, name: "User_"+lastFour }]).select().single();
            patient = data;
        }

        const token = jwt.sign({ id: patient.patient_id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
        res.json({ success: true, token, patientId: patient.patient_id });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- API: Upload File ---
app.post('/api/patient/upload', upload.single('medicalDoc'), async (req, res) => {
    try {
        const { patient_id, notes } = req.body;
        const file = req.file;
        if (!file) throw new Error("No file selected");

        const fileName = `${patient_id}/${Date.now()}_${file.originalname}`;
        const { error: sErr } = await supabase.storage.from('medical-records').upload(fileName, file.buffer, { contentType: file.mimetype });
        if (sErr) throw sErr;

        const { data: urlData } = supabase.storage.from('medical-records').getPublicUrl(fileName);
        await supabase.from('medical_records').insert([{ patient_id, file_url: urlData.publicUrl, notes }]);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));