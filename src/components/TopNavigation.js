import React, {Component} from 'react'
import DevelopmentToolbar from '../components/TopNavigation/DevelopmentToolbar'
import { Link } from 'react-router-dom'

import Logout from '../components/Logout'
import Routes from '../Routes'

class TopNavigation extends Component {

    render() {
        return (
            <header>
                <nav className="navbar navbar-dark bg-primary  navbar-expand-lg main-nav">
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item">
                            <Link to={Routes.Exchange} className="nav-link">Exchange</Link>
                        </li>
                        <li className="nav-item">
                            <Link to={Routes.Wallets} className="nav-link">Wallets</Link>
                        </li>
                        <li className="nav-item">
                            <Link to={Routes.History} className="nav-link">History</Link>
                        </li>
                    </ul>
                    <form className="form-inline">
                        <DevelopmentToolbar/>
                        <div className="form-group ml-1">
                            <Logout/>
                        </div>
                    </form>
                </nav>
            </header>
        )
    }
}

export default TopNavigation
