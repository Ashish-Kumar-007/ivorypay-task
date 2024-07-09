require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { Web3 } = require("web3");

const app = express();
const PORT = process.env.PORT || 3000;

const URL = process.env.RPC_URL;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

// Initialize web3 with Infura provider
const web3 = new Web3(URL);

// Middleware to parse JSON
app.use(express.json());

// Function to fetch account balance using web3.js
async function getAccountBalance(address) {
  const balance = await web3.eth.getBalance(address);
  return web3.utils.fromWei(balance, "ether"); // Convert from Wei to Ether
}

// Function to fetch transaction history from Etherscan
async function getTransactionHistory(address) {
  const url = `https://api-holesky.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&sort=asc&apikey=${ETHERSCAN_API_KEY}`;

  const response = await web3.eth.getTransaction(address);
  console.log(response.data);
  return response.data.result;
}

// Endpoint to fetch and calculate credit score elements
app.get("/fetch-data/:address", async (req, res) => {
  try {
    const address = req.params.address;

    // Fetch account balance
    const balance = await getAccountBalance(address);

    // Fetch transaction history
    const transactions = await getTransactionHistory(address);
    console.log(transactions.length)
    // Calculate transaction volume history and frequency of transactions
    let transactionVolume = 0;
    let transactionFrequency = transactions.length;
    let newTransactions = 0;
    let transactionMix = transactions.length;

    const currentTime = Date.now() / 1000; // Current time in seconds
    const thirtyDaysAgo = currentTime - 30 * 24 * 60 * 60; // 30 days in seconds

    transactions.forEach((tx) => {
      transactionVolume += parseInt(tx.value, 10) / 10 ** 18; // Convert from Wei to Ether

      if (tx.timeStamp > thirtyDaysAgo) {
        newTransactions += 1;
      }

      
    });

    res.json({
      address: address,
      balance: balance,
      transactionVolume: transactionVolume,
      transactionFrequency: transactionFrequency,
      newTransactions: newTransactions,
      transactionMix: transactionMix,
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
