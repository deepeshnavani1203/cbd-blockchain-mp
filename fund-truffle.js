// Run with: truffle exec fund-truffle.js --network development
const BankToken = artifacts.require("BankToken");

module.exports = async function (callback) {
  try {
    const target = "0xc67543b9ef0830e937a6474d303831e101dfd851";
    const accounts = await web3.eth.getAccounts();
    const token = await BankToken.deployed();

    console.log("\nFunding", target, "\n");

    // Check which account has BNK and send from there
    for (let i = 0; i < 5; i++) {
      const bal = await token.balanceOf(accounts[i]);
      const bnk = web3.utils.fromWei(bal.toString(), "ether");
      console.log(`  Account[${i}] ${accounts[i].slice(0, 10)}... = ${bnk} BNK`);
    }

    // Find first account with enough BNK
    let sender = null;
    for (let i = 0; i < 5; i++) {
      const bal = await token.balanceOf(accounts[i]);
      if (parseFloat(web3.utils.fromWei(bal.toString(), "ether")) >= 5000) {
        sender = accounts[i];
        break;
      }
    }

    if (!sender) {
      console.log("\n⚠ No account has enough BNK. Target may already be funded.");
      const targetBal = await token.balanceOf(target);
      console.log(`  Target BNK: ${web3.utils.fromWei(targetBal.toString(), "ether")} BNK`);
      callback();
      return;
    }

    // Send 10,000 BNK (or whatever sender has, up to 10k)
    const senderBal = await token.balanceOf(sender);
    const maxSend = web3.utils.fromWei(senderBal.toString(), "ether");
    const sendAmount = Math.min(10000, parseFloat(maxSend));
    const amount = web3.utils.toWei(sendAmount.toString(), "ether");
    
    console.log(`\n  Sending ${sendAmount} BNK from ${sender.slice(0, 10)}...`);
    await token.transfer(target, amount, { from: sender });

    // Send 10 ETH
    console.log("  Sending 10 ETH...");
    await web3.eth.sendTransaction({
      from: sender,
      to: target,
      value: web3.utils.toWei("10", "ether"),
    });

    const bnkBal = await token.balanceOf(target);
    const ethBal = await web3.eth.getBalance(target);
    console.log(`\n  ✅ Target BNK: ${web3.utils.fromWei(bnkBal.toString(), "ether")} BNK`);
    console.log(`  ✅ Target ETH: ${web3.utils.fromWei(ethBal, "ether")} ETH`);
    console.log("\n🎉 Done! Clear MetaMask activity data, then refresh DApp.\n");

    callback();
  } catch (err) {
    console.error(err);
    callback(err);
  }
};
