import React from "react"
import Config from '../Config'
import AccountStore from "../stores/AccountStore"
import OpenOrdersStore from "../stores/OpenOrdersStore"
import TimerRelay from "../TimerRelay"
import OpenOrdersTable from "./OpenOrders/OpenOrdersTable"
import OrderState from "../OrderState"
import * as OpenOrderActions from "../actions/OpenOrderActions"

export default class OpenOrders extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            openOrders: OpenOrdersStore.getOpenOrdersState().openOrders
        }
    }

    componentWillMount() {
        OpenOrdersStore.on("change", () => this.updateOpenOrdersState())
        TimerRelay.on("change", () => this.timerFired())
    }
    
    updateOpenOrdersState() {
        const { openOrders } = OpenOrdersStore.getOpenOrdersState()
        this.setState({ openOrders: openOrders })
    }

    timerFired() {
        this.state.openOrders.filter(openOrder => openOrder.state === OrderState.PENDING_CANCEL).forEach(openOrder => {
            OpenOrderActions.refreshOpenOrder(openOrder)
        })
    }
    
    render() {
        const { openOrders } = this.state
        return (
            <div>
                <h2>Open Orders</h2>
                <div className="row">
                    <div className="col-lg-12">
                        <OpenOrdersTable openOrders={openOrders} />
                    </div>
                </div>
            </div>
        )
    }
}