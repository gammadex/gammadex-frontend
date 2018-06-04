import React, {Component} from 'react'
import WebSocketDetail from '../../components/WebSocketDetail'
import Config from '../../Config'
import BlockNumberDetail from "../BlockNumberDetail"

class DevelopmentToolbar extends Component {

    render() {
        return (
            <span className="form-inline bg-white">
                <div className="form-group ml-1">
                    <small>You are running this application in <b>{Config.getReactEnv()}</b> mode.</small>
                </div>
            </span>
        )
    }
}

export default DevelopmentToolbar
