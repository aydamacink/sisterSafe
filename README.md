# SisterSafe

**Radical Digital Autonomy for Personal Safety**  
_Feminist & Cypherpunk: Maximum Privacy + Self-Sovereignty_

---

## 🚩 Core Tech Stack

- **Zero-Knowledge Proofs:** zk-SNARKs, zk-PoL
- **Blockchain:** Celo L2
- **Identity:** Self Protocol (ZK-based)
- **Confidential Compute:** Self Protocol

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
- Self Protocol ensure trusted contacts are real, unique humans—without revealing personal ID or linking wallet addresses on-chain.

---

## 🎯 Project Objectives

- **Maximize Privacy:** Zero disclosure of location data until ZK-verified.
- **Censorship-Resistance:** Alert signal can't be blocked (L2 on-chain verification).
- **Trustless Safety Net:** All contacts cryptographically verified (no fake accounts).
- **Cross-chain Confidentiality:** ZK-verification on Celo/Self triggers key release on Celo

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
- **Confidential compute** Self for safe, programmatic key management
- **Private alerts** Self for on-chain privacy

---

## 🔗 Philosophical Foundations

> _Privacy as Power. Autonomy as Safety._  
> – Cypherpunk & Feminist Principles

- **Code is Law:** All safety logic enforced by ZK circuits and smart contracts.
- **Data Sovereignty:** Users own their graph, their data, and their choices.
- **Synergistic Security:** Radical privacy is the only route to true safety for vulnerable users.

---

## 🚀 Roadmap & Future Features

We have an ambitious vision for SisterSafe, focusing on continuous innovation in privacy, security, and user experience.

**Phase 1: MVP - The Shielded Compass (Hackathon Deliverable)**

Core ZK-Verified Panic Alert on Celo.

Self Protocol for Sybil-resistant trusted contacts.

Basic mobile app UX for Prover and Recipient.

**Phase 2: Enhanced Guardianship & Proactive Safety**

Dynamic Safe Zones & Alerts: Multiple configurable safe zones, with non-emergency 'leaving zone' notifications.

ZK-Verified Geo-Check-Ins: Users can prove they are at a location without revealing where.

Group Guardian Management: Define different groups of guardians with tailored alert settings.

**Phase 3: Community & Autonomous Safety**

Decentralized Reputation for Guardians: On-chain, ZK-backed reputation for reliable guardians.

Anonymous Data for Public Safety: ZK-aggregated data on alert frequencies for urban planning, without revealing individual locations.

Community Safety Circles: Opt-in local networks of verified SisterSafe users for broader support.

**Phase 4: Self-Sustaining & Interoperable Safety** 

SisterSafe DAO (on Celo): Community governance for protocol upgrades and funding.

Celo-Native Interoperability: Explore cross-chain ZK bridges for alerts to guardians on other chains.

Integration with Public Safety: Opt-in, ZK-verified alerts to local emergency services.

---

## 🧑‍💻 Team

- Dayana
- Cristina
- Sonia
- Paula
- Rocio

--

## SisterSafe - How to run the code

A miniapp to share location safely

A modern Celo blockchain application built with Next.js, TypeScript, and Turborepo.

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Configure environment variables:
   
   Create a `.env.local` file in `apps/web/` with:
   ```bash
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_URL=http://localhost:3000
   ```
   
   **Get your WalletConnect Project ID:**
   - Go to [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)
   - Sign in and create a new project
   - Copy the Project ID and paste it in your `.env.local`

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
- **Web3**: Wagmi v2 + RainbowKit (multi-wallet support)
- **Smart Contracts**: Hardhat with Viem
- **Blockchain**: Celo Sepolia Testnet
- **Monorepo**: Turborepo
- **Package Manager**: PNPM

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Celo Documentation](https://docs.celo.org/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
