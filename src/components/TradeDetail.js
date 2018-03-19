import React from "react"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import TradeStore from '../stores/TradeStore'
import TokenStore from '../stores/TokenStore'
import AccountStore from '../stores/AccountStore'
import Config from '../Config'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Col, FormFeedback, Alert } from 'reactstrap'
import TransactionStatus from "../TransactionStatus"

import * as TradeActions from "../actions/TradeActions"
import * as MyTradeActions from "../actions/MyTradeActions"
import * as AccountActions from "../actions/AccountActions"
import * as MockOrderUtil from "../MockOrderUtil"
import { tokWeiToEth, baseWeiToEth, tokEthToWei, baseEthToWei } from "../EtherConversion"
import BigNumber from 'bignumber.js'

// TODO this class knows and is doing too much!!!!
export default class TradeDetail extends React.Component {
    constructor(props) {
        super(props)
        const { account, nonce, exchangeBalanceTokWei, exchangeBalanceEthWei } = AccountStore.getAccountState()
        this.state = {
            modal: false,
            modalOrder: null,
            fillAmount: 0,
            fillAmountValid: true,
            fillAmountInvalidReason: "",
            selectedToken: TokenStore.getSelectedToken(),
            account: account,
            nonce: nonce,
            exchangeBalanceTokWei: exchangeBalanceTokWei,
            exchangeBalanceEthWei: exchangeBalanceEthWei,
            showTransactionModal: false,
            transactionHash: "",
            transactionModalIsError: false,
            transactionModalErrorText: ""
        }
        this.hideModal = this.hideModal.bind(this)
        this.hideTransactionModal = this.hideTransactionModal.bind(this)
    }

    componentWillMount() {
        TradeStore.on("change", () => this.setState(TradeStore.getTradeState()))
        TokenStore.on("change", () => this.setState({ selectedToken: TokenStore.getSelectedToken() }))
        AccountStore.on("change", () => this.updateAccountState())
    }

    updateAccountState() {
        const { account, nonce, exchangeBalanceTokWei, exchangeBalanceEthWei } = AccountStore.getAccountState()
        this.setState({
            account: account,
            nonce: nonce,
            exchangeBalanceTokWei: exchangeBalanceTokWei,
            exchangeBalanceEthWei: exchangeBalanceEthWei
        })
    }

    fillAmountChanged = (event) => {
        let fillAmount = Number(event.target.value)
        const takerSide = MockOrderUtil.takerSide(this.state.modalOrder)
        const amountEth = fillAmount * this.state.modalOrder.price
        TradeActions.fillAmountChanged(
            takerSide,
            fillAmount,
            this.state.modalOrder.ethAvailableVolume,
            tokWeiToEth(this.state.exchangeBalanceTokWei, this.state.selectedToken.address),
            amountEth,
            baseWeiToEth(this.state.exchangeBalanceEthWei))
    }

    hideModal() {
        TradeActions.executeTradeAborted()
    }

    hideTransactionModal() {
        TradeActions.hideTransactionModal()
    }

    submit() {
        this.hideModal()
        const { modalOrder, account, nonce, fillAmount, selectedToken } = this.state
        const takerSide = MockOrderUtil.takerSide(modalOrder)
        // amount is in amountGet terms
        // TODO, BigNumber this shit up https://github.com/wjsrobertson/ethergamma/issues/6
        let amountWei = 0
        if (MockOrderUtil.isTakerSell(modalOrder)) {
            // taker is selling, amount is in units of TOK
            amountWei = tokEthToWei(fillAmount, selectedToken.address)
        } else {
            amountWei = baseEthToWei(BigNumber(String(modalOrder.price)).times(BigNumber(String(fillAmount))))
        }
        EtherDeltaWeb3.promiseTestTrade(account, modalOrder, amountWei)
            .then(isTradable => {
                if (isTradable) {
                    EtherDeltaWeb3.promiseTrade(account, nonce, modalOrder, amountWei)
                        .once('transactionHash', hash => {
                            AccountActions.nonceUpdated(nonce + 1)
                            TradeActions.sentTransaction(hash)
                            MyTradeActions.addMyTrade({
                                environment: Config.getReactEnv(),
                                account: account,
                                txHash: hash,
                                tokenAddress: selectedToken.address,
                                takerSide: takerSide,
                                price: modalOrder.price,
                                amountTok: fillAmount,
                                totalEth: modalOrder.price * fillAmount,
                                timestamp: (new Date()).toJSON(),
                                status: TransactionStatus.PENDING
                            })
                        })
                        .on('error', error => { console.log(`failed to trade: ${error.message}`) })
                        .then(receipt => {}) // when tx is mined - we regularly poll the blockchain so this can be empty here
                } else {
                    TradeActions.sendTransactionFailed("Failed to validate trade as of current block.")
                }
            })
    }

    render() {
        const {
            modal,
            modalOrder,
            fillAmount,
            fillAmountValid,
            fillAmountInvalidReason,
            selectedToken,
            exchangeBalanceTokWei,
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
                        value={fillAmount}
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
                        value={modalOrder.price * fillAmount} />
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