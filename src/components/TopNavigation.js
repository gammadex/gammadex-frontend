import React, {Component} from 'react'
import DevelopmentToolbar from '../components/TopNavigation/DevelopmentToolbar'

import Logout from '../components/Logout'
import TokenStore from '../stores/TokenStore'

class TopNavigation extends Component {
    constructor() {
        super()
        this.state = {
            token: null,
        }
        this.saveToken = this.saveToken.bind(this)
    }

    componentWillMount() {
        TokenStore.on("change", this.saveToken)
        this.saveToken()
    }

    componentWillUnmount() {
        TokenStore.removeListener("change", this.saveToken)
    }

    saveToken() {
        this.setState((prevState, props) => ({
            token: TokenStore.getSelectedToken()
        }))
    }

    render() {
        return (
            <header>
                <nav className="navbar navbar-dark bg-primary  navbar-expand-lg main-nav">
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item">
                            <a className="nav-link" href="#" onClick={() => this.props.selectPage("Exchange")}>Exchange</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#" onClick={() => this.props.selectPage("Wallets")}>Wallets</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#" onClick={() => this.props.selectPage("History")}>History</a>
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
