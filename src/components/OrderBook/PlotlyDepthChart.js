import React from "react"
import Plotly from 'plotly.js/dist/plotly-finance'
import {cumulativeAdd} from "../../util/CumulativeOrderVolumeAdder"

export default class PlotlyPriceChart extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {bids, offers} = this.props

        if (bids && offers) {
            const {data, layout} = this.getDataAndLayout(bids, offers)

            Plotly.newPlot('depthChart', data, layout, {displayModeBar: false});
        }
    }

    componentDidUpdate() {
        const {bids, offers, width, height} = this.props

        if (bids && offers) {
            const {data, layout} = this.getDataAndLayout(bids, offers)

            Plotly.update('depthChart', data, layout)

            Plotly.relayout('depthChart', {
                width: width,
                height: height,
            })
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
            line: {shape: 'vh', color:'green'},
            name: 'bids',
        }

        const sellTrace = {
            x: cumulativeSells.prices,
            y: cumulativeSells.volumes,
            fill: 'tozeroy',
            type: 'scatter',
            line: {shape: 'vh', color:'red'},
            name: 'offers',
        }

        const data = [buyTrace, sellTrace];

        const layout = {
            dragmode: 'zoom',
            showlegend: false,
            xaxis: {
                title: 'Price',
            },
            yaxis: {
                title: 'Cumulative Volume',
            },
            margin: {
                l: 80,
                r: 80,
                b: 50,
                t: 20,
                pad: 4
            },
        }

        return {
            data,
            layout
        }
    }

    render() {
        return <div id="depthChart"/>
    }
}
