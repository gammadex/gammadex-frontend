import React from "react"
import StatsStore from "../../stores/StatsStore"
import WebSocketStore from "../../stores/WebSocketStore"
import _ from 'lodash'
import {withRouter} from "react-router-dom"
import {withAnalytics} from '../../util/Analytics'
import {BoxSection, BoxTitle} from "../CustomComponents/Box"
import * as StatsApi from "../../apis/StatsApi"
import Plotly from "plotly.js/dist/plotly-finance"
import ReactResizeDetector from 'react-resize-detector'
import 'react-day-picker/lib/style.css'
//import '../../css/react-day-picker.css'
import DayPickerInput from 'react-day-picker/DayPickerInput'
import * as StatsActions from "../../actions/StatsActions"
import {Input} from "reactstrap"
import * as StatsVolumeChartUtil from "../../util/StatsVolumeChartUtil"

class DayVolume extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            ...StatsStore.getDayVolume(),
            chartContainerWidth: 100,
            chartContainerHeight: 100,
            websocketConnected: WebSocketStore.getConnectionState().connected
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
        this.setState(StatsStore.getDayVolume())
    }

    ensureChartDataPresent() {
        const {retrievingStats, retrievedStats, retrieveError, websocketConnected} = this.state

        if (!this.requested && !retrievingStats && !retrievedStats && !retrieveError && websocketConnected) {
            this.requested = true
            setTimeout(() => StatsApi.requestDayVolume(), 1)
        }
    }

    websocketChanged() {
        this.setState({websocketConnected: WebSocketStore.getConnectionState().connected})
    }

    createChart() {
        const {stats, chartContainerWidth, chartContainerHeight} = this.state

        Plotly.purge('dayVolumeChart')
        if (stats && stats.length > 0 && chartContainerWidth > 0 && chartContainerHeight > 0) {
            const {data, layout} = StatsVolumeChartUtil.getDataAndLayout(stats, chartContainerWidth, chartContainerHeight)

            Plotly.newPlot('dayVolumeChart', data, layout, {displayModeBar: false})
        }
    }

    onResize = (width, height) => {
        this.setState({
            chartContainerWidth: width,
            chartContainerHeight: height
        })
    }

    handleDayChange = (day) => {
        const {selectedDate} = this.state

        if (day && day.toString('yyyy-MM-dd') !== selectedDate.toString('yyyy-MM-dd')) {
            StatsApi.changeDayVolumeDayThenRefresh(day)
        }
    }

    handleShowOtherChange = (event) => {
        StatsActions.changeDailyVolumeShowOther(event.target.checked)
    }

    handleNumDisplayTokensChange = (event) => {
        StatsActions.changeDailyVolumeDisplayNum(parseInt(event.target.value))
    }

    render() {
        const {retrievingStats, retrieveError, stats, date, selectedDate, displayNum, includeOther} = this.state

        const inputDate = selectedDate.toString('yyyy-MM-dd')

        return (
            <div id="day-volume-container" className="day-volume-component chart-component">
                <div className="card">
                    <div className="card-header">
                        <BoxTitle title="Top Tokens Volume By Day"
                                  componentId="day-volume-container"
                        />
                    </div>

                    <div className="full-height">
                        <div className="token-stats-inputs">
                            <div className="form-inline day-picker">
                                <span className="mr-2">Date</span>
                                <DayPickerInput
                                    onDayChange={this.handleDayChange}
                                    dayPickerProps={{disabledDays: StatsVolumeChartUtil.statsDayRange()}}
                                    value={inputDate}
                                    inputProps={{"className": "form-control"}}/>
                            </div>

                            <div className="form-inline">
                                <span className="mr-2">Top</span>

                                <Input type="select"
                                       value={displayNum}
                                       onChange={this.handleNumDisplayTokensChange}>
                                    <option>5</option>
                                    <option>10</option>
                                    <option>20</option>
                                </Input>

                                <span className="ml-2">tokens</span>
                            </div>

                            <div className="form-inline">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox"
                                           className="custom-control-input"
                                           id="showOtherDayVolume"
                                           value="true"
                                           checked={includeOther}
                                           onChange={this.handleShowOtherChange}
                                    />
                                    <label className="custom-control-label center-label" htmlFor="showOtherDayVolume">Include other tokens</label>
                                </div>
                            </div>
                        </div>

                        <BoxSection id="day-volume-chart-resize-container">
                            <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} resizableElementId="day-volume-chart-resize-container"/>
                            <div id="dayVolumeChart"/>
                        </BoxSection>
                    </div>

                </div>
            </div>
        )
    }
}

export default withAnalytics(withRouter(DayVolume))