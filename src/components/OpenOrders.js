import React from "react"
import {
    Badge,
    Button,
    Input,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Tooltip,
    FormGroup,
    Label,
    Col
} from 'reactstrap'
import OpenOrdersStore from "../stores/OpenOrdersStore"
import TokenStore from "../stores/TokenStore"
import GasPriceStore from "../stores/GasPriceStore"
import OpenOrdersTable from "./OpenOrders/OpenOrdersTable"
import {Box, BoxSection, BoxHeader} from "./CustomComponents/Box"
import EmptyTableMessage from "./CustomComponents/EmptyTableMessage"
import AccountStore from "../stores/AccountStore"
import * as OpenOrderApi from "../apis/OpenOrderApi"
import {tokenAddress, makerSide, tokenAmountWei} from "../OrderUtil"
import {tokWeiToEth, safeBigNumber, gweiToEth} from "../EtherConversion"
import TokenRepository from "../util/TokenRepository"
import OrderSide from "./../OrderSide"
import Conditional from "./CustomComponents/Conditional"
import _ from "lodash"
import Round from "./CustomComponents/Round"
import MarketResponseSpinner from "./MarketResponseSpinner"
import GasPriceChooser from "./GasPriceChooser"
import {OperationCosts} from "../ContractOperations"
import CustomScroll from 'react-custom-scroll'
import 'react-custom-scroll/dist/customScroll.css'

export default class OpenOrders extends React.Component {
    constructor(props) {
        super(props)
        const {
            openOrders,
            pendingCancelIds,
            showConfirmModal,
            confirmModalOrder,
            gasPriceWei,
        } = OpenOrdersStore.getOpenOrdersState()
        this.state = {
            openOrders: openOrders,
            pendingCancelIds: pendingCancelIds,
            accountRetrieved: AccountStore.isAccountRetrieved(),
            showConfirmModal: false,
            confirmModalOrder: null,
            gasPriceWei: gasPriceWei,
            currentGasPriceWei: null,
            ethereumPriceUsd: null
        }
        this.updateOpenOrdersState = this.updateOpenOrdersState.bind(this)
        this.accountStoreUpdated = this.accountStoreUpdated.bind(this)
        this.confirmCancel = this.confirmCancel.bind(this)
        this.abortCancel = this.abortCancel.bind(this)
        this.saveGasPrices = this.saveGasPrices.bind(this)
        this.tokenStoreUpdated = this.tokenStoreUpdated.bind(this)
    }

    componentWillMount() {
        OpenOrdersStore.on("change", this.updateOpenOrdersState)
        AccountStore.on("change", this.accountStoreUpdated)
        GasPriceStore.on("change", this.saveGasPrices)
        TokenStore.on("change", this.tokenStoreUpdated)
        this.saveGasPrices()
    }

    componentDidMount() {
        this.tokenStoreUpdated()
    }

    componentWillUnmount() {
        OpenOrdersStore.removeListener("change", this.updateOpenOrdersState)
        AccountStore.removeListener("change", this.accountStoreUpdated)
        GasPriceStore.removeListener("change", this.saveGasPrices)
        TokenStore.removeListener("change", this.tokenStoreUpdated)
    }

    updateOpenOrdersState() {
        const {openOrders, pendingCancelIds, showConfirmModal, confirmModalOrder, gasPriceWei } = OpenOrdersStore.getOpenOrdersState()
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

    tokenStoreUpdated() {
        this.setState({
            currentTokenSymbol: TokenStore.getSelectedTokenSymbol(),
            currentTokenAddress: TokenStore.getSelectedTokenAddress()
        })
    }

    saveGasPrices() {
        const {currentGasPriceWei, ethereumPriceUsd} = this.state
        this.setState({
            currentGasPriceWei: GasPriceStore.getCurrentGasPriceWei() == null ? currentGasPriceWei : GasPriceStore.getCurrentGasPriceWei(),
            ethereumPriceUsd: GasPriceStore.getEthereumPriceUsd() == null ? ethereumPriceUsd : GasPriceStore.getEthereumPriceUsd()
        })
    }

    confirmCancel() {
        const {confirmModalOrder, gasPriceWei} = this.state
        OpenOrderApi.hideCancelOrderModal()
        OpenOrderApi.cancelOpenOrder(confirmModalOrder, gasPriceWei)
    }

    abortCancel() {
        OpenOrderApi.hideCancelOrderModal()
    }

    render() {
        const {
            openOrders, accountRetrieved, pendingCancelIds, showConfirmModal, confirmModalOrder,
            currentGasPriceWei, ethereumPriceUsd, currentTokenSymbol, currentTokenAddress
        } = this.state

        const { showAllTokens } = this.props

        let filteredOpenOrders = openOrders
        let tokCommited = 0
        if (!showAllTokens && currentTokenAddress) {
            filteredOpenOrders = openOrders.filter(o => tokenAddress(o).toLowerCase() === currentTokenAddress.toLowerCase())
            tokCommited = _.sum(filteredOpenOrders.filter(o => makerSide(o) === OrderSide.SELL).map(o => Number(o.ethAvailableVolume)))
        }

        const ethCommited = _.sum(filteredOpenOrders.filter(o => makerSide(o) === OrderSide.BUY).map(o => Number(o.ethAvailableVolumeBase)))

        let content = <EmptyTableMessage>You have no open orders</EmptyTableMessage>
        if (!accountRetrieved) {
            content = <EmptyTableMessage>Please unlock a wallet to see your open orders</EmptyTableMessage>
        } else if (filteredOpenOrders && filteredOpenOrders.length > 0) {
            content = <OpenOrdersTable openOrders={filteredOpenOrders} pendingCancelIds={pendingCancelIds}/>
        }

        let modalText = ""
        if (showConfirmModal && confirmModalOrder) {
            const side = makerSide(confirmModalOrder) === OrderSide.SELL ? "Sell" : "Buy"
            const tokenAddr = tokenAddress(confirmModalOrder)
            const tokenName = TokenRepository.getTokenName(tokenAddr)
            const tokenAmountEth = tokWeiToEth(tokenAmountWei(confirmModalOrder), tokenAddr)
            modalText = `Cancel ${side} ${tokenAmountEth.decimalPlaces(3)} ${tokenName} with price of ${confirmModalOrder.price} ETH?`
        }


        let modalFeeText = ""
        if (currentGasPriceWei != null) {
            const currentGasPriceGwei = GasPriceChooser.safeWeiToGwei(currentGasPriceWei)
            const estimatedGasCost = gweiToEth(OperationCosts.CANCEL_ORDER * currentGasPriceGwei)
            let usdFee = ""
            if (ethereumPriceUsd != null) {
                usdFee = ` (${(estimatedGasCost * ethereumPriceUsd).toFixed(3)} USD)`
            }
            modalFeeText = `${estimatedGasCost.toFixed(8)} Est. Gas Fee${usdFee}`
        }

        return (
            <div className="open-orders-component">
                <CustomScroll heightRelativeToParent="100%">
                {content}
                </CustomScroll>

                <Modal isOpen={showConfirmModal} toggle={this.abortCancel} className={this.props.className} keyboard>
                    <ModalBody>{modalText}<br/>
                        <small className='text-muted'>{modalFeeText}</small>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.abortCancel}>Abort</Button>{' '}
                        <Button color="primary" onClick={this.confirmCancel}>Cancel Order</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}