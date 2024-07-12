require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { ethers } = require("ethers");
const contractDetails = require("../artifacts/contracts/CreditScore.sol/CreditScore.json");

const app = express();
const PORT = process.env.PORT || 3000;

const URL = process.env.RPC_URL;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const provider = new ethers.providers.JsonRpcProvider(URL); // Use ethers provider
const contractAddress = process.env.CONTRACT_ADDRESS;

app.use(express.json());

// Function to fetch the balance of the address
const getBalance = async (address) => {
  const balance = await provider.getBalance(address);
  return `${balance}`;
}

// Function to fetch the transaction list of the address

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
