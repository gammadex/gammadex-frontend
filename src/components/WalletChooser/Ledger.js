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
            completedAccount: null,
            refreshError: null,
            errorName: null,
            errorMessage: null,
            selectedDerivationPathSource: "default",
            customDerivationPath: "",
            addressPage: 0,
            addressOffset: null,
            accounts: []
        }

        this.onWalletStoreChange = this.onWalletStoreChange.bind(this)
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
                accounts, errorName, errorMessage, selectedDerivationPathSource, customDerivationPath, addressPage, addressOffset
            } = WalletStore.getLedger()

            console.log(addressPage, "setState")

            return {
                completedAccount: WalletStore.getCompletedAccount(),
                refreshError: WalletStore.getRefreshError(),
                accounts: accounts,
                errorName: errorName,
                errorMessage: errorMessage,
                selectedDerivationPathSource: selectedDerivationPathSource,
                customDerivationPath: customDerivationPath,
                addressPage: addressPage,
                addressOffset: addressOffset
            }
        })
    }

    doConnectToLedger = () => {
        WalletActions.changeLedgerAddressPage(0)
        this.connectToLedger()
    }

    connectToLedger = () => {
        const derivationPath = this.getDerivationPath()

        LedgerApi.requestAddresses(derivationPath)
    }

    getDerivationPath() {
        const {selectedDerivationPathSource, customDerivationPath, addressPage} = this.state
        const derivationPathBase = (selectedDerivationPathSource === "custom") ? customDerivationPath : "m/44'/60'/0'"
        const offset = addressPage * 5

        console.log(addressPage)

        return LedgerUtil.stripDerivationPathPrefix(derivationPathBase + "/" + offset)
    }

    initLedgerAccount = () => {
        const {addressOffset} = WalletStore.getLedger()
        const derivationPath = this.getDerivationPath()

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

    ledgerAccountPageChanged = (page) => {
        WalletActions.changeLedgerAddressPage(page)
        this.connectToLedger()
    }

    render() {
        const {completedAccount} = this.state

        if (completedAccount) {
            return this.getUnlockedMessage()
        } else {
            return this.getLedgerForm()
        }
    }

    getUnlockedMessage() {
        return <div>
            <div className="alert alert-success">
                You are now logged in with a ledger wallet
            </div>
        </div>
    }

    getLedgerForm() {
        const {
            accounts, selectedDerivationPathSource, customDerivationPath, addressPage, addressOffset
        } = this.state

        const validCustomDerivationPath = LedgerUtil.isDerivationPathValid(customDerivationPath)
        const connectPossible = validCustomDerivationPath || selectedDerivationPathSource == "default"
        const connectButtonDisabledClass = connectPossible ? "" : "disabled"

        const accountRows = accounts.map((account, index) => {
            const idx = index % 5

            return <div key={index}>
                <label>
                    <input type="radio" name="ledgerAccount" value={idx} checked={idx === addressOffset}
                           onChange={() => this.ledgerAccountOffsetChanged(idx)}/>
                    {account}
                </label>
            </div>
        })

        const errorBlock = this.getErrorBlock()

        return <div>
            <h4>Use Ledger Wallet</h4>

            <h5>Choose HD derivation path</h5>

            <fieldset>
                <div className="form-check">
                    <label>
                        <input type="radio" className="form-check-input" name="derivationPath"
                               value="default"
                               checked={selectedDerivationPathSource === "default"}
                               onChange={() => this.derivationPathSourceChanged("default")}/>

                        m/44'/60'/0'
                    </label>
                </div>

                <div className="form-check">
                    <label>
                        <input type="radio" className="form-check-input" name="derivationPath"
                               value="custom"
                               checked={selectedDerivationPathSource === "custom"}
                               onChange={() => this.derivationPathSourceChanged("custom")}/>

                        Custom path
                    </label>

                    <input value={customDerivationPath} onChange={this.customDerivationPathChanged} onSelect={this.customDerivationPathChanged}/>
                </div>
            </fieldset>

            <div className="form-group">
                <button href="#" className={"btn btn-primary " + connectButtonDisabledClass}
                        onClick={this.doConnectToLedger}>{accounts.length > 0 ? "Reconnect" : "Connect"}</button>
            </div>

            <Conditional displayCondition={accounts.length > 0}>
                <table>
                    <tbody>
                    {accountRows}
                    </tbody>
                </table>

                <Conditional displayCondition={addressPage > 0}>
                    <button onClick={() => this.ledgerAccountPageChanged(addressPage - 1)}>prev</button>
                </Conditional>

                <button onClick={() => this.ledgerAccountPageChanged(addressPage + 1)}>next</button>
            </Conditional>

            <Conditional displayCondition={addressOffset !== null}>
                <div>
                    <button href="#" className="btn btn-primary" onClick={this.initLedgerAccount}>Use account</button>
                </div>
            </Conditional>

            {errorBlock}
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
        } else if (errorName === "TransportStatusError") {
            text = "Could not connect to Ledger hardware. Please make sure it is plugged in an unlocked then try again."
        } else if (refreshError) {
            text = "Sorry, there was a problem. Please try again."
        }

        return text
    }
}

export default withRouter(Ledger)