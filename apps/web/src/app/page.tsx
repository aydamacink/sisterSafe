'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import geohash from 'ngeohash';
import { writeContract } from 'wagmi/actions';

import {
  SISTER_SAFE_CONTRACT_ADDRESS,
  SISTER_SAFE_ABI,
} from '../contracts/sisterSafeConfig';
import { wagmiConfig, celoSepolia } from '../lib/wagmi';

// Type assertion for MetaMask
const getEthereum = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return window.ethereum as any;
  }
  return null;
};

type Coords = {
  lat: number;
  lon: number;
};

type GeoState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; coords: Coords }
  | { status: 'error'; message: string };

function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: 'idle' });

  const requestLocation = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setState({
        status: 'error',
        message: 'Geolocation is not supported in this environment.',
      });
      return;
    }

    setState({ status: 'loading' });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: 'success',
          coords: {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          },
        });
      },
      (err) => {
        setState({
          status: 'error',
          message: err.message || 'Unable to get your location.',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return { state, requestLocation };
}

async function sendLocationToChain({
  coords,
  geohash5,
}: {
  coords: Coords;
  geohash5: string;
}) {
  console.log('[SisterSafe] Location to send:', {
    lat: coords.lat,
    lon: coords.lon,
    geohash5,
  });
}

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);

  const { address, isConnected } = useAccount();
  const { state, requestLocation } = useGeolocation();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Force switch to Celo when connected and not on Celo
  useEffect(() => {
    if (isConnected && chainId !== celoSepolia.id) {
      switchChain({ chainId: celoSepolia.id });
    }
  }, [isConnected, chainId, switchChain]);

  if (!isMounted) {
    return null;
  }

  let geohash5: string | null = null;
  if (state.status === 'success') {
    geohash5 = geohash.encode(state.coords.lat, state.coords.lon, 5);
  }

  // Function to add Celo network to MetaMask if not already added
  const addCeloNetwork = async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${celoSepolia.id.toString(16)}`,
          chainName: celoSepolia.name,
          nativeCurrency: {
            name: celoSepolia.nativeCurrency.name,
            symbol: celoSepolia.nativeCurrency.symbol,
            decimals: celoSepolia.nativeCurrency.decimals,
          },
          rpcUrls: celoSepolia.rpcUrls.default.http,
          blockExplorerUrls: [celoSepolia.blockExplorers.default.url],
        }],
      });
    } catch (addError: any) {
      // If the network already exists (various error codes), that's fine - just skip
      const errorCode = addError?.code || addError?.data?.code;
      const errorMessage = addError?.message || '';

      // Handle various "network already exists" error codes
      if (
        errorCode === 4902 ||
        errorCode === -32603 ||
        errorMessage.includes('same RPC endpoint') ||
        errorMessage.includes('existing network')
      ) {
        // Network already exists, no need to add - this is fine
        console.log('Network already exists in MetaMask, skipping add');
        return;
      }
      // For any other error, re-throw it
      throw addError;
    }
  };

  // Function to ensure we're on Celo and wait for switch to complete
  const ensureCeloNetwork = async (): Promise<boolean> => {
    const ethereum = getEthereum();
    if (!ethereum) {
      alert('MetaMask is not installed');
      return false;
    }

    try {
      // Check current chain
      const currentChainId = await ethereum.request({ method: 'eth_chainId' });
      const currentChainIdNumber = parseInt(currentChainId as string, 16);

      if (currentChainIdNumber === celoSepolia.id) {
        return true; // Already on Celo
      }

      // Try to switch first (network might already exist)
      try {
        await switchChain({ chainId: celoSepolia.id });
      } catch (switchError: any) {
        // If switch fails with "network not found", try adding it
        const switchErrorCode = switchError?.code || switchError?.data?.code;
        if (switchErrorCode === 4902) {
          // Network not found, try to add it
          try {
            await addCeloNetwork();
            // Try switching again after adding (or if it already existed)
            await switchChain({ chainId: celoSepolia.id });
          } catch (addError: any) {
            // If add fails because network exists, just try switching again
            const addErrorCode = addError?.code || addError?.data?.code;
            const addErrorMessage = addError?.message || '';
            if (
              addErrorCode === -32603 ||
              addErrorMessage.includes('same RPC endpoint') ||
              addErrorMessage.includes('existing network')
            ) {
              // Network exists, just switch
              await switchChain({ chainId: celoSepolia.id });
            } else {
              throw addError;
            }
          }
        } else {
          throw switchError;
        }
      }

      // Wait and verify the switch completed
      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newChainId = await ethereum.request({ method: 'eth_chainId' });
        const newChainIdNumber = parseInt(newChainId as string, 16);

        if (newChainIdNumber === celoSepolia.id) {
          return true; // Successfully switched
        }
        attempts++;
      }

      // If we get here, the switch didn't complete
      alert('Please approve the network switch in your wallet and try again.');
      return false;
    } catch (error: any) {
      console.error('Error ensuring Celo network:', error);
      if (error.code === 4001) {
        alert('Network switch was rejected. Please switch to Celo Sepolia manually.');
      } else {
        alert('Failed to switch to Celo Sepolia. Please switch manually in your wallet.');
      }
      return false;
    }
  };

  const handleVerify = async () => {
    try {
      if (!isConnected) {
        alert('Please connect your wallet first.');
        return;
      }

      // Ensure we're on Celo before proceeding
      const isOnCelo = await ensureCeloNetwork();
      if (!isOnCelo) {
        return; // User needs to switch manually
      }

      // Double-check chain one more time before sending
      const ethereum = getEthereum();
      if (ethereum) {
        const finalChainId = await ethereum.request({ method: 'eth_chainId' });
        const finalChainIdNumber = parseInt(finalChainId as string, 16);
        if (finalChainIdNumber !== celoSepolia.id) {
          alert('Please switch to Celo Sepolia network before verifying.');
          return;
        }
      }

      const txHash = await writeContract(wagmiConfig, {
        address: SISTER_SAFE_CONTRACT_ADDRESS,
        abi: SISTER_SAFE_ABI,
        functionName: 'verifyUser',
      });

      console.log('Verification transaction sent:', txHash);
      alert('Verification transaction sent.');
    } catch (error: any) {
      console.error('Error verifying user:', error);
      if (error?.message?.includes('chain') || error?.message?.includes('network')) {
        alert('Transaction failed. Please ensure you are on Celo Sepolia network.');
      } else {
        alert('Verification failed. Check console for details.');
      }
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        background: '#050110',
        color: '#f7f7f7',
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ fontSize: '1.6rem', margin: 0 }}>SisterSafe (MiniApp)</h1>
        <p style={{ opacity: 0.8, margin: 0 }}>
          Privacy-friendly location and verification on Celo.
        </p>
      </header>

      <section
        style={{
          padding: '12px 14px',
          borderRadius: 12,
          background: '#141221',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <h2 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: 8 }}>
          Wallet
        </h2>

        {isConnected ? (
          <>
            <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.8 }}>
              Connected address:
            </p>
            <p
              style={{
                fontSize: '0.9rem',
                wordBreak: 'break-all',
                marginTop: 4,
                marginBottom: 0,
              }}
            >
              {address}
            </p>
            <p style={{
              fontSize: '0.85rem',
              marginTop: 8,
              marginBottom: 0,
              opacity: chainId === celoSepolia.id ? 0.7 : 1,
              color: chainId === celoSepolia.id ? 'inherit' : '#ff8080'
            }}>
              Network: {chainId === celoSepolia.id ? 'Celo Sepolia ✓' : `Chain ${chainId} - Please switch to Celo Sepolia`}
            </p>

            <button
              onClick={handleVerify}
              disabled={chainId !== celoSepolia.id}
              style={{
                marginTop: 10,
                padding: '10px 14px',
                borderRadius: 999,
                border: 'none',
                background: chainId === celoSepolia.id
                  ? 'linear-gradient(135deg, #2FFFB3 0%, #6AA8FF 100%)'
                  : '#666666',
                color: chainId === celoSepolia.id ? '#050110' : '#999999',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: chainId === celoSepolia.id ? 'pointer' : 'not-allowed',
                opacity: chainId === celoSepolia.id ? 1 : 0.5,
              }}
            >
              {chainId === celoSepolia.id ? 'Verify Me' : 'Switch to Celo to Verify'}
            </button>

            <button
              onClick={() => disconnect()}
              style={{
                marginTop: 8,
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid #ffffff40',
                background: 'transparent',
                color: '#fff',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Disconnect
            </button>
          </>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
              No wallet connected.
            </p>
            <button
              onClick={() => {
                connect({ connector: connectors[0] });
              }}
              style={{
                marginTop: 10,
                padding: '10px 14px',
                borderRadius: 999,
                border: 'none',
                background: 'linear-gradient(135deg, #FF8ACF 0%, #B169FF 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
              disabled={isPending || connectors.length === 0}
            >
              Connect Wallet
            </button>
          </>
        )}
      </section>

      <section
        style={{
          padding: '12px 14px',
          borderRadius: 12,
          background: '#141221',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <h2 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: 4 }}>
          Geolocation
        </h2>

        {state.status === 'idle' && (
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Tap "Refresh location" to request your position.
          </p>
        )}

        {state.status === 'loading' && (
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Getting your location…
          </p>
        )}

        {state.status === 'error' && (
          <p
            style={{
              fontSize: '0.9rem',
              color: '#ff8080',
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}
          >
            Error: {state.message}
          </p>
        )}

        {state.status === 'success' && (
          <div style={{ fontSize: '0.9rem' }}>
            <p style={{ margin: 0, opacity: 0.8 }}>Current coordinates:</p>
            <p style={{ margin: '4px 0 0' }}>
              <strong>Lat:</strong> {state.coords.lat.toFixed(5)}
              <br />
              <strong>Lon:</strong> {state.coords.lon.toFixed(5)}
            </p>
            {geohash5 && (
              <p style={{ margin: '6px 0 0', opacity: 0.9 }}>
                <strong>Geohash (5-char, coarse):</strong> {geohash5}
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={requestLocation}
          style={{
            marginTop: 8,
            padding: '10px 14px',
            borderRadius: 999,
            border: 'none',
            background:
              'linear-gradient(135deg, #FCFF52 0%, #F29E5F 50%, #8AC0F9 100%)',
            color: '#050110',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Refresh location
        </button>

        <button
          type="button"
          disabled={state.status !== 'success' || !geohash5}
          onClick={() => {
            if (state.status === 'success' && geohash5) {
              void sendLocationToChain({
                coords: state.coords,
                geohash5,
              });
            }
          }}
          style={{
            marginTop: 4,
            padding: '9px 14px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.15)',
            background:
              state.status === 'success' && geohash5
                ? '#ffffff10'
                : '#ffffff05',
            color: '#f7f7f7',
            fontWeight: 500,
            fontSize: '0.85rem',
            cursor:
              state.status === 'success' && geohash5
                ? 'pointer'
                : 'not-allowed',
          }}
        >
          Send location (stub)
        </button>

        <p
          style={{
            margin: 0,
            marginTop: 4,
            fontSize: '0.75rem',
            opacity: 0.6,
          }}
        >
          GPS coordinates are converted into a coarse geohash before being used. This call does not yet write on-chain.
        </p>
      </section>
    </main>
  );
}
