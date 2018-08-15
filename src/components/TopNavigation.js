import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import TokenSummary from '../components/TokenSummary'
import Routes from '../Routes'
import GasPriceChooser from "../components/GasPriceChooser"
import AppStatus from "./AppStatus"
import TokenStore from "../stores/TokenStore"
import TokenStats from "./TokenStats"
import MarketResponseSpinner from "./MarketResponseSpinner"
import AccountDropdown from "./AccountDropdown"
import SupportDropdown from "./SupportDropdown"

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
            <header className="bg-primary text-light header">
                <div className="upper-header">
                    <div className="logo-and-main-nav full-height-lg">
                        <Link to={Routes.Exchange} className="navbar-brand mb-0"><img className="logo" src={require("../images/gammadex_logo.svg")}/></Link>

                        <nav className="navbar navbar-dark bg-primary navbar-expand">
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

                    <div className="user-buttons full-height-lg">
                        <MarketResponseSpinner/>
                        <nav className="navbar navbar-dark bg-primary navbar-expand">
                            <ul className="navbar-nav navbar-right mr-auto">
                                <SupportDropdown/>
                                <AppStatus/>
                                <GasPriceChooser/>
                                <AccountDropdown/>
                            </ul>
                        </nav>
                    </div>
                </div>
                <div className="lower-header">
                    <TokenStats token={token}/>
                </div>
            </header>
        )
    }
}

export default TopNavigation
