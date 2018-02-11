import React, {Component} from 'react'
import * as d3 from "d3"
//import trades from '../../../__test-data__/VenTrades'
import {convertToOhlc} from '../../../util/OhlcConverter'
import techan from 'techan-js'

class OhlcAndVolumeChart extends Component {
    constructor(props) {
        super(props)

        this.state = {
            margin: {top: 20, right: 50, bottom: 30, left: 50},
            created: false
        }
    }

    componentDidMount() {
        if (! this.state.created) {
            this.createBarChart()
        }

        this.updateBarChart()
    }

    componentDidUpdate() {
        if (! this.state.created) {
            this.createBarChart()
        }

        this.updateBarChart()
    }

    createBarChart = () => {
        const svg = d3.select(this.node)
        const g = svg.append("g")
            .attr("transform", "translate(" + this.state.margin.left + "," + this.state.margin.top + ")")

        g.append("g")
            .attr("class", "ohlc")

        g.append("g")
            .attr("class", "volume")

        g.append("g")
            .attr("class", "x axis")

        g.append("g")
            .attr("class", "y1 axis")
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", -12)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Volume")

        g.append("g")
            .attr("class", "y0 axis")
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Price in ETH")

        this.state.created = true
    }

    updateBarChart = () => {
        const {size, trades} = this.props
        const [containerWidth, containerHeight] = size

        const data = convertToOhlc(trades, 24 * 60)

        const width = containerWidth - this.state.margin.left - this.state.margin.right
        const height = containerHeight - this.state.margin.top - this.state.margin.bottom

        const x = techan.scale.financetime().range([0, width])
        const y0 = d3.scaleLinear().range([height, 0])
        const y1 = d3.scaleLinear().range([height, 0])

        const ohlc = techan.plot.ohlc()
            .xScale(x)
            .yScale(y0)

        const volume = techan.plot.volume()
            .xScale(x)
            .yScale(y1)

        const xAxis = d3.axisBottom(x)
        const y0Axis = d3.axisLeft(y0)
        const y1Axis = d3.axisRight(y1)


        x.domain(data.map(ohlc.accessor().d))

        //let yZeroStartDomain = d3.scaleLinear().domain([0, d3.max(data.map(ohlc.accessor().h))]).domain()
        let yFitDomain = techan.scale.plot.ohlc(data, ohlc.accessor()).domain()
        y0.domain(yFitDomain)

        y1.domain(techan.scale.plot.volume(data, volume.accessor().v).domain())

        const svg = d3.select(this.node)
        svg.selectAll("g.ohlc").datum(data).call(ohlc)
        svg.selectAll("g.volume").datum(data).call(volume)
        svg.selectAll("g.x.axis").call(xAxis)
        svg.selectAll("g.y0.axis").call(y0Axis)
        svg.selectAll("g.y1.axis").call(y1Axis)

        svg.selectAll("g.y1.axis").attr("transform", "translate(" + width + " ,0)")
        svg.selectAll("g.x.axis").attr("transform", "translate(0," + height + ")")
    }

    render() {
        const {size} = this.props

        return <div>
            <svg className="chart" ref={node => this.node = node}
                 width={size[0]} height={size[1]}>
            </svg>
        </div>
    }
}

export default OhlcAndVolumeChart