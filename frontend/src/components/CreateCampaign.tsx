import React, { useState } from 'react';
import { PlusCircle, Sparkles, Image as ImageIcon, Calendar, Target, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { createCampaignOnChain, extractErrorMessage } from '../services/contract';
import { CampaignCard } from './CampaignCard';
import { Campaign } from '../types';

interface CreateCampaignProps {
  onSuccess: (newCampaignId?: number) => void;
  onCancel: () => void;
}

const PRESET_CATEGORIES = [
  'Clean Water & Sanitation',
  'Healthcare',
  'Education',
  'Disaster Relief',
  'Food Security',
  'Animal Welfare',
  'Environment & Renewable',
  'Community Support',
];

const SAMPLE_IMAGES = [
  {
    label: 'Clean Water',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Hospital & Healthcare',
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Youth STEM Education',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Animal Shelter',
    url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80',
  },
];

export const CreateCampaign: React.FC<CreateCampaignProps> = ({ onSuccess, onCancel }) => {
  const { address, isConnected, isCorrectNetwork, connectWallet, switchNetwork } = useWallet();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(PRESET_CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState(SAMPLE_IMAGES[0].url);
  const [goalEth, setGoalEth] = useState('3.0');
  const [durationDays, setDurationDays] = useState('30');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      connectWallet();
      return;
    }
    if (!isCorrectNetwork) {
      switchNetwork();
      return;
    }

    if (!title.trim() || title.length > 120) {
      setErrorMessage('Please enter a campaign title between 1 and 120 characters.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please enter a detailed description of the fundraising purpose.');
      return;
    }

    const goalNum = parseFloat(goalEth);
    if (isNaN(goalNum) || goalNum <= 0) {
      setErrorMessage('Fundraising goal must be a positive number of ETH.');
      return;
    }

    const daysNum = parseInt(durationDays, 10);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      setErrorMessage('Campaign duration must be between 1 and 365 days.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      setTxHash(null);

      const deadlineTimestamp = Math.floor(Date.now() / 1000) + daysNum * 86400;

      const hash = await createCampaignOnChain({
        title,
        description,
        category,
        imageUrl,
        goalEth,
        deadlineTimestamp,
      });

      setTxHash(hash);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Error creating campaign:', err);
      setErrorMessage(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Preview mock object
  const previewCampaign: Campaign = {
    id: 999,
    title: title || 'Your Inspiring Campaign Title',
    description: description || 'Describe your charity initiative, who it helps, and how funds will be accounted for...',
    category,
    imageUrl: imageUrl || SAMPLE_IMAGES[0].url,
    goal: BigInt(Math.max(1, Math.floor(parseFloat(goalEth || '1') * 1e18))),
    goalEth: goalEth || '1.0',
    deadline: Math.floor(Date.now() / 1000) + (parseInt(durationDays, 10) || 30) * 86400,
    deadlineDate: new Date(Date.now() + (parseInt(durationDays, 10) || 30) * 86400 * 1000).toLocaleDateString(),
    isExpired: false,
    organizer: address || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    totalDonated: 0n,
    totalDonatedEth: '0',
    totalReleased: 0n,
    totalReleasedEth: '0',
    remainingBalance: 0n,
    remainingBalanceEth: '0',
    progressPercent: 0,
    releasedPercent: 0,
    exists: true,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Create a Verifiable Campaign
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Launch a community fundraiser on the KindLedger smart contract. Donors will be able to track every subsequent expenditure.
        </p>
      </div>

      {txHash && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">Campaign Published to Blockchain!</div>
            <p className="text-xs text-emerald-800 mt-1">
              Transaction successfully confirmed. Redirecting to directory...
            </p>
            <div className="font-mono text-[11px] mt-1 bg-white p-2 rounded border border-emerald-200">
              Tx: {txHash}
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Error: </span>
            {errorMessage}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Campaign Title *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Clean Drinking Water for Primary Schools"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <span className="text-[11px] text-slate-400 block text-right">
                {title.length}/100 characters
              </span>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
              >
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Mission Description & Budget Justification *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the urgent need, target beneficiaries, and specifically how funds will be spent and verified..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            {/* Banner Image URL + Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Cover Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              {/* Sample Photo Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
                {SAMPLE_IMAGES.map((img) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => setImageUrl(img.url)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    {img.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Goal & Duration in Days */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Fundraising Goal (ETH) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.01"
                    required
                    value={goalEth}
                    onChange={(e) => setGoalEth(e.target.value)}
                    placeholder="5.0"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ETH
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Duration (Days) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    required
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    placeholder="30"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Days
                  </span>
                </div>
              </div>
            </div>

            {/* Contract Transparency Note */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Organizer Responsibilities & Integrity
              </div>
              <p>
                As the organizer, you will be the only address authorized to release collected funds. 
                Whenever you distribute funds, the smart contract requires you to specify the recipient address and a declared purpose, forming an immutable audit trail.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              {!isConnected ? (
                <button
                  type="button"
                  onClick={connectWallet}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
                >
                  Connect Wallet to Deploy
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Publishing to Chain...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      Publish Campaign On-Chain
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Live Directory Preview</span>
            <span className="text-emerald-600">Card View</span>
          </div>

          <div className="pointer-events-none">
            <CampaignCard campaign={previewCampaign} onSelect={() => {}} />
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 text-xs text-slate-500 leading-relaxed">
            💡 <strong>Tip for Demo:</strong> Once created, your connected wallet becomes the organizer. 
            You can immediately view it under the <em>Organizer Dashboard</em> to test transparent fund payouts to vendor test addresses.
          </div>
        </div>
      </div>
    </div>
  );
};
