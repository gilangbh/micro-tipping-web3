const express = require('express');
const router = express.Router();
const { supabase } = require('../index'); // Import supabase from index.js

// GET /api/ips/:ip_id_onchain
// Fetches detailed information about a single registered IP.
router.get('/:ip_id_onchain', async (req, res) => {
  const { ip_id_onchain } = req.params;

  if (!ip_id_onchain) {
    return res.status(400).json({ error: 'On-chain IP ID is required' });
  }

  try {
    // Fetch IP details along with basic creator info (name and wallet_address)
    // We can achieve this using a JOIN or by making two queries if Supabase JS client JOINs are complex for this case.
    // For simplicity and clarity with JS client, let's try a view or a function if complex, or two queries.
    // Simpler approach: Fetch IP, then fetch creator. Or rely on creator_id and let frontend fetch creator if needed.
    // The planned response was: { ..., creator: { wallet_address, name } }

    const { data: ipData, error: ipError } = await supabase
      .from('registered_ips')
      .select(`
        ip_id_onchain,
        name,
        description,
        metadata_url,
        tags,
        registered_onchain_at,
        creators ( wallet_address, name ) 
      `)
      .eq('ip_id_onchain', ip_id_onchain)
      .single();

    if (ipError && ipError.code !== 'PGRST116') { // PGRST116: "Searched item was not found"
      console.error('Error fetching IP details:', ipError);
      return res.status(500).json({ error: `Error fetching IP details: ${ipError.message}` });
    }

    if (!ipData) {
      return res.status(404).json({ error: 'IP not found' });
    }

    // Supabase returns the joined creator data nested. Let's structure it as planned.
    const response = {
        ip_id_onchain: ipData.ip_id_onchain,
        name: ipData.name,
        description: ipData.description,
        metadata_url: ipData.metadata_url,
        tags: ipData.tags,
        registered_onchain_at: ipData.registered_onchain_at,
        creator: ipData.creators ? { // Check if creator data exists (it should due to NOT NULL FK, but good practice)
            wallet_address: ipData.creators.wallet_address,
            name: ipData.creators.name
        } : null
    };

    res.json(response);

  } catch (error) {
    console.error('Unexpected error in /api/ips/:ip_id_onchain :', error);
    if (!res.headersSent) {
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});


// GET /api/ips (List/Search Registered IPs)
router.get('/', async (req, res) => {
  const { 
    creator_wallet_address,
    tag,
    search_term,
    page = 1,
    limit = 10,
    sort_by = 'cached_at_desc' // e.g., name_asc, registered_onchain_at_desc
  } = req.query;

  try {
    let query = supabase
      .from('registered_ips')
      .select(`
        ip_id_onchain,
        name,
        description,
        metadata_url,
        tags,
        registered_onchain_at,
        cached_at,
        creators!inner ( wallet_address, name ) 
      `, { count: 'exact' }); // !inner ensures we only get IPs that have a creator

    // Filtering
    if (creator_wallet_address) {
      // This requires a join or filtering on the joined table's column
      query = query.eq('creators.wallet_address', creator_wallet_address);
    }
    if (tag) {
      query = query.contains('tags', [tag]); // Assumes 'tags' is an array column
    }
    if (search_term) {
      // Using or for searching in name and description
      // Note: Supabase textSearch with FTS is more powerful for complex search
      query = query.or(`name.ilike.%${search_term}%,description.ilike.%${search_term}%`);
    }

    // Sorting
    const [sortField, sortOrder] = sort_by.split('_');
    const ascending = sortOrder === 'asc';
    if (sortField === 'name' || sortField === 'registered_onchain_at' || sortField === 'cached_at') {
      query = query.order(sortField, { ascending });
    } else {
      query = query.order('cached_at', { ascending: false }); // Default sort
    }

    // Pagination
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    const offset = (pageInt - 1) * limitInt;
    query = query.range(offset, offset + limitInt - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching IPs list:', error);
      return res.status(500).json({ error: `Error fetching IPs list: ${error.message}` });
    }

    const responseData = data.map(ip => ({
        ip_id_onchain: ip.ip_id_onchain,
        name: ip.name,
        description: ip.description, // Consider truncating for list view on frontend
        metadata_url: ip.metadata_url,
        tags: ip.tags,
        creator_wallet_address: ip.creators.wallet_address,
        creator_name: ip.creators.name,
        cached_at: ip.cached_at,
        registered_onchain_at: ip.registered_onchain_at
    })); 

    res.json({
      ips: responseData || [],
      pagination: {
        total_ips: count,
        current_page: pageInt,
        per_page: limitInt,
        total_pages: Math.ceil((count || 0) / limitInt),
      },
    });

  } catch (error) {
    console.error('Unexpected error in /api/ips :', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

module.exports = router; 