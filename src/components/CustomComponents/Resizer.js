import React from "react"
import ReactDOM from 'react-dom'

/**
 * This class handles resizing
 */
export default class Resizer extends React.Component {
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
        let minWidth = 200
        let heightRatio = 0.45

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

    childrenWithSize() {
        return React.Children.map(this.props.children, child => {
            return React.cloneElement(child, {
                width: this.state.width,
                height: this.state.height,
            })
        })
    }

    render() {
        const {width, height} = this.state

        if (width && height) {
            return (
                <span>
                    {this.childrenWithSize()}
                </span>
            )
        } else {
            return (
                <span/>
            )
        }
    }
}
