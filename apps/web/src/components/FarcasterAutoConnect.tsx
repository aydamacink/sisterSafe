"use client"

import { useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { isInFarcaster, farcasterConnector } from '@/lib/wagmi';

export function FarcasterAutoConnect() {
  const { isConnected } = useAccount();
  const { connect } = useConnect();

  useEffect(() => {
    // Only auto-connect if in Farcaster environment and not already connected
    if (isInFarcaster() && !isConnected) {
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        try {
          connect({ connector: farcasterConnector });
        } catch (error) {
          console.error('Farcaster auto-connect failed:', error);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isConnected, connect]);

  return null; // This component doesn't render anything
}

