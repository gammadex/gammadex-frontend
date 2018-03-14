import React, {Component} from 'react'
import WebSocketDetail from '../components/WebSocketDetail'
import DevelopmentToolbar from '../components/TopNavigation/DevelopmentToolbar'

import Logout from '../components/Logout'
import TokenStore from '../stores/TokenStore'
import Config from '../Config'
import * as TimerActions from "../actions/TimerActions"
import {Button} from 'reactstrap'
import * as MyTradeActions from "../actions/MyTradeActions"
import MockSocket from "../MockSocket"

class TopNavigation extends Component {
    constructor() {
        super()
        this.state = {
            token: null,
        }
    }

    componentWillMount() {
        TokenStore.on("change", this.saveToken)
        this.saveToken()
    }

    saveToken = () => {
        this.setState((prevState, props) => ({
            token: TokenStore.getSelectedToken()
        }))
    }

    purge() {
        MyTradeActions.purge()
        MockSocket.purge()
    }

    render() {
        const {token} = this.state

        let purge = null
        if (Config.isDevelopment()) {
            purge = <div className="row">
                <div className="col-lg-12">
                    <Button color="link" size="sm" onClick={() => this.purge()}>Purge</Button>
                    <small> local storage</small>
                </div>
            </div>
        }

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
