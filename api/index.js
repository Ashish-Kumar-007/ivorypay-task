require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");
const { TatumSDK, Network } = require("@tatumio/tatum");
const contractDetails = require("./Contract/contract.json");

const app = express();
const PORT = process.env.PORT || 3000;

const URL = process.env.RPC_URL;
const provider = new ethers.providers.JsonRpcProvider(URL); // Initialize ethers provider
const contractAddress = process.env.CONTRACT_ADDRESS; // Ethereum smart contract address

app.use(express.json());

// Function to fetch the balance of an Ethereum address
const getBalance = async (address) => {
  try {
    const balance = await provider.getBalance(address);
    return `${balance}`;
  } catch (error) {
    console.error("Error fetching wallet balance:", error.message);
    throw error; // Propagate the error
  }
};

// Function to fetch transaction history using Tatum SDK
const getTransactionHistory = async (address) => {
  try {
    const tatum = await TatumSDK.init({
      network: Network.ETHEREUM_SEPOLIA,
      apiKey: {
        v4: process.env.TATUM_API_KEY,
      },
    });

    const pageSize = 50;
    let data = [];
    let offset = 0;
    let txs;

    do {
      txs = await tatum.address.getTransactions({
        address: address,
        pageSize: pageSize,
        offset: offset,
      });

      data = data.concat(txs.data);
      offset += pageSize;

      // Limit the number of transactions fetched for optimization
      if (offset > 2000) {
        break;
      }
    } while (txs.length === pageSize);

    console.log(`Fetched ${data.length} transactions for ${address}`);
    return data;
  } catch (error) {
    console.error("Error fetching transaction history:", error.message);
    throw error; // Propagate the error
  }
};

// Function to calculate metrics from transaction history
function calculateMetrics(transactions) {
  let transactionFrequency = 0;
  let transactionVolume = 0;
  let newTransactions = 0;
  let transactionTypes = new Set();

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  transactions.forEach((tx) => {
    transactionFrequency++;

    if (tx.transactionType === "native") {
      transactionVolume += parseFloat(tx.amount);
    }

    const txTimestamp = new Date(tx.timestamp).getTime();
    if (txTimestamp > thirtyDaysAgo) {
      newTransactions++;
    }

    transactionTypes.add(tx.transactionType);
  });

  const transactionMix = transactionTypes.size;

  console.log(`Transaction Frequency: ${transactionFrequency}`);
  console.log(`Transaction Volume: ${transactionVolume}`);
  console.log(`New Transactions in Last 30 Days: ${newTransactions}`);
  console.log(`Unique Transaction Types: ${Array.from(transactionTypes)}`);

  return {
    transactionVolume,
    transactionFrequency,
    transactionMix,
    newTransactions,
  };
}

// Endpoint to fetch and calculate credit score elements
app.get("/get-credit-score/:address", async (req, res) => {
  const address = req.params.address;
  const contract = new ethers.Contract(
    contractAddress,
    contractDetails.abi,
    provider
  );

  try {
    // Fetch account balance
    const balance = await getBalance(address);

    // Fetch transaction history
    const transactions = await getTransactionHistory(address);

    // Calculate metrics from transactions
    const {
      transactionVolume,
      transactionFrequency,
      transactionMix,
      newTransactions,
    } = calculateMetrics(transactions);

    // Initialize ethers.Wallet instance
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Convert transaction volume to Wei
    const transactionVolumeInWei = ethers.utils.parseEther(
      transactionVolume.toString()
    );

    // Send transaction to update user details on the blockchain
    const tx = await contract
      .connect(wallet)
      .updateUserDetails(
        address,
        transactionVolumeInWei,
        balance,
        transactionFrequency,
        transactionMix,
        newTransactions
      );

    // Wait for the transaction to be mined and confirmed
    await tx.wait();

    // Retrieve updated credit score
    const creditScore = await contract.getCreditScore(address);

    // Respond with JSON data
    const responseData = {
      address: address,
      balance: `${ethers.utils.formatEther(balance.toString())} ETH`,
      transactionVolume: `${transactionVolume.toFixed(2)} ETH`,
      transactionFrequency: transactionFrequency,
      newTransactions: newTransactions,
      transactionMix: transactionMix,
      creditScore: `${creditScore}`,
    };

    res.json(responseData);
  } catch (error) {
    if (error.message.includes("Can only update after 21 days")) {
       // Retrieve updated credit score
    const creditScore = await contract.getCreditScore(address);
      console.log("User can only update after 21 days.");
      res.status(400).json({
        "current credit Score": `${creditScore}`,
        error: "Can only update after 21 days",
      });
    } else {
      console.error("Internal Server Error:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
