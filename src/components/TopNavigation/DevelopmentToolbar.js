import React, {Component} from 'react'
import WebSocketDetail from '../../components/WebSocketDetail'
import Config from '../../Config'
import {Button} from 'reactstrap'
import * as OpenOrderApi from "../../apis/OpenOrderApi"

class DevelopmentToolbar extends Component {

    render() {
        return (
            <span className="form-inline bg-white">
                <div className="form-group ml-1">
                    <small>You are running this application in <b>{Config.getReactEnv()}</b> mode.</small>
                </div>
                <div className="form-group ml-1">
                    <WebSocketDetail/>
                </div>
            </span>
        )
    }
}

export default DevelopmentToolbar
