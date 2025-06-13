require('dotenv').config({ path: '../.env' }); // Ensure .env from backend root is loaded
const { ethers } = require('ethers');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const RPC_URL = process.env.RPC_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const CONTRACT_DEPLOYMENT_BLOCK_FALLBACK = 0; // Fallback if no sync status is found

// Paths to contract artifacts and sync status file
const contractArtifactsBasePath = path.join(__dirname, '..', 'src', 'generated');
const contractAddressPath = path.join(contractArtifactsBasePath, 'contract-address.json');
const abiPath = path.join(contractArtifactsBasePath, 'abi', 'CreatorRegistry.json');
const syncStatusFilePath = path.join(contractArtifactsBasePath, 'sync_status.json');
const eventKeyForSyncStatus = 'CreatorRegistry_IpRegistered_LastBlock';

// --- Helper Functions for Sync Status ---
function getLastProcessedBlock(filePath, key) {
    try {
        if (fs.existsSync(filePath)) {
            const statusFile = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return parseInt(statusFile[key], 10) || CONTRACT_DEPLOYMENT_BLOCK_FALLBACK;
        }
    } catch (e) {
        console.warn(`Warning: Could not read or parse sync status file at ${filePath}. Defaulting. Error: ${e.message}`);
    }
    return CONTRACT_DEPLOYMENT_BLOCK_FALLBACK;
}

function updateLastProcessedBlock(filePath, key, blockNumber) {
    let status = {};
    try {
        if (fs.existsSync(filePath)) {
            status = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (e) {
        console.warn(`Warning: Could not read or parse existing sync status file at ${filePath} for update. Will overwrite/create. Error: ${e.message}`);
    }
    status[key] = blockNumber;
    try {
        fs.writeFileSync(filePath, JSON.stringify(status, null, 2));
        console.log(`Updated last processed block for ${key} to ${blockNumber} in ${filePath}`);
    } catch (e) {
        console.error(`Error writing sync status to ${filePath}:`, e.message);
    }
}

async function main() {
    console.log('Starting data sync from CreatorRegistry contract to Supabase...');

    // 1. Validate configuration
    if (!RPC_URL || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error('Error: RPC_URL, SUPABASE_URL, and SUPABASE_SERVICE_KEY must be set in .env file in the backend directory.');
        process.exit(1);
    }

    let creatorRegistryAddress;
    try {
        if (!fs.existsSync(contractAddressPath)) {
            throw new Error(`contract-address.json not found at ${contractAddressPath}. Please deploy the CreatorRegistry contract first using 'npx hardhat run scripts/deploy_creator_registry.js --network your_network_name' from the 'web3' directory.`);
        }
        const addressFile = JSON.parse(fs.readFileSync(contractAddressPath, 'utf8'));
        creatorRegistryAddress = addressFile.creatorRegistryAddress;
        if (!creatorRegistryAddress) {
            throw new Error('creatorRegistryAddress not found in contract-address.json');
        }
        console.log(`Found CreatorRegistry address: ${creatorRegistryAddress}`);
    } catch (e) {
        console.error(`Error reading contract address:`, e.message);
        process.exit(1);
    }

    let creatorRegistryAbi;
    try {
        if (!fs.existsSync(abiPath)) {
            throw new Error(`CreatorRegistry.json (ABI) not found at ${abiPath}. Please ensure it was copied during deployment.`);
        }
        const abiFile = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        creatorRegistryAbi = abiFile.abi; // Assuming the ABI is under the .abi key, standard for Hardhat artifacts
        if (!creatorRegistryAbi) {
            throw new Error('ABI not found in CreatorRegistry.json, or not under the .abi key.');
        }
        console.log('CreatorRegistry ABI loaded.');
    } catch (e) {
        console.error(`Error reading ABI:`, e.message);
        process.exit(1);
    }

    // 2. Initialize Ethers Provider and Contract
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(creatorRegistryAddress, creatorRegistryAbi, provider);
    console.log('Connected to CreatorRegistry contract on CAMP Network.');

    // 3. Initialize Supabase Client (using Service Role Key)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    console.log('Supabase client initialized with service role.');

    // 4. Determine block range for event query
    const lastProcessedBlock = getLastProcessedBlock(syncStatusFilePath, eventKeyForSyncStatus);
    const fromBlock = lastProcessedBlock + 1;
    const currentBlock = await provider.getBlockNumber();

    if (fromBlock > currentBlock) {
        console.log(`No new blocks to process. Last processed block: ${lastProcessedBlock}, Current block: ${currentBlock}.`);
        return;
    }
    console.log(`Fetching IpRegistered events from block ${fromBlock} to ${currentBlock} (inclusive of currentBlock for queryFilter)...`);

    let events = [];
    try {
        // queryFilter's toBlock is inclusive.
        events = await contract.queryFilter(contract.filters.IpRegistered(), fromBlock, currentBlock);
        console.log(`Found ${events.length} new IpRegistered events.`);
    } catch (e) {
        console.error('Error fetching new events:', e.message);
        process.exit(1);
    }

    if (events.length === 0) {
        console.log('No new IpRegistered events found in the specified block range.');
        // Still update lastProcessedBlock to currentBlock to avoid re-querying empty ranges often if script runs frequently.
        updateLastProcessedBlock(syncStatusFilePath, eventKeyForSyncStatus, currentBlock);
        return;
    }

    // 5. Process events and upsert data into Supabase
    let newIpsProcessedCount = 0;
    let errorsEncountered = 0;
    let latestBlockInBatch = lastProcessedBlock; // Initialize with the previous last processed block

    for (const event of events) {
        try {
            const { creator, ipId, ipName, ipMetadataUrl, creationTimestamp } = event.args;
            const eventBlockNumber = event.blockNumber;
            
            // A. Upsert Creator
            const { data: creatorUpsertData, error: creatorError } = await supabase
                .from('creators')
                .upsert({
                    wallet_address: creator,
                    updated_at: new Date(), 
                }, {
                    onConflict: 'wallet_address',
                    ignoreDuplicates: false,
                })
                .select('id') 
                .single(); 

            if (creatorError) {
                console.error(`Error upserting creator ${creator} (event block ${eventBlockNumber}):`, creatorError.message);
                errorsEncountered++;
                continue; 
            }
            // Not incrementing creatorsUpsertedCount here as it could be an update or insert.
            // More complex logic needed if exact new vs updated count is required.

            const creatorInternalId = creatorUpsertData.id;

            // B. Upsert Registered IP
            const registeredOnChainDate = new Date(Number(creationTimestamp) * 1000);

            const { error: ipError } = await supabase
                .from('registered_ips')
                .upsert({
                    ip_id_onchain: ipId,
                    creator_id: creatorInternalId,
                    name: ipName,
                    metadata_url: ipMetadataUrl,
                    registered_onchain_at: registeredOnChainDate,
                    is_verified: false, // Default, can be updated by calling getIpDetails or admin process
                    cached_at: new Date(),
                    updated_at: new Date(),
                    // description and tags are not in the event, so they default to null or previous value if updating
                }, {
                    onConflict: 'ip_id_onchain',
                    ignoreDuplicates: false, 
                });

            if (ipError) {
                console.error(`Error upserting IP ${ipId} (event block ${eventBlockNumber}):`, ipError.message);
                errorsEncountered++;
                continue;
            }
            // ipsUpsertedCount++; // Same as creators, simplified count here
            console.log(`Processed IP: ${ipId} by Creator: ${creator} from block ${eventBlockNumber}`);
            newIpsProcessedCount++;
            if (eventBlockNumber > latestBlockInBatch) { // Keep track of the highest block number successfully processed in this run
                latestBlockInBatch = eventBlockNumber;
            }

        } catch (e) {
            console.error('Error processing event for IP ID (if available from event.args):', event.args ? event.args.ipId : 'N/A', 'Block:', event.blockNumber, e.message, e.stack);
            errorsEncountered++;
            // Decide if we should stop or continue. For now, continue and report errors.
        }
    }
    // A more accurate count would involve checking the status from the upsert operation if Supabase provides it.
    // For now, we just count successful processing loops post-DB operation attempts.
    // A simplistic way to count successful upserts (assumes if no error, it was an upsert)
    let creatorsUpsertedCount = events.length - errorsEncountered; // This is not entirely accurate for creators if one creator has many events
    let ipsUpsertedCount = events.length - errorsEncountered; // This is more accurate for IPs if each event is one IP


    console.log('--- Sync Summary ---');
    console.log(`Queried events from block ${fromBlock} to ${currentBlock}.`);
    console.log(`Total new IpRegistered events found: ${events.length}`);
    console.log(`Creators upserted/updated (approx): ${creatorsUpsertedCount}`);
    console.log(`IPs successfully processed (upserted/updated): ${ipsUpsertedCount}`);
    console.log(`Errors encountered during event processing: ${errorsEncountered}`);

    // 6. Update the last processed block number
    // Only update if there were events, and preferably if no errors, 
    // or update to the latest successfully processed block in the batch.
    if (events.length > 0 && newIpsProcessedCount > 0) { // Or a more robust check if partial success is okay
        // We update to latestBlockInBatch, which is the highest block number from which an event was successfully processed.
        // If all events in the queried range (up to currentBlock) were processed without error, latestBlockInBatch would be currentBlock (or highest event block).
        updateLastProcessedBlock(syncStatusFilePath, eventKeyForSyncStatus, latestBlockInBatch);
    } else if (events.length === 0 && fromBlock <= currentBlock) {
        // If no new events were found, but we did query a valid range, update to currentBlock.
        updateLastProcessedBlock(syncStatusFilePath, eventKeyForSyncStatus, currentBlock);
        console.log('No new events, last processed block updated to current network block.')
    }

    console.log('Periodic data sync finished.');
}

main().catch((error) => {
    console.error('Unhandled error in main sync function:', error.message, error.stack);
    process.exit(1);
}); 