// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CreditScore
 * @author Ashish Kumar Sahoo
 * @dev Smart contract for calculating credit scores based on user transaction data.
 */
 
contract CreditScore {

    struct User {
        uint256 transactionVolume;
        uint256 walletBalance;
        uint256 transactionFrequency;
        uint256 transactionMix;
        uint256 pursuitOfNewTransactions;
        uint256 creditScore;
    }

    mapping(address => User) public users;
    address owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyAuthorized() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    uint256 volumeWeight = 35;
    uint256 balanceWeight = 30;
    uint256 frequencyWeight = 15;
    uint256 mixWeight = 10;
    uint256 pursuitWeight = 10;

    uint256 constant MAX_TRANSACTION_VOLUME = 100 ether; // 1000 ETH
    uint256 constant MAX_WALLET_BALANCE = 50 ether; // 500 ETH
    uint256 constant MAX_TRANSACTION_FREQUENCY = 100; // 100 transactions per month
    uint256 constant MAX_TRANSACTION_MIX = 10; // 10 different types
    uint256 constant MAX_PURSUIT_OF_NEW_TRANSACTIONS = 50; // 50 unique addresses

    /**
    * Updates the transaction volume for a specific user.
    * 
    * @param user The address of the user whose transaction volume is being updated.
    * @param volume The new transaction volume to set for the user.
    */
    function updateTransactionVolume(address user, uint256 volume) external onlyAuthorized {
        users[user].transactionVolume = volume;
        calculateCreditScore(user);
    }

    /**
    * Updates the wallet balance for a specific user.
    * 
    * @param user The address of the user whose wallet balance is being updated.
    * @param balance The new wallet balance to set for the user.
    */
    function updateWalletBalance(address user, uint256 balance) external onlyAuthorized {
        users[user].walletBalance = balance;
        calculateCreditScore(user);
    }

    /**
    * Updates the transaction frequency for a specific user.
    * 
    * @param user The address of the user whose transaction frequency is being updated.
    * @param frequency The new transaction frequency to set for the user.
    */
    function updateTransactionFrequency(
        address user,
        uint256 frequency
    ) external onlyAuthorized {
        users[user].transactionFrequency = frequency;
        calculateCreditScore(user);
    }

    /**
    * Updates the transaction mix for a specific user.
    * 
    * @param user The address of the user whose transaction mix is being updated.
    * @param mix The new transaction mix value to set for the user.
    */
    function updateTransactionMix(address user, uint256 mix) external onlyAuthorized {
        users[user].transactionMix = mix;
        calculateCreditScore(user);
    }

    /**
    * Updates the pursuit of new transactions for a specific user.
    * 
    * @param user The address of the user whose pursuit is being updated.
    * @param pursuit The new pursuit value to set for the user.
    */
    function updatePursuitOfNewTransactions(
        address user,
        uint256 pursuit
    ) external onlyAuthorized {
        users[user].pursuitOfNewTransactions = pursuit;
        calculateCreditScore(user);
    }

    /**
    * Calculates the credit score for a user based on their transaction volume, wallet balance, transaction frequency,
    * transaction mix, and pursuit of new transactions. The credit score is calculated using weighted averages and
    * normalized values, ensuring a final score between 300 and 850.
    */
    function calculateCreditScore(address user) internal {
        uint256 normalizedVolume = normalize(
            users[user].transactionVolume,
            MAX_TRANSACTION_VOLUME
        );
        uint256 normalizedBalance = normalize(
            users[user].walletBalance,
            MAX_WALLET_BALANCE
        );
        uint256 normalizedFrequency = normalize(
            users[user].transactionFrequency,
            MAX_TRANSACTION_FREQUENCY
        );
        uint256 normalizedMix = normalize(
            users[user].transactionMix,
            MAX_TRANSACTION_MIX
        );
        uint256 normalizedPursuit = normalize(
            users[user].pursuitOfNewTransactions,
            MAX_PURSUIT_OF_NEW_TRANSACTIONS
        );

        uint256 weightedVolume = normalizedVolume * volumeWeight;
        uint256 weightedBalance = normalizedBalance * balanceWeight;
        uint256 weightedFrequency = normalizedFrequency * frequencyWeight;
        uint256 weightedMix = normalizedMix * mixWeight;
        uint256 weightedPursuit = normalizedPursuit * pursuitWeight;

        uint256 totalScore = weightedVolume +
            weightedBalance +
            weightedFrequency +
            weightedMix +
            weightedPursuit;
        uint256 normalizedTotalScore = 300 + (totalScore / 100);

        users[user].creditScore = normalizedTotalScore > 850
            ? 850
            : normalizedTotalScore;
    }

    /**
    * @dev Normalizes a given value based on a maximum value.
    * @param value The value to be normalized.
    * @param max The maximum value for normalization.
    * @return The normalized value as a percentage of the maximum value.
    */
    function normalize(
        uint256 value,
        uint256 max
    ) internal pure returns (uint256) {
        return (value * 100) / max;
    }

    /**
    * @dev Returns the credit score of a specific user.
    * @param user The address of the user whose credit score is being retrieved.
    * @return The credit score of the user.
    */
    function getUserCreditScore(address user) external view returns (uint256) {
        return users[user].creditScore;
    }
}
