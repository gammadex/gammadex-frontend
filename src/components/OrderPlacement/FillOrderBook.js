import React from "react"
import _ from "lodash"
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col, FormGroup, Alert, FormText, Modal, ModalBody, ModalFooter } from 'reactstrap'
import { Box, BoxSection, BoxHeader } from "../CustomComponents/Box"
import EmptyTableMessage from "../CustomComponents/EmptyTableMessage"
import OrderBookStore from "../../stores/OrderBookStore"
import TradeStore from "../../stores/TradeStore"
import GasPriceStore from "../../stores/GasPriceStore"
import AccountStore from "../../stores/AccountStore"
import NumericInput from "./NumericInput.js"
import { priceOf, isTakerSell } from "../../OrderUtil.js"
import OrderSide from "../../OrderSide"
import OrderEntryField from "../../OrderEntryField"
import * as TradeActions from "../../actions/TradeActions"
import Config from "../../Config"
import Conditional from "../CustomComponents/Conditional"
import GasPriceChooser from "../GasPriceChooser"
import { OperationCosts } from "../../ContractOperations"
import { gweiToEth, safeBigNumber, baseWeiToEth, tokWeiToEth } from "../../EtherConversion"
import * as OrderPlacementActions from "../../actions/OrderPlacementActions"
import AccountType from "../../AccountType"
import BigNumber from 'bignumber.js'
import {Popover, PopoverBody} from "reactstrap/dist/reactstrap"
import {toFixedStringNoTrailingZeros} from "../../util/NumberUtil"

export default class FillOrderBook extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            orders: [],
            fillOrder: null,
            currentGasPriceWei: null,
            ethereumPriceUsd: null,
            exchangeBalanceEthWei: 0,
            exchangeBalanceTokWei: 0,
            selectedAccountType: null,
            confirmTradeModalSide: null,
            popOverOpenExchangeFee: false,
        }
        this.saveGasPrices = this.saveGasPrices.bind(this)
        this.onOrderBookChange = this.onOrderBookChange.bind(this)
        this.onTradeStoreChange = this.onTradeStoreChange.bind(this)
        this.isTakerBuyComponent = this.isTakerBuyComponent.bind(this)
        this.checkFillOrder = this.checkFillOrder.bind(this)
        this.saveAccountState = this.saveAccountState.bind(this)
        this.onConfirm = this.onConfirm.bind(this)
    }

    componentDidMount() {
        OrderBookStore.on("change", this.onOrderBookChange)
        TradeStore.on("change", this.onTradeStoreChange)
        GasPriceStore.on("change", this.saveGasPrices)
        AccountStore.on("change", this.saveAccountState)
        this.onTradeStoreChange()
        this.onOrderBookChange()
        this.saveGasPrices()
        this.saveAccountState()
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.onOrderBookChange)
        TradeStore.removeListener("change", this.onTradeStoreChange)
        GasPriceStore.removeListener("change", this.saveGasPrices)
        AccountStore.removeListener("change", this.saveAccountState)
    }

    isTakerBuyComponent() {
        const { type } = this.props
        return type === OrderSide.BUY
    }
    onOrderBookChange() {
        this.setState({
            orders: this.isTakerBuyComponent() ? OrderBookStore.getOffers() : OrderBookStore.getBids()
        }, () => {
            // this.checkFillOrder() <-- in react-flux you cannot call a dispatcher from within another dispatch loop!
            // perhaps revisit this when we move to redux+thunk
        })
        // TODO trigger remove fillOrder action if the current fillOrder is no longer present in the order book (e.g. someone else got it) 
    }

    saveAccountState() {
        const { exchangeBalanceEthWei, exchangeBalanceTokWei, selectedAccountType } = AccountStore.getAccountState()
        this.setState({
            exchangeBalanceEthWei: exchangeBalanceEthWei,
            exchangeBalanceTokWei: exchangeBalanceTokWei,
            selectedAccountType: selectedAccountType
        })
    }

    checkFillOrder() {
        const { fillOrder, orders } = this.state
        if (fillOrder && !this.ordersContains(orders, fillOrder)) {
            TradeActions.clearFillOrder(this.props.type)
        }
    }

    onTradeStoreChange() {
        const tradeState = TradeStore.getTradeState()
        if (this.isTakerBuyComponent()) {
            this.setState({
                fillOrder: tradeState.fillOrderTakerBuy,
                confirmTradeModalSide: tradeState.confirmTradeModalSide
            })
        } else {
            this.setState({
                fillOrder: tradeState.fillOrderTakerSell,
                confirmTradeModalSide: tradeState.confirmTradeModalSide
            })
        }
    }

    saveGasPrices() {
        const { currentGasPriceWei, ethereumPriceUsd } = this.state
        this.setState({
            currentGasPriceWei: GasPriceStore.getCurrentGasPriceWei() == null ? currentGasPriceWei : GasPriceStore.getCurrentGasPriceWei(),
            ethereumPriceUsd: GasPriceStore.getEthereumPriceUsd() == null ? ethereumPriceUsd : GasPriceStore.getEthereumPriceUsd()
        })
    }

    ordersContains(orders, fillOrder) {
        return typeof _.find(orders, { id: fillOrder.order.id }) !== 'undefined'
    }

    showTradeFields(orders, fillOrder) {
        if (orders.length === 0 || !fillOrder) return false
        return this.ordersContains(orders, fillOrder)
    }

    onOrderAmountChange = (value) => {
        TradeActions.fillOrderAmountChanged(value, this.state.fillOrder)
    }

    onMaxAmount = () => {
        TradeActions.maxFillOrder(this.state.fillOrder)
    }

    onSubmit = event => {
        if (!this.isSubmitDisabled()) {
            const { fillOrder, selectedAccountType } = this.state
            if (selectedAccountType === AccountType.METAMASK || selectedAccountType === AccountType.LEDGER) {
                TradeActions.executeFillOrder(fillOrder)
            } else {
                TradeActions.confirmFillOrder(this.props.type)
            }
        }

        if (event) {
            event.preventDefault()
        }
    }

    onAbort = event => {
        TradeActions.hideFillOrderModal()
    }

    onConfirm = event => {
        TradeActions.hideFillOrderModal()
        if (!this.isSubmitDisabled()) {
            TradeActions.executeFillOrder(this.state.fillOrder)
        }
    }

    isSubmitDisabled = () => {
        const { balanceRetrieved } = this.props
        const { fillOrder } = this.state

        return !fillOrder.fillAmountValid || !balanceRetrieved
    }

    toggleExchangeFeePopOver = () => {
        this.setState({
            popOverOpenExchangeFee: !this.state.popOverOpenExchangeFee
        })
    }

    render() {
        const {
            type, tokenSymbol, tokenAddress, balanceRetrieved
        } = this.props

        const {
            orders,
            fillOrder,
            ethereumPriceUsd,
            exchangeBalanceEthWei,
            exchangeBalanceTokWei,
            confirmTradeModalSide
        } = this.state

        let body = null
        if (this.showTradeFields(orders, fillOrder)) {
            // https://github.com/etherdelta/etherdelta.github.io/blob/master/docs/SMART_CONTRACT.md
            // fees:
            // amount in amountGet terms
            // token in tokenGet terms 
            // calc = amount * 0.003
            const exchangeCost = safeBigNumber(isTakerSell(fillOrder.order) ? fillOrder.fillAmountControlled : fillOrder.totalEthControlled).times(safeBigNumber(Config.getExchangeFeePercent()))
            const exchangeCostUnits = isTakerSell(fillOrder.order) ? tokenSymbol : "ETH"

            let usdExchangeCost = ""
            if (exchangeCost) {
                if (exchangeCostUnits === 'ETH') {
                    usdExchangeCost = exchangeCost.times(safeBigNumber(ethereumPriceUsd))
                } else {
                    usdExchangeCost = exchangeCost.times(safeBigNumber(ethereumPriceUsd)).div(priceOf(fillOrder.order))
                }
                usdExchangeCost = usdExchangeCost.toFixed(3).toString()
            }

            const available = type === OrderSide.BUY ? baseWeiToEth(exchangeBalanceEthWei) : tokWeiToEth(exchangeBalanceTokWei, tokenAddress)

            const amountFieldValid = fillOrder.fillAmountInvalidField === OrderEntryField.AMOUNT ? fillOrder.fillAmountValid : true
            const amountFieldErrorMessage = fillOrder.fillAmountInvalidField === OrderEntryField.AMOUNT ? fillOrder.fillAmountInvalidReason : ""
            const totalFieldValid = fillOrder.fillAmountInvalidField === OrderEntryField.TOTAL ? fillOrder.fillAmountValid : true
            const totalFieldErrorMessage = fillOrder.fillAmountInvalidField === OrderEntryField.TOTAL ? fillOrder.fillAmountInvalidReason : ""

            let bestExecutionWarning = null
            if (!fillOrder.isBestExecution) {
                bestExecutionWarning = <Alert color="warning" className="best-execution-warning">You have not selected the best order in the {type === OrderSide.BUY ? 'OFFERS' : 'BIDS'} book
                . The same amount of {tokenSymbol} can be {type === OrderSide.BUY ? 'bought' : 'sold'} for a {type === OrderSide.BUY ? 'cheaper' : 'higher'} price.</Alert>
            }

            const submitDisabled = this.isSubmitDisabled()
            const balanceUnitName = type === OrderSide.BUY ? 'ETH' : tokenSymbol
            const orderAmountAvailable = OrderSide.BUY ? fillOrder.order.ethAvailableVolumeBase : fillOrder.order.ethAvailableVolume
            const maxAvailable = BigNumber.min(available, orderAmountAvailable)

            body =
                <BoxSection className={"order-box"}>
                    <hr/>

                    <form onSubmit={this.onSubmit}>
                        <NumericInput name="Price" value={priceOf(fillOrder.order).toFixed(8)} unitName="ETH"
                            fieldName={type + "OrderPrice"} disabled="true" />

                        <NumericInput name="Amount" value={fillOrder.fillAmountControlled} unitName={tokenSymbol}
                            onChange={this.onOrderAmountChange} fieldName={type + "OrderAmount"}
                            valid={amountFieldValid} errorMessage={amountFieldErrorMessage}
                                      slider={{
                                          min: safeBigNumber(0),
                                          max: maxAvailable
                                      }}
                                      addendum={[
                                          `${balanceUnitName} balance: ${available.toFixed(3).toString()}`,
                                          `${balanceUnitName} max for this trade: ${maxAvailable.toFixed(3).toString()}`,
                                      ]}
                                      invalidFeedbackAbove />

                        <NumericInput name="Total" value={fillOrder.totalEthControlled.toFixed(3)} unitName="ETH"
                            fieldName={type + "OrderTotal"}
                            valid={totalFieldValid} errorMessage={totalFieldErrorMessage}
                            disabled="true" />

                        <div className="trading-fees">
                        <table>
                            <tbody>
                            <tr>
                                <td>0.3% Exchange Fee</td>
                                <td>
                                    {exchangeCost.toFixed(5)} {exchangeCostUnits}
                                    <br/>{usdExchangeCost} USD
                                </td>
                                <td>
                                    <span id={"ExchangeFeePopover"} onClick={this.toggleExchangeFeePopOver}>
                                        <i className="fas fa-question-circle"></i>
                                    </span>
                                    <Popover placement="bottom" isOpen={this.state.popOverOpenExchangeFee} target={"ExchangeFeePopover"} toggle={this.toggleExchangeFeePopOver}>
                                        <PopoverBody>
                                            0.3% fee deducted by the EtherDelta smart contract
                                        </PopoverBody>
                                    </Popover>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        </div>

                        <FormGroup row className="hdr-stretch-ctr">
                            <Col sm={6}>
                                <Button block color={type === OrderSide.BUY ? 'success' : 'danger'} id={type + "Button"} disabled={submitDisabled} type="submit"
                                    onClick={this.onSubmit}>{type === OrderSide.BUY ? 'BUY' : 'SELL'}</Button>
                                <Conditional displayCondition={!balanceRetrieved}>
                                    <FormText color="muted">{`Please unlock a wallet to enable ${type === OrderSide.BUY ? 'BUY' : 'SELL'} trades`}</FormText>
                                </Conditional>
                            </Col>
                        </FormGroup>
                    </form>

                    {bestExecutionWarning}

                    <Modal isOpen={confirmTradeModalSide!=null  && confirmTradeModalSide === type} toggle={this.abortFundingAction} className={this.props.className} keyboard>
                        <ModalBody>{`${type === OrderSide.BUY ? 'BUY' : 'SELL'} ${fillOrder.fillAmountControlled} ${tokenSymbol}?`}</ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={this.onAbort}>Abort</Button>{' '}
                            <Button color="primary" onClick={this.onConfirm}>{`${type === OrderSide.BUY ? 'BUY' : 'SELL'} ${tokenSymbol}`}</Button>
                        </ModalFooter>
                    </Modal>
                </BoxSection>
        } else {
            body =
                <BoxSection className={"order-box"}>
                    <EmptyTableMessage>Select an order from the {type === OrderSide.BUY ? 'OFFERS' : 'BIDS'} book to trade.</EmptyTableMessage>
                </BoxSection>
        }

        return body
    }
}