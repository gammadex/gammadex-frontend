import React, { Component } from 'react'
import {BoxSection, BoxTitle} from "../CustomComponents/Box"
import { withRouter } from "react-router-dom"
import OrderBookStore from '../../stores/OrderBookStore'
import { Box } from "../CustomComponents/Box"
import { convertToOhlc, convertToOhlcReactStockChart } from "../../util/OhlcConverter"
import ChartRenderer from './ChartRenderer'
import TokenStore from "../../stores/TokenStore"
import TokenRepository from "../../util/TokenRepository"
import * as TokenActions from "../../actions/TokenActions"
import * as WebSocketActions from "../../actions/WebSocketActions"
import EmptyTableMessage from "../CustomComponents/EmptyTableMessage"
import ReactChartType from "./ReactChartType"
import ReactResizeDetector from 'react-resize-detector'
import { setFavourite, getFavourite } from "../../util/FavouritesDao"
import Favourites from "../../util/Favourites"

class ReactChart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            trades: OrderBookStore.getAllTradesSortedByDateAsc(),
            ohlcIntervalMins: this.getOhlcInterval(),
            chartType: this.getChartType(),
            chartData: [],
            chartContainerWidth: null,
            chartContainerHeight: null
        }
        this.saveBidsAndOffers = this.saveBidsAndOffers.bind(this)
        this.getChartData = this.getChartData.bind(this)
        this.toggleChartType = this.toggleChartType.bind(this)
        this.toggleOhlcInterval = this.toggleOhlcInterval.bind(this)
    }

    getOhlcInterval() {
        if(getFavourite(Favourites.CHART_INTERVAL) == null || ![60, 360, 1440].includes(Number(getFavourite(Favourites.CHART_INTERVAL)))) {
            return 60
        } else {
            return Number(getFavourite(Favourites.CHART_INTERVAL))
        }
    }

    getChartType() {
        if(getFavourite(Favourites.CHART_TYPE) == null || ![ReactChartType.CANDLESTICK, ReactChartType.LINE].includes(getFavourite(Favourites.CHART_TYPE))) {
            return ReactChartType.LINE
        } else {
            return getFavourite(Favourites.CHART_TYPE)
        }
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveBidsAndOffers)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveBidsAndOffers)
    }

    saveBidsAndOffers() {

        const orderbookTrades = OrderBookStore.getAllTradesSortedByDateAsc()
        const tradeChartData = this.getChartData(orderbookTrades, this.state.ohlcIntervalMins)

        this.setState({
            trades: orderbookTrades,
            chartData: tradeChartData
        })
    }

    getChartData(trades, ohlcIntervalMins) {
        return convertToOhlcReactStockChart(trades, ohlcIntervalMins)
    }

    onResize = (width, height) => {
        this.setState({
            chartContainerWidth: width,
            chartContainerHeight: height
        })
    }

    toggleChartType(chartType) {
        setFavourite(Favourites.CHART_TYPE, chartType)
        this.setState({
            chartType: chartType
        })
    }

    toggleOhlcInterval(ohlcIntervalMins) {
        setFavourite(Favourites.CHART_INTERVAL, String(ohlcIntervalMins))
        const mins = parseInt(ohlcIntervalMins, 10)

        const orderbookTrades = OrderBookStore.getAllTradesSortedByDateAsc()
        const tradeChartData = this.getChartData(orderbookTrades, mins)
        this.setState({
            ohlcIntervalMins: mins,
            trades: orderbookTrades,
            chartData: tradeChartData
        })
    }

    render() {
        const { ohlcIntervalMins, chartType, chartData, chartContainerHeight, chartContainerWidth } = this.state

        let chart = <EmptyTableMessage>No Chart Data</EmptyTableMessage>
        if (chartData && chartData.length > 1 && chartContainerHeight && chartContainerWidth) {
            chart = <ChartRenderer chartType={chartType} data={chartData} containerHeight={chartContainerHeight} containerWidth={chartContainerWidth} />
        }

        return (
            <Box id="price-chart-container" className="chart-component price-chart-component">
                <div className="card-header">
                    <BoxTitle  title="Price Chart"
                              componentId="price-chart-container"
                    />
                </div>

                <div className="float-left">
                    <div className="form-inline">

                        <div className="price-chart-form">
                            <button className="btn btn-secondary dropdown-toggle" type="button" id="chartTypeMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                {chartType === ReactChartType.CANDLESTICK ? 'Candlestick' : 'Line'}
                            </button>

                            <div className="dropdown-menu" aria-labelledby="chartTypeMenu">
                                <button className="dropdown-item" type="button" onClick={() => this.toggleChartType(ReactChartType.CANDLESTICK)} >Candlestick</button>
                                <button className="dropdown-item" type="button" onClick={() => this.toggleChartType(ReactChartType.LINE)}>Line</button>
                            </div>

                        </div>
                        <div className="price-chart-form">
                            <button className="btn btn-secondary dropdown-toggle" type="button" id="ohlcIntervalMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                {ohlcIntervalMins === 60 ? '1h' : ohlcIntervalMins === 360 ? '6h' : '24h'}
                            </button>

                            <div className="dropdown-menu" aria-labelledby="ohlcIntervalMenu">
                                <button className="dropdown-item" type="button" onClick={() => this.toggleOhlcInterval(60)}>1h</button>
                                <button className="dropdown-item" type="button" onClick={() => this.toggleOhlcInterval(360)}>6h</button>
                                <button className="dropdown-item" type="button" onClick={() => this.toggleOhlcInterval(1440)}>24h</button>
                            </div>
                        </div>
                    </div>
                </div>

                <BoxSection id="price-chart-resize-container" className="p-0">
                    <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} resizableElementId="price-chart-resize-container" />
                    {chart}
                </BoxSection>
            </Box>
        )
    }
}

export default withRouter(ReactChart)
