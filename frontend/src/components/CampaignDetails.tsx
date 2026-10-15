import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Heart,
  HelpCircle,
  History,
  Lock,
  Receipt,
  Send,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import { Campaign, Donation, Payout, TimelineEvent } from '../types';
import { useWallet } from '../context/WalletContext';
import {
  fetchCampaignDetails,
  donateToCampaignOnChain,
  extractErrorMessage,
} from '../services/contract';
import { shortenAddress, getTimeRemaining, formatEth } from '../utils/formatters';

interface CampaignDetailsProps {
  campaignId: number;
  onBack: () => void;
  onDonationSuccess: () => void;
}

export const CampaignDetails: React.FC<CampaignDetailsProps> = ({
  campaignId,
  onBack,
  onDonationSuccess,
}) => {
  const { address, isConnected, isCorrectNetwork, connectWallet, switchNetwork, refreshBalance } = useWallet();

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'donations' | 'payouts'>('all');

  // Donation form state
  const [donationAmount, setDonationAmount] = useState('0.1');
  const [donorNickname, setDonorNickname] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [submittingDonation, setSubmittingDonation] = useState(false);
  const [txHashResult, setTxHashResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchCampaignDetails(campaignId);
      setCampaign(data.campaign);
      setTimeline(data.timeline);
    } catch (err) {
      console.error('Error fetching campaign details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [campaignId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      connectWallet();
      return;
    }
    if (!isCorrectNetwork) {
      switchNetwork();
      return;
    }

    const amountNum = parseFloat(donationAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage('Please enter a valid donation amount greater than 0 ETH.');
      return;
    }

    try {
      setSubmittingDonation(true);
      setErrorMessage(null);
      setTxHashResult(null);

      const chosenName = isAnonymous
        ? 'Anonymous Supporter'
        : donorNickname.trim() || 'Generous Supporter';

      const hash = await donateToCampaignOnChain({
        campaignId,
        amountEth: donationAmount,
        donorNickname: chosenName,
        message,
      });

      setTxHashResult(hash);
      setDonationAmount('0.1');
      setMessage('');
      setDonorNickname('');
      await refreshBalance();
      await loadData();
      onDonationSuccess();
    } catch (err: any) {
      console.error('Donation error:', err);
      setErrorMessage(extractErrorMessage(err));
    } finally {
      setSubmittingDonation(false);
    }
  };

  if (loading || !campaign) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 font-medium">Fetching on-chain records from contract...</p>
      </div>
    );
  }

  const timeRemaining = getTimeRemaining(campaign.deadline);
  const filteredTimeline = timeline.filter((item) => {
    if (filterType === 'all') return true;
    if (filterType === 'donations') return item.type === 'donation';
    if (filterType === 'payouts') return item.type === 'payout';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Navigation Breadcrumb */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Campaign Directory
      </button>

      {/* Main Campaign Hero Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="relative h-72 sm:h-96 w-full bg-slate-900">
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          {/* Hero Overlay Details */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md border border-white/20">
                {campaign.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-black/40 backdrop-blur-md text-emerald-300 border border-white/10">
                Campaign ID: #{campaign.id}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
                  timeRemaining.isExpired ? 'bg-rose-500/80 text-white' : 'bg-emerald-500/80 text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                {timeRemaining.text}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
              {campaign.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>Organizer: {shortenAddress(campaign.organizer, 6)}</span>
                <button
                  onClick={() => handleCopy(campaign.organizer)}
                  className="p-1 hover:text-white transition-colors"
                  title="Copy address"
                >
                  {copiedAddress === campaign.organizer ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Deadline: {campaign.deadlineDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Stat Cards */}
        <div className="p-6 sm:p-8 bg-slate-50/50 border-t border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <span className="text-xs text-slate-500 block font-medium">Fundraising Goal</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">
                {campaign.goalEth} <span className="text-xs text-slate-400">ETH</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-sm">
              <span className="text-xs text-emerald-700 block font-medium">Total Raised</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-900 mt-1">
                {campaign.totalDonatedEth} <span className="text-xs text-emerald-600">ETH</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 mt-0.5 block">
                {campaign.progressPercent}% of goal
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 shadow-sm">
              <span className="text-xs text-blue-700 block font-medium">Distributed to Causes</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-blue-900 mt-1">
                {campaign.totalReleasedEth} <span className="text-xs text-blue-600">ETH</span>
              </div>
              <span className="text-[11px] font-bold text-blue-700 mt-0.5 block">
                {campaign.releasedPercent}% of raised
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <span className="text-xs text-slate-500 block font-medium">Remaining in Vault</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-slate-800 mt-1">
                {campaign.remainingBalanceEth} <span className="text-xs text-slate-400">ETH</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Held in smart contract</span>
            </div>
          </div>

          {/* Dual Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Goal Progress ({campaign.progressPercent}%)</span>
              <span>Distribution Ratio ({campaign.releasedPercent}%)</span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, campaign.progressPercent)}%` }}
                title="Raised"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Description & Ledger Feed on Left, Donation Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans): Mission details & Chronological Ledger */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Campaign Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              About This Campaign
            </h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {campaign.description}
            </p>

            {/* Smart Contract Guarantee Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                How KindLedger Protects Donated Funds
              </div>
              <p>
                Donated funds are held non-custodially inside the smart contract until the organizer submits a 
                formal payout transaction. Every payout must declare a specific recipient address and verified purchase purpose. 
                Funds cannot be withdrawn by anyone other than the organizer, and payouts can never exceed available donations.
              </p>
            </div>
          </div>

          {/* Chronological Ledger Audit Feed */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-600" />
                  On-Chain Transaction Ledger
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chronological public ledger of all incoming donations and outgoing distributions.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({timeline.length})
                </button>
                <button
                  onClick={() => setFilterType('donations')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterType === 'donations' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Donations
                </button>
                <button
                  onClick={() => setFilterType('payouts')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterType === 'payouts' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Payouts
                </button>
              </div>
            </div>

            {/* Educational Real-World Spending Disclaimer */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Real-World Boundary Notice: </span>
                Smart contracts verify that the Ethereum transfer took place and was sent to the designated address with the stated purpose. 
                However, smart contracts alone <strong>cannot mathematically verify how the recipient spends physical funds offline</strong> in the physical world. 
                Transparency provides open accountability, but donor due diligence remains vital.
              </div>
            </div>

            {/* Timeline Stream */}
            {filteredTimeline.length > 0 ? (
              <div className="space-y-4">
                {filteredTimeline.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      item.type === 'donation'
                        ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-200'
                        : 'bg-blue-50/30 border-blue-100 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {item.type === 'donation' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Donation Received
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Funds Distributed / Payout
                          </span>
                        )}
                        <span className="text-xs text-slate-500">{item.dateStr}</span>
                      </div>

                      <div className="text-sm font-bold font-mono">
                        {item.type === 'donation' ? (
                          <span className="text-emerald-700">+{item.amountEth} ETH</span>
                        ) : (
                          <span className="text-blue-700">-{item.amountEth} ETH</span>
                        )}
                      </div>
                    </div>

                    {/* Parties and details */}
                    {item.type === 'donation' ? (
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            {item.donorNickname}
                          </span>
                          <span className="font-mono text-slate-400">
                            ({shortenAddress(item.donor)})
                          </span>
                          <button
                            onClick={() => handleCopy(item.donor)}
                            className="text-slate-400 hover:text-slate-600"
                            title="Copy donor address"
                          >
                            {copiedAddress === item.donor ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {item.message && (
                          <p className="text-slate-700 italic bg-white/70 p-2.5 rounded-xl border border-slate-100">
                            "{item.message}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">Recipient:</span>
                          <span className="font-mono text-blue-800 font-medium">
                            {shortenAddress(item.recipient, 6)}
                          </span>
                          <button
                            onClick={() => handleCopy(item.recipient)}
                            className="text-slate-400 hover:text-slate-600"
                            title="Copy recipient address"
                          >
                            {copiedAddress === item.recipient ? (
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
                          <span className="font-semibold text-slate-800 block mb-0.5">Stated Purpose & Invoice:</span>
                          <p className="text-slate-700 font-mono text-[11px]">{item.purpose}</p>
                        </div>
                      </div>
                    )}

                    {/* Transaction Hash */}
                    {item.txHash && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span>Tx Hash:</span>
                          <span className="text-slate-600">{shortenAddress(item.txHash, 8)}</span>
                          <button
                            onClick={() => handleCopy(item.txHash!)}
                            className="hover:text-slate-700"
                            title="Copy Tx Hash"
                          >
                            {copiedAddress === item.txHash ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500 font-sans font-medium">
                          Local Hardhat Block
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Receipt className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-sm">No transaction records found in this category yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 span): Donate Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-lg sticky top-24 space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Direct On-Chain Giving
              </div>
              <h3 className="text-xl font-bold text-slate-900">Donate to this Cause</h3>
              <p className="text-xs text-slate-500">
                100% of your donation is received into the campaign's smart contract.
              </p>
            </div>

            {/* Success Modal / Toast */}
            {txHashResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-2 animate-in fade-in">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Donation Successfully Confirmed!
                </div>
                <p>Thank you for your generous contribution. Your transaction is now permanently stored on the local ledger.</p>
                <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-emerald-200 break-all">
                  Hash: {txHashResult}
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Transaction Failed
                </div>
                <p>{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleDonate} className="space-y-4">
              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Donation Amount (ETH)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.001"
                    required
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="0.1"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-lg text-slate-900"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                    ETH
                  </span>
                </div>

                {/* Preset Amount Pills */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {['0.05', '0.1', '0.5', '1.0'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDonationAmount(preset)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        donationAmount === preset
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {preset} ETH
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Your Name / Nickname
                </label>
                <input
                  type="text"
                  disabled={isAnonymous}
                  value={isAnonymous ? 'Anonymous Supporter' : donorNickname}
                  onChange={(e) => setDonorNickname(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isAnonymous ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white'
                  }`}
                />
              </div>

              {/* Anonymous Toggle with Required Safety Clarification */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Display as Anonymous in UI
                    </span>
                    <span className="text-[11px] text-slate-500 block leading-tight">
                      Hides your real name from the donor list shown in this app.
                    </span>
                  </div>
                </label>

                {/* Explicit Transparency Warning */}
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-tight">
                  <span className="font-bold">⚠️ Transparency Disclosure: </span>
                  This option only hides your nickname in the web UI. 
                  Your Ethereum wallet address and transaction amount are <strong>permanently public on the blockchain</strong> and cannot be made completely private.
                </div>
              </div>

              {/* Encouragement Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Message of Support (Optional)
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Words of encouragement for the team..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Submit CTA */}
              {!isConnected ? (
                <button
                  type="button"
                  onClick={connectWallet}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet to Donate
                </button>
              ) : !isCorrectNetwork ? (
                <button
                  type="button"
                  onClick={switchNetwork}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Switch to Hardhat Network (31337)
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submittingDonation || timeRemaining.isExpired}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingDonation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Confirming on Chain...
                    </>
                  ) : timeRemaining.isExpired ? (
                    'Campaign Concluded'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send {donationAmount || '0'} ETH Donation
                    </>
                  )}
                </button>
              )}
            </form>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1 text-center">
              <div>Demonstration network only • No real funds required</div>
              <div>Never input real private keys or seed phrases</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
