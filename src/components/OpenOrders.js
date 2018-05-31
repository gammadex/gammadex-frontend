import React from "react"
import { Badge, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Tooltip, FormGroup, Label, Col } from 'reactstrap'
import OpenOrdersStore from "../stores/OpenOrdersStore"
import TokenStore from "../stores/TokenStore"
import OpenOrdersTable from "./OpenOrders/OpenOrdersTable"
import { Box, BoxSection, BoxHeader } from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import AccountStore from "../stores/AccountStore"
import * as OpenOrderApi from "../apis/OpenOrderApi"
import { tokenAddress, makerSide, tokenAmountWei } from "../OrderUtil"
import { tokWeiToEth, safeBigNumber } from "../EtherConversion"
import TokenListApi from "../apis/TokenListApi"
import OrderSide from "./../OrderSide"
import Conditional from "./CustomComponents/Conditional"
import _ from "lodash"
import Round from "./CustomComponents/Round"

export default class OpenOrders extends React.Component {
    constructor(props) {
        super(props)
        const {
            openOrders,
            pendingCancelIds,
            showConfirmModal,
            confirmModalOrder,
            gasPriceWei,
            showAllTokens } = OpenOrdersStore.getOpenOrdersState()
        this.state = {
            openOrders: openOrders,
            pendingCancelIds: pendingCancelIds,
            accountRetrieved: AccountStore.isAccountRetrieved(),
            showConfirmModal: false,
            confirmModalOrder: null,
            gasPriceWei: gasPriceWei,
            showAllTokens: showAllTokens
        }
        this.updateOpenOrdersState = this.updateOpenOrdersState.bind(this)
        this.accountStoreUpdated = this.accountStoreUpdated.bind(this)
        this.confirmCancel = this.confirmCancel.bind(this)
        this.abortCancel = this.abortCancel.bind(this)
    }

    componentWillMount() {
        OpenOrdersStore.on("change", this.updateOpenOrdersState)
        AccountStore.on("change", this.accountStoreUpdated)
    }

    componentWillUnmount() {
        OpenOrdersStore.removeListener("change", this.updateOpenOrdersState)
        AccountStore.removeListener("change", this.accountStoreUpdated)
    }

    updateOpenOrdersState() {
        const { openOrders, pendingCancelIds, showConfirmModal, confirmModalOrder, gasPriceWei, showAllTokens } = OpenOrdersStore.getOpenOrdersState()
        this.setState(
            {
                openOrders: openOrders,
                pendingCancelIds: pendingCancelIds,
                showConfirmModal: showConfirmModal,
                confirmModalOrder: confirmModalOrder,
                gasPriceWei: gasPriceWei,
                showAllTokens: showAllTokens
            })
    }

    accountStoreUpdated() {
        this.setState({
            accountRetrieved: AccountStore.isAccountRetrieved()
        })
    }

    confirmCancel() {
        const { confirmModalOrder, gasPriceWei } = this.state
        OpenOrderApi.hideCancelOrderModal()
        OpenOrderApi.cancelOpenOrder(confirmModalOrder, gasPriceWei)
    }

    abortCancel() {
        OpenOrderApi.hideCancelOrderModal()
    }

    handleShowAll = (event) => {
        OpenOrderApi.showAllTokensChanged(event.target.checked)
    }

    render() {
        const { openOrders, accountRetrieved, pendingCancelIds, showConfirmModal, confirmModalOrder, showAllTokens } = this.state

        let filteredOpenOrders = openOrders
        let tokCommited = 0
        if (!showAllTokens) {
            const currentToken = TokenStore.getSelectedTokenAddress()
            filteredOpenOrders = openOrders.filter(o => tokenAddress(o) === currentToken)
            tokCommited = _.sum(filteredOpenOrders.filter(o => makerSide(o) === OrderSide.SELL).map(o => Number(o.ethAvailableVolume)))
        }

        const ethCommited = _.sum(filteredOpenOrders.filter(o => makerSide(o) === OrderSide.BUY).map(o => Number(o.ethAvailableVolumeBase)))

        let content = <EmptyTableMessage>You have no open orders</EmptyTableMessage>
        if (!accountRetrieved) {
            content = <EmptyTableMessage>Please unlock a wallet to see your open orders</EmptyTableMessage>
        } else if (filteredOpenOrders && filteredOpenOrders.length > 0) {
            content = <OpenOrdersTable openOrders={filteredOpenOrders} pendingCancelIds={pendingCancelIds} />
        }

        let modalText = ""
        if (showConfirmModal && confirmModalOrder) {
            const side = makerSide(confirmModalOrder) === OrderSide.SELL ? "Sell" : "Buy"
            const tokenAddr = tokenAddress(confirmModalOrder)
            const tokenName = TokenListApi.getTokenName(tokenAddr)
            const tokenAmountEth = tokWeiToEth(tokenAmountWei(confirmModalOrder), tokenAddr)
            modalText = `Cancel ${side} ${tokenAmountEth.decimalPlaces(3)} ${tokenName} with price of ${confirmModalOrder.price} ETH?`
        }

        return (
            <div className="card">
                <div className="card-header">
                    <div className="row hdr-stretch">
                        <div className="col-lg-6">
                            <strong className="card-title">Open Orders</strong>
                        </div>
                        <div className="col-lg-6">
                            <div className="form-group">
                                <div className="custom-control custom-checkbox my-1 mr-sm-2 float-right">
                                    <input type="checkbox"
                                        className="custom-control-input"
                                        id="openOrdersAllTokens"
                                        onChange={this.handleShowAll}
                                        value="true"
                                        checked={showAllTokens} />
                                    <label className="custom-control-label" htmlFor="openOrdersAllTokens">Show All Tokens</label>
                                </div>
                                <div className="custom-control custom-checkbox my-1 mr-sm-2 float-right">
                                    <strong className="card-title"><Round>{ethCommited}</Round> ETH</strong>
                                </div>
                                <Conditional displayCondition={!showAllTokens}>
                                    <div className="custom-control custom-checkbox my-1 mr-sm-2 float-right">
                                        <strong className="card-title dimmed-heading"><Round>{tokCommited}</Round> {TokenStore.getSelectedToken().name}</strong>
                                    </div>
                                </Conditional>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    {content}
                </div>
                <Modal isOpen={showConfirmModal} toggle={this.abortCancel} className={this.props.className} keyboard>
                    <ModalBody>{modalText}</ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.abortCancel}>Abort</Button>{' '}
                        <Button color="primary" onClick={this.confirmCancel}>Cancel Order</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}