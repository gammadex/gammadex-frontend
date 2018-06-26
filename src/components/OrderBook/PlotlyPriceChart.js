import React from "react"
import Plotly from 'plotly.js/dist/plotly-finance'
import {convertToOhlc, getPricesAndDates} from "../../util/OhlcConverter"
import {getInitialDateRange} from "../../util/ChartUtil"
import _ from "lodash"
import {BoxSection} from "../CustomComponents/Box"
import ReactResizeDetector from 'react-resize-detector'
import OrderBookStore from '../../stores/OrderBookStore'
import {Box} from "../CustomComponents/Box"

export default class PlotlyPriceChart extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            trades: OrderBookStore.getAllTradesSortedByDateAsc(),
            ohlcIntervalMins: 1440,
            chartElements: {
                ohlc: true,
                volume: true,
                price: false
            },
            plotCreatedForToken: null,
            chartContainerWidth: null,
            chartContainerHeight: null
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
        this.setState({
            trades: OrderBookStore.getAllTradesSortedByDateAsc(),
        })
    }

    componentDidMount() {
        this.createNewChart()
    }

    componentDidUpdate(prevProps, prevState) {
        const {token} = this.props
        const {plotCreatedForToken, trades} = this.state
        const tokenSymbol = token ? token.symbol : null

        const prevTrades = prevState.trades || []
        const currTrades = trades || []

        const stateChanged = (!_.isEqual(prevState, this.state) || prevProps.token !== token || prevTrades.length !== currTrades.length)

        if (trades && trades.length > 0) {
            if (plotCreatedForToken === token && !stateChanged) {
                this.updateChartDimensions(prevProps)
            } else {
                this.createNewChart()
            }
        }
    }

    createNewChart() {
        const {token} = this.props
        const tokenSymbol = token ? token.symbol : null
        const {trades, chartContainerWidth, chartContainerHeight} = this.state

        console.log(`creating: ${chartContainerWidth}x${chartContainerHeight}`, trades)


        if (trades && trades.length > 0) {
            const {data, layout} = this.getDataAndLayout()

            Plotly.purge('chart')
            Plotly.newPlot('chart', data, layout, {displayModeBar: false})

            this.setState({
                plotCreatedForToken: token
            })
        }
    }

    updateChartDimensions(prevProps) {
        const {chartContainerWidth, chartContainerHeight} = this.state

        if (chartContainerWidth && chartContainerHeight) {
            try {
                Plotly.relayout('chart', {
                    width: chartContainerWidth,
                    height: chartContainerHeight,
                })
            } catch (error) {
                console.log(`Error ${error}`)
            }
        }
    }

    getDataAndLayout = () => {
        const {trades, ohlcIntervalMins, chartElements} = this.state

        const ohlc = convertToOhlc(trades, ohlcIntervalMins, 'yyyy-mm-dd HH:MM')
        const prices = getPricesAndDates(trades, 'yyyy-mm-dd HH:MM:ss')
        const dateRange = getInitialDateRange(ohlcIntervalMins, ohlc.date[0], ohlc.date[ohlc.date.length - 1])

        const ohlcTrace = {
            x: ohlc.date,
            close: ohlc.close,
            high: ohlc.high,
            low: ohlc.low,
            open: ohlc.open,

            increasing: {line: {color: 'green'}, name: 'ohlc'},
            decreasing: {line: {color: 'red'}, name: 'ohlc'},

            type: 'candlestick',
            xaxis: 'x',
            yaxis: 'y',
            name: 'ohlc',
        }

        const volumeTrace = {
            x: ohlc.date,
            y: ohlc.volume,
            fill: 'tonexty',
            type: 'scatter',
            yaxis: 'y2',
            marker: {
                color: 'lightgray',
                size: 12,
                line: {
                    color: 'white',
                    width: 0.5
                },
            },
            name: 'volume',
        }

        const pricesTrace = {
            x: prices.dates,
            y: prices.prices,
            type: 'line',
            yaxis: 'y',
            line: {
                color: '#555555',
                width: 2,
                dash: 'dot',
            },
            name: 'price',
        }

        const data = []
        if (chartElements.ohlc) {
            data.push(ohlcTrace)
        }
        if (chartElements.price) {
            data.push(pricesTrace)
        }

        const layout = {
            dragmode: 'zoom',
            showlegend: false,
            xaxis: {
                //title: 'Time',
                //autorange: true,
                range: dateRange,
                tickformat: '%b %d',
            },
            yaxis: {
                // title: 'Price',
                autorange: true,
            },
            margin: {
                l: 40,
                r: 20,
                b: 0,
                t: 10,
                pad: 4
            }, font: {
                size: 10,
                family: 'Lato, sans-serif',
            }, height: this.props.height
        }

        return {
            data, layout
        }
    }

    onOhlcSpanChange = (event) => {
        const mins = parseInt(event.target.value, 10)

        this.setState({
            ohlcIntervalMins: mins
        })
    }

    onResize = (width, height) => {
        this.setState({
            chartContainerWidth: width,
            chartContainerHeight: height
        })
    }

    render() {
        const {ohlcIntervalMins} = this.state

        return (
            <Box title="Price Chart" className="chart-component price-chart-component">
                <div className="float-right ohlc-interval">
                    <span className="ohlc-interval-description">OHLC interval</span>

                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" name="ohlcSpan" id="ohlcSpan1"
                               value="60"
                               onChange={this.onOhlcSpanChange}
                               checked={ohlcIntervalMins === 60}
                        />
                        <label className="form-check-label" htmlFor="ohlcSpan1">1 hour</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" name="ohlcSpan" id="ohlcSpan2"
                               value="360"
                               onChange={this.onOhlcSpanChange}
                               checked={ohlcIntervalMins === 360}
                        />
                        <label className="form-check-label" htmlFor="ohlcSpan2">6 hours</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" name="ohlcSpan" id="ohlcSpan3"
                               value="1440"
                               onChange={this.onOhlcSpanChange}
                               checked={ohlcIntervalMins === 1440}
                        />
                        <label className="form-check-label" htmlFor="ohlcSpan3">1 day</label>
                    </div>
                </div>

                <BoxSection id="price-chart-resize-container">
                    <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} resizableElementId="price-chart-resize-container"/>
                    <div id="chart"/>
                </BoxSection>
            </Box>
        )
    }
}
