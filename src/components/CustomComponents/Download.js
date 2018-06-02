import React, {Component} from 'react'
import PropTypes from "prop-types"

class Download extends Component {

    componentDidMount() {
        this.updateLink()
    }

    componentDidUpdate() {
        this.updateLink()
    }

    updateLink = () => {
        const {fileName, mimeType, contents} = this.props

        const a = this.node
        const file = new File([contents], fileName, {type: mimeType})
        a.href = URL.createObjectURL(file)
    }

    render() {
        const {fileName, className} = this.props

        return <a ref={node => this.node = node} download={fileName} className={className}>{this.props.children}</a>
    }
}

Download.propTypes = {
    fileName: PropTypes.string,
    mimeType: PropTypes.string,
    contents: PropTypes.string,
    href: PropTypes.string,
    className: PropTypes.string,
}

export default Download