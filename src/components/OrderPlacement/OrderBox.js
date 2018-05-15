import React from "react"
import { Box, BoxSection, BoxHeader } from "../CustomComponents/Box"
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col, UncontrolledTooltip, Popover, PopoverHeader, PopoverBody } from 'reactstrap'
import classnames from 'classnames'
import EmptyTableMessage from "../CustomComponents/EmptyTableMessage"
import FillOrderBookTab from './FillOrderBookTab'
import MakeOrderTab from './MakeOrderTab'
import OrderSide from "../../OrderSide"

export default class OrderBox extends React.Component {
    constructor(props) {
        super(props)

        this.toggleTab = this.toggleTab.bind(this)
        this.toggleTakePopOver = this.toggleTakePopOver.bind(this)
        this.toggleMakePopOver = this.toggleMakePopOver.bind(this)
        this.state = {
            activeTab: 'orderbook',
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
        const {
            type, tokenName
        } = this.props

        const title = type === OrderSide.BUY ? 'Buy' : 'Sell'

        return (
            <Box>
                <BoxHeader>
                    <div className="hdr-stretch">
                        <strong className="card-title">{title + " " + tokenName}</strong>
                    </div>
                </BoxHeader>
                <BoxSection>
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeTab === 'orderbook' })}
                                onClick={() => { this.toggleTab('orderbook'); }}>
                                Take &nbsp;
                                <span id={type + "TakePopOver"} onClick={this.toggleTakePopOver}>
                                    <i className="fas fa-question-circle"></i>
                                </span>
                                <Popover placement="bottom" isOpen={this.state.popOverOpenTake} target={type + "TakePopOver"} toggle={this.toggleTakePopOver}>
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
                                Make &nbsp;
                                <span id={type + "MakePopOver"} onClick={this.toggleMakePopOver}>
                                    <i className="fas fa-question-circle"></i>
                                </span>
                                <Popover placement="bottom" isOpen={this.state.popOverOpenMake} target={type + "MakePopOver"} toggle={this.toggleMakePopOver}>
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
                        <FillOrderBookTab tabId="orderbook" type={type} tokenName={tokenName} />
                        <MakeOrderTab tabId="limit" type={type} tokenName={tokenName} />
                    </TabContent>
                </BoxSection>
            </Box>
        )
    }
}