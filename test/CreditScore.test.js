const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CreditScore Contract", function () {
    let CreditScore, creditScore, owner, addr1, addr2;

    beforeEach(async function () {
        CreditScore = await ethers.getContractFactory("CreditScore");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        creditScore = await CreditScore.deploy();
        await creditScore.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await creditScore.owner()).to.equal(owner.address);
        });
    });

    describe("Updating Metrics and Calculating Credit Score", function () {
        it("Should update transaction volume and calculate credit score", async function () {
            await creditScore.updateTransactionVolume(addr1.address, ethers.utils.parseEther("10"));
            const user = await creditScore.users(addr1.address);
            expect(user.transactionVolume).to.equal(ethers.utils.parseEther("10"));
            expect(user.creditScore).to.be.above(300);
        });

        it("Should update wallet balance and calculate credit score", async function () {
            await creditScore.updateWalletBalance(addr1.address, ethers.utils.parseEther("20"));
            const user = await creditScore.users(addr1.address);
            expect(user.walletBalance).to.equal(ethers.utils.parseEther("20"));
            expect(user.creditScore).to.be.above(300);
        });

        it("Should update transaction frequency and calculate credit score", async function () {
            await creditScore.updateTransactionFrequency(addr1.address, 50);
            const user = await creditScore.users(addr1.address);
            expect(user.transactionFrequency).to.equal(50);
            expect(user.creditScore).to.be.above(300);
        });

        it("Should update transaction mix and calculate credit score", async function () {
            await creditScore.updateTransactionMix(addr1.address, 5);
            const user = await creditScore.users(addr1.address);
            expect(user.transactionMix).to.equal(5);
            expect(user.creditScore).to.be.above(300);
        });

        it("Should update pursuit of new transactions and calculate credit score", async function () {
            await creditScore.updatePursuitOfNewTransactions(addr1.address, 25);
            const user = await creditScore.users(addr1.address);
            expect(user.pursuitOfNewTransactions).to.equal(25);
            expect(user.creditScore).to.be.above(300);
        });
    });

    describe("Access Control", function () {
        it("Should revert when non-owner tries to update metrics", async function () {
            await expect(
                creditScore.connect(addr1).updateTransactionVolume(addr2.address, ethers.utils.parseEther("10"))
            ).to.be.revertedWith("Not authorized");

            await expect(
                creditScore.connect(addr1).updateWalletBalance(addr2.address, ethers.utils.parseEther("20"))
            ).to.be.revertedWith("Not authorized");

            await expect(
                creditScore.connect(addr1).updateTransactionFrequency(addr2.address, 50)
            ).to.be.revertedWith("Not authorized");

            await expect(
                creditScore.connect(addr1).updateTransactionMix(addr2.address, 5)
            ).to.be.revertedWith("Not authorized");

            await expect(
                creditScore.connect(addr1).updatePursuitOfNewTransactions(addr2.address, 25)
            ).to.be.revertedWith("Not authorized");
        });
    });

    describe("Getting User Credit Score", function () {
        it("Should return the correct credit score for a user", async function () {
            await creditScore.updateTransactionVolume(addr1.address, ethers.utils.parseEther("10"));
            await creditScore.updateWalletBalance(addr1.address, ethers.utils.parseEther("20"));
            await creditScore.updateTransactionFrequency(addr1.address, 50);
            await creditScore.updateTransactionMix(addr1.address, 5);
            await creditScore.updatePursuitOfNewTransactions(addr1.address, 25);

            const creditScoreValue = await creditScore.getUserCreditScore(addr1.address);
            expect(creditScoreValue).to.be.above(300);
            expect(creditScoreValue).to.be.below(850);
        });
    });
});
