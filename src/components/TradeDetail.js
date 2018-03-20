import React from "react"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import TradeStore from '../stores/TradeStore'
import TokenStore from '../stores/TokenStore'
import Config from '../Config'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Col, FormFeedback, Alert } from 'reactstrap'
import TransactionStatus from "../TransactionStatus"

import * as TradeActions from "../actions/TradeActions"
import * as MockOrderUtil from "../MockOrderUtil"

export default class TradeDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            modal: false,
            modalOrder: null,
            fillAmountModal: 0,
            baseAmountModal: 0,
            fillAmountValid: true,
            fillAmountInvalidReason: "",
            selectedToken: TokenStore.getSelectedToken(),
            showTransactionModal: false,
            transactionHash: "",
            transactionModalIsError: false,
            transactionModalErrorText: ""
        }
        this.hideModal = this.hideModal.bind(this)
        this.hideTransactionModal = this.hideTransactionModal.bind(this)
        this.tradeStoreUpdated = this.tradeStoreUpdated.bind(this)
        this.tokenStoreUpdated = this.tokenStoreUpdated.bind(this)
    }

    componentWillMount() {
        TradeStore.on("change", this.tradeStoreUpdated)
        TokenStore.on("change", this.tokenStoreUpdated)
    }

    componentWillUnmount() {
        TradeStore.removeListener("change", this.tradeStoreUpdated)
        TokenStore.removeListener("change", this.tokenStoreUpdated)
    }

    tradeStoreUpdated() {
        this.setState(TradeStore.getTradeState())
    }

    tokenStoreUpdated() {
        this.setState({ selectedToken: TokenStore.getSelectedToken() })
    }

    fillAmountChanged = (event) => {
        TradeActions.fillAmountModalChanged(Number(event.target.value))
    }

    hideModal() {
        TradeActions.executeTradeAborted()
    }

    hideTransactionModal() {
        TradeActions.hideTransactionModal()
    }

    submit() {
        this.hideModal()
        TradeActions.tradeExecutionConfirmed()
    }

    render() {
        const {
            modal,
            modalOrder,
            fillAmountModal,
            baseAmountModal,
            fillAmountValid,
            fillAmountInvalidReason,
            selectedToken,
            showTransactionModal,
            transactionHash,
            transactionModalIsError,
            transactionModalErrorText } = this.state
        let modalTitle = ""
        let takerSide = ""
        let priceRow = null
        let amountRow = null
        let totalRow = null
        let transactionAlert = null
        if (modalOrder) {
            takerSide = (MockOrderUtil.isTakerSell(modalOrder)) ? 'Sell' : 'Buy'
            modalTitle = `${takerSide} ${selectedToken.name}`
            priceRow = <FormGroup row>
                <Label for="price" sm={2}>Price</Label>
                <Col sm={8}>
                    <Input disabled type="number" min={0} id="price"
                        defaultValue={modalOrder.price} />
                </Col>
                <Col sm={2}>
                    <Label sm={2}>{"ETH"}</Label>
                </Col>
            </FormGroup>
            amountRow = <FormGroup row>
                <Label for="amount" sm={2}>Amount</Label>
                <Col sm={8}>
                    <Input type="number" min={0} id="amount"
                        value={fillAmountModal}
                        onChange={this.fillAmountChanged.bind(this)}
                        valid={fillAmountValid} />
                    <FormFeedback>{fillAmountInvalidReason}</FormFeedback>
                </Col>
                <Col sm={2}>
                    <Label sm={2}>{selectedToken.name}</Label>
                </Col>
            </FormGroup>
            totalRow = <FormGroup row>
                <Label for="total" sm={2}>Total</Label>
                <Col sm={8}>
                    <Input disabled type="number" min={0} id="total"
                        value={baseAmountModal} />
                </Col>
                <Col sm={2}>
                    <Label sm={2}>{"ETH"}</Label>
                </Col>
            </FormGroup>

            if (transactionModalIsError) {
                transactionAlert = <Alert color="danger">{transactionModalErrorText}</Alert>
            } else {
                transactionAlert = <Alert color="success">
                    Transaction sent. Check progress in <a target="_blank" rel="noopener" href={`${Config.getEtherscanUrl()}/tx/${transactionHash}`}>{"etherscan"}</a> (opens in new window)
                </Alert>
            }
        }

        return (
            <div>
                <Modal isOpen={modal} toggle={this.hideModal} className={this.props.className}>
                    <ModalHeader toggle={this.hideModal}>{modalTitle}</ModalHeader>
                    <ModalBody>
                        {priceRow}
                        {amountRow}
                        {totalRow}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" disabled={!fillAmountValid} onClick={this.submit.bind(this)}>{takerSide}</Button>
                        <Button outline color="secondary" onClick={this.hideModal.bind(this)}>Cancel</Button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={showTransactionModal} toggle={this.hideTransactionModal} className={this.props.className}>
                    <ModalHeader toggle={this.hideTransactionModal}>{modalTitle}</ModalHeader>
                    <ModalBody>
                        {transactionAlert}
                    </ModalBody>
                </Modal>
            </div>
        )
    }
}