import React from "react"
import StatsStore from "../../stores/StatsStore"
import _ from 'lodash'
import {withRouter} from "react-router-dom"
import {withAnalytics} from '../../util/Analytics'
import {BoxSection, BoxTitle} from "../CustomComponents/Box"
import * as StatsApi from "../../apis/StatsApi"
import Plotly from "plotly.js/dist/plotly-finance"
import ReactResizeDetector from 'react-resize-detector'
import DayPicker from 'react-day-picker'
import 'react-day-picker/lib/style.css'
import '../../css/react-day-picker.css'
import DayPickerInput from 'react-day-picker/DayPickerInput'

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
            const {data, layout} = this.getDataAndLayout()

            Plotly.newPlot('dayVolumeChart', data, layout, {displayModeBar: false})
        }
    }

    getDataAndLayout() {
        const {stats, chartContainerWidth, chartContainerHeight} = this.state

        const data = [{

            y: stats.map(s => s.volumeInEth),
            x: stats.map(s => s.tokenSymbol),
            labels: stats.map(s => s.tokenName),
            hole: .5,
            type: 'bar',
            showlegend: false,
            marker: {
                color: '#3498DB',
                bgcolor: '#3498DB',
                /* size: 12,*/
                line: {
                    color: 'transparent',
                    width: 2
                }
            },
            textinfo: 'text'
        }]

        const layout = {
            width: chartContainerWidth,
            height: chartContainerHeight,
            color: '#555555',
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
            margin: {
                l: 60,
                r: 60,
                b: 60,
                t: 60,
                pad: 4
            },
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

    handleDayChange = (day) => {
    }

    handleShowOtherChange = (event) => {
    }

    handleNumDisplayTokensChange = (event) => {
    }

    render() {
        const {retrievingDayVolumeStats, retrievingDayVolumeError, stats, date, selectedDate, numDisplayTokens, includeOther} = this.state

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
                                Top <input className="form-control day-picker-num-days" type="number" value={numDisplayTokens} onChange={this.handleNumDisplayTokensChange}/>
                            </div>

                            <div className="form-inline day-picker">
                                Date: <DayPickerInput onDayChange={this.handleDayChange} value={inputDate} inputProps={{"class": "form-control"}}/>
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
                                    <label className="custom-control-label center-label" htmlFor="showOtherDayVolume">Show other</label>
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

/*
                    <div id="dayVolumeChart"/>

                    <BoxSection id="day-volume-chart-resize-container">
                        <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} resizableElementId="day-volume-chart-resize-container"/>
                        <div id="dayVolumeChart"/>
                    </BoxSection>
 */

export default withAnalytics(withRouter(DayVolume))