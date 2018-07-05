import React from 'react'

import Web3 from 'web3'
import Config from '../Config'
import { mount } from 'enzyme'
import OrderBox from '../components/OrderPlacement/OrderBox'
import FillOrderBook from '../components/OrderPlacement/FillOrderBook'
import { ModalBody, Modal, ModalFooter } from 'reactstrap'

import * as TokenActions from "../actions/TokenActions"
import * as TradeActions from "../actions/TradeActions"
import * as GasActions from "../actions/GasActions"
import TokenStore from "../stores/TokenStore"
import OrderBookStore from "../stores/OrderBookStore"
import GlobalMessageStore from "../stores/GlobalMessageStore"

import { deployContracts } from '../util/ContractDeployer'

import BigNumber from 'bignumber.js'
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import * as AccountApi from "../apis/AccountApi"
import AccountType from "../AccountType"
import OrderFactory from '../OrderFactory'
import OrderSide from '../OrderSide'
import OrderState from '../OrderState'

import { makerSide, tokenAddress, priceOf } from '../OrderUtil'
import { baseWeiToEth, tokWeiToEth } from '../EtherConversion'
import AccountStore from '../stores/AccountStore'
import Web3PromiEvent from 'web3-core-promievent'
import OrderEntryField from '../OrderEntryField'

const web3 = new Web3(new Web3.providers.HttpProvider(Config.getWeb3Url()))
const metamaskAddress = '0xfcad0b19bb29d4674531d6f115237e16afce377c'
const primaryKeyAccount = web3.eth.accounts.create()
const feeAccount = web3.eth.accounts.create()
const defaultGasPrice = web3.utils.toWei('3', 'gwei')
// ESLint
/* global global, wrapper, testTokenContractInstance, makerSellTestOrder */

function formatV1Order(order) {
    return EtherDeltaWeb3.promiseAvailableVolume(order)
        .then(availableVolumeWeb3 => {
            const side = makerSide(order)
            const tokenAddr = tokenAddress(order)
            const price = priceOf(order)
            const orderHash = OrderFactory.orderHash(order.tokenGet, order.amountGet, order.tokenGive, order.amountGive, order.expires, order.nonce)
            const id = `${orderHash}_${side}`

            let availableVolume = BigNumber(0) // TOK amount in full wei
            let ethAvailableVolume = BigNumber(0) // TOK amount normalized to TOK
            let availableVolumeBase = BigNumber(0) // ETH amount in full wei
            let ethAvailableVolumeBase = BigNumber(0) // ETH amount normalized to ETH
            let amount = BigNumber(0)
            if (side === OrderSide.BUY) {
                availableVolume = BigNumber(availableVolumeWeb3)
                ethAvailableVolume = tokWeiToEth(availableVolume, tokenAddr)

                availableVolumeBase = availableVolume.times(price).dp(0, BigNumber.ROUND_FLOOR)
                ethAvailableVolumeBase = baseWeiToEth(availableVolumeBase)

                amount = availableVolume.negated()
            } else {
                availableVolumeBase = BigNumber(availableVolumeWeb3)
                ethAvailableVolumeBase = baseWeiToEth(availableVolumeBase)

                availableVolume = availableVolumeBase.div(price).dp(0, BigNumber.ROUND_FLOOR)
                ethAvailableVolume = tokWeiToEth(availableVolume, tokenAddr)

                amount = availableVolume
            }

            let deleted = false

            return {
                id: id,
                contractAddr: web3.utils.toChecksumAddress(Config.getEnv().etherDeltaAddress),
                user: web3.utils.toChecksumAddress(order.user),
                state: OrderState.OPEN,
                amount: amount.toString(),
                price: price.toString(),
                tokenGet: web3.utils.toChecksumAddress(order.tokenGet),
                amountGet: order.amountGet,
                tokenGive: web3.utils.toChecksumAddress(order.tokenGive),
                amountGive: order.amountGive,
                expires: order.expires.toString(),
                nonce: order.nonce,
                v: order.v,
                r: order.r,
                s: order.s,
                date: new Date().toISOString(),
                updated: new Date().toISOString(),
                availableVolume: availableVolume.toString(),
                ethAvailableVolume: ethAvailableVolume.toString(),
                availableVolumeBase: availableVolumeBase.toString(),
                ethAvailableVolumeBase: ethAvailableVolumeBase.toString(),
                amountFilled: '0',
                deleted: deleted
            }
        })
}

function tradeMock() {
    const promiseTradeMock = jest.spyOn(EtherDeltaWeb3, "promiseTrade")
    promiseTradeMock.mockImplementation(() => {
        const promiEvent = Web3PromiEvent()
        promiEvent.eventEmitter.emit('transactionHash', '123')
        return promiEvent.eventEmitter
    })
    return promiseTradeMock
}

describe('OrderBox', () => {
    beforeAll(() => {
        GasActions.gasPricesRetrieved(
            BigNumber(web3.utils.toWei('4', 'gwei')),
            BigNumber(web3.utils.toWei('6', 'gwei')),
            BigNumber(web3.utils.toWei('9', 'gwei')),
            BigNumber(web3.utils.toWei('12', 'gwei')),
            new Date(),
            14.5)
        return deployContracts(web3, metamaskAddress, feeAccount, primaryKeyAccount, defaultGasPrice)
            .then((res) => {
                EtherDeltaWeb3.initForPrivateKey(primaryKeyAccount.address, primaryKeyAccount.privateKey.slice(2))
                TokenActions.selectToken({
                    address: testTokenContractInstance.options.address,
                    decimals: 18,
                    isListed: true,
                    name: null,
                    symbol: 'ABC'
                })
                Config.getEnv().defaultPair.token.address = testTokenContractInstance.options.address
                Config.getEnv().defaultPair.token.decimals = 18
                return EtherDeltaWeb3.promiseTokenApprove(primaryKeyAccount.address, 0, testTokenContractInstance.options.address, web3.utils.toWei('5', 'ether'), defaultGasPrice)
                    .then(() => {
                        return EtherDeltaWeb3.promiseDepositToken(primaryKeyAccount.address, 1, testTokenContractInstance.options.address, web3.utils.toWei('5', 'ether'), defaultGasPrice)
                            .then(() => {
                                return EtherDeltaWeb3.promiseDepositEther(primaryKeyAccount.address, 2, web3.utils.toWei('6', 'ether'), defaultGasPrice)
                                    .then(() => {
                                        return AccountApi.refreshAccountThenEthAndTokBalance(AccountType.PRIVATE_KEY, null, false)
                                            .then(() => {
                                                const expiry = 100000
                                                const price = 0.02 // ETH per ABC token
                                                const amount = 0.4 // ABC tokens
                                                const order = OrderFactory.createSignedOrder(
                                                    OrderSide.SELL,
                                                    expiry,
                                                    price,
                                                    amount,
                                                    testTokenContractInstance.options.address,
                                                    primaryKeyAccount.address,
                                                    primaryKeyAccount.privateKey.slice(2))
                                                return formatV1Order(order)
                                                    .then(fillOrder => {
                                                        OrderBookStore.offers = [fillOrder]
                                                        global.makerSellTestOrder = fillOrder
                                                    })
                                            })
                                    })
                            })
                    })


            })
    })

    beforeEach(() => {
        const div = document.createElement('div')
        document.body.appendChild(div)
        // mount does render child components
        const wrapper = mount(<FillOrderBook type={OrderSide.BUY} tokenSymbol={'ABC'} tokenAddress={testTokenContractInstance.options.address} balanceRetrieved={true} />, { attachTo: div })
        global.wrapper = wrapper
    })
    afterEach(() => {
        wrapper.unmount()
    })
    describe('User selects a taker buy (aka maker sell) order for 18 decimal ABC token from the order book', () => {
        beforeAll(() => {
            TradeActions.fillOrder(makerSellTestOrder)
        })
        describe('By default the trade component will be populated to fully fill the order', () => {
            it('should display the (read-only) price of the order', () => {
                const buyOrderPriceInput = wrapper.find('#buyOrderPrice').hostNodes().instance()
                expect(buyOrderPriceInput.value).toEqual('0.02000000')
                expect(buyOrderPriceInput.disabled).toEqual(true)
            })
            it('should display the full amount of the order (the current default, TODO change to max user amount)', () => {
                const buyOrderAmountInput = wrapper.find('#buyOrderAmount').hostNodes().instance()
                expect(buyOrderAmountInput.value).toEqual('0.4')
            })
            it('should display the (read-only) eth total for the order amount', () => {
                const buyOrderTotalInput = wrapper.find('#buyOrderTotal').hostNodes().instance()
                expect(buyOrderTotalInput.value).toEqual('0.008')
            })
            it('the BUY button should be enabled', () => {
                const buyOrderButton = wrapper.find('#buyButton').hostNodes().instance()
                expect(buyOrderButton.disabled).toEqual(false)
            })
            it('should display a BUY confirmation modal (only for private key accounts) when the user clicks BUY', () => {
                wrapper.find('#buyButton').hostNodes().simulate('click')
                expect(wrapper.find(Modal).instance().props.isOpen).toEqual(true)
                expect(wrapper.find('#buyFillOrderModal').hostNodes().text()).toEqual(`BUY 0.4 ABC?`)
            })
            describe('should execute the BUY when the user confirms the modal', () => {
                beforeEach(() => {
                    TradeActions.fillOrder(makerSellTestOrder)
                    wrapper.find('#buyButton').hostNodes().simulate('click')
                })
                it('should first call promiseTestTrade', (done) => {
                    const promiseTestTradeMock = jest.spyOn(EtherDeltaWeb3, "promiseTestTrade")
                    const promiseTradeMock = tradeMock()
                    wrapper.find('#buyFillOrderModalButton').hostNodes().simulate('click')

                    // there is an async period between testing the trade and executing it
                    setTimeout(() => {
                        try {
                            expect(promiseTestTradeMock).toHaveBeenCalledWith(
                                primaryKeyAccount.address,
                                wrapper.state().fillOrder.order,
                                BigNumber(web3.utils.toWei('0.008', 'ether')))
                            promiseTradeMock.mockRestore()    
                            done()
                        } catch (err) {
                            promiseTradeMock.mockRestore()
                            done.fail(err)
                        }
                    }, 500)
                })
                it('should then call promiseTrade', (done) => {
                    const promiseTradeMock = tradeMock()
                    wrapper.find('#buyFillOrderModalButton').hostNodes().simulate('click')

                    setTimeout(() => {
                        expect(promiseTradeMock).toHaveBeenCalledWith(
                            primaryKeyAccount.address,
                            3,
                            wrapper.state().fillOrder.order,
                            BigNumber(web3.utils.toWei('0.008', 'ether')),
                            BigNumber(web3.utils.toWei('6', 'gwei')))
                        promiseTradeMock.mockRestore()
                        done()
                    }, 500)
                })
            })

        })

        describe('User updates trade amount to partially fill the order', () => {
            beforeEach(() => {
                const value = '0.1'
                wrapper.find('#buyOrderAmount').hostNodes().simulate('change', { target: { value } })
            })
            it('should display the new fill amount', () => {
                expect(wrapper.find('#buyOrderAmount').hostNodes().instance().value).toEqual('0.1')
            })
            it('should display the (read-only) eth total for the fill amount', () => {
                expect(wrapper.find('#buyOrderTotal').hostNodes().instance().value).toEqual('0.002')
            })
            it('should call promiseTestTrade and promiseTrade with the new fill amount', (done) => {
                wrapper.find('#buyButton').hostNodes().simulate('click')
                const promiseTradeMock = tradeMock()
                wrapper.find('#buyFillOrderModalButton').hostNodes().simulate('click')

                setTimeout(() => {
                    try {
                        expect(promiseTradeMock).toHaveBeenCalledWith(
                            primaryKeyAccount.address,
                            3,
                            wrapper.state().fillOrder.order,
                            BigNumber(web3.utils.toWei('0.002', 'ether')),
                            BigNumber(web3.utils.toWei('6', 'gwei')))
                        promiseTradeMock.mockRestore()    
                        done()
                    } catch (err) {
                        promiseTradeMock.mockRestore()
                        done.fail(err)
                    }
                }, 500)
            })
        })

        describe('User attempts to overfill the order', () => {
            beforeEach(() => {
                const value = '0.5'
                wrapper.find('#buyOrderAmount').hostNodes().simulate('change', { target: { value } })
            })
            it('should display the new fill amount', () => {
                expect(wrapper.find('#buyOrderAmount').hostNodes().instance().value).toEqual('0.5')
            })
            it('should display the (read-only) eth total for the fill amount', () => {
                expect(wrapper.find('#buyOrderTotal').hostNodes().instance().value).toEqual('0.010')
            })
            it('the BUY button should be disabled', () => {
                const buyOrderButton = wrapper.find('#buyButton').hostNodes().instance()
                expect(buyOrderButton.disabled).toEqual(true)
                const { fillAmountValid, fillAmountInvalidField, fillAmountInvalidReason } = wrapper.state().fillOrder
                expect(fillAmountValid).toEqual(false)
                expect(fillAmountInvalidField).toEqual(OrderEntryField.AMOUNT)
                expect(fillAmountInvalidReason).toEqual("Token amount greater than max order amount (0.4)")
            })            
        })        
    })
})