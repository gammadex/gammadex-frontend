import Web3 from 'web3'
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import Config from '../Config'
import abiEtherDelta from '../config/etherdelta.json'
import etherDeltaBytecode from '../config/etherdeltabytecode.json'
import BigNumber from 'bignumber.js'

const web3 = new Web3(new Web3.providers.HttpProvider(Config.getWeb3Url()))

const userAddress = '0xfcad0b19bb29d4674531d6f115237e16afce377c'
const userPrivateKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

const weiGasPrice = '3000000000'

beforeAll(() => {
    const edContract = new web3.eth.Contract(abiEtherDelta)
    return edContract.deploy({
        data: `0x${etherDeltaBytecode.data}`,
        arguments: [userAddress, userAddress, "0x0", 0, 3000000000000000, 0]
    }).send({
        from: userAddress,
        gas: 3000000,
        gasPrice: weiGasPrice
    }).then(newContractInstance => {
        global.edContractInstance = newContractInstance

        Config.getEnv().etherDeltaAddress = newContractInstance.options.address
    })
})

describe('WalletAccountProvider', () => {

    beforeAll(() => {
        EtherDeltaWeb3.initForPrivateKey(userAddress, userPrivateKey)
        //EtherDeltaWeb3.initForMetaMaskWeb3(web3)
    })

    beforeEach(() => {
        return web3.eth.getTransactionCount(userAddress)
            .then(count => {
                global.walletCount = count
            })
    })

    test('refreshAccount should return wallet address and nonce', () => {
        return EtherDeltaWeb3.refreshAccount()
            .then(res => {
                const { address, nonce } = res
                expect(address.toLowerCase()).toEqual(userAddress.toLowerCase())
                expect(nonce).toEqual(walletCount)
            })
    })

    test('promiseRefreshNonce should return nonce', () => {
        return EtherDeltaWeb3.promiseRefreshNonce()
            .then(nonce => expect(nonce).toEqual(walletCount))
    })

    test('promiseDepositEther should deposit ether from wallet to smart contract', () => {
        const weiTwoEther = web3.utils.toWei('2', 'ether')
        return web3.eth.getBalance(userAddress).then(balanceBeforeDeposit => {
            return EtherDeltaWeb3.promiseDepositEther(userAddress, walletCount, weiTwoEther, weiGasPrice)
                .then(receipt => {
                    return web3.eth.getTransaction(receipt.transactionHash)
                        .then(tx => {
                            expect(tx.gasPrice).toEqual(weiGasPrice)
                            expect(tx.value).toEqual(weiTwoEther)
                            return web3.eth.getBalance(userAddress).then(balanceAfterDeposit => {
                                // End ETH Balance = Start ETH Balance - Deposit Amount - Tx Cost
                                // Tx Cost = Gas Price * Gas Used
                                expect(balanceAfterDeposit).toEqual(BigNumber(balanceBeforeDeposit)
                                    .minus(BigNumber(weiTwoEther)).minus(BigNumber(receipt.gasUsed).times(weiGasPrice)).toFixed())

                                return edContractInstance.methods.balanceOf(Config.getBaseAddress(), userAddress).call()
                                    .then(balance => expect(balance).toEqual(weiTwoEther))
                            })
                        })
                })
        })
    })
})
