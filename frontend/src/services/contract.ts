import { BrowserProvider, Contract, JsonRpcProvider, parseEther } from 'ethers';
import contractAddressData from '../contracts/KindLedgerAddress.json';
import contractAbi from '../contracts/KindLedgerAbi.json';
import { Campaign, CampaignRaw, Donation, Payout, TimelineEvent } from '../types';
import { formatDate, formatEth } from '../utils/formatters';

const DEFAULT_RPC = 'http://127.0.0.1:8545';
export const CONTRACT_ADDRESS = contractAddressData.address;
export const EXPECTED_CHAIN_ID = 31337;

/**
 * Creates a read-only provider for reading on-chain data even if no wallet is connected.
 */
export function getReadOnlyProvider(): JsonRpcProvider {
  return new JsonRpcProvider(DEFAULT_RPC);
}

/**
 * Returns read-only contract instance.
 */
export function getReadOnlyContract(): Contract {
  const provider = getReadOnlyProvider();
  return new Contract(CONTRACT_ADDRESS, contractAbi, provider);
}

/**
 * Returns signer contract instance for state-modifying transactions.
 */
export async function getSignerContract(): Promise<Contract> {
  if (!window.ethereum) {
    throw new Error('MetaMask or an Ethereum browser wallet is required to send transactions.');
  }
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, contractAbi, signer);
}

/**
 * Format raw contract campaign data to frontend Campaign object.
 */
export function formatCampaign(raw: CampaignRaw): Campaign {
  const id = Number(raw.id);
  const goal = raw.goal;
  const deadline = Number(raw.deadline);
  const totalDonated = raw.totalDonated;
  const totalReleased = raw.totalReleased;
  const remaining = totalDonated >= totalReleased ? totalDonated - totalReleased : 0n;

  const progressPercent = goal > 0n ? Math.min(100, Number((totalDonated * 100n) / goal)) : 0;
  const releasedPercent = totalDonated > 0n ? Math.min(100, Number((totalReleased * 100n) / totalDonated)) : 0;
  const now = Math.floor(Date.now() / 1000);

  return {
    id,
    title: raw.title,
    description: raw.description,
    category: raw.category || 'General',
    imageUrl: raw.imageUrl || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?auto=format&fit=crop&w=1200&q=80',
    goal,
    goalEth: formatEth(goal),
    deadline,
    deadlineDate: formatDate(deadline),
    isExpired: deadline < now,
    organizer: raw.organizer,
    totalDonated,
    totalDonatedEth: formatEth(totalDonated),
    totalReleased,
    totalReleasedEth: formatEth(totalReleased),
    remainingBalance: remaining,
    remainingBalanceEth: formatEth(remaining),
    progressPercent,
    releasedPercent,
    exists: raw.exists,
  };
}

/**
 * Fetch all campaigns.
 */
export async function fetchAllCampaigns(): Promise<Campaign[]> {
  try {
    let contract: Contract;
    if (window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        contract = new Contract(CONTRACT_ADDRESS, contractAbi, provider);
      } catch {
        contract = getReadOnlyContract();
      }
    } else {
      contract = getReadOnlyContract();
    }

    const rawList: CampaignRaw[] = await contract.getAllCampaigns();
    return rawList.map(formatCampaign);
  } catch (err) {
    console.warn('Could not fetch from live RPC/Wallet provider. Falling back to local RPC:', err);
    try {
      const readOnly = getReadOnlyContract();
      const rawList: CampaignRaw[] = await readOnly.getAllCampaigns();
      return rawList.map(formatCampaign);
    } catch (fallbackErr) {
      console.error('Failed to fetch campaigns:', fallbackErr);
      return [];
    }
  }
}

/**
 * Fetch a single campaign with all donations, payouts, and transaction events.
 */
export async function fetchCampaignDetails(campaignId: number): Promise<{
  campaign: Campaign;
  donations: Donation[];
  payouts: Payout[];
  timeline: TimelineEvent[];
}> {
  let contract: Contract;
  let provider;

  if (window.ethereum) {
    provider = new BrowserProvider(window.ethereum);
  } else {
    provider = getReadOnlyProvider();
  }
  contract = new Contract(CONTRACT_ADDRESS, contractAbi, provider);

  const [rawCampaign, rawDonations, rawPayouts] = await Promise.all([
    contract.getCampaign(campaignId),
    contract.getDonations(campaignId),
    contract.getPayouts(campaignId),
  ]);

  // Fetch past event logs to find matching transaction hashes
  let donationLogs: any[] = [];
  let payoutLogs: any[] = [];
  try {
    const donationFilter = contract.filters.DonationReceived(campaignId);
    const payoutFilter = contract.filters.FundsReleased(campaignId);
    [donationLogs, payoutLogs] = await Promise.all([
      contract.queryFilter(donationFilter, 0, 'latest'),
      contract.queryFilter(payoutFilter, 0, 'latest'),
    ]);
  } catch (e) {
    console.warn('Could not fetch historical event logs for txHashes:', e);
  }

  const donations: Donation[] = rawDonations.map((d: any, index: number) => {
    const matchingLog = donationLogs[index];
    return {
      campaignId,
      donor: d.donor,
      amount: d.amount,
      amountEth: formatEth(d.amount),
      timestamp: Number(d.timestamp),
      dateStr: formatDate(d.timestamp),
      donorNickname: d.donorNickname || 'Anonymous Supporter',
      message: d.message || '',
      txHash: matchingLog ? matchingLog.transactionHash : undefined,
    };
  });

  const payouts: Payout[] = rawPayouts.map((p: any, index: number) => {
    const matchingLog = payoutLogs[index];
    return {
      campaignId,
      recipient: p.recipient,
      amount: p.amount,
      amountEth: formatEth(p.amount),
      timestamp: Number(p.timestamp),
      dateStr: formatDate(p.timestamp),
      purpose: p.purpose,
      txHash: matchingLog ? matchingLog.transactionHash : undefined,
    };
  });

  // Construct combined chronological timeline (latest first)
  const timeline: TimelineEvent[] = [
    ...donations.map((d) => ({ type: 'donation' as const, ...d })),
    ...payouts.map((p) => ({ type: 'payout' as const, ...p })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  return {
    campaign: formatCampaign(rawCampaign),
    donations,
    payouts,
    timeline,
  };
}

/**
 * Create a new charity campaign.
 */
export async function createCampaignOnChain(params: {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  goalEth: string;
  deadlineTimestamp: number;
}): Promise<string> {
  const contract = await getSignerContract();
  const goalWei = parseEther(params.goalEth);

  const tx = await contract.createCampaign(
    params.title.trim(),
    params.description.trim(),
    params.category.trim() || 'General Charity',
    params.imageUrl.trim(),
    goalWei,
    params.deadlineTimestamp
  );

  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Donate ETH to a campaign.
 */
export async function donateToCampaignOnChain(params: {
  campaignId: number;
  amountEth: string;
  donorNickname: string;
  message: string;
}): Promise<string> {
  const contract = await getSignerContract();
  const valueWei = parseEther(params.amountEth);

  const tx = await contract.donate(
    params.campaignId,
    params.donorNickname.trim(),
    params.message.trim(),
    { value: valueWei }
  );

  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Release campaign funds to a recipient with an audited purpose statement.
 */
export async function releaseFundsOnChain(params: {
  campaignId: number;
  recipientAddress: string;
  amountEth: string;
  purpose: string;
}): Promise<string> {
  const contract = await getSignerContract();
  const amountWei = parseEther(params.amountEth);

  const tx = await contract.releaseFunds(
    params.campaignId,
    params.recipientAddress.trim(),
    amountWei,
    params.purpose.trim()
  );

  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Humanizes contract revert messages.
 */
export function extractErrorMessage(err: any): string {
  if (!err) return 'An unknown error occurred.';
  if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
    return 'Transaction rejected by user in wallet.';
  }
  if (err.reason) return err.reason;
  if (err.data?.message) return err.data.message;
  if (err.message) {
    const match = err.message.match(/reverted with reason string '([^']+)'/);
    if (match && match[1]) return match[1];
    if (err.message.includes('user rejected action')) return 'Transaction cancelled by user.';
    if (err.message.includes('insufficient funds')) return 'Insufficient ETH in your wallet to cover this transaction and gas.';
    return err.message.substring(0, 160);
  }
  return String(err);
}
