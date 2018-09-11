import React, {Component} from 'react'
import ViewAccountSelector from "../ViewAccountSelector"
import {withRouter} from "react-router-dom"
import {withAnalytics} from '../util/Analytics'

class ViewAccount extends Component {
    render() {
        return (
            <ViewAccountSelector/>
        )
    }
}

export default withAnalytics(withRouter(ViewAccount))
