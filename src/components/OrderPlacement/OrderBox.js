import React from "react"
import {FormGroup, Label, Col, Input, Button} from 'reactstrap'
import Conditional from "../CustomComponents/Conditional"
import OrderType from "../../OrderType"
import NumericInput from "./NumericInput.js"
import {Box, BoxSection, BoxHeader} from "../CustomComponents/Box"
import OrderSide from "../../OrderSide"
import * as OrderPlacementActions from "../../actions/OrderPlacementActions"

export default class OrderBox extends React.Component {
    onOrderTypeChange = (event) => {
        const orderType = (event.target.value === "Limit") ? OrderType.LIMIT_ORDER : OrderType.MARKET_ORDER
        if (this.props.side === OrderSide.BUY) {
            OrderPlacementActions.buyOrderTypeChanged(orderType)
        } else {
            OrderPlacementActions.sellOrderTypeChanged(orderType)
        }
    }

    onOrderPriceChange = (event) => {
        if (this.props.side === OrderSide.BUY) {
            OrderPlacementActions.buyOrderPriceChanged(event.target.value)
        } else {
            OrderPlacementActions.sellOrderPriceChanged(event.target.value)
        }
    }

    onOrderAmountChange = (event) => {
        if (this.props.side === OrderSide.BUY) {
            OrderPlacementActions.buyOrderAmountChanged(event.target.value)
        } else {
            OrderPlacementActions.sellOrderAmountChanged(event.target.value)
        }
    }

    onOrderTotalChange = (event) => {
        if (this.props.side === OrderSide.BUY) {
            OrderPlacementActions.buyOrderTotalEthChanged(event.target.value)
        } else {
            OrderPlacementActions.sellOrderTotalEthChanged(event.target.value)
        }
    }

    onSubmit = () => {
        if (this.props.side === OrderSide.BUY) {
            OrderPlacementActions.executeBuy()
        } else {
            OrderPlacementActions.executeSell()
        }
    }

    onClear = () => {
        this.props.side == OrderSide.BUY ? OrderPlacementActions.clearBuy() : OrderPlacementActions.clearSell();
    }
    
    render() {
        const {
            type, title, tokenName,
            orderType,
            price,
            amount, amountValid = null, amountErrorMessage = null,
            total, totalValid = null, totalErrorMessage = null,
            submitButtonName, submitDisabled
        } = this.props

        const isLimitOrder = orderType === OrderType.LIMIT_ORDER

        return (
            <Box>
                <BoxHeader>
                    <div className="hdr-stretch">
                        <strong className="card-title">{title + " " + tokenName}</strong>
                        <Button size="sm" onClick={this.onClear}>Clear</Button>
                    </div>
                </BoxHeader>

                <BoxSection className="order-box">
                    <FormGroup row>
                        <Label for={type + "OrderType"} sm={3}>Type</Label>
                        <Col sm={9}>
                            <Input type="select" id="sellOrderType"
                                   value={isLimitOrder ? "Limit" : "Market"}
                                   onChange={this.onOrderTypeChange}>
                                <option>Limit</option>
                                <option>Market</option>
                            </Input>
                        </Col>
                    </FormGroup>

                    <Conditional displayCondition={isLimitOrder}>
                        <NumericInput name="Price" value={price} unitName="ETH"
                                      onChange={this.onOrderPriceChange} fieldName={type + "OrderPrice"}/>
                    </Conditional>

                    <NumericInput name="Amount" value={amount} unitName={tokenName}
                                  onChange={this.onOrderAmountChange} fieldName={type + "OrderAmount"}
                                  valid={amountValid} errorMessage={amountErrorMessage}/>

                    <Conditional displayCondition={isLimitOrder}>
                        <NumericInput name="Total" value={total} unitName="ETH"
                                      onChange={this.onOrderTotalChange} fieldName={type + "OrderTotal"}
                                      valid={totalValid} errorMessage={totalErrorMessage}/>
                    </Conditional>

                    <FormGroup row className="hdr-stretch-ctr">
                        <Col sm={6}>
                            <Button block color="primary" id="sellButton" disabled={submitDisabled}
                                    onClick={this.onSubmit}>{submitButtonName}</Button>
                        </Col>
                    </FormGroup>
                </BoxSection>
            </Box>
        )
    }
}
