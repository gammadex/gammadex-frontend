import React from 'react'

import Web3 from 'web3'
import Config from '../Config'
import { mount } from 'enzyme'
import OrderBox from '../components/OrderPlacement/OrderBox'
import MakeOrder from '../components/OrderPlacement/MakeOrder'
import { ModalBody, Modal, ModalFooter } from 'reactstrap'

import * as TokenActions from "../actions/TokenActions"
import * as TradeActions from "../actions/TradeActions"
import * as GasActions from "../actions/GasActions"
import * as BlockActions from "../actions/BlockActions"

import TokenStore from "../stores/TokenStore"
import OrderBookStore from "../stores/OrderBookStore"
import GlobalMessageStore from "../stores/GlobalMessageStore"
import OrderPlacementStore from "../stores/OrderPlacementStore"


import { deployContracts } from '../util/ContractDeployer'

import BigNumber from 'bignumber.js'
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import * as AccountApi from "../apis/AccountApi"
import AccountType from "../AccountType"
import OrderFactory from '../OrderFactory'
import OrderSide from '../OrderSide'
import OrderState from '../OrderState'

import { makerSide, tokenAddress, priceOf, weiPriceOf } from '../OrderUtil'
import { baseWeiToEth, tokWeiToEth } from '../EtherConversion'
import AccountStore from '../stores/AccountStore'
import Web3PromiEvent from 'web3-core-promievent'
import OrderEntryField from '../OrderEntryField'
import GasPriceChooser from '../components/GasPriceChooser'

import EtherDeltaSocket from "../EtherDeltaSocket"


// ESLint
/* global global, wrapper, testTokenContractInstance, testTokenContractInstanceNineDecimals, emitOrderMock */

const web3 = new Web3(new Web3.providers.HttpProvider(Config.getWeb3Url()))
const metamaskAddress = '0xfcad0b19bb29d4674531d6f115237e16afce377c'
const primaryKeyAccount = web3.eth.accounts.create()
const feeAccount = web3.eth.accounts.create()
const defaultGasPrice = web3.utils.toWei('3', 'gwei')

describe('MakeOrder', () => {
    beforeAll(() => {
        BlockActions.updateCurrentBlockNumber(10)
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

                return EtherDeltaWeb3.promiseTokenApprove(primaryKeyAccount.address, 0, testTokenContractInstance.options.address, web3.utils.toWei('5', 'ether'), defaultGasPrice)
                    .then(() => EtherDeltaWeb3.promiseDepositToken(primaryKeyAccount.address, 1, testTokenContractInstance.options.address, web3.utils.toWei('5', 'ether'), defaultGasPrice))
                    .then(() => EtherDeltaWeb3.promiseTokenApprove(primaryKeyAccount.address, 2, testTokenContractInstanceNineDecimals.options.address, BigNumber('6').times(BigNumber(10 ** 9)), defaultGasPrice))
                    .then(() => EtherDeltaWeb3.promiseDepositToken(primaryKeyAccount.address, 3, testTokenContractInstanceNineDecimals.options.address, BigNumber('6').times(BigNumber(10 ** 9)), defaultGasPrice))
                    .then(() => EtherDeltaWeb3.promiseDepositEther(primaryKeyAccount.address, 4, web3.utils.toWei('6', 'ether'), defaultGasPrice))

            })
    })

    describe('User creates a BUY order for an 18 decimal ABC token', () => {
        beforeEach(() => {
            const div = document.createElement('div')
            document.body.appendChild(div)
            // mount does render child components
            const wrapper = mount(<MakeOrder type={OrderSide.BUY} tokenSymbol={'ABC'} tokenAddress={testTokenContractInstance.options.address} balanceRetrieved={true} />, { attachTo: div })
            global.wrapper = wrapper

            const emitOrderMock = jest.spyOn(EtherDeltaSocket, "emitOrder")
            emitOrderMock.mockImplementation(() => {
                return Promise.resolve(null)
            })

            global.emitOrderMock = emitOrderMock

            wrapper.find('#buyOrderPrice').hostNodes().simulate('change', { target: { value: '0.46' } })
            wrapper.find('#buyOrderAmount').hostNodes().simulate('change', { target: { value: '1.2' } })
        })
        afterEach(() => {
            wrapper.unmount()
        })
        beforeAll(() => {
            TokenActions.selectToken({
                address: testTokenContractInstance.options.address,
                decimals: 18,
                isListed: true,
                name: null,
                symbol: 'ABC'
            })
            Config.getEnv().defaultPair.token.address = testTokenContractInstance.options.address
            Config.getEnv().defaultPair.token.decimals = 18
            return AccountApi.refreshAccountThenEthAndTokBalance(AccountType.PRIVATE_KEY, null, false)
        })
        describe('User enters price then amount', () => {
            it('should display the total ETH', () => {
                expect(wrapper.find('#buyOrderTotal').hostNodes().instance().value).toEqual('0.552')
            })
            it('should send a new Order when the user clicks PLACE BUY ORDER', (done) => {
                // need to dismiss the price warning first (no ABC order book or recent trades as this is test)
                wrapper.instance().onDismissPriceWarningAlert()

                wrapper.find('#buyButton').hostNodes().simulate('click')

                return EtherDeltaWeb3.promiseSignData(wrapper.state().orderHash, primaryKeyAccount.address)
                    .then(sig => {
                        const expectedOrder = {
                            amountGet: BigNumber(Web3.utils.toWei('1.2', 'ether')),
                            amountGive: BigNumber(Web3.utils.toWei('0.552', 'ether')),
                            contractAddr: Config.getEtherDeltaAddress(),
                            expires: BigNumber('2000000010'),
                            nonce: OrderPlacementStore.getOrderPlacementState().buyOrderUnsigned.nonce,
                            r: sig.r,
                            s: sig.s,
                            tokenGet: testTokenContractInstance.options.address,
                            tokenGive: Config.getBaseAddress(),
                            user: primaryKeyAccount.address,
                            v: sig.v
                        }
                        setTimeout(() => {
                            try {
                                expect(emitOrderMock).toHaveBeenCalledWith(expectedOrder)
                                done()
                            } catch (err) {
                                done.fail(err)
                            }
                        }, 500)
                    })
            })
        })

        describe('With price and amount populated, the user changes the amount', () => {
            it('should re-calculate the total ETH', () => {
                // change amount
                wrapper.find('#buyOrderAmount').hostNodes().simulate('change', { target: { value: '2.4' } })
                expect(wrapper.find('#buyOrderTotal').hostNodes().instance().value).toEqual('1.104')
            })
            it('should send a new Order when the user clicks PLACE BUY ORDER', (done) => {
                wrapper.find('#buyOrderAmount').hostNodes().simulate('change', { target: { value: '2.4' } })
                wrapper.instance().onDismissPriceWarningAlert()

                wrapper.find('#buyButton').hostNodes().simulate('click')

                return EtherDeltaWeb3.promiseSignData(wrapper.state().orderHash, primaryKeyAccount.address)
                    .then(sig => {
                        const expectedOrder = {
                            amountGet: BigNumber(Web3.utils.toWei('2.4', 'ether')),
                            amountGive: BigNumber(Web3.utils.toWei('1.104', 'ether')),
                            contractAddr: Config.getEtherDeltaAddress(),
                            expires: BigNumber('2000000010'),
                            nonce: OrderPlacementStore.getOrderPlacementState().buyOrderUnsigned.nonce,
                            r: sig.r,
                            s: sig.s,
                            tokenGet: testTokenContractInstance.options.address,
                            tokenGive: Config.getBaseAddress(),
                            user: primaryKeyAccount.address,
                            v: sig.v
                        }
                        setTimeout(() => {
                            try {
                                expect(emitOrderMock).toHaveBeenCalledWith(expectedOrder)
                                done()
                            } catch (err) {
                                done.fail(err)
                            }
                        }, 500)
                    })
            })
        })

        describe('With price and amount populated, the user changes the price', () => {
            it('should re-calculate the total ETH', () => {
                // change price
                wrapper.find('#buyOrderPrice').hostNodes().simulate('change', { target: { value: '0.64' } })
                expect(wrapper.find('#buyOrderTotal').hostNodes().instance().value).toEqual('0.768')
            })
            it('should send a new Order when the user clicks PLACE BUY ORDER', (done) => {
                wrapper.find('#buyOrderPrice').hostNodes().simulate('change', { target: { value: '0.64' } })
                wrapper.instance().onDismissPriceWarningAlert()
    
                wrapper.find('#buyButton').hostNodes().simulate('click')
    
                return EtherDeltaWeb3.promiseSignData(wrapper.state().orderHash, primaryKeyAccount.address)
                    .then(sig => {
                        const expectedOrder = {
                            amountGet: BigNumber(Web3.utils.toWei('1.2', 'ether')),
                            amountGive: BigNumber(Web3.utils.toWei('0.768', 'ether')),
                            contractAddr: Config.getEtherDeltaAddress(),
                            expires: BigNumber('2000000010'),
                            nonce: OrderPlacementStore.getOrderPlacementState().buyOrderUnsigned.nonce,
                            r: sig.r,
                            s: sig.s,
                            tokenGet: testTokenContractInstance.options.address,
                            tokenGive: Config.getBaseAddress(),
                            user: primaryKeyAccount.address,
                            v: sig.v
                        }
                        setTimeout(() => {
                            try {
                                expect(emitOrderMock).toHaveBeenCalledWith(expectedOrder)
                                done()
                            } catch (err) {
                                done.fail(err)
                            }
                        }, 500)
                    })
            })
        }) 

        describe('With price and amount populated, the user changes the total', () => {
            it('should re-calculate the amount in TOK', () => {
                // change total
                wrapper.find('#buyOrderTotal').hostNodes().simulate('change', { target: { value: '0.368' } })
                expect(wrapper.find('#buyOrderAmount').hostNodes().instance().value).toEqual('0.8')
            })
            it('should send a new Order when the user clicks PLACE BUY ORDER', (done) => {
    
                wrapper.find('#buyOrderTotal').hostNodes().simulate('change', { target: { value: '0.368' } })
                wrapper.instance().onDismissPriceWarningAlert()
    
                wrapper.find('#buyButton').hostNodes().simulate('click')
    
                return EtherDeltaWeb3.promiseSignData(wrapper.state().orderHash, primaryKeyAccount.address)
                    .then(sig => {
                        const expectedOrder = {
                            amountGet: BigNumber(Web3.utils.toWei('0.8', 'ether')),
                            amountGive: BigNumber('368000000000000050'), // TODO check this
                            contractAddr: Config.getEtherDeltaAddress(),
                            expires: BigNumber('2000000010'),
                            nonce: OrderPlacementStore.getOrderPlacementState().buyOrderUnsigned.nonce,
                            r: sig.r,
                            s: sig.s,
                            tokenGet: testTokenContractInstance.options.address,
                            tokenGive: Config.getBaseAddress(),
                            user: primaryKeyAccount.address,
                            v: sig.v
                        }
                        setTimeout(() => {
                            try {
                                expect(emitOrderMock).toHaveBeenCalledWith(expectedOrder)
                                done()
                            } catch (err) {
                                done.fail(err)
                            }
                        }, 500)
                    })
            })
        })         

        describe('With price and amount populated, the user changes the expiry to Expire After (Blocks) with the default of 10000', () => {
            it('should display the blocks input when the user changes to Expire After expiry type', () => {
                // change type
                wrapper.find('#buyExpiryType').hostNodes().simulate('change', { target: { value: 'Expire After' } })
                const expireAfterBlocks = wrapper.find('#buyExpireAfterBlocks').hostNodes().instance()
                expect(expireAfterBlocks.value).toEqual('10000')
            })
            it('should send a new Order when the user clicks PLACE BUY ORDER', (done) => {
                // need to dismiss the price warning first (no ABC order book or recent trades as this is test)
                wrapper.instance().onDismissPriceWarningAlert()
    
                wrapper.find('#buyButton').hostNodes().simulate('click')
    
                return EtherDeltaWeb3.promiseSignData(wrapper.state().orderHash, primaryKeyAccount.address)
                    .then(sig => {
                        const expectedOrder = {
                            amountGet: BigNumber(Web3.utils.toWei('1.2', 'ether')),
                            amountGive: BigNumber(Web3.utils.toWei('0.552', 'ether')),
                            contractAddr: Config.getEtherDeltaAddress(),
                            expires: BigNumber('10010'),
                            nonce: OrderPlacementStore.getOrderPlacementState().buyOrderUnsigned.nonce,
                            r: sig.r,
                            s: sig.s,
                            tokenGet: testTokenContractInstance.options.address,
                            tokenGive: Config.getBaseAddress(),
                            user: primaryKeyAccount.address,
                            v: sig.v
                        }
                        setTimeout(() => {
                            try {
                                expect(emitOrderMock).toHaveBeenCalledWith(expectedOrder)
                                done()
                            } catch (err) {
                                done.fail(err)
                            }
                        }, 500)
                    })
            })
        })    
        
        describe('With price and amount populated, the user changes the expiry to Expire After (Blocks) and updates the expiry blocks', () => {
            it('should send a new Order when the user clicks PLACE BUY ORDER', (done) => {

                wrapper.find('#buyExpiryType').hostNodes().simulate('change', { target: { value: 'Expire After' } })
                // change expiry blocks
                wrapper.find('#buyExpireAfterBlocks').hostNodes().simulate('change', { target: { value: '500' } })

                wrapper.instance().onDismissPriceWarningAlert()
    
                wrapper.find('#buyButton').hostNodes().simulate('click')
    
                return EtherDeltaWeb3.promiseSignData(wrapper.state().orderHash, primaryKeyAccount.address)
                    .then(sig => {
                        const expectedOrder = {
                            amountGet: BigNumber(Web3.utils.toWei('1.2', 'ether')),
                            amountGive: BigNumber(Web3.utils.toWei('0.552', 'ether')),
                            contractAddr: Config.getEtherDeltaAddress(),
                            expires: BigNumber('510'),
                            nonce: OrderPlacementStore.getOrderPlacementState().buyOrderUnsigned.nonce,
                            r: sig.r,
                            s: sig.s,
                            tokenGet: testTokenContractInstance.options.address,
                            tokenGive: Config.getBaseAddress(),
                            user: primaryKeyAccount.address,
                            v: sig.v
                        }
                        setTimeout(() => {
                            try {
                                expect(emitOrderMock).toHaveBeenCalledWith(expectedOrder)
                                done()
                            } catch (err) {
                                done.fail(err)
                            }
                        }, 500)
                    })
            })
        })   
    })


    describe('User creates a SELL order for an 18 decimal ABC token', () => {
        beforeEach(() => {
            const div = document.createElement('div')
            document.body.appendChild(div)
            // mount does render child components
            const wrapper = mount(<MakeOrder type={OrderSide.SELL} tokenSymbol={'ABC'} tokenAddress={testTokenContractInstance.options.address} balanceRetrieved={true} />, { attachTo: div })
            global.wrapper = wrapper

            const emitOrderMock = jest.spyOn(EtherDeltaSocket, "emitOrder")
            emitOrderMock.mockImplementation(() => {
                return Promise.resolve(null)
            })

            global.emitOrderMock = emitOrderMock

            wrapper.find('#sellOrderPrice').hostNodes().simulate('change', { target: { value: '0.75' } })
            wrapper.find('#sellOrderAmount').hostNodes().simulate('change', { target: { value: '1.5' } })
        })
        afterEach(() => {
            wrapper.unmount()
        })
        beforeAll(() => {
            TokenActions.selectToken({
                address: testTokenContractInstance.options.address,
                decimals: 18,
                isListed: true,
                name: null,
                symbol: 'ABC'
            })
            Config.getEnv().defaultPair.token.address = testTokenContractInstance.options.address
            Config.getEnv().defaultPair.token.decimals = 18
            return AccountApi.refreshAccountThenEthAndTokBalance(AccountType.PRIVATE_KEY, null, false)
        })
        describe('User enters price then amount', () => {
            it('should display the total ETH', () => {
                expect(wrapper.find('#sellOrderTotal').hostNodes().instance().value).toEqual('1.125')
            })
            it('should send a new Order when the user clicks PLACE SELL ORDER', (done) => {
                // need to dismiss the price warning first (no ABC order book or recent trades as this is test)
                wrapper.instance().onDismissPriceWarningAlert()

                wrapper.find('#sellButton').hostNodes().simulate('click')

                return EtherDeltaWeb3.promiseSignData(wrapper.state().orderHash, primaryKeyAccount.address)
                    .then(sig => {
                        const expectedOrder = {
                            amountGet: BigNumber(Web3.utils.toWei('1.125', 'ether')),
                            amountGive: BigNumber(Web3.utils.toWei('1.5', 'ether')),
                            contractAddr: Config.getEtherDeltaAddress(),
                            expires: BigNumber('2000000010'),
                            nonce: OrderPlacementStore.getOrderPlacementState().sellOrderUnsigned.nonce,
                            r: sig.r,
                            s: sig.s,
                            tokenGet: Config.getBaseAddress(),
                            tokenGive: testTokenContractInstance.options.address,
                            user: primaryKeyAccount.address,
                            v: sig.v
                        }
                        setTimeout(() => {
                            try {
                                expect(emitOrderMock).toHaveBeenCalledWith(expectedOrder)
                                done()
                            } catch (err) {
                                done.fail(err)
                            }
                        }, 500)
                    })
            })
        })

        describe('With price and amount populated, the user changes the amount', () => {
            it('should re-calculate the total ETH', () => {
                // change amount
                wrapper.find('#sellOrderAmount').hostNodes().simulate('change', { target: { value: '2.5' } })
                expect(wrapper.find('#sellOrderTotal').hostNodes().instance().value).toEqual('1.875')
            })
            it('should send a new Order when the user clicks PLACE SELL ORDER', (done) => {
                wrapper.find('#sellOrderAmount').hostNodes().simulate('change', { target: { value: '2.5' } })
                wrapper.instance().onDismissPriceWarningAlert()

                wrapper.find('#sellButton').hostNodes().simulate('click')

                return EtherDeltaWeb3.promiseSignData(wrapper.state().orderHash, primaryKeyAccount.address)
                    .then(sig => {
                        const expectedOrder = {
                            amountGet: BigNumber(Web3.utils.toWei('1.875', 'ether')),
                            amountGive: BigNumber(Web3.utils.toWei('2.5', 'ether')),
                            contractAddr: Config.getEtherDeltaAddress(),
                            expires: BigNumber('2000000010'),
                            nonce: OrderPlacementStore.getOrderPlacementState().sellOrderUnsigned.nonce,
                            r: sig.r,
                            s: sig.s,
                            tokenGet: Config.getBaseAddress(),
                            tokenGive: testTokenContractInstance.options.address,
                            user: primaryKeyAccount.address,
                            v: sig.v
                        }
                        setTimeout(() => {
                            try {
                                expect(emitOrderMock).toHaveBeenCalledWith(expectedOrder)
                                done()
                            } catch (err) {
                                done.fail(err)
                            }
                        }, 500)
                    })
            })
        })

        describe('With price and amount populated, the user changes the price', () => {
            it('should re-calculate the total ETH', () => {
                // change price
                wrapper.find('#sellOrderPrice').hostNodes().simulate('change', { target: { value: '0.55' } })
                expect(wrapper.find('#sellOrderTotal').hostNodes().instance().value).toEqual('0.825')
            })
            it('should send a new Order when the user clicks PLACE SELL ORDER', (done) => {
                wrapper.find('#sellOrderPrice').hostNodes().simulate('change', { target: { value: '0.55' } })
                wrapper.instance().onDismissPriceWarningAlert()
    
                wrapper.find('#sellButton').hostNodes().simulate('click')
    
                return EtherDeltaWeb3.promiseSignData(wrapper.state().orderHash, primaryKeyAccount.address)
                    .then(sig => {
                        const expectedOrder = {
                            amountGet: BigNumber('825000000000000100'),
                            amountGive: BigNumber(Web3.utils.toWei('1.5', 'ether')),
                            contractAddr: Config.getEtherDeltaAddress(),
                            expires: BigNumber('2000000010'),
                            nonce: OrderPlacementStore.getOrderPlacementState().sellOrderUnsigned.nonce,
                            r: sig.r,
                            s: sig.s,
                            tokenGet: Config.getBaseAddress(),
                            tokenGive: testTokenContractInstance.options.address,
                            user: primaryKeyAccount.address,
                            v: sig.v
                        }
                        setTimeout(() => {
                            try {
                                expect(emitOrderMock).toHaveBeenCalledWith(expectedOrder)
                                done()
                            } catch (err) {
                                done.fail(err)
                            }
                        }, 500)
                    })
            })
        }) 

        describe('With price and amount populated, the user changes the total', () => {
            it('should re-calculate the amount in TOK', () => {
                // change total
                wrapper.find('#sellOrderTotal').hostNodes().simulate('change', { target: { value: '2.25' } })
                expect(wrapper.find('#sellOrderAmount').hostNodes().instance().value).toEqual('3')
            })
            it('should send a new Order when the user clicks PLACE SELL ORDER', (done) => {
    
                wrapper.find('#sellOrderTotal').hostNodes().simulate('change', { target: { value: '2.25' } })
                wrapper.instance().onDismissPriceWarningAlert()
    
                wrapper.find('#sellButton').hostNodes().simulate('click')
    
                return EtherDeltaWeb3.promiseSignData(wrapper.state().orderHash, primaryKeyAccount.address)
                    .then(sig => {
                        const expectedOrder = {
                            amountGet: BigNumber(Web3.utils.toWei('2.25', 'ether')),
                            amountGive: BigNumber(Web3.utils.toWei('3', 'ether')), // TODO check this
                            contractAddr: Config.getEtherDeltaAddress(),
                            expires: BigNumber('2000000010'),
                            nonce: OrderPlacementStore.getOrderPlacementState().sellOrderUnsigned.nonce,
                            r: sig.r,
                            s: sig.s,
                            tokenGet: Config.getBaseAddress(),
                            tokenGive: testTokenContractInstance.options.address,
                            user: primaryKeyAccount.address,
                            v: sig.v
                        }
                        setTimeout(() => {
                            try {
                                expect(emitOrderMock).toHaveBeenCalledWith(expectedOrder)
                                done()
                            } catch (err) {
                                done.fail(err)
                            }
                        }, 500)
                    })
            })
        })         

        describe('With price and amount populated, the user changes the expiry to Expire After (Blocks) with the default of 10000', () => {
            it('should display the blocks input when the user changes to Expire After expiry type', () => {
                // change type
                wrapper.find('#sellExpiryType').hostNodes().simulate('change', { target: { value: 'Expire After' } })
                const expireAfterBlocks = wrapper.find('#sellExpireAfterBlocks').hostNodes().instance()
                expect(expireAfterBlocks.value).toEqual('10000')
            })
            it('should send a new Order when the user clicks PLACE SELL ORDER', (done) => {
                // need to dismiss the price warning first (no ABC order book or recent trades as this is test)
                wrapper.instance().onDismissPriceWarningAlert()

                wrapper.find('#sellButton').hostNodes().simulate('click')

                return EtherDeltaWeb3.promiseSignData(wrapper.state().orderHash, primaryKeyAccount.address)
                    .then(sig => {
                        const expectedOrder = {
                            amountGet: BigNumber(Web3.utils.toWei('1.125', 'ether')),
                            amountGive: BigNumber(Web3.utils.toWei('1.5', 'ether')),
                            contractAddr: Config.getEtherDeltaAddress(),
                            expires: BigNumber('10010'),
                            nonce: OrderPlacementStore.getOrderPlacementState().sellOrderUnsigned.nonce,
                            r: sig.r,
                            s: sig.s,
                            tokenGet: Config.getBaseAddress(),
                            tokenGive: testTokenContractInstance.options.address,
                            user: primaryKeyAccount.address,
                            v: sig.v
                        }
                        setTimeout(() => {
                            try {
                                expect(emitOrderMock).toHaveBeenCalledWith(expectedOrder)
                                done()
                            } catch (err) {
                                done.fail(err)
                            }
                        }, 500)
                    })
            })
        })    
        
        describe('With price and amount populated, the user changes the expiry to Expire After (Blocks) and updates the expiry blocks', () => {
            it('should send a new Order when the user clicks PLACE SELL ORDER', (done) => {

                wrapper.find('#sellExpiryType').hostNodes().simulate('change', { target: { value: 'Expire After' } })
                // change expiry blocks
                wrapper.find('#sellExpireAfterBlocks').hostNodes().simulate('change', { target: { value: '500' } })

                wrapper.instance().onDismissPriceWarningAlert()
    
                wrapper.find('#sellButton').hostNodes().simulate('click')
    
                return EtherDeltaWeb3.promiseSignData(wrapper.state().orderHash, primaryKeyAccount.address)
                    .then(sig => {
                        const expectedOrder = {
                            amountGet: BigNumber(Web3.utils.toWei('1.125', 'ether')),
                            amountGive: BigNumber(Web3.utils.toWei('1.5', 'ether')),
                            contractAddr: Config.getEtherDeltaAddress(),
                            expires: BigNumber('510'),
                            nonce: OrderPlacementStore.getOrderPlacementState().sellOrderUnsigned.nonce,
                            r: sig.r,
                            s: sig.s,
                            tokenGet: Config.getBaseAddress(),
                            tokenGive: testTokenContractInstance.options.address,
                            user: primaryKeyAccount.address,
                            v: sig.v
                        }
                        setTimeout(() => {
                            try {
                                expect(emitOrderMock).toHaveBeenCalledWith(expectedOrder)
                                done()
                            } catch (err) {
                                done.fail(err)
                            }
                        }, 500)
                    })
            })
        })   
    })

})