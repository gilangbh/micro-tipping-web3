require('dotenv').config(); // Load environment variables at the very top
const express = require('express');
const cors = require('cors'); // Import cors
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3001; // Backend typically runs on a different port than frontend

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// --- Supabase Client Initialization ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // Use SUPABASE_ANON_KEY for client-side (anon) access if that's intended for these public GET routes. If you need service_role, ensure it's SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_KEY if appropriate) must be provided in .env file');
  // process.exit(1); // Optionally exit
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log(supabase ? 'Supabase client initialized.' : 'Supabase client failed to initialize.');

// --- API Routes ---
const creatorRoutes = require('./routes/creators');
const ipRoutes = require('./routes/ips');

app.get('/', (req, res) => {
  res.send('Micro-Tipping Backend is running!');
});

// Mount the routers
app.use('/api/creators', creatorRoutes);
app.use('/api/ips', ipRoutes);

// Remove the example /api/creators route from here as it will be in its own file
// app.get('/api/creators', async (req, res) => { ... });


// --- Error Handling Middleware (Optional but recommended) ---
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

// --- Server Start ---
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});

// Export supabase client for use in route files
module.exports = { supabase }; 