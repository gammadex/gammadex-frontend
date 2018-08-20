import React from "react"
import WalletStore from "../../stores/WalletStore"
import * as LedgerUtil from "../../util/LedgerUtil"
import * as WalletActions from "../../actions/WalletActions"
import {withRouter} from "react-router-dom"
import * as LedgerApi from "../../apis/LedgerApi"
import Conditional from "../CustomComponents/Conditional"

class Ledger extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            refreshError: null,
            errorName: null,
            errorMessage: null,
            selectedDerivationPathSource: "default",
            customDerivationPath: "",
            addressPage: 0,
            addressOffset: null,
            accounts: [],
            connecting: false,
        }

        this.onWalletStoreChange = this.onWalletStoreChange.bind(this)
        this.connectToLedger = this.connectToLedger.bind(this)
    }

    componentDidMount() {
        WalletStore.on("change", this.onWalletStoreChange)
    }

    componentWillUnmount() {
        WalletStore.removeListener("change", this.onWalletStoreChange)
    }

    onWalletStoreChange() {
        this.setState((prevState, props) => {
            const {
                accounts, errorName, errorMessage, selectedDerivationPathSource, customDerivationPath, addressPage, addressOffset, connecting
            } = WalletStore.getLedger()

            return {
                refreshError: WalletStore.getRefreshError(),
                accounts: accounts,
                errorName: errorName,
                errorMessage: errorMessage,
                selectedDerivationPathSource: selectedDerivationPathSource,
                customDerivationPath: customDerivationPath,
                addressPage: addressPage,
                addressOffset: addressOffset,
                connecting: connecting
            }
        })
    }

    connectToLedger(page) {
        const {connectPossible, validCustomDerivationPath} = this.validate()
        if (! connectPossible) {
            return
        }

        const derivationPath = this.getDerivationPath(page)

        LedgerApi.requestAddresses(derivationPath, page)
    }

    getDerivationPath(page) {
        const {selectedDerivationPathSource, customDerivationPath} = this.state
        const derivationPathBase = (selectedDerivationPathSource === "custom") ? customDerivationPath : "m/44'/60'/0'"
        const offset = page * 5

        return LedgerUtil.stripDerivationPathPrefix(derivationPathBase + "/" + offset)
    }

    initLedgerAccount = () => {
        const {addressOffset, addressPage} = this.state
        const derivationPath = this.getDerivationPath(addressPage)

        LedgerApi.initAccount(derivationPath, addressOffset, this.props.history)
    }

    derivationPathSourceChanged = (derivationPath) => {
        WalletActions.ledgerDerivationPathSourceSelected(derivationPath)
    }

    customDerivationPathChanged = (event) => {
        WalletActions.changeCustomDerivationPath(event.target.value)
    }

    ledgerAccountOffsetChanged = (offset) => {
        WalletActions.changeLedgerAddressOffset(offset)
    }

    render() {
        return this.getLedgerForm()
    }

    validate = () => {
        const {selectedDerivationPathSource, customDerivationPath, connecting} = this.state

        const validCustomDerivationPath = LedgerUtil.isDerivationPathValid(customDerivationPath)
        const connectPossible = !connecting && (validCustomDerivationPath || selectedDerivationPathSource === "default")

        return {connectPossible, validCustomDerivationPath}
    }

    getLedgerForm() {
        const {
            accounts, selectedDerivationPathSource, customDerivationPath, addressPage, addressOffset, connecting
        } = this.state

        const {connectPossible, validCustomDerivationPath} = this.validate()
        const connectButtonDisabledClass = connectPossible ? "" : "disabled"
        const customPathValidClass = (selectedDerivationPathSource === "custom" && validCustomDerivationPath) ? " is-valid" : ""

        const accountRows = accounts.map((account, index) => {
            const idx = index % 5

            return <div key={index} className="form-inline">
                <label>
                    <input type="radio" className="form-check-input" name="ledgerAccount" value={idx}
                           checked={idx === addressOffset}
                           onChange={() => this.ledgerAccountOffsetChanged(idx)}/>
                    {account}
                </label>
            </div>
        })

        const errorBlock = this.getErrorBlock()

        const connectingMessage = connecting ? <div className="alert alert-info" role="alert">Connecting to Ledger <i className=" ml-2 fas fa-lg fa-cog fa-spin"/></div> : null

        return <div>
            <h4>Use Ledger Wallet</h4>

            <h5>Choose HD derivation path</h5>

            <fieldset>
                <div className="form-inline">
                    <div className="form-group">
                        <label>
                            <input type="radio" className="form-check-input" name="derivationPath"
                                   value="default"
                                   checked={selectedDerivationPathSource === "default"}
                                   onChange={() => this.derivationPathSourceChanged("default")}/>

                            m/44'/60'/0'
                        </label>
                    </div>
                </div>

                <div className="form-inline">
                    <div className="form-group">
                        <label>
                            <input type="radio" className="form-check-input" name="derivationPath"
                                   value="custom"
                                   checked={selectedDerivationPathSource === "custom"}
                                   onChange={() => this.derivationPathSourceChanged("custom")}/>

                            Custom path
                        </label>

                        <div className="ml-5">
                            <input value={customDerivationPath}
                                   onChange={this.customDerivationPathChanged}
                                   onSelect={this.customDerivationPathChanged}
                                   className={"form-control " + customPathValidClass}
                            />
                        </div>
                    </div>
                </div>
            </fieldset>

            <div className="form-group">
                <button className={"btn btn-primary " + connectButtonDisabledClass}
                        onClick={() => this.connectToLedger(0)}>{accounts.length > 0 ? "Reconnect" : "Connect"}</button>
            </div>

            <Conditional displayCondition={accounts.length > 0}>

                <h5>Choose account</h5>

                {accountRows}

                <div className="form-group">
                    <div className="form-inline">
                        <Conditional displayCondition={addressPage > 0}>
                            <button className="btn btn-sm mr-2"
                                    onClick={() => this.connectToLedger(addressPage - 1)}>
                                prev accounts
                            </button>
                        </Conditional>

                        <button className="btn btn-sm mt-2"
                                onClick={() => this.connectToLedger(addressPage + 1)}>more accounts
                        </button>
                    </div>
                </div>

            </Conditional>

            <Conditional displayCondition={addressOffset !== null}>
                <div className="form-group">
                    <button className="btn btn-primary" onClick={this.initLedgerAccount}>Use account</button>
                </div>
            </Conditional>

            {errorBlock}

            {connectingMessage}
        </div>
    }

    getErrorBlock() {
        const errorText = this.getErrorText()

        if (errorText) {
            return <div className="form-group">
                <div className="alert alert-danger">
                    {errorText}
                </div>
            </div>
        } else {
            return null
        }
    }

    getErrorText() {
        const {refreshError, errorMessage, errorName} = this.state

        let text = null
        if (errorName === "TransportError") {
            text = errorMessage
        } else if (errorName === "TransportStatusError" || (errorMessage || "").toLowerCase().includes("transport") || (errorName || "").toLowerCase().includes("transport")) {
            text = <div><div>Could not connect to Ledger hardware. Please make sure it is plugged in and unlocked then try again.</div><div style={{"margin-top":"10px"}}><i>{errorMessage}</i></div></div>
        } else if (refreshError) {
            text = "Sorry, there was a problem. Please try again."
        }

        return text
    }
}

export default withRouter(Ledger)