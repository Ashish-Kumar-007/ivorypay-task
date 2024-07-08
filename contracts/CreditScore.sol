// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CreditScore {

    struct UserCredit {
        uint256 transactionVolume;
        uint256 walletBalance;
        uint256 transactionFrequency;
        uint256 transactionMix;
        uint256 newTransactions;
        uint256 creditScore;
    }

    mapping(address => UserCredit) private userCredits;

    function updateTransactionVolume(address user, uint256 volume) external {
        userCredits[user].transactionVolume = volume;
        _updateCreditScore(user);
    }

    function updateWalletBalance(address user, uint256 balance) external {
        userCredits[user].walletBalance = balance;
        _updateCreditScore(user);
    }

    function updateTransactionFrequency(address user, uint256 frequency) external {
        userCredits[user].transactionFrequency = frequency;
        _updateCreditScore(user);
    }

    function updateTransactionMix(address user, uint256 mix) external {
        userCredits[user].transactionMix = mix;
        _updateCreditScore(user);
    }

    function updateNewTransactions(address user, uint256 newTx) external {
        userCredits[user].newTransactions = newTx;
        _updateCreditScore(user);
    }

    function getCreditScore(address user) external view returns (uint256) {
        return userCredits[user].creditScore;
    }

    function _updateCreditScore(address user) internal {
        UserCredit storage credit = userCredits[user];
        credit.creditScore = _calculateCreditScore(
            credit.transactionVolume,
            credit.walletBalance,
            credit.transactionFrequency,
            credit.transactionMix,
            credit.newTransactions
        );
    }

    function _calculateCreditScore(
        uint256 volume,
        uint256 balance,
        uint256 frequency,
        uint256 mix,
        uint256 newTx
    ) internal pure returns (uint256) {
        uint256 score = 300 + (
            (volume * 35 / 100) +
            (balance * 30 / 100) +
            (frequency * 15 / 100) +
            (mix * 10 / 100) +
            (newTx * 10 / 100)
        );
        return score > 850 ? 850 : score;
    }
}
