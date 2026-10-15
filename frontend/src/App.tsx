import React, { useState, useEffect, useCallback } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Navbar } from './components/Navbar';
import { DemoBanner } from './components/DemoBanner';
import { CampaignDirectory } from './components/CampaignDirectory';
import { CampaignDetails } from './components/CampaignDetails';
import { CreateCampaign } from './components/CreateCampaign';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { TransparencyInfo } from './components/TransparencyInfo';
import { Campaign } from './types';
import { fetchAllCampaigns } from './services/contract';
import { HeartHandshake, Shield, Sparkles } from 'lucide-react';

function KindLedgerApp() {
  const [currentTab, setCurrentTab] = useState<'directory' | 'details' | 'create' | 'organizer' | 'transparency'>('directory');
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCampaigns = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      const data = await fetchAllCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleSelectCampaign = (id: number) => {
    setSelectedCampaignId(id);
    setCurrentTab('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateTab = (tab: string) => {
    setCurrentTab(tab as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Demo Banner */}
      <DemoBanner />

      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleNavigateTab}
        onRefreshData={() => loadCampaigns(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentTab === 'directory' && (
          <CampaignDirectory
            campaigns={campaigns}
            onSelectCampaign={handleSelectCampaign}
            onCreateNew={() => handleNavigateTab('create')}
            isLoading={isLoading}
          />
        )}

        {currentTab === 'details' && selectedCampaignId !== null && (
          <CampaignDetails
            campaignId={selectedCampaignId}
            onBack={() => handleNavigateTab('directory')}
            onDonationSuccess={() => loadCampaigns(false)}
          />
        )}

        {currentTab === 'create' && (
          <CreateCampaign
            onSuccess={() => {
              loadCampaigns(false);
              handleNavigateTab('directory');
            }}
            onCancel={() => handleNavigateTab('directory')}
          />
        )}

        {currentTab === 'organizer' && (
          <OrganizerDashboard
            campaigns={campaigns}
            onRefresh={() => loadCampaigns(false)}
            onCreateNew={() => handleNavigateTab('create')}
            onSelectCampaign={handleSelectCampaign}
          />
        )}

        {currentTab === 'transparency' && <TransparencyInfo />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 mt-16 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <HeartHandshake className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800 text-sm">KindLedger</span>
            <span className="text-slate-400">| Transparent Charity Donations</span>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <p>College Demonstration Capstone Project • Local Hardhat Network only</p>
            <p className="text-[11px] text-slate-400">
              Smart contract powered by OpenZeppelin security primitives. No real funds or real ETH used.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <KindLedgerApp />
    </WalletProvider>
  );
}
