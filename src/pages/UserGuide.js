import React, {Component} from 'react'
import UserGuideChooser from '../components/UserGuideChooser'
import Scroll from "../components/CustomComponents/Scroll"
import {BoxTitle} from "../components/CustomComponents/Box"
import {withRouter} from "react-router-dom"
import {withAnalytics} from '../util/Analytics'

class UserGuide extends Component {
    render() {
        return (
            <div id="user-guide-container" className="user-guide-component">
                <div className="card">
                    <div className="card-header">
                        <BoxTitle title="How-to guides"
                                  componentId="user-guide-container"
                        />
                    </div>
                    <Scroll>
                        <UserGuideChooser/>
                    </Scroll>
                </div>
            </div>
        )
    }
}

export default withAnalytics(withRouter(UserGuide))
