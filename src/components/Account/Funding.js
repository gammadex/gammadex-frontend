import React from "react"
import {Button, Alert, ModalBody, Modal, ModalFooter} from 'reactstrap'
import {BoxSection} from "../CustomComponents/Box"
import AccountStore from "../../stores/AccountStore"
import GasPriceStore from "../../stores/GasPriceStore"
import FundingStore from "../../stores/FundingStore"
import NumericInput from "../OrderPlacement/NumericInput"
import AccountType from "../../AccountType"
import * as FundingActions from "../../actions/FundingActions"
import GasPriceChooser from "../GasPriceChooser"
import {gweiToEth, safeBigNumber} from "../../EtherConversion"
import FundingModalType from "./FundingModalType"
import FundingState from "./FundingState"
import Round from "../CustomComponents/Round"

export default class Funding extends React.Component {
    constructor() {
        super()
        this.state = {
            accountState: {},
            currentGasPriceWei: null,
            ethereumPriceUsd: null,
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
        const {currentGasPriceWei, ethereumPriceUsd} = this.state
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
            tokWithdrawalText
        } = FundingStore.getFundingState()
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
        const {ethDepositAmountControlled} = this.state
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
        const {ethWithdrawalAmountControlled} = this.state
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
        const {tokenName} = this.props
        const {tokDepositAmountControlled} = this.state
        if (tokDepositAmountControlled != "" && !safeBigNumber(tokDepositAmountControlled).isZero()) {
            FundingActions.initiateFundingAction(FundingModalType.TOK_DEPOSIT, `Deposit ${tokDepositAmountControlled} ${tokenName} to exchange?`)
        }
    }

    onTokWithdrawAmountChange = (value) => {
        FundingActions.tokWithdrawalAmountChanged(value)
    }

    onMaxTokWithdrawAmount = () => {
        FundingActions.tokWithdrawMaxAmount()
    }

    onTokWithdrawAction = () => {
        const {tokenName} = this.props
        const {tokWithdrawalAmountControlled} = this.state
        if (tokWithdrawalAmountControlled != "" && !safeBigNumber(tokWithdrawalAmountControlled).isZero()) {
            FundingActions.initiateFundingAction(FundingModalType.TOK_WITHDRAWAL, `Withdraw ${tokWithdrawalAmountControlled} ${tokenName} from exchange?`)
        }
    }

    abortFundingAction() {
        FundingActions.abortFundingAction()
    }

    confirmFundingAction = () => {
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
            tokDepositErrorText: this.fundingActionErrorText(tokDepositState, tokDepositText),
            tokDepositFeedbackIcon: tokDepositState === FundingState.ERROR ? "fas fa-exclamation-triangle" : null
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
            ethWithdrawalErrorText: this.fundingActionErrorText(ethWithdrawalState, ethWithdrawalText),
            ethWithdrawalFeedbackIcon: ethWithdrawalState === FundingState.ERROR ? "fas fa-exclamation-triangle" : null
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
            tokWithdrawalErrorText: this.fundingActionErrorText(tokWithdrawalState, tokWithdrawalText),
            tokWithdrawalFeedbackIcon: tokWithdrawalState === FundingState.ERROR ? "fas fa-exclamation-triangle" : null
        }
    }

    disableFundingAction(fundingState) {
        return fundingState === FundingState.EMPTY || fundingState === FundingState.ERROR || AccountStore.selectedAccountType === AccountType.VIEW
    }

    fundingActionValid(fundingState) {
        return fundingState === FundingState.OK || fundingState === FundingState.EMPTY
    }

    fundingActionErrorText(fundingState, actionText) {
        return (fundingState === FundingState.WARNING || fundingState === FundingState.ERROR) ? actionText : ""
    }

    gasCostInfo(operationCost, currentGasPriceWei, ethereumPriceUsd) {
        if (currentGasPriceWei == null) {
            return ""
        } else {
            const currentGasPriceGwei = GasPriceChooser.safeWeiToGwei(currentGasPriceWei)
            const estimatedGasCost = gweiToEth(operationCost * currentGasPriceGwei)
            let usdFee = ""
            if (ethereumPriceUsd != null) {
                usdFee = ` (${(estimatedGasCost * ethereumPriceUsd).toFixed(3)} USD)`
            }
            return `${estimatedGasCost.toFixed(8)} Est. Gas Fee${usdFee}`
        }
    }

    render() {
        const {tokenName, walletBalanceEth, exchangeBalanceEth, walletBalanceTok, exchangeBalanceTok} = this.props

        const {
            accountState,
            ethDepositAmountControlled,
            tokDepositAmountControlled,
            ethWithdrawalAmountControlled,
            tokWithdrawalAmountControlled,
            modalType,
            modalText
        } = this.state

        const {selectedAccountType} = accountState

        const {
            ethDepositDisabled,
            ethDepositValid,
            ethDepositErrorText,
            ethDepositHelpText,
            ethDepositFeedbackIcon,
            ethDepositHelpIcon
        } = this.ethDepositInputProps()

        const {tokDepositDisabled, tokDepositValid, tokDepositErrorText, tokDepositFeedbackIcon} = this.tokDepositInputProps()
        const {ethWithdrawalDisabled, ethWithdrawalValid, ethWithdrawalErrorText, ethWithdrawalFeedbackIcon} = this.ethWithdrawalInputProps()
        const {tokWithdrawalDisabled, tokWithdrawalValid, tokWithdrawalErrorText} = this.tokWithdrawalInputProps()

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

        let modalBody = <ModalBody>{modalText}</ModalBody>
        if (selectedAccountType === AccountType.METAMASK && modalType === FundingModalType.TOK_DEPOSIT) {
            modalBody =
                <ModalBody>
                    <Alert color="info">
                        <h4 className="alert-heading">{modalText}</h4>
                        Depositing a Token involves submitting two transactions to the Ethereum network: Transfer Approval (1) followed by Deposit (2).
                        <hr/>
                        <strong>You will need to confirm both transactions in MetaMask.</strong>
                    </Alert>
                </ModalBody>
        }
        return <BoxSection id="balance-body" className="mobile-toggle">

            <table className="table table-borderless">
                <tbody>
                <tr>
                    <td rowSpan={2}><strong className="balance-token-name">{tokenName}</strong></td>
                    <td className="txt-right balances-heading">Wallet</td>
                    <td className="txt-right balances-heading">Exchange</td>
                </tr>
                <tr>
                    <td id="tdWalletBalanceTok" className="txt-right clickable balances-amount" onClick={() => FundingActions.tokDepositMaxAmount()}><Round fallback="-">{walletBalanceTok}</Round></td>
                    <td id="tdExchangeBalanceTok" className="txt-right clickable balances-amount" onClick={() => FundingActions.tokWithdrawMaxAmount()}><Round fallback="-">{exchangeBalanceTok}</Round></td>
                </tr>
                </tbody>
            </table>

            <NumericInput value={tokDepositAmountControlled}
                          onChange={this.onTokDepositAmountChange} fieldName={"tokDepositAmount"}
                          valid={tokDepositValid} errorMessage={tokDepositErrorText}
                          onMax={this.onMaxTokDepositAmount}
                          onAction={this.onTokDepositAction}
                          actionDisabled={tokDepositDisabled}
                          feedbackIcon={tokDepositFeedbackIcon}
                          actionName={"Deposit"}
                          submittable={true}/>

            <NumericInput value={tokWithdrawalAmountControlled}
                          onChange={this.onTokWithdrawAmountChange} fieldName={"tokWithdrawAmount"}
                          valid={tokWithdrawalValid} errorMessage={tokWithdrawalErrorText}
                          onMax={this.onMaxTokWithdrawAmount}
                          onAction={this.onTokWithdrawAction}
                          actionDisabled={tokWithdrawalDisabled}
                          feedbackIcon={ethDepositFeedbackIcon}
                          actionName={"Withdraw"}
                          submittable={true}/>

            <hr className="balances-separator"/>

            <table className="table table-borderless">
                <tbody>
                <tr>
                    <td rowSpan={2}><strong className="balance-token-name">ETH</strong></td>
                    <td className="txt-right balances-heading">Wallet</td>
                    <td className="txt-right balances-heading">Exchange</td>
                </tr>

                <tr>
                    <td id="tdWalletBalanceEth" className="txt-right clickable balances-amount" onClick={() => FundingActions.ethDepositMaxAmount()}><Round fallback="-">{walletBalanceEth}</Round></td>
                    <td id="tdExchangeBalanceEth" className="txt-right clickable balances-amount" onClick={() => FundingActions.ethWithdrawalMaxAmount()}><Round fallback="-">{exchangeBalanceEth}</Round></td>
                </tr>
                </tbody>
            </table>

            <NumericInput value={ethDepositAmountControlled}
                          onChange={this.onEthDepositAmountChange} fieldName={"ethDepositAmount"}
                          valid={ethDepositValid} errorMessage={ethDepositErrorText} helpMessage={ethDepositHelpText}
                          onMax={this.onMaxEthDepositAmount}
                          onAction={this.onEthDepositAction}
                          actionName={"Deposit"}
                          actionDisabled={ethDepositDisabled}
                          feedbackIcon={ethDepositFeedbackIcon}
                          helpIcon={ethDepositHelpIcon}
                          submittable={true}/>

            <NumericInput value={ethWithdrawalAmountControlled}
                          onChange={this.onEthWithdrawAmountChange} fieldName={"ethWithdrawAmount"}
                          valid={ethWithdrawalValid} errorMessage={ethWithdrawalErrorText}
                          onMax={this.onMaxEthWithdrawAmount}
                          onAction={this.onEthWithdrawAction}
                          actionDisabled={ethWithdrawalDisabled}
                          feedbackIcon={ethWithdrawalFeedbackIcon}
                          actionName={"Withdraw"}
                          submittable={true}/>

            <Modal isOpen={modalType != FundingModalType.NO_MODAL} toggle={this.abortFundingAction} className={this.props.className} keyboard>
                <ModalBody id='fundingModalBody'>{modalBody}</ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={this.abortFundingAction}>Abort</Button>{' '}
                    <Button id='fundingModalConfirmButton' color="primary" onClick={this.confirmFundingAction}>{confirmModalName}</Button>
                </ModalFooter>
            </Modal>
        </BoxSection>
    }
}