require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { ethers } = require("ethers");
const contractDetails = require("../artifacts/contracts/CreditScore.sol/CreditScore.json");
const {EvmChain} = require('moralis');
const { TatumSDK, Network } = require("@tatumio/tatum");

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
const getTransactionHistory = async (address) => {
  try {
    const tatum = await TatumSDK.init({ 
      network: Network.ETHEREUM_SEPOLIA,
      apiKey: {
        v4: "t-6691211cc8571e001cb45348-668b135606d94c7ab6a20c22"
      }
     });
     let data = [];
     let txs;
     let offSet = 0;
     const pageSize = 50;
     
     do {
       txs = await tatum.address.getTransactions({
         address: address,
         pageSize: pageSize,
         offset: offSet
       });
       offSet += pageSize;
       data = data.concat(txs.data);
       if(offSet > 2000){
        break;
       }
     } while (txs.data.length == pageSize);
     
     console.log(data.length);
     return data;
     
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
  }
}
  
function calculateMetrics(transactions) {
  let transactionFrequency = 0;
  let transactionVolume = 0;
  let newTransactions = 0;
  let transactionTypes = new Set(); // Use a Set to store unique transaction types
  
  const thirtyDaysAgo = (Date.now() - (30 * 24 * 60 * 60 * 1000)) / 1000; // Calculate the timestamp for 30 days ago
  
  transactions.forEach((tx) => {
    transactionFrequency++;
  
    // Calculate transaction volume
    if(tx.transactionType == "native"){
     transactionVolume += parseFloat(tx.amount); 
    }
  
    // Check for new transactions in the last 30 days
    const txTimestamp = new Date(tx.block_timestamp).getTime() / 1000;
    if (txTimestamp > thirtyDaysAgo) {
      newTransactions++;
    }
  
    // Collect unique transaction types
    transactionTypes.add(tx.transactionType);
  });
  
  // Convert the Set back to an array if needed
  const uniqueTransactionTypes = Array.from(transactionTypes);
  
  console.log(`Transaction Frequency: ${transactionFrequency}`);
  console.log(`Transaction Volume: ${transactionVolume}`);
  console.log(`New Transactions in Last 30 Days: ${newTransactions}`);
  console.log(`Unique Transaction Types: ${uniqueTransactionTypes}`, transactionTypes.size);
  const transactionMix = transactionTypes.size;
  return {
    transactionVolume,
    transactionFrequency,
    transactionMix,
    newTransactions
  };
}

// Endpoint to fetch and calculate credit score elements
app.get("/fetch-data/:address", async (req, res) => {
  try {
    const address = req.params.address;

    // Fetch account balance
    const balance = await getBalance(address);

    // Fetch transaction history
    const transactions = await getTransactionHistory(address);
    
const {transactionVolume,
  transactionFrequency,
  transactionMix,
  newTransactions} = calculateMetrics(transactions);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(contractAddress, contractDetails.abi, provider);


    // // Update credit score on the blockchain
    await contract.connect(wallet).updateUserDetails(address, ethers.utils.parseUnits(transactionVolume.toString(), 'ether'), ethers.utils.parseUnits(balance.toString(), 'ether'), transactionFrequency, transactionMix, newTransactions);

    // // Retrieve updated credit score
    const creditScore = await contract.getCreditScore(address);
console.log(transactionMix)
    res.json({
      address: address,
      balance: balance,
      transactionVolume: transactionVolume.toFixed(2), // Adjust formatting as needed
      transactionFrequency: transactionFrequency,
      newTransactions: newTransactions,
      transactionMix: transactionMix,
      creditScore: `${creditScore}` // Ensure it's converted to string
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