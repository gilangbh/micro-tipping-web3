const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying CreatorRegistry contract with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  const CreatorRegistry = await hre.ethers.getContractFactory("CreatorRegistry");
  const creatorRegistryContract = await CreatorRegistry.deploy();

  await creatorRegistryContract.waitForDeployment();

  const contractAddress = await creatorRegistryContract.getAddress();
  console.log("CreatorRegistry contract deployed to:", contractAddress);

  // Save the contract address to a file in the frontend directory
  const frontendDataPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'generated');
  const addressFilePath = path.join(frontendDataPath, 'contract-address.json');

  if (!fs.existsSync(frontendDataPath)){
    fs.mkdirSync(frontendDataPath, { recursive: true });
  }

  let addresses = {};
  if (fs.existsSync(addressFilePath)) {
    try {
      addresses = JSON.parse(fs.readFileSync(addressFilePath, 'utf8'));
    } catch (e) {
      console.warn("Could not parse existing contract-address.json, will overwrite:", e);
      addresses = {}; // Reset if parsing fails
    }
  }

  addresses.creatorRegistryAddress = contractAddress; // Using a specific key for this contract

  fs.writeFileSync(addressFilePath, JSON.stringify(addresses, null, 2));
  console.log(`CreatorRegistry contract address saved to ${addressFilePath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 