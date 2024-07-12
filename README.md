# CreditScore Smart Contract and API Guide

## Overview

The `CreditScore` smart contract calculates and updates credit scores based on user metrics such as transaction volume, wallet balance, frequency, transaction mix, and pursuit of new transactions.

## Contract Details

- **Precision Factor**: `PRECISION = 1e18` for 18 decimal places.
- **Owner**: Deployer of the contract is set as the owner with privileged access.
- **Modifiers**:
  - `onlyAuthorized`: Restricts certain functions to be callable only by the owner.
  - `onlyAfter(uint lastUpdated)`: Ensures functions can only execute after a specified time interval (21 days).

## Structs and Mapping

- **User Struct**: Stores user-specific data including:
  - `lastUpdateTimestamp`
  - `transactionVolume`
  - `walletBalance`
  - `transactionFrequency`
  - `transactionMix`
  - `pursuitOfNewTransactions`
  - `creditScore`
- **Mapping**: `mapping(address => User) private users` maps user addresses to their respective `User` struct instances.

## Constants and Weights

- **Constants**: Weightings (`transactionVolumeWeight`, `walletBalanceWeight`, etc.) determine each metric's contribution to the credit score.

## Functions

### `constructor()`

- Initializes the contract and sets the deployer (`msg.sender`) as the owner.

### `updateUserDetails(...)`

- Updates user metrics and triggers credit score recalculation.
- **Modifiers**: `onlyAuthorized`, `onlyAfter(users[user].lastUpdateTimestamp)`.

### `getCreditScore(...)`

- Retrieves the current credit score of a specified user.

### `updateCreditScore(...)`

- Calculates and normalizes the credit score based on weighted metrics.

## Usage

### Deployed Contract

- **Contract Address**: [0x7d367d8563F7bef5e3B7DD9fc1df84A237Da96f1](https://sepolia.etherscan.io/address/0x7d367d8563F7bef5e3B7DD9fc1df84A237Da96f1)

## API Guide

### Introduction

This API interacts with the `CreditScore` smart contract deployed on the Ethereum Sepolia blockchain. It includes endpoints to fetch user data and update details based on transaction history and account balance.

### Base URL

```
https://onchain-creditscore.vercel.app/
```

### Authentication

No authentication is required for fetching data. Updating user details requires a valid Ethereum private key associated with the owner.

### Endpoints

#### `GET /get-credit-score/:address`

- **Description**: Fetches account balance, transaction history, calculates metrics, and updates the credit score.
- **Parameters**: `address` (Ethereum address of the user).
- **Returns**: JSON object with user data including `address`, `balance`, `transactionVolume`, `transactionFrequency`, `newTransactions`, `transactionMix`, and `creditScore`.

#### Errors

- **400 Bad Request**: If user details are updated more frequently than allowed (every 21 days).
- **500 Internal Server Error**: For issues with fetching data or updating the blockchain.

### Example

```javascript
const fetchUserData = async (address) => {
  try {
    const response = await fetch(`https://onchain-creditscore.vercel.app/get-credit-score/${address}`);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

fetchUserData('0x...');
```

Replace `your-api-base-url` with your actual API base URL.

### Technologies Used

- **Node.js**, **Express**: Backend environment and web framework.
- **Ethers.js**: Library for Ethereum interactions.
- **@tatumio/tatum**: SDK for blockchain integration.
- **dotenv**: Environment variable management.
- **JSON-RPC Provider**: Connects to an Ethereum node.
- **Solidity**: Language for smart contract development.

## Running Locally

### Prerequisites

1. **Node.js**: Ensure Node.js is installed on your machine. Download from [nodejs.org](https://nodejs.org/).

2. **Ethereum RPC URL**: Obtain an Ethereum RPC URL (e.g., Ganache local node).

3. **Environment Variables**: Set up a `.env` file with:
   ```
   RPC_URL=<your-ethereum-rpc-url>
   PRIVATE_KEY=<your-private-key>
   PORT=3000
   ```

4. **Install Dependencies**: Run `npm install`.

5. **Start Server**: Execute `npm start`.

6. **Interact with API**: Use endpoints like `GET http://localhost:3000/get-credit-score/:address`.

7. **Test**: Verify API functionality with tools like `curl` or Postman.

### Notes
- As it's a demo api so it uses free resources which will limit the fetching the transaction lists of an wallet address
- Ensure Ethereum node accessibility via the RPC URL.
- Securely manage private keys and environment variables.
- Customize error handling and logging for production readiness.