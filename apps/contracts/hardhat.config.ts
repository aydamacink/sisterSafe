// Allow self-signed certificates for Celo testnet
// This must be set before any HTTPS connections are made
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    celocenpolia: {
      url: "https://forno.celo-sepolia.celo-testnet.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
