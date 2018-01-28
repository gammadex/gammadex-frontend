import React, {Component} from 'react'
import WebSocketDetail from '../components/WebSocketDetail'
import TokenChooser from '../components/TokenChooser'
import OrderBook from '../components/OrderBook'

class App extends Component {
    render() {
        return (
            <div className="App">
                <WebSocketDetail/>
                <TokenChooser/>
                <OrderBook/>
            </div>
        )
    }
}

export default App
