// from https://raw.githubusercontent.com/rrag/react-stockcharts-examples2/master/examples/CandleStickChartWithDarkTheme/src/Chart.js


import React from "react"
import PropTypes from "prop-types"

import { format } from "d3-format"
import { timeFormat } from "d3-time-format"

import { min, max } from "d3-array"
import { scaleTime } from "d3-scale"
import { utcDay, utcHour, timeHour, utcMinute } from "d3-time"

import ReactChartType from "./ReactChartType"

import { ChartCanvas, Chart, ZoomButtons } from "react-stockcharts"
import {
    BarSeries,
    CandlestickSeries,
    LineSeries,
    CircleMarker,
    ScatterSeries
} from "react-stockcharts/lib/series"
import { XAxis, YAxis } from "react-stockcharts/lib/axes"
import {
    CrossHairCursor,
    EdgeIndicator,
    CurrentCoordinate,
    MouseCoordinateX,
    MouseCoordinateY,
} from "react-stockcharts/lib/coordinates"

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale"
import {
    OHLCTooltip
} from "react-stockcharts/lib/tooltip"
import { fitWidth } from "react-stockcharts/lib/helper"
import { last, timeIntervalBarWidth } from "react-stockcharts/lib/utils"
import { HoverTooltip } from "react-stockcharts/lib/tooltip"

const dateFormat = timeFormat("%Y-%m-%d")
const numberFormat = format(".8f")

function tooltipContent() {
    return ({ currentItem, xAccessor }) => {
        return {
            x: dateFormat(xAccessor(currentItem)),
            y: [
                {
                    label: "open",
                    value: currentItem.open && numberFormat(currentItem.open)
                },
                {
                    label: "high",
                    value: currentItem.high && numberFormat(currentItem.high)
                },
                {
                    label: "low",
                    value: currentItem.low && numberFormat(currentItem.low)
                },
                {
                    label: "close",
                    value: currentItem.close && numberFormat(currentItem.close)
                },
                {
                    label: "volume",
                    value: currentItem.volume && numberFormat(currentItem.volume)
                }
            ]
                .filter(line => line.value)
        }
    }
}

class ChartRenderer extends React.Component {

    constructor(props) {
        super(props)
        this.handleReset = this.handleReset.bind(this)
    }

    componentWillMount() {
        this.setState({
            suffix: 1
        })
    }

    handleReset() {
        this.setState({
            suffix: this.state.suffix + 1
        })
    }

    render() {
        const height = 200
        const { type, data: initialData, containerWidth, containerHeight, ratio, chartType } = this.props

        const priceChartHeightPct = 0.55
        const priceChartHeight = Math.floor(containerHeight * priceChartHeightPct)

        const volumeChartHeightPct = 0.2
        const volumeChartHeight = Math.floor(containerHeight * volumeChartHeightPct)

        const margin = { left: 20, right: 60, top: 10, bottom: 10 }

        const gridHeight = height - margin.top - margin.bottom
        const gridWidth = containerWidth - margin.left - margin.right

        const showGrid = false
        const yGrid = showGrid ? { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.2 } : {}
        const xGrid = showGrid ? { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.2 } : {}
        const calculatedData = initialData
        const xScaleProvider = discontinuousTimeScaleProvider
            .inputDateAccessor(d => d.date)
        const {
            data,
            xScale,
            xAccessor,
            displayXAccessor,
        } = xScaleProvider(calculatedData)

        const start = xAccessor(last(data))
        const end = xAccessor(data[Math.max(0, data.length - 150)])
        const xExtents = [start, end]

        let lineSeries = null
        let volumeBarFill = '#808080'

        if (chartType === ReactChartType.LINE) {
            lineSeries = <LineSeries
                yAccessor={d => d.close}
                strokeDasharray="Solid" />
            volumeBarFill = d => d.close > d.open ? "#00ffcc" : "#ff7970"
        }

        let candlestickSeries = null
        if (chartType === ReactChartType.CANDLESTICK) {
            candlestickSeries = <CandlestickSeries
                stroke={d => d.close > d.open ? "#00ffcc" : "#ff7970"}
                wickStroke={d => d.close > d.open ? "#00ffcc" : "#ff7970"}
                fill={d => d.close > d.open ? "#00ffcc" : "#ff7970"} />
        }

        return (
            <ChartCanvas height={containerHeight}
                width={containerWidth}
                ratio={ratio}
                margin={margin}
                type={type}
                seriesName={"token" + this.state.suffix}

                mouseMoveEvent={true}
                panEvent={true}
                zoomEvent={false}
                clamp={false}

                data={data}
                xScale={xScale}
                xAccessor={xAccessor}
                displayXAccessor={displayXAccessor}
                xExtents={xExtents}
            >

                <Chart id={1} height={priceChartHeight}
                    yExtents={[d => [d.high, d.low]]}
                    padding={{ top: 10, bottom: 20 }}
                >
                    <YAxis axisAt="right" orient="right" ticks={5} {...yGrid} inverted={true}
                        stroke="#C0C0C0" tickStroke="#C0C0C0" />
                    <XAxis axisAt="bottom" orient="bottom" showTicks={true} ticks={3} outerTickSize={0}
                        stroke="#C0C0C0" tickStroke="#C0C0C0" />

                    {candlestickSeries}
                    {lineSeries}

                    {/* <OHLCTooltip ohlcFormat={format(".8f")} volumeFormat={format(".3f")} textFill={'#C0C0C0'} forChart={1} origin={[-40, -10]} /> */}

                    <HoverTooltip
                        chartId={1}
                        tooltipContent={tooltipContent()}
                        fontSize={15}
                    />

                </Chart>
                <Chart id={2}
                    yExtents={d => d.volume}
                    height={volumeChartHeight} origin={(w, h) => [0, priceChartHeight + 20]}>
                    <YAxis axisAt="right" orient="right" ticks={2} tickFormat={format(".3f")}
                        stroke='#C0C0C0' tickStroke="#C0C0C0" />
                    <BarSeries
                        yAccessor={d => d.volume}
                        fill={volumeBarFill}
                    />

                    <ZoomButtons
                        size={[30, 24]}
                        heightFromBase={30}
                        onReset={this.handleReset}
                    />
                </Chart>


            </ChartCanvas>
        )
    }
}
ChartRenderer.propTypes = {
    data: PropTypes.array.isRequired,
    width: PropTypes.number.isRequired,
    ratio: PropTypes.number.isRequired,
    type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
}

ChartRenderer.defaultProps = {
    type: "hybrid",
}

export default fitWidth(ChartRenderer)