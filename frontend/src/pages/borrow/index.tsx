import {Button} from 'antd';
import {useEffect, useState} from 'react';
import {borrowYourCarContract, qiushiTokenContract, web3} from "../../utils/contracts";
import './index.css';
import React from 'react';
import ImageComponent from '../../asset/images/ImageCompoent.js';

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

const LotteryPage = () => {

    //保存用户账户和余额
    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)
    //获取用户输入
    const [queryCarId, setQueryCarId] = useState('');
    const [borrowCarId, setBorrowCarId] = useState('');
    const [time, setTime] = useState('');
    //保存用户拥有的车辆
    const [myCars, setMyCars] = useState<Car[]>([]);
    //保存当前空闲的车辆
    const [availableCars, setAvailableCars] = useState<Car[]>([]);
    //车辆信息结构体
    class Car {
        constructor(public tokenId: number) {}
    }




    useEffect(() => {
        //初始化尝试获取用户账户
        const initCheckAccounts = async () => {
            // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
            // @ts-ignore
            const {ethereum} = window;
            // 如果存在，获取用户账户
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }
        initCheckAccounts()


    }, [])





    useEffect(() => {
        //监听用户账户变化，当账户变化时更新对应信息
        const getInfo = async () => {
            if (qiushiTokenContract) {
                //获取用户余额
                const ab = await qiushiTokenContract.methods.balanceOf(account).call()
                setAccountBalance(ab)
                //获取用户拥有的车辆
                let ownerCars = await borrowYourCarContract.methods.getOwnedCars().call({
                    from: account
                })
                const updatedMyCars = ownerCars.map((carId: number) => new Car(carId));
                setMyCars(updatedMyCars);
                //获取当前空闲的车辆
                let availableCars = await borrowYourCarContract.methods.getAvailableCars().call({
                    from: account
                })
                const updatedAvailableCars = availableCars.map((carId: number) => new Car(carId));
                setAvailableCars(updatedAvailableCars);
            } else {
                alert('合约不存在')
            }
        }

        if(account !== '') {
            getInfo()
        }
    }, [account])

    const borrowCar = async () => {

        if (account === '') {
            alert('未连接到钱包。')
            return
        }

        if (borrowYourCarContract&&qiushiTokenContract) {
            try {
                //向合约授权租赁费用
                await qiushiTokenContract.methods.approve(borrowYourCarContract.options.address,time).send({
                    from: account
                })
                //借用车辆
                await borrowYourCarContract.methods.borrowCar(borrowCarId, parseInt(time)*3600).send({
                    from: account
                })
                alert('借用成功。')
            } catch (error: any) {
                alert(error.message)
                console.log(error.message)
            }
        } else {
            alert('合约不存在。')
        }
    }

    const queryCar = async () => {

        if(account === '') {
            alert('未连接到钱包。')
            return
        }

        if (borrowYourCarContract) {
            try {
                //查询车辆信息
                const owner =  await borrowYourCarContract.methods.getOwner(queryCarId).call()
                const borrower =  await borrowYourCarContract.methods.getBorrower(queryCarId).call()
                //输出查询结果
                if(owner === '0x0000000000000000000000000000000000000000'){

                    alert('该车辆不存在,请检查输入的车辆ID是否正确')
                }
                else if(borrower === '0x0000000000000000000000000000000000000000'){
                    alert('车辆ID：' + queryCarId + '\n车主是：' + owner + '\n该车辆当前空闲')
                }
                else alert('车辆ID：' + queryCarId + '\n车主是：' + owner + '\n借用者是：' + borrower)
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('合约不存在。')
        }
    }

    const onClaimTokenAirdrop = async () => {
        if(account === '') {
            alert('')
            return
        }

        if (qiushiTokenContract) {
            try {
                await qiushiTokenContract.methods.airdrop().send({
                    from: account
                })
                alert('成功获取求是币空投。')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('合约不存在')
        }
    }

    const addCar = async () => {
        if(account === '') {
            alert('未连接到钱包。')
            return
        }

        if (borrowYourCarContract && qiushiTokenContract) {
            try {
                // 获取一辆新车
                await borrowYourCarContract.methods.addCar().send({
                    from: account
                })
                alert('成功获取新的车辆。')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('合约不存在')
        }
    }
    const updateInfo = async () => {
        if(account === '') {
            alert('未连接到钱包。')
            return
        }

        if (borrowYourCarContract && qiushiTokenContract) {
            try {
                // 更新空闲车辆列表
                await borrowYourCarContract.methods.updateInfo().send({
                    from: account
                })
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('合约不存在')
        }
    }

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('未安装MetaMask插件。');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    // @ts-ignore
    return (
        <div className='container'>
            <div className='main'>
                <h1>求是汽车租赁系统</h1>
                <Button onClick={onClaimTokenAirdrop}>领取求是币空投</Button>
                <div className='account'>
                    {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                    <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                    <div>当前用户拥有求是币数量：{account === '' ? 0 : accountBalance}</div>
                </div>
                <div>
                    <div style={{marginBottom: '5px'}}>我的车辆</div>
                    <ul >
                        {myCars.map((car, index) => (
                            <li key={index} style={{ flex: '0 0 25%' }}>
                                <span>车辆ID：{car.tokenId} </span>
                                <br></br>
                                <ImageComponent tokenId={car.tokenId} />
                            </li>
                        ))}
                    </ul>
                    <div style={{marginBottom: '5px'}}>空闲的车辆</div>
                    <ul>
                        {availableCars.map((car, index) => (
                            <li key={index}>
                                <span>车辆ID：{car.tokenId}</span>
                                <br></br>
                                <ImageComponent tokenId={car.tokenId} />
                            </li>
                        ))}
                    </ul>

                </div>
                <div className='operation'>
                    <div style={{marginBottom: '20px'}}>操作栏</div>
                    <div className='buttons'>
                        <Button style={{width: '200px'}} onClick={updateInfo}>更新可用汽车</Button>
                        {/*用于给用户发放测试用的汽车，在实际使用时去除该功能*/}
                        {/*<Button style={{width: '200px'}} onClick={addCar}>获取车辆</Button>*/}
                        <span>借用车辆需要支付每小时1求是币的租赁费用</span>
                        <div>
                            <span>车辆ID：</span>
                            <input type="number"style={{marginRight: '20px'}} value={borrowCarId} onChange={e => setBorrowCarId(e.target.value)} />
                            <span>借用时间（小时）：</span>
                            <input type="number"style={{marginRight: '20px'}} value={time} onChange={e => setTime(e.target.value)} />
                            <Button style={{width: '200px'}} onClick={borrowCar}>借用车辆</Button>
                        </div>

                        <div>
                            <span>车辆ID：</span>
                            <input type="number"style={{marginRight: '20px'}} value={queryCarId} onChange={e => setQueryCarId(e.target.value)} />
                            <Button style={{width: '200px'}} onClick={queryCar}>查询车辆</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LotteryPage