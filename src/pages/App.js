import React, {Component} from 'react'
import {HashRouter} from 'react-router-dom'
import {Route} from 'react-router-dom'
import GreetingLoginModals from "../components/GreetingLoginModals"
import TopNavigation from '../components/TopNavigation'
import Exchange from './Exchange'
import Wallets from './Wallets'
import History from './History'
import Debug from './Debug'
import Routes from '../Routes'
import LifecycleStore from "../stores/LifecycleStore"
import SplashScreen from "./SplashScreen"

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
            contents = <div className="container-fluid">
                <Route path="/" exact component={Exchange}/>
                <Route path={Routes.Exchange + "*"} exact component={Exchange}/>
                <Route path={Routes.Wallets} exact component={Wallets}/>
                <Route path={Routes.History} exact component={History}/>
                <Route path={Routes.Debug} exact component={Debug}/>
            </div>
        }

        return (
            <HashRouter hashType="hashbang">
                <div>
                    <TopNavigation/>

                    {contents}

                    <GreetingLoginModals/>
                </div>
            </HashRouter>
        )

    }
}

export default App
