// apps/web/src/lib/wagmi.ts

import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

// Custom Celo-Sepolia chain (Cenpolia)
export const celoSepolia = {
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
const isInFarcaster = () => {
    if (typeof window === 'undefined') return false;
    
    // Check for Farcaster SDK
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

// Get appropriate connectors based on environment
const getConnectors = () => {
    // Always include Farcaster connector first if in Farcaster environment
    if (isInFarcaster()) {
        return [farcasterMiniApp()];
    }
    // Otherwise use injected wallet (MetaMask, etc.)
    return [injected()];
};

// Wagmi config with automatic connector detection
export const wagmiConfig = createConfig({
    chains: [celoSepolia],
    transports: {
        [celoSepolia.id]: http(celoSepolia.rpcUrls.default.http[0]),
    },
    connectors: getConnectors(),
});
