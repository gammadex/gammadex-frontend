import React from "react"
import OpenOrdersStore from "../stores/OpenOrdersStore"
import OpenOrdersTable from "./OpenOrders/OpenOrdersTable"
import {Box} from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import AccountStore from "../stores/AccountStore"

export default class OpenOrders extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            openOrders: OpenOrdersStore.getOpenOrdersState().openOrders,
            accountRetrieved: AccountStore.isAccountRetrieved(),
        }
        this.updateOpenOrdersState = this.updateOpenOrdersState.bind(this)
        this.accountStoreUpdated = this.accountStoreUpdated.bind(this)
    }

    componentWillMount() {
        OpenOrdersStore.on("change", this.updateOpenOrdersState)
        AccountStore.on("change", this.accountStoreUpdated)
    }

    componentWillUnmount() {
        OpenOrdersStore.removeListener("change", this.updateOpenOrdersState)
        AccountStore.removeListener("change", this.accountStoreUpdated)
    }

    updateOpenOrdersState() {
        const {openOrders} = OpenOrdersStore.getOpenOrdersState()
        this.setState({openOrders: openOrders})
    }

    accountStoreUpdated() {
        this.setState({
            accountRetrieved: AccountStore.isAccountRetrieved()
        })
    }

    render() {
        const {openOrders, accountRetrieved} = this.state

        let content = <EmptyTableMessage>You have no open orders</EmptyTableMessage>
        if (!accountRetrieved) {
            content = <EmptyTableMessage>Please log in to see your open orders</EmptyTableMessage>
        } else if (openOrders && openOrders.length > 0) {
            content = <OpenOrdersTable openOrders={openOrders}/>
        }

        return (
            <Box title="Open Orders">
                {content}
            </Box>
        )
    }
}