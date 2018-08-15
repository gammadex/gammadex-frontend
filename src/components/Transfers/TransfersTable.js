import React from "react"
import TransferRow from "./TransferRow"
import TokenStore from '../../stores/TokenStore'

export default class TransfersTable extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            rows: []
        }
        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
    }

    componentDidMount() {
        TokenStore.on("change", this.onTokenStoreChange)
        this.onTokenStoreChange()
    }
    
    componentWillUnmount() {
        TokenStore.removeListener("change", this.onTokenStoreChange)
    }

    onTokenStoreChange() {
        // this is to avoid adding an event emitter to TokenStore for every table row
        const {transfers, refreshInProgress} = this.props

        const rows = transfers.map(transfer => <TransferRow key={transfer.txHash}
                                                            transfer={transfer}
                                                            refreshInProgress={refreshInProgress}
                                                            tokenIdentifier={TokenStore.getTokenIdentifier(transfer.tokenAddress)}/>)

        this.setState({
            rows: rows
        })
    }

    render() {
        const {rows} = this.state

        return (
            <div className="table-responsive deposit-history">
                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th>Asset</th>
                        <th>Amount</th>
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