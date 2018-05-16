import React, {Component} from 'react'
import WebSocketDetail from '../../components/WebSocketDetail'
import Config from '../../Config'
import {Button} from 'reactstrap'
import * as OpenOrderApi from "../../apis/OpenOrderApi"

class DevelopmentToolbar extends Component {

    purge() {
        OpenOrderApi.purge()
    }

    render() {

        let purge = null
        if (Config.isDevelopment()) {
            purge = <div className="row">
                <div className="col-lg-12">
                    <Button color="link" size="sm" onClick={() => this.purge()}>Purge</Button>
                    <small> local storage</small>
                </div>
            </div>
        }

        return (
            <span className="form-inline bg-white">
                <div className="form-group ml-1">
                    {purge}
                </div>
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
