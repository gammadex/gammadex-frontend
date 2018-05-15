import React from "react"
import {
    Row,
    Col,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter
} from 'reactstrap'
import OrderSide from "../OrderSide"
import * as OrderPlacementActions from "../actions/OrderPlacementActions"
import OrderPlacementStore from "../stores/OrderPlacementStore"
import BigNumber from 'bignumber.js'
import * as OrderUtil from "../OrderUtil"
import OrderBox from "./OrderPlacement/OrderBox.js"

export default class OrderPlacement extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            buyOrderPriceControlled: "",
            buyOrderAmountControlled: "",
            buyOrderTotalEthControlled: "",
            buyOrderValid: true,
            buyOrderInvalidReason: "",
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
            buyOrderPriceControlled,
            buyOrderAmountControlled,
            buyOrderTotalEthControlled,
            buyOrderValid,
            buyOrderInvalidReason,
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
            (buyOrderTotalEthControlled === "" || BigNumber(String(buyOrderTotalEthControlled)).isZero()))
        const disableSellButton = (!sellOrderValid ||
            (sellOrderTotalEthControlled === "" || BigNumber(String(sellOrderTotalEthControlled)).isZero()))

        // Taker modal
        let takerSide = ""
        let trades = null
        if (tradesToExecute.length > 0) {
            takerSide = (OrderUtil.isTakerBuy(tradesToExecute[0].order)) ? "Buy" : "Sell"
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
                            type="buy"
                            tokenName={token.name}
                        />
                    </div>

                    <div className="col-lg-6">
                        <OrderBox
                            type="sell"
                            tokenName={token.name}
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

