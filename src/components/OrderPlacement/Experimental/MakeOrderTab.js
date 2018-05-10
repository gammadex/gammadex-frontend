import React from "react"
import _ from "lodash"
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col, FormGroup, Alert, Label, Input, FormText } from 'reactstrap'
import { Box, BoxSection, BoxHeader } from "../../CustomComponents/Box"
import NumericInput from "../NumericInput.js"
import OrderSide from "../../../OrderSide"
import OrderPlacementStore from "../../../stores/OrderPlacementStore"
import { safeBigNumber } from "../../../EtherConversion";
import * as OrderPlacementActions from "../../../actions/OrderPlacementActions"
import OrderEntryField from "../../../OrderEntryField"
import ExpiryType from "../../../ExpiryType"
import Conditional from "../../CustomComponents/Conditional"

export default class MakeOrderTab extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            price: "",
            amount: "",
            total: "",
            orderValid: true,
            orderInvalidReason: "",
            orderInvalidField: OrderEntryField.AMOUNT,
            orderHasPriceWarning: false,
            orderPriceWarning: "",
            expiryType: ExpiryType.GOOD_TILL_CANCEL,
            expireAfterBlocks: 0,
            expireAfterHumanReadableString: ""
        }
        this.saveOrderPlacementState = this.saveOrderPlacementState.bind(this)
        this.onDismissPriceWarningAlert = this.onDismissPriceWarningAlert.bind(this)
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

    onExpiryTypeChange = (event) => {
        const expiryType = (event.target.value === "Good Till Cancel") ? ExpiryType.GOOD_TILL_CANCEL : ExpiryType.BLOCKS
        if (this.isMakerBuyComponent()) {
            OrderPlacementActions.buyOrderExpiryTypeChanged(expiryType)
        } else {
            OrderPlacementActions.sellOrderExpiryTypeChanged(expiryType)
        }
    }

    onExpireAfterBlocksChange = (value) => {
        if (this.isMakerBuyComponent()) {
            OrderPlacementActions.buyOrderExpireAfterBlocksChanged(value)
        } else {
            OrderPlacementActions.sellOrderExpireAfterBlocksChanged(value)
        }
    }

    saveOrderPlacementState() {
        const orderPlacementState = OrderPlacementStore.getOrderPlacementState()
        if (this.isMakerBuyComponent()) {
            this.setState({
                price: orderPlacementState.buyOrderPriceControlled,
                amount: orderPlacementState.buyOrderAmountControlled,
                total: orderPlacementState.buyOrderTotalEthControlled,
                orderValid: orderPlacementState.buyOrderValid,
                orderInvalidReason: orderPlacementState.buyOrderInvalidReason,
                orderInvalidField: orderPlacementState.buyOrderInvalidField,
                orderHasPriceWarning: orderPlacementState.buyOrderHasPriceWarning,
                orderPriceWarning: orderPlacementState.buyOrderPriceWarning,
                expiryType: orderPlacementState.buyOrderExpiryType,
                expireAfterBlocks: orderPlacementState.buyOrderExpireAfterBlocks,
                expireAfterHumanReadableString: orderPlacementState.buyOrderExpireHumanReadableString
            })
        } else {
            this.setState({
                price: orderPlacementState.sellOrderPriceControlled,
                amount: orderPlacementState.sellOrderAmountControlled,
                total: orderPlacementState.sellOrderTotalEthControlled,
                orderValid: orderPlacementState.sellOrderValid,
                orderInvalidReason: orderPlacementState.sellOrderInvalidReason,
                orderInvalidField: orderPlacementState.sellOrderInvalidField,
                orderHasPriceWarning: orderPlacementState.sellOrderHasPriceWarning,
                orderPriceWarning: orderPlacementState.sellOrderPriceWarning,
                expiryType: orderPlacementState.sellOrderExpiryType,
                expireAfterBlocks: orderPlacementState.sellOrderExpireAfterBlocks,
                expireAfterHumanReadableString: orderPlacementState.sellOrderExpireHumanReadableString
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

    onDismissPriceWarningAlert() {
        if (this.isMakerBuyComponent()) {
            OrderPlacementActions.buyPriceWarningDismissed()
        } else {
            OrderPlacementActions.sellPriceWarningDismissed()
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
            orderValid,
            orderInvalidReason,
            orderInvalidField,
            orderHasPriceWarning,
            orderPriceWarning,
            expiryType,
            expireAfterBlocks,
            expireAfterHumanReadableString } = this.state

        const submitDisabled = !orderValid || total === "" || safeBigNumber(total).isZero()

        const amountFieldValid = orderValid || orderInvalidField != OrderEntryField.AMOUNT
        const amountFieldErrorMessage = amountFieldValid ? "" : orderInvalidReason
        const totalFieldValid = orderValid || orderInvalidField != OrderEntryField.TOTAL
        const totalFieldErrorMessage = totalFieldValid ? "" : orderInvalidReason

        const expiryTypeText = expiryType === ExpiryType.GOOD_TILL_CANCEL
            ? "Order will remain active until cancelled. (expiry is set to two billion blocks, which is almost one thousand years!!)"
            : ""

        let priceWarningAlert = null
        if (orderHasPriceWarning && orderValid) {
            priceWarningAlert = <Alert color="danger" isOpen={orderHasPriceWarning} toggle={this.onDismissPriceWarningAlert}>{orderPriceWarning}</Alert>
        }
        const body =
            <BoxSection className="order-box">

                <NumericInput name="Price" value={price} unitName="ETH"
                    onChange={this.onOrderPriceChange} fieldName={type + "OrderPrice"} />

                <NumericInput name="Amount" value={amount} unitName={tokenName}
                    onChange={this.onOrderAmountChange} fieldName={type + "OrderAmount"}
                    valid={amountFieldValid} errorMessage={amountFieldErrorMessage} />

                <NumericInput name="Total" value={total} unitName="ETH"
                    onChange={this.onOrderTotalChange} fieldName={type + "OrderTotal"}
                    valid={totalFieldValid} errorMessage={totalFieldErrorMessage} />
                <hr/>
                <FormGroup row>
                    <Label for={type + "ExpiryType"} sm={3}>Expiry</Label>
                    <Col sm={9}>
                        <Input type="select" id={type + "ExpiryType"}
                            value={expiryType === ExpiryType.GOOD_TILL_CANCEL ? "Good Till Cancel" : "Expire After"}
                            onChange={this.onExpiryTypeChange}>
                            <option>Good Till Cancel</option>
                            <option>Expire After</option>
                        </Input>
                        <FormText color="muted">{expiryTypeText}</FormText>
                    </Col>
                </FormGroup>

                <Conditional displayCondition={expiryType === ExpiryType.BLOCKS}>
                    <NumericInput name="" value={expireAfterBlocks} unitName="Blocks"
                        forceInteger={true} placeholder="0"
                        onChange={this.onExpireAfterBlocksChange} fieldName={type + "ExpireAfterBlocks"} />
                    {/* helpMessage={expireAfterHumanReadableString} /> */}
                    <FormGroup row>
                        <Label for={type + "ExpiryType"} sm={3}></Label>
                        <Col sm={9}>
                            <FormText color="muted">{expireAfterHumanReadableString}</FormText>
                        </Col>
                    </FormGroup>

                </Conditional>

                {priceWarningAlert}
                <FormGroup row className="hdr-stretch-ctr">
                    <Col sm={6}>
                        <Button block color="primary" id="sellButton" disabled={submitDisabled}
                            hidden={orderHasPriceWarning && orderValid}
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