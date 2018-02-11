import React from "react"
import ReactDOM from 'react-dom'
import OhlcAndVolumeChart from './PriceChart/OhlcAndVolumeChart'

/**
 * This class handles resizing - TODO maybe rename
 */
export default class PriceChart extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            width: 0,
            height: 0
        }
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleWindowResize)
        this.handleWindowResize()
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize)
    }

    handleWindowResize = () => {
        let minWidth = 100
        let heightRatio = 0.5

        const el = ReactDOM.findDOMNode(this)
        if (el) {
            const parentWidth = el.parentNode.clientWidth
            const width = Math.max(parentWidth, minWidth)
            const height = Math.floor(heightRatio * width)

            this.setState({
                width: width,
                height: height
            })
        }
    }

    render() {
        const {trades} = this.props
        const {width, height} = this.state

        if (width && height && trades && trades.length) {
            return (
                <div>
                    <h2>Chart</h2>
                    <OhlcAndVolumeChart trades={trades} size={[width, height]}/>
                </div>
            )
        } else {
            return (
                <div/>
            )
        }
    }
}

