// SPDX-License-Identifier: UNLICENSED
import { ethers } from "hardhat";
import { assert } from "chai";
const { expect } = require("chai");
import { BigNumber, Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";


describe("Test", function () {

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, borrower] = await ethers.getSigners();
    const QiushiToken = await ethers.getContractFactory("QiushiToken");
    const qiushiToken = await QiushiToken.deploy();
    await qiushiToken.deployed();
    const BorrowYourCar = await ethers.getContractFactory("BorrowYourCar");
    const borrowYourCar = await BorrowYourCar.deploy(qiushiToken.address);
    await borrowYourCar.deployed();


    return { borrowYourCar,qiushiToken, owner, borrower };
  }
  it("should add a car", async function () {
    const {borrowYourCar,qiushiToken,owner,borrower } = await loadFixture(deployFixture);
    await borrowYourCar.addCar();
    const ownedCars: BigNumber[] = await borrowYourCar.getOwnedCars();
    const availableCars: BigNumber[] = await borrowYourCar.getAvailableCars();

    assert.equal(ownedCars.length, 1, "Owned cars count should be 1");
    assert.equal(availableCars.length, 1, "Available cars count should be 1");
    assert.equal(await borrowYourCar.getOwner(availableCars[0]), owner.address, "Owner of the car should be the owner address");
  });

  it("should borrow a car", async function () {
    const { borrowYourCar,qiushiToken,owner,borrower } = await loadFixture(deployFixture);
    await borrowYourCar.addCar();
    const availableCarsBefore: BigNumber[] = await borrowYourCar.getAvailableCars();
    const carId: BigNumber = availableCarsBefore[0];

    await qiushiToken.connect(borrower).airdrop();
    const borrowerBalanceBefore: BigNumber = await qiushiToken.balanceOf(borrower.address);
    const ownerBalanceBefore: BigNumber = await qiushiToken.balanceOf(owner.address);

    await qiushiToken.connect(borrower).approve(borrowYourCar.address,borrowerBalanceBefore);
    await borrowYourCar.connect(borrower).borrowCar(carId, 3600);

    const borrowerBalanceAfter: BigNumber = await qiushiToken.balanceOf(borrower.address);
    const ownerBalanceAfter: BigNumber = await qiushiToken.balanceOf(owner.address);
    assert.equal(borrowerBalanceAfter.toString(), borrowerBalanceBefore.sub(1).toString(), "Borrower balance should be decreased by 3600");
    assert.equal(ownerBalanceAfter.toString(), ownerBalanceBefore.add(1).toString(), "Owner balance should be increased by 3600");
    const availableCarsAfter: BigNumber[] = await borrowYourCar.getAvailableCars();
    assert.equal(availableCarsAfter.length, 0, "Available cars count should be 0 after borrowing");
    assert.equal(await borrowYourCar.getBorrower(carId), borrower.address, "Borrower of the car should be the borrower address");
    await expect(borrowYourCar.connect(borrower).borrowCar(carId, 1)).to.be.revertedWith("Car is not available for borrowing");
  });
});






