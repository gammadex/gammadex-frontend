import React, {Component} from 'react'
import TokenChooser from '../components/TokenChooser'
import OrderBook from '../components/OrderBook'
import OrderPlacement from '../components/OrderPlacement'
import WalletChooser from '../components/WalletChooser'
import TradeDetail from '../components/TradeDetail'
import OpenOrders from '../components/OpenOrders'
import MyTrades from '../components/MyTrades'
import DepositHistory from '../components/DepositHistory'
import TokenStore from '../stores/TokenStore'
import Config from '../Config'
import GreetingLoginModals from "../components/GreetingLoginModals"
import * as TimerActions from "../actions/TimerActions"
import { Button } from 'reactstrap'
import * as OpenOrderActions from "../actions/OpenOrderActions"
import * as MyTradeActions from "../actions/MyTradeActions"
import * as AccountActions from "../actions/AccountActions"
import MockSocket from "../MockSocket"
import TradeHistory from '../components/TradeHistory'
import Charts from '../components/Charts'
import TopNavigation from '../components/TopNavigation'
import AccountDetail from '../components/AccountDetail'

class App extends Component {
    constructor() {
        super()
        this.state = {
            token: null,
            page: "Exchange"
        }

        this.saveToken = this.saveToken.bind(this)

        // better place for this?
        setInterval(() => {
            TimerActions.timerFired()
        }, 15000)
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


    selectPage = (page) => {
        this.setState({
            page: page
        })
    }

    render() {
        const {token, page} = this.state
        const pageSize = Config.getDefaultPageSize()

        let pageBlock = <WalletChooser/>
        if (page === "Exchange") {
            pageBlock = <div className="row">
                <div className="col-lg-3">
                    <OrderBook token={token}/>
                </div>
                <div className="pl-0 col-lg-6 ">
                    <Charts token={token}/>
                    <OrderPlacement token={token}/>
                    <TradeDetail/>
                    <TradeHistory token={token} pageSize={pageSize}/>
                    <MyTrades/>
                    <OpenOrders />
                    <DepositHistory />
                </div>
                <div className="pl-0 col-lg-3">
                    <TokenChooser/>
                    <AccountDetail token={token}/>
                </div>
            </div>
        }

        return (
            <div>
                <TopNavigation token={token} selectPage={this.selectPage}/>

                <div className="container-fluid">
                    {pageBlock}
                </div>

                <footer>
                </footer>

                <GreetingLoginModals/>
            </div>
        )
    }
}

export default App
