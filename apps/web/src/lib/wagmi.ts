// apps/web/src/lib/wagmi.ts

import { http } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

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

// RainbowKit configuration with multiple wallets
export const wagmiConfig = getDefaultConfig({
    appName: 'SisterSafe',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    chains: [celoSepolia as any],
    transports: {
        [celoSepolia.id]: http(celoSepolia.rpcUrls.default.http[0]),
    },
    ssr: true, // Enable SSR for Next.js
});
