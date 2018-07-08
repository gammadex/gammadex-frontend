import React, { Component } from 'react'
import { BoxSection } from "../CustomComponents/Box"
import { withRouter } from "react-router-dom"
import OrderBookStore from '../../stores/OrderBookStore'
import { Box } from "../CustomComponents/Box"
import { convertToOhlc, convertToOhlcReactStockChart } from "../../util/OhlcConverter"
import CandlestickWithDarkTheme from './CandlestickWithDarkTheme'
import TokenStore from "../../stores/TokenStore"
import TokenRepository from "../../util/TokenRepository"
import * as TokenActions from "../../actions/TokenActions"
import * as WebSocketActions from "../../actions/WebSocketActions"
import EmptyTableMessage from "../CustomComponents/EmptyTableMessage"

class ReactChart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            trades: OrderBookStore.getAllTradesSortedByDateAsc(),

            ohlcIntervalMins: 60,
            chartData: []
        }
        this.saveBidsAndOffers = this.saveBidsAndOffers.bind(this)

    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveBidsAndOffers)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveBidsAndOffers)
    }

    componentDidMount() {
        this.setState({ chartData: this.getChartData() })
    }

    saveBidsAndOffers() {
        this.setState({
            trades: OrderBookStore.getAllTradesSortedByDateAsc(),
            chartData: this.getChartData(OrderBookStore.getAllTradesSortedByDateAsc())
        })
    }

    getChartData() {
        const { trades, ohlcIntervalMins } = this.state
        return convertToOhlcReactStockChart(trades, ohlcIntervalMins)
    }

    render() {
        let candlestickChart = <EmptyTableMessage>Not enough data points</EmptyTableMessage>
        if (this.state.chartData && this.state.chartData.length > 1) {
            candlestickChart = <CandlestickWithDarkTheme data={this.state.chartData} width={350} />
        }
        return (
            <Box title="React Stock Chart">
                <BoxSection>
                    {candlestickChart}
                </BoxSection>
            </Box>
        )
    }
}

export default withRouter(ReactChart)
