import React from "react"
import StatsStore from "../../stores/StatsStore"
import _ from 'lodash'
import {withRouter} from "react-router-dom"
import {withAnalytics} from '../../util/Analytics'
import {BoxSection, BoxTitle} from "../CustomComponents/Box"
import * as StatsApi from "../../apis/StatsApi"
import Plotly from "plotly.js/dist/plotly-finance"
import ReactResizeDetector from 'react-resize-detector'
import 'react-day-picker/lib/style.css'
import '../../css/react-day-picker.css'
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
        }

        this.statsStoreUpdated = this.statsStoreUpdated.bind(this)
    }

    componentWillMount() {
        StatsStore.on("change", this.statsStoreUpdated)
        StatsApi.requestDayVolume()
    }

    componentWillUnmount() {
        StatsStore.removeListener("change", this.statsStoreUpdated)
    }

    componentDidMount() {
        this.createChart()
    }

    componentDidUpdate() {
        this.createChart()
    }

    statsStoreUpdated() {
        this.setState(StatsStore.getDayVolume())
    }

    createChart() {
        const {stats, chartContainerWidth, chartContainerHeight} = this.state

        if (stats && stats.length > 0 && chartContainerWidth > 0 && chartContainerHeight > 0) {
            Plotly.purge('dayVolumeChart')
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

        if (day.toString('yyyy-MM-dd') !== selectedDate.toString('yyyy-MM-dd')) {
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
        const {retrievingDayVolumeStats, retrievingDayVolumeError, stats, date, selectedDate, displayNum, includeOther} = this.state

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
                            <div className="form-inline">

                                <span className="mr-2">Top</span>

                                <Input type="select" i
                                       value={displayNum}
                                       onChange={this.handleNumDisplayTokensChange}>
                                    <option>5</option>
                                    <option>10</option>
                                    <option>20</option>
                                </Input>

                                <span className="ml-2">tokens</span>

                            </div>

                            <div className="form-inline day-picker">
                                <span className="mr-2">Date</span> <DayPickerInput  onDayChange={this.handleDayChange} value={inputDate} inputProps={{"class": "form-control"}}/>
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
                                    <label className="custom-control-label center-label" htmlFor="showOtherDayVolume">Include others total</label>
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