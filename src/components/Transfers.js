import React from "react"
import TransfersTable from "./Transfers/TransfersTable"
import TransferStore from "../stores/TransferStore"
import {Box} from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"

export default class Transfers extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            transfers: TransferStore.getAllTransfers(),
        }

        this.depositHistoryChanged = this.depositHistoryChanged.bind(this)
    }

    componentDidMount() {
        TransferStore.on("change", this.depositHistoryChanged)
    }

    componentWillUnmount() {
        TransferStore.removeListener("change", this.depositHistoryChanged)
    }

    depositHistoryChanged() {
        this.setState({
            transfers: TransferStore.getAllTransfers(),
        })
    }

    render() {
        const {transfers} = this.state

        let content = <EmptyTableMessage>You have no deposits or withdrawls</EmptyTableMessage>
        if (transfers && transfers.length > 0) {
            content = <TransfersTable transfers={transfers}/>
        }

        return (
            <Box title="Deposit / Withdrawal History">
                {content}
            </Box>
        )
    }
}