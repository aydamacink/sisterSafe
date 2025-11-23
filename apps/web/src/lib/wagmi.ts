// apps/web/src/lib/wagmi.ts

import { http, createConfig } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

// Custom Celo-Sepolia chain (Cenpolia)
export const celo = {
    id: 11142220, // Celo Sepolia Testnet chain ID (0xaa044c)
    name: 'Celo Sepolia',
    network: 'celo-sepolia',
    nativeCurrency: {
        name: 'CELO',
        symbol: 'CELO',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.ankr.com/celo_sepolia'],
        },
        public: {
            http: ['https://rpc.ankr.com/celo_sepolia'],
        },
    },
    blockExplorers: {
        default: {
            name: 'CeloScan (Sepolia)',
            url: 'https://celo-sepolia.blockscout.com',
        },
    },
    testnet: true,
};

// Detect if we're in Farcaster environment
export const isInFarcaster = () => {
    if (typeof window === 'undefined') return false;
    
    try {
        // Check if running in Farcaster Frame context
        return window.location !== window.parent.location || 
               window.navigator.userAgent.includes('Farcaster') ||
               document.referrer.includes('warpcast.com') ||
               document.referrer.includes('farcaster.xyz');
    } catch (e) {
        return false;
    }
};

// RainbowKit configuration with multiple wallets (MetaMask, WalletConnect, Coinbase, etc.)
export const wagmiConfig = getDefaultConfig({
    appName: 'SisterSafe',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    chains: [celo as any],
    transports: {
        [celo.id]: http(celo.rpcUrls.default.http[0]),
    },
    ssr: true,
});

// Farcaster connector (used by FarcasterAutoConnect component)
export const farcasterConnector = farcasterMiniApp();
