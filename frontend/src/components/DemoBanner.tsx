import React, { useState } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-full bg-amber-500 text-white shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold uppercase tracking-wider text-[11px] bg-amber-200/80 px-2 py-0.5 rounded text-amber-950 mr-2">
              Academic Demo Only
            </span>
            <span>
              Running on a local Hardhat test network (Chain ID: <code className="font-mono font-bold">31337</code>). 
              <strong> No real money or real ETH are used.</strong> Do not transfer mainnet cryptocurrency. 
              The smart contract is for educational demonstration and has not been audited.
            </span>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 hover:text-amber-950 p-1 rounded-lg hover:bg-amber-200/50 transition-colors shrink-0"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
