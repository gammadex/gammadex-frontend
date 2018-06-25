import Web3 from 'web3'
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import Config from '../Config'
import abiEtherDelta from '../config/etherdelta.json'
import etherDeltaBytecode from '../config/etherdeltabytecode.json'
import abiTestToken from '../config/testtoken.json'
import testTokenBytecode from '../config/testtokenbytecode.json'
import BigNumber from 'bignumber.js'
import _ from "lodash"

const web3 = new Web3(new Web3.providers.HttpProvider(Config.getWeb3Url()))

// This is the primary (only) account on the ganache node, which is used to deploy contracts and as a metamask proxy
const metamaskAddress = '0xfcad0b19bb29d4674531d6f115237e16afce377c'

// This is a dynamic account local to this test and the running instance of the smart contract
const primaryKeyAccount = web3.eth.accounts.create()

const threeGwei = web3.utils.toWei('3', 'gwei')

beforeAll(() => {
    /**
     * Deploy EtherDelta smart contract to ganache, capturing the contract instance globally
     * and shoe-horn that (dynamic) address into our test configuration
     */

    const edContract = new web3.eth.Contract(abiEtherDelta)
    const promiseDeployEdContract = edContract.deploy({
        data: etherDeltaBytecode.data,
        arguments: [metamaskAddress, metamaskAddress, "0x0", 0, 3000000000000000, 0]
    }).send({
        from: metamaskAddress,
        gas: 3000000,
        gasPrice: threeGwei
    }).then(newContractInstance => {
        global.edContractInstance = newContractInstance
        Config.getEnv().etherDeltaAddress = newContractInstance.options.address
    })

    /**
     * Deploy ERC-20 Test Token to ganache. The contract by default gives the owner (metamask) account 100 TEST
     */
    const testTokenContract = new web3.eth.Contract(abiTestToken)
    const promiseDeployTestTokenContract = testTokenContract.deploy({
        data: testTokenBytecode.data
    }).send({
        from: metamaskAddress,
        gas: 4700000,
        gasPrice: threeGwei
    }).then(newContractInstance => {
        global.testTokenContractInstance = newContractInstance

        // Transfer 10 TEST from the metamask to the private key account
        return newContractInstance.methods.transfer(primaryKeyAccount.address, web3.utils.toWei('10', 'ether'))
            .send({
                from: metamaskAddress,
                gas: 200000,
                gasPrice: threeGwei
            })
    })

    // Transfer 10 ETH from the metamask to the private key account
    const promiseTopupWalletEth = web3.eth.sendTransaction({
        from: metamaskAddress,
        to: primaryKeyAccount.address,
        value: web3.utils.toWei('10', 'ether')
    })


    return promiseDeployEdContract
        .then(promiseTopupWalletEth)
        .then(promiseDeployTestTokenContract)

})

function contractBalanceTest(promiseAction = () => { }, userAddress, tokenAddress, weiExpectedAmountDiff) {
    return edContractInstance.methods.balanceOf(tokenAddress, userAddress).call()
        .then(balBefore => {
            return promiseAction()
                .then(() => {
                    return edContractInstance.methods.balanceOf(tokenAddress, userAddress).call()
                        .then(balAfter => expect(balAfter).toEqual(
                            BigNumber(balBefore).plus(BigNumber(weiExpectedAmountDiff)).toFixed()))
                })
        })
}

function ethWalletBalanceTest(promiseAction = () => { }, userAddress, weiGasPrice, weiExpectedAmountDiff) {
    return web3.eth.getBalance(userAddress).then(balBefore => {
        return promiseAction()
            .then((receipt) => {
                // Tx Cost = Gas Price * Gas Used
                const weiGasCost = BigNumber(receipt.gasUsed).times(weiGasPrice)
                return web3.eth.getBalance(userAddress).then(balAfter => {
                    expect(balAfter).toEqual(BigNumber(balBefore).plus(weiExpectedAmountDiff.minus(weiGasCost)).toFixed())
                })
            })
    })
}

function gasTest(promiseAction = () => { }, weiGasPrice, gasLimit) {
    return promiseAction()
        .then(receipt => {
            return web3.eth.getTransaction(receipt.transactionHash)
                .then(tx => {
                    expect(tx.gasPrice).toEqual(weiGasPrice)
                    expect(tx.gas).toEqual(gasLimit)
                })
        })
}

function eventFromReceipt(receipt, eventName) {
    if (receipt.events) {
        // meta mask
        return receipt.events[eventName].returnValues
    } else {
        // private key
        const eventJsonInterface = _.find(
            edContractInstance.options.jsonInterface,
            o => o.name === eventName && o.type === 'event',
        )
        return web3.eth.abi.decodeLog(eventJsonInterface.inputs, receipt.logs[0].data, receipt.logs[0])
    }
}

function testTokenAddress() {
    return testTokenContractInstance.options.address
}
function testContract(userAddress) {
    describe('promiseDepositEther', () => {
        test('should increase exchange ETH balance', () => {
            const weiTestAmount = web3.utils.toWei('0.11', 'ether')
            return contractBalanceTest(
                () => EtherDeltaWeb3.promiseDepositEther(userAddress, nonce, weiTestAmount, web3.utils.toWei('1.11', 'gwei')),
                userAddress, Config.getBaseAddress(), weiTestAmount
            )
        })
        test('should decrease wallet ETH balance (accounting for gas fee)', () => {
            const weiTestAmount = web3.utils.toWei('0.12', 'ether')
            const weiGasPrice = web3.utils.toWei('1.12', 'gwei')
            return ethWalletBalanceTest(
                () => EtherDeltaWeb3.promiseDepositEther(userAddress, nonce, weiTestAmount, weiGasPrice),
                userAddress, weiGasPrice, BigNumber(weiTestAmount).negated()
            )
        })

        test('should use the gas settings provided by the user and app', () => {
            const weiGasPrice = web3.utils.toWei('1.13', 'gwei')
            return gasTest(
                () => EtherDeltaWeb3.promiseDepositEther(userAddress, nonce, web3.utils.toWei('0.13', 'ether'), weiGasPrice),
                weiGasPrice,
                Config.getGasLimit('deposit')
            )
        })

        test('ETH value sent with transaction should equal the deposit amount', () => {
            const weiDepositAmount = web3.utils.toWei('0.14', 'ether')
            return EtherDeltaWeb3.promiseDepositEther(userAddress, nonce, weiDepositAmount, web3.utils.toWei('1.14', 'gwei'))
                .then(receipt => {
                    return web3.eth.getTransaction(receipt.transactionHash)
                        .then(tx => {
                            expect(tx.value).toEqual(weiDepositAmount)
                        })
                })
        })

        test('Should generate a Deposit Event for this user and ETH deposit amount', () => {
            const weiDepositAmount = web3.utils.toWei('0.15', 'ether')
            return EtherDeltaWeb3.promiseDepositEther(userAddress, nonce, weiDepositAmount, web3.utils.toWei('1.15', 'gwei'))
                .then(receipt => {
                    const { token, user, amount } = eventFromReceipt(receipt, 'Deposit')
                    expect(token).toEqual(Config.getBaseAddress())
                    expect(user.toLowerCase()).toEqual(userAddress.toLowerCase())
                    expect(amount).toEqual(weiDepositAmount)
                })
        })
    })

    describe('promiseWithdrawEther', () => {
        test('should decrease exchange ETH balance', () => {
            const weiTestAmount = web3.utils.toWei('0.21', 'ether')
            return contractBalanceTest(
                () => EtherDeltaWeb3.promiseWithdrawEther(userAddress, nonce, weiTestAmount, web3.utils.toWei('1.21', 'gwei')),
                userAddress, Config.getBaseAddress(), BigNumber(weiTestAmount).negated())
        })
        test('should increase wallet ETH balance (accounting for gas fee)', () => {
            const weiTestAmount = web3.utils.toWei('0.22', 'ether')
            const weiGasPrice = web3.utils.toWei('1.22', 'gwei')
            return ethWalletBalanceTest(
                () => EtherDeltaWeb3.promiseDepositEther(userAddress, nonce, weiTestAmount, weiGasPrice),
                userAddress, weiGasPrice, BigNumber(weiTestAmount).negated()
            )
        })

        test('should use the gas settings provided by the user and app', () => {
            const weiGasPrice = web3.utils.toWei('1.23', 'gwei')
            return gasTest(
                () => EtherDeltaWeb3.promiseWithdrawEther(userAddress, nonce, web3.utils.toWei('0.23', 'ether'), weiGasPrice),
                weiGasPrice,
                Config.getGasLimit('withdraw')
            )
        })

        test('Should generate a Withdraw Event for this user and ETH withdraw amount', () => {
            const weiWithdrawAmount = web3.utils.toWei('0.24', 'ether')
            return EtherDeltaWeb3.promiseWithdrawEther(userAddress, nonce, weiWithdrawAmount, web3.utils.toWei('1.24', 'gwei'))
                .then(receipt => {
                    const { token, user, amount } = eventFromReceipt(receipt, 'Withdraw')
                    expect(token).toEqual(Config.getBaseAddress())
                    expect(user.toLowerCase()).toEqual(userAddress.toLowerCase())
                    expect(amount).toEqual(weiWithdrawAmount)
                })
        })
    })

    describe('promiseTokenApprove', () => {

        beforeEach(() => {
            // Per the test contract:
            // once you have approved an amount, the only way to reduce that approval amount is to:
            // - transfer it
            // - reset the approval amount to zero (which we do hear so future tests have clean state)
            return EtherDeltaWeb3.promiseTokenApprove(userAddress, nonce, testTokenAddress(), '0', threeGwei)
                .then(() => web3.eth.getTransactionCount(primaryKeyAccount.address).then(count => global.nonce = count))
        })

        test(`should allow the ED contract to deposit an amount of token on the user's behalf`, () => {
            const weiTestAmount = web3.utils.toWei('0.31', 'ether')
            return EtherDeltaWeb3.promiseTokenApprove(userAddress, nonce, testTokenAddress(), weiTestAmount, web3.utils.toWei('1.31', 'gwei'))
                .then(() => {
                    return testTokenContractInstance.methods.allowance(userAddress, Config.getEtherDeltaAddress()).call()
                        .then(allowance => expect(allowance).toEqual(weiTestAmount))
                })
        })

        test('should use the gas settings provided by the user and app', () => {
            const weiGasPrice = web3.utils.toWei('1.32', 'gwei')
            return gasTest(
                () => EtherDeltaWeb3.promiseTokenApprove(userAddress, nonce, testTokenAddress(), web3.utils.toWei('0.32', 'ether'), weiGasPrice),
                weiGasPrice,
                Config.getGasLimit('approveTokenDeposit')
            )
        })      
    })
}

describe('WalletAccountProvider', () => {

    beforeAll(() => {
        EtherDeltaWeb3.initForPrivateKey(primaryKeyAccount.address, primaryKeyAccount.privateKey.slice(2))
    })

    beforeEach(() => {
        return web3.eth.getTransactionCount(primaryKeyAccount.address).then(count => global.nonce = count)
    })

    test('refreshAccount should return wallet address and nonce', () => {
        return EtherDeltaWeb3.refreshAccount()
            .then(res => {
                const { address, nonce } = res
                expect(address.toLowerCase()).toEqual(primaryKeyAccount.address.toLowerCase())
                expect(nonce).toEqual(nonce)
            })
    })

    test('promiseRefreshNonce should return nonce', () => {
        return EtherDeltaWeb3.promiseRefreshNonce()
            .then(nonce => expect(nonce).toEqual(nonce))
    })

    testContract(primaryKeyAccount.address)
})

describe('MetaMaskAccountProvider', () => {

    beforeAll(() => {
        EtherDeltaWeb3.initForMetaMaskWeb3(web3)
        global.nonce = 0
    })

    // MetaMask handles the nonce internally so we do not need to track it
    test('refreshAccount should return wallet address and zero nonce', () => {
        return EtherDeltaWeb3.refreshAccount()
            .then(res => {
                const { address, nonce } = res
                expect(address.toLowerCase()).toEqual(metamaskAddress.toLowerCase())
                expect(nonce).toEqual(0)
            })
    })

    test('promiseRefreshNonce should return zero nonce', () => {
        return EtherDeltaWeb3.promiseRefreshNonce()
            .then(nonce => expect(nonce).toEqual(0))
    })

    testContract(metamaskAddress)
})

