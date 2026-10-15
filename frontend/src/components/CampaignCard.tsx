import React, { useState } from 'react';
import { ArrowUpRight, Clock, Copy, Check, Users, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Campaign } from '../types';
import { shortenAddress, getTimeRemaining } from '../utils/formatters';

interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (campaignId: number) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onSelect }) => {
  const [copied, setCopied] = useState(false);
  const timeInfo = getTimeRemaining(campaign.deadline);

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(campaign.organizer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isGoalReached = campaign.totalDonated >= campaign.goal;

  return (
    <div
      onClick={() => onSelect(campaign.id)}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Banner Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={campaign.imageUrl}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
            {campaign.category}
          </span>
          <div className="flex items-center gap-1.5">
            {isGoalReached && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                <Check className="w-3 h-3" /> Goal Met
              </span>
            )}
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm ${
                timeInfo.isExpired
                  ? 'bg-rose-500/90 text-white'
                  : 'bg-black/60 text-white'
              }`}
            >
              <Clock className="w-3 h-3 inline mr-1" />
              {timeInfo.text}
            </span>
          </div>
        </div>

        {/* Floating ID badge */}
        <div className="absolute bottom-3 left-3 text-[11px] font-mono px-2 py-0.5 rounded bg-black/60 text-slate-200">
          Campaign #{campaign.id}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-2">
            {campaign.title}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {campaign.description}
          </p>

          {/* Organizer info */}
          <div className="flex items-center justify-between py-2 border-y border-slate-100 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Organizer:
            </span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-slate-700 font-medium">
                {shortenAddress(campaign.organizer)}
              </span>
              <button
                onClick={copyAddress}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                title="Copy Address"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-bold text-slate-800 text-sm">
                {campaign.totalDonatedEth} ETH{' '}
                <span className="text-slate-400 font-normal text-xs">raised of {campaign.goalEth} ETH goal</span>
              </span>
              <span className="font-bold text-emerald-700">{campaign.progressPercent}%</span>
            </div>
            
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, campaign.progressPercent)}%` }}
              />
            </div>
          </div>

          {/* Financial Breakdown Grid */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-4">
            <div>
              <span className="text-slate-500 block">Funds Distributed:</span>
              <span className="font-bold text-blue-700 font-mono">
                {campaign.totalReleasedEth} ETH
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Vault Balance:</span>
              <span className="font-bold text-emerald-800 font-mono">
                {campaign.remainingBalanceEth} ETH
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSelect(campaign.id)}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 group-hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <span>View Ledger & Donate</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
