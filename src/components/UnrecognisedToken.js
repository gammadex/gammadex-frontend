import React from "react"
import Conditional from "./CustomComponents/Conditional"
import TokenStore from "../stores/TokenStore"
import * as TokenActions from "../actions/TokenActions"
import TokenRepository from "../util/TokenRepository"
import Etherscan from "./CustomComponents/Etherscan"

export default class UnrecognisedToken extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            unrecognisedToken: TokenStore.getUnrecognisedToken(),
            checkingUnrecognisedAddress: TokenStore.getCheckingUnrecognisedAddress(),
            unrecognisedTokenCheckError: TokenStore.getUnrecognisedTokenCheckError(),
            selectedToken: TokenStore.getSelectedToken(),
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
            unrecognisedToken: TokenStore.getUnrecognisedToken(),
            checkingUnrecognisedAddress: TokenStore.getCheckingUnrecognisedAddress(),
            unrecognisedTokenCheckError: TokenStore.getUnrecognisedTokenCheckError(),
            selectedToken: TokenStore.getSelectedToken(),
        })
    }

    addUnlistedToken = () => {
        const {unrecognisedToken} = this.state
        const tokenToRegister = Object.assign({}, unrecognisedToken, {isUnrecognised: false})

        TokenActions.addUserToken(tokenToRegister)
    }

    render() {
        const {
            unrecognisedToken,
            checkingUnrecognisedAddress,
            unrecognisedTokenCheckError,
            selectedToken,
        } = this.state

        const tokenDescription = this.getTokenDescription(unrecognisedToken)
        const selectedTokenSymbol = selectedToken ? selectedToken.symbol : null

        const displayUnrecognised = unrecognisedTokenCheckError || checkingUnrecognisedAddress || (selectedToken && !TokenRepository.isListedOrUserToken(selectedToken.address))
        const displayUnlisted = !displayUnrecognised && selectedToken && !TokenRepository.isListedToken(selectedToken.address)

        return (
            <span>
                <Conditional
                    displayCondition={displayUnlisted}>
                    <div className="alert alert-warning main-warning">
                            <i className="fas fa-exclamation-triangle mr-1"/>
                        {selectedTokenSymbol} is not listed on GammaDEX. You can still trade it but please exercise caution.
                    </div>
                </Conditional>

                <Conditional displayCondition={displayUnrecognised}>
                    <div className="alert alert-warning main-warning">
                        <div className="row">
                            <div className="col-lg-6">
                                <div>
                                    <h3>Unrecognised Token</h3>
                                </div>

                                <div>
                                    This token is not a listed token and is not in your unlisted tokens list.
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <Conditional displayCondition={!!checkingUnrecognisedAddress}>
                                    Checking if it is a valid token contract.
                                </Conditional>

                                <Conditional displayCondition={!!unrecognisedToken}>
                                    Would you like to add {tokenDescription} to your unlisted tokens section?
                                    <br/>
                                    <button className="btn mt-2"
                                            onClick={this.addUnlistedToken}>Add to my Unlisted Tokens</button>
                                </Conditional>

                                <Conditional displayCondition={!!unrecognisedTokenCheckError}>
                                    <div>
                                    There was a problem with the token address
                                    </div>
                                                                        <div className="mt-2">
                                    This could mean that the token address is invalid or it is not a tradable token
                                    </div>
                                    <div className="mt-2">
                                        <i>{String(unrecognisedTokenCheckError)}</i>
                                    </div>
                                </Conditional>
                            </div>
                        </div>
                    </div>
                </Conditional>
            </span>
        )
    }

    getTokenDescription(token) {
        if (token) {
            if (token.symbol === token.name) {
                return token.symbol
            } else {
                return `${token.symbol} - ${token.name}`
            }
        } else {
            return ''
        }
    }
}