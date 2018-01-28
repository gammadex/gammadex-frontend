import React, {Component} from 'react'
import WebSocketDetail from '../components/WebSocketDetail'
import TokenChooser from '../components/TokenChooser'
import * as WebSocketActions from '../actions/WebSocketActions'
import * as ConfigActions from "../actions/ConfigActions"

class App extends Component {

    componentWillMount() {
        //connect() // TODO -re-enable me
    }

    render() {
        return (
            <div className="App">
                <WebSocketDetail/>
                <TokenChooser/>
            </div>
        );
    }
}

export default App;
