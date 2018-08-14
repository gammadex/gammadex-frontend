import React from "react"
import {Box, BoxHeader, BoxSection, BoxTitle} from "./CustomComponents/Box"
import OpenOrders from "./OpenOrders"
import PendingTrades from "./PendingTrades"
import Conditional from "./CustomComponents/Conditional"
import OpenOrdersStore from "../stores/OpenOrdersStore"
import * as OpenOrderApi from "../apis/OpenOrderApi"

export default class OpenOrdersAndPendingTrades extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            activeTab: "OpenOrders",
            showAllTokens: OpenOrdersStore.getOpenOrdersState().showAllTokens,
        }

        this.updateOpenOrdersState = this.updateOpenOrdersState.bind(this)
    }

    componentWillMount() {
        OpenOrdersStore.on("change", this.updateOpenOrdersState)
    }

    componentWillUnmount() {
        OpenOrdersStore.removeListener("change", this.updateOpenOrdersState)
    }

    updateOpenOrdersState() {
        const {showAllTokens} = OpenOrdersStore.getOpenOrdersState()
        this.setState(
            {
                showAllTokens: showAllTokens
            })
    }

    selectTab = (tabName) => {
        this.setState({
            activeTab: tabName
        })
    }

    handleShowAll = (event) => {
        OpenOrderApi.showAllTokensChanged(event.target.checked)
    }

    render() {
        const {activeTab, showAllTokens} = this.state

        const openOrdersActive = activeTab === 'OpenOrders'

        const content = openOrdersActive ? <OpenOrders showAllTokens={showAllTokens}/> : <PendingTrades/>
        const title = openOrdersActive ? 'Open Orders' : 'Pending Trades'

        //

        return (
            <Box id="open-orders-pending-trades-container" className="open-orders-and-pending-trades-component last-card full-height-lg">
                <BoxHeader>
                    <BoxTitle title={title}
                              ids={{'open-orders-pending-trades-body': 'block'}}
                              componentId="open-orders-pending-trades-container"
                    />

                    <Conditional displayCondition={openOrdersActive}>
                        <div className="form-check form-check-inline no-mobile">
                            <input className="form-check-input" type="checkbox" id="showAllTokensCheckbox" onChange={this.handleShowAll} value={"true"} checked={showAllTokens}/>
                            <label className="form-check-label" htmlFor="showAllTokensCheckbox">Show All</label>
                        </div>
                    </Conditional>

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

                <BoxSection id="open-orders-pending-trades-body" className="p-0 mobile-toggle">
                    {content}
                </BoxSection>
            </Box>
        )
    }
}