const BankToken = artifacts.require("BankToken");
const { expect } = require("chai");
const { BN, expectRevert } = require("@openzeppelin/test-helpers");

contract("BankToken", (accounts) => {
  const [owner, user1, user2] = accounts;
  const INITIAL_SUPPLY = new BN("1000000");
  const DECIMALS = new BN("18");
  const TOTAL_WEI = INITIAL_SUPPLY.mul(new BN("10").pow(DECIMALS));

  let token;

  beforeEach(async () => {
    token = await BankToken.new(1000000, { from: owner });
  });

  // ── Deployment ───────────────────────────────────────────

  describe("Deployment", () => {
    it("should set the correct name and symbol", async () => {
      expect(await token.name()).to.equal("Bank Token");
      expect(await token.symbol()).to.equal("BNK");
    });

    it("should mint the full initial supply to the deployer", async () => {
      const balance = await token.balanceOf(owner);
      expect(balance.toString()).to.equal(TOTAL_WEI.toString());
    });

    it("should report 18 decimals", async () => {
      const decimals = await token.decimals();
      expect(decimals.toNumber()).to.equal(18);
    });

    it("should set deployer as owner", async () => {
      expect(await token.owner()).to.equal(owner);
    });
  });

  // ── Minting ──────────────────────────────────────────────

  describe("Minting", () => {
    it("should allow owner to mint tokens", async () => {
      const amount = web3.utils.toWei("500", "ether");
      await token.mint(user1, amount, { from: owner });
      const balance = await token.balanceOf(user1);
      expect(balance.toString()).to.equal(amount);
    });

    it("should revert when non-owner tries to mint", async () => {
      const amount = web3.utils.toWei("500", "ether");
      await expectRevert(
        token.mint(user2, amount, { from: user1 }),
        "Ownable: caller is not the owner"
      );
    });
  });

  // ── Transfers ────────────────────────────────────────────

  describe("Transfers", () => {
    it("should transfer tokens between accounts", async () => {
      const amount = web3.utils.toWei("1000", "ether");
      await token.transfer(user1, amount, { from: owner });
      const balance = await token.balanceOf(user1);
      expect(balance.toString()).to.equal(amount);
    });

    it("should revert transfer when balance is insufficient", async () => {
      const amount = web3.utils.toWei("1", "ether");
      await expectRevert.unspecified(
        token.transfer(owner, amount, { from: user1 })
      );
    });
  });

  // ── Burning ──────────────────────────────────────────────

  describe("Burning", () => {
    it("should allow token holders to burn their tokens", async () => {
      const amount = web3.utils.toWei("100", "ether");
      await token.burn(amount, { from: owner });
      const balance = await token.balanceOf(owner);
      expect(balance.toString()).to.equal(
        TOTAL_WEI.sub(new BN(amount)).toString()
      );
    });
  });
});
