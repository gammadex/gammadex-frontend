/**
 * EtherDeltaWeb3 is our own abstraction on top of web3, which allows us to inject two distinct providers: MetaMask and private key
 * - both of which exercise different code paths. MetaMask uses direct contract calls, Private Key uses signed raw transactions.
 * 
 * This tests EtherDeltaWeb3 by deploying EtherDelta and a Test ERC-20 Token onto a local (ganache) blockchain and explicitly
 * tests both providers / codepaths.
 * 
 * One important point is that in this part of the gammadex codebase *decimals are irrelevalent* since everything talks and
 * expects "wei".
 * 
 */


// ESLint
/* global global, nonce, takerBuyOrder, orderTakerAccount, orderMakerAccount, orderMakerNonce, orderTakerNonce, takerSellOrder, edContractInstance, testTokenContractInstance */

import Web3 from 'web3'
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import Config from '../Config'
import BigNumber from 'bignumber.js'
import _ from "lodash"
import OrderFactory from '../OrderFactory'
import OrderSide from '../OrderSide'
import {deployContracts} from '../util/ContractDeployer'
import TokenStore from "../stores/TokenStore"

const web3 = new Web3(new Web3.providers.HttpProvider(Config.getWeb3Url()))

// This is the primary (only) account on the ganache node, which is used to deploy contracts and as a metamask proxy
const metamaskAddress = '0xfcad0b19bb29d4674531d6f115237e16afce377c'

// This is a dynamic account local to this test and the running instance of the smart contract
const primaryKeyAccount = web3.eth.accounts.create()

// receives fees from the ED contract
const feeAccount = web3.eth.accounts.create()

const defaultGasPrice = web3.utils.toWei('3', 'gwei')

beforeAll(() => {
    return deployContracts(web3, metamaskAddress, feeAccount, primaryKeyAccount, defaultGasPrice)
        .then(() => {
            const tok = {
                address: testTokenContractInstance.options.address,
                decimals: 18,
                isListed: true,
                name: null,
                symbol: 'ABC'
            }
            TokenStore.listedTokens = [ tok ]
            TokenStore.allTokens = [ tok ]
        })
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

function tokWalletBalanceTest(promiseAction = () => { }, userAddress, weiExpectedAmountDiff) {
    return testTokenContractInstance.methods.balanceOf(userAddress).call()
        .then(balBefore => {
            return promiseAction()
                .then(() => {
                    return testTokenContractInstance.methods.balanceOf(userAddress).call()
                        .then(balAfter => {
                            expect(balAfter).toEqual(BigNumber(balBefore).plus(weiExpectedAmountDiff).toFixed())
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
        let data = receipt.logs[0].data
        let log = receipt.logs[0]
        // interesting case where we get two log events generated for the token deposit in ganache...
        if (receipt.logs.length === 2) {
            data = receipt.logs[1].data
            log = receipt.logs[1]
        }
        return web3.eth.abi.decodeLog(eventJsonInterface.inputs, data, log)
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
            return EtherDeltaWeb3.promiseTokenApprove(userAddress, nonce, testTokenAddress(), '0', defaultGasPrice)
                .then(() => web3.eth.getTransactionCount(userAddress).then(count => global.nonce = count))
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

    describe('promiseDepositToken', () => {

        beforeEach(() => {
            return EtherDeltaWeb3.promiseTokenApprove(userAddress, nonce, testTokenAddress(), '0', defaultGasPrice)
                .then(() => web3.eth.getTransactionCount(userAddress).then(count => global.nonce = count))
        })

        test('should increase exchange TEST token balance', () => {
            const weiTestAmount = web3.utils.toWei('0.41', 'ether')
            return contractBalanceTest(
                () => {
                    return EtherDeltaWeb3.promiseTokenApprove(userAddress, nonce, testTokenAddress(), weiTestAmount, defaultGasPrice)
                        .then(() => {
                            return EtherDeltaWeb3.promiseDepositToken(userAddress, nonce + 1, testTokenAddress(), weiTestAmount, web3.utils.toWei('1.41', 'gwei'))
                        })
                },
                userAddress, testTokenAddress(), weiTestAmount
            )
        })
        test('should decrease wallet TEST token balance', () => {
            const weiTestAmount = web3.utils.toWei('0.42', 'ether')
            return tokWalletBalanceTest(
                () => {
                    return EtherDeltaWeb3.promiseTokenApprove(userAddress, nonce, testTokenAddress(), weiTestAmount, defaultGasPrice)
                        .then(() => {
                            return EtherDeltaWeb3.promiseDepositToken(userAddress, nonce + 1, testTokenAddress(), weiTestAmount, web3.utils.toWei('1.42', 'gwei'))
                        })
                },
                userAddress, BigNumber(weiTestAmount).negated()
            )
        })

        test('should use the gas settings provided by the user and app', () => {
            const weiTestAmount = web3.utils.toWei('0.43', 'ether')
            const weiGasPrice = web3.utils.toWei('1.43', 'gwei')
            return gasTest(
                () => {
                    return EtherDeltaWeb3.promiseTokenApprove(userAddress, nonce, testTokenAddress(), weiTestAmount, defaultGasPrice)
                        .then(() => {
                            return EtherDeltaWeb3.promiseDepositToken(userAddress, nonce + 1, testTokenAddress(), weiTestAmount, weiGasPrice)
                        })
                },
                weiGasPrice,
                Config.getGasLimit('depositToken')
            )
        })

        test('Should generate a Deposit Event for this user and TEST token deposit amount', () => {
            const weiDepositAmount = web3.utils.toWei('0.44', 'ether')
            return EtherDeltaWeb3.promiseTokenApprove(userAddress, nonce, testTokenAddress(), weiDepositAmount, defaultGasPrice)
                .then(() => {
                    return EtherDeltaWeb3.promiseDepositToken(userAddress, nonce + 1, testTokenAddress(), weiDepositAmount, web3.utils.toWei('1.44', 'gwei'))
                        .then(receipt => {
                            const { token, user, amount } = eventFromReceipt(receipt, 'Deposit')
                            expect(token).toEqual(testTokenAddress())
                            expect(user.toLowerCase()).toEqual(userAddress.toLowerCase())
                            expect(amount).toEqual(weiDepositAmount)
                        })
                })
        })
    })

    describe('promiseWithdrawToken', () => {

        beforeEach(() => {
            const depositAmount = web3.utils.toWei('1', 'ether')
            return EtherDeltaWeb3.promiseTokenApprove(userAddress, nonce, testTokenAddress(), '0', defaultGasPrice)
                .then(() => {
                    return EtherDeltaWeb3.promiseTokenApprove(userAddress, nonce + 1, testTokenAddress(), depositAmount, defaultGasPrice)
                        .then(() => {
                            return EtherDeltaWeb3.promiseDepositToken(userAddress, nonce + 2, testTokenAddress(), depositAmount, defaultGasPrice)
                                .then(() => {
                                    return web3.eth.getTransactionCount(userAddress).then(count => global.nonce = count)
                                })
                        })
                })
        })

        test('should decrease exchange TEST token balance', () => {
            const weiTestAmount = web3.utils.toWei('0.51', 'ether')
            return contractBalanceTest(
                () => EtherDeltaWeb3.promiseWithdrawToken(userAddress, nonce, testTokenAddress(), weiTestAmount, web3.utils.toWei('1.51', 'gwei')),
                userAddress, testTokenAddress(), BigNumber(weiTestAmount).negated())
        })

        test('should increase wallet TEST token balance', () => {
            const weiTestAmount = web3.utils.toWei('0.52', 'ether')
            return tokWalletBalanceTest(
                () => EtherDeltaWeb3.promiseWithdrawToken(userAddress, nonce, testTokenAddress(), weiTestAmount, web3.utils.toWei('1.52', 'gwei')),
                userAddress, BigNumber(weiTestAmount)
            )
        })

        test('should use the gas settings provided by the user and app', () => {
            const weiGasPrice = web3.utils.toWei('1.53', 'gwei')
            return gasTest(
                () => EtherDeltaWeb3.promiseWithdrawToken(userAddress, nonce, testTokenAddress(), web3.utils.toWei('0.53', 'ether'), weiGasPrice),
                weiGasPrice,
                Config.getGasLimit('withdrawToken')
            )
        })

        test('Should generate a Withdraw Event for this user and TEST token withdraw amount', () => {
            const weiWithdrawAmount = web3.utils.toWei('0.54', 'ether')
            return EtherDeltaWeb3.promiseWithdrawToken(userAddress, nonce, testTokenAddress(), weiWithdrawAmount, web3.utils.toWei('1.54', 'gwei'))
                .then(receipt => {
                    const { token, user, amount } = eventFromReceipt(receipt, 'Withdraw')
                    expect(token).toEqual(testTokenAddress())
                    expect(user.toLowerCase()).toEqual(userAddress.toLowerCase())
                    expect(amount).toEqual(weiWithdrawAmount)
                })
        })
    })

    describe('promiseTrade', () => {
        describe('Trade Taker BUY (aka Maker SELL)', () => {
            beforeEach(() => {
                return web3.eth.getTransactionCount(userAddress).then(count => global.nonce = count)
            })
            test(`Should increase Taker's TEST exchange balance`, () => {
                const order = createTestOrder(OrderSide.SELL)
                return edContractInstance.methods.balanceOf(testTokenAddress(), userAddress).call().then(tokenExchangeBalanceBefore => {
                    return EtherDeltaWeb3.promiseTrade(userAddress, nonce, order, order.amountGet, defaultGasPrice)
                        .then(() => {
                            return edContractInstance.methods.balanceOf(testTokenAddress(), userAddress).call().then(tokenExchangeBalanceAfter => {
                                expect(tokenExchangeBalanceAfter).toEqual(BigNumber(tokenExchangeBalanceBefore).plus(BigNumber(order.amountGive)).toFixed())
                            })
                        })
                })
            })
            test(`Should decrease Maker's TEST exchange balance`, () => {
                const order = createTestOrder(OrderSide.SELL)
                return edContractInstance.methods.balanceOf(testTokenAddress(), orderMakerAccount.address).call().then(tokenExchangeBalanceBefore => {
                    return EtherDeltaWeb3.promiseTrade(userAddress, nonce, order, order.amountGet, defaultGasPrice)
                        .then(() => {
                            return edContractInstance.methods.balanceOf(testTokenAddress(), orderMakerAccount.address).call().then(tokenExchangeBalanceAfter => {
                                expect(tokenExchangeBalanceAfter).toEqual(BigNumber(tokenExchangeBalanceBefore).minus(BigNumber(order.amountGive)).toFixed())
                            })
                        })
                })
            })
            test(`Should decrease Taker's ETH exchange balance (accounting for Fee payable in ETH)`, () => {
                const order = createTestOrder(OrderSide.SELL)
                return edContractInstance.methods.balanceOf(Config.getBaseAddress(), userAddress).call().then(ethExchangeBalanceBefore => {
                    return EtherDeltaWeb3.promiseTrade(userAddress, nonce, order, order.amountGet, defaultGasPrice)
                        .then(() => {
                            return edContractInstance.methods.balanceOf(Config.getBaseAddress(), userAddress).call().then(ethExchangeBalanceAfter => {
                                const feeEth = BigNumber(order.amountGet).times(BigNumber('0.003'))
                                expect(ethExchangeBalanceAfter)
                                    .toEqual(BigNumber(ethExchangeBalanceBefore).minus(BigNumber(order.amountGet).plus(feeEth)).toFixed())
                            })
                        })
                })
            })
            test(`Should increase Maker's ETH exchange balance`, () => {
                const order = createTestOrder(OrderSide.SELL)
                return edContractInstance.methods.balanceOf(Config.getBaseAddress(), orderMakerAccount.address).call().then(ethExchangeBalanceBefore => {
                    return EtherDeltaWeb3.promiseTrade(userAddress, nonce, order, order.amountGet, defaultGasPrice)
                        .then(() => {
                            return edContractInstance.methods.balanceOf(Config.getBaseAddress(), orderMakerAccount.address).call().then(ethExchangeBalanceAfter => {
                                expect(ethExchangeBalanceAfter).toEqual(BigNumber(ethExchangeBalanceBefore).plus(BigNumber(order.amountGet)).toFixed())
                            })
                        })
                })
            })
            test(`Should increase the Fee Accounts's ETH exchange balance`, () => {
                const order = createTestOrder(OrderSide.SELL)
                return edContractInstance.methods.balanceOf(Config.getBaseAddress(), feeAccount.address).call().then(ethExchangeBalanceBefore => {
                    return EtherDeltaWeb3.promiseTrade(userAddress, nonce, order, order.amountGet, defaultGasPrice)
                        .then(() => {
                            return edContractInstance.methods.balanceOf(Config.getBaseAddress(), feeAccount.address).call().then(ethExchangeBalanceAfter => {
                                const feeEth = BigNumber(order.amountGet).times(BigNumber('0.003'))
                                expect(ethExchangeBalanceAfter).toEqual(BigNumber(ethExchangeBalanceBefore).plus(BigNumber(feeEth)).toFixed())
                            })
                        })
                })
            })
            test('should use the gas settings provided by the user and app', () => {
                const weiGasPrice = web3.utils.toWei('1.61', 'gwei')
                const order = createTestOrder(OrderSide.SELL)
                return gasTest(
                    () => EtherDeltaWeb3.promiseTrade(userAddress, nonce, order, order.amountGet, weiGasPrice),
                    weiGasPrice,
                    Config.getGasLimit('trade')
                )
            })
            test('Should generate a Trade Event for this user and TEST token withdraw amount', () => {
                const order = createTestOrder(OrderSide.SELL)
                return EtherDeltaWeb3.promiseTrade(userAddress, nonce, order, order.amountGet, defaultGasPrice)
                    .then(receipt => {
                        const { tokenGet, amountGet, tokenGive, amountGive, get, give } = eventFromReceipt(receipt, 'Trade')
                        expect(tokenGet).toEqual(Config.getBaseAddress())
                        expect(BigNumber(amountGet).toFixed()).toEqual(BigNumber(order.amountGet).toFixed())
                        expect(tokenGive).toEqual(testTokenAddress())
                        expect(BigNumber(amountGive).toFixed()).toEqual(BigNumber(order.amountGive).toFixed())
                        expect(get.toLowerCase()).toEqual(orderMakerAccount.address.toLowerCase())
                        expect(give.toLowerCase()).toEqual(userAddress.toLowerCase())
                    })
            })
        })

        describe('Trade Taker SELL (aka Maker BUY)', () => {
            beforeEach(() => {
                return web3.eth.getTransactionCount(userAddress).then(count => global.nonce = count)
            })
            test(`Should increase Taker's ETH exchange balance`, () => {
                const order = createTestOrder(OrderSide.BUY)
                return edContractInstance.methods.balanceOf(Config.getBaseAddress(), userAddress).call().then(ethExchangeBalanceBefore => {
                    return EtherDeltaWeb3.promiseTrade(userAddress, nonce, order, order.amountGet, defaultGasPrice)
                        .then(() => {
                            return edContractInstance.methods.balanceOf(Config.getBaseAddress(), userAddress).call().then(ethExchangeBalanceAfter => {
                                expect(ethExchangeBalanceAfter).toEqual(BigNumber(ethExchangeBalanceBefore).plus(BigNumber(order.amountGive)).toFixed())
                            })
                        })
                })
            })
            test(`Should decrease Maker's ETH exchange balance`, () => {
                const order = createTestOrder(OrderSide.BUY)
                return edContractInstance.methods.balanceOf(Config.getBaseAddress(), orderMakerAccount.address).call().then(ethExchangeBalanceBefore => {
                    return EtherDeltaWeb3.promiseTrade(userAddress, nonce, order, order.amountGet, defaultGasPrice)
                        .then(() => {
                            return edContractInstance.methods.balanceOf(Config.getBaseAddress(), orderMakerAccount.address).call().then(ethExchangeBalanceAfter => {
                                expect(ethExchangeBalanceAfter).toEqual(BigNumber(ethExchangeBalanceBefore).minus(BigNumber(order.amountGive)).toFixed())
                            })
                        })
                })
            })
            test(`Should decrease Taker's TEST exchange balance (accounting for Fee payable in TEST token)`, () => {
                const order = createTestOrder(OrderSide.BUY)
                return edContractInstance.methods.balanceOf(testTokenAddress(), userAddress).call().then(tokenExchangeBalanceBefore => {
                    return EtherDeltaWeb3.promiseTrade(userAddress, nonce, order, order.amountGet, defaultGasPrice)
                        .then(() => {
                            return edContractInstance.methods.balanceOf(testTokenAddress(), userAddress).call().then(tokenExchangeBalanceAfter => {
                                const feeTestToken = BigNumber(order.amountGet).times(BigNumber('0.003'))
                                expect(tokenExchangeBalanceAfter)
                                    .toEqual(BigNumber(tokenExchangeBalanceBefore).minus(BigNumber(order.amountGet).plus(feeTestToken)).toFixed())
                            })
                        })
                })
            })
            test(`Should increase Maker's TEST exchange balance`, () => {
                const order = createTestOrder(OrderSide.BUY)
                return edContractInstance.methods.balanceOf(testTokenAddress(), orderMakerAccount.address).call().then(tokenExchangeBalanceBefore => {
                    return EtherDeltaWeb3.promiseTrade(userAddress, nonce, order, order.amountGet, defaultGasPrice)
                        .then(() => {
                            return edContractInstance.methods.balanceOf(testTokenAddress(), orderMakerAccount.address).call().then(tokenExchangeBalanceAfter => {
                                expect(tokenExchangeBalanceAfter).toEqual(BigNumber(tokenExchangeBalanceBefore).plus(BigNumber(order.amountGet)).toFixed())
                            })
                        })
                })
            })
            test(`Should increase the Fee Accounts's TEST exchange balance`, () => {
                const order = createTestOrder(OrderSide.BUY)
                return edContractInstance.methods.balanceOf(testTokenAddress(), feeAccount.address).call().then(tokenExchangeBalanceBefore => {
                    return EtherDeltaWeb3.promiseTrade(userAddress, nonce, order, order.amountGet, defaultGasPrice)
                        .then(() => {
                            return edContractInstance.methods.balanceOf(testTokenAddress(), feeAccount.address).call().then(tokenExchangeBalanceAfter => {
                                const feeTestToken = BigNumber(order.amountGet).times(BigNumber('0.003'))
                                expect(tokenExchangeBalanceAfter).toEqual(BigNumber(tokenExchangeBalanceBefore).plus(BigNumber(feeTestToken)).toFixed())
                            })
                        })
                })
            })
            test('should use the gas settings provided by the user and app', () => {
                const weiGasPrice = web3.utils.toWei('1.71', 'gwei')
                const order = createTestOrder(OrderSide.BUY)
                return gasTest(
                    () => EtherDeltaWeb3.promiseTrade(userAddress, nonce, order, order.amountGet, weiGasPrice),
                    weiGasPrice,
                    Config.getGasLimit('trade')
                )
            })
            test('Should generate a Trade Event for this user and TEST token withdraw amount', () => {
                const order = createTestOrder(OrderSide.BUY)
                return EtherDeltaWeb3.promiseTrade(userAddress, nonce, order, order.amountGet, defaultGasPrice)
                    .then(receipt => {
                        const { tokenGet, amountGet, tokenGive, amountGive, get, give } = eventFromReceipt(receipt, 'Trade')
                        expect(tokenGive).toEqual(Config.getBaseAddress())
                        expect(BigNumber(amountGet).toFixed()).toEqual(BigNumber(order.amountGet).toFixed())
                        expect(tokenGet).toEqual(testTokenAddress())
                        expect(BigNumber(amountGive).toFixed()).toEqual(BigNumber(order.amountGive).toFixed())
                        expect(get.toLowerCase()).toEqual(orderMakerAccount.address.toLowerCase())
                        expect(give.toLowerCase()).toEqual(userAddress.toLowerCase())
                    })
            })
        })
    })
}

function testRefreshEthAndTokBalance(userAddress) {
    test(`Should return user's wallet and exchange balance for ETH and TEST token`, () => {
        return web3.eth.getBalance(userAddress).then(ethWalletBalance => {
            return testTokenContractInstance.methods.balanceOf(userAddress).call().then(tokenWalletBalance => {
                return edContractInstance.methods.balanceOf(Config.getBaseAddress(), userAddress).call().then(ethExchangeBalance => {
                    return edContractInstance.methods.balanceOf(testTokenAddress(), userAddress).call().then(tokenExchangeBalance => {
                        return EtherDeltaWeb3.refreshEthAndTokBalance(userAddress, testTokenAddress()).then(bal => {
                            expect(bal[0]).toEqual(ethWalletBalance)
                            expect(bal[1]).toEqual(tokenWalletBalance)
                            expect(bal[2]).toEqual(ethExchangeBalance)
                            expect(bal[3]).toEqual(tokenExchangeBalance)
                        })
                    })
                })
            })
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

    describe('testContract', () => {
        beforeAll(() => {
            return createTradeableAccount()
                .then(maker => {
                    global.orderMakerAccount = maker
                    EtherDeltaWeb3.initForPrivateKey(primaryKeyAccount.address, primaryKeyAccount.privateKey.slice(2))
                })
        })
        testContract(primaryKeyAccount.address)
    })
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

    describe('testContract', () => {
        beforeAll(() => {
            return createTradeableAccount()
                .then(maker => {
                    global.orderMakerAccount = maker
                    EtherDeltaWeb3.initForMetaMaskWeb3(web3)
                    global.nonce = 0
                })
        })
        testContract(metamaskAddress)
    })
})

// creates a new account with 5 ETH and 5 TEST tokens in both wallet and exchange
function createTradeableAccount() {
    const tradeableAccount = web3.eth.accounts.create()
    EtherDeltaWeb3.initForPrivateKey(tradeableAccount.address, tradeableAccount.privateKey.slice(2))
    return testTokenContractInstance.methods.transfer(tradeableAccount.address, web3.utils.toWei('10', 'ether'))
        .send({ from: metamaskAddress, gas: 200000, gasPrice: defaultGasPrice })
        .then(() => {
            return web3.eth.sendTransaction({ from: metamaskAddress, to: tradeableAccount.address, value: web3.utils.toWei('10', 'ether') })
                .then(() => {
                    return EtherDeltaWeb3.promiseDepositEther(tradeableAccount.address, 0, web3.utils.toWei('5', 'ether'), defaultGasPrice)
                        .then(() => {
                            return EtherDeltaWeb3.promiseTokenApprove(tradeableAccount.address, 1, testTokenAddress(), web3.utils.toWei('5', 'ether'), defaultGasPrice)
                                .then(() => {
                                    return EtherDeltaWeb3.promiseDepositToken(tradeableAccount.address, 2, testTokenAddress(), web3.utils.toWei('5', 'ether'), defaultGasPrice)
                                        .then(() => {
                                            return tradeableAccount
                                        })
                                })
                        })
                })
        })
}

function createTestOrder(makerSide) {
    const expiry = 100000
    const price = 0.02 // ETH per TEST token
    const amount = 0.4 // TEST tokens
    return OrderFactory.createSignedOrder(
        makerSide,
        expiry,
        price,
        amount,
        testTokenAddress(),
        orderMakerAccount.address,
        orderMakerAccount.privateKey)
}

describe('Account Provider independent functions', () => {

    beforeAll(() => {
        return createTradeableAccount()
            .then(maker => {
                global.orderMakerAccount = maker
                return createTradeableAccount()
                    .then(taker => {
                        global.orderTakerAccount = taker
                    })
            })
    })

    beforeEach(() => {
        return web3.eth.getTransactionCount(orderMakerAccount.address).then(count => {
            global.orderMakerNonce = count
            return web3.eth.getTransactionCount(orderTakerAccount.address).then(count => {
                global.orderTakerNonce = count
            })
        })
    })

    describe('promiseCurrentBlockNumber', () => {
        test('should return the current block number', () => {
            return EtherDeltaWeb3.promiseCurrentBlockNumber()
                .then(blockNumber => {
                    return web3.eth.getBlockNumber()
                        .then(expectedBlockNumber => {
                            expect(blockNumber).toEqual(expectedBlockNumber)
                        })
                })
        })
    })

    describe('MetaMask balance check', () => {
        testRefreshEthAndTokBalance(metamaskAddress)
    })

    describe('Wallet balance check', () => {
        testRefreshEthAndTokBalance(primaryKeyAccount.address)
    })

    describe('State queries for Taker BUY (aka Maker SELL)', () => {
        beforeAll(() => {
            global.takerBuyOrder = createTestOrder(OrderSide.SELL)
        })
        describe('promiseTestTrade', () => {
            test('should return true if the Taker wants to fully fill the order', () => {
                return EtherDeltaWeb3.promiseTestTrade(orderTakerAccount.address, takerBuyOrder, takerBuyOrder.amountGet)
                    .then(canTrade => expect(canTrade).toBe(true))
            })
            test('should return true if the Taker wants to partially fill the order', () => {
                return EtherDeltaWeb3.promiseTestTrade(orderTakerAccount.address, takerBuyOrder, BigNumber(takerBuyOrder.amountGet).times(BigNumber('0.5')))
                    .then(canTrade => expect(canTrade).toBe(true))
            })
            test('should return false if the Taker amount is zero', () => {
                return EtherDeltaWeb3.promiseTestTrade(orderTakerAccount.address, takerBuyOrder, '0')
                    .then(canTrade => expect(canTrade).toBe(false))
            })
            test('should return false if the Taker tries to over-fill the order', () => {
                return EtherDeltaWeb3.promiseTestTrade(orderTakerAccount.address, takerBuyOrder, BigNumber(takerBuyOrder.amountGet).times(BigNumber('2')))
                    .then(canTrade => expect(canTrade).toBe(false))
            })
            test('should return false if the Maker does not have TEST tokens to sell', () => {
                EtherDeltaWeb3.initForPrivateKey(orderMakerAccount.address, orderMakerAccount.privateKey.slice(2))
                // maker withdraws all TEST tokens from exchange
                return edContractInstance.methods.balanceOf(testTokenAddress(), orderMakerAccount.address).call().then(tokenBalance => {
                    return EtherDeltaWeb3.promiseWithdrawToken(orderMakerAccount.address, orderMakerNonce, testTokenAddress(), tokenBalance, defaultGasPrice)
                        .then(() => {
                            return EtherDeltaWeb3.promiseTestTrade(orderTakerAccount.address, takerBuyOrder, takerBuyOrder.amountGet)
                                .then(canTrade => {
                                    expect(canTrade).toBe(false)
                                    // maker re-deposits TEST tokens to exchange as a test cleanup
                                    return EtherDeltaWeb3.promiseTokenApprove(orderMakerAccount.address, orderMakerNonce + 1, testTokenAddress(), tokenBalance, defaultGasPrice)
                                        .then(() => {
                                            return EtherDeltaWeb3.promiseDepositToken(orderMakerAccount.address, orderMakerNonce + 2, testTokenAddress(), tokenBalance, defaultGasPrice)
                                        })
                                })
                        })
                })
            })
            test('should return false if the Taker does not have ETH to buy the TEST tokens', () => {
                EtherDeltaWeb3.initForPrivateKey(orderTakerAccount.address, orderTakerAccount.privateKey.slice(2))
                // taker withdraws all ETH from exchange
                return edContractInstance.methods.balanceOf(Config.getBaseAddress(), orderTakerAccount.address).call().then(etherBalance => {
                    return EtherDeltaWeb3.promiseWithdrawEther(orderTakerAccount.address, orderTakerNonce, etherBalance, defaultGasPrice)
                        .then(() => {
                            return EtherDeltaWeb3.promiseTestTrade(orderTakerAccount.address, takerBuyOrder, takerBuyOrder.amountGet)
                                .then(canTrade => {
                                    expect(canTrade).toBe(false)
                                    // taker re-deposits ETH to exchange as a test cleanup
                                    return EtherDeltaWeb3.promiseDepositEther(orderTakerAccount.address, orderTakerNonce + 1, etherBalance, defaultGasPrice)
                                })
                        })
                })
            })
        })

        describe('promiseAvailableVolume', () => {
            test('should return the order quantity (aka amountGet) if the order is unfilled', () => {
                const order = createTestOrder(OrderSide.SELL)
                return EtherDeltaWeb3.promiseAvailableVolume(order)
                    .then(availableVolume => expect(BigNumber(availableVolume).toFixed()).toEqual(BigNumber(order.amountGet).toFixed()))
            })
            test('should return the remaining order quantity if the order is partially filled', () => {
                EtherDeltaWeb3.initForPrivateKey(orderTakerAccount.address, orderTakerAccount.privateKey.slice(2))
                const order = createTestOrder(OrderSide.SELL)
                return EtherDeltaWeb3.promiseTrade(orderTakerAccount.address, orderTakerNonce, order, BigNumber(order.amountGet).times(BigNumber('0.25')).toFixed())
                    .then(() => {
                        return EtherDeltaWeb3.promiseAvailableVolume(order)
                            .then(availableVolume => expect(BigNumber(availableVolume).toFixed()).toEqual(BigNumber(order.amountGet).times(BigNumber('0.75')).toFixed()))
                    })
            })
            test('should return zero if the order is fully filled', () => {
                EtherDeltaWeb3.initForPrivateKey(orderTakerAccount.address, orderTakerAccount.privateKey.slice(2))
                const order = createTestOrder(OrderSide.SELL)
                return EtherDeltaWeb3.promiseTrade(orderTakerAccount.address, orderTakerNonce, order, BigNumber(order.amountGet).toFixed())
                    .then(receipt => {
                        return EtherDeltaWeb3.promiseAvailableVolume(order)
                            .then(availableVolume => expect(BigNumber(availableVolume).toFixed()).toEqual('0'))
                    })
            })
            test('should return zero if the maker does not have the TEST token to sell', () => {

                EtherDeltaWeb3.initForPrivateKey(orderMakerAccount.address, orderMakerAccount.privateKey.slice(2))
                const order = createTestOrder(OrderSide.SELL)

                // maker withdraws all TEST tokens from exchange
                return edContractInstance.methods.balanceOf(testTokenAddress(), orderMakerAccount.address).call().then(tokenBalance => {
                    return EtherDeltaWeb3.promiseWithdrawToken(orderMakerAccount.address, orderMakerNonce, testTokenAddress(), tokenBalance, defaultGasPrice)
                        .then(() => {
                            return EtherDeltaWeb3.promiseAvailableVolume(order)
                                .then(availableVolume => {
                                    expect(BigNumber(availableVolume).toFixed()).toEqual('0')
                                    // maker re-deposits TEST tokens to exchange as a test cleanup
                                    return EtherDeltaWeb3.promiseTokenApprove(orderMakerAccount.address, orderMakerNonce + 1, testTokenAddress(), tokenBalance, defaultGasPrice)
                                        .then(() => {
                                            return EtherDeltaWeb3.promiseDepositToken(orderMakerAccount.address, orderMakerNonce + 2, testTokenAddress(), tokenBalance, defaultGasPrice)
                                        })
                                })
                        })
                })
            })
        })

        describe('promiseAmountFilled', () => {
            test('should return zero if the order is unfilled', () => {
                const order = createTestOrder(OrderSide.SELL)
                return EtherDeltaWeb3.promiseAmountFilled(order)
                    .then(amountFilled => expect(BigNumber(amountFilled).toFixed()).toEqual('0'))
            })
            test('should return the filled order quantity if the order is partially filled', () => {
                EtherDeltaWeb3.initForPrivateKey(orderTakerAccount.address, orderTakerAccount.privateKey.slice(2))
                const order = createTestOrder(OrderSide.SELL)
                return EtherDeltaWeb3.promiseTrade(orderTakerAccount.address, orderTakerNonce, order, BigNumber(order.amountGet).times(BigNumber('0.25')).toFixed())
                    .then(() => {
                        return EtherDeltaWeb3.promiseAmountFilled(order)
                            .then(amountFilled => expect(BigNumber(amountFilled).toFixed()).toEqual(BigNumber(order.amountGet).times(BigNumber('0.25')).toFixed()))
                    })
            })
            test('should return the order quantity (aka amountGet) if the order is fully filled', () => {
                EtherDeltaWeb3.initForPrivateKey(orderTakerAccount.address, orderTakerAccount.privateKey.slice(2))
                const order = createTestOrder(OrderSide.SELL)
                return EtherDeltaWeb3.promiseTrade(orderTakerAccount.address, orderTakerNonce, order, BigNumber(order.amountGet).toFixed())
                    .then(receipt => {
                        return EtherDeltaWeb3.promiseAmountFilled(order)
                            .then(availableVolume => expect(BigNumber(availableVolume).toFixed()).toEqual(BigNumber(order.amountGet).toFixed()))
                    })
            })
        })
    })

    describe('State queries for Taker SELL (aka Maker BUY)', () => {
        beforeAll(() => {
            global.takerSellOrder = createTestOrder(OrderSide.BUY)
        })
        describe('promiseTestTrade', () => {
            test('should return true if the Taker wants to fully fill the order', () => {
                return EtherDeltaWeb3.promiseTestTrade(orderTakerAccount.address, takerSellOrder, takerSellOrder.amountGet)
                    .then(canTrade => expect(canTrade).toBe(true))
            })
            test('should return true if the Taker wants to partially fill the order', () => {
                return EtherDeltaWeb3.promiseTestTrade(orderTakerAccount.address, takerSellOrder, BigNumber(takerSellOrder.amountGet).times(BigNumber('0.5')))
                    .then(canTrade => expect(canTrade).toBe(true))
            })
            test('should return false if the Taker amount is zero', () => {
                return EtherDeltaWeb3.promiseTestTrade(orderTakerAccount.address, takerSellOrder, '0')
                    .then(canTrade => expect(canTrade).toBe(false))
            })
            test('should return false if the Taker tries to over-fill the order', () => {
                return EtherDeltaWeb3.promiseTestTrade(orderTakerAccount.address, takerSellOrder, BigNumber(takerSellOrder.amountGet).times(BigNumber('2')))
                    .then(canTrade => expect(canTrade).toBe(false))
            })

            test('should return false if the Maker does not have ETH to buy the TEST tokens', () => {
                EtherDeltaWeb3.initForPrivateKey(orderMakerAccount.address, orderMakerAccount.privateKey.slice(2))
                // maker withdraws all ETH from exchange
                return edContractInstance.methods.balanceOf(Config.getBaseAddress(), orderMakerAccount.address).call().then(etherBalance => {
                    return EtherDeltaWeb3.promiseWithdrawEther(orderMakerAccount.address, orderMakerNonce, etherBalance, defaultGasPrice)
                        .then(() => {
                            return EtherDeltaWeb3.promiseTestTrade(orderTakerAccount.address, takerSellOrder, takerSellOrder.amountGet)
                                .then(canTrade => {
                                    expect(canTrade).toBe(false)
                                    // maker re-deposits ETH to exchange as a test cleanup
                                    return EtherDeltaWeb3.promiseDepositEther(orderMakerAccount.address, orderMakerNonce + 1, etherBalance, defaultGasPrice)
                                })
                        })
                })
            })

            test('should return false if the Taker does not have TEST tokens to sell', () => {
                EtherDeltaWeb3.initForPrivateKey(orderTakerAccount.address, orderTakerAccount.privateKey.slice(2))
                // taker withdraws all TEST tokens from exchange
                return edContractInstance.methods.balanceOf(testTokenAddress(), orderTakerAccount.address).call().then(tokenBalance => {
                    return EtherDeltaWeb3.promiseWithdrawToken(orderTakerAccount.address, orderTakerNonce, testTokenAddress(), tokenBalance, defaultGasPrice)
                        .then(() => {
                            return EtherDeltaWeb3.promiseTestTrade(orderTakerAccount.address, takerSellOrder, takerSellOrder.amountGet)
                                .then(canTrade => {
                                    expect(canTrade).toBe(false)
                                    // taker re-deposits TEST tokens to exchange as a test cleanup
                                    return EtherDeltaWeb3.promiseTokenApprove(orderTakerAccount.address, orderTakerNonce + 1, testTokenAddress(), tokenBalance, defaultGasPrice)
                                        .then(() => {
                                            return EtherDeltaWeb3.promiseDepositToken(orderTakerAccount.address, orderTakerNonce + 2, testTokenAddress(), tokenBalance, defaultGasPrice)
                                        })
                                })
                        })
                })
            })

        })

        describe('promiseAvailableVolume', () => {
            test('should return the order quantity (aka amountGet) if the order is unfilled', () => {
                const order = createTestOrder(OrderSide.BUY)
                return EtherDeltaWeb3.promiseAvailableVolume(order)
                    .then(availableVolume => expect(BigNumber(availableVolume).toFixed()).toEqual(BigNumber(order.amountGet).toFixed()))
            })
            test('should return the remaining order quantity if the order is partially filled', () => {
                EtherDeltaWeb3.initForPrivateKey(orderTakerAccount.address, orderTakerAccount.privateKey.slice(2))
                const order = createTestOrder(OrderSide.BUY)
                return EtherDeltaWeb3.promiseTrade(orderTakerAccount.address, orderTakerNonce, order, BigNumber(order.amountGet).times(BigNumber('0.25')).toFixed())
                    .then(() => {
                        return EtherDeltaWeb3.promiseAvailableVolume(order)
                            .then(availableVolume => expect(BigNumber(availableVolume).toFixed()).toEqual(BigNumber(order.amountGet).times(BigNumber('0.75')).toFixed()))
                    })
            })
            test('should return zero if the order is fully filled', () => {
                EtherDeltaWeb3.initForPrivateKey(orderTakerAccount.address, orderTakerAccount.privateKey.slice(2))
                const order = createTestOrder(OrderSide.BUY)
                return EtherDeltaWeb3.promiseTrade(orderTakerAccount.address, orderTakerNonce, order, BigNumber(order.amountGet).toFixed())
                    .then(receipt => {
                        return EtherDeltaWeb3.promiseAvailableVolume(order)
                            .then(availableVolume => expect(BigNumber(availableVolume).toFixed()).toEqual('0'))
                    })
            })

            test('should return zero if the maker does not have the ETH to buy TEST tokens', () => {

                EtherDeltaWeb3.initForPrivateKey(orderMakerAccount.address, orderMakerAccount.privateKey.slice(2))
                const order = createTestOrder(OrderSide.BUY)

                // maker withdraws all ETH from exchange
                return edContractInstance.methods.balanceOf(Config.getBaseAddress(), orderMakerAccount.address).call().then(etherBalance => {
                    return EtherDeltaWeb3.promiseWithdrawEther(orderMakerAccount.address, orderMakerNonce, etherBalance, defaultGasPrice)
                        .then(() => {
                            return EtherDeltaWeb3.promiseAvailableVolume(order)
                                .then(availableVolume => {
                                    expect(BigNumber(availableVolume).toFixed()).toEqual('0')
                                    // maker re-deposits ETH to exchange as a test cleanup
                                    return EtherDeltaWeb3.promiseDepositEther(orderMakerAccount.address, orderMakerNonce + 1, etherBalance, defaultGasPrice)
                                })
                        })
                })

            })

            test('should return zero if the amount overflows uint (256 bits)', () => {
                const expiry = 100000
                const price = 100 // ETH per TEST token
                BigNumber.config({ POW_PRECISION: 0 })
                const amount = new BigNumber(1.23456789).exponentiatedBy(1000)
                const order = OrderFactory.createSignedOrder(
                    OrderSide.BUY,
                    expiry,
                    price,
                    amount,
                    testTokenAddress(),
                    orderMakerAccount.address,
                    orderMakerAccount.privateKey)

                return EtherDeltaWeb3.promiseAvailableVolume(order)
                    .then(availableVolume => expect(BigNumber(availableVolume).toFixed()).toEqual('0'))
            })            
        })

        describe('promiseAmountFilled', () => {
            test('should return zero if the order is unfilled', () => {
                const order = createTestOrder(OrderSide.BUY)
                return EtherDeltaWeb3.promiseAmountFilled(order)
                    .then(amountFilled => expect(BigNumber(amountFilled).toFixed()).toEqual('0'))
            })
            test('should return the filled order quantity if the order is partially filled', () => {
                EtherDeltaWeb3.initForPrivateKey(orderTakerAccount.address, orderTakerAccount.privateKey.slice(2))
                const order = createTestOrder(OrderSide.BUY)
                return EtherDeltaWeb3.promiseTrade(orderTakerAccount.address, orderTakerNonce, order, BigNumber(order.amountGet).times(BigNumber('0.25')).toFixed())
                    .then(() => {
                        return EtherDeltaWeb3.promiseAmountFilled(order)
                            .then(amountFilled => expect(BigNumber(amountFilled).toFixed()).toEqual(BigNumber(order.amountGet).times(BigNumber('0.25')).toFixed()))
                    })
            })
            test('should return the order quantity (aka amountGet) if the order is fully filled', () => {
                EtherDeltaWeb3.initForPrivateKey(orderTakerAccount.address, orderTakerAccount.privateKey.slice(2))
                const order = createTestOrder(OrderSide.BUY)
                return EtherDeltaWeb3.promiseTrade(orderTakerAccount.address, orderTakerNonce, order, BigNumber(order.amountGet).toFixed())
                    .then(receipt => {
                        return EtherDeltaWeb3.promiseAmountFilled(order)
                            .then(availableVolume => expect(BigNumber(availableVolume).toFixed()).toEqual(BigNumber(order.amountGet).toFixed()))
                    })
            })
        })
    })
})


