import React from "react"
import { Box, BoxSection, BoxHeader } from "../CustomComponents/Box"
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col, UncontrolledTooltip, Popover, PopoverHeader, PopoverBody } from 'reactstrap'
import classnames from 'classnames'
import EmptyTableMessage from "../CustomComponents/EmptyTableMessage"
import FillOrderBook from './FillOrderBook'
import MakeOrder from './MakeOrder'
import OrderSide from "../../OrderSide"
import OrderBoxType from "./OrderBoxType"
import * as OrderPlacementActions from "../../actions/OrderPlacementActions"
import OrderPlacementStore from "../../stores/OrderPlacementStore"

export default class OrderBox extends React.Component {
    constructor(props) {
        super(props)

        this.toggleOrderBoxType = this.toggleOrderBoxType.bind(this)
        this.toggleTradeSide = this.toggleTradeSide.bind(this)
        this.toggleOrderSide = this.toggleOrderSide.bind(this)
        this.toggleTakePopOver = this.toggleTakePopOver.bind(this)
        this.toggleMakePopOver = this.toggleMakePopOver.bind(this)
        this.onOrderPlacementStoreChange = this.onOrderPlacementStoreChange.bind(this)

        this.state = {
            activeOrderBoxType: OrderBoxType.TRADE,
            activeTradeSide: OrderBoxType.BUY_TRADE,
            activeOrderSide: OrderBoxType.BUY_ORDER,
            popOverOpenTake: false,
            popOverOpenMake: false
        }
    }

    componentDidMount() {
        OrderPlacementStore.on("change", this.onOrderPlacementStoreChange)
        this.onOrderPlacementStoreChange()
    }

    componentWillUnmount() {
        OrderPlacementStore.removeListener("change", this.onOrderPlacementStoreChange)
    }

    onOrderPlacementStoreChange() {
        const orderPlacementState = OrderPlacementStore.getOrderPlacementState()
        this.setState({
            activeOrderBoxType: orderPlacementState.orderBoxType,
            activeTradeSide: orderPlacementState.orderBoxTradeSide,
            activeOrderSide: orderPlacementState.orderBoxOrderSide,
        })
    }

    toggleOrderBoxType(orderBoxType) {
        if (this.state.activeOrderBoxType !== orderBoxType) {
            OrderPlacementActions.orderBoxTypeChanged(orderBoxType)
        }
    }

    toggleTradeSide(tradeSide) {
        if (this.state.activeTradeSide !== tradeSide) {
            OrderPlacementActions.orderBoxTradeSideChanged(tradeSide)

        }
    }

    toggleOrderSide(orderSide) {
        if (this.state.activeOrderSide !== orderSide) {
            OrderPlacementActions.orderBoxOrderSideChanged(orderSide)
        }
    }

    toggleTakePopOver() {
        this.setState({
            popOverOpenTake: !this.state.popOverOpenTake
        })
    }

    toggleMakePopOver() {
        this.setState({
            popOverOpenMake: !this.state.popOverOpenMake
        })
    }

    render() {
        const { tokenName } = this.props

        return (
            <Box>
                <BoxHeader>
                    <div className="hdr-stretch">
                        <strong className="card-title">TRADING</strong>
                    </div>
                </BoxHeader>
                <BoxSection>
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeOrderBoxType === OrderBoxType.TRADE })}
                                onClick={() => this.toggleOrderBoxType(OrderBoxType.TRADE)}>
                                <strong>TRADE</strong> &nbsp;
                                <span id={"TakePopOver"} onClick={this.toggleTakePopOver}>
                                    <i className="fas fa-question-circle"></i>
                                </span>
                                <Popover placement="bottom" isOpen={this.state.popOverOpenTake} target={"TakePopOver"} toggle={this.toggleTakePopOver}>
                                    <PopoverBody>
                                        Take an existing order from the order book, by submitting a Trade transaction to the Ethereum Network.<br /><br />
                                        As the taker you will incur two costs:<br /><br />
                                        <ul>
                                            <li><strong>Gas Fee</strong> (dependent on Gas Price)</li>
                                            <li><strong>EtherDelta Smart Contract Fee</strong> (0.3% of trade notional)</li>
                                        </ul>
                                        NOTE: GammaDex does not charge a fee, though currently use the EtherDelta Smart Contract for Trade Settlement - payable to EtherDelta.
                                    </PopoverBody>
                                </Popover>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeOrderBoxType === OrderBoxType.ORDER })}
                                onClick={() => this.toggleOrderBoxType(OrderBoxType.ORDER)}>
                                <strong>ORDER</strong> &nbsp;
                                <span id={"MakePopOver"} onClick={this.toggleMakePopOver}>
                                    <i className="fas fa-question-circle"></i>
                                </span>
                                <Popover placement="bottom" isOpen={this.state.popOverOpenMake} target={"MakePopOver"} toggle={this.toggleMakePopOver}>
                                    <PopoverBody>
                                        Submit a new order to the GammaDex off-chain order book.<br /><br />
                                        In addition the order will be forwarded to other (third-party) order books that use the same EtherDelta Smart Contract,
                                        namely: EtherDelta and ForkDelta.
                                    <br /><br />
                                        There are zero fees to make an order in this way.
                                    </PopoverBody>
                                </Popover>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeOrderBoxType}>
                        <TabPane tabId={OrderBoxType.TRADE}>

                            <Nav tabs>
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: this.state.activeTradeSide === OrderBoxType.BUY_TRADE })}
                                        onClick={() => this.toggleTradeSide(OrderBoxType.BUY_TRADE)}>
                                        <strong>BUY {tokenName}</strong> &nbsp;
                            </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: this.state.activeTradeSide === OrderBoxType.SELL_TRADE })}
                                        onClick={() => this.toggleTradeSide(OrderBoxType.SELL_TRADE)}>
                                        <strong>SELL {tokenName}</strong> &nbsp;
                            </NavLink>
                                </NavItem>
                            </Nav>
                            <TabContent activeTab={this.state.activeTradeSide}>
                                <TabPane tabId={OrderBoxType.BUY_TRADE}>
                                    <Row>
                                        <Col sm="12">
                                            <FillOrderBook type={OrderSide.BUY} tokenName={tokenName} cssClass={"buy-box-green"} />
                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane tabId={OrderBoxType.SELL_TRADE}>
                                    <Row>
                                        <Col sm="12">
                                            <FillOrderBook type={OrderSide.SELL} tokenName={tokenName} cssClass={"sell-box-red"} />
                                        </Col>
                                    </Row>
                                </TabPane>
                            </TabContent>

                        </TabPane>
                        <TabPane tabId={OrderBoxType.ORDER}>

                            <Nav tabs>
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: this.state.activeOrderSide === OrderBoxType.BUY_ORDER })}
                                        onClick={() => this.toggleOrderSide(OrderBoxType.BUY_ORDER)}>
                                        <strong>BUY {tokenName}</strong> &nbsp;
                            </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: this.state.activeOrderSide === OrderBoxType.SELL_ORDER })}
                                        onClick={() => this.toggleOrderSide(OrderBoxType.SELL_ORDER)}>
                                        <strong>SELL {tokenName}</strong> &nbsp;
                            </NavLink>
                                </NavItem>
                            </Nav>
                            <TabContent activeTab={this.state.activeOrderSide}>
                                <TabPane tabId={OrderBoxType.BUY_ORDER}>
                                    <Row>
                                        <Col sm="12">
                                            <MakeOrder type={OrderSide.BUY} tokenName={tokenName} cssClass={"buy-box-green"}/>
                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane tabId={OrderBoxType.SELL_ORDER}>
                                    <Row>
                                        <Col sm="12">
                                            <MakeOrder type={OrderSide.SELL} tokenName={tokenName} cssClass={"sell-box-red"}/>
                                        </Col>
                                    </Row>
                                </TabPane>
                            </TabContent>

                        </TabPane>
                    </TabContent>
                </BoxSection>
            </Box>
        )
    }
}