import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import TokenSummary from '../components/TokenSummary'
import Account from '../components/Account'
import Routes from '../Routes'
import GasPriceChooser from "../components/GasPriceChooser"
import AppStatus from "./AppStatus"
import * as TokenApi from "../apis/TokenApi"
import TokenStore from "../stores/TokenStore"

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
        const {token} = this.state

        return (
            <header className="bg-primary text-light">
                <div>
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

                <TokenSummary token={token}/>

                <div>
                    <form className="form-inline">
                        <div className="form-group mr-1">
                            <AppStatus/>
                        </div>
                        <GasPriceChooser/>
                        <Account/>

                        <nav className="navbar navbar-dark bg-primary navbar-expand-lg">
                            <ul className="navbar-nav">
                                <li className="nav-item">
                                    <Link to={Routes.Wallets} className="nav-link">Unlock Wallet</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to={Routes.NewWallet} className="nav-link">New Wallet</Link>
                                </li>
                            </ul>
                        </nav>
                    </form>
                </div>
            </header>
        )
    }
}

export default TopNavigation
