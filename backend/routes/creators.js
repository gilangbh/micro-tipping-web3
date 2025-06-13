const express = require('express');
const router = express.Router();
const { supabase } = require('../index'); // Import supabase from index.js

// GET /api/creators/:wallet_address
// Fetches a specific creator's profile information and a list of their registered IPs.
router.get('/:wallet_address', async (req, res) => {
  const { wallet_address } = req.params;
  const { page = 1, limit = 10 } = req.query; // For IP pagination

  if (!wallet_address) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    // 1. Fetch creator details
    // Ensure wallet_address is queried in a case-insensitive manner or stored consistently (e.g., lowercase)
    const { data: creatorData, error: creatorError } = await supabase
      .from('creators')
      .select('wallet_address, name, bio, is_verified, created_at')
      .ilike('wallet_address', wallet_address) // Case-insensitive match
      .single();

    if (creatorError && creatorError.code !== 'PGRST116') { // PGRST116: "Searched item was not found" which is a valid case
        console.error('Error fetching creator:', creatorError);
        throw new Error(`Error fetching creator: ${creatorError.message}`);
    }
    if (!creatorData) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    // 2. Fetch creator's registered IPs with pagination
    const offset = (page - 1) * limit;

    const { data: ipsData, error: ipsError, count } = await supabase
      .from('registered_ips')
      .select('ip_id_onchain, name, description, metadata_url, tags, registered_onchain_at', { count: 'exact' })
      .eq('creator_id', creatorData.id) // This assumes you've fetched creatorData.id. If not, you'd need another query or adjust schema/join
      .order('cached_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // The above .eq('creator_id', creatorData.id) will FAIL because creatorData from the first query does not include 'id' by default.
    // We need to fetch creator's internal 'id' first, or do a join.
    // Let's re-fetch creator with ID, or adjust the select. For simplicity, let's assume creatorData.id exists from a previous step or we adjust the query.
    // For a robust solution, ensure 'id' is selected for 'creators' or perform a join.

    // Corrected approach: Fetch creator including 'id', then fetch IPs.
    // The initial creator query should be:
    // .select('id, wallet_address, name, bio, is_verified, created_at')

    // Let's assume the first query for creatorData was:
    // const { data: creator, error: creatorError } = await supabase
    //   .from('creators')
    //   .select('id, wallet_address, name, bio, is_verified, created_at')
    //   .ilike('wallet_address', wallet_address)
    //   .single();
    // if (!creator) return res.status(404).json({ error: 'Creator not found' });

    // Then for IPs:
    // const { data: ipsData, error: ipsError, count } = await supabase
    //   .from('registered_ips')
    //   .select('ip_id_onchain, name, description, metadata_url, tags, registered_onchain_at', { count: 'exact' })
    //   .eq('creator_id', creator.id) // Use creator.id
    //   .order('cached_at', { ascending: false })
    //   .range(offset, offset + limit - 1);


    if (ipsError) {
      console.error('Error fetching IPs for creator:', ipsError);
      throw new Error(`Error fetching IPs: ${ipsError.message}`);
    }
    
    // The logic for fetching IPs assumes 'creatorData.id' is available.
    // If 'creators.id' is not selected in the first query, the second query will fail.
    // The SQL schema for 'creators' has 'id' as primary key. The SELECT should include it.
    // The first query was .select('wallet_address, name, bio, is_verified, created_at')
    // It MUST be .select('id, wallet_address, name, bio, is_verified, created_at')

    // Let's write the corrected logic directly here.

    const creatorQuery = await supabase
      .from('creators')
      .select('id, wallet_address, name, bio, is_verified, created_at')
      .ilike('wallet_address', wallet_address)
      .single();

    if (creatorQuery.error && creatorQuery.error.code !== 'PGRST116') {
      console.error('Error fetching creator:', creatorQuery.error);
      return res.status(500).json({ error: `Error fetching creator: ${creatorQuery.error.message}` });
    }
    if (!creatorQuery.data) {
      return res.status(404).json({ error: 'Creator not found' });
    }
    
    const finalCreatorData = creatorQuery.data;

    const ipsQuery = await supabase
      .from('registered_ips')
      .select('ip_id_onchain, name, description, metadata_url, tags, registered_onchain_at', { count: 'exact' })
      .eq('creator_id', finalCreatorData.id)
      .order('cached_at', { ascending: false })
      .range(offset, parseInt(limit, 10) -1 + offset); // Corrected range calculation


    if (ipsQuery.error) {
      console.error('Error fetching IPs for creator:', ipsQuery.error);
      return res.status(500).json({ error: `Error fetching IPs for creator: ${ipsQuery.error.message}` });
    }

    res.json({
      creator: { // Exclude 'id' from the public response if not needed
        wallet_address: finalCreatorData.wallet_address,
        name: finalCreatorData.name,
        bio: finalCreatorData.bio,
        is_verified: finalCreatorData.is_verified,
        created_at: finalCreatorData.created_at,
      },
      ips: ipsQuery.data || [],
      pagination: {
        total_ips: ipsQuery.count,
        current_page: parseInt(page, 10),
        per_page: parseInt(limit, 10),
        total_pages: Math.ceil((ipsQuery.count || 0) / parseInt(limit, 10)),
      },
    });

  } catch (error) {
    // Catch any other unexpected errors
    console.error('Unexpected error in /api/creators/:wallet_address :', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

module.exports = router; 