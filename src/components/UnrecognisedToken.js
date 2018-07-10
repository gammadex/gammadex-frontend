import React from "react"
import Conditional from "./CustomComponents/Conditional"
import TokenStore from "../stores/TokenStore"
import * as TokenActions from "../actions/TokenActions"
import TokenRepository from "../util/TokenRepository"
import {Popover, PopoverHeader, PopoverBody} from 'reactstrap'
import EtherScan from "./CustomComponents/Etherscan"

export default class UnrecognisedToken extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            unrecognisedToken: TokenStore.getUnrecognisedToken(),
            checkingUnrecognisedAddress: TokenStore.getCheckingUnrecognisedAddress(),
            unrecognisedTokenCheckError: TokenStore.getUnrecognisedTokenCheckError(),
            selectedToken: TokenStore.getSelectedToken(),
            unlistedPopoverOpen: false,
            unrecognisedPopoverOpen: false,
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

    toggleUnlistedPopover = () => {
        this.setState({
            unlistedPopoverOpen: !this.state.unlistedPopoverOpen
        })
    }

    toggleUnrecognisedPopover = () => {
        this.setState({
            unrecognisedPopoverOpen: !this.state.unrecognisedPopoverOpen
        })
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
        const selectedTokenLink = selectedToken ? <EtherScan type="address" address={selectedToken.address} display="truncate"/> : null

        return (
            <span>
                <Conditional displayCondition={displayUnlisted}>
                    <div className="alert alert-warning main-warning">Unlisted token <span id="unlisted-popover-target" onClick={this.toggleUnlistedPopover}><i className="fas fa-question-circle"></i></span></div>

                    <Popover className="padded-popover" placement="bottom" isOpen={this.state.unlistedPopoverOpen} target={"unlisted-popover-target"} toggle={this.toggleUnlistedPopover}>
                        <PopoverHeader>{selectedTokenSymbol} is not listed on GammaDEX</PopoverHeader>
                        <PopoverBody>
                            <div className="mt-2">You can still trade it but please exercise caution</div>

                            <div className="mt-2">You may want to verify the smart contract address for {selectedTokenSymbol} is correct before trading: {selectedTokenLink}</div>
                        </PopoverBody>
                    </Popover>
                </Conditional>

                <Conditional displayCondition={displayUnrecognised}>
                    <div className="alert alert-warning main-warning">Unrecognized token <span id="unrecognised-popover-target" onClick={this.toggleUnrecognisedPopover}><i className="fas fa-question-circle"></i></span></div>

                    <Popover className="padded-popover" placement="bottom" isOpen={this.state.unrecognisedPopoverOpen} target={"unrecognised-popover-target"} toggle={this.toggleUnrecognisedPopover}>
                        <PopoverHeader>Unrecognized token</PopoverHeader>
                        <PopoverBody>
                            <div>
                                This token is not a listed token and is not in your unlisted tokens list
                            </div>

                            <Conditional displayCondition={!!checkingUnrecognisedAddress}>
                                <div className="mt-2">
                                Checking if it is a valid token contract.
                                </div>
                            </Conditional>

                            <Conditional displayCondition={!!unrecognisedToken}>
                                <div className="mt-2">
                                    Would you like to add <strong>{tokenDescription}</strong> to your unlisted tokens section?

                                    <div className="middle mt-2">
                                        <button className="btn mt-2" onClick={this.addUnlistedToken}>Add to my Unlisted Tokens</button>
                                    </div>
                                </div>
                            </Conditional>

                            <Conditional displayCondition={!!unrecognisedTokenCheckError}>
                                <div className="mt-2">
                                    There was a problem with the token address
                                </div>

                                <div className="mt-2">
                                    This could mean that the token address is invalid or it is not a tradable token
                                </div>
                                <div className="mt-2">
                                    <i>{String(unrecognisedTokenCheckError)}</i>
                                </div>
                            </Conditional>
                        </PopoverBody>
                    </Popover>
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