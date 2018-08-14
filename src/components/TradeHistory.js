import React from "react"
import {Box, BoxSection, BoxTitle} from "./CustomComponents/Box"
import OrderBookStore from "../stores/OrderBookStore"
import Conditional from "./CustomComponents/Conditional"
import TradeHistoryTable from "./OrderBook/TradeHistoryTable"
import Scroll from "./CustomComponents/Scroll"

export default class TradeHistory extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            trades: OrderBookStore.getTrades(),
        }

        this.tradesChanged = this.tradesChanged.bind(this)
    }

    componentWillMount() {
        OrderBookStore.on("change", this.tradesChanged)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.tradesChanged)
    }

    tradesChanged() {
        this.setState({trades: OrderBookStore.getTrades()})
    }

    render() {
        const {trades} = this.state
        const {token} = this.props
        const tokenSymbol = token ? token.symbol : null

        return (
            <Box id="market-trades-container" className="market-trades-component last-card">
                <div className="card-header">
                    <BoxTitle title="Market Trades"
                              ids={{'market-trades-body': 'block'}}
                              componentId="market-trades-container"
                    />
                </div>

                <div id="market-trades-body" className="mobile-toggle card-body-height">
                    <Scroll>
                        <Conditional displayCondition={trades && trades.length > 0}
                                     fallbackMessage={'There is no trade history for ' + tokenSymbol}>
                            <TradeHistoryTable base="ETH" token={tokenSymbol} trades={trades}/>
                        </Conditional>
                    </Scroll>
                </div>
            </Box>
        )
    }
}