import React, {Component} from 'react'
import UserGuideChooser from '../components/UserGuideChooser'

class UserGuide extends Component {
    render() {
        return (
            <div className="row">
                <div className="col-lg-1"></div>
                <div className="col-lg-10"><UserGuideChooser/></div>
                <div className="col-lg-1"></div>
            </div>
        )
    }
}

export default UserGuide
