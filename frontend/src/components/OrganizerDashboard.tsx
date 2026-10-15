import React, { useState, useMemo } from 'react';
import { isAddress } from 'ethers';
import {
  LayoutDashboard,
  Send,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Receipt,
  PlusCircle,
  Wallet,
  Clock,
  ArrowUpRight,
  ExternalLink,
  X,
  Building,
  Info,
} from 'lucide-react';
import { Campaign } from '../types';
import { useWallet } from '../context/WalletContext';
import { releaseFundsOnChain, extractErrorMessage } from '../services/contract';
import { shortenAddress, formatEth } from '../utils/formatters';

interface OrganizerDashboardProps {
  campaigns: Campaign[];
  onRefresh: () => void;
  onCreateNew: () => void;
  onSelectCampaign: (id: number) => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  campaigns,
  onRefresh,
  onCreateNew,
  onSelectCampaign,
}) => {
  const { address, isConnected, isCorrectNetwork, connectWallet, switchNetwork, refreshBalance } = useWallet();

  // Filter campaigns owned by the currently connected wallet
  const myCampaigns = useMemo(() => {
    if (!address) return [];
    return campaigns.filter(
      (c) => c.organizer.toLowerCase() === address.toLowerCase()
    );
  }, [campaigns, address]);

  // Aggregate stats for organizer
  const myStats = useMemo(() => {
    let totalRaisedWei = 0n;
    let totalReleasedWei = 0n;
    let totalRemainingWei = 0n;

    myCampaigns.forEach((c) => {
      totalRaisedWei += c.totalDonated;
      totalReleasedWei += c.totalReleased;
      totalRemainingWei += c.remainingBalance;
    });

    return {
      count: myCampaigns.length,
      totalRaisedEth: formatEth(totalRaisedWei),
      totalReleasedEth: formatEth(totalReleasedWei),
      totalRemainingEth: formatEth(totalRemainingWei),
    };
  }, [myCampaigns]);

  // Payout modal state
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSuccessTx, setPayoutSuccessTx] = useState<string | null>(null);

  const openPayoutModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setRecipientAddress('');
    setPayoutAmount('');
    setPurpose('');
    setPayoutError(null);
    setPayoutSuccessTx(null);
  };

  const closePayoutModal = () => {
    setSelectedCampaign(null);
    setPayoutError(null);
    setPayoutSuccessTx(null);
  };

  const handleMaxAmount = () => {
    if (selectedCampaign) {
      setPayoutAmount(selectedCampaign.remainingBalanceEth);
    }
  };

  const handleReleaseFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    if (!isAddress(recipientAddress.trim())) {
      setPayoutError('Please provide a valid Ethereum recipient address (0x...).');
      return;
    }

    const amt = parseFloat(payoutAmount);
    if (isNaN(amt) || amt <= 0) {
      setPayoutError('Please enter a valid payout amount greater than 0 ETH.');
      return;
    }

    const maxAmt = parseFloat(selectedCampaign.remainingBalanceEth);
    if (amt > maxAmt) {
      setPayoutError(`Amount exceeds available campaign vault balance (${maxAmt} ETH).`);
      return;
    }

    if (!purpose.trim() || purpose.trim().length < 5) {
      setPayoutError('Please provide a clear justification / invoice purpose (at least 5 characters).');
      return;
    }

    try {
      setSubmittingPayout(true);
      setPayoutError(null);
      setPayoutSuccessTx(null);

      const txHash = await releaseFundsOnChain({
        campaignId: selectedCampaign.id,
        recipientAddress,
        amountEth: payoutAmount,
        purpose,
      });

      setPayoutSuccessTx(txHash);
      await refreshBalance();
      onRefresh();
    } catch (err: any) {
      console.error('Error releasing funds:', err);
      setPayoutError(extractErrorMessage(err));
    } finally {
      setSubmittingPayout(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full mb-1">
            <LayoutDashboard className="w-3.5 h-3.5" /> Fiduciary Management
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Organizer Dashboard
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">
            Manage your charity campaigns, review received donations, and disburse verifiable payouts to project vendors.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Campaign
        </button>
      </div>

      {/* Wallet State Callout */}
      {!isConnected ? (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">Connect Your Organizer Wallet</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Connect your MetaMask wallet to view campaigns you created and access the secure fund release tools.
            </p>
          </div>
          <button
            onClick={connectWallet}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          {/* Organizer Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">My Campaigns</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {myStats.count}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
              <span className="text-xs text-emerald-700 font-medium">Total Donations Received</span>
              <div className="text-2xl font-bold font-mono text-emerald-900 mt-1">
                {myStats.totalRaisedEth} ETH
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 shadow-sm">
              <span className="text-xs text-blue-700 font-medium">Total Funds Distributed</span>
              <div className="text-2xl font-bold font-mono text-blue-900 mt-1">
                {myStats.totalReleasedEth} ETH
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
              <span className="text-xs text-amber-800 font-medium">Available to Release</span>
              <div className="text-2xl font-bold font-mono text-amber-950 mt-1">
                {myStats.totalRemainingEth} ETH
              </div>
            </div>
          </div>

          {/* Hardhat Account #0 Switcher Helper */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Connected as: <code className="font-mono font-bold text-slate-800">{address}</code>
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              💡 <em>Classroom Tip:</em> Seeded campaigns 0 & 2 belong to deployer Account #0 (<code className="font-mono">0xf39F...2266</code>).
            </div>
          </div>

          {/* Organizer's Campaigns List */}
          {myCampaigns.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">
                Campaigns Under Your Stewardship ({myCampaigns.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCampaigns.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {c.category}
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          Campaign #{c.id}
                        </span>
                      </div>

                      <h3
                        onClick={() => onSelectCampaign(c.id)}
                        className="font-bold text-lg text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
                      >
                        {c.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {c.description}
                      </p>

                      {/* Financial breakdown */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Raised:</span>
                          <span className="font-bold text-emerald-700 font-mono">
                            {c.totalDonatedEth} ETH
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Paid Out:</span>
                          <span className="font-bold text-blue-700 font-mono">
                            {c.totalReleasedEth} ETH
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Unspent:</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {c.remainingBalanceEth} ETH
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => onSelectCampaign(c.id)}
                        className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-center"
                      >
                        View Public Ledger
                      </button>

                      <button
                        onClick={() => openPayoutModal(c)}
                        disabled={c.remainingBalance === 0n}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Disburse Funds
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">No campaigns found for this account</h3>
                <p className="text-slate-500 text-xs mt-1">
                  You haven't launched any campaigns from this address yet, or you are connected with a different test account.
                </p>
              </div>
              <button
                onClick={onCreateNew}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all"
              >
                Launch Your First Campaign
              </button>
            </div>
          )}
        </>
      )}

      {/* Fund Release Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative">
            <button
              onClick={closePayoutModal}
              className="absolute top-6 right-6 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Smart Contract Expenditure
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Disburse Campaign Funds
              </h2>
              <p className="text-xs text-slate-500">
                Releasing from: <span className="font-semibold text-slate-800">{selectedCampaign.title}</span>
              </p>
            </div>

            {/* Available Balance Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Available Campaign Vault:</span>
              <span className="font-mono font-bold text-emerald-800 text-sm">
                {selectedCampaign.remainingBalanceEth} ETH
              </span>
            </div>

            {payoutSuccessTx ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Payout Confirmed on Chain!
                </div>
                <p className="text-xs text-emerald-900">
                  Funds have been transferred to the recipient address and an immutable audit record was published to the ledger.
                </p>
                <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-emerald-200 break-all">
                  Tx: {payoutSuccessTx}
                </div>
                <button
                  onClick={closePayoutModal}
                  className="w-full mt-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleReleaseFunds} className="space-y-4">
                {payoutError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-800">
                    {payoutError}
                  </div>
                )}

                {/* Recipient Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Recipient / Vendor Address (0x...) *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="0x90F79bf6EB2c4f870365E785982E1f101E93b906"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Ensure this is an Ethereum account on your local Hardhat network.
                  </span>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-slate-800">
                      Disbursement Amount (ETH) *
                    </label>
                    <button
                      type="button"
                      onClick={handleMaxAmount}
                      className="font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      Use Max ({selectedCampaign.remainingBalanceEth} ETH)
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.0001"
                      required
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder="1.0"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ETH
                    </span>
                  </div>
                </div>

                {/* Purpose / Invoice Justification */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Expenditure Purpose & Invoice Reference *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Purchased 2x Solar Submersible Pump Units from AquaTech Solar Ltd (Invoice #AT-8821)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    This text is permanently recorded on-chain in the event log for public transparency.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closePayoutModal}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPayout}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submittingPayout ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing & Transferring...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Execute Payout
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
