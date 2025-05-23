require('dotenv').config(); // Load environment variables at the very top
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3001; // Backend typically runs on a different port than frontend

app.use(express.json()); // Middleware to parse JSON bodies

// --- Supabase Client Initialization ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be provided in .env');
  // process.exit(1); // Optionally exit if Supabase keys are missing
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log(supabase ? 'Supabase client initialized.' : 'Supabase client failed to initialize.');

// --- API Routes ---
app.get('/', (req, res) => {
  res.send('Micro-Tipping Backend is running!');
});

// Example route to get data from Supabase (you'll create tables later)
app.get('/api/creators', async (req, res) => {
  try {
    // Assuming you have a 'creators' table in Supabase
    // const { data, error } = await supabase.from('creators').select('*');
    // if (error) throw error;
    // res.json(data);
    res.json({ message: "Supabase 'creators' endpoint placeholder. Setup your table first." }); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Server Start ---
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});

module.exports = { app, supabase }; // Export for potential testing or other modules 