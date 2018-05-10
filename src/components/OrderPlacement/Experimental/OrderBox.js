import React from "react"
import { Box, BoxSection, BoxHeader } from "../../CustomComponents/Box"
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col, UncontrolledTooltip } from 'reactstrap'
import classnames from 'classnames'
import EmptyTableMessage from "../../CustomComponents/EmptyTableMessage"
import FillOrderBookTab from './FillOrderBookTab'
import MakeOrderTab from './MakeOrderTab'
import OrderSide from "../../../OrderSide"

export default class OrderBox extends React.Component {
    constructor(props) {
        super(props)

        this.toggleTab = this.toggleTab.bind(this);
        this.state = {
            activeTab: 'orderbook'
        }
    }

    toggleTab(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            })
        }
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
                                onClick={() => { this.toggleTab('orderbook'); }}
                            >Take <strong id={type + "TakeInfo"}>&#9432;</strong></NavLink>
                            <UncontrolledTooltip placement="top" target={type + "TakeInfo"}>
                                Take an existing order from the order book, by submitting a Trade transaction to the Ethereum Network.
                                As the taker you will incur two costs: 1) gas fee, 2) EtherDelta Smart Contract fee
                            </UncontrolledTooltip>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeTab === 'limit' })}
                                onClick={() => { this.toggleTab('limit'); }}
                            >Make Order <strong id={type + "MakeInfo"}>&#9432;</strong></NavLink>
                            <UncontrolledTooltip placement="top" target={type + "MakeInfo"}>
                                Submit a new order to the GammaDex off-chain order book. There are zero fees to make an order in this way.
                            </UncontrolledTooltip>                            
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