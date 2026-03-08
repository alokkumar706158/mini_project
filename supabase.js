const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Sahi tarika: Pehle URL aur Key ko variables mein store karein
const supabaseUrl = 'https://hmymcnvsycwnygpxlpix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhteW1jbnZzeWN3bnlncHhscGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MTA3MTgsImV4cCI6MjA4NTk4NjcxOH0.Z2yOARtFHdcLnKeBEARuOXZRuYfiXcFhVn2CelJmTLw';

// Client create karte waqt in variables ko pass karein
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;