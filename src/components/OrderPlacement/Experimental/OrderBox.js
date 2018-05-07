import React from "react"
import { Box, BoxSection, BoxHeader } from "../../CustomComponents/Box"
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap'
import classnames from 'classnames'
import EmptyTableMessage from "../../CustomComponents/EmptyTableMessage"
import FillOrderBookTab from './FillOrderBookTab'
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
        const orderBookTitle = type === OrderSide.BUY ? 'Lift Offer' : 'Hit Bid'

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
                            >{orderBookTitle}</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeTab === 'limit' })}
                                onClick={() => { this.toggleTab('limit'); }}
                            >Limit</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeTab === 'market' })}
                                onClick={() => { this.toggleTab('market'); }}
                            >Market</NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab}>
                        <FillOrderBookTab tabId="orderbook" type={type} tokenName={tokenName}/>
                        <TabPane tabId="limit">
                            <Row>
                                <Col sm="12">
                                    <EmptyTableMessage>limit</EmptyTableMessage>
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tabId="market">
                            <Row>
                                <Col sm="12">
                                    <EmptyTableMessage>market</EmptyTableMessage>
                                </Col>
                            </Row>
                        </TabPane>
                    </TabContent>
                </BoxSection>
            </Box>
        )
    }
}