import React from "react"
import {FormGroup, Label, Col, Input, Button} from 'reactstrap'
import Conditional from "../CustomComponents/Conditional"
import OrderType from "../../OrderType"
import NumericInput from "./NumericInput.js"
import {Box, BoxSection} from "../CustomComponents/Box"

export default class OrderBox extends React.Component {
    render() {
        const {
            type, title, tokenName,
            orderType, onOrderTypeChange,
            price, onPriceChange,
            amount, onAmountChange, amountValid = null, amountErrorMessage = null,
            total, onTotalChange, totalValid = null, totalErrorMessage = null,
            submitButtonName, onSubmit, submitDisabled
        } = this.props

        const isLimitOrder = orderType === OrderType.LIMIT_ORDER

        return (
            <Box title={title + " " + tokenName}>
                <BoxSection>
                    <FormGroup row>
                        <Label for={type + "OrderType"} sm={3}>Type</Label>
                        <Col sm={6}>
                            <Input type="select" id="sellOrderType"
                                   value={isLimitOrder ? "Limit" : "Market"}
                                   onChange={onOrderTypeChange}>
                                <option>Limit</option>
                                <option>Market</option>
                            </Input>
                        </Col>
                    </FormGroup>

                    <Conditional displayCondition={isLimitOrder}>
                        <NumericInput name="Price" value={price} unitName="ETH"
                                      onChange={onPriceChange} fieldName={type + "OrderPrice"}/>
                    </Conditional>

                    <NumericInput name="Amount" value={amount} unitName={tokenName}
                                  onChange={onAmountChange} fieldName={type + "OrderAmount"}
                                  valid={amountValid} errorMessage={amountErrorMessage}/>

                    <Conditional displayCondition={isLimitOrder}>
                        <NumericInput name="Total" value={total} unitName="ETH"
                                      onChange={onTotalChange} fieldName={type + "OrderTotal"}
                                      valid={totalValid} errorMessage={totalErrorMessage}/>
                    </Conditional>

                    <FormGroup row>
                        <Label for="sellButton" sm={3}></Label>
                        <Col sm={6}>
                            <Button block color="primary" id="sellButton" disabled={submitDisabled}
                                    onClick={onSubmit}>{submitButtonName}</Button>
                        </Col>
                    </FormGroup>
                </BoxSection>
            </Box>
        )
    }
}
