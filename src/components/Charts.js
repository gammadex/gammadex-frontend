import React from "react"
import OrderBookStore from '../stores/OrderBookStore'
import PlotlyPriceChart from './OrderBook/PlotlyPriceChart'
import PlotlyDepthChart from './OrderBook/PlotlyDepthChart'
import Resizer from './CustomComponents/Resizer'
import Conditional from "./CustomComponents/Conditional"
import {Box, BoxHeader} from "./CustomComponents/Box"

export default class Charts extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            activeTab: "PriceChart",
            allTrades: [],
            allBids: [],
            allOffers: [],
        }

        this.saveBidsAndOffers = this.saveBidsAndOffers.bind(this)
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveBidsAndOffers)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveBidsAndOffers)
    }

    saveBidsAndOffers() {
        this.setState((prevState, props) => ({
            allTrades: OrderBookStore.getAllTradesSortedByDateAsc(),
            allBids: OrderBookStore.getBids(),
            allOffers: OrderBookStore.getOffers(),
        }))
    }

    selectTab = (tabName) => {
        this.setState({
            activeTab: tabName
        })
    }

    render() {
        const {activeTab, allTrades, allBids, allOffers} = this.state
        const {token} = this.props

        let content = null
        let priceChartActiveClass = "", depthChartActiveClass = "", noChartActiveClass = ""

        if (activeTab === "PriceChart") {
            content = <Resizer><PlotlyPriceChart trades={allTrades} token={token.name}/></Resizer>
            priceChartActiveClass = "active"
        } else if (activeTab === "DepthChart") {
            content = <Resizer><PlotlyDepthChart bids={allBids} offers={allOffers}/></Resizer>
            depthChartActiveClass = "active"
        } else if (activeTab === "NoChart") {
            content = ""
            noChartActiveClass = "active"
        }

        return (
            <Box>
                <BoxHeader noBorder={allTrades.length === 0 || noChartActiveClass === "active"}>
                    <ul className="nav nav-pills card-header-pills">
                        <li className="nav-item">
                            <button className={"nav-link btn btn-sm " + priceChartActiveClass}
                               onClick={() => this.selectTab("PriceChart")}>Price Chart</button>
                        </li>
                        <li className="nav-item">
                            <button className={"nav-link  btn btn-sm " + depthChartActiveClass}
                               onClick={() => this.selectTab("DepthChart")}>Depth Chart</button>
                        </li>
                        <li className="nav-item">
                            <button className={"nav-link  btn btn-sm " + noChartActiveClass}
                               onClick={() => this.selectTab("NoChart")}>No Chart</button>
                        </li>
                    </ul>
                </BoxHeader>

                <Conditional displayCondition={allTrades.length > 0}>
                    {content}
                </Conditional>

            </Box>
        )
    }
}