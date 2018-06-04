import React from "react"
import _ from "lodash"
import {Box, BoxSection} from "./CustomComponents/Box"
import {Popover, PopoverBody} from 'reactstrap'
import WalletStore from "../stores/WalletStore"
import AccountStore from "../stores/AccountStore"
import WebSocketStore from '../stores/WebSocketStore'
import AppStatusRow from "./AppStatus/AppStatusRow"
import {States} from "./AppStatus/AppStatusRow"

export default class AppStatus extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            popoverOpen: false,
            webSocket: {
                state: States.ERROR,
                url: null
            },
            web3: {
                state: States.ERROR,
                providedWeb3: {},
            },
            network: {
                state: States.ERROR,
                selectedAccountType: null
            }
        }

        this.onSocketConnectionChange = this.onSocketConnectionChange.bind(this)
        this.onWalletStoreChange = this.onWalletStoreChange.bind(this)
        this.onAccountStoreChange = this.onAccountStoreChange.bind(this)
        
        this.onSocketConnectionChange()
    }

    componentWillMount() {
        WebSocketStore.on("change", this.onSocketConnectionChange)
        WalletStore.on("change", this.onWalletStoreChange)
        AccountStore.on("change", this.onAccountStoreChange)
    }

    componentWillUnmount() {
        WebSocketStore.removeListener("change", this.onSocketConnectionChange)
        WalletStore.removeListener("change", this.onWalletStoreChange)
        AccountStore.removeListener("change", this.onAccountStoreChange)
    }

    onSocketConnectionChange() {
        const wssState = WebSocketStore.getConnectionState()
        const wsState = wssState.connected ? States.OK : wssState.connecting ? States.WARN : States.ERROR
        this.setState({
            webSocket: {
                state: wsState,
                url: wssState.url
            }
        })
    }
    
    onAccountStoreChange() {
        const accountState = AccountStore.getAccountState()
        const web3State = accountState.selectedAccountType ? States.OK : States.ERROR
        this.setState({
            web3: {
                state: web3State,
                selectedAccountType: accountState.selectedAccountType
            }
        })
    }

    onWalletStoreChange() {
        const web3Info = WalletStore.getProvidedWeb3Info()
        const nwState = web3Info.netDescription ? States.OK : States.ERROR
        this.setState({
            network: {
                state: nwState,
                providedWeb3: web3Info
            }
        })
    }

    toggleShowStatus = () => {
        this.setState({popoverOpen: !this.state.popoverOpen})
    }

    getWebsocketMessage = () => {
        switch (this.state.webSocket.state) {
        case States.OK:
            return `Connected to ${this.state.webSocket.url}`
        case States.WARN:
            return `Connecting to ${this.state.webSocket.url}`
        case States.ERROR:
            return `Disconnected`
        }
    }

    getWeb3Message = () => {
        switch (this.state.web3.state) {
        case States.OK:
            return `Provided by ${this.state.web3.selectedAccountType}`
        case States.ERROR:
            return `No provider`
        }
    }

    getNetworkMessage = () => {
        switch (this.state.network.state) {
        case States.OK:
            return `${this.state.network.providedWeb3.netDescription}, XXX pending`
        case States.ERROR:
            return `Network not found`
        }
    }

    render() {
        const overall = _.maxBy([this.state.webSocket.state, this.state.web3.state, this.state.network.state], st => st.index)

        return (
            <div>
                <button className="btn" id="appStatus" type="button" onClick={this.toggleShowStatus}>
                    <div>
                        <span className={"fas fa-lg " + overall.class}></span>
                        <span className="lmargin">Status</span>
                    </div>
                </button>

                <Popover target="appStatus" isOpen={this.state.popoverOpen} placement="bottom">
                    <div className="shadow gas-prices">
                        <PopoverBody>
                            <Box title="Status">
                                <BoxSection>
                                    <AppStatusRow title="Websocket" state={this.state.webSocket.state} message={this.getWebsocketMessage()}/>
                                    <div className="sub-card"><AppStatusRow title="Web3 Provider" state={this.state.web3.state} message={this.getWeb3Message()}/></div>
                                    <div className="sub-card"><AppStatusRow className="sub-card" title="Network" state={this.state.network.state} message={this.getNetworkMessage()}/></div>
                                </BoxSection>
                            </Box>
                        </PopoverBody>
                    </div>
                </Popover>
            </div>
        )
    }
}