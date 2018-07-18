import React from "react"
import { Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap'
import ReactMarkdown from 'react-markdown'
import wording from './DisclaimerWording'

export default class DisclaimerModal extends React.Component {

    constructor(props) {
        super(props)
        const lines = wording.split('\n')
        const fileVersion = lines.splice(0, 1)[0]
        const accepted = localStorage.acceptedDisclaimerVersion != null && localStorage.acceptedDisclaimerVersion !== "" && Number(localStorage.acceptedDisclaimerVersion) >= Number(fileVersion) ? true : false
        this.state = {
            showModal: !accepted,
            disclaimerText: wording,
            disclaimerVersion: fileVersion
        }
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