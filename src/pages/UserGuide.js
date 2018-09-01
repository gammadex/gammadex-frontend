import React, { Component } from 'react'
import UserGuideChooser from '../components/UserGuideChooser'
import { BoxTitle } from "../components/CustomComponents/Box"

class UserGuide extends Component {
    render() {
        return (
            <div id="user-guide-container" className="user-guide-component">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">How-to guides</div>
                    </div>
                    <UserGuideChooser />
                </div>
            </div>
        )
    }
}

export default UserGuide
