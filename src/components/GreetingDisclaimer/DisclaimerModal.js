import React from "react"
import { Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap'
import ReactMarkdown from 'react-markdown'
import disclaimer from '../../config/disclaimer.md'

export default class StoredPrivateKeyWalletUnlocker extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            showModal: false,
            disclaimerText: "",
            disclaimerVersion: ""
        }
    }

    componentWillMount() {
        fetch(disclaimer).then((response) => response.text()).then((text) => {
            const lines = text.split('\n')
            const fileVersion = lines.splice(0, 1)[0]
            const accepted = localStorage.acceptedDisclaimerVersion != null && localStorage.acceptedDisclaimerVersion !== "" && Number(localStorage.acceptedDisclaimerVersion) >= Number(fileVersion) ? true : false

            this.setState(
                {
                    disclaimerText: text,
                    showModal: !accepted,
                    disclaimerVersion: fileVersion
                })
        })
    }

    handleAgree = (event) => {
        event.preventDefault()

        localStorage.acceptedDisclaimerVersion = this.state.disclaimerVersion
        this.setState({
            showModal: false
        })
    }

    render() {
        const { showModal, disclaimerText } = this.state

        const input = '\n# This is a header\n\nAnd this is a paragraph\n\n```this is some code```\nRead usage information and more on [GitHub](//github.com/rexxars/react-markdown)'

        const lines = disclaimerText.split('\n')
        const meta = lines.splice(0, 2)
        const disclaimerTextNoMeta = lines.join('\n')
        return <Modal size="lg" isOpen={showModal} toggle={this.hideModal} keyboard>
            <ModalHeader>
                <div className="disclaimer-header">GammaDEX Disclaimer</div>
                <div className="disclaimer-version">Version: {meta[0]} (Published: {meta[1]})</div>
            </ModalHeader>
            <form onSubmit={this.handleAgree}>
                <ModalBody>
                    <div className='disclaimer-md'>
                        <ReactMarkdown source={disclaimerTextNoMeta} />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <input className="btn btn-primary" type="submit" value="I agree" />
                </ModalFooter>
            </form>
        </Modal>
    }
}