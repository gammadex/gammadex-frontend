import React from "react"
import _ from "lodash"
import OpenOrdersRow from "./OpenOrdersRow"
import GasPriceStore from '../../stores/GasPriceStore'
import TokenStore from '../../stores/TokenStore'
import * as OrderUtil from "../../OrderUtil"

export default class OpenOrdersTable extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            currentGasPriceWei: GasPriceStore.getCurrentGasPriceWei(),
            tokensExist: this.getTokenExistenceMap(props)
        }
        this.onGasStoreChange = this.onGasStoreChange.bind(this)
        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
        this.getTokenExistenceMap = this.getTokenExistenceMap.bind(this)
    }

    componentWillMount() {
        GasPriceStore.on("change", this.onGasStoreChange)
        TokenStore.on("change", this.onTokenStoreChange)
    }

    componentWillUnmount() {
        GasPriceStore.removeListener("change", this.onGasStoreChange)
        TokenStore.removeListener("change", this.onTokenStoreChange)
    }

    onGasStoreChange() {
        this.setState({
            currentGasPriceWei: GasPriceStore.getCurrentGasPriceWei()
        })
    }

    onTokenStoreChange() {
        this.setState((prevState, props) => ({
            tokensExist: this.getTokenExistenceMap(props)
        }))
    }

    getTokenExistenceMap(props) {
        const keyedByAddress = _.keyBy(props.openOrders, o => OrderUtil.tokenAddress(o))
        return _.mapValues(keyedByAddress, (value, addr) => TokenStore.tokenExists(addr))
    }

    render() {
        const {currentGasPriceWei, tokensExist} = this.state

        console.log("tokenExists", tokensExist)

        const {openOrders, pendingCancelIds} = this.props
        const rows = openOrders.map(o =>
            <OpenOrdersRow key={o.id} openOrder={o} isPendingCancel={pendingCancelIds.includes(o.id)}
                           currentGasPriceWei={currentGasPriceWei}
                           tokenExists={tokensExist[OrderUtil.tokenAddress(o)]}/>
        )

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