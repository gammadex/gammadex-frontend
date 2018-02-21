import React from "react"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import TradeStore from '../stores/TradeStore'
import AccountStore from '../stores/AccountStore'
import Config from '../Config'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

import * as TradeActions from "../actions/TradeActions"
import * as AccountActions from "../actions/AccountActions"

// TODO put this config in a decent place
const ethAddress = "0x0000000000000000000000000000000000000000"

export default class AccountDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            modal: false,
            modalOrder: null
        }
        this.hideModal = this.hideModal.bind(this)
    }

    componentWillMount() {
        TradeStore.on("change", this.onTradeChange)
    }

    onTradeChange = () => {
        this.setState(TradeStore.getTradeState())
    }

    hideModal() {
        TradeActions.executeTradeAborted()
    }

    submit() {
        this.hideModal()
        const { modalOrder } = this.state
        const { account, nonce } = AccountStore.getAccountState()
        EtherDeltaWeb3.promiseTestTrade(account, modalOrder, modalOrder.amountGet)
            .then(isTradable => {
                if (isTradable) {
                    EtherDeltaWeb3.promiseTrade(account, nonce, modalOrder, modalOrder.amountGet)
                        .once('transactionHash', hash => {
                            AccountActions.nonceUpdated(nonce + 1)
                            console.log(`https://ropsten.etherscan.io/tx/${hash}`)
                        })
                        .on('error', error => { console.log(`failed to trade: ${error.message}`) })
                        .then(receipt => {

                        })
                }
            })
    }

    render() {
        const { modal, modalOrder } = this.state
        let modalTitle = ""
        let side = ""
        if (modalOrder) {
            side = (modalOrder.tokenGive === ethAddress) ? 'Sell' : 'Buy'
            modalTitle = `${side} ${modalOrder.ethAvailableVolume} TST for ${modalOrder.ethAvailableVolumeBase} ETH?`
        }

        return (
            <div>
                <Modal isOpen={modal} toggle={this.hideModal} className={this.props.className}>
                    <ModalHeader toggle={this.hideModal}>{modalTitle}</ModalHeader>
                    <ModalFooter>
                        <Button color="primary" onClick={this.submit.bind(this)}>{side}</Button>
                        <Button outline color="secondary" onClick={this.hideModal.bind(this)}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}