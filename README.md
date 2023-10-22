# 求是汽车租赁系统

## 如何运行

1. 在本地启动ganache应用并选择或创建一条测试链。

2. 在 `./contracts` 中安装需要的依赖，运行如下的命令：
    ```bash
    npm install
    ```
    
3. 在 `./contracts` 中编译合约，运行如下的命令：
    ```bash
    npx hardhat compile
    ```
    
4. 在 `./contracts` 中部署合约到ganache测试链上，运行如下的命令：

    `npx hardhat run ./scripts/deploy.ts --network ganache`

    将输出的合约部署地址填写到`./frontend/src/utils/contract-addresses.json`中

5. 复制`./contracts/artifacts/contracts/BorrowYourCar.sol/BorrowYourCar.json`和`./contracts/artifacts/contracts/QiushiToken.sol/QiushiToken.json`到`./frontend/src/utils/abis`中

6. 在 `./frontend` 中安装需要的依赖，运行如下的命令：
    ```bash
    npm install
    ```

7. 在 `./frontend` 中启动前端程序，运行如下的命令：

    ```bash
    npm run start
    ```


8. 在安装了MetaMask插件的浏览器中访问http://localhost:3000/以使用本系统

## 功能实现分析

1. 查看自己拥有的汽车列表，查看当前还没有被借用的汽车列表。

   在BorrowYourCar合约中维护用户id到用户拥有的汽车列表的映射，当前还没有被借用的汽车的数组，当车辆被借用、过期以及新增车辆时，对两个列表进行维护。

2. 查询一辆汽车的主人，以及该汽车当前的借用者(如果有)。

   在BorrowYourCar合约中维护汽车id到汽车结构体的映射，在汽车结构体中保存汽车的主人和当前借用者，通过映射即可实现查询，注意查询借用者时要注意检查借用是否已经过期。

3. 选择并借用某辆还没有被租借的汽车一定时间。

   当收到用户请求借用车辆时，合约首先检查车辆是否存在以及用户是否有足够的余额支付租赁费用，满足条件的情况下完成车辆租赁，并维护车辆信息、空闲车辆列表和已租车辆列表。

4. 使用自己发行的基于ERC20的积分求是币付费租赁汽车。

   使用继承ERC20的QiushiToken合约发行积分求是币，用户使用求是币支付租赁费用。当用户需要支付租赁费用时，需要先向BorrowYourCar合约授权相应费用，然后由BorrowYourCar合约在进行汽车租赁时完成支付。

## 项目运行截图

放一些项目运行截图。

项目运行成功的关键页面和流程截图。主要包括操作流程以及和区块链交互的截图。

## 参考内容

- 课程的参考Demo见：[DEMOs](https://github.com/LBruyne/blockchain-course-demos)。

- ERC-4907 [参考实现](https://eips.ethereum.org/EIPS/eip-4907)


