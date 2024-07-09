const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CreditScore", function () {
  it("Should deploy with valid percentage weights", async function () {
    const validWeights = [20, 20, 20, 20, 20];
    const creditScore = await (
      await ethers.getContractFactory("CreditScore")
    ).deploy(...validWeights);
    await creditScore.deployed();

    const [
      volumePercent,
      balancePercent,
      frequencyPercent,
      mixPercent,
      newTxPercent,
    ] = await Promise.all([
      creditScore.transactionVolumePercent(),
      creditScore.walletBalancePercent(),
      creditScore.transactionFrequencyPercent(),
      creditScore.transactionMixPercent(),
      creditScore.newTransactionsPercent(),
    ]);

    expect(volumePercent).to.equal(validWeights[0]);
    expect(balancePercent).to.equal(validWeights[1]);
    expect(frequencyPercent).to.equal(validWeights[2]);
    expect(mixPercent).to.equal(validWeights[3]);
    expect(newTxPercent).to.equal(validWeights[4]);
  });

  it("Should revert with invalid percentage weights (total not equal to 100)", async function () {
    const invalidWeights = [25, 25, 25, 20];
    await expect(
      (await ethers.getContractFactory("CreditScore")).deploy(...invalidWeights)
    ).to.be.revertedWith("Total percentage must be 100");
  });

  it("Should return 0 for a new user", async function () {
    const creditScore = await (
      await ethers.getContractFactory("CreditScore")
    ).deploy([20, 20, 20, 20, 20]);
    await creditScore.deployed();

    const score = await creditScore.getCreditScore();
    expect(score).to.equal(0);
  });

  it("Should update credit data and calculate a new score", async function () {
    const creditScore = await (
      await ethers.getContractFactory("CreditScore")
    ).deploy([20, 20, 20, 20, 20]);
    await creditScore.deployed();

    const signer = await ethers.getSigner();
    const volume = 100;
    const balance = 5000;
    const frequency = 10;
    const mix = 3;
    const newTx = 2;

    await creditScore
      .connect(signer)
      .updateCreditScore(volume, balance, frequency, mix, newTx);

    const credit = await creditScore.userCredits(signer.address);
    expect(credit.transactionVolume).to.equal(volume);
    expect(credit.walletBalance).to.equal(balance);
    expect(credit.transactionFrequency).to.equal(frequency);
    expect(credit.transactionMix).to.equal(mix);
    expect(credit.newTransactions).to.equal(newTx);

    const score = await creditScore.getCreditScore();
    //  Adjust the expected score based on your calculation logic within _calculateCreditScore
    expect(score).to.be.greaterThan(0);
  });
  
  it("Should only allow owner to set transaction volume weight", async function () {
    const creditScore = await (
      await ethers.getContractFactory("CreditScore")
    ).deploy([20, 20, 20, 20, 20]);
    await creditScore.deployed();

    const [_, notOwner] = await ethers.getSigners();

    await expect(
      creditScore.connect(notOwner).setTransactionVolumePercent(30)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
