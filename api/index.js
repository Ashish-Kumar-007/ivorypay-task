require("dotenv").config();
const express = require("express");
const { Alchemy, Network } = require("alchemy-sdk");
const axios = require("axios");
const { ethers } = require("ethers");
const contractDetails = require("../artifacts/contracts/CreditScore.sol/CreditScore.json");

const app = express();
const PORT = process.env.PORT || 3000;

const URL = process.env.RPC_URL;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const provider = new ethers.providers.JsonRpcProvider(URL); // Use ethers provider
const contractAddress = process.env.CONTRACT_ADDRESS;

// Initialize Alchemy SDK
// const settings = {
//   apiKey: ALCHEMY_API_KEY,
//   network: Network.ETH_MAINNET, // Adjust network if necessary
// };
// const alchemy = new Alchemy(settings);

// Middleware to parse JSON
app.use(express.json());

// Function to fetch account balance using ethers
async function getAccountBalance(address) {
  const balance = await provider.getBalance(address);
  return `${balance}`; // Convert from Wei to Ether
}

// Function to fetch transaction history using Alchemy SDK
async function getTransactionHistory(address) {
  const url = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
  const vol = await provider.getTransactionHistory(address);
  console.log(vol)
  const response = await axios.get(url);
  // console.log(response.data);
  return response.data.result;
}

// Endpoint to fetch and calculate credit score elements
app.get("/fetch-data/:address", async (req, res) => {
  try {
    const address = req.params.address;

    // Get signer (user wallet) using provider
    const signer = provider.getSigner(address);

    // Fetch account balance
    const balance = await getAccountBalance(address);

    // Fetch transaction history
    const transactions = await getTransactionHistory(address);

    // Calculate transaction volume history and frequency of transactions
    let transactionVolume = 0;
    let transactionFrequency = transactions.length;
    let newTransactions = 0;
    let transactionMix = transactions.length;

    const currentTime = Date.now() / 1000; // Current time in seconds
    const thirtyDaysAgo = currentTime - 30 * 24 * 60 * 60; // 30 days in seconds

    transactions.forEach((tx) => {
      const valueInEther = ethers.utils.formatEther(tx.value); // Convert Wei to Ether
  transactionVolume += parseInt(tx.value);

      if (tx.blockTimestamp > thirtyDaysAgo) {
        newTransactions += 1;
      }
    });

    // Connect to the contract using ethers
    const contract = new ethers.Contract(contractAddress, contractDetails.abi, provider);

    // Update credit score on the blockchain
    // await contract.connect(signer).updateCreditScore(ethers.utils.parseEther(transactionVolume.toString()), balance, transactionFrequency, transactionMix, newTransactions);

    // Retrieve updated credit score
    const creditScore = await contract.getCreditScore();

    res.json({
      address: address,
      balance: balance,
      transactionVolume: transactionVolume, // Adjust formatting as needed
      transactionFrequency: transactionFrequency,
      newTransactions: newTransactions,
      transactionMix: transactionMix,
      creditScore: creditScore.toString(), // Ensure it's converted to string
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
