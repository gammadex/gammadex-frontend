import React from "react"
import AccountDetail from '../components/AccountDetail'
import OrderBookStore from '../stores/OrderBookStore'
import PlotlyPriceChart from './OrderBook/PlotlyPriceChart'
import PlotlyDepthChart from './OrderBook/PlotlyDepthChart'
import Resizer from './Resizer'

export default class ChartsAndBalances extends React.Component {
    state = {
        activeTab: "PriceChart",
        allTrades: [],
        allBids: [],
        allOffers: [],
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveBidsAndOffers)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveBidsAndOffers)
    }

    saveBidsAndOffers = () => {
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
        let priceChartActiveClass = "", depthChartActiveClass = "", balancesActiveClass = ""

        if (activeTab === "PriceChart") {
            content = <Resizer><PlotlyPriceChart trades={allTrades} token={token.name}/></Resizer>
            priceChartActiveClass = "active"
        } else if (activeTab === "DepthChart") {
            content = <Resizer><PlotlyDepthChart bids={allBids} offers={allOffers}/></Resizer>
            depthChartActiveClass = "active"
        }

        return (
            <div className="card">
                <div className="card-header">
                    <ul className="nav nav-pills card-header-pills">
                        <li className="nav-item">
                            <a className={"nav-link " + priceChartActiveClass} href="#" onClick={() => this.selectTab("PriceChart")}>Price
                                Chart</a>
                        </li>
                        <li className="nav-item">
                            <a className={"nav-link " + depthChartActiveClass} href="#" onClick={() => this.selectTab("DepthChart")}>Depth
                                Chart</a>
                        </li>
                    </ul>
                </div>
                <div className="card-block">
                    {content}
                </div>
            </div>
        )
    }
}