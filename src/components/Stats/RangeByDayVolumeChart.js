import React from "react"
import StatsStore from "../../stores/StatsStore"
import {withRouter} from "react-router-dom"
import {withAnalytics} from '../../util/Analytics'
import {BoxSection, BoxTitle} from "../CustomComponents/Box"
import * as StatsApi from "../../apis/StatsApi"
import Plotly from "plotly.js/dist/plotly-finance"
import ReactResizeDetector from 'react-resize-detector'
import _ from 'lodash'
import * as StatsVolumeChartUtil from "../../util/StatsVolumeChartUtil"
import {Input} from "reactstrap"
import DayPickerInput from 'react-day-picker/DayPickerInput'
import * as StatsActions from "../../actions/StatsActions"
import WebSocketStore from "../../stores/WebSocketStore"

class RangeByDayVolumeChart extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            ...StatsStore.getRangeByDayVolume(),
            chartContainerWidth: 100,
            chartContainerHeight: 100,
        }

        this.statsStoreUpdated = this.statsStoreUpdated.bind(this)
        this.ensureChartDataPresent = this.ensureChartDataPresent.bind(this)
        this.websocketChanged = this.websocketChanged.bind(this)
        this.requested = false
    }

    componentWillUnmount() {
        StatsStore.removeListener("change", this.statsStoreUpdated)
        WebSocketStore.removeListener("change", this.websocketChanged)
    }

    componentDidMount() {
        StatsStore.on("change", this.statsStoreUpdated)
        WebSocketStore.on("change", this.websocketChanged)
        this.createChart()
        this.ensureChartDataPresent()
    }

    componentDidUpdate() {
        this.ensureChartDataPresent()
        this.createChart()
    }

    statsStoreUpdated() {
        this.setState(StatsStore.getRangeByDayVolume())
    }

    ensureChartDataPresent() {
        const {retrievingStats, retrievedStats, retrieveError/*, websocketConnected*/} = this.state
        const websocketConnected = WebSocketStore.getConnectionState().connected

        if (!this.requested && !retrievingStats && !retrievedStats && !retrieveError && websocketConnected) {
            this.requested = true
            setTimeout(() => StatsApi.requestRangeByDayVolume(), 1)
        }
    }

    websocketChanged() {
        this.setState({websocketConnected: WebSocketStore.getConnectionState().connected})
    }

    createChart() {
        const {stats, chartContainerWidth, chartContainerHeight} = this.state

        Plotly.purge('stackedVolumeChart')
        if (stats && stats.dates && stats.dates.length > 0 && chartContainerWidth > 0 && chartContainerHeight > 0) {
            const {data, layout} = this.getDataAndLayout(stats, chartContainerWidth, chartContainerHeight)

            Plotly.newPlot('stackedVolumeChart', data, layout, {displayModeBar: false})
        }
    }

    getDataAndLayout(stats, chartContainerWidth, chartContainerHeight) {
        const x = _.map(stats.dates, d => new Date(d))

        const traces = _.transform(stats.tokens, (acc, tokenStats) => {
            const {token, volumes} = tokenStats

            const trace = {
                x,
                y: volumes,
                name: token.tokenName + " (" + token.tokenSymbol + ")",
                type: 'scatter'
            }
            acc.push(trace)
        }, [])
        let data = traces

        const layout = {
            width: chartContainerWidth,
            height: chartContainerHeight,
            plot_bgcolor: 'transparent',
            xaxis: {
                linecolor: '#555555',
                gridcolor: 'transparent',
                color: '#ced2d5',
            },
            yaxis: {
                linecolor: 'transparent',
                gridcolor: '#555555',
                color: '#ced2d5',
                zeroline: false,
            },
            color: '#555555',
            margin: {
                l: 60,
                r: 60,
                b: 40,
                t: 20,
                pad: 4
            },
            legend: {
                bgcolor: 'transparent',
                font: {
                    color: '#CCCCCC',
                }
            }
        }

        return {
            data, layout
        }
    }

    onResize = (width, height) => {
        this.setState({
            chartContainerWidth: width,
            chartContainerHeight: height
        })
    }

    handleFromDayChange = (day) => {
        const {selectedFromDate} = this.state

        if (day && day.toString('yyyy-MM-dd') !== selectedFromDate.toString('yyyy-MM-dd')) {
            StatsApi.changeRangeByDayFromDayThenRefresh(day)
        }
    }

    handleToDayChange = (day) => {
        const {selectedToDate} = this.state

        if (day && day.toString('yyyy-MM-dd') !== selectedToDate.toString('yyyy-MM-dd')) {
            StatsApi.changeRangeByDayToDayThenRefresh(day)
        }
    }

    handleNumDisplayTokensChange = (event) => {
        StatsActions.changeRangeByDayVolumeDisplayNum(parseInt(event.target.value))
    }

    render() {
        const {selectedFromDate, selectedToDate, displayNum, rangeTooWideDays} = this.state

        const inputFromDate = selectedFromDate.toString('yyyy-MM-dd')
        const inputToDate = selectedToDate.toString('yyyy-MM-dd')
        const dateRangeErrorClass = rangeTooWideDays > 0 ? " is-invalid " : ""
        const dateRangeTextErrorClass =  rangeTooWideDays > 0 ? " alert-danger " : " alert-secondary "

        return (
            <div id="stacked-volume-container" className="stacked-volume-component chart-component">
                <div className="card">
                    <div className="card-header">
                        <BoxTitle title="Top Tokens ETH Volume By Date Range"
                                  componentId="stacked-volume-container"
                        />
                    </div>

                    <div className="token-stats-inputs no-mobile">
                        <div className="form-inline day-picker">
                            <span className="mr-2 no-mobile">From date</span>
                            <DayPickerInput
                                onDayChange={this.handleFromDayChange}
                                dayPickerProps={{disabledDays: StatsVolumeChartUtil.statsDayRange()}}
                                value={inputFromDate}
                                inputProps={{"className": "form-control mr-2 " + dateRangeErrorClass}}/>

                            <span className="mr-2 ml-2 no-mobile">To date</span>
                            <DayPickerInput
                                onDayChange={this.handleToDayChange}
                                dayPickerProps={{disabledDays: StatsVolumeChartUtil.statsDayRange()}}
                                value={inputToDate}
                                inputProps={{"className": "form-control " + dateRangeErrorClass}}/>

                            <div className={" alert ml-2 mb-0 p-1 no-mobile " + dateRangeTextErrorClass}><i className="fas fa-clock"/> Max range 31 days</div>
                        </div>

                        <div className="form-inline">
                            <span className="mr-2 no-mobile">Top</span>
                            <Input type="select"
                                   value={displayNum}
                                   onChange={this.handleNumDisplayTokensChange}>
                                <option>5</option>
                                <option>10</option>
                                <option>20</option>
                            </Input>
                            <span className="ml-2 no-mobile">tokens</span>
                        </div>
                    </div>

                    <BoxSection id="stacked-volume-chart-resize-container">
                        <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} resizableElementId="stacked-volume-chart-resize-container"/>
                        <div id="stackedVolumeChart"/>
                    </BoxSection>
                </div>
            </div>
        )
    }
}

export default withAnalytics(withRouter(RangeByDayVolumeChart))