import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { BrowserProvider, formatEther } from 'ethers';
import { WalletState } from '../types';

export const HARDHAT_CHAIN_ID = 31337;
export const HARDHAT_CHAIN_ID_HEX = '0x7a69';

interface WalletContextType extends WalletState {
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  const isConnected = !!address;
  const isCorrectNetwork = chainId === HARDHAT_CHAIN_ID;

  const refreshBalance = useCallback(async () => {
    if (!address || !window.ethereum) return;
    try {
      const provider = new BrowserProvider(window.ethereum);
      const bal = await provider.getBalance(address);
      setBalance(Number(formatEther(bal)).toFixed(4));
    } catch (e) {
      console.warn('Could not refresh balance:', e);
    }
  }, [address]);

  const updateNetworkState = useCallback(async (provider: BrowserProvider) => {
    try {
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
    } catch (e) {
      console.warn('Failed to fetch network chainId:', e);
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('No Ethereum wallet detected. Please install MetaMask to interact with smart contracts on your local network.');
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        await updateNetworkState(provider);
        const bal = await provider.getBalance(accounts[0]);
        setBalance(Number(formatEther(bal)).toFixed(4));
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      if (err.code !== 4001) {
        alert(err.message || 'Failed to connect wallet');
      }
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setBalance(null);
  };

  const switchNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
      });
    } catch (switchError: any) {
      // 4902 means the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: HARDHAT_CHAIN_ID_HEX,
                chainName: 'Hardhat Localhost',
                nativeCurrency: {
                  name: 'Test ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['http://127.0.0.1:8545'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add Hardhat network:', addError);
        }
      } else {
        console.error('Failed to switch network:', switchError);
      }
    }
  };

  // Listen for account and network changes in MetaMask
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAddress(accounts[0]);
        refreshBalance();
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16));
      refreshBalance();
    };

    window.ethereum.on?.('accountsChanged', handleAccountsChanged);
    window.ethereum.on?.('chainChanged', handleChainChanged);

    // Initial check if already connected
    const checkConnection = async () => {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_accounts', []);
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          await updateNetworkState(provider);
          const bal = await provider.getBalance(accounts[0]);
          setBalance(Number(formatEther(bal)).toFixed(4));
        }
      } catch (err) {
        console.warn('Initial connection check failed:', err);
      }
    };

    checkConnection();

    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [refreshBalance, updateNetworkState]);

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        isConnected,
        isCorrectNetwork,
        balance,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
