import React from "react"
import Plotly from 'plotly.js/dist/plotly-finance'
import {cumulativeAdd} from "../../util/CumulativeOrderVolumeAdder"
import {BoxSection} from "../CustomComponents/Box"

export default class PlotlyDepthChart extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.createChart()
    }

    componentDidUpdate() {
        this.createChart()
    }

    createChart() {
        const {bids, offers} = this.props

        if (bids && bids.length > 0 && offers && offers.length > 0) {
            const {data, layout} = this.getDataAndLayout(bids, offers)

            Plotly.purge('depthChart')
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
            line: {shape: 'vh', color: 'green'},
            name: 'bids',
        }

        const sellTrace = {
            x: cumulativeSells.prices,
            y: cumulativeSells.volumes,
            fill: 'tozeroy',
            type: 'scatter',
            line: {shape: 'vh', color: 'red'},
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
        return <BoxSection>
            <div id="depthChart"/>
        </BoxSection>
    }
}
