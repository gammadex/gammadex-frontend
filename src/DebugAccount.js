import React, {Component} from 'react'
import {Box, BoxSection} from "./components/CustomComponents/Box"
import * as EthJsUtil from "ethereumjs-util"
import EtherDeltaWeb3 from "./EtherDeltaWeb3"
import * as AccountApi from "./apis/AccountApi"
import AccountType from "./AccountType"
import {withRouter} from "react-router-dom"
import * as WalletDao from "./util/WalletDao"

function genState(props) {
    const account = (props && props.match && props.match.params && props.match.params[0]) ? props.match.params[0] : ""
    return {
        account,
        valid: EthJsUtil.isValidAddress(account)
    }
}

class DebugAccount extends Component {
    constructor(props) {
        super(props)
        this.state = genState(props)
    }

    accountChanged = (event) => {
        const account = event.target.value
        const valid = EthJsUtil.isValidAddress(account)

        this.setState({
            account,
            valid
        })
    }

    selectAccount = () => {
        const {account, valid} = this.state

        if (valid) {
            EtherDeltaWeb3.initForPrivateKey(account, "")
            AccountApi.refreshAccountThenEthAndTokBalance(AccountType.DEBUG, this.props.history)
            WalletDao.saveDebugWallet(account)
            this.props.history.push("/")
        }
    }

    render() {
        const {account, valid} = this.state

        const submitDisabledClass = valid ? "" : "disabled"
        const validClass = valid ? "is-valid" : ""

        return (
            <Box title="Debug an account">
                <BoxSection>
                    <div className="form-group">
                        <input className={"form-control " + validClass}
                                  onChange={this.accountChanged}
                                  placeholder="Account address e.g. 0x0000000000000000000000000000000000000000"
                                  value={account}/>
                    </div>

                    <div className="form-group">
                        <button className={"btn btn-primary " + submitDisabledClass}
                                onClick={this.selectAccount}>Unlock
                        </button>
                    </div>
                </BoxSection>
            </Box>
        )
    }
}

export default withRouter(DebugAccount)
