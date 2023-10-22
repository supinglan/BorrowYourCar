// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";
import "./QiushiToken.sol";
import "hardhat/console.sol";

contract BorrowYourCar is ERC721 {

    event CarBorrowed(uint256 carId, address borrower, uint256 startTime, uint256 duration);

    //车辆结构体
    struct Car {
        address owner;
        address borrower;
        uint256 borrowUntil;
        bool isAvailable;
    }
    //车辆列表
    mapping(uint256 => Car) public cars;
    //用户拥有的车辆列表
    mapping(address => uint256[]) public ownedCars;
    //空闲车辆列表
    uint256[] public availableCars;
    //已租车辆列表
    uint256[] public borrowedCars;
    //求是币合约
    QiushiToken public qiushiToken;



    constructor(address tokenAddress)ERC721("BorrowYourCar", "BYC"){
        qiushiToken = QiushiToken(tokenAddress);
    }

    function addCar() external{
        //随机生成车辆Id
        uint256 carId = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)));
        _safeMint(msg.sender, carId);
        //创建车辆
        cars[carId] = Car(msg.sender, address(0), 0, true);
        //将车辆加入车辆所有者的车辆列表
        ownedCars[msg.sender].push(carId);
        //将车辆加入空闲车辆列表
        availableCars.push(carId);
    }

    function getOwnedCars() external view returns (uint256[] memory) {
        return ownedCars[msg.sender];
    }

    function getAvailableCars() external view returns (uint256[] memory) {
        return availableCars;
    }

    //更新空闲车辆列表
    function updateInfo() external  {
        //检查是否有车辆已经超过借用时间
        for (uint i = 0; i < borrowedCars.length; i++) {
            //如果有车辆已经超过借用时间，将其加入空闲车辆列表，从已租车辆列表中移除
            if (uint256(cars[borrowedCars[i]].borrowUntil) < block.timestamp) {
                availableCars.push(borrowedCars[i]);
                removeValue(borrowedCars, borrowedCars[i]);
            }
        }
    }
    function getOwner(uint256 carId) public view returns(address){
        Car storage car =  cars[carId];
        return car.owner;
    }

    function getBorrower(uint256 carId) public view returns(address){
        //检查车辆是否已经超过借用时间
        if( uint256(cars[carId].borrowUntil) >=  block.timestamp){
            return  cars[carId].borrower;
        }
        else{
            return address(0);
        }
    }

    function borrowCar(uint256 carId, uint256 duration) external {
        //检查借用者是否为车辆所有者
        require(getOwner(carId) != msg.sender, "You are the owner of this car");
        Car storage car = cars[carId];
        //检查车辆是否可租
        require(car.isAvailable, "Car is not available for borrowing");
        //计算租车费用，每小时租车费用为1求是币
        uint256 rentalFee = duration / 3600;
        //检查用户余额是否足够支付租车费用
        require(qiushiToken.balanceOf(msg.sender) >= rentalFee, "Insufficient balance");
        //支付租车费用
        qiushiToken.transferFrom( msg.sender,car.owner, rentalFee);
        //更新车辆状态
        car.isAvailable = false;
        car.borrower = msg.sender;
        car.borrowUntil = block.timestamp + duration;
        //将车辆从空闲车辆列表中移除，加入已租车辆列表
        removeValue(availableCars, carId);
        borrowedCars.push(carId);
        //触发"CarBorrowed"事件
        emit CarBorrowed(carId, msg.sender, block.timestamp, duration);
    }


    //从数组中移除指定元素
    function removeValue(uint256[] storage array, uint256 value) internal {
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == value) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }

}

