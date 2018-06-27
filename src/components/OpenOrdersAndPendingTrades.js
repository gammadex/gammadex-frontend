import React from "react"
import {Box, BoxHeader} from "./CustomComponents/Box"
import OpenOrders from "./OpenOrders"
import PendingTrades from "./PendingTrades"

export default class OpenOrdersAndPendingTrades extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            activeTab: "OpenOrders",
        }
    }

    selectTab = (tabName) => {
        this.setState({
            activeTab: tabName
        })
    }

    render() {
        const openOrdersActive = this.state.activeTab === 'OpenOrders'
        const openOrdersActiveClass = openOrdersActive ? 'active' : ''
        const pendingTradesActiveClass = (!openOrdersActive) ? 'active' : ''

        const content = openOrdersActive ? <OpenOrders/> : <PendingTrades/>

        return (
            <Box className="open-orders-and-pending-trades-component last-card">
                <BoxHeader>
                    <div className="card-title">Open Orders / Pending Trades</div>
                    <div>
                        <ul className="nav nav-pills card-header-pills">
                            <li className="nav-item">
                                <button className={"nav-link btn btn-sm card-header-button " + openOrdersActiveClass}
                                        onClick={() => this.selectTab("OpenOrders")}>My Open Orders
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className={"nav-link  btn btn-sm card-header-button " + pendingTradesActiveClass}
                                        onClick={() => this.selectTab("PendingTrades")}>My Pending Trades
                                </button>
                            </li>
                        </ul>
                    </div>
                </BoxHeader>
                {content}
            </Box>
        )
    }
}