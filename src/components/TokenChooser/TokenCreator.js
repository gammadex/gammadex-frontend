import React from "react"
import * as TokenActions from "../../actions/TokenActions"
import TokenStore from "../../stores/TokenStore"
import Conditional from "../CustomComponents/Conditional"

export default class TokenCreator extends React.Component {
    constructor() {
        super()
        this.state = {
            token: TokenStore.getCreateToken(),
            checkingAddress: TokenStore.isCheckingAddress(),
            checkError: TokenStore.getTokenCheckError()
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
        const token = TokenStore.getCreateToken()
        const ica = TokenStore.isCheckingAddress()
        const error = TokenStore.getTokenCheckError()
        this.setState({token: token, checkingAddress: ica, checkError: error})
    }

    onClick = event => {
        this.props.create(this.state.token)
    }

    addressChange = event => {
        const token = {
            address: event.target.value,
            lName: "",
            name: "",
            decimals: ""
        }

        this.setState({token: token})
    }

    checkAddress = event => {
        TokenActions.tokenLookup(this.state.token.address)
    }

    render() {
        return (
            <div className="order-box">
                <Conditional displayCondition={this.state.checkingAddress}>
                    <div className="hover">
                        <span className="fas fa-circle-notch fa-spin egspinner"/>
                    </div>
                </Conditional>

                <div className="row form-group">
                    <label className="col-sm-3 col-form-label" htmlFor="address">Address</label>
                    <div className="form-inline hdr-stretch col-sm-9">
                        <input className={"form-control" + (this.state.checkError !== "" ? " is-invalid" : "")}
                               id="address" placeholder="0x12345..."
                               onChange={this.addressChange} value={this.state.token.address}/>
                        <button className="btn btn-sm btn-info form-control"
                                data-toggle="tooltip" data-placement="right"
                                title="Check address and load token details"
                                disabled={this.state.token.address === ""}
                                onClick={this.checkAddress}>Check</button>
                        <div className="invalid-feedback">{this.state.checkError}</div>
                    </div>
                </div>

                <Conditional displayCondition={this.state.token.name !== ""}>
                    <div className="row hdr-stretch-ctr alert alert-success">
                        <table className="col-sm-8">
                            <tbody>
                                <tr>
                                    <td><strong>Name</strong></td><td colSpan="3">{this.state.token.lName}</td>
                                </tr>
                                <tr>
                                    <td><strong>Symbol</strong></td><td>{this.state.token.name}</td>
                                    <td><strong>Decimals</strong></td><td>{this.state.token.decimals}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Conditional>

                <div className="row form-group form-inline hdr-stretch-ctr">
                    <button className="btn btn-sm btn-primary form-control col-sm-4" onClick={this.onClick}
                            disabled={this.state.token.name === ""}>Add</button>
                </div>
            </div>
        )
    }
}