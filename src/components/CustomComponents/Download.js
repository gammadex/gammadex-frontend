import React, {Component} from 'react'

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

export default Download