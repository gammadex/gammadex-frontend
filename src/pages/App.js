import React, {Component} from 'react'
import { HashRouter } from 'react-router-dom'
import {Route} from 'react-router-dom'
import GreetingLoginModals from "../components/GreetingLoginModals"
import TopNavigation from '../components/TopNavigation'
import Exchange from './Exchange'
import Wallets from './Wallets'
import History from './History'

class App extends Component {
    render() {
        return (
            <HashRouter>
                <div>
                    <TopNavigation/>

                    <div className="container-fluid">
                        <Route path="/" exact component={Exchange}/>
                        <Route path="/wallets" exact component={Wallets}/>
                        <Route path="/history" exact component={History}/>
                    </div>

                    <footer>
                    </footer>

                    <GreetingLoginModals/>
                </div>
            </HashRouter>
        )
    }
}

export default App
