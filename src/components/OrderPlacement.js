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
import AccountStore from '../stores/AccountStore'
import _ from "lodash"
import Config from "../Config"
import BigNumber from 'bignumber.js'
import * as MockOrderUtil from "../MockOrderUtil"
import { tokWeiToEth, baseWeiToEth } from "../EtherConversion";
import {Box, BoxSection} from "./CustomComponents/Box"

// The behaviour around accepting user input from price, amount and total is a bit clunky:
// leading zeros, decimals, negative numbers
// TODO make it better!
export default class OrderPlacement extends React.Component {
    constructor(props) {
        super(props)
        const {exchangeBalanceTokWei, exchangeBalanceEthWei} = AccountStore.getAccountState()
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
        TokenStore.on("change", () => this.setState({selectedToken: TokenStore.getSelectedToken()}))
        AccountStore.on("change", () => this.updateAccountState())
    }

    updateAccountState() {
        const {exchangeBalanceTokWei, exchangeBalanceEthWei} = AccountStore.getAccountState()
        this.setState({
            exchangeBalanceTokWei: exchangeBalanceTokWei,
            exchangeBalanceEthWei: exchangeBalanceEthWei
        })
    }

    exchangeBalanceTok() {
        return tokWeiToEth(this.state.exchangeBalanceTokWei, this.state.selectedToken.address)
    }

    exchangeBalanceEth() {
        return baseWeiToEth(this.state.exchangeBalanceEthWei)
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
        const {sellOrderAmount} = this.state
        let price = Number(event.target.value)
        OrderPlacementActions.sellOrderChanged(price, sellOrderAmount, price * sellOrderAmount, this.exchangeBalanceTok())
    }

    sellOrderAmountChange = (event) => {
        const {sellOrderPrice} = this.state
        let amount = Number(event.target.value)
        OrderPlacementActions.sellOrderChanged(sellOrderPrice, amount, sellOrderPrice * amount, this.exchangeBalanceTok())
    }

    sellOrderTotalChange = (event) => {
        const {sellOrderPrice} = this.state
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
        const {buyOrderAmount} = this.state
        let price = Number(event.target.value)
        OrderPlacementActions.buyOrderChanged(price, buyOrderAmount, price * buyOrderAmount, this.exchangeBalanceEth())
    }

    buyOrderAmountChange = (event) => {
        const {buyOrderPrice} = this.state
        let amount = Number(event.target.value)
        OrderPlacementActions.buyOrderChanged(buyOrderPrice, amount, buyOrderPrice * amount, this.exchangeBalanceEth())
    }

    buyOrderTotalChange = (event) => {
        const {buyOrderPrice} = this.state
        if (parseFloat(buyOrderPrice) === 0) {
            OrderPlacementActions.buyOrderChanged(buyOrderPrice, 0, 0, this.exchangeBalanceEth())
        } else {
            let total = Number(event.target.value)
            OrderPlacementActions.buyOrderChanged(buyOrderPrice, total / buyOrderPrice, total, this.exchangeBalanceEth())
        }
    }

    render() {
        const {token} = this.props

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

        const disableBuyButton = (!buyOrderValid || (buyOrderType === OrderType.LIMIT_ORDER && buyOrderTotal === 0))
        const disableSellButton = (!sellOrderValid || (sellOrderType === OrderType.LIMIT_ORDER && sellOrderTotal === 0))

        let sellOrderPriceField = null
        if (sellOrderType === OrderType.LIMIT_ORDER) {
            sellOrderPriceField = <FormGroup row>
                <Label for="sellOrderPrice" sm={3}>Price</Label>
                <Col sm={6}>
                    <Input type="number" min={0} id="sellOrderPrice"
                           value={sellOrderPrice}
                           onChange={this.sellOrderPriceChange.bind(this)}/>
                </Col>
                <Label sm={3}>{"ETH"}</Label>
            </FormGroup>
        }

        let sellOrderTotalField = null
        if (sellOrderType === OrderType.LIMIT_ORDER) {
            sellOrderTotalField = <FormGroup row>
                <Label for="sellOrderTotal" sm={3}>Total</Label>
                <Col sm={6}>
                    <Input type="number" min={0} id="sellOrderTotal"
                           value={sellOrderTotal}
                           onChange={this.sellOrderTotalChange.bind(this)}/>
                </Col>
                <Label sm={3}>{"ETH"}</Label>
            </FormGroup>
        }

        let buyOrderPriceField = null
        if (buyOrderType === OrderType.LIMIT_ORDER) {
            buyOrderPriceField = <FormGroup row>
                <Label for="buyOrderPrice" sm={3}>Price</Label>
                <Col sm={6}>
                    <Input type="number" min={0} id="buyOrderPrice"
                           value={buyOrderPrice}
                           onChange={this.buyOrderPriceChange.bind(this)}/>
                </Col>
                <Label sm={3}>{"ETH"}</Label>
            </FormGroup>
        }

        let buyOrderTotalField = null
        let buyOrderAmountField = null
        if (buyOrderType === OrderType.LIMIT_ORDER) {
            buyOrderTotalField = <FormGroup row>
                <Label for="buyOrderTotal" sm={3}>Total</Label>
                <Col sm={6}>
                    <Input type="number" min={0} id="buyOrderTotal"
                           value={buyOrderTotal}
                           onChange={this.buyOrderTotalChange.bind(this)}
                           valid={buyOrderValid}/>
                    <FormFeedback>{buyOrderInvalidReason}</FormFeedback>
                </Col>
                <Label sm={3}>{"ETH"}</Label>
            </FormGroup>
            buyOrderAmountField = <FormGroup row>
                <Label for="buyOrderAmount" sm={3}>Amount</Label>
                <Col sm={6}>
                    <Input type="number" min={0} id="buyOrderAmount"
                           value={buyOrderAmount}
                           onChange={this.buyOrderAmountChange.bind(this)}/>
                </Col>
                <Label sm={3}>{token.name}</Label>
            </FormGroup>
        } else {
            buyOrderAmountField = <FormGroup row>
                <Label for="buyOrderAmount" sm={3}>Amount</Label>
                <Col sm={6}>
                    <Input type="number" min={0} id="buyOrderAmount"
                           value={buyOrderAmount}
                           placeholder="assda"
                           onChange={this.buyOrderAmountChange.bind(this)}
                           valid={buyOrderValid}/>
                    <FormFeedback>{buyOrderInvalidReason}</FormFeedback>
                </Col>
                <Label sm={3}>{token.name}</Label>
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
                        <Box title={"Sell " + token.name}>
                            <BoxSection>
                                <FormGroup row>
                                    <Label for="sellOrderType" sm={3}>Type</Label>
                                    <Col sm={6}>
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
                                    <Label for="sellOrderAmount" sm={3}>Amount</Label>
                                    <Col sm={6}>
                                        <Input type="number" min={0} id="sellOrderAmount"
                                               value={sellOrderAmount}
                                               onChange={this.sellOrderAmountChange.bind(this)}
                                               valid={sellOrderValid}/>
                                        <FormFeedback>{sellOrderInvalidReason}</FormFeedback>
                                    </Col>
                                    <Label sm={3}>{token.name}</Label>
                                </FormGroup>
                                {sellOrderTotalField}
                                <FormGroup row>
                                    <Label for="sellButton" sm={3}></Label>
                                    <Col sm={6}>
                                        <Button block color="primary" id="sellButton" disabled={disableSellButton}
                                                onClick={this.sell.bind(this)}>{"SELL"}</Button>
                                    </Col>
                                </FormGroup>
                            </BoxSection>
                        </Box>
                    </div>
                    <div className="col-lg-6">
                        <Box title={"Buy " + token.name}>
                            <BoxSection>
                                <FormGroup row>
                                    <Label for="buyOrderType" sm={3}>Type</Label>
                                    <Col sm={6}>
                                        <Input type="select" id="buyOrderType"
                                               value={(buyOrderType === OrderType.LIMIT_ORDER) ? "Limit" : "Market"}
                                               onChange={this.buyOrderTypeChange.bind(this)}>
                                            <option>Limit</option>
                                            <option>Market</option>
                                        </Input>
                                    </Col>
                                </FormGroup>
                                {buyOrderPriceField}
                                {buyOrderAmountField}
                                {buyOrderTotalField}
                                <FormGroup row>
                                    <Label for="buyButton" sm={3}></Label>
                                    <Col sm={6}>
                                        <Button block color="primary" id="buyButton" disabled={disableBuyButton}
                                                onClick={this.buy.bind(this)}>{"BUY"}</Button>
                                    </Col>
                                </FormGroup>
                            </BoxSection>
                        </Box>
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

