import React from "react"
import Plotly from 'plotly.js/dist/plotly-finance'
//import trades from '../../__test-data__/VenTrades'
import {convertToOhlc, getPricesAndDates} from "../../util/OhlcConverter"
import {getInitialDateRange} from "../../util/ChartUtil"

export default class PlotlyChart extends React.Component {
    state = {
        ohlcIntervalMins: 60,
        chartElements: {
            ohlc: true,
            volume: true,
            price: false
        }
    }

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {trades} = this.props

        if (trades && trades.length) {
            const {data, layout} = this.getDataAndLayout()

            Plotly.plot('chart', data, layout, {displayModeBar: false})
        }
    }

    componentDidUpdate() {
        const {trades} = this.props

        if (trades && trades.length) {
            const {data, layout} = this.getDataAndLayout()

            Plotly.newPlot('chart', data, layout, {displayModeBar: false})
        }
    }

    getDataAndLayout = () => {
        const {ohlcIntervalMins, chartElements} = this.state
        const {trades} = this.props // for testing comment this line out and remove comment from VenTrades import

        const ohlc = convertToOhlc(trades, ohlcIntervalMins, 'yyyy-mm-dd HH:MM')
        const prices = getPricesAndDates(trades, 'yyyy-mm-dd HH:MM:ss')
        const dateRange = getInitialDateRange(ohlcIntervalMins, ohlc.date[0], ohlc.date[ohlc.date.length - 1])

        const ohlcTrace = {
            x: ohlc.date,
            close: ohlc.close,
            high: ohlc.high,
            low: ohlc.low,
            open: ohlc.open,

            increasing: {line: {color: 'green'}},
            decreasing: {line: {color: 'red'}},

            type: 'candlestick',
            xaxis: 'x',
            yaxis: 'y'
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
                opacity: 0.7,
            },
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
        }

        const data = []
        if (chartElements.volume) {
            data.push(volumeTrace)
        }
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
                title: 'Time',
                //autorange: true,
                range: dateRange
            },
            yaxis: {
                title: 'Price',
                autorange: true,
            },
            yaxis2: {
                title: 'Volume',
                overlaying: 'y',
                side: 'right'
            },
            margin: {
                l: 80,
                r: 80,
                b: 50,
                t: 20,
                pad: 4
            },
        }

        return {
            data, layout
        }
    }

    onOhlcSpanChange = (event) => {
        const mins = parseInt(event.target.value)

        this.setState({
            ohlcIntervalMins: mins
        })
    }

    onChartElementsChange = (event) => {
        let elementName = event.target.value
        let elementEnabled = event.target.checked

        this.setState((prevState) => {
            const {chartElements: prevChartElements} = prevState
            const chartElements = Object.assign({}, prevChartElements, {[elementName]: elementEnabled})

            if (chartElements['ohlc'] || chartElements['volume'] || chartElements['price']) { // at least one needs to be visible
                return {
                    chartElements
                }
            } else {
                return {}
            }
        })
    }

    render() {
        const {chartElements, ohlcIntervalMins} = this.state

        return <div>
            <div className="row">
                <div className="col-lg-12">
                    <div className="float-left">
                        <form className="form-inline">
                            <div className="form-check mb-2 mr-sm-2">
                                <input className="form-check-input" type="checkbox" id="ohlc" value="ohlc"
                                       onChange={this.onChartElementsChange}
                                       checked={chartElements.ohlc}
                                />
                                <label className="form-check-label" htmlFor="ohlc">
                                    OHLC
                                </label>
                            </div>

                            <div className="form-check mb-2 mr-sm-2">
                                <input className="form-check-input" type="checkbox" id="price" value="price"
                                       onChange={this.onChartElementsChange}
                                       checked={chartElements.price}
                                />
                                <label className="form-check-label" htmlFor="price">
                                    Price
                                </label>
                            </div>

                            <div className="form-check mb-2 mr-sm-2">
                                <input className="form-check-input" type="checkbox" id="volume" value="volume"
                                       onChange={this.onChartElementsChange}
                                       checked={chartElements.volume}
                                />
                                <label className="form-check-label" htmlFor="volume">
                                    Volume
                                </label>
                            </div>
                        </form>
                    </div>

                    <div className="float-right align-middle">
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
                </div>
            </div>

            <div className="row">
                <div className="col-lg-12">
                    <div id="chart" ref={node => this.node = node}/>
                </div>
            </div>
        </div>
    }
}
