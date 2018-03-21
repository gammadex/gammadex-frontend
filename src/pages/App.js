import React, {Component} from 'react'
import { HashRouter } from 'react-router-dom'
import {Route} from 'react-router-dom'
import GreetingLoginModals from "../components/GreetingLoginModals"
import TopNavigation from '../components/TopNavigation'
import Exchange from './Exchange'
import Wallets from './Wallets'
import History from './History'
import Routes from '../Routes'

class App extends Component {
    render() {
        return (
            <HashRouter>
                <div>
                    <TopNavigation/>

                    <div className="container-fluid">
                        <Route path={Routes.Exchange} exact component={Exchange}/>
                        <Route path={Routes.Wallets} exact component={Wallets}/>
                        <Route path={Routes.History} exact component={History}/>
                    </div>

                    <GreetingLoginModals/>
                </div>
            </HashRouter>
        )
    }
}

export default App
