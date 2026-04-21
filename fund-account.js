/**
 * Fund a MetaMask account with ETH and BNK tokens from Ganache.
 * Connects directly to Ganache to get the correct contract state.
 */
const Web3 = require("web3");

const TARGET = process.argv[2] || "0xc67543b9ef0830e937a6474d303831e101dfd851";
const GANACHE_URL = "http://127.0.0.1:7500";

// Minimal ERC-20 ABI for transfer + balanceOf
const ERC20_ABI = [
  {
    constant: false, inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    name: "transfer", outputs: [{ name: "", type: "bool" }], type: "function"
  },
  {
    constant: true, inputs: [{ name: "account", type: "address" }],
    name: "balanceOf", outputs: [{ name: "", type: "uint256" }], type: "function"
  }
];

async function main() {
  const w3 = new Web3(GANACHE_URL);
  const accounts = await w3.eth.getAccounts();
  
  // Account 1 has 10,000 BNK (deployer account 0 sent them during migration)
  const funder = accounts[1];
  
  console.log(`\nFunding ${TARGET} from Ganache...\n`);
  console.log(`Using funder: ${funder}`);

  // 1. Send 50 ETH from account 0
  console.log("\n1. Sending 50 ETH...");
  await w3.eth.sendTransaction({
    from: accounts[0],
    to: TARGET,
    value: w3.utils.toWei("50", "ether"),
  });
  const ethBal = await w3.eth.getBalance(TARGET);
  console.log(`   ✅ ETH balance: ${w3.utils.fromWei(ethBal, "ether")} ETH`);

  // 2. Find BankToken address from the ABI file
  const BankTokenABI = require("./src/abis/BankToken.json");
  const netIds = Object.keys(BankTokenABI.networks);
  const tokenAddress = BankTokenABI.networks[netIds[netIds.length - 1]].address;
  console.log(`\n2. BankToken at: ${tokenAddress}`);

  // 3. Use minimal ABI to avoid decoding issues
  const token = new w3.eth.Contract(ERC20_ABI, tokenAddress);
  
  // Check funder BNK balance
  const funderBal = await token.methods.balanceOf(funder).call();
  console.log(`   Funder BNK balance: ${w3.utils.fromWei(funderBal, "ether")} BNK`);

  // 4. Send 10,000 BNK from funder (account 1) to target
  const bnkAmount = w3.utils.toWei("10000", "ether");
  console.log(`   Sending 10,000 BNK to ${TARGET}...`);
  await token.methods.transfer(TARGET, bnkAmount).send({ from: funder, gas: 100000 });
  
  const targetBal = await token.methods.balanceOf(TARGET).call();
  console.log(`   ✅ Target BNK balance: ${w3.utils.fromWei(targetBal, "ether")} BNK`);

  console.log("\n🎉 Done! Refresh the DApp page.\n");
}

main().catch((err) => {
  console.error("Error:", err.message);
});
