"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ExternalLink, CheckCircle2 } from "lucide-react"
import { useAccount, useChainId, useReadContract } from "wagmi"
import { ConnectButton } from '@rainbow-me/rainbowkit'

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container relative flex h-24 max-w-screen-2xl items-center justify-between px-4 py-5">
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
              <Link href="/" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
                <Logo />
                <span className="font-bold text-lg text-foreground">
                  sisterSafe
                </span>
              </Link>
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
              
              {/* Mobile: Wallet connection and info */}
              {isMounted && (
                <div className="mt-8 pt-8 border-t border-border space-y-4">
                  {isConnected && (
                    <>
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
                    </>
                  )}

                  {/* RainbowKit Connect Button */}
                  <div className="w-full">
                    <ConnectButton showBalance={false} />
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo - centered */}
        <Link 
          href="/" 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Logo />
        </Link>

        {/* Desktop: Connect wallet button - right */}
        <div className="hidden md:flex items-center gap-4">
          {isMounted && isConnected && (
            <>
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
            </>
          )}
          
          {/* RainbowKit Connect Button */}
          {isMounted && <ConnectButton showBalance={false} />}
        </div>
      </div>
    </header>
  )
}
