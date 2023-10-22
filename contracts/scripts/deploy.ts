import { ethers } from "hardhat";

async function main() {
  const QiushiToken = await ethers.getContractFactory("QiushiToken");
  const qiushiToken = await QiushiToken.deploy();await qiushiToken.deployed();
  console.log(`QiushiToken deployed to  ${qiushiToken.address}`);
  const BorrowYourCar = await ethers.getContractFactory("BorrowYourCar");
  const borrowYourCar = await BorrowYourCar.deploy(qiushiToken.address);
  await borrowYourCar.deployed();
  console.log(`BorrowYourCar deployed to ${borrowYourCar.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});