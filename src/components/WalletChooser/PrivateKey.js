import React from "react"
import WalletStore from "../../stores/WalletStore"
import * as EthJsUtil from "ethereumjs-util"
import EtherDeltaWeb3 from "../../EtherDeltaWeb3"
import * as AccountActions from "../../actions/AccountActions"
import * as KeyUtil from "../../util/KeyUtil"
import AccountType from "../../AccountType"

export default class PrivateKey extends React.Component {
    state = {
        completedAccount: null,
    }

    componentDidMount() {
        WalletStore.on("change", this.onWalletStoreChange)
    }

    componentWillUnmount() {
        WalletStore.removeListener("change", this.onWalletStoreChange)
    }

    onWalletStoreChange = () => {
        this.setState((prevState, props) => {
            return {
                completedAccount: WalletStore.getCompletedAccount(),
            }
        })
    }

    privateKeyChanged = (event) => {
        const enteredPrivateKey = event.target.value
        const privateKeyBuffer = EthJsUtil.toBuffer(EthJsUtil.addHexPrefix(enteredPrivateKey))
        const noHexPrefixPrivateKey = KeyUtil.removeHexPrefix(enteredPrivateKey)
        const isValidPrivateKey = EthJsUtil.isValidPrivate(privateKeyBuffer)
        const address = (isValidPrivateKey) ? EthJsUtil.bufferToHex(EthJsUtil.privateToAddress(privateKeyBuffer)) : "";

        if (event && event.target) {
            this.setState((prevState, props) => ({
                enteredPrivateKey,
                privateKey: noHexPrefixPrivateKey,
                isValidPrivateKey,
                privateKeyAddress: address
            }))
        }
    }

    selectPrivateKey = () => {
        const {isValidPrivateKey, privateKey, privateKeyAddress} = this.state

        if (isValidPrivateKey) {
            EtherDeltaWeb3.initForPrivateKey(privateKeyAddress, privateKey)
            AccountActions.refreshAccount(AccountType.PRIVATE_KEY)
        }
    }

    render() {
        const {completedAccount} = this.state

        if (completedAccount) {
            return this.getUnlockedMessage()
        } else {
            return this.getPrivateKeyForm()
        }
    }

    getUnlockedMessage() {
        return <div>
            <div className="alert alert-success">
                You are now logged in with a private key wallet
            </div>
        </div>
    }

    getPrivateKeyForm() {
        const {isValidPrivateKey, enteredPrivateKey} = this.state

        const privateKeyClassName = this.getKeyInputClassName(enteredPrivateKey, isValidPrivateKey)
        const privateKeySubmitDisabledClass = isValidPrivateKey ? "" : "disabled"

        return <div>
            <h4>Use Private Key</h4>
            <form>
                <div className="form-group">
                        <textarea className={"form-control " + privateKeyClassName}
                                  onChange={this.privateKeyChanged}
                                  value={enteredPrivateKey}/>
                </div>
                <a href="#" className={"btn btn-primary " + privateKeySubmitDisabledClass}
                   onClick={this.selectPrivateKey}>Unlock</a>
            </form>
        </div>
    }

    getKeyInputClassName(enteredPrivateKey, isValidPrivateKey) {
        const displayPrivateKeyWarning = (enteredPrivateKey && !isValidPrivateKey)

        if (displayPrivateKeyWarning) {
            return "form-control-warning"
        } else if (isValidPrivateKey) {
            return "form-control-success"
        } else {
            return ""
        }
    }

}