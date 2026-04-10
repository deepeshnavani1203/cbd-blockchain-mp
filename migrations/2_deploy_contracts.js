const BankToken = artifacts.require("BankToken");
const DecentralizedBank = artifacts.require("DecentralizedBank");

module.exports = async function (deployer, _network, accounts) {
  // 1. Deploy BankToken with 1,000,000 initial supply → all minted to accounts[0]
  await deployer.deploy(BankToken, 1000000);
  const bankToken = await BankToken.deployed();

  // 2. Deploy DecentralizedBank linked to BankToken
  await deployer.deploy(DecentralizedBank, bankToken.address);
  const bank = await DecentralizedBank.deployed();

  // 3. Distribute 10,000 BNK to the first 5 Ganache accounts for testing
  const distribution = web3.utils.toWei("10000", "ether");
  for (let i = 1; i < Math.min(accounts.length, 5); i++) {
    await bankToken.transfer(accounts[i], distribution, { from: accounts[0] });
  }

  // 4. Transfer BankToken ownership to DecentralizedBank (enables loan minting)
  await bankToken.transferOwnership(bank.address);

  console.log("──────────────────────────────────────────");
  console.log("BankToken  deployed at:", bankToken.address);
  console.log("Bank       deployed at:", bank.address);
  console.log("Token ownership transferred to Bank contract");
  console.log("10,000 BNK distributed to accounts[1..4]");
  console.log("──────────────────────────────────────────");
};
