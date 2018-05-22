import React from "react"
import _ from "lodash"
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col, FormGroup, Alert, FormText } from 'reactstrap'
import { Box, BoxSection, BoxHeader } from "../CustomComponents/Box"
import EmptyTableMessage from "../CustomComponents/EmptyTableMessage"
import OrderBookStore from "../../stores/OrderBookStore"
import TradeStore from "../../stores/TradeStore"
import GasPriceStore from "../../stores/GasPriceStore"
import NumericInput from "./NumericInput.js"
import { priceOf, isTakerSell } from "../../OrderUtil.js"
import OrderSide from "../../OrderSide"
import OrderEntryField from "../../OrderEntryField"
import * as TradeActions from "../../actions/TradeActions"
import Config from "../../Config"
import Conditional from "../CustomComponents/Conditional"
import GasPriceChooser from "../GasPriceChooser"
import { OperationWeights } from "../../ContractOperations"
import { gweiToEth, safeBigNumber } from "../../EtherConversion"

export default class FillOrderBook extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            orders: [],
            fillOrder: null,
            currentGasPriceWei: 4000000000, // 4 gwei
            ethereumPriceUsd: 700.0 // TODO, eugh - how should the ui handle no USD price?
        }
        this.saveGasPrices = this.saveGasPrices.bind(this)
        this.onOrderBookChange = this.onOrderBookChange.bind(this)
        this.onTradeStoreChange = this.onTradeStoreChange.bind(this)
        this.isTakerBuyComponent = this.isTakerBuyComponent.bind(this)
        this.checkFillOrder = this.checkFillOrder.bind(this)
    }

    componentDidMount() {
        OrderBookStore.on("change", this.onOrderBookChange)
        TradeStore.on("change", this.onTradeStoreChange)
        GasPriceStore.on("change", this.saveGasPrices)
        this.onTradeStoreChange()
        this.onOrderBookChange()
        this.saveGasPrices()
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.onOrderBookChange)
        TradeStore.removeListener("change", this.onTradeStoreChange)
        GasPriceStore.removeListener("change", this.saveGasPrices)
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
                fillOrder: tradeState.fillOrderTakerBuy
            })
        } else {
            this.setState({
                fillOrder: tradeState.fillOrderTakerSell
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

    onSubmit = () => {
        TradeActions.executeFillOrder(this.state.fillOrder)
    }

    render() {
        const {
            type, tokenName, balanceRetrieved
        } = this.props

        const {
            orders,
            fillOrder,
            currentGasPriceWei,
            ethereumPriceUsd
        } = this.state

        let body = null
        if (this.showTradeFields(orders, fillOrder)) {
            const currentGasPriceGwei = GasPriceChooser.safeWeiToGwei(currentGasPriceWei)
            const estimatedOperationCost = OperationWeights.TAKE_ORDER
            const estimatedGasCost = gweiToEth(estimatedOperationCost * currentGasPriceGwei)
            // https://github.com/etherdelta/etherdelta.github.io/blob/master/docs/SMART_CONTRACT.md
            // fees:
            // amount in amountGet terms
            // token in tokenGet terms 
            // calc = amount * 0.003
            const exchangeCost = safeBigNumber(isTakerSell(fillOrder.order) ? fillOrder.fillAmountControlled : fillOrder.totalEthControlled).times(safeBigNumber(Config.getExchangeFeePercent()))
            const exchangeCostUnits = isTakerSell(fillOrder.order) ? tokenName : "ETH"

            const amountFieldValid = fillOrder.fillAmountInvalidField === OrderEntryField.AMOUNT ? fillOrder.fillAmountValid : true
            const amountFieldErrorMessage = fillOrder.fillAmountInvalidField === OrderEntryField.AMOUNT ? fillOrder.fillAmountInvalidReason : ""
            const totalFieldValid = fillOrder.fillAmountInvalidField === OrderEntryField.TOTAL ? fillOrder.fillAmountValid : true
            const totalFieldErrorMessage = fillOrder.fillAmountInvalidField === OrderEntryField.TOTAL ? fillOrder.fillAmountInvalidReason : ""

            let bestExecutionWarning = null
            if (!fillOrder.isBestExecution) {
                bestExecutionWarning = <Alert color="warning">You have not selected the best order in the {type === OrderSide.BUY ? 'OFFERS' : 'BIDS'} book
                . The same amount of {tokenName} can be {type === OrderSide.BUY ? 'bought' : 'sold'} for a {type === OrderSide.BUY ? 'cheaper' : 'higher'} price.</Alert>
            }

            const submitDisabled = !fillOrder.fillAmountValid || !balanceRetrieved

            body =
                <BoxSection className={"order-box"}>
                    {bestExecutionWarning}
                    <NumericInput name="Price" value={priceOf(fillOrder.order).toFixed(8)} unitName="ETH"
                        fieldName={type + "OrderPrice"} disabled="true" />
                    <NumericInput name="Amount" value={fillOrder.fillAmountControlled} unitName={tokenName}
                        onChange={this.onOrderAmountChange} fieldName={type + "OrderAmount"}
                        valid={amountFieldValid} errorMessage={amountFieldErrorMessage}
                        onMax={this.onMaxAmount} />
                    <NumericInput name="Total" value={fillOrder.totalEthControlled.toFixed(3)} unitName="ETH"
                        fieldName={type + "OrderTotal"}
                        valid={totalFieldValid} errorMessage={totalFieldErrorMessage}
                        disabled="true" />
                    <hr />
                    <NumericInput name="Est. Gas Fee" value={estimatedGasCost.toFixed(8)} unitName="ETH"
                        fieldName={type + "GasFeeEth"} disabled="true" />
                    <NumericInput name="" value={(estimatedGasCost * ethereumPriceUsd).toFixed(3)} unitName="USD"
                        fieldName={type + "GasFeeUsd"} disabled="true" helpMessage="Estimated cost to submit and execute this transaction on the Ethereum network." />
                    <hr />
                    <NumericInput name="0.3% Exchange Fee" value={exchangeCost.toFixed(8)} unitName={exchangeCostUnits}
                        fieldName={type + "ExchangeFee"} disabled="true" helpMessage={`0.3% fee deducted by the EtherDelta Smart Contract, in units of the token (${exchangeCostUnits}) you are giving to the order maker.`} />
                    <FormGroup row className="hdr-stretch-ctr">
                        <Col sm={6}>
                            <Button block color={type === OrderSide.BUY ? 'success' : 'danger'} id={type + "Button"} disabled={submitDisabled}
                                onClick={this.onSubmit}>{type === OrderSide.BUY ? 'BUY' : 'SELL'}</Button>
                            <Conditional displayCondition={!balanceRetrieved}>
                                <FormText color="muted">{`Please unlock a wallet to enable ${type === OrderSide.BUY ? 'BUY' : 'SELL'} trades`}</FormText>
                            </Conditional>
                        </Col>
                    </FormGroup>
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