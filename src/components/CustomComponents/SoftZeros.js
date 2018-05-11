import React from "react"
import * as NumberUtil from "../../util/NumberUtil"

export default class SoftZeros extends React.Component {
    render() {
        const children = React.Children.toArray(this.props.children)
        if (!children.length > 0) {
            return null
        }

        const [number, zeros] = NumberUtil.splitTrailingZeros(children[0].toString())

        if (zeros.length) {
            return <span>{number}<span className="zeros">{zeros}</span></span>
        } else {
            return this.props.children
        }
    }
}