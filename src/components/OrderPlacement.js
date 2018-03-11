import React from "react"
import { FormGroup, Label, Col, Input, Button } from 'reactstrap'
import OrderType from "../OrderType"
import * as OrderPlacementActions from "../actions/OrderPlacementActions"
import OrderPlacementStore from "../stores/OrderPlacementStore";
import OrderBookStore from "../stores/OrderBookStore";
import _ from "lodash"

// The behaviour around accepting user input from price, amount and total is a bit clunky:
// leading zeros, decimals, negative numbers
// TODO make it better!
export default class OrderPlacement extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            buyOrderType: OrderType.LIMIT_ORDER,
            buyOrderPrice: 0,
            buyOrderAmount: 0,
            buyOrderTotal: 0,
            sellOrderType: OrderType.LIMIT_ORDER,
            sellOrderPrice: 0,
            sellOrderAmount: 0,
            sellOrderTotal: 0
        }
    }

    componentWillMount() {
        OrderPlacementStore.on("change", () => this.setState(OrderPlacementStore.getOrderPlacementState()))
    }

    buy() {
        const { buyOrderPrice, buyOrderAmount } = this.state
        const eligibleOffers = _.filter(OrderBookStore.getOffers(),
            (offer) => parseFloat(offer.price) <= buyOrderPrice)
        let outstandingAmount = buyOrderAmount
        const trades = _.flatMap(eligibleOffers, offer => {
            const tradeAmount = Math.min(outstandingAmount, offer.ethAvailableVolume)
            if (tradeAmount) {
                outstandingAmount = outstandingAmount - tradeAmount
                return [{ order: offer, fillAmount: tradeAmount }]
            } else {
                return []
            }
        })
        console.log(trades)
    }

    sell() {
        
    }

    sellOrderTypeChanged = (event) => {
        OrderPlacementActions.sellOrderTypeChanged(
            (event.target.value === "Limit") ? OrderType.LIMIT_ORDER : OrderType.MARKET_ORDER, 0, 0, 0)
    }

    sellOrderPriceChange = (event) => {
        const { sellOrderAmount } = this.state
        let price = Number(event.target.value)
        OrderPlacementActions.sellOrderChanged(price, sellOrderAmount, price * sellOrderAmount)
    }

    sellOrderAmountChange = (event) => {
        const { sellOrderPrice } = this.state
        let amount = Number(event.target.value)
        OrderPlacementActions.sellOrderChanged(sellOrderPrice, amount, sellOrderPrice * amount)
    }

    sellOrderTotalChange = (event) => {
        const { sellOrderPrice } = this.state
        if (parseFloat(sellOrderPrice) === 0) {
            OrderPlacementActions.sellOrderChanged(sellOrderPrice, 0, 0)
        } else {
            let total = Number(event.target.value)
            OrderPlacementActions.sellOrderChanged(sellOrderPrice, total / sellOrderPrice, total)
        }
    }

    buyOrderTypeChange = (event) => {
        OrderPlacementActions.buyOrderTypeChanged(
            (event.target.value === "Limit") ? OrderType.LIMIT_ORDER : OrderType.MARKET_ORDER, 0, 0, 0)
    }

    buyOrderPriceChange = (event) => {
        const { buyOrderAmount } = this.state
        let price = Number(event.target.value)
        OrderPlacementActions.buyOrderChanged(price, buyOrderAmount, price * buyOrderAmount)
    }

    buyOrderAmountChange = (event) => {
        const { buyOrderPrice } = this.state
        let amount = Number(event.target.value)
        OrderPlacementActions.buyOrderChanged(buyOrderPrice, amount, buyOrderPrice * amount)
    }

    buyOrderTotalChange = (event) => {
        const { buyOrderPrice } = this.state
        if (parseFloat(buyOrderPrice) === 0) {
            OrderPlacementActions.buyOrderChanged(buyOrderPrice, 0, 0)
        } else {
            let total = Number(event.target.value)
            OrderPlacementActions.buyOrderChanged(buyOrderPrice, total / buyOrderPrice, total)
        }
    }

    render() {
        const { token } = this.props

        const {
            buyOrderType,
            buyOrderPrice,
            buyOrderAmount,
            buyOrderTotal,
            sellOrderType,
            sellOrderPrice,
            sellOrderAmount,
            sellOrderTotal
        } = this.state

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
                        onChange={this.buyOrderTotalChange.bind(this)} />
                </Col>
                <Col sm={2}>
                    <Label sm={2}>{"ETH"}</Label>
                </Col>
            </FormGroup>
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
                                    onChange={this.sellOrderAmountChange.bind(this)} />
                            </Col>
                            <Col sm={2}>
                                <Label sm={2}>{token.name}</Label>
                            </Col>
                        </FormGroup>
                        {sellOrderTotalField}
                        <FormGroup row>
                            <Label for="sellButton" sm={2}></Label>
                            <Col sm={8}>
                                <Button block color="primary" id="sellButton" onClick={this.sell.bind(this)}>{"SELL"}</Button>
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
                                <Button block color="primary" id="buyButton" onClick={this.buy.bind(this)}>{"BUY"}</Button>
                            </Col>
                        </FormGroup>
                    </div>
                </div>
            </div>
        )
    }
}

