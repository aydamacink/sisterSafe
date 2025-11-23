"use client"

import Image from "next/image"

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className, width = 100, height = 40 }: LogoProps) {
  return (
    <Image
      src="/SisterSafe_logo.svg"
      alt="SisterSafe Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}

