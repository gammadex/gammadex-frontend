import React, {Component} from 'react'
import {withRouter} from "react-router-dom"
import {withAnalytics} from '../util/Analytics'
import DayVolume from "../components/Stats/DayVolume"

class Stats extends Component {
    render() {
        return (
            <div>
                <div className="row history-row">
                    <div className="col-lg-6 deposit-history-container">
                        <DayVolume/>
                    </div>
                    <div className="col-lg-6 withdraw-history-container">

                    </div>
                </div>
            </div>
        )
    }
}

export default withAnalytics(withRouter(Stats))
