import React, {Component} from 'react'
import {HashRouter} from 'react-router-dom'
import {Route} from 'react-router-dom'
import GreetingLoginModals from "../components/GreetingLoginModals"
import GreetingDisclaimer from "../components/GreetingDisclaimer"
import TopNavigation from '../components/TopNavigation'
import Exchange from './Exchange'
import Wallets from './Wallets'
import History from './History'
import NewWallet from './NewWallet'
import Debug from './Debug'
import Chart from './Chart'
import Routes from '../Routes'
import LifecycleStore from "../stores/LifecycleStore"
import SplashScreen from "./SplashScreen"
import GlobalMessages from "../components/GlobalMessages"
import '../css/bootstrap.css'
import '../css/gammadex.css'

class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            web3Initialised: LifecycleStore.isWeb3Initialised()
        }

        this.onLifecycleStoreChange = this.onLifecycleStoreChange.bind(this)
    }

    componentWillMount() {
        LifecycleStore.on("change", this.onLifecycleStoreChange)
    }

    componentWillUnmount() {
        LifecycleStore.removeListener("change", this.onLifecycleStoreChange)
    }

    onLifecycleStoreChange() {
        this.setState({
            web3Initialised: LifecycleStore.isWeb3Initialised()
        })
    }

    render() {
        let contents = <SplashScreen/>
        if (this.state.web3Initialised) {
            contents = <div className="container-fluid route-content">
                <Route path="/" exact component={Exchange}/>
                <Route path={Routes.Exchange + "*"} exact component={Exchange}/>
                <Route path={Routes.Wallets} exact component={Wallets}/>
                <Route path={Routes.NewWallet} exact component={NewWallet}/>
                <Route path={Routes.History} exact component={History}/>
                <Route path={Routes.Debug} exact component={Debug}/>
                <Route path={Routes.Chart} exact component={Chart}/>
            </div>
        }

        return (
            <HashRouter hashType="hashbang">
                <div className="page-content">
                    <TopNavigation/>
                    {contents}
                    <GreetingDisclaimer/>
                    <GreetingLoginModals/>
                    <GlobalMessages/>
                </div>
            </HashRouter>
        )

    }
}

export default App
