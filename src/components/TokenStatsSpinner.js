import React from "react"
import StatsStore from "../stores/StatsStore"
import Spinner from "./CustomComponents/Spinner"
import {withRouter} from "react-router-dom"

class TokenStatsSpinner extends React.Component {
    constructor(props) {
        super()

        this.state = {
            refreshInProgress: StatsStore.isRefreshInProgress()
        }

        this.updateTokenBalancesResponseState = this.updateTokenBalancesResponseState.bind(this)
        this.onStatsPage = this.onStatsPage.bind(this)
    }

    componentWillMount() {
        StatsStore.on("change", this.updateTokenBalancesResponseState)
    }

    componentWillUnmount() {
        StatsStore.removeListener("change", this.updateTokenBalancesResponseState)
    }

    updateTokenBalancesResponseState() {
        this.setState({
            refreshInProgress: StatsStore.isRefreshInProgress()
        })
    }

    onStatsPage() {
        const path = this.props.location ? this.props.location.pathname : ''
        return path.includes('/token-stats/')
    }

    render() {
        const {refreshInProgress} = this.state

        return (! refreshInProgress) || (! this.onStatsPage()) ? null : <Spinner/>
    }
}

export default withRouter(TokenStatsSpinner)