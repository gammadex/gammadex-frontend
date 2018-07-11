import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import TokenSummary from '../components/TokenSummary'
import Account from '../components/Account'
import Routes from '../Routes'
import GasPriceChooser from "../components/GasPriceChooser"
import AppStatus from "./AppStatus"
import * as TokenApi from "../apis/TokenApi"
import TokenStore from "../stores/TokenStore"
import TokenStats from "./TokenStats"
import MarketResponseSpinner from "./MarketResponseSpinner"

class TopNavigation extends Component {
    constructor() {
        super()
        this.state = {
            token: null,
        }

        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
    }

    componentDidMount() {
        TokenStore.on("change", this.onTokenStoreChange)
    }

    componentWillUnmount() {
        TokenStore.removeListener("change", this.onTokenStoreChange)
    }

    onTokenStoreChange() {
        this.setState((prevState, props) => ({
            token: TokenStore.getSelectedToken(),
        }))
    }

    render() {
        const { token } = this.state

        return (
            <header className="bg-primary text-light header">
                <div className="upper-header">
                    <div className="full-height">
                        <img src={require("../images/eth-logo.png")} style={{ "height": "28px" }} className="mr-2" />

                        <Link to={Routes.Exchange} className="navbar-brand mb-0 h1">GammaDEX</Link>

                        <nav className="navbar navbar-dark bg-primary navbar-expand-lg">
                            <ul className="navbar-nav mr-auto">
                                <li className="nav-item">
                                    <Link to={Routes.Exchange} className="nav-link">Exchange</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to={Routes.History} className="nav-link">History</Link>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    <TokenSummary token={token} />

                    <form className="form-inline">
                        <div className="form-group top-spinner mr-1">
                            <MarketResponseSpinner />
                        </div>
                        <div className="form-group mr-1">
                            <AppStatus />
                        </div>
                        <div className="form-group mr-1">
                            <GasPriceChooser />
                        </div>
                        <div className="form-group mr-1">
                            <Account />
                        </div>
                    </form>
                </div>
                <div className="lower-header">
                    <TokenStats token={token} />
                </div>
            </header>
        )
    }
}

export default TopNavigation
