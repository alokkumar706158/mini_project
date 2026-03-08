const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    aadhaarHash: { type: String, required: true, unique: true }, // Hashed for security
    aadhaarLastFour: { type: String, required: true },
    patientId: { type: String, unique: true },
    name: String,
    phone: String,
    documents: [{
        fileName: String,
        filePath: String,
        notes: String,
        uploadDate: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('Patient', PatientSchema);