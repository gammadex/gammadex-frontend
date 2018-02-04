import React from "react"
import LineChartGrid from './PriceChart/LineChartGrid'

/*
TODO - this is all pretty awful, really just the bones of an idea
 */
export default class PriceChart extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: []
        }
    }

    render() {
        const data = this.props.trades.map(t => {
            return {
                open: t.price,
                high: t.price,
                low: t.price,
                close: t.price,
                date: new Date(t.date),
                volume: 1,
            }
        })

        if (data.length > 3) {
            return (
                <div className="debug">
                    <LineChartGrid data={data} width={300} height={100} type="svg" ratio={1}/>
                </div>
            )
        } else {
            return (
                <div className="debug"></div>
            )
        }

    }
}

