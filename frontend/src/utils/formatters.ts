import { formatEther } from 'ethers';

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function formatEth(wei: bigint | string | number | undefined, maxDecimals = 4): string {
  if (wei === undefined || wei === null) return '0';
  try {
    const val = typeof wei === 'bigint' ? formatEther(wei) : formatEther(BigInt(wei));
    const num = parseFloat(val);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return Number(num.toFixed(maxDecimals)).toString();
  } catch {
    return '0';
  }
}

export function formatDate(timestamp: number | bigint): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  if (!ts) return 'N/A';
  const date = new Date(ts * 1000);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTimeRemaining(deadline: number | bigint): {
  days: number;
  hours: number;
  isExpired: boolean;
  text: string;
} {
  const dl = typeof deadline === 'bigint' ? Number(deadline) : deadline;
  const now = Math.floor(Date.now() / 1000);
  const diff = dl - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, isExpired: true, text: 'Campaign Concluded' };
  }

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);

  if (days > 0) {
    return { days, hours, isExpired: false, text: `${days}d ${hours}h left` };
  }
  return { days, hours, isExpired: false, text: `${hours}h left` };
}

export function truncateText(text: string, maxLen = 120): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '...';
}
