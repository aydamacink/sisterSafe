import { ethers } from "hardhat";

async function main() {
  const SisterSafeCircle = await ethers.getContractFactory("SisterSafeCircle");
  const sisterSafe = await SisterSafeCircle.deploy();

  await sisterSafe.waitForDeployment();

  console.log("✅ SisterSafeCircle deployed to:", await sisterSafe.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
