import React from "react"
import ReactDOM from 'react-dom'

import {format} from "d3-format"
import {timeFormat} from "d3-time-format"

import {ChartCanvas, Chart} from "react-stockcharts"
import {LineSeries} from "react-stockcharts/lib/series"
import {XAxis, YAxis} from "react-stockcharts/lib/axes"
import {CrossHairCursor, MouseCoordinateX, MouseCoordinateY,} from "react-stockcharts/lib/coordinates"

import {discontinuousTimeScaleProvider} from "react-stockcharts/lib/scale"

import {last} from "react-stockcharts/lib/utils"

class LineChartGrid extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            width: 400
        }

        this.handleWindowResize = this.handleWindowResize.bind(this)
    }

    // TODO really nasty having to do this resizing
    componentDidMount() {
        window.addEventListener("resize", this.handleWindowResize)
        this.handleWindowResize()
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize)
    }

    // TODO really nasty having to do this resizing
    handleWindowResize() {
        let minWidth = 100
        const el = ReactDOM.findDOMNode(this)
        const w = el.parentNode.clientWidth

        this.setState({
            width: Math.max(w, minWidth)
        })
    }

    render() {
        const {type, data: initialData, ratio} = this.props
        const {width} = this.state

        const {gridProps} = this.props
        const margin = {left: 20, right: 60, top: 20, bottom: 20}

        const height = 400
        const gridHeight = height - margin.top - margin.bottom
        const gridWidth = width - margin.left - margin.right

        const showGrid = true
        const yGrid = showGrid ? {innerTickSize: -1 * gridWidth} : {}
        const xGrid = showGrid ? {innerTickSize: -1 * gridHeight} : {}

        const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.date)
        const {data, xScale, xAccessor, displayXAccessor} = xScaleProvider(initialData)

        const start = xAccessor(last(data))
        const end = xAccessor(data[Math.max(0, data.length - 150)])
        const xExtents = [start, end]

        return (
            <ChartCanvas height={height}
                         ratio={ratio}
                         width={width}
                         margin={margin}
                         type={type}
                         seriesName="PPT" // TODO - should be token (is this even used)
                         data={data}
                         xScale={xScale}
                         xAccessor={xAccessor}
                         displayXAccessor={displayXAccessor}
                         xExtents={xExtents}
            >
                <Chart id={1}
                       yExtents={d => [d.high, d.low]}
                >
                    <XAxis
                        axisAt="bottom"
                        orient="bottom"
                        {...gridProps}
                        {...xGrid}
                    />
                    <YAxis
                        axisAt="right"
                        orient="right"
                        ticks={5}
                        {...gridProps}
                        {...yGrid}
                    />
                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat("%Y-%m-%d")}/>
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".8f")}/>

                    <LineSeries
                        yAccessor={d => d.close}
                        //interpolation={interpolation}
                        stroke="#0000FF"
                    />

                </Chart>

                <CrossHairCursor/>
            </ChartCanvas>

        )
    }
}

export default LineChartGrid