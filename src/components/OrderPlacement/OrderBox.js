import React from "react"
import { Box, BoxSection, BoxHeader } from "../CustomComponents/Box"
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col, UncontrolledTooltip, Popover, PopoverHeader, PopoverBody } from 'reactstrap'
import classnames from 'classnames'
import EmptyTableMessage from "../CustomComponents/EmptyTableMessage"
import FillOrderBook from './FillOrderBook'
import MakeOrder from './MakeOrder'
import OrderSide from "../../OrderSide"

export default class OrderBox extends React.Component {
    constructor(props) {
        super(props)

        this.toggleTab = this.toggleTab.bind(this)
        this.toggleOrderBookTab = this.toggleOrderBookTab.bind(this)
        this.toggleLimitTab = this.toggleLimitTab.bind(this)
        this.toggleTakePopOver = this.toggleTakePopOver.bind(this)
        this.toggleMakePopOver = this.toggleMakePopOver.bind(this)
        this.state = {
            activeTab: 'orderbook',
            activeOrderBookTab: 'buyorderbook',
            activeLimitTab: 'buylimit',
            popOverOpenTake: false,
            popOverOpenMake: false
        }
    }

    toggleTab(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            })
        }
    }

    toggleOrderBookTab(tab) {
        if (this.state.activeOrderBookTab !== tab) {
            this.setState({
                activeOrderBookTab: tab
            })
        }
    }

    toggleLimitTab(tab) {
        if (this.state.activeLimitTab !== tab) {
            this.setState({
                activeLimitTab: tab
            })
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
                                className={classnames({ active: this.state.activeTab === 'orderbook' })}
                                onClick={() => { this.toggleTab('orderbook'); }}>
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
                                className={classnames({ active: this.state.activeTab === 'limit' })}
                                onClick={() => { this.toggleTab('limit'); }}>
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
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="orderbook">

                            <Nav tabs>
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: this.state.activeOrderBookTab === 'buyorderbook' })}
                                        onClick={() => { this.toggleOrderBookTab('buyorderbook'); }}>
                                        <strong>BUY {tokenName}</strong> &nbsp;
                            </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: this.state.activeOrderBookTab === 'sellorderbook' })}
                                        onClick={() => { this.toggleOrderBookTab('sellorderbook'); }}>
                                        <strong>SELL {tokenName}</strong> &nbsp;
                            </NavLink>
                                </NavItem>
                            </Nav>
                            <TabContent activeTab={this.state.activeOrderBookTab}>
                                <TabPane tabId="buyorderbook">
                                    <Row>
                                        <Col sm="12">
                                            <FillOrderBook type={OrderSide.BUY} tokenName={tokenName} />
                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane tabId="sellorderbook">
                                    <Row>
                                        <Col sm="12">
                                            <FillOrderBook type={OrderSide.SELL} tokenName={tokenName} />
                                        </Col>
                                    </Row>
                                </TabPane>
                            </TabContent>

                        </TabPane>
                        <TabPane tabId="limit">

                            <Nav tabs>
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: this.state.activeLimitTab === 'buylimit' })}
                                        onClick={() => { this.toggleLimitTab('buylimit'); }}>
                                        <strong>BUY {tokenName}</strong> &nbsp;
                            </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: this.state.activeLimitTab === 'selllimit' })}
                                        onClick={() => { this.toggleLimitTab('selllimit'); }}>
                                        <strong>SELL {tokenName}</strong> &nbsp;
                            </NavLink>
                                </NavItem>
                            </Nav>
                            <TabContent activeTab={this.state.activeLimitTab}>
                                <TabPane tabId="buylimit">
                                    <Row>
                                        <Col sm="12">
                                            <MakeOrder type={OrderSide.BUY} tokenName={tokenName} />
                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane tabId="selllimit">
                                    <Row>
                                        <Col sm="12">
                                            <MakeOrder type={OrderSide.SELL} tokenName={tokenName} />
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