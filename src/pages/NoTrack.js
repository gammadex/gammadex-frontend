import React, {Component} from 'react'

class NoTrack extends Component {
    constructor() {
        super()
        localStorage.noTrack = true
    }
    render() {
        return (
            <div className="row">
                <div className="col-lg-12">Tracking disabled</div>
            </div>
        )
    }
}

export default NoTrack
