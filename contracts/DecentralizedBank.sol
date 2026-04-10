// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BankToken.sol";

/**
 * @title DecentralizedBank
 * @dev Core banking contract — accepts BNK token deposits, enables withdrawals,
 *      internal transfers between users, and collateralized loans (max 2× deposit).
 *      All state-changing functions are guarded against reentrancy and can be paused by the owner.
 */
contract DecentralizedBank is ReentrancyGuard, Pausable, Ownable {
    BankToken public bankToken;

    // Internal ledger
    mapping(address => uint256) private _balances;
    mapping(address => uint256) private _loans;

    // ── Events ─────────────────────────────────────────────
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event LoanIssued(address indexed user, uint256 amount);
    event LoanRepaid(address indexed user, uint256 amount);

    // ── Constructor ────────────────────────────────────────
    constructor(BankToken _bankToken) {
        bankToken = _bankToken;
    }

    // ── Core Banking ───────────────────────────────────────

    /**
     * @dev Deposit BNK tokens into the bank.
     *      Caller must first approve this contract to spend `amount`.
     */
    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        require(
            bankToken.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        _balances[msg.sender] += amount;
        emit Deposit(msg.sender, amount);
    }

    /**
     * @dev Withdraw BNK tokens from the bank back to wallet.
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        require(_balances[msg.sender] >= amount, "Insufficient bank balance");
        _balances[msg.sender] -= amount;
        require(
            bankToken.transfer(msg.sender, amount),
            "Token transfer failed"
        );
        emit Withdrawal(msg.sender, amount);
    }

    /**
     * @dev Internal bank-to-bank transfer between two users.
     *      Tokens remain in the contract; only ledger entries change.
     */
    function transfer(
        address to,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(to != address(0), "Invalid recipient");
        require(to != msg.sender, "Cannot transfer to self");
        require(amount > 0, "Amount must be > 0");
        require(_balances[msg.sender] >= amount, "Insufficient bank balance");

        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
    }

    // ── Loans ──────────────────────────────────────────────

    /**
     * @dev Request a BNK loan (max 2× deposited balance).
     *      Mints new tokens to the borrower's wallet.
     *      Only one active loan per user.
     */
    function requestLoan(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        require(_loans[msg.sender] == 0, "Repay existing loan first");
        require(
            amount <= _balances[msg.sender] * 2,
            "Exceeds 2x deposit limit"
        );

        _loans[msg.sender] = amount;
        bankToken.mint(msg.sender, amount);
        emit LoanIssued(msg.sender, amount);
    }

    /**
     * @dev Repay the full active loan plus 10 % interest.
     *      Caller must approve (loan + interest) BNK to this contract.
     */
    function repayLoan() external nonReentrant whenNotPaused {
        uint256 loanAmount = _loans[msg.sender];
        require(loanAmount > 0, "No active loan");

        uint256 interest = (loanAmount * 10) / 100;
        uint256 totalRepayment = loanAmount + interest;

        require(
            bankToken.transferFrom(msg.sender, address(this), totalRepayment),
            "Repayment transfer failed"
        );

        _loans[msg.sender] = 0;
        emit LoanRepaid(msg.sender, totalRepayment);
    }

    // ── View Functions ─────────────────────────────────────

    function getBalance(address user) external view returns (uint256) {
        return _balances[user];
    }

    function getLoanAmount(address user) external view returns (uint256) {
        return _loans[user];
    }

    // ── Admin ──────────────────────────────────────────────

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
