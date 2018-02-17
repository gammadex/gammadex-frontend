import React, {Component} from 'react'
import * as d3 from "d3"
import {convertToOhlc} from '../../../util/OhlcConverter'
import techan from 'techan-js'

class OhlcAndVolumeChart extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.createBarChart()
    }

    componentDidUpdate() {
        this.createBarChart()
    }

    createBarChart = () => {
        const {size, trades} = this.props
        window.trades = trades
        const [containerWidth, containerHeight] = size

        const data = convertToOhlc(trades, 3 * 60)

        let svg = d3.select(this.node)
        svg.selectAll("*").remove()

        function zoomed() {
            xScale.zoomable().domain(d3.event.transform.rescaleX(zoomableInit).domain())
            draw()
        }

        function draw() {
            svg.select("g.x-axis").call(xAxis)
            svg.select("g.y-axis").call(yPriceAxis)
            svg.select("g.y-axis.volume").call(yVolumeAxis)
            svg.select("g.candlestick").call(candlestick.refresh)
            svg.select("g.volume").call(volume.refresh)
            svg.select("g.crosshair.ohlc").call(ohlcCrosshair.refresh)
            svg.select("g.crosshair.volume").call(volumeCrosshair.refresh)

            svg.select("g.x-grid-price")
                .call(OhlcAndVolumeChart.makeXGridLines(xScale)
                    .tickSize(-dim.ohlc.height)
                    .tickFormat(""))

            svg.select("g.y-grid-price")
                .call(OhlcAndVolumeChart.makeYGridLines(yPriceScale)
                    .tickSize(-dim.plot.width)
                    .tickFormat(""))

            svg.select("g.x-grid-volume")
                .call(OhlcAndVolumeChart.makeXGridLines(xScale)
                    .tickSize(-dim.volume.height)
                    .tickFormat(""))

            svg.select("g.y-grid-volume")
                .call(OhlcAndVolumeChart.makeYGridLines(yVolumeScale, 2)
                    .tickSize(-dim.plot.width)
                    .tickFormat(""))
        }

        const dim = {
            width: containerWidth,
            height: containerHeight,
            margin: {top: 20, right: 100, bottom: 30, left: 20},
            separator: {height: 20}
        }

        dim.plot = {
            width: dim.width - dim.margin.left - dim.margin.right,
            height: dim.height - dim.margin.top - dim.margin.bottom
        }

        const volumeHeightRatio = 1 / 6
        const volumeHeight = dim.plot.height * volumeHeightRatio
        const ohlcHeight = dim.plot.height - volumeHeight - dim.separator.height

        dim.ohlc = {
            top: 0,
            height: ohlcHeight
        }

        dim.volume = {
            top: dim.ohlc.top + dim.ohlc.height + dim.separator.height,
            height: volumeHeight,
        }
        dim.volume.bottom = dim.volume.top + dim.volume.height

        const zoom = d3.zoom()
            .on("zoom", zoomed)

        const xScale = techan.scale.financetime()
            .range([0, dim.plot.width])

        const yPriceScale = d3.scaleLinear()
            .range([dim.ohlc.height, 0])

        const yVolumeScale = d3.scaleLinear()
            .range([dim.volume.height, 0])

        const candlestick = techan.plot.candlestick()
            .xScale(xScale)
            .yScale(yPriceScale)

        const volume = techan.plot.volume()
            .accessor(candlestick.accessor())
            .xScale(xScale)
            .yScale(yVolumeScale)

        const xAxis = d3.axisBottom(xScale)

        const yPriceAxis = d3.axisRight(yPriceScale)

        const yVolumeAxis = d3.axisRight(yVolumeScale)
            .ticks(3)
            .tickFormat(d3.format(".2f"))

        const timeAnnotation = techan.plot.axisannotation()
            .axis(xAxis)
            .orient('bottom')
            .format(d3.timeFormat("%Y-%m-%d %H:%M"))
            .width(150)
            .height(18)
            .translate([0, dim.plot.height])

        const ohlcAnnotation = techan.plot.axisannotation()
            .axis(yPriceAxis)
            .orient('right')
            .format(d3.format(',.8f'))
            .width(150)
            .translate([xScale(1), 0])

        const ohlcCrosshair = techan.plot.crosshair()
            .xScale(timeAnnotation.axis().scale())
            .yScale(ohlcAnnotation.axis().scale())
            .xAnnotation(timeAnnotation)
            .yAnnotation([ohlcAnnotation])
            .verticalWireRange([0, dim.plot.height])

        const volumeAnnotation = techan.plot.axisannotation()
            .axis(yVolumeAxis)
            .orient("right")
            .width(150)
            .translate([xScale(1), 0])

        const timeAnnotationVol = techan.plot.axisannotation()
            .axis(xAxis)
            .orient('bottom')
            .format(d3.timeFormat("%Y-%m-%d %H:%M"))
            .width(150)
            .height(18)
            .translate([0, dim.volume.height])

        const volumeCrosshair = techan.plot.crosshair()
            .xScale(timeAnnotationVol.axis().scale())
            .yScale(volumeAnnotation.axis().scale())
            .xAnnotation(timeAnnotationVol)
            .yAnnotation([volumeAnnotation])
            .verticalWireRange([-dim.volume.top, dim.plot.height])

        const defs = svg.append("defs")

        defs.append("clipPath")
            .attr("id", "ohlcClip")
            .attr("class", "ohlcClip")
            .append("rect")
            .attr("class", "ohlcClipRect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", dim.plot.width)
            .attr("height", dim.ohlc.height)

        const g = svg.append("g")
            .attr("class", "main")
            .attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")")

        g.append("g")
            .attr("class", "x-axis")

        g.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + xScale(1) + ",0)")

        const ohlcSelection = g.append("g")
            .attr("class", "ohlc")
            .attr("transform", "translate(0,0)")

        ohlcSelection.append("g")
            .attr("class", "x-grid-price")
            .attr("transform", "translate(0," + dim.ohlc.height + ")")

        ohlcSelection.append("g")
            .attr("class", "y-grid-price")

        ohlcSelection.append("g")
            .attr("class", "candlestick")
            .attr("clip-path", "url(#ohlcClip)")

        ohlcSelection.append("g")
            .attr("class", "x-grid-volume")
            .attr("transform", "translate(0," + dim.volume.bottom + ")")

        ohlcSelection.append("g")
            .attr("class", "y-grid-volume")
            .attr("transform", "translate(0," + dim.volume.top + ")")

        ohlcSelection.append("g")
            .attr("class", "volume")
            .attr("clip-path", "url(#ohlcClip)")
            .attr("transform", "translate(0," + dim.volume.top + ")")

        ohlcSelection.append("g")
            .attr("class", "y-axis volume")
            .attr("transform", "translate(" + (dim.plot.width) + "," + dim.volume.top + ")")

        g.append('g')
            .attr("class", "crosshair ohlc")

        g.append('g')
            .attr("class", "crosshair volume")
            .attr("transform", "translate(0," + dim.volume.top + ")")

        xScale.domain(techan.scale.plot.time(data).domain())
        yPriceScale.domain(techan.scale.plot.ohlc(data).domain())
        yVolumeScale.domain(techan.scale.plot.volume(data).domain())

        g.select("g.candlestick").datum(data).call(candlestick)

        g.select("g.volume").datum(data).call(volume)

        g.select("g.crosshair.ohlc").call(ohlcCrosshair).call(zoom)

        g.select("g.crosshair.volume").call(volumeCrosshair).call(zoom)

        g.select("g.x-axis")
            .attr("transform", "translate(0," + dim.plot.height + ")")

        ohlcSelection.append('text')
            .attr("class", "chart-subtitle")
            .attr("x", 10)
            .attr("y", 20)
            .text("Price");

        ohlcSelection.append('text')
            .attr("class", "chart-subtitle")
            .attr("x", 10)
            .attr("y", dim.volume.top + 20)
            .text("Volume");

        const zoomableInit = xScale.zoomable().domain([0, data.length]).copy()

        draw()
    }

    static makeXGridLines(x, num = 5) {
        return d3.axisBottom(x)
            .ticks(num)
    }

    static makeYGridLines(y0, num = 10) {
        return d3.axisLeft(y0)
            .ticks(num)
    }

    render() {
        const {size} = this.props

        return <div>
            Test
            <svg className="chart" ref={node => this.node = node}
                 width={size[0]} height={size[1]}>
            </svg>
        </div>
    }
}

export default OhlcAndVolumeChart