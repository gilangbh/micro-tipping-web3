const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  const tippingTokenAddress = "0x0000000000000000000000000000000000000000"; 

  console.log(`Deploying Tipping contract with token address: ${tippingTokenAddress}`);

  // The getContractFactory path is relative to the 'contracts' folder defined in hardhat.config.js paths.sources
  const Tipping = await hre.ethers.getContractFactory("Tipping"); 
  // Or, if issues persist: const Tipping = await hre.ethers.getContractFactory("contracts/Tipping.sol:Tipping");
  
  const tippingContract = await Tipping.deploy(tippingTokenAddress);

  await tippingContract.waitForDeployment();

  const contractAddress = await tippingContract.getAddress();
  console.log("Tipping contract deployed to:", contractAddress);

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

  addresses.tippingContractAddress = contractAddress;

  fs.writeFileSync(addressFilePath, JSON.stringify(addresses, null, 2));
  console.log(`Tipping contract address saved to ${addressFilePath}`);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 