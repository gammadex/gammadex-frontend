import React from "react"
import _ from "lodash"
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col, FormGroup, Alert } from 'reactstrap'
import { Box, BoxSection, BoxHeader } from "../../CustomComponents/Box"
import NumericInput from "../NumericInput.js"
import OrderSide from "../../../OrderSide"
import OrderPlacementStore from "../../../stores/OrderPlacementStore"
import { safeBigNumber } from "../../../EtherConversion";
import * as OrderPlacementActions from "../../../actions/OrderPlacementActions"

export default class MakeOrderTab extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            price: "",
            amount: "",
            total: "",
            amountValid: true,
            amountErrorMessage: "",
            totalValid: true,
            totalErrorMessage: ""
        }
        this.saveOrderPlacementState = this.saveOrderPlacementState.bind(this)
    }

    isMakerBuyComponent() {
        const { type } = this.props
        return type === OrderSide.BUY
    }

    componentDidMount() {
        OrderPlacementStore.on("change", this.saveOrderPlacementState)
        this.saveOrderPlacementState()
    }

    componentWillUnmount() {
        OrderPlacementStore.removeListener("change", this.saveOrderPlacementState)
    }

    onOrderPriceChange = (value) => {
        if (this.isMakerBuyComponent()) {
            OrderPlacementActions.buyOrderPriceChanged(value)
        } else {
            OrderPlacementActions.sellOrderPriceChanged(value)
        }
    }

    onOrderAmountChange = (value) => {
        if (this.isMakerBuyComponent()) {
            OrderPlacementActions.buyOrderAmountChanged(value)
        } else {
            OrderPlacementActions.sellOrderAmountChanged(value)
        }
    }

    onOrderTotalChange = (value) => {
        if (this.isMakerBuyComponent()) {
            OrderPlacementActions.buyOrderTotalEthChanged(value)
        } else {
            OrderPlacementActions.sellOrderTotalEthChanged(value)
        }
    }

    saveOrderPlacementState() {
        const orderPlacementState = OrderPlacementStore.getOrderPlacementState()
        if (this.isMakerBuyComponent()) {
            this.setState({
                price: orderPlacementState.buyOrderPriceControlled,
                amount: orderPlacementState.buyOrderAmountControlled,
                total: orderPlacementState.buyOrderTotalEthControlled,
                amountValid: orderPlacementState.buyOrderValid,
                amountErrorMessage: orderPlacementState.buyOrderInvalidReason,
                totalValid: orderPlacementState.buyOrderValid,
                amountErrorMessage: orderPlacementState.buyOrderInvalidReason
            })
        } else {
            this.setState({
                price: orderPlacementState.sellOrderPriceControlled,
                amount: orderPlacementState.sellOrderAmountControlled,
                total: orderPlacementState.sellOrderTotalEthControlled,
                amountValid: orderPlacementState.sellOrderValid,
                amountErrorMessage: orderPlacementState.sellOrderInvalidReason,
                totalValid: orderPlacementState.sellOrderValid,
                amountErrorMessage: orderPlacementState.sellOrderInvalidReason
            })
        }
    }

    onSubmit = () => {
        if (this.isMakerBuyComponent()) {
            OrderPlacementActions.executeBuy()
        } else {
            OrderPlacementActions.executeSell()
        }
    }

    render() {
        const {
            tabId, type, tokenName
        } = this.props

        const {
            price,
            amount,
            total,
            amountValid,
            amountErrorMessage,
            totalValid,
            totalErrorMessage } = this.state

        let submitDisabled = false
        if (!amountValid || !totalValid || total === "" || safeBigNumber(total).isZero()) {
            submitDisabled = true
        }

        const body =
            <BoxSection className="order-box">

                <NumericInput name="Price" value={price} unitName="ETH"
                    onChange={this.onOrderPriceChange} fieldName={type + "OrderPrice"} />

                <NumericInput name="Amount" value={amount} unitName={tokenName}
                    onChange={this.onOrderAmountChange} fieldName={type + "OrderAmount"}
                    valid={amountValid} errorMessage={amountErrorMessage} />

                <NumericInput name="Total" value={total} unitName="ETH"
                    onChange={this.onOrderTotalChange} fieldName={type + "OrderTotal"}
                    valid={totalValid} errorMessage={totalErrorMessage} />

                <FormGroup row className="hdr-stretch-ctr">
                    <Col sm={6}>
                        <Button block color="primary" id="sellButton" disabled={submitDisabled}
                            onClick={this.onSubmit}>{type === OrderSide.BUY ? 'BUY' : 'SELL'}</Button>
                    </Col>
                </FormGroup>
            </BoxSection>

        return (
            <TabPane tabId={tabId}>
                <Row>
                    <Col sm="12">
                        {body}
                    </Col>
                </Row>
            </TabPane>
        )
    }
}