# KindLedger: Transparent Charity Donations

> **College Capstone & Demonstration Project**  
> An Ethereum smart-contract-powered donation and expenditure tracking web application.

KindLedger is built to eliminate the lack of visibility in traditional charity fundraising. It replaces blind trust with cryptographic certainty by storing all fundraising campaigns, donor contributions, and fund disbursements directly on-chain on a local Ethereum network.

---

## ⚠️ Academic Demonstration Notice

- **Demo Network Only:** This application is configured exclusively for a local Hardhat test network (Chain ID: `31337`).
- **No Real Funds:** All transactions use local test ETH with zero real-world monetary value. Never deploy this contract to Ethereum mainnet or transfer real funds to these addresses.
- **Security Notice:** The smart contract has been developed for educational demonstration purposes and has **not** undergone an independent third-party security audit.
- **Never Share Seed Phrases:** KindLedger will **never** request your seed phrase, recovery passphrase, or mainnet private keys.

---

## 🌟 Key Features

### 1. Robust Smart Contract Architecture (`contracts/KindLedger.sol`)
- **OpenZeppelin Security Primitives:** Uses OpenZeppelin's `ReentrancyGuard` to defend all payable and fund transfer functions against reentrancy attacks.
- **Checks-Effects-Interactions Pattern:** All internal accounting and balance deductions occur strictly *before* native ETH is transferred to recipients.
- **Fiduciary Ownership Controls:** Only the specific organizer who created a campaign can trigger disbursements for that campaign.
- **No Hidden Administrative Keys:** No owner tax, platform fee, or privileged admin backdoor withdrawal function exists.
- **Immutable Audit Log:** Emits `CampaignCreated`, `DonationReceived`, and `FundsReleased` events for real-time indexing and historical transparency.

### 2. Full-Featured Responsive Web Interface (`frontend/`)
- **Campaign Directory:**
  - Real-time search across campaign titles, descriptions, categories, and organizer addresses.
  - Category filters (*Clean Water, Healthcare, Education, Animal Welfare, Food Security*).
  - Financial metric cards showing Total Raised, Total Distributed, and Remaining Vault Balance.
  - Dual progress tracking (% of fundraising goal raised, and % of raised funds disbursed).
  - Read-only fallback support: Visitors can browse campaigns and inspect records even without MetaMask installed or connected.
- **Campaign Details & Public Ledger:**
  - Complete campaign description and organizer verification.
  - Direct donation widget with preset amounts (`0.05`, `0.1`, `0.5`, `1.0` ETH) and custom inputs.
  - **Pseudonymity Disclosure:** Explains clearly that selecting "Anonymous" in the web UI masks the user's nickname in the interface, but the Ethereum wallet address and transaction amount remain permanently public on-chain.
  - **Chronological Transaction Stream:** Real-time timeline of every donation received and payout disbursed, including timestamps, amounts, recipient addresses, and transaction hashes.
- **Create Campaign:**
  - Live interactive card preview updating in real time as the user types.
  - Input validation for title length, positive goal, and future deadlines.
  - Instant deployment to the smart contract through MetaMask.
- **Organizer Dashboard:**
  - Displays all campaigns stewardship-managed by the connected wallet.
  - Aggregate metrics (*Total Donations Received*, *Total Funds Distributed*, *Available to Release*).
  - **Fund Disbursement Modal:** Allows organizers to send ETH directly to project vendors/contractors by specifying the recipient address, amount (up to the remaining balance), and invoice justification.
- **Transparency & Safety Guide:**
  - In-depth architectural explanation of non-custodial smart contracts.
  - Clarification on the **"Real-World Boundary"**: The blockchain mathematically proves that funds were transferred to a recipient address, but cannot verify how the recipient spends physical cash offline.
  - Step-by-step classroom setup guide for MetaMask and Hardhat test accounts.

---

## 🛠️ Tech Stack

- **Smart Contracts:** Solidity `^0.8.24`, OpenZeppelin Contracts `v5`
- **Blockchain Tooling:** Hardhat `v2`, Ethers.js `v6`, Chai & Mocha
- **Frontend App:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Wallet Connection:** MetaMask browser extension via Ethers `BrowserProvider` with automated network switching and read-only JSON-RPC fallback.

---

## 🚀 Quickstart Guide (Run Locally)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18, v20, or v22+ installed)
- [MetaMask](https://metamask.io/) browser extension installed in your browser.

---

### Step 1: Install Dependencies

From the project root directory, install the required smart contract and frontend packages:

```bash
# Install root Hardhat dependencies
npm install

# Install frontend dependencies
npm --prefix frontend install
```

---

### Step 2: Run Smart Contract Unit Tests

Verify that all smart contract tests pass:

```bash
npm run test
```

Expected output:
```
  KindLedger Smart Contract
    Campaign Creation
      √ should allow creating a valid campaign
      √ should reject campaign with past deadline or zero goal
    Donations
      √ should accept donations and update campaign totals
      √ should allow anonymous donation fallback nickname
      √ should reject zero ETH donation
    Fund Release & Payouts
      √ should allow organizer to release funds and send ETH to recipient
      √ should reject unauthorized callers attempting to release funds
      √ should reject payout exceeding remaining balance
      √ should reject payout with zero amount or empty purpose

  9 passing
```

---

### Step 3: Start the Local Hardhat Blockchain

Open a new terminal window in the project root and launch the local Ethereum node:

```bash
npm run chain
```

*Keep this terminal running.* Hardhat will print 20 test accounts with 10,000 test ETH each and start an RPC server listening at `http://127.0.0.1:8545`.

---

### Step 4: Deploy & Seed Demonstration Campaigns

In a second terminal window, deploy the smart contract and seed sample campaigns with donations and payouts:

```bash
npm run deploy
```

This deploys `KindLedger.sol`, populates 4 realistic campaigns (*Clean Water*, *Hospital Equipment*, *STEM Lab*, *Stray Animal Rescue*), records initial donations and payouts, and automatically exports the contract address and ABI to `frontend/src/contracts/`.

---

### Step 5: Configure MetaMask for Localhost

1. Open your **MetaMask** extension.
2. Click the network selector in the top-left corner and click **Add Network** -> **Add a network manually**.
3. Enter the following network details:
   - **Network Name:** `Hardhat Localhost`
   - **New RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
4. Click **Save** and switch to `Hardhat Localhost`.

#### Import Test Accounts:
Import at least one of the pre-funded test accounts into MetaMask using its private key:

- **Account #0 (Organizer of Seeded Campaigns 0 & 2):**
  - Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
  - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Account #1 (Organizer of Seeded Campaigns 1 & 3):**
  - Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
  - Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- **Account #2 (Donor):**
  - Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
  - Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

*(⚠️ Note: These are standard well-known Hardhat test keys. Never send real money to them!)*

---

### Step 6: Start the Frontend Application

In your second terminal, start the Vite development server:

```bash
npm run frontend:dev
```

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🧪 Testing the User Flows in the Demonstration

1. **Browse Causes:** Without connecting a wallet, explore the Directory, search for keywords like `"Water"`, filter categories, and click **View Ledger & Donate** to inspect existing records.
2. **Donate:** Connect MetaMask using Account #2 (Donor). Go to any campaign, enter an amount (e.g. `0.2` ETH), optionally write a cheer message, and submit the transaction. Observe the balance update and see your donation appear in the on-chain ledger feed with its transaction hash.
3. **Disburse Funds:** Switch MetaMask to Account #0 (`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`). Click **Organizer Dashboard**. Notice the campaigns owned by this account. Click **Disburse Funds**, enter a vendor recipient address (e.g., Account #3 `0x90F79bf6EB2c4f870365E785982E1f101E93b906`), an amount, and an invoice note (e.g., `"Purchased 150 water filter replacement cartridges"`). Submit the transaction and observe the instant on-chain balance update.
4. **Create a New Campaign:** Go to **Start Campaign**, fill in the details with the real-time preview, and publish it on-chain!

---

## 📁 Project Structure

```
.
├── contracts/
│   └── KindLedger.sol            # Smart contract with ReentrancyGuard & transparent accounting
├── scripts/
│   └── deploy.js                 # Deployment & seed script populating demo data & exporting ABI
├── test/
│   └── KindLedger.test.js        # Comprehensive Hardhat unit test suite (9 test cases)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx        # Navigation, network badge, and wallet connect
│   │   │   ├── DemoBanner.tsx    # Academic demo warning notice
│   │   │   ├── CampaignCard.tsx  # Campaign directory card with dual progress bars
│   │   │   ├── CampaignDirectory.tsx # Search, filter, and aggregate statistics
│   │   │   ├── CampaignDetails.tsx   # Campaign view, donation widget & ledger feed
│   │   │   ├── CreateCampaign.tsx    # Campaign creator with live card preview
│   │   │   ├── OrganizerDashboard.tsx # Organizer payout execution modal
│   │   │   └── TransparencyInfo.tsx  # Architecture, boundaries & setup instructions
│   │   ├── context/
│   │   │   └── WalletContext.tsx # Ethers v6 wallet state, auto-switch to 31337
│   │   ├── services/
│   │   │   └── contract.ts       # Smart contract methods & event queries
│   │   ├── utils/
│   │   │   └── formatters.ts     # Formatting helpers for ETH, dates, and addresses
│   │   ├── types.ts              # Data contracts and TypeScript interfaces
│   │   ├── App.tsx               # Primary screen coordinator
│   │   └── main.tsx              # React DOM entrypoint
│   ├── package.json              # Frontend dependencies
│   ├── tailwind.config.js        # Tailwind CSS styling config
│   └── vite.config.ts            # Vite build setup
├── hardhat.config.js             # Hardhat network & compiler configuration
└── package.json                  # Root runner scripts
```

---

## 📜 License
MIT License. Created for college demonstration and educational purposes.
