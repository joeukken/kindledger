import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles, PlusCircle, ArrowUpDown, Coins, HeartHandshake, ShieldCheck } from 'lucide-react';
import { Campaign } from '../types';
import { CampaignCard } from './CampaignCard';
import { formatEth } from '../utils/formatters';

interface CampaignDirectoryProps {
  campaigns: Campaign[];
  onSelectCampaign: (id: number) => void;
  onCreateNew: () => void;
  isLoading: boolean;
}

export const CampaignDirectory: React.FC<CampaignDirectoryProps> = ({
  campaigns,
  onSelectCampaign,
  onCreateNew,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'funded' | 'deadline' | 'goal'>('newest');

  // Compute aggregate stats across all campaigns
  const aggregateStats = useMemo(() => {
    let totalDonatedWei = 0n;
    let totalReleasedWei = 0n;
    let totalGoalWei = 0n;

    campaigns.forEach((c) => {
      totalDonatedWei += c.totalDonated;
      totalReleasedWei += c.totalReleased;
      totalGoalWei += c.goal;
    });

    return {
      count: campaigns.length,
      totalDonatedEth: formatEth(totalDonatedWei),
      totalReleasedEth: formatEth(totalReleasedWei),
      totalGoalEth: formatEth(totalGoalWei),
    };
  }, [campaigns]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    campaigns.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ['All', ...Array.from(set)];
  }, [campaigns]);

  // Filtered and sorted campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter((c) => {
        const matchesQuery =
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;

        return matchesQuery && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.id - a.id;
        if (sortBy === 'funded') return Number(b.totalDonated - a.totalDonated);
        if (sortBy === 'deadline') return a.deadline - b.deadline;
        if (sortBy === 'goal') return Number(b.goal - a.goal);
        return 0;
      });
  }, [campaigns, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-8 md:p-12 overflow-hidden shadow-xl border border-slate-700/50">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            100% Verifiable Charity on Ethereum
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Track every penny donated to charity, on-chain.
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8">
            KindLedger replaces blind trust with cryptographic proof. Browse active community causes, 
            back campaigns with local test ETH, and inspect exact timestamps and invoices for every fund distribution.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <div>
              <div className="text-xs text-slate-300 font-medium">Active Causes</div>
              <div className="text-2xl font-bold font-mono text-white">{aggregateStats.count}</div>
            </div>
            <div>
              <div className="text-xs text-slate-300 font-medium">Total Donated</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{aggregateStats.totalDonatedEth} ETH</div>
            </div>
            <div>
              <div className="text-xs text-slate-300 font-medium">Distributed to Causes</div>
              <div className="text-2xl font-bold font-mono text-cyan-300">{aggregateStats.totalReleasedEth} ETH</div>
            </div>
            <div>
              <div className="text-xs text-slate-300 font-medium">Smart Contract State</div>
              <div className="text-sm font-bold text-emerald-300 flex items-center gap-1 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Non-Custodial
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter, and Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search causes, descriptions, or addresses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="funded">Most Funded</option>
              <option value="deadline">Approaching Deadline</option>
              <option value="goal">Highest Goal</option>
            </select>
          </div>

          {/* Start Campaign CTA */}
          <button
            onClick={onCreateNew}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Start Campaign
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Campaign Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-4">
              <div className="h-44 bg-slate-200 rounded-xl" />
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-8 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onSelect={onSelectCampaign}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">No campaigns matched your criteria</h3>
          <p className="text-slate-500 text-sm mb-6">
            Try adjusting your search terms or category filter to discover existing fundraising campaigns.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
