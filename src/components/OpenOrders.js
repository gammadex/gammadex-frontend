import React from "react"
import Config from '../Config'
import AccountStore from "../stores/AccountStore"
import OpenOrdersStore from "../stores/OpenOrdersStore"
import TimerRelay from "../TimerRelay"
import OpenOrdersTable from "./OpenOrders/OpenOrdersTable"
import OrderState from "../OrderState"
import * as OpenOrderActions from "../actions/OpenOrderActions"
import {Box, BoxSection} from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"

export default class OpenOrders extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            openOrders: OpenOrdersStore.getOpenOrdersState().openOrders
        }
        this.updateOpenOrdersState = this.updateOpenOrdersState.bind(this)
        this.timerFired = this.timerFired.bind(this)
    }

    componentWillMount() {
        OpenOrdersStore.on("change", this.updateOpenOrdersState)
        TimerRelay.on("change", this.timerFired)
    }

    componentWillUnmount() {
        OpenOrdersStore.removeListener("change", this.updateOpenOrdersState)
        TimerRelay.removeListener("change", this.timerFired)
    }

    updateOpenOrdersState() {
        const {openOrders} = OpenOrdersStore.getOpenOrdersState()
        this.setState({openOrders: openOrders})
    }

    timerFired() {
        this.state.openOrders.filter(openOrder => openOrder.state === OrderState.PENDING_CANCEL).forEach(openOrder => {
            OpenOrderActions.refreshOpenOrder(openOrder)
        })
    }

    render() {
        const {openOrders} = this.state

        let content = <EmptyTableMessage>You have no open orders</EmptyTableMessage>
        if (openOrders && openOrders.length > 0) {
            content = <OpenOrdersTable openOrders={openOrders}/>
        }

        return (
            <Box title="Open Orders">
                {content}
            </Box>
        )
    }
}