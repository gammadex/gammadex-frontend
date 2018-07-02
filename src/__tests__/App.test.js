import React from 'react'
import ReactDOM from 'react-dom'
import App from '../pages/App'

it('renders without crashing', () => {
    const div = document.createElement("div")
    // https://github.com/reactstrap/reactstrap/issues/773
    document.body.appendChild(div)
    ReactDOM.render(<App />, div)
})