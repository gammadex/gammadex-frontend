import React from "react"
import {Box, BoxSection, BoxHeader} from "../CustomComponents/Box"
import {TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col, UncontrolledTooltip, Popover, PopoverHeader, PopoverBody} from 'reactstrap'
import classnames from 'classnames'
import EmptyTableMessage from "../CustomComponents/EmptyTableMessage"
import FillOrderBook from './FillOrderBook'
import MakeOrder from './MakeOrder'
import OrderSide from "../../OrderSide"
import OrderBoxType from "./OrderBoxType"
import * as OrderPlacementActions from "../../actions/OrderPlacementActions"
import OrderPlacementStore from "../../stores/OrderPlacementStore"
import AccountStore from "../../stores/AccountStore"
import Conditional from "../CustomComponents/Conditional"

export default class OrderBox extends React.Component {
    constructor(props) {
        super(props)

        this.toggleType = this.toggleType.bind(this)
        this.toggleSide = this.toggleSide.bind(this)
        this.toggleTakePopOver = this.toggleTakePopOver.bind(this)
        this.toggleMakePopOver = this.toggleMakePopOver.bind(this)
        this.onOrderPlacementStoreChange = this.onOrderPlacementStoreChange.bind(this)
        this.onAccountStoreChange = this.onAccountStoreChange.bind(this)

        this.state = {
            activeType: OrderBoxType.ORDER,
            activeSide: OrderBoxType.BUY,
            popOverOpenTake: false,
            popOverOpenMake: false,
            balanceRetrieved: AccountStore.isBalanceRetrieved(),
        }
    }

    componentDidMount() {
        OrderPlacementStore.on("change", this.onOrderPlacementStoreChange)
        AccountStore.on("change", this.onAccountStoreChange)
        this.onOrderPlacementStoreChange()
    }

    componentWillUnmount() {
        OrderPlacementStore.removeListener("change", this.onOrderPlacementStoreChange)
        AccountStore.removeListener("change", this.onAccountStoreChange)
    }

    onOrderPlacementStoreChange() {
        const orderPlacementState = OrderPlacementStore.getOrderPlacementState()
        this.setState({
            activeType: orderPlacementState.orderBoxType,
            activeSide: orderPlacementState.orderBoxSide,
        })
    }

    onAccountStoreChange() {
        this.setState({
            balanceRetrieved: AccountStore.isBalanceRetrieved()
        })
    }

    toggleType(type) {
        if (this.state.activeType !== type) {
            OrderPlacementActions.orderBoxTypeChanged(type)
        }
    }

    toggleSide(side) {
        if (this.state.activeSide !== side) {
            OrderPlacementActions.orderBoxSideChanged(side)
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
        const {balanceRetrieved, activeType, activeSide} = this.state
        const {token} = this.props

        const tokenSymbol = token ? token.symbol : null
        const tokenAddress = token ? token.address : null

        const buyActive = activeSide === OrderBoxType.BUY
        const sellActive = activeSide === OrderBoxType.SELL
        const orderActive = activeType === OrderBoxType.ORDER
        const tradeActive = activeType === OrderBoxType.TRADE

        const buySellClass = buyActive ? "trading-nav-buy-selected" : "trading-nav-sell-selected"

        return (
            <Box title="Trading">
                <BoxSection>
                    <Nav fill className={"trading-buy-sell-nav " + buySellClass}>
                        <NavItem>
                            <NavLink
                                className={"trading-nav-buy " + classnames({active: buyActive})}
                                onClick={() => this.toggleSide(OrderBoxType.BUY)}>
                                <strong>BUY {tokenSymbol}</strong>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={"trading-nav-sell " + classnames({active: sellActive})}
                                onClick={() => this.toggleSide(OrderBoxType.SELL)}>
                                <strong>SELL {tokenSymbol}</strong>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <Conditional displayCondition={!!token}>
                        <div className="trading-types">
                            <Nav tabs fill className="nav-trading-types">
                                <NavItem>
                                    <NavLink
                                        className={"nav-trading-type " + classnames({active: orderActive})}
                                        onClick={() => this.toggleType(OrderBoxType.ORDER)}>
                                        <strong>ORDER</strong> &nbsp;
                                        <span id={"MakePopOver"} onClick={this.toggleMakePopOver}>
                                            <i className="fas fa-question-circle"></i>
                                        </span>
                                        <Popover placement="bottom" isOpen={this.state.popOverOpenMake} target={"MakePopOver"} toggle={this.toggleMakePopOver}>
                                            <PopoverBody>
                                                Submit a new order to the GammaDex off-chain order book.<br/><br/>
                                                In addition the order will be forwarded to other (third-party) order books that use the same EtherDelta Smart Contract,
                                                namely: EtherDelta and ForkDelta.
                                                <br/><br/>
                                                There are zero fees to make an order in this way.
                                            </PopoverBody>
                                        </Popover>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={"nav-trading-type " + classnames({active: tradeActive})}
                                        onClick={() => this.toggleType(OrderBoxType.TRADE)}>
                                        <strong>TRADE</strong> &nbsp;
                                        <span id={"TakePopOver"} onClick={this.toggleTakePopOver}>
                                            <i className="fas fa-question-circle"></i>
                                        </span>
                                        <Popover placement="bottom" isOpen={this.state.popOverOpenTake} target={"TakePopOver"} toggle={this.toggleTakePopOver}>
                                            <PopoverBody>
                                                Take an existing order from the order book, by submitting a Trade transaction to the Ethereum Network.<br/><br/>
                                                As the taker you will incur two costs:<br/><br/>
                                                <ul>
                                                    <li><strong>Gas Fee</strong> (dependent on Gas Price)</li>
                                                    <li><strong>EtherDelta Smart Contract Fee</strong> (0.3% of trade notional)</li>
                                                </ul>
                                                NOTE: GammaDex does not charge a fee, though currently use the EtherDelta Smart Contract for Trade Settlement - payable to EtherDelta.
                                            </PopoverBody>
                                        </Popover>
                                    </NavLink>
                                </NavItem>
                            </Nav>

                            <TabContent activeTab={activeType + activeSide}>
                                <TabPane tabId={OrderBoxType.ORDER + OrderBoxType.SELL}>
                                    <MakeOrder type={OrderSide.SELL} tokenSymbol={tokenSymbol} tokenAddress={tokenAddress} balanceRetrieved={balanceRetrieved}/>
                                </TabPane>
                                <TabPane tabId={OrderBoxType.TRADE + OrderBoxType.SELL}>
                                    <FillOrderBook type={OrderSide.SELL} tokenSymbol={tokenSymbol} tokenAddress={tokenAddress} balanceRetrieved={balanceRetrieved}/>
                                </TabPane>
                                <TabPane tabId={OrderBoxType.ORDER + OrderBoxType.BUY}>
                                    <MakeOrder type={OrderSide.BUY} tokenSymbol={tokenSymbol} tokenAddress={tokenAddress} balanceRetrieved={balanceRetrieved}/>
                                </TabPane>
                                <TabPane tabId={OrderBoxType.TRADE + OrderBoxType.BUY}>
                                    <FillOrderBook type={OrderSide.BUY} tokenSymbol={tokenSymbol} tokenAddress={tokenAddress} balanceRetrieved={balanceRetrieved}/>
                                </TabPane>
                            </TabContent>
                        </div>
                    </Conditional>
                </BoxSection>
            </Box>
        )
    }
}