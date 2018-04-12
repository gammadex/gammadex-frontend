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
import BigNumber from 'bignumber.js'
import * as MockOrderUtil from "../MockOrderUtil"
import { Box, BoxSection } from "./CustomComponents/Box"
import OrderBox from "./OrderPlacement/OrderBox.js"

export default class OrderPlacement extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            buyOrderType: OrderType.LIMIT_ORDER,
            buyOrderPriceControlled: "",
            buyOrderAmountControlled: "",
            buyOrderTotalEthControlled: "",
            buyOrderValid: true,
            buyOrderInvalidReason: "",
            sellOrderType: OrderType.LIMIT_ORDER,
            sellOrderPriceControlled: "",
            sellOrderAmountControlled: "",
            sellOrderTotalEthControlled: "",
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
            (buyOrderType === OrderType.LIMIT_ORDER && (buyOrderTotalEthControlled === "" || BigNumber(String(buyOrderTotalEthControlled)).isZero())) ||
            (buyOrderType === OrderType.MARKET_ORDER && (buyOrderAmountControlled === "" || BigNumber(String(buyOrderAmountControlled)).isZero()))
        )
        const disableSellButton = (!sellOrderValid ||
            (sellOrderType === OrderType.LIMIT_ORDER && (sellOrderTotalEthControlled === "" || BigNumber(String(sellOrderTotalEthControlled)).isZero())) ||
            (sellOrderType === OrderType.MARKET_ORDER && (sellOrderAmountControlled === "" || BigNumber(String(sellOrderAmountControlled)).isZero()))
        )

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

        // Taker modal
        let takerSide = ""
        let trades = null
        if (tradesToExecute.length > 0) {
            takerSide = (MockOrderUtil.isTakerBuy(tradesToExecute[0].order)) ? "Buy" : "Sell"
            trades = tradesToExecute.map(trade => {
                return <Row key={trade.order.id}><Col>{`${takerSide} ${trade.fillAmountTok} ${token.name} for ${trade.fillAmountEth} ETH`}</Col></Row>
            })
        }

        // Maker modal
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
                            side={OrderSide.BUY}
                            type="buy"
                            title="Buy"
                            tokenName={token.name}
                            orderType={buyOrderType}
                            price={buyOrderPriceControlled}
                            amount={buyOrderAmountControlled}
                            amountValid={buyAmountValid}
                            amountErrorMessage={buyAmountErrorMessage}
                            total={buyOrderTotalEthControlled}
                            totalValid={buyTotalValid}
                            totalErrorMessage={buyTotalErrorMessage}
                            submitButtonName="BUY"
                            submitDisabled={disableBuyButton}
                        />
                    </div>

                    <div className="col-lg-6">
                        <OrderBox
                            side={OrderSide.SELL}
                            type="sell"
                            title="Sell"
                            tokenName={token.name}
                            orderType={sellOrderType}
                            price={sellOrderPriceControlled}
                            amount={sellOrderAmountControlled}
                            amountValid={sellOrderValid}
                            amountErrorMessage={sellOrderInvalidReason}
                            total={sellOrderTotalEthControlled}
                            submitButtonName="SELL"
                            submitDisabled={disableSellButton}
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

