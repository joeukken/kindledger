import React from 'react';
import { HeartHandshake, Wallet, ExternalLink, PlusCircle, LayoutDashboard, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { shortenAddress } from '../utils/formatters';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onRefreshData,
  isRefreshing = false,
}) => {
  const { address, isConnected, isCorrectNetwork, balance, connectWallet, disconnectWallet, switchNetwork } = useWallet();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentTab('directory')}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 bg-clip-text text-transparent">
                  KindLedger
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wider uppercase">
                  Local Demo
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Transparent Blockchain Charity</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setCurrentTab('directory')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'directory'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Browse Campaigns
            </button>
            <button
              onClick={() => setCurrentTab('create')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'create'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Start Campaign
            </button>
            <button
              onClick={() => setCurrentTab('organizer')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'organizer'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Organizer Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('transparency')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'transparency'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              Transparency & Safety
            </button>
          </nav>

          {/* Right Wallet Controls */}
          <div className="flex items-center gap-3">
            {/* Refresh Chain Data Button */}
            {onRefreshData && (
              <button
                onClick={onRefreshData}
                disabled={isRefreshing}
                title="Refresh blockchain data"
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 active:scale-95 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            )}

            {/* Network Badge */}
            {isConnected && (
              <>
                {isCorrectNetwork ? (
                  <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Hardhat (31337)
                  </div>
                ) : (
                  <button
                    onClick={switchNetwork}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Switch to Hardhat
                  </button>
                )}
              </>
            )}

            {/* Wallet Button */}
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200/90 rounded-xl p-1 pr-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center font-mono">
                  {address?.substring(2, 4).toUpperCase()}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-slate-800 font-mono">
                    {shortenAddress(address!)}
                  </div>
                  <div className="text-slate-500 font-medium">
                    {balance !== null ? `${balance} ETH` : 'Loading...'}
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="ml-2 text-xs text-slate-400 hover:text-rose-600 transition-colors"
                  title="Disconnect"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 overflow-x-auto gap-2">
          <button
            onClick={() => setCurrentTab('directory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              currentTab === 'directory' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'
            }`}
          >
            Campaigns
          </button>
          <button
            onClick={() => setCurrentTab('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              currentTab === 'create' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'
            }`}
          >
            + New Campaign
          </button>
          <button
            onClick={() => setCurrentTab('organizer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              currentTab === 'organizer' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('transparency')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              currentTab === 'transparency' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'
            }`}
          >
            Transparency
          </button>
        </div>
      </div>
    </header>
  );
};
