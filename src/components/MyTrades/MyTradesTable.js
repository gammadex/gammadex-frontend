import React from "react"
import MyTradesRow from "./MyTradesRow"
import TokenStore from "../../stores/TokenStore"

export default class MyTradesTable extends React.Component {

    constructor(props) {
        super(props)
        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
        this.state = {
            rows: []
        }
    }

    componentDidMount() {
        TokenStore.on("change", this.onTokenStoreChange)
        this.onTokenStoreChange()
    }

    componentWillUnmount() {
        TokenStore.removeListener("change", this.onTokenStoreChange)
    }

    // this is to avoid adding an event emitter to TokenStore for every table row
    onTokenStoreChange() {
        const { trades, refreshInProgress } = this.props
        // we rely on the backend to de-dupe myTrades and solely rely on the array index as the unique identifier as a proxy for:
        // txHash + logIndex + (some dupe id if account is both buyer and seller)
        const rows = trades.map((trade, i) => {
            return <MyTradesRow
                key={`${trade.txHash}_${i}`}
                trade={trade}
                tokenIdentifier={TokenStore.getTokenIdentifier(trade.tokenAddress)}
                refreshInProgress={refreshInProgress} />
        })
        this.setState({
            rows: rows
        })
    }

    render() {
        const { trades, refreshInProgress } = this.props
        const { rows } = this.state

        return (
            <div className="table-responsive my-trades-history">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Market</th>
                            <th>Role</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Amount</th>
                            <th>Total (ETH)</th>
                            <th>Exchange Fee</th>
                            <th>Gas Fee (ETH)</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        )
    }
}