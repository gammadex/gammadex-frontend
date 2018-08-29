import React from "react"
import WebSocketStore from "../stores/WebSocketStore"
import AccountStore from "../stores/AccountStore"
import OpenOrdersStore from "../stores/OpenOrdersStore"
import Spinner from "./CustomComponents/Spinner"
import {withRouter} from "react-router-dom"

class MarketResponseSpinner extends React.Component {
    constructor(props) {
        super()

        this.state = {
            isMarketResponseReceived: WebSocketStore.isMarketResponseReceived()
        }

        this.updateMarketResponseState = this.updateMarketResponseState.bind(this)
        this.onExchangePage = this.onExchangePage.bind(this)
    }

    componentWillMount() {
        WebSocketStore.on("change", this.updateMarketResponseState)
    }

    componentWillUnmount() {
        WebSocketStore.removeListener("change", this.updateMarketResponseState)
    }

    updateMarketResponseState() {
        this.setState({
            isMarketResponseReceived: WebSocketStore.isMarketResponseReceived()
        })
    }

    onExchangePage() {
        const path = this.props.location ? this.props.location.pathname : ''
        return path.includes('/exchange/')
    }

    render() {
        const {isMarketResponseReceived} = this.state

        return isMarketResponseReceived || (! this.onExchangePage()) ? null : <Spinner/>
    }
}


export default withRouter(MarketResponseSpinner)