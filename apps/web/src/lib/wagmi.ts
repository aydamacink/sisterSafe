// apps/web/src/lib/wagmi.ts

import { createConfig, http } from 'wagmi';

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
            http: ['https://forno.sepolia.celo-testnet.org'],
        },
        public: {
            http: ['https://forno.sepolia.celo-testnet.org'],
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

//  Injected wallet 
import { injected } from 'wagmi/connectors';

// Wagmi config for Celo-Sepolia only
export const wagmiConfig = createConfig({
    chains: [celoSepolia],
    transports: {
        [celoSepolia.id]: http(celoSepolia.rpcUrls.default.http[0]),
    },
    connectors: [injected()],
});
