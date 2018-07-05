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

        const content = openOrdersActive ? <OpenOrders/> : <PendingTrades/>
        const title = openOrdersActive ? 'Open Orders' : 'Pending Trades'

        return (
            <Box className="open-orders-and-pending-trades-component last-card">
                <BoxHeader>
                    <div className="card-title">{title}</div>
                    <div>
                        <ul className="nav navbar-dark navbar-card">
                            <li className="nav-item">
                                <a className={"nav-link card-header-button "}
                                        onClick={() => this.selectTab("OpenOrders")}>Open Orders
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className={"nav-link card-header-button "}
                                        onClick={() => this.selectTab("PendingTrades")}>Pending Trades
                                </a>
                            </li>
                        </ul>
                    </div>
                </BoxHeader>
                {content}
            </Box>
        )
    }
}