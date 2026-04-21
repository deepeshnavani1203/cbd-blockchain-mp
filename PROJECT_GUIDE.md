# BlockBank — Complete Project Guide (Hinglish)

---

## 🏦 Yeh Project Kya Hai?

**BlockBank** ek **Decentralized Banking DApp** (Decentralized Application) hai jo Ethereum blockchain pe bana hua hai. Simple words mein — yeh ek fake bank hai jo real bank ki tarah kaam karta hai, lekin koi central authority (jaise SBI ya HDFC) nahi hai. Sab kuch **Smart Contracts** handle karte hain.

### Real Bank vs BlockBank

| Real Bank | BlockBank |
|-----------|-----------|
| Bank server pe data store hota hai | Ethereum blockchain pe data store hota hai |
| Bank ke rules change ho sakte hain | Smart contract ke rules immutable hain |
| KYC, paperwork lagta hai | Sirf MetaMask wallet chahiye |
| Bank band ho sakta hai | Blockchain kabhi band nahi hoti |
| Fiat currency (INR, USD) | BNK Token (ERC-20) |

---

## 🧱 Project Ki Technology Stack

```
Frontend  →  React 18 + Bootstrap 5
Blockchain →  Ethereum (Local: Ganache)
Contracts  →  Solidity 0.8.19
Framework  →  Truffle 5.x
Wallet     →  MetaMask
Libraries  →  OpenZeppelin (security ke liye)
```

---

## 📁 Project Structure Samjho

```
blockchain-banking-dapp/
│
├── contracts/                  ← Solidity Smart Contracts (yahi asli logic hai)
│   ├── BankToken.sol           ← BNK naam ka ERC-20 token
│   ├── DecentralizedBank.sol   ← Bank ka core logic (deposit/withdraw/loan)
│   └── Migrations.sol          ← Truffle ka internal tracker
│
├── migrations/                 ← Deployment scripts
│   ├── 1_initial_migration.js  ← Truffle ka default
│   └── 2_deploy_contracts.js   ← Hamara deployment script
│
├── src/                        ← React Frontend
│   ├── abis/                   ← Auto-generated (truffle compile ke baad banta hai)
│   └── components/
│       ├── App.js              ← Main app, Web3 connection, MetaMask
│       ├── Navbar.js           ← Top bar, wallet info
│       ├── Dashboard.js        ← Balance overview + transaction history
│       ├── Deposit.js          ← BNK deposit form
│       ├── Withdraw.js         ← BNK withdraw form
│       ← Transfer.js          ← Internal transfer form
│       └── Loans.js            ← Loan lena aur repay karna
│
├── test/                       ← Smart contract tests
├── truffle-config.js           ← Truffle settings (port 7545)
└── package.json                ← NPM dependencies
```

---

## ⚙️ Prerequisites — Kya Kya Install Karna Hai

Yeh sab pehle se install hona chahiye:

| Tool | Version | Kahan Se | Kyu Chahiye |
|------|---------|----------|-------------|
| **Node.js** | ≥ 16.x | nodejs.org | JavaScript runtime |
| **Truffle** | 5.x | `npm i -g truffle` | Smart contract compile/deploy |
| **Ganache** | 7.x | trufflesuite.com/ganache | Local fake Ethereum blockchain |
| **MetaMask** | Latest | metamask.io | Browser wallet (Chrome/Firefox extension) |
| **Git** | Latest | git-scm.com | Code version control |

---

## 🚀 Project Kaise Run Karna Hai — Step by Step

### Step 1: Dependencies Install Karo

```bash
npm install
```

> Yeh `node_modules` folder banayega aur React + Truffle sab install karega.

---

### Step 2: Gana  che Start Karo

**Option A — GUI (Recommended for beginners):**
- Ganache app open karo → "Quickstart Ethereum" click karo
- Port **7545** pe automatically start hoga
- 10 fake accounts milenge, har ek mein 100 ETH

**Option B — CLI:**
```bash
ganache-cli -p 7545
```

> ⚠️ Ganache band mat karna jab tak kaam kar rahe ho!

---

### Step 3: Smart Contracts Compile Karo

```bash
npx truffle compile
```

Yeh kya karta hai:
- `contracts/*.sol` files ko compile karta hai
- `src/abis/` folder mein JSON files banata hai (ABI = contract ka interface)

---

### Step 4: Contracts Deploy Karo (Migrate)

```bash
npx truffle migrate --reset
```

Yeh kya karta hai:
1. `BankToken` deploy karta hai (1,000,000 BNK mint hota hai)
2. `DecentralizedBank` deploy karta hai
3. Pehle 5 Ganache accounts mein 10,000 BNK distribute karta hai
4. BankToken ki ownership Bank contract ko transfer karta hai (loans ke liye)

Terminal mein kuch aisa dikhega:
```
BankToken  deployed at: 0xABC...
Bank       deployed at: 0xDEF...
10,000 BNK distributed to accounts[1..4]
```

---

### Step 5: MetaMask Setup Karo

1. MetaMask open karo → **Settings → Networks → Add Network**
2. Yeh details bharo:

| Field | Value |
|-------|-------|
| Network Name | `Ganache Local` |
| RPC URL | `http://127.0.0.1:7545` |
| Chain ID | `1337` |
| Currency Symbol | `ETH` |

3. **Ganache account import karo:**
   - Ganache mein kisi account ke paas key icon click karo
   - Private key copy karo
   - MetaMask → **Import Account** → Private key paste karo

> ⚠️ Yeh private keys sirf local testing ke liye hain. Kabhi bhi mainnet pe use mat karna!

---

### Step 6: React App Start Karo

```bash
npm start
```

Browser mein `http://localhost:3000` open hoga.

---

## 🎮 App Mein Kya Kya Kar Sakte Ho

### 1. 🔌 Wallet Connect Karo
- "Connect MetaMask" button click karo
- App automatically Ganache network pe switch kar dega
- Tumhara address aur ETH balance Navbar mein dikhega

---

### 2. 📊 Dashboard
- **Wallet Balance** — Tumhare MetaMask wallet mein kitne BNK hain
- **Bank Deposits** — Bank contract mein kitne BNK deposit kiye hain
- **Active Loan** — Abhi kitna loan outstanding hai
- **ETH Balance** — Gas fees ke liye ETH
- **Transaction History** — Sab recent transactions

---

### 3. 💰 Deposit (BNK Wallet → Bank)

**Process:**
1. Amount enter karo (ya MAX click karo)
2. "Approve & Deposit" click karo
3. **MetaMask Popup 1** — Approve karo (bank ko tumhare BNK spend karne ki permission)
4. **MetaMask Popup 2** — Deposit confirm karo
5. Done! Bank balance increase ho jayega

**Smart Contract Flow:**
```
User → approve(bankAddress, amount) → BankToken contract
User → deposit(amount) → DecentralizedBank contract
Bank contract → transferFrom(user, bank, amount) → tokens move hote hain
```

---

### 4. 📤 Withdraw (Bank → Wallet)

**Process:**
1. Amount enter karo
2. "Withdraw" click karo
3. **MetaMask Popup** — Confirm karo
4. Done! Wallet balance increase ho jayega

**Note:** Sirf utna withdraw kar sakte ho jitna deposit kiya hai.

---

### 5. ↔️ Transfer (Bank se Bank)

**Process:**
1. Recipient ka Ethereum address enter karo (0x...)
2. Amount enter karo
3. "Send Transfer" click karo
4. **MetaMask Popup** — Confirm karo

**Important:** Yeh internal transfer hai — tokens actually move nahi hote, sirf bank ka ledger update hota hai. Dono users ke bank balance change hote hain.

---

### 6. 🏦 Loans

#### Loan Lena:
- **Maximum loan = 2× tumhara deposit**
- Example: 1000 BNK deposit hai → max 2000 BNK loan le sakte ho
- Loan lene pe naye BNK tokens mint hote hain tumhare wallet mein
- Ek time pe sirf ek loan ho sakta hai

**Process:**
1. Loan amount enter karo
2. "Request Loan" click karo
3. MetaMask confirm karo
4. BNK tokens tumhare wallet mein aa jayenge

#### Loan Repay Karna:
- **Total repayment = Loan amount + 10% interest**
- Example: 1000 BNK loan → 1100 BNK repay karna hoga
- Repay karne ke liye wallet mein enough BNK hona chahiye

**Process:**
1. "Repay Full Loan" button click karo
2. **MetaMask Popup 1** — Approve repayment amount
3. **MetaMask Popup 2** — Repay confirm karo
4. Loan clear ho jayega

---

## 📜 Smart Contracts Deep Dive

### BankToken.sol (ERC-20 Token)

```solidity
// BNK token — standard ERC-20
// Initial supply: 1,000,000 BNK (deployer ko milta hai)
// mint() — sirf Bank contract call kar sakta hai (loans ke liye)
// burn() — koi bhi apne tokens burn kar sakta hai
```

**Key Point:** Deploy ke baad BankToken ki ownership `DecentralizedBank` ko transfer ho jaati hai. Isliye sirf bank contract naye tokens mint kar sakta hai (loan issuance ke time).

---

### DecentralizedBank.sol

**Security Features:**
- `ReentrancyGuard` — Reentrancy attack se bachata hai (famous hack vector)
- `Pausable` — Emergency mein owner sab operations pause kar sakta hai
- `Ownable` — Admin functions sirf owner call kar sakta hai

**Internal Ledger:**
```solidity
mapping(address => uint256) private _balances;  // har user ka deposit
mapping(address => uint256) private _loans;     // har user ka loan
```

Tokens physically bank contract ke paas hote hain, lekin ledger track karta hai ki kiska kitna hai.

---

## 🔑 Important Concepts — Basics

### 1. ERC-20 Token Kya Hota Hai?
Ethereum pe ek standard interface hai tokens ke liye. Jaise INR ek currency standard hai, ERC-20 ek token standard hai. BNK is standard ko follow karta hai isliye MetaMask automatically ise recognize karta hai.

### 2. Smart Contract Kya Hota Hai?
Blockchain pe deploy kiya hua code jo automatically execute hota hai jab conditions meet hoti hain. Koi middleman nahi, koi trust nahi — code hi law hai.

### 3. ABI (Application Binary Interface) Kya Hai?
Contract ka "menu card" — frontend ko batata hai ki contract mein kaunse functions hain aur unhe kaise call karna hai. `truffle compile` ke baad `src/abis/` mein generate hota hai.

### 4. Gas Fees Kya Hain?
Har blockchain transaction ke liye ETH mein fee deni padti hai. Isliye Ganache accounts mein ETH hota hai — BNK transactions ke liye gas pay karne ke liye.

### 5. Approve + TransferFrom Pattern Kyu?
ERC-20 mein directly kisi aur ke tokens nahi le sakte. Pehle user `approve()` karta hai (permission deta hai), phir contract `transferFrom()` se tokens le sakta hai. Isliye deposit mein 2 MetaMask popups aate hain.

### 6. Ganache Kya Hai?
Local fake Ethereum blockchain. Real blockchain pe deploy karne se pehle testing ke liye use hoti hai. Sab transactions instant hote hain, gas free hoti hai (fake ETH se pay hoti hai).

### 7. Truffle Kya Hai?
Smart contract development framework. Compile, deploy, test — sab ek jagah se manage hota hai.

---

## 🧪 Tests Kaise Run Kare

```bash
# Sab tests run karo
npx truffle test

# Sirf BankToken tests
npx truffle test test/BankToken.test.js

# Sirf Bank tests
npx truffle test test/DecentralizedBank.test.js
```

Tests cover karte hain: deployment, deposits, withdrawals, transfers, loans, repayment, reentrancy protection, aur pausable functionality.

---

## 📦 Useful NPM Commands

| Command | Kya Karta Hai |
|---------|---------------|
| `npm start` | React dev server start karo (localhost:3000) |
| `npm run build` | Production build banao |
| `npx truffle compile` | Contracts compile karo |
| `npx truffle migrate --reset` | Contracts deploy karo (fresh) |
| `npx truffle test` | Contract tests run karo |

---

## ⚠️ Common Errors aur Solutions

### "Contract ABIs not found"
```bash
npx truffle compile
npx truffle migrate --reset
```
`src/abis/` folder exist nahi karta — compile karo pehle.

### "Contracts not deployed"
Ganache band hai ya migrate nahi kiya. Ganache start karo aur migrate karo.

### MetaMask "Wrong Network"
App automatically Ganache pe switch karne ki koshish karta hai. Agar nahi hua toh manually Settings → Networks → Ganache Local select karo.

### Transaction Fail — "Insufficient bank balance"
Withdraw/Transfer ke liye utna balance nahi hai bank mein. Pehle deposit karo.

### Loan Fail — "Exceeds 2x deposit limit"
Loan amount tumhare deposit ka 2x se zyada hai. Deposit badhao ya loan amount kam karo.

### Ganache Restart ke Baad Kaam Nahi Karta
Ganache restart hone pe naye addresses generate hote hain. Dobara `truffle migrate --reset` karo aur MetaMask mein account reimport karo.

---

## 🔄 Complete Flow — Ek Example

```
1. Ganache start karo (10 accounts, 100 ETH each, 10000 BNK each)
2. truffle migrate --reset
3. MetaMask mein Ganache account import karo
4. npm start → localhost:3000
5. "Connect MetaMask" click karo
6. Dashboard pe 10,000 BNK wallet balance dikhega
7. Deposit tab → 1000 BNK deposit karo (2 MetaMask popups)
8. Dashboard pe: Wallet = 9000 BNK, Bank = 1000 BNK
9. Loans tab → 500 BNK loan lo (max 2000 tha)
10. Wallet = 9500 BNK (loan ke 500 BNK add hue), Loan = 500 BNK
11. Loan repay karo → 550 BNK (500 + 10% interest)
12. Wallet = 8950 BNK, Loan = 0
13. Transfer tab → doosre Ganache account ko 200 BNK bhejo
14. Withdraw tab → 800 BNK wapas wallet mein lo
```

---

## 🎯 Interview/Viva Ke Liye Important Questions

**Q1: Yeh project centralized hai ya decentralized?**
> Decentralized — koi central server nahi, sab logic blockchain pe smart contracts mein hai.

**Q2: BNK token kya hai?**
> ERC-20 standard ka custom token hai. Initial supply 1 million hai. Bank contract ise loans ke liye mint kar sakta hai.

**Q3: Deposit mein 2 transactions kyu hote hain?**
> ERC-20 security model ke wajah se. Pehle `approve()` se bank contract ko permission dete hain, phir `deposit()` se actual transfer hota hai.

**Q4: Loan ke liye collateral kya hai?**
> Tumhara bank deposit collateral hai. Max loan = 2× deposit. Agar 500 BNK deposit hai toh max 1000 BNK loan milega.

**Q5: Reentrancy attack kya hai aur yahan kaise protect kiya?**
> Reentrancy attack mein malicious contract withdraw function ko repeatedly call karta hai balance update hone se pehle. `ReentrancyGuard` (OpenZeppelin) se protect kiya — yeh ek mutex lock lagata hai.

**Q6: Tokens actually kahan hote hain deposit ke baad?**
> Tokens physically `DecentralizedBank` contract ke address pe hote hain. Contract ek internal mapping (`_balances`) maintain karta hai ki kiska kitna hai.

**Q7: Ganache aur Mainnet mein kya fark hai?**
> Ganache local fake blockchain hai — instant transactions, fake ETH, sirf testing ke liye. Mainnet real Ethereum hai jahan real money lagti hai.

**Q8: `transferOwnership` kyu kiya BankToken ka?**
> Loans ke time naye BNK tokens mint karne hote hain. `mint()` function sirf owner call kar sakta hai. Isliye ownership Bank contract ko di taaki woh loans ke liye tokens mint kar sake.

---

*Project: BlockBank — Decentralized Banking DApp*  
*Stack: Solidity + Truffle + React + MetaMask + Ganache*
