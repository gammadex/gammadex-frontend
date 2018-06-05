import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import Logout from '../components/Logout'
import Account from '../components/Account'
import Routes from '../Routes'
import GasPriceChooser from "../components/GasPriceChooser"
import AppStatus from "./AppStatus"

class TopNavigation extends Component {

    render() {
        return (
            <header>
                <nav className="navbar navbar-dark bg-primary  navbar-expand-lg main-nav">
                    <span className="navbar-brand mb-0 h1">GammaDEX</span>
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item">
                            <Link to={Routes.Exchange} className="nav-link">Exchange</Link>
                        </li>
                        <li className="nav-item">
                            <Link to={Routes.History} className="nav-link">History</Link>
                        </li>
                    </ul>

                    <form className="form-inline">
                        <div className="form-group mr-1">
                            <AppStatus/>
                        </div>
                        <GasPriceChooser/>
                        <Account/>
                    </form>
                    <ul className="navbar-nav navbar-right">
                        <li className="nav-item">
                            <Link to={Routes.Wallets} className="nav-link">Unlock Wallet</Link>
                        </li>
                    </ul>
                </nav>
            </header>
        )
    }
}

export default TopNavigation
