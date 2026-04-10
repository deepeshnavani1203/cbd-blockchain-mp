# BlockBank — Decentralized Banking DApp

> A full-featured Decentralized Banking Application built on Ethereum, demonstrating how blockchain technology can transform traditional banking services through smart contracts, tokenized assets, and trustless financial operations.

![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue)
![Truffle](https://img.shields.io/badge/Truffle-5.x-green)
![React](https://img.shields.io/badge/React-18-cyan)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🏦 Overview

BlockBank is an educational DApp that implements core banking functions — deposits, withdrawals, transfers, and lending — entirely on-chain using Ethereum smart contracts. Users interact through a React frontend connected to MetaMask, with all transactions secured by OpenZeppelin's audited libraries.

### Key Features

| Feature | Description |
|---------|-------------|
| **ERC-20 Token** | Custom `BNK` token (1M supply) for all banking operations |
| **Deposits** | Lock BNK tokens in the bank smart contract |
| **Withdrawals** | Retrieve deposited tokens back to your wallet |
| **Transfers** | Send deposited BNK to other users (internal ledger) |
| **Loans** | Borrow up to 2× your deposit balance |
| **Loan Repayment** | Repay loans with 10% interest |
| **Security** | ReentrancyGuard + Pausable (emergency stop) |
| **MetaMask** | Full wallet integration with event listeners |

---

## 📋 Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | ≥ 16.x | JavaScript runtime |
| [Truffle](https://trufflesuite.com/) | 5.x | Smart contract framework |
| [Ganache](https://trufflesuite.com/ganache/) | 7.x | Local Ethereum blockchain |
| [MetaMask](https://metamask.io/) | Latest | Browser wallet extension |
| [Git](https://git-scm.com/) | Latest | Version control |

---

## 🚀 Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd blockchain-banking-dapp

# 2. Install dependencies
npm install

# 3. Start Ganache (GUI or CLI) on port 7545
ganache-cli -p 7545
# OR open Ganache GUI → Quickstart (Ethereum)

# 4. Compile smart contracts
npx truffle compile

# 5. Deploy contracts to Ganache
npx truffle migrate --reset

# 6. Run the React frontend
npm start
```

The app opens at **http://localhost:3000**.

---

## 🦊 MetaMask Configuration for Localhost

1. Open MetaMask → **Settings → Networks → Add Network**
2. Fill in:

| Field | Value |
|-------|-------|
| Network Name | `Ganache Local` |
| RPC URL | `http://127.0.0.1:7545` |
| Chain ID | `1337` |
| Currency Symbol | `ETH` |

3. **Import an account** from Ganache:
   - In Ganache, click the key icon next to any account
   - Copy the private key
   - In MetaMask → **Import Account → Paste private key**

> ⚠️ **Never** use Ganache private keys on mainnet. These are for development only.

---

## 🏗 Project Structure

```
blockchain-banking-dapp/
├── contracts/               # Solidity smart contracts
│   ├── Migrations.sol       # Truffle migration tracker
│   ├── BankToken.sol        # ERC-20 BNK token
│   └── DecentralizedBank.sol # Core banking logic
├── migrations/              # Truffle deployment scripts
│   ├── 1_initial_migration.js
│   └── 2_deploy_contracts.js
├── test/                    # Mocha + Chai unit tests
│   ├── BankToken.test.js
│   └── DecentralizedBank.test.js
├── src/
│   ├── abis/                # Auto-generated contract ABIs (truffle compile)
│   ├── components/
│   │   ├── App.js           # Main app + Web3 init
│   │   ├── Navbar.js        # Top nav + wallet info
│   │   ├── Dashboard.js     # Balance overview + tx history
│   │   ├── Deposit.js       # Deposit BNK form
│   │   ├── Withdraw.js      # Withdraw BNK form
│   │   ├── Transfer.js      # Internal transfer form
│   │   └── Loans.js         # Loan request + repayment
│   ├── index.css            # Dark-theme design system
│   └── index.js             # React entry point
├── public/index.html        # HTML shell
├── truffle-config.js        # Truffle settings
└── package.json
```

---

## 📜 Smart Contract Reference

### BankToken.sol (ERC-20)

| Function | Access | Description |
|----------|--------|-------------|
| `constructor(uint256 initialSupply)` | — | Mint initial supply to deployer |
| `mint(address to, uint256 amount)` | Owner only | Mint new tokens (used by bank for loans) |
| `burn(uint256 amount)` | Token holder | Burn tokens from own balance |
| *All ERC-20 functions* | Public | `transfer`, `approve`, `transferFrom`, etc. |

### DecentralizedBank.sol

| Function | Access | Description |
|----------|--------|-------------|
| `deposit(uint256 amount)` | Any user | Deposit BNK into the bank (requires prior `approve`) |
| `withdraw(uint256 amount)` | Any user | Withdraw BNK from bank to wallet |
| `transfer(address to, uint256 amount)` | Any user | Internal bank transfer to another user |
| `requestLoan(uint256 amount)` | Any user | Borrow BNK (max 2× deposit, mints new tokens) |
| `repayLoan()` | Borrower | Repay loan + 10% interest |
| `getBalance(address user)` | View | Get user's deposited BNK balance |
| `getLoanAmount(address user)` | View | Get user's active loan amount |
| `pause()` | Owner | Emergency pause all operations |
| `unpause()` | Owner | Resume operations |

### Events

| Event | Parameters | Trigger |
|-------|-----------|---------|
| `Deposit` | `user`, `amount` | After successful deposit |
| `Withdrawal` | `user`, `amount` | After successful withdrawal |
| `Transfer` | `from`, `to`, `amount` | After internal transfer |
| `LoanIssued` | `user`, `amount` | After loan approval |
| `LoanRepaid` | `user`, `amount` | After full loan repayment |

---

## 🧪 Running Tests

```bash
# Run all contract tests
npx truffle test

# Run a specific test file
npx truffle test test/BankToken.test.js
npx truffle test test/DecentralizedBank.test.js
```

Tests cover: deployment, deposits, withdrawals, transfers, loans, repayment, reentrancy protection, and pausable functionality.

---

## 📦 NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `react-scripts start` | Start React dev server |
| `build` | `react-scripts build` | Production build |
| `test:contracts` | `truffle test` | Run smart contract tests |
| `migrate` | `truffle migrate --reset` | Deploy contracts to Ganache |
| `compile` | `truffle compile` | Compile Solidity contracts |

---

## 📸 Screenshots

> Screenshots will be added after the first run.

---

## ⚖️ License

This project is licensed under the MIT License.
