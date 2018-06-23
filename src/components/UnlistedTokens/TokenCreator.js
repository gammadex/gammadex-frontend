import React from "react"
import * as TokenActions from "../../actions/TokenActions"
import TokenStore from "../../stores/TokenStore"
import Conditional from "../CustomComponents/Conditional"
import * as TokenApi from "../../apis/TokenApi"
import TokenRepository from "../../util/TokenRepository"
import * as TokenUtil from "../../util/TokenUtil"

export default class TokenCreator extends React.Component {
    constructor() {
        super()

        TokenActions.resetCreate("")
        this.state = {
            token: TokenStore.getCreateToken(),
            checkingAddress: TokenStore.isCheckingUnlistedAddress(),
            checkError: TokenStore.getUnlistedTokenCheckError()
        }

        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
    }

    componentWillMount() {
        TokenStore.on("change", this.onTokenStoreChange)
    }

    componentWillUnmount() {
        TokenStore.removeListener("change", this.onTokenStoreChange)
    }

    onTokenStoreChange() {
        this.setState({
            token: TokenStore.getCreateToken(),
            checkingAddress: TokenStore.isCheckingUnlistedAddress(),
            checkError: TokenStore.getUnlistedTokenCheckError()
        })
    }

    onAddToken = event => {
        const {token} = this.state

        if (token) {
            TokenActions.addUserToken(token)
            this.props.selectToken(token.address)
        }

        event.preventDefault()
    }

    onAddressChange = event => {
        const address = event.target.value

        if (address) {
            let error = null
            if (TokenRepository.isListedToken(address)) {
                error = "This is an existing listed token"
            } else if (TokenRepository.isUserToken(address)) {
                error = "This token is already in your list"
            } else if (!TokenUtil.isAddress(address)) {
                error = "Invalid address"
            }

            if (error) {
                TokenActions.unlistedTokenCheckError(address, error)
            } else {
                TokenApi.unlistedTokenLookup(address)
            }
        } else {
            TokenActions.resetCreate(address)
        }
    }

    render() {
        return (
            <div>
                <form>
                    <Conditional displayCondition={this.state.checkingAddress}>
                        <div className="hover">
                            <span className="fas fa-circle-notch fa-spin egspinner"/>
                        </div>
                    </Conditional>

                    <div className="row form-group">
                        <label className="col-sm-3 col-form-label" htmlFor="address">Address</label>
                        <div className="col-sm-9">
                            <input className={"form-control" + (this.state.checkError ? " is-invalid" : "")}
                                   id="address" placeholder="0x12345..."
                                   onChange={this.onAddressChange} value={this.state.token.address}/>
                            <div className="invalid-feedback">{this.state.checkError}</div>
                        </div>
                    </div>

                    <Conditional displayCondition={this.state.token.symbol !== ""}>
                        <div className="row hdr-stretch-ctr alert alert-success">
                            <table className="col-sm-8">
                                <tbody>
                                <tr>
                                    <td><strong>Name</strong></td>
                                    <td colSpan="3">{this.state.token.name}</td>
                                </tr>
                                <tr>
                                    <td><strong>Symbol</strong></td>
                                    <td>{this.state.token.symbol}</td>
                                    <td><strong>Decimals</strong></td>
                                    <td>{this.state.token.decimals}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </Conditional>

                    <div className="row form-group form-inline hdr-stretch-ctr">
                        <button className="btn btn-sm btn-primary form-control col-sm-4" onClick={this.onAddToken}
                                type="submit"
                                disabled={this.state.token.symbol === "" || this.state.checkError}>Add
                        </button>
                    </div>
                </form>
            </div>
        )
    }
}