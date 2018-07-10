import React from "react"
import _ from "lodash"
import {TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col, FormGroup, Alert, Label, Input, FormText} from 'reactstrap'
import {Box, BoxSection, BoxHeader} from "../CustomComponents/Box"
import NumericInput from "./NumericInput.js"
import OrderSide from "../../OrderSide"
import OrderPlacementStore from "../../stores/OrderPlacementStore"
import AccountStore from "../../stores/AccountStore"
import {safeBigNumber, baseWeiToEth, tokWeiToEth} from "../../EtherConversion"
import * as OrderPlacementActions from "../../actions/OrderPlacementActions"
import OrderEntryField from "../../OrderEntryField"
import ExpiryType from "../../ExpiryType"
import Conditional from "../CustomComponents/Conditional"
import AccountType from "../../AccountType"
import OrderFactory from "../../OrderFactory"
import TokenRepository from "../../util/TokenRepository"
import OrderPercentageSlider from "./OrderPercentageSlider"

export default class MakeOrder extends React.Component {
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
            expireAfterHumanReadableString: "",
            orderHash: null,
            selectedAccountType: null,
            exchangeBalanceEthWei: 0,
            exchangeBalanceTokWei: 0
        }
        this.saveOrderPlacementState = this.saveOrderPlacementState.bind(this)
        this.saveAccountState = this.saveAccountState.bind(this)
        this.onDismissPriceWarningAlert = this.onDismissPriceWarningAlert.bind(this)
    }

    isMakerBuyComponent() {
        const {type} = this.props
        return type === OrderSide.BUY
    }

    componentDidMount() {
        OrderPlacementStore.on("change", this.saveOrderPlacementState)
        AccountStore.on("change", this.saveAccountState)
        this.saveOrderPlacementState()
        this.saveAccountState()
    }

    componentWillUnmount() {
        OrderPlacementStore.removeListener("change", this.saveOrderPlacementState)
        AccountStore.removeListener("change", this.saveAccountState)
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
                expireAfterHumanReadableString: orderPlacementState.buyOrderExpireHumanReadableString,
                orderHash: orderPlacementState.buyOrderHash
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
                expireAfterHumanReadableString: orderPlacementState.sellOrderExpireHumanReadableString,
                orderHash: orderPlacementState.sellOrderHash
            })
        }
    }

    saveAccountState() {
        const {selectedAccountType, exchangeBalanceEthWei, exchangeBalanceTokWei} = AccountStore.getAccountState()
        this.setState({
            selectedAccountType: selectedAccountType,
            exchangeBalanceEthWei: exchangeBalanceEthWei,
            exchangeBalanceTokWei: exchangeBalanceTokWei
        })
    }

    onSubmit = event => {
        if (!this.isSubmitDisabled()) {
            if (this.isMakerBuyComponent()) {
                OrderPlacementActions.executeBuy()
            } else {
                OrderPlacementActions.executeSell()
            }
        }

        if (event) {
            event.preventDefault()
        }
    }

    onDismissPriceWarningAlert() {
        if (this.isMakerBuyComponent()) {
            OrderPlacementActions.buyPriceWarningDismissed()
        } else {
            OrderPlacementActions.sellPriceWarningDismissed()
        }
    }

    isSubmitDisabled = () => {
        const {balanceRetrieved} = this.props

        const {
            total,
            orderValid,
            expiryType,
            expireAfterBlocks,
            orderHasPriceWarning
        } = this.state

        return !orderValid
            || orderHasPriceWarning
            || total === ""
            || safeBigNumber(total).isZero()
            || !balanceRetrieved
            || (expiryType === ExpiryType.BLOCKS && (expireAfterBlocks === "" || safeBigNumber(expireAfterBlocks).isZero()))
    }

    onSliderChange = (value) => {
        this.onOrderAmountChange(value)
    }

    render() {
        const {
            type, tokenSymbol, tokenAddress, balanceRetrieved
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
            expireAfterHumanReadableString,
            orderHash,
            selectedAccountType,
            exchangeBalanceEthWei,
            exchangeBalanceTokWei
        } = this.state

        let available = safeBigNumber(0)
        if (TokenRepository.tokenExists(tokenAddress)) {
            available = type === OrderSide.BUY ? baseWeiToEth(exchangeBalanceEthWei) : tokWeiToEth(exchangeBalanceTokWei, tokenAddress)
        }

        const submitDisabled = this.isSubmitDisabled()
        const amountFieldValid = orderValid || orderInvalidField != OrderEntryField.AMOUNT
        const amountFieldErrorMessage = amountFieldValid ? "" : orderInvalidReason
        const totalFieldValid = orderValid || orderInvalidField != OrderEntryField.TOTAL
        const totalFieldErrorMessage = totalFieldValid ? "" : orderInvalidReason

        let expiryMessage = <FormText color="muted">{expireAfterHumanReadableString}</FormText>
        if (!orderValid && orderInvalidField === OrderEntryField.BLOCKS) {
            expiryMessage = <FormText color="danger">{orderInvalidReason}</FormText>
        }

        const expiryTypeText = expiryType === ExpiryType.GOOD_TILL_CANCEL
            ? "Order will remain active until cancelled"
            : ""

        let priceWarningAlert = null
        if (orderHasPriceWarning && orderValid) {
            priceWarningAlert = <Alert color="danger" isOpen={orderHasPriceWarning} toggle={this.onDismissPriceWarningAlert}>{orderPriceWarning}</Alert>
        }

        let prefixedOrderHash = ""
        if (orderHash != null) {
            prefixedOrderHash = OrderFactory.prefixMessage(orderHash)
        }

        const balanceUnitName = type === OrderSide.BUY ? 'ETH' : tokenSymbol

        let addendum = null
        if (balanceUnitName === 'ETH') {
            addendum = <span>{balanceUnitName} balance: <span onClick={() => this.onOrderTotalChange(String(available))}>{available.toFixed(3).toString()}</span></span>
        } else {
            addendum = <span>{balanceUnitName} balance: <span onClick={() => this.onOrderAmountChange(available)}>{available.toFixed(3).toString()}</span></span>
        }

        const body = (
            <BoxSection className={"order-box"}>
                <form onSubmit={this.onSubmit}>
                    <NumericInput name="Price" value={price} unitName="ETH"
                                  onChange={this.onOrderPriceChange} fieldName={type + "OrderPrice"}/>

                    <NumericInput name="Amount" value={amount} unitName={tokenSymbol}
                                  onChange={this.onOrderAmountChange} fieldName={type + "OrderAmount"}
                                  valid={amountFieldValid} errorMessage={amountFieldErrorMessage}/>

                    <Row>
                        <Col sm={3}/>
                        <Col sm={9}>
                            <OrderPercentageSlider onChange={this.onSliderChange} value={amount} minValue={safeBigNumber(0)} maxValue={available} addendum={addendum} />
                        </Col>
                    </Row>

                    <NumericInput name="Total" value={total} unitName="ETH"
                                  onChange={this.onOrderTotalChange} fieldName={type + "OrderTotal"}
                                  valid={totalFieldValid} errorMessage={totalFieldErrorMessage}/>

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
                                      onChange={this.onExpireAfterBlocksChange} fieldName={type + "ExpireAfterBlocks"}/>
                        {/* helpMessage={expireAfterHumanReadableString} /> */}
                        <FormGroup row>
                            <Label for={type + "ExpiryType"} sm={3}></Label>
                            <Col sm={9}>
                                {expiryMessage}
                            </Col>
                        </FormGroup>

                    </Conditional>

                    <Conditional displayCondition={orderValid && orderHash != null && selectedAccountType && selectedAccountType === AccountType.METAMASK}>
                        <hr/>
                        <FormGroup row>
                            <Label for={type + "MetaMaskHash"} sm={3}>MetaMask Order Hash</Label>
                            <Col sm={9}>
                                <Input id={type + "MetaMaskHash"}
                                       disabled={true}
                                       value={prefixedOrderHash}/>
                                <FormText color="muted">
                                    This hex-encoded hash represents the above Order details in compressed form and is used by the EtherDelta Smart Contract.
                                    Please ensure it is this message you sign in MetaMask when prompted.
                                </FormText>
                            </Col>
                        </FormGroup>
                    </Conditional>

                    {priceWarningAlert}
                    <FormGroup row className="hdr-stretch-ctr">
                        <Col sm={9}>
                            <Button block color={type === OrderSide.BUY ? 'success' : 'danger'} id={type + "Button"} disabled={submitDisabled} type="submit"
                                    hidden={orderHasPriceWarning && orderValid}
                                    onClick={this.onSubmit}>PLACE {type === OrderSide.BUY ? 'BUY' : 'SELL'} ORDER</Button>
                            <Conditional displayCondition={!balanceRetrieved}>
                                <FormText color="muted">{`Please unlock a wallet to place ${type === OrderSide.BUY ? 'BUY' : 'SELL'} orders`}</FormText>
                            </Conditional>
                        </Col>
                    </FormGroup>
                </form>
            </BoxSection>
        )

        return body
    }
}