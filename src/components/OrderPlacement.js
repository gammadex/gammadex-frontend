import React from "react"
import { FormGroup, FormFeedback, Label, Row, Col, Input, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import OrderType from "../OrderType"
import OrderSide from "../OrderSide"
import * as OrderPlacementActions from "../actions/OrderPlacementActions"
import OrderPlacementStore from "../stores/OrderPlacementStore";
import OrderBookStore from "../stores/OrderBookStore";
import TokenStore from '../stores/TokenStore'
import AccountStore from '../stores/AccountStore'
import _ from "lodash"
import Config from "../Config"
import BigNumber from 'bignumber.js'
import * as MockOrderUtil from "../MockOrderUtil"

// The behaviour around accepting user input from price, amount and total is a bit clunky:
// leading zeros, decimals, negative numbers
// TODO make it better!
export default class OrderPlacement extends React.Component {
    constructor(props) {
        super(props)
        const { exchangeBalanceTokWei, exchangeBalanceEthWei } = AccountStore.getAccountState()
        this.state = {
            selectedToken: TokenStore.getSelectedToken(),
            exchangeBalanceTokWei: exchangeBalanceTokWei,
            exchangeBalanceEthWei: exchangeBalanceEthWei,
            buyOrderType: OrderType.LIMIT_ORDER,
            buyOrderPrice: 0,
            buyOrderAmount: 0,
            buyOrderTotal: 0,
            buyOrderValid: true,
            buyOrderInvalidReason: "",
            sellOrderType: OrderType.LIMIT_ORDER,
            sellOrderPrice: 0,
            sellOrderAmount: 0,
            sellOrderTotal: 0,
            sellOrderValid: true,
            sellOrderInvalidReason: "",
            tradesToExecute: [],
            tradesModal: false,
            orderModal: false,
            order: null
        }

        this.exchangeBalanceTok = this.exchangeBalanceTok.bind(this)
        this.exchangeBalanceEth = this.exchangeBalanceEth.bind(this)

    }

    componentWillMount() {
        OrderPlacementStore.on("change", () => this.setState(OrderPlacementStore.getOrderPlacementState()))
        TokenStore.on("change", () => this.setState({ selectedToken: TokenStore.getSelectedToken() }))
        AccountStore.on("change", () => this.updateAccountState())
    }

    updateAccountState() {
        const { exchangeBalanceTokWei, exchangeBalanceEthWei } = AccountStore.getAccountState()
        this.setState({
            exchangeBalanceTokWei: exchangeBalanceTokWei,
            exchangeBalanceEthWei: exchangeBalanceEthWei
        })
    }

    exchangeBalanceTok() {
        const tokenDecimals = Config.getTokenDecimals(this.state.selectedToken.name)
        return this.state.exchangeBalanceTokWei / Math.pow(10, tokenDecimals)
    }

    exchangeBalanceEth() {
        return this.state.exchangeBalanceEthWei / Math.pow(10, 18)
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
        const { sellOrderAmount } = this.state
        let price = Number(event.target.value)
        OrderPlacementActions.sellOrderChanged(price, sellOrderAmount, price * sellOrderAmount, this.exchangeBalanceTok())
    }

    sellOrderAmountChange = (event) => {
        const { sellOrderPrice } = this.state
        let amount = Number(event.target.value)
        OrderPlacementActions.sellOrderChanged(sellOrderPrice, amount, sellOrderPrice * amount, this.exchangeBalanceTok())
    }

    sellOrderTotalChange = (event) => {
        const { sellOrderPrice } = this.state
        if (parseFloat(sellOrderPrice) === 0) {
            OrderPlacementActions.sellOrderChanged(sellOrderPrice, 0, 0, this.exchangeBalanceTok())
        } else {
            let total = Number(event.target.value)
            OrderPlacementActions.sellOrderChanged(sellOrderPrice, total / sellOrderPrice, total, this.exchangeBalanceTok())
        }
    }

    buyOrderTypeChange = (event) => {
        OrderPlacementActions.buyOrderTypeChanged(
            (event.target.value === "Limit") ? OrderType.LIMIT_ORDER : OrderType.MARKET_ORDER)
    }

    buyOrderPriceChange = (event) => {
        const { buyOrderAmount } = this.state
        let price = Number(event.target.value)
        OrderPlacementActions.buyOrderChanged(price, buyOrderAmount, price * buyOrderAmount, this.exchangeBalanceEth())
    }

    buyOrderAmountChange = (event) => {
        const { buyOrderPrice } = this.state
        let amount = Number(event.target.value)
        OrderPlacementActions.buyOrderChanged(buyOrderPrice, amount, buyOrderPrice * amount, this.exchangeBalanceEth())
    }

    buyOrderTotalChange = (event) => {
        const { buyOrderPrice } = this.state
        if (parseFloat(buyOrderPrice) === 0) {
            OrderPlacementActions.buyOrderChanged(buyOrderPrice, 0, 0, this.exchangeBalanceEth())
        } else {
            let total = Number(event.target.value)
            OrderPlacementActions.buyOrderChanged(buyOrderPrice, total / buyOrderPrice, total, this.exchangeBalanceEth())
        }
    }

    render() {
        const { token } = this.props

        const {
            selectedToken,
            buyOrderType,
            buyOrderPrice,
            buyOrderAmount,
            buyOrderTotal,
            buyOrderValid,
            buyOrderInvalidReason,
            sellOrderType,
            sellOrderPrice,
            sellOrderAmount,
            sellOrderTotal,
            sellOrderValid,
            sellOrderInvalidReason,
            tradesToExecute,
            tradesModal,
            orderModal,
            order
        } = this.state

        const disableBuyButton = (!buyOrderValid || buyOrderTotal === 0)
        const disableSellButton = (!sellOrderValid || sellOrderTotal === 0)

        let sellOrderPriceField = null
        if (sellOrderType === OrderType.LIMIT_ORDER) {
            sellOrderPriceField = <FormGroup row>
                <Label for="sellOrderPrice" sm={2}>Price</Label>
                <Col sm={8}>
                    <Input type="number" min={0} id="sellOrderPrice"
                        value={sellOrderPrice}
                        onChange={this.sellOrderPriceChange.bind(this)} />
                </Col>
                <Col sm={2}>
                    <Label sm={2}>{"ETH"}</Label>
                </Col>
            </FormGroup>
        }

        let sellOrderTotalField = null
        if (sellOrderType === OrderType.LIMIT_ORDER) {
            sellOrderTotalField = <FormGroup row>
                <Label for="sellOrderTotal" sm={2}>Total</Label>
                <Col sm={8}>
                    <Input type="number" min={0} id="sellOrderTotal"
                        value={sellOrderTotal}
                        onChange={this.sellOrderTotalChange.bind(this)} />
                </Col>
                <Col sm={2}>
                    <Label sm={2}>{"ETH"}</Label>
                </Col>
            </FormGroup>
        }

        let buyOrderPriceField = null
        if (buyOrderType === OrderType.LIMIT_ORDER) {
            buyOrderPriceField = <FormGroup row>
                <Label for="buyOrderPrice" sm={2}>Price</Label>
                <Col sm={8}>
                    <Input type="number" min={0} id="buyOrderPrice"
                        value={buyOrderPrice}
                        onChange={this.buyOrderPriceChange.bind(this)} />
                </Col>
                <Col sm={2}>
                    <Label sm={2}>{"ETH"}</Label>
                </Col>
            </FormGroup>
        }

        let buyOrderTotalField = null
        if (buyOrderType === OrderType.LIMIT_ORDER) {
            buyOrderTotalField = <FormGroup row>
                <Label for="buyOrderTotal" sm={2}>Total</Label>
                <Col sm={8}>
                    <Input type="number" min={0} id="buyOrderTotal"
                        value={buyOrderTotal}
                        onChange={this.buyOrderTotalChange.bind(this)}
                        valid={buyOrderValid} />
                    <FormFeedback>{buyOrderInvalidReason}</FormFeedback>
                </Col>
                <Col sm={2}>
                    <Label sm={2}>{"ETH"}</Label>
                </Col>
            </FormGroup>
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
                    const ethAmount = trade.fillAmountWei.dividedBy(BigNumber(Math.pow(10, 18)))
                    details = `${takerSide} ${ethAmount / trade.orderDetail.price} ${token.name} for ${ethAmount} ETH`
                } else {
                    // taker is selling, maker is buying, amount get and therefore fill amount is in TOK
                    // (in full units of wei)
                    const tokAmount = trade.fillAmountWei.dividedBy(BigNumber(Math.pow(10, trade.orderDetail.tokenDecimals)))
                    details = `${takerSide} ${tokAmount} ${token.name} for ${tokAmount * trade.orderDetail.price} ETH`
                }
                return <Row key={trade.orderDetail.order.id}><Col>{details}</Col></Row>
            })
        }

        let orderDescription = ""
        let makerSide = ""
        if(order) {
            makerSide = (order.makerSide===OrderSide.BUY) ? "Buy" : "Sell"
            orderDescription = `${makerSide} ${order.amount} ${order.tokenName} with limit price of ${order.price} ETH?`
        }

        return (
            <div>
                <div className="row">
                    <div className="col-lg-6">
                        <h3>Sell {token.name}</h3>
                        <FormGroup row>
                            <Label for="sellOrderType" sm={2}>Type</Label>
                            <Col sm={8}>
                                <Input type="select" id="sellOrderType"
                                    value={(sellOrderType === OrderType.LIMIT_ORDER) ? "Limit" : "Market"}
                                    onChange={this.sellOrderTypeChanged.bind(this)}>
                                    <option>Limit</option>
                                    <option>Market</option>
                                </Input>
                            </Col>
                        </FormGroup>
                        {sellOrderPriceField}
                        <FormGroup row>
                            <Label for="sellOrderAmount" sm={2}>Amount</Label>
                            <Col sm={8}>
                                <Input type="number" min={0} id="sellOrderAmount"
                                    value={sellOrderAmount}
                                    onChange={this.sellOrderAmountChange.bind(this)}
                                    valid={sellOrderValid} />
                                <FormFeedback>{sellOrderInvalidReason}</FormFeedback>
                            </Col>
                            <Col sm={2}>
                                <Label sm={2}>{token.name}</Label>
                            </Col>
                        </FormGroup>
                        {sellOrderTotalField}
                        <FormGroup row>
                            <Label for="sellButton" sm={2}></Label>
                            <Col sm={8}>
                                <Button block color="primary" id="sellButton" disabled={disableSellButton} onClick={this.sell.bind(this)}>{"SELL"}</Button>
                            </Col>
                        </FormGroup>
                    </div>
                    <div className="col-lg-6">
                        <h3>Buy {token.name}</h3>
                        <FormGroup row>
                            <Label for="buyOrderType" sm={2}>Type</Label>
                            <Col sm={8}>
                                <Input type="select" id="buyOrderType"
                                    value={(buyOrderType === OrderType.LIMIT_ORDER) ? "Limit" : "Market"}
                                    onChange={this.buyOrderTypeChange.bind(this)}>
                                    <option>Limit</option>
                                    <option>Market</option>
                                </Input>
                            </Col>
                        </FormGroup>
                        {buyOrderPriceField}
                        <FormGroup row>
                            <Label for="buyOrderAmount" sm={2}>Amount</Label>
                            <Col sm={8}>
                                <Input type="number" min={0} id="buyOrderAmount"
                                    value={buyOrderAmount}
                                    onChange={this.buyOrderAmountChange.bind(this)} />
                            </Col>
                            <Col sm={2}>
                                <Label sm={2}>{token.name}</Label>
                            </Col>
                        </FormGroup>
                        {buyOrderTotalField}
                        <FormGroup row>
                            <Label for="buyButton" sm={2}></Label>
                            <Col sm={8}>
                                <Button block color="primary" id="buyButton" disabled={disableBuyButton} onClick={this.buy.bind(this)}>{"BUY"}</Button>
                            </Col>
                        </FormGroup>
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
                            <Button outline color="secondary" onClick={this.abortTradeExecution.bind(this)}>Cancel</Button>
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

