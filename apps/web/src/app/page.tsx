'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useChainId, useSwitchChain, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import geohash from 'ngeohash';
import { writeContract } from 'wagmi/actions';
import { CheckCircle2, Loader2, Lock, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
  const [verifying, setVerifying] = useState(false);
  const [sendingLocation, setSendingLocation] = useState(false);
  const [verifyTxHash, setVerifyTxHash] = useState<`0x${string}` | null>(null);

  const { address, isConnected } = useAccount();
  const { state, requestLocation } = useGeolocation();
  const { connect, connectors, isPending } = useConnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Read verification status
  const { data: isVerifiedData, refetch: refetchVerification } = useReadContract({
    address: SISTER_SAFE_CONTRACT_ADDRESS,
    abi: SISTER_SAFE_ABI,
    functionName: 'isVerified',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });
  
  // Convert to boolean safely
  const isVerified = Boolean(isVerifiedData);

  // Wait for verification transaction
  const { isLoading: isVerifyingTx, isSuccess: isVerifySuccess } = useWaitForTransactionReceipt({
    hash: verifyTxHash || undefined,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Force switch to Celo when connected and not on Celo
  useEffect(() => {
    if (isConnected && chainId !== celoSepolia.id) {
      switchChain({ chainId: celoSepolia.id });
    }
  }, [isConnected, chainId, switchChain]);

  // Refetch verification when transaction succeeds
  useEffect(() => {
    if (isVerifySuccess) {
      refetchVerification();
      setVerifying(false);
      setVerifyTxHash(null);
    }
  }, [isVerifySuccess, refetchVerification]);

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
        return;
      }

      setVerifying(true);
      const txHash = await writeContract(wagmiConfig, {
        address: SISTER_SAFE_CONTRACT_ADDRESS,
        abi: SISTER_SAFE_ABI,
        functionName: 'verifyUser',
      });

      setVerifyTxHash(txHash);
    } catch (error: any) {
      console.error('Error verifying user:', error);
      setVerifying(false);
    }
  };

  const handleSendLocation = async () => {
    if (state.status === 'success' && geohash5) {
      setSendingLocation(true);
      try {
        await sendLocationToChain({
          coords: state.coords,
          geohash5,
        });
        // Simulate processing time for UX
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error('Error sending location:', error);
      } finally {
        setSendingLocation(false);
      }
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-12">
      <div className="container mx-auto max-w-2xl space-y-6">
        {/* Header principal */}
        <header className="space-y-3 text-center md:text-left">
          <p className="text-base md:text-lg text-muted-foreground">
            Share your location and status with your friends safely and privately.
          </p>
        </header>

        {/* Section: Wallet / Connection */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            My Account
          </h2>

          {isConnected ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Connected address:
                </p>
                <p className="text-sm font-mono text-foreground break-all bg-secondary/50 rounded-lg p-3">
                  {address}
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center">
                  Network: {Number(chainId) === celoSepolia.id ? (
                    <>
                      <span className="text-green-600 mr-1">●</span>
                      Celo Sepolia
                    </>
                  ) : (
                    `Chain ${chainId} (switching to Celo...)`
                  )}
                </span>
              </div>

              {/* Verification Status */}
              {isVerified && (
                <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-lg p-3">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Account verified</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {!isVerified ? (
                  <Button
                    variant="pill"
                    size="pill"
                    onClick={handleVerify}
                    disabled={verifying || isVerifyingTx}
                    className="flex-1 sm:flex-none"
                  >
                    {verifying || isVerifyingTx ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify my account'
                    )}
                  </Button>
                ) : null}
                <Button
                  variant="pill"
                  size="pill"
                  className="flex-1 sm:flex-none"
                  disabled={!isVerified}
                >
                  Trusted circle
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Connect your wallet to start using sisterSafe.
              </p>
            </div>
          )}
        </section>

        {/* Section: Location / Meeting Point */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Share Location
          </h2>

          {state.status === 'idle' && (
            <p className="text-sm text-muted-foreground">
              Tap "Update location" to share your meeting point with your friends.
            </p>
          )}

          {state.status === 'loading' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="animate-pulse">●</span>
              Getting your location…
            </div>
          )}

          {state.status === 'error' && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive whitespace-pre-wrap">
                Error: {state.message}
              </p>
            </div>
          )}

          {state.status === 'success' && (
            <div className="space-y-3 bg-secondary/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Current location:
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span>Encrypted</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1 font-mono">
                <p>
                  <span className="font-semibold text-foreground">Lat:</span>{' '}
                  {state.coords.lat.toFixed(5)}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Lon:</span>{' '}
                  {state.coords.lon.toFixed(5)}
                </p>
                {geohash5 && (
                  <p>
                    <span className="font-semibold text-foreground">Geohash:</span>{' '}
                    {geohash5}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="pill"
              size="pill"
              onClick={requestLocation}
              className="flex-1"
            >
              Update location
            </Button>
            
            <Button
              type="button"
              variant={state.status === 'success' && geohash5 ? 'pill' : 'outline'}
              size="pill"
              disabled={state.status !== 'success' || !geohash5 || sendingLocation || !isVerified}
              onClick={handleSendLocation}
              className="sm:flex-none"
            >
              {sendingLocation ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Alert my friends
                </>
              )}
            </Button>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <p>
                Your location is encrypted and converted to an approximate geohash before being sent to Oasis Sapphire for private computation, protecting your exact privacy.
              </p>
            </div>
          </div>
        </section>

        {/* Additional section: Security Resources (placeholder for future) */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Security Resources
          </h2>
          <p className="text-sm text-muted-foreground">
            Coming soon: quick access to emergency contacts and help resources.
          </p>
        </section>
      </div>
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
        timeout: 10_000,
        maximumAge: 5_000,
      },
    );
  };

  useEffect(() => {
    // Ask for location once on mount
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, requestLocation };
}

// This will later call your Celo / Sapphire contract.
// For now it just logs, so you can wire the UI without breaking anything.
async function sendLocationToChain({
  coords,
  geohash5,
}: {
  coords: Coords;
  geohash5: string;
}) {
  console.log('⚡ [SisterSafe] Would send to chain:', {
    lat: coords.lat,
    lon: coords.lon,
    geohash5,
  });
  // TODO (later):
  // - call a Celo contract function via wagmi/viem
  // - or call an Oasis Sapphire contract with encrypted coords
}

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { state, requestLocation } = useGeolocation();

  let geohash5: string | null = null;
  if (state.status === 'success') {
    geohash5 = geohash.encode(state.coords.lat, state.coords.lon, 5); // 5-char = coarse
  }

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
          Verified women&apos;s safety crews with privacy-friendly location on Celo.
        </p>
      </header>

      {/* Wallet section */}
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
          </>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
              Not connected yet.
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', opacity: 0.7 }}>
              In Farcaster Wallet as a MiniApp, your wallet will auto-connect via
              the Celo Farcaster connector.
            </p>
          </>
        )}
      </section>

      {/* Geolocation section */}
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
            Tap “Refresh location” to request your position.
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
              state.status === 'success' && geohash5 ? 'pointer' : 'not-allowed',
          }}
        >
          Send privacy-friendly location (stub)
        </button>

        <p style={{ margin: 0, marginTop: 4, fontSize: '0.75rem', opacity: 0.6 }}>
          We convert your GPS into a coarse geohash (5 characters) before sending
          anything on-chain. For now this button only logs to the console – next
          we&apos;ll wire it to Celo / Oasis contracts.
        </p>
      </section>
    </main>
  );
}
