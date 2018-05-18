import React from "react"
import { Badge, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Tooltip } from 'reactstrap'
import OpenOrdersStore from "../stores/OpenOrdersStore"
import OpenOrdersTable from "./OpenOrders/OpenOrdersTable"
import { Box } from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import AccountStore from "../stores/AccountStore"
import * as OpenOrderApi from "../apis/OpenOrderApi"
import { tokenAddress, makerSide, tokenAmountWei } from "../OrderUtil"
import { tokWeiToEth, safeBigNumber } from "../EtherConversion"
import TokenListApi from "../apis/TokenListApi"
import OrderSide from "./../OrderSide"

export default class OpenOrders extends React.Component {
    constructor(props) {
        super(props)
        const { openOrders, pendingCancelIds, showConfirmModal, confirmModalOrder, gasPriceWei } = OpenOrdersStore.getOpenOrdersState()
        this.state = {
            openOrders: openOrders,
            pendingCancelIds: pendingCancelIds,
            accountRetrieved: AccountStore.isAccountRetrieved(),
            showConfirmModal: false,
            confirmModalOrder: null,
            gasPriceWei: gasPriceWei
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
        const { openOrders, pendingCancelIds, showConfirmModal, confirmModalOrder, gasPriceWei } = OpenOrdersStore.getOpenOrdersState()
        this.setState(
            {
                openOrders: openOrders,
                pendingCancelIds: pendingCancelIds,
                showConfirmModal: showConfirmModal,
                confirmModalOrder: confirmModalOrder,
                gasPriceWei: gasPriceWei
            })
    }

    accountStoreUpdated() {
        this.setState({
            accountRetrieved: AccountStore.isAccountRetrieved()
        })
    }

    confirmCancel() {
        const { confirmModalOrder, gasPriceWei} = this.state
        OpenOrderApi.hideCancelOrderModal()
        OpenOrderApi.cancelOpenOrder(confirmModalOrder, gasPriceWei)
    }

    abortCancel() {
        OpenOrderApi.hideCancelOrderModal()
    }

    render() {
        const { openOrders, accountRetrieved, pendingCancelIds, showConfirmModal, confirmModalOrder } = this.state

        let content = <EmptyTableMessage>You have no open orders</EmptyTableMessage>
        if (!accountRetrieved) {
            content = <EmptyTableMessage>Please unlock a wallet to see your open orders</EmptyTableMessage>
        } else if (openOrders && openOrders.length > 0) {
            content = <OpenOrdersTable openOrders={openOrders} pendingCancelIds={pendingCancelIds} />
        }

        let modalText = ""
        if(showConfirmModal && confirmModalOrder) {
            const side = makerSide(confirmModalOrder) === OrderSide.SELL ? "Sell" : "Buy"
            const tokenAddr = tokenAddress(confirmModalOrder)
            const tokenName = TokenListApi.getTokenName(tokenAddr)
            const tokenAmountEth = tokWeiToEth(tokenAmountWei(confirmModalOrder), tokenAddr)
            modalText = `Cancel ${side} ${tokenAmountEth.decimalPlaces(3)} ${tokenName} with price of ${confirmModalOrder.price} ETH?`
        }

        return (
            <span>
                <Box title="Open Orders">
                    {content}
                </Box>
                <Modal isOpen={showConfirmModal} toggle={this.abortCancel} className={this.props.className}>
                    <ModalBody>{modalText}</ModalBody>
                    <ModalFooter>
                        <Button color="danger" onClick={this.confirmCancel}>Cancel Order</Button>{' '}
                        <Button color="secondary" onClick={this.abortCancel}>Abort</Button>
                    </ModalFooter>
                </Modal>
            </span>
        )
    }
}