// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CreditScore {
    // Define a precision factor (10^18 for 18 decimal places)
    uint256 public constant PRECISION = 1e18;

    struct User {
        uint lastUpdateTimestamp;
        uint transactionVolume;
        uint walletBalance;
        uint transactionFrequency;
        uint transactionMix;
        uint pursuitOfNewTransactions;
        uint creditScore;
    }

    mapping(address => User) private users;
    address owner;

    // Define weightings
    uint constant transactionVolumeWeight = 35;
    uint constant walletBalanceWeight = 30;
    uint constant transactionFrequencyWeight = 15;
    uint constant transactionMixWeight = 10;
    uint constant pursuitOfNewTransactionsWeight = 10;

    // Only allow authorized updaters to update user data
    modifier onlyAuthorized() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

        // Restrict updating user details to every 21 days
    modifier onlyAfter(uint lastUpdated) {
        require(block.timestamp >= lastUpdated + 21 days, "Can only update after 21 days");
        _;
    }

    constructor() {
        // Add contract deployer as an authorized updater
        owner = msg.sender;
    }

    function updateUserDetails(address user, uint volume, uint balance, uint frequency, uint mix, uint newTxs) public onlyAuthorized onlyAfter(users[user].lastUpdateTimestamp) {
        
        require(user != address(0), "Invalid address");

        User storage u = users[user];
        u.transactionVolume = (volume * 1e3 / PRECISION) / 1e3;
        u.walletBalance = (balance * 1e3 / PRECISION) / 1e3;
        u.transactionFrequency = frequency;
        u.transactionMix = mix;
        u.pursuitOfNewTransactions = newTxs;
        u.lastUpdateTimestamp = block.timestamp;
        updateCreditScore(user);
    }

    function getCreditScore(address user) public view returns (uint) {
        return users[user].creditScore;
    }

    function updateCreditScore(address user) internal {
        require(address(0) != user, "Invalid address");
        User storage u = users[user];

        uint weightedTransactionVolume = u.transactionVolume * transactionVolumeWeight;
        uint weightedWalletBalance = u.walletBalance * walletBalanceWeight;
        uint weightedTransactionFrequency = u.transactionFrequency * transactionFrequencyWeight;
        uint weightedTransactionMix = u.transactionMix * transactionMixWeight;
        uint weightedPursuitOfNewTransactions = u.pursuitOfNewTransactions * pursuitOfNewTransactionsWeight;

        uint totalScore = weightedTransactionVolume + weightedWalletBalance + weightedTransactionFrequency +
                          weightedTransactionMix + weightedPursuitOfNewTransactions;

        uint normalizedTotalScore = 300 + (totalScore / 100); // Normalize to a range of 300-850

        if (normalizedTotalScore > 850) {
            normalizedTotalScore = 850;
        }

        u.creditScore = normalizedTotalScore;
    }
}