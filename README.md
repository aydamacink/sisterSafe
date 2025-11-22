# Proyect Name: SisterSafe

[Core Ethos]: Feminist & Cypherpunk (Maximal Privacy + Self-Sovereignty)
[Technology Stack] 	Zero-Knowledge Proofs (ZK-SNARKs), Celo L2, Self Protocol (ZK Identity), Oasis Sapphire (Confidential Compute)

[The Problem]

The current landscape of personal safety solutions is fundamentally broken by its reliance on centralized, vulnerable, and invasive infrastructure:

* Problem StatementReal-World FlawPrivacy vs. Safety Trade-offTraditional safety apps require users to continuously share their precise location with a centralized server, sacrificing privacy for the mere potential of safety. This creates a massive, single point of failure for sensitive location data.
* Censorship & Trust IssuesCentralized alerts can be blocked, delayed, or manipulated by external actors or platform failures. The user must trust the app company and third-party servers to correctly relay the life-saving signal.
* Identity/Sybil Attacks When forming a trusted safety network, there is no way to cryptographically verify that the contacts are unique, verified individuals, leading to a risk of fake accounts or Sybil attacks on the trusted circle.

[The Solution]

SisterSafe eliminates the trust requirement by verifying the emergency state mathematically before releasing the location confidentially.

- BenefitTrustless (VerificationZero-Knowledge) Proof of Location (zk-PoL) The user generates a ZK proof ($\pi$) proving they are "outside their safe zone" or "initiated a panic alert" without revealing their actual, raw GPS coordinates to the network.
- Confidential (DecryptionOasis SapphireThe) decryption key ($K_S$) for the precise location is stored in an Oasis Confidential Smart Contract (CSM). The CSM only releases the key if the Celo L2 public state confirms the ZK-Proof ($\pi$) was valid. This ensures no one (not even the node runners) can steal the key before the emergency is verified.
- Privacy-Preserving Identity (Self Protocol + Aztec) Self Protocol verifies the humanity/uniqueness of the trusted contacts via ZK proof. Aztec is used to initiate the alert transaction privately, hiding the Prover's wallet address and the exact time of the alert from the public Celo ledger.
- Seamless UX (Celo/Account Abstraction) All cryptographic complexity is abstracted. The user simply triggers the alert (e.g., via a power button sequence), and the low-cost Celo network handles the gasless transaction execution.

[SisterSafe]

The project's objectives are centered on establishing a new paradigm for digital safety built on verifiable autonomy.

- Maximize User PrivacyAchieve. zero disclosure of raw location data until the immutable ZK condition is met and verified on-chain. Aligned with the Cypherpunk principle.
- Ensure Alert Integrity. Achieve 100% censorship resistance for the alert signal by using an L2 (Celo) to verify the ZK-Proof, ensuring the signal cannot be blocked by centralized entities. Key: Decentralization
- Establish Trustless Network. Integrate Self Protocol to ensure the trusted contact list is cryptographically Sybil-resistant and composed of verified, unique individuals.Feminist / Public GoodsDemonstrate Cross-Chain. Key: Confidentiality
- Successfully use Oasis Sapphire to execute the confidential logic, proving that ZK-verification on one chain (Celo/Aztec) can securely trigger a data release on another chain (Oasis).ETHGlobal / Technical Excellence

SisterSafe is not just feel secure. It’s a right to be free without fear.

[Human Solution]

a. Social Impact

The primary social impact of SisterSafe is the dismantling of the historical compromise between privacy and safety. It provides a technology that is non-invasive, accessible, and designed for real-world crisis intervention.

** Empowerment and Autonomy: It shifts control of sensitive location data from centralized, for-profit corporations back to the individual. The user is the sole authority over when their location is disclosed and to whom.
** Safety Net Integrity: By leveraging Self Protocol, the system ensures the safety network is composed of verified, unique humans (anti-Sybil attack). This guarantees the integrity of the crucial network needed for crisis response.
** Global Accessibility: Building on Celo L2 ensures that the system is cheap and mobile-first, making this life-saving technology economically viable for women in low-income or underbanked regions where data vulnerability is often highest.

b. Technical Innovation

SisterSafe is a showcase of cutting-edge multi-protocol integration to solve a previously intractable privacy problem.

**Zero-Knowledge Proofs for Geo-Verification: The core innovation is using zk-PoL (Proof of Location) to prove the state of danger (e.g., "I am outside my safe zone") without ever revealing the precise GPS coordinates to the blockchain. This is the ultimate privacy safeguard.
**Verifiable Confidential Compute: It establishes a trustless linkage between the ZK verification on Celo and the key release on Oasis Sapphire. The Oasis Confidential Smart Contract (CSM) ensures that the decryption key ($K_S$) is only released when the ZK-verified truth on Celo is confirmed, maintaining end-to-end data confidentiality.
** Transaction Privacy: Integrating Aztec Network ensures that the life-saving panic transaction itself is private, obscuring the user's wallet address and the exact time the alert was initiated from public view. This protects the user from potential targeted harassment or surveillance based on their on-chain activity.

c. Cypherpunk and Feminist Philosophy

The project is built entirely on the foundational principles of both movements: Privacy as Power and Autonomy as Safety.

** Cypherpunk:	"Code is Law" for Safety: The emergency logic is encoded immutably in the ZK circuit and Smart Contracts, replacing trust in institutions or centralized authorities with verifiable math. Privacy is non-negotiable and baked into the protocol via ZK and Oasis.
** Feminist:	Autonomy over Surveillance: The user is the sovereign owner of their data and safety graph. The system refuses to treat the user's location as a product or a target for surveillance. The technology is wielded as a defensive shield, not a monitoring tool.
** Synergy:	The project asserts that true safety for vulnerable groups is impossible without radical privacy. By combining ZK and confidential compute, zk-Alethea ensures the user maintains complete digital sovereignty even while seeking emergency assistance.

[Team]

* Dayana
* Cristina
* Sonia
* Paula
* Rocio

