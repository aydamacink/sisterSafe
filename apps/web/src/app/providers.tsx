'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '../lib/wagmi';
import { ReactNode, useEffect, useState } from 'react';
import { sdk } from '@farcaster/frame-sdk';

const queryClient = new QueryClient();

export default function AppProviders({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize Farcaster SDK if in Farcaster environment
    const initializeFarcaster = async () => {
      try {
        // Check if we're in a Farcaster frame
        const isInFrame = window.location !== window.parent.location || 
                         window.navigator.userAgent.includes('Farcaster') ||
                         document.referrer.includes('warpcast.com') ||
                         document.referrer.includes('farcaster.xyz');
        
        if (isInFrame) {
          // Initialize the Farcaster SDK
          await sdk.actions.ready();
          console.log('Farcaster SDK initialized');
        }
      } catch (error) {
        console.error('Error initializing Farcaster SDK:', error);
      } finally {
        setIsReady(true);
      }
    };

    initializeFarcaster();
  }, []);

  // Show loading state while initializing Farcaster
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
