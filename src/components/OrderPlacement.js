import React from "react"
import {
    FormGroup,
    FormFeedback,
    Label,
    Row,
    Col,
    Input,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter
} from 'reactstrap'
import OrderType from "../OrderType"
import OrderSide from "../OrderSide"
import * as OrderPlacementActions from "../actions/OrderPlacementActions"
import OrderPlacementStore from "../stores/OrderPlacementStore";
import OrderBookStore from "../stores/OrderBookStore";
import TokenStore from '../stores/TokenStore'
import _ from "lodash"
import Config from "../Config"
import BigNumber from 'bignumber.js'
import * as MockOrderUtil from "../MockOrderUtil"
import { tokWeiToEth, baseWeiToEth } from "../EtherConversion";
import { Box, BoxSection } from "./CustomComponents/Box"
import NumericInput from "./OrderPlacement/NumericInput.js"
import OrderBox from "./OrderPlacement/OrderBox.js"

export default class OrderPlacement extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            buyOrderType: OrderType.LIMIT_ORDER,
            buyOrderPriceControlled: 0,
            buyOrderAmountControlled: 0,
            buyOrderTotalEthControlled: 0,
            buyOrderValid: true,
            buyOrderInvalidReason: "",
            sellOrderType: OrderType.LIMIT_ORDER,
            sellOrderPriceControlled: 0,
            sellOrderAmountControlled: 0,
            sellOrderTotalEthControlled: 0,
            sellOrderValid: true,
            sellOrderInvalidReason: "",
            tradesToExecute: [],
            tradesModal: false,
            orderModal: false,
            order: null
        }

        this.updateOrderPlacementState = this.updateOrderPlacementState.bind(this)
    }

    componentWillMount() {
        OrderPlacementStore.on("change", this.updateOrderPlacementState)
    }

    componentWillUnmount() {
        OrderPlacementStore.removeListener("change", this.updateOrderPlacementState)
    }

    updateOrderPlacementState() {
        this.setState(OrderPlacementStore.getOrderPlacementState())
    }

    buy() {
        OrderPlacementActions.executeBuy()
    }

    sell() {
        OrderPlacementActions.executeSell()
    }

    abortTradeExecution() {
        OrderPlacementActions.abortTradeExecution()
    }

    abortOrder() {
        OrderPlacementActions.abortOrder()
    }

    confirmTradeExecution() {
        OrderPlacementActions.confirmTradeExecution()
    }

    confirmOrder() {
        OrderPlacementActions.confirmOrder()
    }

    sellOrderTypeChanged = (event) => {
        OrderPlacementActions.sellOrderTypeChanged(
            (event.target.value === "Limit") ? OrderType.LIMIT_ORDER : OrderType.MARKET_ORDER)
    }

    sellOrderPriceChange = (event) => {
        OrderPlacementActions.sellOrderPriceChanged(Number(event.target.value))
    }

    sellOrderAmountChange = (event) => {
        OrderPlacementActions.sellOrderAmountChanged(Number(event.target.value))
    }

    sellOrderTotalChange = (event) => {
        OrderPlacementActions.sellOrderTotalEthChanged(Number(event.target.value))
    }

    buyOrderTypeChange = (event) => {
        OrderPlacementActions.buyOrderTypeChanged(
            (event.target.value === "Limit") ? OrderType.LIMIT_ORDER : OrderType.MARKET_ORDER)
    }

    buyOrderPriceChange = (event) => {
        OrderPlacementActions.buyOrderPriceChanged(Number(event.target.value))
    }

    buyOrderAmountChange = (event) => {
        OrderPlacementActions.buyOrderAmountChanged(Number(event.target.value))
    }

    buyOrderTotalChange = (event) => {
        OrderPlacementActions.buyOrderTotalEthChanged(Number(event.target.value))
    }

    render() {
        const { token } = this.props

        const {
            buyOrderType,
            buyOrderPriceControlled,
            buyOrderAmountControlled,
            buyOrderTotalEthControlled,
            buyOrderValid,
            buyOrderInvalidReason,
            sellOrderType,
            sellOrderPriceControlled,
            sellOrderAmountControlled,
            sellOrderTotalEthControlled,
            sellOrderValid,
            sellOrderInvalidReason,
            tradesToExecute,
            tradesModal,
            orderModal,
            order
        } = this.state

        const disableBuyButton = (!buyOrderValid ||
            (buyOrderType === OrderType.LIMIT_ORDER && BigNumber(String(buyOrderTotalEthControlled)).isZero()))
        const disableSellButton = (!sellOrderValid || 
            (sellOrderType === OrderType.LIMIT_ORDER && BigNumber(String(sellOrderTotalEthControlled)).isZero()))

        let buyAmountValid = null
        let buyAmountErrorMessage = null
        let buyTotalValid = null
        let buyTotalErrorMessage = null
        if (buyOrderType === OrderType.LIMIT_ORDER) {
            buyTotalValid = buyOrderValid
            buyTotalErrorMessage = buyOrderInvalidReason
        } else {
            buyAmountValid = buyOrderValid
            buyAmountErrorMessage = buyOrderInvalidReason
        }

        let takerSide = ""
        let trades = null
        if (tradesToExecute.length > 0) {
            takerSide = (MockOrderUtil.isTakerBuy(tradesToExecute[0].orderDetail.order)) ? "Buy" : "Sell"
            trades = tradesToExecute.map(trade => {
                let details = ""
                if (MockOrderUtil.isTakerBuy(trade.orderDetail.order)) {
                    // if taker is buying, maker is selling, amount get and therefore fill amount is in ETH
                    // (in full units of wei)
                    const ethAmount = baseWeiToEth(trade.fillAmountWei)
                    details = `${takerSide} ${ethAmount / trade.orderDetail.price} ${token.name} for ${ethAmount} ETH`
                } else {
                    // taker is selling, maker is buying, amount get and therefore fill amount is in TOK
                    // (in full units of wei)
                    const tokAmount = tokWeiToEth(trade.fillAmountWei, trade.orderDetail.tokenAddress)
                    details = `${takerSide} ${tokAmount} ${token.name} for ${tokAmount * trade.orderDetail.price} ETH`
                }
                return <Row key={trade.orderDetail.order.id}><Col>{details}</Col></Row>
            })
        }

        let orderDescription = ""
        let makerSide = ""
        if (order) {
            makerSide = (order.makerSide === OrderSide.BUY) ? "Buy" : "Sell"
            orderDescription = `${makerSide} ${order.amount} ${order.tokenName} with limit price of ${order.price} ETH?`
        }

        return (
            <div>
                <div className="row">
                    <div className="col-lg-6">
                        <OrderBox
                            type="sell"
                            title="Sell"
                            tokenName={token.name}
                            orderType={sellOrderType}
                            onOrderTypeChange={this.sellOrderTypeChanged}
                            price={sellOrderPriceControlled}
                            onPriceChange={this.sellOrderPriceChange}
                            amount={sellOrderAmountControlled}
                            onAmountChange={this.sellOrderAmountChange}
                            amountValid={sellOrderValid}
                            amountErrorMessage={sellOrderInvalidReason}
                            total={sellOrderTotalEthControlled}
                            onTotalChange={this.sellOrderTotalChange}
                            submitButtonName="SELL"
                            onSubmit={this.sell}
                            submitDisabled={disableSellButton}
                        />
                    </div>

                    <div className="col-lg-6">
                        <OrderBox
                            type="buy"
                            title="Buy"
                            tokenName={token.name}
                            orderType={buyOrderType}
                            onOrderTypeChange={this.buyOrderTypeChange}
                            price={buyOrderPriceControlled}
                            onPriceChange={this.buyOrderPriceChange}
                            amount={buyOrderAmountControlled}
                            onAmountChange={this.buyOrderAmountChange}
                            amountValid={buyAmountValid}
                            amountErrorMessage={buyAmountErrorMessage}
                            total={buyOrderTotalEthControlled}
                            onTotalChange={this.buyOrderTotalChange}
                            totalValid={buyTotalValid}
                            totalErrorMessage={buyTotalErrorMessage}
                            submitButtonName="BUY"
                            onSubmit={this.buy}
                            submitDisabled={disableBuyButton}
                        />
                    </div>
                </div>

                <div>
                    <Modal isOpen={tradesModal} toggle={this.abortTradeExecution} className={this.props.className}>
                        <ModalHeader toggle={this.abortTradeExecution}>Take Orders?</ModalHeader>
                        <ModalBody>
                            {trades}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={this.confirmTradeExecution.bind(this)}>{takerSide}</Button>
                            <Button outline color="secondary"
                                onClick={this.abortTradeExecution.bind(this)}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

                    <Modal isOpen={orderModal} toggle={this.abortOrder} className={this.props.className}>
                        <ModalHeader toggle={this.abortOrder}>Make Order</ModalHeader>
                        <ModalBody>
                            <Row><Col>{orderDescription}</Col></Row>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={this.confirmOrder.bind(this)}>{makerSide}</Button>
                            <Button outline color="secondary" onClick={this.abortOrder.bind(this)}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                </div>
            </div>
        )
    }
}

