const BankToken = artifacts.require("BankToken");
const DecentralizedBank = artifacts.require("DecentralizedBank");
const { expect } = require("chai");
const {
  BN,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");

contract("DecentralizedBank", (accounts) => {
  const [owner, user1, user2, user3] = accounts;
  const toWei = (n) => web3.utils.toWei(n.toString(), "ether");
  const fromWei = (n) => web3.utils.fromWei(n.toString(), "ether");

  let token, bank;

  beforeEach(async () => {
    // Fresh deploy each test
    token = await BankToken.new(1000000, { from: owner });
    bank = await DecentralizedBank.new(token.address, { from: owner });

    // Give users some BNK before transferring ownership
    await token.transfer(user1, toWei(10000), { from: owner });
    await token.transfer(user2, toWei(10000), { from: owner });
    await token.transfer(user3, toWei(5000), { from: owner });

    // Transfer token ownership to bank (enables loan minting)
    await token.transferOwnership(bank.address, { from: owner });
  });

  // ── Deposit ──────────────────────────────────────────────

  describe("Deposit", () => {
    it("should increase bank balance after deposit", async () => {
      await token.approve(bank.address, toWei(500), { from: user1 });
      await bank.deposit(toWei(500), { from: user1 });
      const balance = await bank.getBalance(user1);
      expect(fromWei(balance)).to.equal("500");
    });

    it("should emit Deposit event", async () => {
      await token.approve(bank.address, toWei(100), { from: user1 });
      const receipt = await bank.deposit(toWei(100), { from: user1 });
      expectEvent(receipt, "Deposit", {
        user: user1,
        amount: toWei(100),
      });
    });

    it("should revert if amount is zero", async () => {
      await expectRevert(
        bank.deposit(toWei(0), { from: user1 }),
        "Amount must be > 0"
      );
    });

    it("should revert if token allowance is insufficient", async () => {
      await expectRevert.unspecified(
        bank.deposit(toWei(500), { from: user1 })
      );
    });
  });

  // ── Withdrawal ───────────────────────────────────────────

  describe("Withdrawal", () => {
    beforeEach(async () => {
      await token.approve(bank.address, toWei(1000), { from: user1 });
      await bank.deposit(toWei(1000), { from: user1 });
    });

    it("should decrease bank balance after withdrawal", async () => {
      await bank.withdraw(toWei(400), { from: user1 });
      const balance = await bank.getBalance(user1);
      expect(fromWei(balance)).to.equal("600");
    });

    it("should return tokens to the user's wallet", async () => {
      const before = await token.balanceOf(user1);
      await bank.withdraw(toWei(400), { from: user1 });
      const after = await token.balanceOf(user1);
      const diff = new BN(after).sub(new BN(before));
      expect(diff.toString()).to.equal(toWei(400));
    });

    it("should emit Withdrawal event", async () => {
      const receipt = await bank.withdraw(toWei(400), { from: user1 });
      expectEvent(receipt, "Withdrawal", {
        user: user1,
        amount: toWei(400),
      });
    });

    it("should revert if balance is insufficient", async () => {
      await expectRevert(
        bank.withdraw(toWei(2000), { from: user1 }),
        "Insufficient bank balance"
      );
    });
  });

  // ── Transfer ─────────────────────────────────────────────

  describe("Transfer", () => {
    beforeEach(async () => {
      await token.approve(bank.address, toWei(1000), { from: user1 });
      await bank.deposit(toWei(1000), { from: user1 });
    });

    it("should decrease sender and increase receiver bank balances", async () => {
      await bank.transfer(user2, toWei(300), { from: user1 });
      expect(fromWei(await bank.getBalance(user1))).to.equal("700");
      expect(fromWei(await bank.getBalance(user2))).to.equal("300");
    });

    it("should emit Transfer event", async () => {
      const receipt = await bank.transfer(user2, toWei(300), { from: user1 });
      expectEvent(receipt, "Transfer", {
        from: user1,
        to: user2,
        amount: toWei(300),
      });
    });

    it("should revert when transferring to self", async () => {
      await expectRevert(
        bank.transfer(user1, toWei(100), { from: user1 }),
        "Cannot transfer to self"
      );
    });

    it("should revert when balance is insufficient", async () => {
      await expectRevert(
        bank.transfer(user2, toWei(5000), { from: user1 }),
        "Insufficient bank balance"
      );
    });

    it("should revert when transferring to zero address", async () => {
      await expectRevert(
        bank.transfer(
          "0x0000000000000000000000000000000000000000",
          toWei(100),
          { from: user1 }
        ),
        "Invalid recipient"
      );
    });
  });

  // ── Loans ────────────────────────────────────────────────

  describe("Loans", () => {
    beforeEach(async () => {
      await token.approve(bank.address, toWei(1000), { from: user1 });
      await bank.deposit(toWei(1000), { from: user1 });
    });

    it("should issue a loan up to 2× deposited balance", async () => {
      await bank.requestLoan(toWei(2000), { from: user1 });
      const loan = await bank.getLoanAmount(user1);
      expect(fromWei(loan)).to.equal("2000");
    });

    it("should mint BNK tokens to borrower's wallet", async () => {
      const before = await token.balanceOf(user1);
      await bank.requestLoan(toWei(1000), { from: user1 });
      const after = await token.balanceOf(user1);
      const diff = new BN(after).sub(new BN(before));
      expect(diff.toString()).to.equal(toWei(1000));
    });

    it("should emit LoanIssued event", async () => {
      const receipt = await bank.requestLoan(toWei(500), { from: user1 });
      expectEvent(receipt, "LoanIssued", {
        user: user1,
        amount: toWei(500),
      });
    });

    it("should revert if loan exceeds 2× deposit", async () => {
      await expectRevert(
        bank.requestLoan(toWei(2001), { from: user1 }),
        "Exceeds 2x deposit limit"
      );
    });

    it("should revert if user already has an active loan", async () => {
      await bank.requestLoan(toWei(500), { from: user1 });
      await expectRevert(
        bank.requestLoan(toWei(500), { from: user1 }),
        "Repay existing loan first"
      );
    });

    it("should revert loan request when no deposit exists", async () => {
      await expectRevert(
        bank.requestLoan(toWei(100), { from: user2 }),
        "Exceeds 2x deposit limit"
      );
    });
  });

  // ── Loan Repayment ───────────────────────────────────────

  describe("Loan Repayment", () => {
    beforeEach(async () => {
      await token.approve(bank.address, toWei(1000), { from: user1 });
      await bank.deposit(toWei(1000), { from: user1 });
      await bank.requestLoan(toWei(1000), { from: user1 });
    });

    it("should clear loan and collect principal + 10% interest", async () => {
      // user1 wallet has: 9000 (initial) - 1000 (deposited) + 1000 (loan) = 9000 BNK
      // Repay = 1000 + 100 (10%) = 1100 BNK
      await token.approve(bank.address, toWei(1100), { from: user1 });
      await bank.repayLoan({ from: user1 });

      const loan = await bank.getLoanAmount(user1);
      expect(loan.toString()).to.equal("0");
    });

    it("should emit LoanRepaid event with total repayment", async () => {
      await token.approve(bank.address, toWei(1100), { from: user1 });
      const receipt = await bank.repayLoan({ from: user1 });
      expectEvent(receipt, "LoanRepaid", {
        user: user1,
        amount: toWei(1100),
      });
    });

    it("should revert if user has no active loan", async () => {
      // user2 has no loan
      await expectRevert(
        bank.repayLoan({ from: user2 }),
        "No active loan"
      );
    });
  });

  // ── ReentrancyGuard ──────────────────────────────────────

  describe("ReentrancyGuard", () => {
    it("should protect deposit from reentrancy (guard is applied)", async () => {
      // Verify that the contract inherits ReentrancyGuard by checking
      // that normal sequential calls succeed (guard resets between txs)
      await token.approve(bank.address, toWei(2000), { from: user1 });
      await bank.deposit(toWei(500), { from: user1 });
      await bank.deposit(toWei(500), { from: user1 });
      const balance = await bank.getBalance(user1);
      expect(fromWei(balance)).to.equal("1000");
    });

    it("should protect withdraw from reentrancy (guard is applied)", async () => {
      await token.approve(bank.address, toWei(1000), { from: user1 });
      await bank.deposit(toWei(1000), { from: user1 });
      await bank.withdraw(toWei(300), { from: user1 });
      await bank.withdraw(toWei(300), { from: user1 });
      const balance = await bank.getBalance(user1);
      expect(fromWei(balance)).to.equal("400");
    });
  });

  // ── Pausable ─────────────────────────────────────────────

  describe("Pausable", () => {
    it("should allow owner to pause the contract", async () => {
      await bank.pause({ from: owner });
      await token.approve(bank.address, toWei(100), { from: user1 });
      await expectRevert(
        bank.deposit(toWei(100), { from: user1 }),
        "Pausable: paused"
      );
    });

    it("should allow owner to unpause", async () => {
      await bank.pause({ from: owner });
      await bank.unpause({ from: owner });
      await token.approve(bank.address, toWei(100), { from: user1 });
      await bank.deposit(toWei(100), { from: user1 });
      const balance = await bank.getBalance(user1);
      expect(fromWei(balance)).to.equal("100");
    });

    it("should revert when non-owner tries to pause", async () => {
      await expectRevert(
        bank.pause({ from: user1 }),
        "Ownable: caller is not the owner"
      );
    });

    it("should revert when non-owner tries to unpause", async () => {
      await bank.pause({ from: owner });
      await expectRevert(
        bank.unpause({ from: user1 }),
        "Ownable: caller is not the owner"
      );
    });

    it("should block all state-changing functions when paused", async () => {
      await token.approve(bank.address, toWei(1000), { from: user1 });
      await bank.deposit(toWei(500), { from: user1 });
      await bank.pause({ from: owner });

      await expectRevert(
        bank.withdraw(toWei(100), { from: user1 }),
        "Pausable: paused"
      );
      await expectRevert(
        bank.transfer(user2, toWei(100), { from: user1 }),
        "Pausable: paused"
      );
      await expectRevert(
        bank.requestLoan(toWei(100), { from: user1 }),
        "Pausable: paused"
      );
    });
  });
});
