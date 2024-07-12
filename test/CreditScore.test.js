const { expect } = require('chai');
const  ethers = require('hardhat');

describe('CreditScore', function () {
  let creditScoreContract;
  let owner;
  let user1;
  let user2;

  const PRECISION = 10**18;

  before(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const CreditScore = await ethers.getContractFactory('CreditScore');
    creditScoreContract = await CreditScore.deploy();
    await creditScoreContract.deployed();
  });

  describe('updateUserDetails', function () {
    it('Should update user details correctly', async function () {
      const volume = ethers.utils.parseEther('100');
      const balance = ethers.utils.parseEther('10');
      const frequency = 10;
      const mix = 5;
      const newTxs = 20;

      await creditScoreContract.updateUserDetails(user1.address, volume, balance, frequency, mix, newTxs);
      const userScore = await creditScoreContract.getCreditScore(user1.address);

      // You may adjust these expectations based on your specific scoring formula
      expect(userScore).to.be.above(300).and.to.be.below(850);
    });

    it('Should revert if not called by the owner', async function () {
      const volume = ethers.utils.parseEther('100');
      const balance = ethers.utils.parseEther('10');
      const frequency = 10;
      const mix = 5;
      const newTxs = 20;

      await expect(
        creditScoreContract.connect(user2).updateUserDetails(user1.address, volume, balance, frequency, mix, newTxs)
      ).to.be.revertedWith('Not authorized');
    });

    it('Should revert if trying to update within 21 days', async function () {
      const volume = ethers.utils.parseEther('100');
      const balance = ethers.utils.parseEther('10');
      const frequency = 10;
      const mix = 5;
      const newTxs = 20;

      await creditScoreContract.updateUserDetails(user1.address, volume, balance, frequency, mix, newTxs);

      // Attempt to update again within 21 days
      await expect(
        creditScoreContract.updateUserDetails(user1.address, volume, balance, frequency, mix, newTxs)
      ).to.be.revertedWith('Can only update after 21 days');
    });

    it('Should revert if an invalid address is provided', async function () {
      const volume = ethers.utils.parseEther('100');
      const balance = ethers.utils.parseEther('10');
      const frequency = 10;
      const mix = 5;
      const newTxs = 20;

      await expect(
        creditScoreContract.updateUserDetails(ethers.constants.AddressZero, volume, balance, frequency, mix, newTxs)
      ).to.be.revertedWith('Invalid address');
    });
  });
});
