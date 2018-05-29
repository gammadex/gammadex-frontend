import React from "react"
import _ from "lodash"
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col, FormGroup, Alert, FormText, ModalBody, Modal, ModalFooter } from 'reactstrap'
import { Box, BoxSection, BoxHeader } from "../CustomComponents/Box"
import EmptyTableMessage from "../CustomComponents/EmptyTableMessage"
import OrderBookStore from "../../stores/OrderBookStore"
import TradeStore from "../../stores/TradeStore"
import AccountStore from "../../stores/AccountStore"
import GasPriceStore from "../../stores/GasPriceStore"
import FundingStore from "../../stores/FundingStore"
import NumericInput from "../OrderPlacement/NumericInput"
import { priceOf, isTakerSell } from "../../OrderUtil.js"
import OrderSide from "../../OrderSide"
import OrderEntryField from "../../OrderEntryField"
import * as TradeActions from "../../actions/TradeActions"
import * as FundingActions from "../../actions/FundingActions"
import Config from "../../Config"
import Conditional from "../CustomComponents/Conditional"
import GasPriceChooser from "../GasPriceChooser"
import { OperationWeights } from "../../ContractOperations"
import { gweiToEth, safeBigNumber } from "../../EtherConversion"
import FundingModalType from "./FundingModalType"
import FundingState from "./FundingState"
import { findBin } from "plotly.js/src/lib";

export default class Funding extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            accountState: {},
            currentGasPriceWei: 4000000000, // 4 gwei
            ethereumPriceUsd: 700.0,// TODO, eugh - how should the ui handle no USD price?
            ethDepositAmountControlled: "",
            ethDepositState: FundingState.EMPTY,
            ethDepositText: "",
            tokDepositAmountControlled: "",
            tokDepositState: FundingState.EMPTY,
            tokDepositText: "",
            ethWithdrawalAmountControlled: "",
            ethWithdrawalState: FundingState.EMPTY,
            ethWithdrawalText: "",
            tokWithdrawalAmountControlled: "",
            tokWithdrawalState: FundingState.EMPTY,
            tokWithdrawalText: "",
            modalType: FundingModalType.NO_MODAL,
            modalText: ""
        }
        this.saveGasPrices = this.saveGasPrices.bind(this)
        this.saveFundingState = this.saveFundingState.bind(this)
        this.onAccountChange = this.onAccountChange.bind(this)

        this.ethDepositInputProps = this.ethDepositInputProps.bind(this)
        this.tokDepositInputProps = this.tokDepositInputProps.bind(this)
        this.ethWithdrawalInputProps = this.ethWithdrawalInputProps.bind(this)
        this.tokWithdrawalInputProps = this.tokWithdrawalInputProps.bind(this)

    }

    componentDidMount() {
        GasPriceStore.on("change", this.saveGasPrices)
        FundingStore.on("change", this.saveFundingState)
        AccountStore.on("change", this.onAccountChange)
        this.saveGasPrices()
        this.saveFundingState()
        this.onAccountChange()
    }

    componentWillUnmount() {
        GasPriceStore.removeListener("change", this.saveGasPrices)
        FundingStore.removeListener("change", this.saveFundingState)
        AccountStore.removeListener("change", this.onAccountChange)
    }

    saveGasPrices() {
        const { currentGasPriceWei, ethereumPriceUsd } = this.state
        this.setState({
            currentGasPriceWei: GasPriceStore.getCurrentGasPriceWei() == null ? currentGasPriceWei : GasPriceStore.getCurrentGasPriceWei(),
            ethereumPriceUsd: GasPriceStore.getEthereumPriceUsd() == null ? ethereumPriceUsd : GasPriceStore.getEthereumPriceUsd()
        })
    }

    saveFundingState() {
        const {
            ethDepositAmountControlled,
            tokDepositAmountControlled,
            ethWithdrawalAmountControlled,
            tokWithdrawalAmountControlled,
            modalType,
            modalText,
            ethDepositState,
            ethDepositText,
            tokDepositState,
            tokDepositText,
            ethWithdrawalState,
            ethWithdrawalText,
            tokWithdrawalState,
            tokWithdrawalText } = FundingStore.getFundingState()
        this.setState({
            ethDepositAmountControlled: ethDepositAmountControlled,
            tokDepositAmountControlled: tokDepositAmountControlled,
            ethWithdrawalAmountControlled: ethWithdrawalAmountControlled,
            tokWithdrawalAmountControlled: tokWithdrawalAmountControlled,
            ethDepositState: ethDepositState,
            ethDepositText: ethDepositText,
            tokDepositState: tokDepositState,
            tokDepositText: tokDepositText,
            ethWithdrawalState: ethWithdrawalState,
            ethWithdrawalText: ethWithdrawalText,
            tokWithdrawalState: tokWithdrawalState,
            tokWithdrawalText: tokWithdrawalText,
            modalType: modalType,
            modalText: modalText
        })
    }

    onAccountChange() {
        this.setState({
            accountState: AccountStore.getAccountState()
        })
    }

    onEthDepositAmountChange = (value) => {
        FundingActions.ethDepositAmountChanged(value)
    }

    onMaxEthDepositAmount = () => {
        FundingActions.ethDepositMaxAmount()
    }

    onEthDepositAction = () => {
        const { ethDepositAmountControlled } = this.state
        if (ethDepositAmountControlled != "" && !safeBigNumber(ethDepositAmountControlled).isZero()) {
            FundingActions.initiateFundingAction(FundingModalType.ETH_DEPOSIT, `Deposit ${ethDepositAmountControlled} ETH to exchange?`)
        }
    }

    onEthWithdrawAmountChange = (value) => {
        FundingActions.ethWithdrawalAmountChanged(value)
    }

    onMaxEthWithdrawAmount = () => {
        FundingActions.ethWithdrawalMaxAmount()
    }

    onEthWithdrawAction = () => {
        const { ethWithdrawalAmountControlled } = this.state
        if (ethWithdrawalAmountControlled != "" && !safeBigNumber(ethWithdrawalAmountControlled).isZero()) {
            FundingActions.initiateFundingAction(FundingModalType.ETH_WITHDRAWAL, `Withdraw ${ethWithdrawalAmountControlled} ETH from exchange?`)
        }
    }

    onTokDepositAmountChange = (value) => {
        FundingActions.tokDepositAmountChanged(value)
    }

    onMaxTokDepositAmount = () => {
        FundingActions.tokDepositMaxAmount()
    }

    onTokDepositAction = () => {
        const { tokenName } = this.props
        const { tokDepositAmountControlled } = this.state
        if (tokDepositAmountControlled != "" && !safeBigNumber(tokDepositAmountControlled).isZero()) {
            FundingActions.initiateFundingAction(FundingModalType.TOK_DEPOSIT, `Deposit ${tokDepositAmountControlled} ${tokenName} to exchange? TODO metamask warning...`)
        }
    }

    onTokWithdrawAmountChange = (value) => {
        FundingActions.tokWithdrawalAmountChanged(value)
    }

    onMaxTokWithdrawAmount = () => {
        FundingActions.tokWithdrawMaxAmount()
    }

    onTokWithdrawAction = () => {
        const { tokenName } = this.props
        const { tokWithdrawalAmountControlled } = this.state
        if (tokWithdrawalAmountControlled != "" && !safeBigNumber(tokWithdrawalAmountControlled).isZero()) {
            FundingActions.initiateFundingAction(FundingModalType.TOK_WITHDRAWAL, `Withdraw ${tokWithdrawalAmountControlled} ${tokenName} from exchange?`)
        }
    }

    abortFundingAction() {
        FundingActions.abortFundingAction()
    }

    confirmFundingAction = (event) => {
        FundingActions.confirmFundingAction()
    }

    ethDepositInputProps() {
        const {
            ethDepositState,
            ethDepositText
        } = this.state
        let ethDepositFeedbackIcon = null
        let ethDepositHelpIcon = null
        if (ethDepositState === FundingState.ERROR) {
            ethDepositFeedbackIcon = "fas fa-exclamation-triangle"
        } else if (ethDepositState === FundingState.WARNING) {
            ethDepositFeedbackIcon = "fas fa-gas-pump"
        } else if (ethDepositState === FundingState.OK) {
            ethDepositHelpIcon = "fas fa-gas-pump"
        }
        return {
            ethDepositDisabled: this.disableFundingAction(ethDepositState),
            ethDepositValid: this.fundingActionValid(ethDepositState),
            ethDepositErrorText: this.fundingActionErrorText(ethDepositState, ethDepositText),
            ethDepositHelpText: ethDepositState === FundingState.OK ? ethDepositText : "",
            ethDepositFeedbackIcon,
            ethDepositHelpIcon
        }
    }

    tokDepositInputProps() {
        const {
            tokDepositState,
            tokDepositText
        } = this.state

        return {
            tokDepositDisabled: this.disableFundingAction(tokDepositState),
            tokDepositValid: this.fundingActionValid(tokDepositState),
            tokDepositErrorText: this.fundingActionErrorText(tokDepositState, tokDepositText)
        }
    }

    ethWithdrawalInputProps() {
        const {
            ethWithdrawalState,
            ethWithdrawalText
        } = this.state

        return {
            ethWithdrawalDisabled: this.disableFundingAction(ethWithdrawalState),
            ethWithdrawalValid: this.fundingActionValid(ethWithdrawalState),
            ethWithdrawalErrorText: this.fundingActionErrorText(ethWithdrawalState, ethWithdrawalText)
        }
    }

    tokWithdrawalInputProps() {
        const {
            tokWithdrawalState,
            tokWithdrawalText
        } = this.state
        
        return {
            tokWithdrawalDisabled: this.disableFundingAction(tokWithdrawalState),
            tokWithdrawalValid: this.fundingActionValid(tokWithdrawalState),
            tokWithdrawalErrorText: this.fundingActionErrorText(tokWithdrawalState, tokWithdrawalText)
        }
    }

    disableFundingAction(fundingState) {
        return fundingState === FundingState.EMPTY || fundingState === FundingState.ERROR
    }

    fundingActionValid(fundingState) {
        return fundingState === FundingState.OK || fundingState === FundingState.EMPTY
    }

    fundingActionErrorText(fundingState, actionText) {
        return (fundingState === FundingState.WARNING || fundingState === FundingState.ERROR) ? actionText : ""
    }

    render() {
        const { tokenName } = this.props

        const {
            currentGasPriceWei,
            ethereumPriceUsd,
            ethDepositAmountControlled,
            tokDepositAmountControlled,
            ethWithdrawalAmountControlled,
            tokWithdrawalAmountControlled,
            modalType,
            modalText
        } = this.state

        const currentGasPriceGwei = GasPriceChooser.safeWeiToGwei(currentGasPriceWei)
        const estimatedOperationCost = OperationWeights.DEPOSIT
        const estimatedGasCost = gweiToEth(estimatedOperationCost * currentGasPriceGwei)

        const {
            ethDepositDisabled,
            ethDepositValid,
            ethDepositErrorText,
            ethDepositHelpText,
            ethDepositFeedbackIcon,
            ethDepositHelpIcon } = this.ethDepositInputProps()

        const { tokDepositDisabled, tokDepositValid, tokDepositErrorText } = this.tokDepositInputProps()
        const { ethWithdrawalDisabled, ethWithdrawalValid, ethWithdrawalErrorText } = this.ethWithdrawalInputProps()
        const { tokWithdrawalDisabled, tokWithdrawalValid, tokWithdrawalErrorText } = this.tokWithdrawalInputProps()

        let confirmModalName = ""
        switch (modalType) {
            case FundingModalType.ETH_DEPOSIT:
                confirmModalName = "Deposit ETH"
                break
            case FundingModalType.ETH_WITHDRAWAL:
                confirmModalName = "Withdraw ETH"
                break
            case FundingModalType.TOK_DEPOSIT:
                confirmModalName = `Deposit ${tokenName}`
                break
            case FundingModalType.TOK_WITHDRAWAL:
                confirmModalName = `Withdraw ${tokenName}`
                break
            default:
                confirmModalName = ""
        }

        return <BoxSection className={"order-box"}>
            <NumericInput value={ethDepositAmountControlled} unitName={"ETH"}
                onChange={this.onEthDepositAmountChange} fieldName={"ethDepositAmount"}
                valid={ethDepositValid} errorMessage={ethDepositErrorText} helpMessage={ethDepositHelpText}
                onMax={this.onMaxEthDepositAmount}
                onAction={this.onEthDepositAction}
                actionName={"Deposit"}
                actionDisabled={ethDepositDisabled}
                feedbackIcon={ethDepositFeedbackIcon}
                helpIcon={ethDepositHelpIcon} />
            {/* <hr /> */}

            <NumericInput value={tokDepositAmountControlled} unitName={tokenName}
                onChange={this.onTokDepositAmountChange} fieldName={"tokDepositAmount"}
                valid={tokDepositValid} errorMessage={tokDepositErrorText}
                onMax={this.onMaxTokDepositAmount}
                onAction={this.onTokDepositAction}
                actionDisabled={tokDepositDisabled}
                actionName={"Deposit"} />
            <hr />
            <NumericInput value={ethWithdrawalAmountControlled} unitName={"ETH"}
                onChange={this.onEthWithdrawAmountChange} fieldName={"ethWithdrawAmount"}
                valid={ethWithdrawalValid} errorMessage={ethWithdrawalErrorText}
                onMax={this.onMaxEthWithdrawAmount}
                onAction={this.onEthWithdrawAction}
                actionDisabled={ethWithdrawalDisabled}
                actionName={"Withdraw"} />
            {/* <hr /> */}

            <NumericInput value={tokWithdrawalAmountControlled} unitName={tokenName}
                onChange={this.onTokWithdrawAmountChange} fieldName={"tokWithdrawAmount"}
                valid={tokWithdrawalValid} errorMessage={tokWithdrawalErrorText}
                onMax={this.onMaxTokWithdrawAmount}
                onAction={this.onTokWithdrawAction}
                actionDisabled={tokWithdrawalDisabled}
                actionName={"Withdraw"} />
            <hr />
            <NumericInput name="Est. Gas Fee" value={estimatedGasCost.toFixed(8)} unitName="ETH"
                fieldName={"fundingGasFeeEth"} disabled="true" />
            <NumericInput name="" value={(estimatedGasCost * ethereumPriceUsd).toFixed(3)} unitName="USD"
                fieldName={"fundingGasFeeUsd"} disabled="true" helpMessage="Estimated cost to submit and execute this transaction on the Ethereum network." />
            <Modal isOpen={modalType != FundingModalType.NO_MODAL} toggle={this.abortFundingAction} className={this.props.className} keyboard>
                <ModalBody>{modalText}</ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={this.abortFundingAction}>Abort</Button>{' '}
                    <Button color="primary" onClick={this.confirmFundingAction}>{confirmModalName}</Button>
                </ModalFooter>
            </Modal>
        </BoxSection>
    }
}