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
import { gweiToEth, safeBigNumber, baseWeiToEth, tokWeiToEth } from "../../EtherConversion"
import AccountType from "../../AccountType"
import {Popover, PopoverBody} from "reactstrap/dist/reactstrap"
import OrderPercentageSlider from "./OrderPercentageSlider"

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

    onOrderTotalChange = (value) => {
        TradeActions.fillOrderTotalChanged(safeBigNumber(value), this.state.fillOrder)
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

    onSliderChange = (value) => {
        if (this.isTakerBuyComponent()) {
            this.onOrderTotalChange(value)
        } else {
            this.onOrderAmountChange(value)
        }
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
            const buySell = type === OrderSide.BUY ? 'BUY' : 'SELL'

            let slider = null
            if (type === OrderSide.BUY) {
                const balanceEth = baseWeiToEth(exchangeBalanceEthWei)
                const orderMaxVolumeEth = safeBigNumber(fillOrder.order.ethAvailableVolumeBase)
                const addendum= (
                    <div>
                        <div>ETH balance: <span className="clickable" onClick={() => this.onOrderTotalChange(String(balanceEth))}>{balanceEth.toFixed(3).toString()}</span></div>
                        <div className="mt-2">ETH volume available: <span className="clickable" onClick={() => this.onOrderTotalChange(orderMaxVolumeEth)}>{orderMaxVolumeEth.toFixed(3).toString()}</span></div>
                    </div>
                )
                slider = <OrderPercentageSlider onChange={this.onSliderChange} value={fillOrder.fillAmountControlled} minValue={safeBigNumber(0)} maxValue={orderMaxVolumeEth} addendum={addendum} />
            } else {
                const balanceTok = tokWeiToEth(exchangeBalanceTokWei, tokenAddress)
                const orderMaxVolumeTok = safeBigNumber(fillOrder.order.ethAvailableVolume)
                const addendum= (
                    <div>
                        <div>{tokenSymbol} balance: <span className="clickable" onClick={() => this.onOrderAmountChange(String(balanceTok))}>{balanceTok.toFixed(3).toString()}</span></div>
                        <div className="mt-2">{tokenSymbol} volume available: <span className="clickable" onClick={() => this.onOrderAmountChange(orderMaxVolumeTok)}>{orderMaxVolumeTok.toFixed(3).toString()}</span></div>
                    </div>
                )
                slider = <OrderPercentageSlider onChange={this.onSliderChange} value={fillOrder.fillAmountControlled} minValue={safeBigNumber(0)} maxValue={orderMaxVolumeTok} addendum={addendum} />
            }

            body =
                <BoxSection className={"order-box"}>
                    <form onSubmit={this.onSubmit}>
                        <NumericInput name="Price" value={priceOf(fillOrder.order).toFixed(8)} unitName="ETH"
                            fieldName={type + "OrderPrice"} disabled="true" />

                        <NumericInput name="Amount" value={fillOrder.fillAmountControlled} unitName={tokenSymbol}
                            onChange={this.onOrderAmountChange} fieldName={type + "OrderAmount"}
                            valid={amountFieldValid} errorMessage={amountFieldErrorMessage}
                                      invalidFeedbackAbove />

                        <Row>
                            <Col sm={3}/>
                            <Col sm={9}>
                                {slider}
                            </Col>
                        </Row>

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
                                    onClick={this.onSubmit}>{buySell}</Button>
                                <Conditional displayCondition={!balanceRetrieved}>
                                    <FormText color="muted">{`Please unlock a wallet to enable ${buySell} trades`}</FormText>
                                </Conditional>
                            </Col>
                        </FormGroup>
                    </form>

                    {bestExecutionWarning}

                    <Modal isOpen={confirmTradeModalSide!=null && confirmTradeModalSide === type} toggle={this.abortFundingAction} className={this.props.className} keyboard>
                        <ModalBody id={type + 'FillOrderModal'}>{`${buySell} ${fillOrder.fillAmountControlled} ${tokenSymbol}?`}</ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={this.onAbort}>Abort</Button>{' '}
                            <Button id={type + 'FillOrderModalButton'} color="primary" onClick={this.onConfirm}>{`${buySell} ${tokenSymbol}`}</Button>
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