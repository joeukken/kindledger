import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Eye,
  AlertTriangle,
  FileCode2,
  Terminal,
  HelpCircle,
  Cpu,
  Layers,
  Copy,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const TransparencyInfo: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-24">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full mb-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Academic Transparency & Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Transparency & Safety Architecture
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-1">
          How KindLedger leverages Ethereum smart contracts to ensure verifiable public charity accounting, 
          along with important cryptographic and real-world boundaries.
        </p>
      </div>

      {/* Critical Safety Notice Box */}
      <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3 shadow-sm">
        <div className="flex items-center gap-2.5 text-amber-900 font-extrabold text-base">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Mandatory Demonstration & Safety Disclaimers
        </div>
        <ul className="text-xs sm:text-sm text-amber-900 space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong>Local Test Funds Only:</strong> This project is designed exclusively to run on a local test Ethereum network (Hardhat). 
            Do <em>NOT</em> deploy this contract to Ethereum mainnet or transfer real cryptocurrencies.
          </li>
          <li>
            <strong>Smart Contract Is Not Audited:</strong> This smart contract was developed for college educational demonstrations 
            and has not undergone an independent professional security audit. It is unsuitable for production financial operations.
          </li>
          <li>
            <strong>Zero Seed Phrase Policy:</strong> KindLedger will <em>never</em> ask you for a seed phrase, recovery phrase, or mainnet private key. 
            All signing is handled locally in your browser through standard web3 providers (e.g., MetaMask).
          </li>
        </ul>
      </div>

      {/* The 3 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Non-Custodial Vaults</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Donations are never stored on a centralized server or corporate bank account. 
            Funds remain locked in the EVM smart contract until the designated organizer releases them.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Immutable Expenditure</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Organizers cannot withdraw funds silently. Every payout function call requires a declared recipient 
            address and justification, generating an unalterable on-chain event log.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Public Verification</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Anyone in the world can inspect the full chronological ledger of donations and disbursements, 
            even without a crypto wallet, fostering complete donor trust.
          </p>
        </div>
      </div>

      {/* Deep Dive Section 1: The Oracle & Real-World Spending Boundary */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          The "Real-World Boundary": What Blockchains Can & Cannot Prove
        </h2>
        <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
          <p>
            In blockchain system architecture, a fundamental principle is that smart contracts only possess 
            cryptographic certainty over state transitions occurring <strong>on the blockchain itself</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-800 block mb-1">What the Blockchain Proves:</span>
              <ul className="list-disc list-inside text-emerald-900 space-y-1">
                <li>Exact block timestamp of donation and payout</li>
                <li>Exact mathematical amount transferred</li>
                <li>Cryptographic sender and recipient addresses</li>
                <li>The declared purpose string entered by the organizer</li>
              </ul>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs">
              <span className="font-bold text-rose-800 block mb-1">What the Blockchain Cannot Prove:</span>
              <ul className="list-disc list-inside text-rose-900 space-y-1">
                <li>Whether the vendor actually shipped physical goods</li>
                <li>Quality or legitimacy of delivered supplies</li>
                <li>How the recipient spends physical fiat cash offline</li>
                <li>Real-world legal identity behind an address</li>
              </ul>
            </div>
          </div>
          <p>
            KindLedger provides <em>financial transparency</em> and <em>verifiable disbursement trails</em>, 
            eliminating hidden administrative skimming. However, community trust, real-world inspections, and off-chain receipts 
            remain essential complements to on-chain technology.
          </p>
        </div>
      </div>

      {/* Deep Dive Section 2: Pseudonymity vs Anonymity */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-600" />
          Pseudonymity vs. Anonymity: How Donor Privacy Works
        </h2>
        <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
          <p>
            When a user marks their donation as "Anonymous" in the KindLedger user interface:
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <p>
              ✅ <strong>Web UI Layer:</strong> Their chosen name is displayed as <em>"Anonymous Supporter"</em> in the campaign cards and chronological feed.
            </p>
            <p>
              ⚠️ <strong>Blockchain Layer:</strong> Their public Ethereum wallet address (e.g. <code className="font-mono">0x70997970C51812dc3A010C7d01b50e0d17dc79C8</code>), 
              the amount donated, and the transaction hash are permanently and publicly broadcast to every node on the network.
            </p>
          </div>
          <p className="text-xs text-slate-500 italic">
            Blockchains like Ethereum are <strong>pseudonymous</strong>, not anonymous. While a wallet address does not inherently disclose a user's legal identity, 
            network analysis and on-chain explorers can trace transaction graphs.
          </p>
        </div>
      </div>

      {/* Deep Dive Section 3: Smart Contract Security Mechanics */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-emerald-600" />
          Smart Contract Security Best Practices
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
            <span className="font-bold text-slate-800">OpenZeppelin ReentrancyGuard:</span>
            <p className="text-slate-600">
              Both the <code className="font-mono">donate()</code> and <code className="font-mono">releaseFunds()</code> functions 
              are protected with the <code className="font-mono">nonReentrant</code> modifier, preventing malicious recipient contracts 
              from executing reentrant callback attacks.
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
            <span className="font-bold text-slate-800">Checks-Effects-Interactions Pattern:</span>
            <p className="text-slate-600">
              Internal state updates (deducting campaign balance and incrementing total released) always occur 
              <em>before</em> sending native ETH via low-level call, ensuring atomic accounting.
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
            <span className="font-bold text-slate-800">Zero Administrator Backdoors:</span>
            <p className="text-slate-600">
              There is no owner withdrawal function, platform fee deduction, or hidden treasury drain. 
              Only the organizer of a specific campaign can release its own collected funds.
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
            <span className="font-bold text-slate-800">Strict Math & Parameter Checks:</span>
            <p className="text-slate-600">
              Payouts can never exceed <code className="font-mono">totalDonated - totalReleased</code>. 
              Zero-value donations, expired campaigns, and zero addresses are strictly rejected.
            </p>
          </div>
        </div>
      </div>

      {/* Classroom Setup Guide */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full mb-1">
            <Terminal className="w-3.5 h-3.5" /> Classroom Demonstration Guide
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            How to Run & Connect MetaMask
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure MetaMask to interact with your local Hardhat node in 2 minutes.
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-900 text-xs font-black flex items-center justify-center">
                1
              </span>
              Start Local Hardhat Node & Deploy
            </div>
            <p className="text-slate-300 text-xs">
              Open terminal in project root and run:
            </p>
            <pre className="p-3 rounded-xl bg-black/60 font-mono text-xs text-emerald-300 overflow-x-auto">
              npx hardhat node
            </pre>
            <p className="text-slate-300 text-xs">
              In a second terminal, deploy and seed the contract:
            </p>
            <pre className="p-3 rounded-xl bg-black/60 font-mono text-xs text-emerald-300 overflow-x-auto">
              npx hardhat run scripts/deploy.js --network localhost
            </pre>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-900 text-xs font-black flex items-center justify-center">
                2
              </span>
              Add Hardhat Network in MetaMask
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-slate-300">
              <div className="bg-black/40 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Network Name:</span>
                Hardhat Local
              </div>
              <div className="bg-black/40 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">RPC URL:</span>
                http://127.0.0.1:8545
              </div>
              <div className="bg-black/40 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Chain ID:</span>
                31337
              </div>
              <div className="bg-black/40 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Currency Symbol:</span>
                ETH
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-900 text-xs font-black flex items-center justify-center">
                3
              </span>
              Import Hardhat Test Accounts into MetaMask
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              In MetaMask, click <em>Import Account</em> and paste one of Hardhat's default test private keys 
              (pre-funded with 10,000 local test ETH):
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">
                    Account #0 (Organizer of Seeded Campaigns 0 & 2):
                  </span>
                  <span className="text-slate-300 text-[11px]">
                    0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
                  </span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
                      'acc0'
                    )
                  }
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs text-white"
                >
                  {copiedKey === 'acc0' ? 'Copied!' : 'Copy Key'}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">
                    Account #1 (Organizer of Seeded Campaigns 1 & 3):
                  </span>
                  <span className="text-slate-300 text-[11px]">
                    0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
                  </span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
                      'acc1'
                    )
                  }
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs text-white"
                >
                  {copiedKey === 'acc1' ? 'Copied!' : 'Copy Key'}
                </button>
              </div>
            </div>

            <div className="text-[11px] text-rose-300 bg-rose-950/60 p-2.5 rounded-xl border border-rose-800">
              🚨 <strong>NEVER use these well-known test private keys on mainnet or send real funds to them.</strong> Anyone can access them.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
