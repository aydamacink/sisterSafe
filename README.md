# SisterSafe

**Radical Digital Autonomy for Personal Safety**  
_Feminist & Cypherpunk: Maximum Privacy + Self-Sovereignty_

---

## 🚩 Core Tech Stack

- **Zero-Knowledge Proofs:** zk-SNARKs, zk-PoL
- **Blockchain:** Celo L2
- **Identity:** Self Protocol (ZK-based)
- **Confidential Compute:** Oasis Sapphire

---

## 💥 Problem Landscape

Traditional safety apps force users to share raw location with centralized servers—sacrificing privacy for "protection".  
This exposes sensitive data and creates exploitable points of failure.

**Real-World Flaws:**
- **Privacy vs Safety Trade-off:** Raw GPS required for help, but shared to third parties and vulnerable.
- **Censorship & Trust Risks:** Centralized alerts can be blocked, delayed, or manipulated.
- **Sybil/Identity Attacks:** Fake accounts can infiltrate “trusted” safety circles.

---

## 🛡️ SisterSafe Solution

SisterSafe removes trust assumptions with a triple-layered approach:

### 1. **Trustless Geo-Proof (zk-PoL)**
- User generates a zk-proof (π) of being “outside safe zone” or having triggered a panic alert.
- **No raw GPS is ever revealed** to anyone—even in emergencies.

### 2. **Confidential Key Release**
- Decryption key (KS) for actual location is stored in an Oasis Confidential Smart Contract.
- Key is released _only if_ the zk-proof (π) is valid, enforced by verified Celo L2 state.

### 3. **Private, Sybil-resistant Social Graph**
- Self Protocol and Aztec ensure trusted contacts are real, unique humans—without revealing personal ID or linking wallet addresses on-chain.

---

## 🎯 Project Objectives

- **Maximize Privacy:** Zero disclosure of location data until ZK-verified.
- **Censorship-Resistance:** Alert signal can't be blocked (L2 on-chain verification).
- **Trustless Safety Net:** All contacts cryptographically verified (no fake accounts).
- **Cross-chain Confidentiality:** ZK-verification on Celo/Aztec triggers key release on Oasis Sapphire.

---

## 🌍 Human & Technical Impact

### **Empowerment and Autonomy**
- Shifts control of location data back to the individual.

### **Safety Net Integrity**
- Guarantees trusted network with unique, verified contacts.

### **Global Accessibility**
- Designed for low-cost, mobile-first use (Celo L2), targeting high-need, underbanked populations.

### **Technical Highlights**
- **zk-PoL for geo-verification** without revealing GPS
- **Confidential compute** (Oasis) for safe, programmatic key management
- **Private alerts** (Aztec) for on-chain privacy

---

## 🔗 Philosophical Foundations

> _Privacy as Power. Autonomy as Safety._  
> – Cypherpunk & Feminist Principles

- **Code is Law:** All safety logic enforced by ZK circuits and smart contracts.
- **Data Sovereignty:** Users own their graph, their data, and their choices.
- **Synergistic Security:** Radical privacy is the only route to true safety for vulnerable users.

---

## 🧑‍💻 Team

- Dayana
- Cristina
- Sonia
- Paula
- Rocio




# sisterSafe

A miniapp to share location safely

A modern Celo blockchain application built with Next.js, TypeScript, and Turborepo.

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

This is a monorepo managed by Turborepo with the following structure:

- `apps/web` - Next.js application with embedded UI components and utilities
- `apps/hardhat` - Smart contract development environment

## Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm type-check` - Run TypeScript type checking

### Smart Contract Scripts

- `pnpm contracts:compile` - Compile smart contracts
- `pnpm contracts:test` - Run smart contract tests
- `pnpm contracts:deploy` - Deploy contracts to local network
- `pnpm contracts:deploy:alfajores` - Deploy to Celo Alfajores testnet
- `pnpm contracts:deploy:sepolia` - Deploy to Celo Sepolia testnet
- `pnpm contracts:deploy:celo` - Deploy to Celo mainnet

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Smart Contracts**: Hardhat with Viem
- **Monorepo**: Turborepo
- **Package Manager**: PNPM

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Celo Documentation](https://docs.celo.org/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
