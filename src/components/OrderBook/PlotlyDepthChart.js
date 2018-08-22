import React from "react"
import Plotly from 'plotly.js/dist/plotly-finance'
import {cumulativeAdd} from "../../util/CumulativeOrderVolumeAdder"
import {Box, BoxSection, BoxTitle} from "../CustomComponents/Box"
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
        const cumulativeBuys = cumulativeAdd(bids, 'bids')
        const cumulativeSells = cumulativeAdd(offers, 'offers')

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
            plot_bgcolor: 'transparent',
            grid: {
                color: 'blue'
            },
            dragmode: 'zoom',
            showlegend: false,
            xaxis: {
                color: '#9B9B9B',
                gridcolor: '#9B9B9B',
                linecolor: '#9B9B9B',
                showline: true,
                //title: 'Price',
                type: 'log',
                autotick: false,
                visible: true,
                showgrid: false,
                zeroline: false,
                linewidth: 1,
            },
            yaxis: {
                color: '#9B9B9B',
                gridcolor: '#9B9B9B',
                linecolor: '#9B9B9B',
                zeroline: false,
                //title: 'Cumulative Volume',
                //showline: false,
                side: 'right',
                showline: true,
                showgrid: false,
                linewidth: 1,
            },
            margin: {
                l: 15,
                r: 60,
                b: 20,
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
            <Box id="order-depth-chart-container" className="chart-component order-depth-chart-component">
                <div className="card-header">
                    <BoxTitle title="Order Depth Chart (ETH)"
                              componentId="order-depth-chart-container"
                    />
                </div>

                <BoxSection id="depth-chart-resize-container">
                    <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} resizableElementId="depth-chart-resize-container"/>
                    <div id="depthChart"/>
                </BoxSection>
            </Box>
        )
    }
}