import React from "react"
import _ from "lodash"
import {TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col, FormGroup, Alert, FormText, Modal, ModalBody, ModalFooter} from 'reactstrap'
import {Box, BoxSection, BoxHeader} from "../CustomComponents/Box"
import EmptyTableMessage from "../CustomComponents/EmptyTableMessage"
import OrderBookStore from "../../stores/OrderBookStore"
import TradeStore from "../../stores/TradeStore"
import LifecycleStore from "../../stores/LifecycleStore"
import GasPriceStore from "../../stores/GasPriceStore"
import AccountStore from "../../stores/AccountStore"
import NumericInput from "./NumericInput.js"
import {priceOf, isTakerSell, isTakerBuy} from "../../OrderUtil.js"
import OrderSide from "../../OrderSide"
import OrderEntryField from "../../OrderEntryField"
import * as TradeActions from "../../actions/TradeActions"
import Config from "../../Config"
import Conditional from "../CustomComponents/Conditional"
import {gweiToEth, safeBigNumber, baseWeiToEth, tokWeiToEth} from "../../EtherConversion"
import AccountType from "../../AccountType"
import {Popover, PopoverBody} from "reactstrap/dist/reactstrap"
import OrderPercentageSlider from "./OrderPercentageSlider"
import BigNumber from 'bignumber.js'
import {getExpiryWarning} from "../../util/ExpiryWarning"

export default class FillOrderBook extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            blockTime: GasPriceStore.getBlockTime(),
            currentBlockNumber: LifecycleStore.getCurrentBlockNumber(),
            orders: [],
            fillOrder: null,
            currentGasPriceWei: null,
            ethereumPriceUsd: null,
            tradableBalanceEthWei: 0,
            tradableBalanceTokWei: 0,
            selectedAccountType: null,
            confirmTradeModalSide: null,
            popOverOpenExchangeFee: false,
            popOverOpenExpiry: false,
            isDemoMode: Config.isDemoMode(),
        }
        this.saveGasPrices = this.saveGasPrices.bind(this)
        this.onOrderBookChange = this.onOrderBookChange.bind(this)
        this.onTradeStoreChange = this.onTradeStoreChange.bind(this)
        this.isTakerBuyComponent = this.isTakerBuyComponent.bind(this)
        this.checkFillOrder = this.checkFillOrder.bind(this)
        this.saveAccountState = this.saveAccountState.bind(this)
        this.onConfirm = this.onConfirm.bind(this)
        this.saveCurrentBlockNumber = this.saveCurrentBlockNumber.bind(this)

        // to avoid the ui flooring/snapping the amount, when the user changes the amount manually to overfill the order
        this.ignoreNextSliderChange = false
    }

    componentDidMount() {
        OrderBookStore.on("change", this.onOrderBookChange)
        TradeStore.on("change", this.onTradeStoreChange)
        GasPriceStore.on("change", this.saveGasPrices)
        AccountStore.on("change", this.saveAccountState)
        LifecycleStore.on("change", this.saveCurrentBlockNumber)
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
        const {type} = this.props
        return type === OrderSide.BUY
    }

    saveCurrentBlockNumber() {
        this.setState({
            currentBlockNumber: LifecycleStore.getCurrentBlockNumber(),
        })
    }

    onOrderBookChange() {
        this.setState({
            orders: this.isTakerBuyComponent() ? OrderBookStore.getOffers() : OrderBookStore.getBids()
        }, () => {
            // this.checkFillOrder() <-- in react-flux you cannot call a dispatcher from within another dispatch loop!
            // perhaps revisit this when we move to redux+thunk
            //
            // should really remove fillOrder action if the current fillOrder is no longer present in the order book (e.g. someone else got it) 
        })
    }

    saveAccountState() {
        const {tradableBalanceEthWei, tradableBalanceTokWei, selectedAccountType} = AccountStore.getAccountState()
        this.setState({
            tradableBalanceEthWei: tradableBalanceEthWei,
            tradableBalanceTokWei: tradableBalanceTokWei,
            selectedAccountType: selectedAccountType
        })
    }

    checkFillOrder() {
        const {fillOrder, orders} = this.state
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
        const {currentGasPriceWei, ethereumPriceUsd, blockTime} = this.state
        this.setState({
            currentGasPriceWei: GasPriceStore.getCurrentGasPriceWei() == null ? currentGasPriceWei : GasPriceStore.getCurrentGasPriceWei(),
            ethereumPriceUsd: GasPriceStore.getEthereumPriceUsd() == null ? ethereumPriceUsd : GasPriceStore.getEthereumPriceUsd(),
            blockTime: GasPriceStore.getBlockTime() == null ? ethereumPriceUsd : GasPriceStore.getBlockTime(),
        })
    }

    ordersContains(orders, fillOrder) {
        return typeof _.find(orders, {id: fillOrder.order.id}) !== 'undefined'
    }

    showTradeFields(orders, fillOrder) {
        if (orders.length === 0 || !fillOrder) return false
        return this.ordersContains(orders, fillOrder)
    }

    onOrderAmountChange = (value) => {
        this.ignoreNextSliderChange = true
        TradeActions.fillOrderAmountChanged(value, this.state.fillOrder)
    }

    onOrderTotalChange = (value) => {
        TradeActions.fillOrderTotalChanged(safeBigNumber(value), this.state.fillOrder)
    }

    onSubmit = event => {
        if (!this.isSubmitDisabled()) {
            const {fillOrder, selectedAccountType} = this.state
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
        const {balanceRetrieved} = this.props
        const {fillOrder, isDemoMode} = this.state

        return isDemoMode || !fillOrder.fillAmountValid || !balanceRetrieved || AccountStore.selectedAccountType === AccountType.VIEW
    }

    toggleExchangeFeePopOver = () => {
        this.setState({
            popOverOpenExchangeFee: !this.state.popOverOpenExchangeFee
        })
    }

    toggleExpiryPopover = () => {
        this.setState({
            popOverOpenExpiry: !this.state.popOverOpenExpiry
        })
    }

    onSliderChange = (value) => {
        if (this.ignoreNextSliderChange) {
            this.ignoreNextSliderChange = false
            return
        }
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
            tradableBalanceEthWei,
            tradableBalanceTokWei,
            confirmTradeModalSide,
            isDemoMode
        } = this.state

        let body = null
        if (this.showTradeFields(orders, fillOrder)) {
            let demoModeAlert = null
            if (isDemoMode) {
                demoModeAlert = <Row>
                    <Col>
                        <Alert color="info" isOpen={true} className="demo-warning"><div><strong><i className="fas fa-exclamation-circle"></i> Running in demo mode</strong></div><div>trading is disabled</div></Alert>
                    </Col>
                </Row>
            }

            // https://github.com/etherdelta/etherdelta.github.io/blob/master/docs/SMART_CONTRACT.md
            // fees:
            // amount in amountGet terms
            // token in tokenGet terms 
            // calc = amount * 0.003
            const exchangeCost = safeBigNumber(isTakerSell(fillOrder.order) ? fillOrder.fillAmountControlled : fillOrder.totalEthControlled).times(safeBigNumber(Config.getExchangeFeePercent()))
            const exchangeCostUnits = isTakerSell(fillOrder.order) ? tokenSymbol : "ETH"

            let usdExchangeCost = ""
            if (exchangeCost && isTakerBuy(fillOrder.order)) {
                if (exchangeCostUnits === 'ETH') {
                    usdExchangeCost = exchangeCost.times(safeBigNumber(ethereumPriceUsd))
                } else {
                    usdExchangeCost = exchangeCost.times(safeBigNumber(ethereumPriceUsd)).div(priceOf(fillOrder.order))
                }
                usdExchangeCost = usdExchangeCost.toFixed(3).toString()
            }

            const amountFieldValid = fillOrder.fillAmountInvalidField === OrderEntryField.AMOUNT ? (safeBigNumber(fillOrder.weiFillAmount).isZero() ? true : fillOrder.fillAmountValid) : true
            const amountFieldErrorMessage = fillOrder.fillAmountInvalidField === OrderEntryField.AMOUNT ? fillOrder.fillAmountInvalidReason : ""
            const totalFieldValid = fillOrder.fillAmountInvalidField === OrderEntryField.TOTAL ? fillOrder.fillAmountValid : true
            const totalFieldErrorMessage = fillOrder.fillAmountInvalidField === OrderEntryField.TOTAL ? fillOrder.fillAmountInvalidReason : ""

            let bestExecutionWarning = null
            if (!fillOrder.isBestExecution) {
                bestExecutionWarning = <Alert color="warning" className="best-execution-warning"><span className="fas fa-exclamation-circle"/>&nbsp;You have not selected the best {type === OrderSide.BUY ? 'OFFER' : 'BID'} price</Alert>
            }

            const submitDisabled = this.isSubmitDisabled()
            const buySell = type === OrderSide.BUY ? 'BUY' : 'SELL'

            let slider = null
            if (type === OrderSide.BUY) {
                const balanceEth = baseWeiToEth(tradableBalanceEthWei)
                const orderMaxVolumeEth = safeBigNumber(fillOrder.order.ethAvailableVolumeBase)
                const addendum = (
                    <div>
                        <div>Your ETH balance (minus fee): <span className="clickable" onClick={() => this.onOrderTotalChange(String(balanceEth))}>{balanceEth.toFixed(3).toString()}</span></div>
                        <div className="mt-2">ETH remaining on order: <span className="clickable" onClick={() => this.onOrderTotalChange(orderMaxVolumeEth)}>{orderMaxVolumeEth.toFixed(3).toString()}</span></div>
                    </div>
                )
                slider = <OrderPercentageSlider onChange={this.onSliderChange} value={fillOrder.totalEthControlled} minValue={safeBigNumber(0)} maxValue={balanceEth} addendum={addendum}/>
            } else {
                const balanceTok = tokWeiToEth(tradableBalanceTokWei, tokenAddress)
                const orderMaxVolumeTok = safeBigNumber(fillOrder.order.ethAvailableVolume)
                const addendum = (
                    <div>
                        <div>Your {tokenSymbol} balance (minus fee): <span className="clickable" onClick={() => this.onOrderAmountChange(String(balanceTok))}>{balanceTok.toFixed(3).toString()}</span></div>
                        <div className="mt-2">{tokenSymbol} remaining on order: <span className="clickable" onClick={() => this.onOrderAmountChange(orderMaxVolumeTok)}>{orderMaxVolumeTok.toFixed(3).toString()}</span></div>
                    </div>
                )
                slider = <OrderPercentageSlider onChange={this.onSliderChange} value={fillOrder.fillAmountControlled} minValue={safeBigNumber(0)} maxValue={balanceTok} addendum={addendum}/>
            }

            body =
                <BoxSection className={"order-box"}>
                    <form onSubmit={this.onSubmit}>
                        <NumericInput name="Price" value={priceOf(fillOrder.order).toFixed(8)} unitName="ETH"
                                      fieldName={type + "OrderPrice"} disabled="true"/>

                        <NumericInput name="Amount" value={fillOrder.fillAmountControlled} unitName={tokenSymbol}
                                      onChange={this.onOrderAmountChange} fieldName={type + "OrderAmount"}
                                      valid={amountFieldValid} errorMessage={amountFieldErrorMessage}
                                      invalidFeedbackAbove/>

                        <Row>
                            <Col sm={3}/>
                            <Col sm={9}>
                                {slider}
                            </Col>
                        </Row>

                        <NumericInput name="Total" value={fillOrder.totalEthControlled.toFixed(3)} unitName="ETH"
                                      fieldName={type + "OrderTotal"}
                                      valid={totalFieldValid} errorMessage={totalFieldErrorMessage}
                                      disabled="true"/>

                        <div className="trading-fees">
                            <table>
                                <tbody>
                                <tr>
                                    <td>0.3% Exchange fee</td>
                                    <td>
                                        {exchangeCost.toFixed(5)} {exchangeCostUnits}
                                        <br/>{usdExchangeCost === "" ? "" : usdExchangeCost + " USD"}
                                    </td>
                                    <td>
                                    <span id={type + "ExchangeFeePopover"} onClick={this.toggleExchangeFeePopOver}>
                                        <i className="fas fa-question-circle dimmed"></i>
                                    </span>
                                        <Popover placement="bottom" isOpen={this.state.popOverOpenExchangeFee} target={type + "ExchangeFeePopover"} toggle={this.toggleExchangeFeePopOver}>
                                            <PopoverBody>
                                                0.3% fee deducted by the EtherDelta smart contract
                                            </PopoverBody>
                                        </Popover>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2} style={{paddingTop: 0}}>
                                        {this.getExpiry(fillOrder.order.expires, this.state.currentBlockNumber, this.state.blockTime)}
                                    </td>
                                    <td style={{paddingTop: 0}}>

                                        {this.getExpiryPopup()}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        <FormGroup row className="hdr-stretch-ctr">
                            <Col sm={3}/>
                            <Col sm={9}>
                                <Button block color={type === OrderSide.BUY ? 'success' : 'danger'} id={type + "Button"} disabled={submitDisabled} type="submit"
                                        onClick={this.onSubmit}>{buySell}</Button>
                                <Conditional displayCondition={!balanceRetrieved && ! isDemoMode}>
                                    <FormText color="muted">{`Please unlock a wallet to enable ${buySell} trades`}</FormText>
                                </Conditional>
                            </Col>
                        </FormGroup>

                        {demoModeAlert}
                    </form>

                    {bestExecutionWarning}

                    <Modal isOpen={confirmTradeModalSide != null && confirmTradeModalSide === type} toggle={this.abortFundingAction} className={this.props.className} keyboard>
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

    getExpiry(expires, currentBlockNumber, blockTime) {
        const expiry = getExpiryWarning(expires, currentBlockNumber, blockTime)

        const text = (expiry.description === 'never') ? 'Never expires' : `Expires in ${expiry.description}`

        if (expiry) {
            const warning = (expiry.warning) ? <span> <i className="fas fa-clock"></i></span> : null

            return <span>{text}{warning}</span>
        } else {
            return null
        }
    }

    getExpiryPopup() {
        const {type} = this.props

        const {fillOrder} = this.state

        return (
            <div>
                <span id={type + "ExpiryPopover"} onClick={this.toggleExpiryPopover}>
                    <i className="fas fa-question-circle dimmed"></i>
                </span>
                <Popover placement="bottom" isOpen={this.state.popOverOpenExpiry} target={type + "ExpiryPopover"} toggle={this.toggleExpiryPopover}>
                    <PopoverBody>
                        <div>
                            Order expires at block {fillOrder.order.expires}
                        </div>
                        <div>
                            Current block is {this.state.currentBlockNumber}
                        </div>
                        <div>
                            {safeBigNumber(fillOrder.order.expires).minus(safeBigNumber(this.state.currentBlockNumber)).toFixed(0)} blocks remaining
                        </div>
                        <div>
                            Current block time is approximately {this.state.blockTime.toFixed(2)} seconds
                        </div>
                    </PopoverBody>
                </Popover>
            </div>
        )
    }
}