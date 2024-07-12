const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CreditScoreModule", (m) => {

  const creditScore = m.contract("CreditScore", [35,30,15,10,10]);

  return { creditScore };
});
