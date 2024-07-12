const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CreditScoreModule", (m) => {

  const creditScore = m.contract("CreditScore");

  return { creditScore };
});
