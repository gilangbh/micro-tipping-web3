const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// --- Helper Functions (copied from deploy_creator_registry.js for consistency) ---
// Helper function to ensure a directory exists
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Helper function to update and save contract addresses to a JSON file
function updateContractAddresses(filePath, contractKey, newAddress) {
  let addresses = {};
  if (fs.existsSync(filePath)) {
    try {
      addresses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.warn(`Could not parse existing address file at ${filePath}. It will be overwritten. Error: ${e.message}`);
      addresses = {}; // Reset if parsing fails
    }
  }
  addresses[contractKey] = newAddress;
  fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));
  console.log(`Saved/Updated ${contractKey} to ${newAddress} in ${filePath}`);
}

// Helper function to copy ABI file
function copyAbiFile(sourcePath, destPath) {
  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ABI from ${sourcePath} to ${destPath}`);
    } else {
      console.error(`Source ABI file not found at ${sourcePath}. Cannot copy.`);
    }
  } catch (e) {
    console.error(`Error copying ABI from ${sourcePath} to ${destPath}: ${e.message}`);
  }
}
// --- End of Helper Functions ---

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying Tipping contract with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // For Tipping.sol, constructor argument is _tokenAddress.
  // Defaulting to address(0) for native currency tipping.
  const tippingTokenAddress = "0x0000000000000000000000000000000000000000"; 
  console.log(`Deploying Tipping contract with token address (0x0 for native): ${tippingTokenAddress}`);

  const Tipping = await hre.ethers.getContractFactory("Tipping");
  const tippingContract = await Tipping.deploy(tippingTokenAddress);
  await tippingContract.waitForDeployment();
  const contractAddress = await tippingContract.getAddress();

  console.log("Tipping contract deployed to:", contractAddress);

  // --- Define paths and names ---
  const contractKeyName = 'tippingAddress'; // Key for Tipping contract in JSON address files
  const abiFileName = 'Tipping.json';      // Name of the Tipping ABI file

  // Frontend paths
  const frontendGeneratedDataPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'generated');
  const frontendAddressFilePath = path.join(frontendGeneratedDataPath, 'contract-address.json');
  const frontendAbiDir = path.join(frontendGeneratedDataPath, 'abi'); // New ABI directory path
  const frontendAbiFilePath = path.join(frontendAbiDir, abiFileName);    // New ABI file path

  // Backend paths
  const backendGeneratedDataPath = path.join(__dirname, '..', '..', 'backend', 'src', 'generated');
  const backendAddressFilePath = path.join(backendGeneratedDataPath, 'contract-address.json');
  const backendAbiDir = path.join(backendGeneratedDataPath, 'abi');   // New ABI directory path
  const backendAbiFilePath = path.join(backendAbiDir, abiFileName);      // New ABI file path
  
  // Source ABI path from Hardhat artifacts
  // Adjust contract name in path if Tipping.sol is in a subdirectory within contracts/
  const sourceAbiPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'Tipping.sol', abiFileName);

  // --- Save artifacts for Frontend ---
  ensureDirExists(frontendGeneratedDataPath);
  updateContractAddresses(frontendAddressFilePath, contractKeyName, contractAddress);
  ensureDirExists(frontendAbiDir); // Ensures .../generated/abi/ exists
  copyAbiFile(sourceAbiPath, frontendAbiFilePath);

  // --- Save artifacts for Backend ---
  ensureDirExists(backendGeneratedDataPath);
  updateContractAddresses(backendAddressFilePath, contractKeyName, contractAddress);
  ensureDirExists(backendAbiDir); // Ensures .../generated/abi/ exists
  copyAbiFile(sourceAbiPath, backendAbiFilePath);

  console.log("Tipping contract deployment and artifact saving complete.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 