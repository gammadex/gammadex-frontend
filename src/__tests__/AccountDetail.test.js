import React from 'react'

import Web3 from 'web3'
import Config from '../Config'
import { mount } from 'enzyme'
import Funding from '../components/Account/Funding'
import FundingModalType from '../components/Account/FundingModalType'

import AccountDetail from '../components/AccountDetail'
import EtherDeltaWeb3 from "../EtherDeltaWeb3"

import AccountType from "../AccountType"
import * as AccountApi from "../apis/AccountApi"
import FundingStore from "../stores/FundingStore"
import AccountStore from "../stores/AccountStore"
import TokenStore from "../stores/TokenStore"

import TransferStore from "../stores/TransferStore"
import FundingState from "../components/Account/FundingState"

import { deployContracts } from '../util/ContractDeployer'

import * as TokenActions from "../actions/TokenActions"
import * as GasActions from "../actions/GasActions"

import { ModalBody, Modal, ModalFooter } from 'reactstrap'

import Web3PromiEvent from 'web3-core-promievent'
import BigNumber from 'bignumber.js'

import _ from "lodash"
import { formatNumber } from '../util/FormatUtil'
const web3 = new Web3(new Web3.providers.HttpProvider(Config.getWeb3Url()))
const metamaskAddress = '0xfcad0b19bb29d4674531d6f115237e16afce377c'
const primaryKeyAccount = web3.eth.accounts.create()
const feeAccount = web3.eth.accounts.create()
const defaultGasPrice = web3.utils.toWei('3', 'gwei')

// ESLint
/* global global, testTokenContractInstance, wrapper, testTokenContractInstanceNineDecimals */

describe('AccountDetail', () => {
    beforeAll(() => {
        GasActions.gasPricesRetrieved(
            BigNumber(web3.utils.toWei('4', 'gwei')),
            BigNumber(web3.utils.toWei('6', 'gwei')),
            BigNumber(web3.utils.toWei('9', 'gwei')),
            BigNumber(web3.utils.toWei('12', 'gwei')),
            new Date(),
            14.5)
        // Deploy ED and test token contracts to ganache local blockchain, then initialize the app using a test private key.
        //
        // If we're confident we can accurately recreate the AccountStore/FundingStore/GasStore state manually we "could" remove this test's
        // dependency on web3. Not doing that though to keep the test more realistic (albeit slower to warm up).
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
                return AccountApi.refreshAccountThenEthAndTokBalance(AccountType.PRIVATE_KEY, null, false)
            })
    })
    beforeEach(() => {
        const wrapper = mount(
            <AccountDetail />
        )
        global.wrapper = wrapper
        return AccountApi.refreshNonce()
    })
    afterEach(() => {
        wrapper.unmount()
    })
    it('should render initial state where user has 10 ETH and 20 ABC test tokens in wallet', () => {
        const fundingWrapper = wrapper.find(Funding)

        // test props
        const { tokenName, walletBalanceEth, exchangeBalanceEth, walletBalanceTok, exchangeBalanceTok } = fundingWrapper.props()
        expect(tokenName).toEqual('ABC')
        expect(walletBalanceEth).toEqual('10')
        expect(exchangeBalanceEth).toEqual('0')
        expect(walletBalanceTok).toEqual('20')
        expect(exchangeBalanceTok).toEqual('0')

        // test rendered components
        expect(wrapper.find('#tdWalletBalanceEth').text()).toEqual('10.000')
        expect(wrapper.find('#tdExchangeBalanceEth').text()).toEqual('0.000')
        expect(wrapper.find('#tdWalletBalanceTok').text()).toEqual('20.000')
        expect(wrapper.find('#tdExchangeBalanceTok').text()).toEqual('0.000')
    })

    describe('User deposits 4 ether', () => {
        it('should propogate value through to store and back to UI, when user updates the eth deposit amount', () => {
            // simulate the user updating the ethDepositAmount numeric input field
            const value = '4'
            // https://github.com/airbnb/enzyme/blob/master/docs/guides/migration-from-2-to-3.md - find() now returns host nodes and DOM nodes
            // a host node is a non-HTML node
            wrapper.find('#ethDepositAmount').hostNodes().simulate('change', { target: { value } })

            // check Funding Store has been updated
            const { ethDepositAmountControlled, ethDepositAmountWei } = FundingStore.getFundingState()
            expect(ethDepositAmountControlled).toEqual(value)
            expect(ethDepositAmountWei.toString()).toEqual(Web3.utils.toWei(value, 'ether'))

            // test input field itself has been updated
            expect(wrapper.find('#ethDepositAmount').hostNodes().props().value).toEqual(value)

            // check deposit amount is valid
            const fundingWrapper = wrapper.find(Funding)
            expect(FundingStore.getFundingState().ethDepositState).toEqual(FundingState.OK)
            expect(fundingWrapper.instance().ethDepositInputProps().ethDepositValid).toEqual(true)
        })

        it('should set the maximum eth deposit amount (accounting for the gas fee and minimum recommended Wallet ETH)', () => {
            // simulate user clicking on "MAX"
            wrapper.find('#ethDepositAmountMaxButton').hostNodes().simulate('click')

            const depositMaxFeeWei = BigNumber(Web3.utils.toWei('6', 'gwei')).times(BigNumber(Config.getGasLimit('deposit')))
            const minRecommendedWalletGasWei = BigNumber(Web3.utils.toWei(String(Config.getMinRecommendedWalletGasEth()), 'ether'))
            const maxDepositAmount = BigNumber(Web3.utils.toWei('10', 'ether')).minus(depositMaxFeeWei).minus(minRecommendedWalletGasWei)

            const { ethDepositAmountControlled, ethDepositAmountWei } = FundingStore.getFundingState()
            expect(ethDepositAmountControlled.toString()).toEqual(Web3.utils.fromWei(maxDepositAmount.toString()))
            expect(ethDepositAmountWei.toString()).toEqual(maxDepositAmount.toString())

            expect(wrapper.find('#ethDepositAmount').hostNodes().props().value.toString())
                .toEqual(Web3.utils.fromWei(maxDepositAmount.toString()).toString())

            // depositing the maximum leaves 0 ETH for further transactions, which is a warning
            const fundingWrapper = wrapper.find(Funding)
            expect(FundingStore.getFundingState().ethDepositState).toEqual(FundingState.OK)
            expect(fundingWrapper.instance().ethDepositInputProps().ethDepositValid).toEqual(true)
        })

        it('should display a confirmation modal when the user submits an eth deposit', () => {
            const value = '4'
            wrapper.find('#ethDepositAmount').hostNodes().simulate('change', { target: { value } })

            // simulate user clicking on "Deposit ETH"
            wrapper.find('#ethDepositAmountButton').hostNodes().simulate('click')

            // check Funding Store has been updated
            const { modalType, modalText } = FundingStore.getFundingState()
            expect(modalType).toEqual(FundingModalType.ETH_DEPOSIT)
            expect(modalText).toEqual(`Deposit ${value} ETH to exchange?`)

            // check Modal is visible
            expect(wrapper.find(Modal).instance().props.isOpen).toEqual(true)
            expect(wrapper.find('#fundingModalBody').hostNodes().text()).toEqual(`Deposit ${value} ETH to exchange?`)
        })

        it('should execute the eth deposit when the user confirms the modal', () => {
            // all we really care about is that promiseDepositEther is called with the expected params.
            // EtherDeltaWeb3.test.js asserts correct behavour separately past that point
            const promiseDepositEtherMock = jest.spyOn(EtherDeltaWeb3, "promiseDepositEther")
            promiseDepositEtherMock.mockImplementation(() => {
                const promiEvent = Web3PromiEvent()
                promiEvent.eventEmitter.emit('transactionHash', '123')
                return promiEvent.eventEmitter
            })
            const value = '4'
            wrapper.find('#ethDepositAmount').hostNodes().simulate('change', { target: { value } })
            wrapper.find('#ethDepositAmountButton').hostNodes().simulate('click')
            wrapper.find('#fundingModalConfirmButton').hostNodes().simulate('click')

            expect(promiseDepositEtherMock).toHaveBeenCalledWith(
                primaryKeyAccount.address,
                0,
                BigNumber(Web3.utils.toWei(value, 'ether')),
                BigNumber(Web3.utils.toWei('6', 'gwei')))

            promiseDepositEtherMock.mockRestore()
        })
    })

    describe('User withdraws 3 ether', () => {
        beforeAll(() => {
            return EtherDeltaWeb3.promiseDepositEther(primaryKeyAccount.address, 0, BigNumber(Web3.utils.toWei('4', 'ether')), BigNumber(Web3.utils.toWei('6', 'gwei')))
                .then(() => {
                    return AccountApi.refreshAccountThenEthAndTokBalance(AccountType.PRIVATE_KEY, null, false)
                })
        })
        it('should propogate value through to store and back to UI, when user updates the eth withdraw amount', () => {
            const value = '3'
            wrapper.find('#ethWithdrawAmount').hostNodes().simulate('change', { target: { value } })

            const { ethWithdrawalAmountControlled, ethWithdrawalAmountWei } = FundingStore.getFundingState()
            expect(ethWithdrawalAmountControlled).toEqual(value)
            expect(ethWithdrawalAmountWei.toString()).toEqual(Web3.utils.toWei(value, 'ether'))

            expect(wrapper.find('#ethWithdrawAmount').hostNodes().props().value).toEqual(value)

            const fundingWrapper = wrapper.find(Funding)
            expect(FundingStore.getFundingState().ethWithdrawalState).toEqual(FundingState.OK)
            expect(fundingWrapper.instance().ethWithdrawalInputProps().ethWithdrawalValid).toEqual(true)
        })

        it('should set the maximum eth withdrawal amount', () => {
            wrapper.find('#ethWithdrawAmountMaxButton').hostNodes().simulate('click')

            const { ethWithdrawalAmountControlled, ethWithdrawalAmountWei } = FundingStore.getFundingState()
            expect(ethWithdrawalAmountControlled.toString()).toEqual('4')
            expect(ethWithdrawalAmountWei.toString()).toEqual(Web3.utils.toWei('4', 'ether'))

            expect(wrapper.find('#ethWithdrawAmount').hostNodes().props().value.toString()).toEqual('4')

            const fundingWrapper = wrapper.find(Funding)
            expect(FundingStore.getFundingState().ethWithdrawalState).toEqual(FundingState.OK)
            expect(fundingWrapper.instance().ethWithdrawalInputProps().ethWithdrawalValid).toEqual(true)
        })

        it('should display a confirmation modal when the user submits an eth withdrawal', () => {
            const value = '3'
            wrapper.find('#ethWithdrawAmount').hostNodes().simulate('change', { target: { value } })
            wrapper.find('#ethWithdrawAmountButton').hostNodes().simulate('click')
            const { modalType, modalText } = FundingStore.getFundingState()
            expect(modalType).toEqual(FundingModalType.ETH_WITHDRAWAL)
            expect(modalText).toEqual(`Withdraw ${value} ETH from exchange?`)
            expect(wrapper.find(Modal).instance().props.isOpen).toEqual(true)
            expect(wrapper.find('#fundingModalBody').hostNodes().text()).toEqual(`Withdraw ${value} ETH from exchange?`)
        })

        it('should execute the eth withdrawal when the user confirms the modal', () => {
            const promiseWithdrawEtherMock = jest.spyOn(EtherDeltaWeb3, "promiseWithdrawEther")
            promiseWithdrawEtherMock.mockImplementation(() => {
                const promiEvent = Web3PromiEvent()
                promiEvent.eventEmitter.emit('transactionHash', '123')
                return promiEvent.eventEmitter
            })
            const value = '3'
            wrapper.find('#ethWithdrawAmount').hostNodes().simulate('change', { target: { value } })
            wrapper.find('#ethWithdrawAmountButton').hostNodes().simulate('click')
            wrapper.find('#fundingModalConfirmButton').hostNodes().simulate('click')

            expect(promiseWithdrawEtherMock).toHaveBeenCalledWith(
                primaryKeyAccount.address,
                1,
                BigNumber(Web3.utils.toWei(value, 'ether')),
                BigNumber(Web3.utils.toWei('6', 'gwei')))

            promiseWithdrawEtherMock.mockRestore()
        })
    })


    describe('User deposits 8 ABC test tokens (18 decimals)', () => {
        it('should propogate value through to store and back to UI, when user updates the tok deposit amount', () => {
            const value = '8'
            wrapper.find('#tokDepositAmount').hostNodes().simulate('change', { target: { value } })
            const { tokDepositAmountControlled, tokDepositAmountWei } = FundingStore.getFundingState()
            expect(tokDepositAmountControlled).toEqual(value)
            expect(tokDepositAmountWei.toString()).toEqual(Web3.utils.toWei(value, 'ether'))
            expect(wrapper.find('#tokDepositAmount').hostNodes().props().value).toEqual(value)
            const fundingWrapper = wrapper.find(Funding)
            expect(FundingStore.getFundingState().tokDepositState).toEqual(FundingState.OK)
            expect(fundingWrapper.instance().tokDepositInputProps().tokDepositValid).toEqual(true)
        })

        it('should set the maximum token deposit amount', () => {
            wrapper.find('#tokDepositAmountMaxButton').hostNodes().simulate('click')

            const { tokDepositAmountControlled, tokDepositAmountWei } = FundingStore.getFundingState()
            expect(tokDepositAmountControlled.toString()).toEqual('20')
            expect(tokDepositAmountWei.toString()).toEqual(Web3.utils.toWei('20', 'ether'))

            expect(wrapper.find('#tokDepositAmount').hostNodes().props().value.toString()).toEqual('20')

            const fundingWrapper = wrapper.find(Funding)
            expect(FundingStore.getFundingState().tokDepositState).toEqual(FundingState.OK)
            expect(fundingWrapper.instance().tokDepositInputProps().tokDepositValid).toEqual(true)
        })

        it('should display a confirmation modal when the user submits a token deposit', () => {
            const value = '8'
            wrapper.find('#tokDepositAmount').hostNodes().simulate('change', { target: { value } })
            wrapper.find('#tokDepositAmountButton').hostNodes().simulate('click')
            const { modalType, modalText } = FundingStore.getFundingState()
            expect(modalType).toEqual(FundingModalType.TOK_DEPOSIT)
            expect(modalText).toEqual(`Deposit ${value} ABC to exchange?`)
            expect(wrapper.find(Modal).instance().props.isOpen).toEqual(true)
            expect(wrapper.find('#fundingModalBody').hostNodes().text()).toEqual(`Deposit ${value} ABC to exchange?`)
        })

        it('should execute a token approve when the user confirms the modal', () => {
            const promiseTokenApproveMock = jest.spyOn(EtherDeltaWeb3, "promiseTokenApprove")
            promiseTokenApproveMock.mockImplementation(() => {
                const promiEvent = Web3PromiEvent()
                promiEvent.eventEmitter.emit('transactionHash', '1234')
                return promiEvent.eventEmitter
            })

            const value = '8'
            wrapper.find('#tokDepositAmount').hostNodes().simulate('change', { target: { value } })
            wrapper.find('#tokDepositAmountButton').hostNodes().simulate('click')
            wrapper.find('#fundingModalConfirmButton').hostNodes().simulate('click')

            expect(promiseTokenApproveMock).toHaveBeenCalledWith(
                primaryKeyAccount.address,
                1,
                testTokenContractInstance.options.address,
                BigNumber(Web3.utils.toWei(value, 'ether')),
                BigNumber(Web3.utils.toWei('6', 'gwei')))

            promiseTokenApproveMock.mockRestore()
        })
        it('should execute a token deposit when the user confirms the modal', (done) => {

            const promiseDepositTokenMock = jest.spyOn(EtherDeltaWeb3, "promiseDepositToken")
            promiseDepositTokenMock.mockImplementation(() => {
                const promiEvent = Web3PromiEvent()
                promiEvent.eventEmitter.emit('transactionHash', '123')
                return promiEvent.eventEmitter
            })

            const value = '8'
            wrapper.find('#tokDepositAmount').hostNodes().simulate('change', { target: { value } })
            wrapper.find('#tokDepositAmountButton').hostNodes().simulate('click')
            wrapper.find('#fundingModalConfirmButton').hostNodes().simulate('click')

            // there is an async period between the token approval and the deposit
            setTimeout(() => {
                expect(promiseDepositTokenMock).toHaveBeenCalledWith(
                    primaryKeyAccount.address,
                    2,
                    testTokenContractInstance.options.address,
                    BigNumber(Web3.utils.toWei(value, 'ether')),
                    BigNumber(Web3.utils.toWei('6', 'gwei')))

                promiseDepositTokenMock.mockRestore()

                // need to reset the approval amount to zero in the token smart contract (so we can deposit tokens in the next test)
                return EtherDeltaWeb3.promiseTokenApprove(primaryKeyAccount.address, 2, testTokenContractInstance.options.address, BigNumber(0), BigNumber(Web3.utils.toWei('6', 'gwei')))
                    .then(res => {
                        done()
                    })
            }, 2000)

        })
    })

    describe('User withdraws 5 ABC test tokens (18 decimals)', () => {
        it('should propogate value through to store and back to UI, when user updates the eth withdraw amount', (done) => {
            const value = '8'
            wrapper.find('#tokDepositAmount').hostNodes().simulate('change', { target: { value } })
            wrapper.find('#tokDepositAmountButton').hostNodes().simulate('click')
            wrapper.find('#fundingModalConfirmButton').hostNodes().simulate('click')
            setTimeout(() => {
                const value = '5'
                wrapper.find('#tokWithdrawAmount').hostNodes().simulate('change', { target: { value } })

                const { tokWithdrawalAmountControlled, tokWithdrawalAmountWei } = FundingStore.getFundingState()
                expect(tokWithdrawalAmountControlled).toEqual(value)
                expect(tokWithdrawalAmountWei.toString()).toEqual(Web3.utils.toWei(value, 'ether'))

                expect(wrapper.find('#tokWithdrawAmount').hostNodes().props().value).toEqual(value)

                const fundingWrapper = wrapper.find(Funding)
                expect(FundingStore.getFundingState().tokWithdrawalState).toEqual(FundingState.OK)
                expect(fundingWrapper.instance().tokWithdrawalInputProps().tokWithdrawalValid).toEqual(true)
                done()
            }, 2000)
        })

        it('should set the maximum token withdrawal amount', () => {
            wrapper.find('#tokWithdrawAmountMaxButton').hostNodes().simulate('click')

            const { tokWithdrawalAmountControlled, tokWithdrawalAmountWei } = FundingStore.getFundingState()
            expect(tokWithdrawalAmountControlled.toString()).toEqual('8')
            expect(tokWithdrawalAmountWei.toString()).toEqual(Web3.utils.toWei('8', 'ether'))

            expect(wrapper.find('#tokWithdrawAmount').hostNodes().props().value.toString()).toEqual('8')

            const fundingWrapper = wrapper.find(Funding)
            expect(FundingStore.getFundingState().tokWithdrawalState).toEqual(FundingState.OK)
            expect(fundingWrapper.instance().tokWithdrawalInputProps().tokWithdrawalValid).toEqual(true)
        })

        it('should display a confirmation modal when the user submits a token withdrawal', () => {
            const value = '5'
            wrapper.find('#tokWithdrawAmount').hostNodes().simulate('change', { target: { value } })
            wrapper.find('#tokWithdrawAmountButton').hostNodes().simulate('click')
            const { modalType, modalText } = FundingStore.getFundingState()
            expect(modalType).toEqual(FundingModalType.TOK_WITHDRAWAL)
            expect(modalText).toEqual(`Withdraw ${value} ABC from exchange?`)
            expect(wrapper.find(Modal).instance().props.isOpen).toEqual(true)
            expect(wrapper.find('#fundingModalBody').hostNodes().text()).toEqual(`Withdraw ${value} ABC from exchange?`)
        })

        it('should execute the token withdrawal when the user confirms the modal', () => {
            const promiseWithdrawTokenMock = jest.spyOn(EtherDeltaWeb3, "promiseWithdrawToken")
            promiseWithdrawTokenMock.mockImplementation(() => {
                const promiEvent = Web3PromiEvent()
                promiEvent.eventEmitter.emit('transactionHash', '123')
                return promiEvent.eventEmitter
            })
            const value = '5'
            wrapper.find('#tokWithdrawAmount').hostNodes().simulate('change', { target: { value } })
            wrapper.find('#tokWithdrawAmountButton').hostNodes().simulate('click')
            wrapper.find('#fundingModalConfirmButton').hostNodes().simulate('click')

            expect(promiseWithdrawTokenMock).toHaveBeenCalledWith(
                primaryKeyAccount.address,
                5,
                testTokenContractInstance.options.address,
                BigNumber(Web3.utils.toWei(value, 'ether')),
                BigNumber(Web3.utils.toWei('6', 'gwei')))

            promiseWithdrawTokenMock.mockRestore()
        })
    })

    describe('User deposits 3 DEF test tokens (9 decimals)', () => {
        beforeAll(() => {
            const nineDecimalToken = {
                address: testTokenContractInstanceNineDecimals.options.address,
                decimals: 9,
                isListed: true,
                name: null,
                symbol: 'DEF'
            }
            TokenStore.listedTokens[0] = nineDecimalToken
            TokenActions.selectToken(nineDecimalToken)
            Config.getEnv().defaultPair.token.address = testTokenContractInstanceNineDecimals.options.address
            Config.getEnv().defaultPair.token.decimals = 9
            return AccountApi.refreshAccountThenEthAndTokBalance(AccountType.PRIVATE_KEY, null, false)
        })

        it('should propogate value through to store and back to UI, when user updates the tok deposit amount', () => {
            const value = '3'
            wrapper.find('#tokDepositAmount').hostNodes().simulate('change', { target: { value } })
            const { tokDepositAmountControlled, tokDepositAmountWei } = FundingStore.getFundingState()
            expect(tokDepositAmountControlled).toEqual(value)
            expect(tokDepositAmountWei.toString()).toEqual(BigNumber(value).times(BigNumber(10 ** 9)).toString())
            expect(wrapper.find('#tokDepositAmount').hostNodes().props().value).toEqual(value)
            const fundingWrapper = wrapper.find(Funding)
            expect(FundingStore.getFundingState().tokDepositState).toEqual(FundingState.OK)
            expect(fundingWrapper.instance().tokDepositInputProps().tokDepositValid).toEqual(true)
        })

        it('should set the maximum token deposit amount', () => {
            wrapper.find('#tokDepositAmountMaxButton').hostNodes().simulate('click')

            const { tokDepositAmountControlled, tokDepositAmountWei } = FundingStore.getFundingState()
            expect(tokDepositAmountControlled.toString()).toEqual('20')
            expect(tokDepositAmountWei.toString()).toEqual(BigNumber('20').times(BigNumber(10 ** 9)).toString())

            expect(wrapper.find('#tokDepositAmount').hostNodes().props().value.toString()).toEqual('20')

            const fundingWrapper = wrapper.find(Funding)
            expect(FundingStore.getFundingState().tokDepositState).toEqual(FundingState.OK)
            expect(fundingWrapper.instance().tokDepositInputProps().tokDepositValid).toEqual(true)
        })

        it('should display a confirmation modal when the user submits a token deposit', () => {
            const value = '3'
            wrapper.find('#tokDepositAmount').hostNodes().simulate('change', { target: { value } })
            wrapper.find('#tokDepositAmountButton').hostNodes().simulate('click')
            const { modalType, modalText } = FundingStore.getFundingState()
            expect(modalType).toEqual(FundingModalType.TOK_DEPOSIT)
            expect(modalText).toEqual(`Deposit ${value} DEF to exchange?`)
            expect(wrapper.find(Modal).instance().props.isOpen).toEqual(true)
            expect(wrapper.find('#fundingModalBody').hostNodes().text()).toEqual(`Deposit ${value} DEF to exchange?`)
        })

        it('should execute a token approve when the user confirms the modal', () => {
            const promiseTokenApproveMock = jest.spyOn(EtherDeltaWeb3, "promiseTokenApprove")
            promiseTokenApproveMock.mockImplementation(() => {
                const promiEvent = Web3PromiEvent()
                promiEvent.eventEmitter.emit('transactionHash', '1234')
                return promiEvent.eventEmitter
            })

            const value = '3'
            wrapper.find('#tokDepositAmount').hostNodes().simulate('change', { target: { value } })
            wrapper.find('#tokDepositAmountButton').hostNodes().simulate('click')
            wrapper.find('#fundingModalConfirmButton').hostNodes().simulate('click')

            expect(promiseTokenApproveMock).toHaveBeenCalledWith(
                primaryKeyAccount.address,
                5,
                testTokenContractInstanceNineDecimals.options.address,
                BigNumber(value).times(BigNumber(10 ** 9)),
                BigNumber(Web3.utils.toWei('6', 'gwei')))

            promiseTokenApproveMock.mockRestore()
        })
        it('should execute a token deposit when the user confirms the modal', (done) => {

            const promiseDepositTokenMock = jest.spyOn(EtherDeltaWeb3, "promiseDepositToken")
            promiseDepositTokenMock.mockImplementation(() => {
                const promiEvent = Web3PromiEvent()
                promiEvent.eventEmitter.emit('transactionHash', '123')
                return promiEvent.eventEmitter
            })

            const value = '3'
            wrapper.find('#tokDepositAmount').hostNodes().simulate('change', { target: { value } })
            wrapper.find('#tokDepositAmountButton').hostNodes().simulate('click')
            wrapper.find('#fundingModalConfirmButton').hostNodes().simulate('click')

            // there is an async period between the token approval and the deposit
            setTimeout(() => {
                expect(promiseDepositTokenMock).toHaveBeenCalledWith(
                    primaryKeyAccount.address,
                    6,
                    testTokenContractInstanceNineDecimals.options.address,
                    BigNumber(value).times(BigNumber(10 ** 9)),
                    BigNumber(Web3.utils.toWei('6', 'gwei')))

                promiseDepositTokenMock.mockRestore()

                // need to reset the approval amount to zero in the token smart contract (so we can deposit tokens in the next test)
                return EtherDeltaWeb3.promiseTokenApprove(primaryKeyAccount.address, 6, testTokenContractInstanceNineDecimals.options.address, BigNumber(0), BigNumber(Web3.utils.toWei('6', 'gwei')))
                    .then(res => {
                        done()
                    })
            }, 2000)

        })
    })

    describe('User withdraws 2 DEF test tokens (9 decimals)', () => {
        it('should propogate value through to store and back to UI, when user updates the eth withdraw amount', (done) => {
            const value = '3'
            wrapper.find('#tokDepositAmount').hostNodes().simulate('change', { target: { value } })
            wrapper.find('#tokDepositAmountButton').hostNodes().simulate('click')
            wrapper.find('#fundingModalConfirmButton').hostNodes().simulate('click')
            setTimeout(() => {
                const value = '2'
                wrapper.find('#tokWithdrawAmount').hostNodes().simulate('change', { target: { value } })

                const { tokWithdrawalAmountControlled, tokWithdrawalAmountWei } = FundingStore.getFundingState()
                expect(tokWithdrawalAmountControlled).toEqual(value)
                expect(tokWithdrawalAmountWei.toString()).toEqual(BigNumber(value).times(BigNumber(10 ** 9)).toString())

                expect(wrapper.find('#tokWithdrawAmount').hostNodes().props().value).toEqual(value)

                const fundingWrapper = wrapper.find(Funding)
                expect(FundingStore.getFundingState().tokWithdrawalState).toEqual(FundingState.OK)
                expect(fundingWrapper.instance().tokWithdrawalInputProps().tokWithdrawalValid).toEqual(true)
                done()
            }, 2000)
        })

        it('should set the maximum token withdrawal amount', () => {
            wrapper.find('#tokWithdrawAmountMaxButton').hostNodes().simulate('click')

            const { tokWithdrawalAmountControlled, tokWithdrawalAmountWei } = FundingStore.getFundingState()
            expect(tokWithdrawalAmountControlled.toString()).toEqual('3')
            expect(tokWithdrawalAmountWei.toString()).toEqual(BigNumber('3').times(BigNumber(10 ** 9)).toString())

            expect(wrapper.find('#tokWithdrawAmount').hostNodes().props().value.toString()).toEqual('3')

            const fundingWrapper = wrapper.find(Funding)
            expect(FundingStore.getFundingState().tokWithdrawalState).toEqual(FundingState.OK)
            expect(fundingWrapper.instance().tokWithdrawalInputProps().tokWithdrawalValid).toEqual(true)
        })

        it('should display a confirmation modal when the user submits a token withdrawal', () => {
            const value = '2'
            wrapper.find('#tokWithdrawAmount').hostNodes().simulate('change', { target: { value } })
            wrapper.find('#tokWithdrawAmountButton').hostNodes().simulate('click')
            const { modalType, modalText } = FundingStore.getFundingState()
            expect(modalType).toEqual(FundingModalType.TOK_WITHDRAWAL)
            expect(modalText).toEqual(`Withdraw ${value} DEF from exchange?`)
            expect(wrapper.find(Modal).instance().props.isOpen).toEqual(true)
            expect(wrapper.find('#fundingModalBody').hostNodes().text()).toEqual(`Withdraw ${value} DEF from exchange?`)
        })

        it('should execute the token withdrawal when the user confirms the modal', () => {
            const promiseWithdrawTokenMock = jest.spyOn(EtherDeltaWeb3, "promiseWithdrawToken")
            promiseWithdrawTokenMock.mockImplementation(() => {
                const promiEvent = Web3PromiEvent()
                promiEvent.eventEmitter.emit('transactionHash', '123')
                return promiEvent.eventEmitter
            })
            const value = '2'
            wrapper.find('#tokWithdrawAmount').hostNodes().simulate('change', { target: { value } })
            wrapper.find('#tokWithdrawAmountButton').hostNodes().simulate('click')
            wrapper.find('#fundingModalConfirmButton').hostNodes().simulate('click')

            expect(promiseWithdrawTokenMock).toHaveBeenCalledWith(
                primaryKeyAccount.address,
                9,
                testTokenContractInstanceNineDecimals.options.address,
                BigNumber(value).times(BigNumber(10 ** 9)),
                BigNumber(Web3.utils.toWei('6', 'gwei')))

            promiseWithdrawTokenMock.mockRestore()
        })
    })

})