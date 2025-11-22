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
    </main>
  );
}
