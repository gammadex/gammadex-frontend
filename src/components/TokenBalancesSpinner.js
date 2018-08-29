import React from "react"
import WebSocketStore from "../stores/WebSocketStore"
import AccountStore from "../stores/AccountStore"
import OpenOrdersStore from "../stores/OpenOrdersStore"
import Spinner from "./CustomComponents/Spinner"
import {withRouter} from "react-router-dom"
import BalancesStore from "../stores/BalancesStore"

class TokenBalancesSpinner extends React.Component {
    constructor(props) {
        super()

        this.state = {
            refreshInProgress: BalancesStore.isRefreshInProgress()
        }

        this.updateTokenBalancesResponseState = this.updateTokenBalancesResponseState.bind(this)
        this.onBalancesPage = this.onBalancesPage.bind(this)
    }

    componentWillMount() {
        BalancesStore.on("change", this.updateTokenBalancesResponseState)
    }

    componentWillUnmount() {
        BalancesStore.removeListener("change", this.updateTokenBalancesResponseState)
    }

    updateTokenBalancesResponseState() {
        this.setState({
            refreshInProgress: BalancesStore.isRefreshInProgress()
        })
    }

    onBalancesPage() {
        const path = this.props.location ? this.props.location.pathname : ''
        return path.includes('/balances/')
    }

    render() {
        const {refreshInProgress} = this.state

        return (! refreshInProgress) || (! this.onBalancesPage()) ? null : <Spinner/>
    }
}

export default withRouter(TokenBalancesSpinner)