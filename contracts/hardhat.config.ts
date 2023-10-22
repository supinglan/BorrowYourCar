import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://127.0.0.1:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0x7d27358b457dc8582081ed1e773847c6149047f71e50645a18c6726024a59231',
        '0xe65b05b7d5084c523517cdfaaf10491bc1728508845e23ef7270f5e2abda466d'
      ]
    },
  },
};

export default config;
