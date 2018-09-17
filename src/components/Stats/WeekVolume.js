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
import '../../css/react-day-picker-week.css'
import DayPickerInput from 'react-day-picker/DayPickerInput'
import * as StatsActions from "../../actions/StatsActions"
import {Input} from "reactstrap"
import * as StatsVolumeChartUtil from "../../util/StatsVolumeChartUtil"
import moment from 'moment'

function getWeekDays(weekStart) {
    const days = [weekStart]
    for (let i = 1; i < 7; i += 1) {
        days.push(
            moment(weekStart)
                .add(i, 'days')
                .toDate()
        )
    }
    return days
}

class WeekVolume extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            ...StatsStore.getWeekVolume(),
            chartContainerWidth: 100,
            chartContainerHeight: 100,
            hoverRange: undefined,
            selectedDays: [],
        }

        this.statsStoreUpdated = this.statsStoreUpdated.bind(this)
    }

    componentWillMount() {
        StatsStore.on("change", this.statsStoreUpdated)
        StatsApi.requestWeekVolume()
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
        this.setState(StatsStore.getWeekVolume())
    }

    createChart() {
        const {stats, chartContainerWidth, chartContainerHeight} = this.state

        console.log("c", stats, chartContainerWidth, chartContainerHeight)
        if (stats && stats.length > 0 && chartContainerWidth > 0 && chartContainerHeight > 0) {
            Plotly.purge('weekVolumeChart')
            const {data, layout} = StatsVolumeChartUtil.getDataAndLayout(stats, chartContainerWidth, chartContainerHeight, '#00bc8c')
        console.log("ccc")

            Plotly.newPlot('weekVolumeChart', data, layout, {displayModeBar: false})
        }
    }

    onResize = (width, height) => {
        this.setState({
            chartContainerWidth: width,
            chartContainerHeight: height
        })
    }

    handleWeekChange = (day) => {
        const {selectedDate} = this.state

        if (day.toString('yyyy-MM-dd') !== selectedDate.toString('yyyy-MM-dd')) {
            StatsApi.changeWeekVolumeWeekThenRefresh(day)
        }
    }

    handleShowOtherChange = (event) => {
        StatsActions.changeWeeklyVolumeShowOther(event.target.checked)
    }

    handleNumDisplayTokensChange = (event) => {
        StatsActions.changeWeeklyVolumeDisplayNum(parseInt(event.target.value))
    }

    handleDayChange = date => {
        this.setState({
            selectedDays: getWeekDays(StatsVolumeChartUtil.getWeekRange(date).from),
        })
    }

    handleDayEnter = date => {
        this.setState({
            hoverRange: StatsVolumeChartUtil.getWeekRange(date),
        })
    }

    handleDayLeave = () => {
        this.setState({
            hoverRange: undefined,
        })
    }

    handleWeekClick = (weekNumber, days, e) => {
        this.setState({
            selectedDays: days,
        })
    }

    render() {
        const {retrievingWeekVolumeStats, retrievingWeekVolumeError, stats, date, selectedDate, displayNum, includeOther, hoverRange, selectedDays} = this.state

        const daysAreSelected = selectedDays.length > 0

        const modifiers = {
            hoverRange,
            selectedRange: daysAreSelected && {
                from: selectedDays[0],
                to: selectedDays[6],
            },
            hoverRangeStart: hoverRange && hoverRange.from,
            hoverRangeEnd: hoverRange && hoverRange.to,
            selectedRangeStart: daysAreSelected && selectedDays[0],
            selectedRangeEnd: daysAreSelected && selectedDays[6],
        }

        const inputDate = selectedDate.toString('yyyy-MM-dd')

        return (
            <div id="week-volume-container" className="week-volume-component chart-component">
                <div className="card">
                    <div className="card-header">
                        <BoxTitle title="Top Tokens Volume By Week"
                                  componentId="week-volume-container"
                        />
                    </div>

                    <div className="full-height">
                        <div className="token-stats-inputs">
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

                            <div className="form-inline day-picker week-picker">
                                <span className="mr-2">Date</span>
                                <DayPickerInput
                                    onDayChange={this.handleWeekChange}
                                    dayPickerProps={{
                                        disabledDays: StatsVolumeChartUtil.statsWeekRange(),
                                        selectedDays: selectedDays,
                                        showOutsideDays: true,
                                        modifiers: modifiers,
                                        onDayClick: this.handleDayChange,
                                        onDayMouseEnter: this.handleDayEnter,
                                        onDayMouseLeave: this.handleDayLeave,
                                        onWeekClick: this.handleWeekClick
                                    }}
                                    value={inputDate}
                                    inputProps={{"className": "form-control"}}/>
                            </div>

                            <div className="form-inline">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox"
                                           className="custom-control-input"
                                           id="showOtherWeekVolume"
                                           value="true"
                                           checked={includeOther}
                                           onChange={this.handleShowOtherChange}
                                    />
                                    <label className="custom-control-label center-label" htmlFor="showOtherWeekVolume">Include others total</label>
                                </div>
                            </div>
                        </div>

                        <BoxSection id="week-volume-chart-resize-container">
                            <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} resizableElementId="week-volume-chart-resize-container"/>
                            <div id="weekVolumeChart"/>
                        </BoxSection>
                    </div>

                </div>
            </div>
        )
    }
}

export default withAnalytics(withRouter(WeekVolume))