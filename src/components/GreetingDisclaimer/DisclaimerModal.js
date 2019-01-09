import React from "react"
import {Modal, ModalHeader, ModalBody, ModalFooter, Alert} from 'reactstrap'
import {trackEvent} from '../../util/Analytics'
import Config from '../../Config'
import Conditional from "../CustomComponents/Conditional"

export default class DisclaimerModal extends React.Component {

    constructor(props) {
        super(props)
        const disclaimerVersion = 0.2
        const accepted = localStorage.acceptedDisclaimerVersion != null && localStorage.acceptedDisclaimerVersion !== "" && Number(localStorage.acceptedDisclaimerVersion) >= Number(disclaimerVersion) ? true : false
        this.state = {
            showModal: !accepted,
            disclaimerVersion,
            isDemoMode: Config.isDemoMode(),
        }
    }

    handleAgree = (event) => {
        event.preventDefault()

        trackEvent("user", "accepted disclaimer")

        localStorage.acceptedDisclaimerVersion = this.state.disclaimerVersion
        this.setState({
            showModal: false
        })
    }

    render() {
        const {showModal, isDemoMode} = this.state

        return <Modal size="md" isOpen={showModal} toggle={this.hideModal} centered={true} keyboard>
            <form onSubmit={this.handleAgree}>
                <ModalBody>
                    <div className='disclaimer'>
                        <img id="disclaimer-logo" src="/gammadex_logo.svg"/>
                        <div id="disclaimer-content">

                            <div>GammaDEX is an advanced decentralized exchange for trading Ethereum tokens</div>

                            <Conditional displayCondition={isDemoMode}>
                                <div className="m-3"><strong>Running in demo mode - TRADING IS DISABLED</strong></div>
                            </Conditional>

                            <Conditional displayCondition={!isDemoMode}>
                                <div>By choosing "I AGREE" below, you agree to GammaDEX's <a target="_blank" rel="noopener noreferrer" href={`/terms.html`}>{"Terms of Use and Privacy Policy"}</a>.</div>
                            </Conditional>
                        </div>

                        <input className="btn btn-primary btn-lg" type="submit" value="I AGREE"/>
                    </div>
                </ModalBody>
            </form>
        </Modal>
    }
}