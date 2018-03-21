import React, {Component} from 'react'
import DevelopmentToolbar from '../components/TopNavigation/DevelopmentToolbar'
import { Link } from 'react-router-dom'

import Logout from '../components/Logout'
import TokenStore from '../stores/TokenStore'

class TopNavigation extends Component {

    render() {
        return (
            <header>
                <nav className="navbar navbar-dark bg-primary  navbar-expand-lg main-nav">
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item">
                            <Link to='/'><a className="nav-link" href="#">Exchange</a></Link>
                        </li>
                        <li className="nav-item">
                            <Link to='/wallets'><a className="nav-link" href="#">Wallets</a></Link>
                        </li>
                        <li className="nav-item">
                            <Link to='/history'><a className="nav-link" href="#">History</a></Link>
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
