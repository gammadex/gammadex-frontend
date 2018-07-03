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
import TransferStore from "../stores/TransferStore"
import FundingState from "../components/Account/FundingState"

import { deployContracts } from '../util/ContractDeployer'

import * as TokenActions from "../actions/TokenActions"
import * as GasActions from "../actions/GasActions"

import { ModalBody, Modal, ModalFooter } from 'reactstrap'

import Web3PromiEvent from 'web3-core-promievent'
import BigNumber from 'bignumber.js'

import _ from "lodash"
import {formatNumber} from '../util/FormatUtil'

const web3 = new Web3(new Web3.providers.HttpProvider(Config.getWeb3Url()))
const metamaskAddress = '0xfcad0b19bb29d4674531d6f115237e16afce377c'
const primaryKeyAccount = web3.eth.accounts.create()
const feeAccount = web3.eth.accounts.create()
const defaultGasPrice = web3.utils.toWei('3', 'gwei')

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
                return AccountApi.refreshAccountThenEthAndTokBalance(AccountType.PRIVATE_KEY, null, false)
            })
    })
    it('should render initial state where user has 10 ETH and 20 ABC test tokens in wallet', () => {
        const wrapper = mount(
            <AccountDetail />
        )
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
            const wrapper = mount(
                <AccountDetail />
            )
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

        it('should display a confirmation modal when the user submits an eth deposit', () => {
            const wrapper = mount(
                <AccountDetail />
            )
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

        describe('should execute the eth deposit when the user confirms the modal', () => {
            it('variation 1 using jest mock of EtherDeltaWeb3', () => {
                // all we really care about is that promiseDepositEther is called with the expected params.
                // EtherDeltaWeb3.test.js asserts correct behavour separately past that point
                const promiseDepositEtherMock = jest.spyOn(EtherDeltaWeb3, "promiseDepositEther")
                promiseDepositEtherMock.mockImplementation(() => {
                    const promiEvent = Web3PromiEvent()
                    promiEvent.eventEmitter.emit('transactionHash', '123')
                    return promiEvent.eventEmitter
                })
                const wrapper = mount(
                    <AccountDetail />
                )
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
            it('variation 2 using actual web3 and local ganache blockchain', (done) => {
                // this might be considered overkill since we already comprehensively test EtherDeltaWeb3 in EtherDeltaWeb3.test.js
                const wrapper = mount(
                    <AccountDetail />
                )
                const value = '4'
                wrapper.find('#ethDepositAmount').hostNodes().simulate('change', { target: { value } })
                wrapper.find('#ethDepositAmountButton').hostNodes().simulate('click')
                wrapper.find('#fundingModalConfirmButton').hostNodes().simulate('click')

                // the last action of confirmation the modal triggers some async logic to execute the deposit.
                // We do not have easy access to that future, after triggering the 'click' event so wait for 2s.
                setTimeout(() => {
                    // check the correct amount has been deposited into the exchange
                    expect(wrapper.find('#tdExchangeBalanceEth').text()).toEqual('4.000')

                    // check the correct amount has been deducted from the wallet (including the gas fee)
                    const txHash = _.last(TransferStore.getAllTransfers()).txHash
                    return web3.eth.getTransactionReceipt(txHash)
                        .then(receipt => {
                            const gasCostWei = BigNumber(receipt.gasUsed).times(BigNumber(Web3.utils.toWei('6', 'gwei')))
                            const remainingWalletEthWei = BigNumber(Web3.utils.toWei('10', 'ether'))
                                .minus(BigNumber(Web3.utils.toWei(value, 'ether')))
                                .minus(gasCostWei)

                            const { walletBalanceEthWei } = AccountStore.getAccountState()
                            expect(remainingWalletEthWei.toString()).toEqual(walletBalanceEthWei.toString())
                            expect(wrapper.find('#tdWalletBalanceEth').text())
                                .toEqual(formatNumber(BigNumber(Web3.utils.fromWei(remainingWalletEthWei.toString())), 3))
                            done()
                        })
                }, 500)
            })
        })
    })
})