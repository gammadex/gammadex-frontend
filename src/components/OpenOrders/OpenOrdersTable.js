import React from "react"
import _ from "lodash"
import Config from "../../Config"
import OpenOrdersRow from "./OpenOrdersRow"
import OrderState from "../../OrderState"
import GasPriceStore from '../../stores/GasPriceStore'

export default class OpenOrdersTable extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            currentGasPriceWei: GasPriceStore.getCurrentGasPriceWei()
        }
        this.onGasStoreChange = this.onGasStoreChange.bind(this)
    }

    componentWillMount() {
        GasPriceStore.on("change", this.onGasStoreChange)
    }

    componentWillUnmount() {
        GasPriceStore.removeListener("change", this.onGasStoreChange)
    }

    onGasStoreChange() {
        this.setState({
            currentGasPriceWei: GasPriceStore.getCurrentGasPriceWei()
        })
    }

    render() {
        const { currentGasPriceWei } = this.state
        const { openOrders, pendingCancelIds } = this.props
        const rows = openOrders.map(o => <OpenOrdersRow key={o.id} openOrder={o} 
            isPendingCancel={pendingCancelIds.includes(o.id)} currentGasPriceWei={currentGasPriceWei} />)
        return (
            <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>Market</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Amount</th>
                        <th>Total (ETH)</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        )
    }
}