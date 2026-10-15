export interface CampaignRaw {
  id: bigint;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  goal: bigint;
  deadline: bigint;
  organizer: string;
  totalDonated: bigint;
  totalReleased: bigint;
  exists: boolean;
}

export interface Campaign {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  goal: bigint;
  goalEth: string;
  deadline: number;
  deadlineDate: string;
  isExpired: boolean;
  organizer: string;
  totalDonated: bigint;
  totalDonatedEth: string;
  totalReleased: bigint;
  totalReleasedEth: string;
  remainingBalance: bigint;
  remainingBalanceEth: string;
  progressPercent: number;
  releasedPercent: number;
  exists: boolean;
}

export interface Donation {
  id?: string;
  campaignId: number;
  donor: string;
  amount: bigint;
  amountEth: string;
  timestamp: number;
  dateStr: string;
  donorNickname: string;
  message: string;
  txHash?: string;
}

export interface Payout {
  id?: string;
  campaignId: number;
  recipient: string;
  amount: bigint;
  amountEth: string;
  timestamp: number;
  dateStr: string;
  purpose: string;
  txHash?: string;
}

export type TimelineEvent = 
  | ({ type: 'donation' } & Donation)
  | ({ type: 'payout' } & Payout);

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  balance: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
}
