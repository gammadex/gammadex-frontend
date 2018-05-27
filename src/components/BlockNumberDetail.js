import React from "react"
import LifecycleStore from '../stores/LifecycleStore'
import Config from "../Config"

export default class BlockNumberDetail extends React.Component {
    constructor() {
        super()

        this.state = {
            currentBlockNumber: LifecycleStore.getCurrentBlockNumber()
        }

        this.saveBlockNumber = this.saveBlockNumber.bind(this)
    }

    componentWillMount() {
        LifecycleStore.on("change", this.saveBlockNumber)
    }

    componentWillUnmount() {
        LifecycleStore.removeListener("change", this.saveBlockNumber)
    }

    saveBlockNumber() {
        this.setState({currentBlockNumber: LifecycleStore.getCurrentBlockNumber()})
    }

    render() {
        const {currentBlockNumber} = this.state

        return (
            <span className="ml-2 mr-2"><b>Current Block: </b> {currentBlockNumber}</span>
        )
    }
}
