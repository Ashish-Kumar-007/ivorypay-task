// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CreditScore {
    // Private state variables for percentage weights
    uint256 private transactionVolumePercent;
    uint256 private walletBalancePercent;
    uint256 private transactionFrequencyPercent;
    uint256 private transactionMixPercent;
    uint256 private newTransactionsPercent;

    // Structure to store user credit data
    struct UserCredit {
        uint256 transactionVolume;
        uint256 walletBalance;
        uint256 transactionFrequency;
        uint256 transactionMix;
        uint256 newTransactions;
        uint256 creditScore;
    }

    // Mapping from user address to their credit data
    mapping(address => UserCredit) private userCredits;

    // Constructor to initialize the percentage weights
    constructor(
        uint256 _transactionVolumePercent,
        uint256 _walletBalancePercent,
        uint256 _transactionFrequencyPercent,
        uint256 _transactionMixPercent,
        uint256 _newTransactionsPercent
    ) {
        require(
            _transactionVolumePercent + _walletBalancePercent + _transactionFrequencyPercent + _transactionMixPercent + _newTransactionsPercent == 100,
            "Total percentage must be 100"
        );
        transactionVolumePercent = _transactionVolumePercent;
        walletBalancePercent = _walletBalancePercent;
        transactionFrequencyPercent = _transactionFrequencyPercent;
        transactionMixPercent = _transactionMixPercent;
        newTransactionsPercent = _newTransactionsPercent;
    }

    // Function to get the credit score of the user calling the function
    function getCreditScore() external view returns (uint256) {
        UserCredit storage credit = userCredits[msg.sender];
        return credit.creditScore;
    }

    // Function to update the user's credit data and calculate the new credit score
    function updateCreditScore(
        uint256 volume,
        uint256 balance,
        uint256 frequency,
        uint256 mix,
        uint256 newTx
    ) external {
        UserCredit storage credit = userCredits[msg.sender];
        credit.transactionVolume = volume;
        credit.walletBalance = balance;
        credit.transactionFrequency = frequency;
        credit.transactionMix = mix;
        credit.newTransactions = newTx;
        credit.creditScore = _calculateCreditScore(volume, balance, frequency, mix, newTx);
    }

    // Internal function to calculate the credit score based on the given parameters
    function _calculateCreditScore(
        uint256 volume,
        uint256 balance,
        uint256 frequency,
        uint256 mix,
        uint256 newTx
    ) internal view returns (uint256) {
        uint256 score = 300 + (
            (volume * transactionVolumePercent / 100) +
            (balance * walletBalancePercent / 100) +
            (frequency * transactionFrequencyPercent / 100) +
            (mix * transactionMixPercent / 100) +
            (newTx * newTransactionsPercent / 100)
        );
        return score > 850 ? 850 : score;
    }

}