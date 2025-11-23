"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ExternalLink, CheckCircle2 } from "lucide-react"
import { useAccount, useConnect, useDisconnect, useChainId, useReadContract } from "wagmi"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SISTER_SAFE_CONTRACT_ADDRESS, SISTER_SAFE_ABI } from "@/contracts/sisterSafeConfig"
import { celoSepolia } from "@/lib/wagmi"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Docs", href: "https://docs.celo.org", external: true },
]

export function Navbar() {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()

  // Read verification status
  const { data: isVerifiedData } = useReadContract({
    address: SISTER_SAFE_CONTRACT_ADDRESS,
    abi: SISTER_SAFE_ABI,
    functionName: 'isVerified',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  })
  
  const isVerified = Boolean(isVerifiedData)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-connect when Farcaster wallet is available
  useEffect(() => {
    if (isMounted && !isConnected && !isPending) {
      const autoConnect = async () => {
        // Check if we're in Farcaster environment
        const isInFarcaster = window.location !== window.parent.location || 
                             window.navigator.userAgent.includes('Farcaster') ||
                             document.referrer.includes('warpcast.com') ||
                             document.referrer.includes('farcaster.xyz');
        
        if (isInFarcaster && connectors.length > 0) {
          // Auto-connect with Farcaster wallet
          try {
            connect({ connector: connectors[0] });
          } catch (error) {
            console.error('Auto-connect failed:', error);
          }
        }
      };
      
      autoConnect();
    }
  }, [isMounted, isConnected, isPending, connectors, connect])

  const handleConnectWallet = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] })
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container relative flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Mobile menu button - left */}
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden ml-2 mt-1">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-background">
              <div className="flex items-center gap-3 mb-8">
                <Logo />
                <span className="font-bold text-lg text-foreground">
                  sisterSafe
                </span>
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.filter(link => link.name !== "Docs").map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className={`flex items-center gap-2 text-base font-medium transition-colors hover:text-primary ${pathname === link.href ? "text-foreground" : "text-foreground/70"
                      }`}
                  >
                    {link.name}
                    {link.external && <ExternalLink className="h-4 w-4" />}
                  </Link>
                ))}
              </nav>
              
              {/* Mobile: Wallet info when connected */}
              {isMounted && isConnected && (
                <div className="mt-8 pt-8 border-t border-border space-y-4">
                  {/* Celo Network Indicator */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">●</span>
                    <span className="text-muted-foreground font-medium">
                      {Number(chainId) === celoSepolia.id ? 'Celo' : `Chain ${chainId}`}
                    </span>
                  </div>

                  {/* Verify Status */}
                  <div className="flex items-center gap-2">
                    {isVerified ? (
                      <div className="flex items-center gap-1.5 text-sm text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium">Verify</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not verified</span>
                    )}
                  </div>

                  {/* Address and Disconnect */}
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground font-medium break-all">
                      {address}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDisconnect}
                      className="w-full"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              )}

              {/* Mobile: Connect wallet button when not connected */}
              {isMounted && !isConnected && (
                <div className="mt-8 pt-8 border-t border-border">
                  <Button 
                    variant="pill" 
                    size="pill"
                    onClick={handleConnectWallet}
                    disabled={isPending || connectors.length === 0}
                    className="w-full"
                  >
                    {isPending ? "Connecting..." : "Connect wallet"}
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo - centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Logo />
        </div>

        {/* Desktop: Connect wallet button - right */}
        <div className="hidden md:flex items-center gap-4">
          {isMounted && isConnected ? (
            <div className="flex items-center gap-4">
              {/* Celo Network Indicator */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600">●</span>
                <span className="text-muted-foreground font-medium">
                  {Number(chainId) === celoSepolia.id ? 'Celo' : `Chain ${chainId}`}
                </span>
              </div>

              {/* Verify Status */}
              <div className="flex items-center gap-2">
                {isVerified ? (
                  <div className="flex items-center gap-1.5 text-sm text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Verify</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Not verified</span>
                )}
              </div>

              {/* Address and Disconnect */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-medium">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="pill" 
              size="pill"
              onClick={handleConnectWallet}
              disabled={isPending || connectors.length === 0 || !isMounted}
            >
              {isPending ? "Connecting..." : "Connect wallet"}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
