import React from 'react';
import ReactDOM from 'react-dom'
import App from './pages/App.js'
import * as ConfigActions from './actions/ConfigActions'
import LifecycleEventHandler from './LifecycleEventHandler'


ReactDOM.render(<App />, document.getElementById('app'), () => {
    LifecycleEventHandler.start()
});
