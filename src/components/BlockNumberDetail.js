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
            <span><strong>Current Block: </strong> {currentBlockNumber}</span>
        )
    }
}
