import React from "react"
import Plotly from 'plotly.js/dist/plotly-finance'
import {cumulativeAdd} from "../../util/CumulativeOrderVolumeAdder"
import {Box, BoxSection} from "../CustomComponents/Box"
import OrderBookStore from "../../stores/OrderBookStore"
import ReactResizeDetector from 'react-resize-detector'

export default class PlotlyDepthChart extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            bids: OrderBookStore.getBids(),
            offers: OrderBookStore.getOffers(),
        }

        this.saveBidsAndOffers = this.saveBidsAndOffers.bind(this)
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveBidsAndOffers)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveBidsAndOffers)
    }

    saveBidsAndOffers() {
        this.setState({
            bids: OrderBookStore.getBids(),
            offers: OrderBookStore.getOffers(),
        })
    }

    componentDidMount() {
        this.createChart()
    }

    componentDidUpdate() {
        this.createChart()
    }

    createChart() {
        const {bids, offers} = this.state

        Plotly.purge('depthChart')
        if (bids && bids.length > 0 || offers && offers.length > 0) {
            const {data, layout} = this.getDataAndLayout(bids, offers)

            Plotly.newPlot('depthChart', data, layout, {displayModeBar: false})
        }
    }

    getDataAndLayout(bids, offers) {
        const cumulativeBuys = cumulativeAdd(bids)
        const cumulativeSells = cumulativeAdd(offers)

        const buyTrace = {
            x: cumulativeBuys.prices,
            y: cumulativeBuys.volumes,
            fill: 'tozeroy',
            type: 'scatter',
            line: {shape: 'vh', color: '#65dd65'},
            name: 'bids',
        }

        const sellTrace = {
            x: cumulativeSells.prices,
            y: cumulativeSells.volumes,
            fill: 'tozeroy',
            type: 'scatter',
            line: {shape: 'vh', color: '#ff6565'},
            name: 'offers',
        }

        const data = [buyTrace, sellTrace]

        const layout = {
            plot_bgcolor:'transparent',
            grid: {
                color:'blue'
            },
            dragmode: 'zoom',
            showlegend: false,
            xaxis: {
                color:'#999',
                gridcolor: '#999',
                showline: false,
                //title: 'Price',
            },
            yaxis: {
                color:'#999',
                gridcolor: '#999',
                showline: false,
                //title: 'Cumulative Volume',
            },
            margin: {
                l: 50,
                r: 20,
                b: 30,
                t: 10,
                pad: 4
            }, font: {
                size: 12,
            }, height: this.props.height
        }

        return {
            data,
            layout
        }
    }

    onResize = (width, height) => {
        this.setState({
            chartContainerWidth: width,
            chartContainerHeight: height
        })
    }

    render() {
        return (
            <Box title="Order Depth Chart" className="chart-component order-depth-chart-component no-mobile">
                <BoxSection id="depth-chart-resize-container">
                    <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} resizableElementId="depth-chart-resize-container"/>
                    <div id="depthChart"/>
                </BoxSection>
            </Box>
        )
    }
}