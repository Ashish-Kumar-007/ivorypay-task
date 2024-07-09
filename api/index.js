require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const INFURA_PROJECT_SECRET = process.env.INFURA_PROJECT_SECRET;

// Function to fetch account balance from Infura
async function getAccountBalance(address) {
    const url = `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`;
    const data = {
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1
    };
    
    const response = await axios.post(url, data, {
        auth: {
            username: INFURA_PROJECT_ID,
            password: INFURA_PROJECT_SECRET
        }
    });
    return parseInt(response.data.result, 16) / (10 ** 18); // Convert from Wei to Ether
}

// Function to fetch transaction history from Etherscan
async function getTransactionHistory(address) {
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
    
    const response = await axios.get(url);
    return response.data.result;
}

// Endpoint to fetch and calculate credit score elements
app.get('/fetch-data/:address', async (req, res) => {
    try {
        const address = req.params.address;

        // Fetch account balance
        const balance = await getAccountBalance(address);

        // Fetch transaction history
        const transactions = await getTransactionHistory(address);

        // Calculate transaction volume history and frequency of transactions
        let transactionVolume = 0;
        let transactionFrequency = transactions.length;
        let newTransactions = 0;
        let transactionMix = {};

        const currentTime = Date.now() / 1000; // Current time in seconds
        const thirtyDaysAgo = currentTime - (30 * 24 * 60 * 60); // 30 days in seconds

        transactions.forEach(tx => {
            transactionVolume += parseInt(tx.value, 10) / (10 ** 18); // Convert from Wei to Ether
            
            if (tx.timeStamp > thirtyDaysAgo) {
                newTransactions += 1;
            }

            if (!transactionMix[tx.to]) {
                transactionMix[tx.to] = 0;
            }
            transactionMix[tx.to] += 1;
        });

        res.json({
            address: address,
            balance: balance,
            transactionVolume: transactionVolume,
            transactionFrequency: transactionFrequency,
            newTransactions: newTransactions,
            transactionMix: transactionMix
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
