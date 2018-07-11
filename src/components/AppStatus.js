import React from "react"
import _ from "lodash"
import { Box, BoxSection } from "./CustomComponents/Box"
import { Popover, PopoverBody } from 'reactstrap'
import WalletStore from "../stores/WalletStore"
import AccountStore from "../stores/AccountStore"
import WebSocketStore from '../stores/WebSocketStore'
import AppStatusRow from "./AppStatus/AppStatusRow"
import { States } from "./AppStatus/AppStatusRow"
import Config from "../Config"
import BlockNumberDetail from "./BlockNumberDetail"
import AccountType from "../AccountType"
import * as EthereumNetworks from "../util/EthereumNetworks"
import Conditional from "./CustomComponents/Conditional"

export default class AppStatus extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            popoverOpen: false,
            webSocketState: States.ERROR,
            webSocketUrl: null,
            accountState: States.ERROR,
            accountType: null,
            web3State: States.ERROR,
            web3Description: "Network not found"
        }

        this.onSocketConnectionChange = this.onSocketConnectionChange.bind(this)
        this.updateEthereumNetworkState = this.updateEthereumNetworkState.bind(this)
    }

    componentDidMount() {
        WebSocketStore.on("change", this.onSocketConnectionChange)
        WalletStore.on("change", this.updateEthereumNetworkState)
        AccountStore.on("change", this.updateEthereumNetworkState)
        this.updateEthereumNetworkState()
        this.onSocketConnectionChange()
    }

    componentWillUnmount() {
        WebSocketStore.removeListener("change", this.onSocketConnectionChange)
        WalletStore.removeListener("change", this.onWalletStoreChange)
        AccountStore.removeListener("change", this.onAccountStoreChange)
    }

    onSocketConnectionChange() {
        const { connected, connecting, marketResponseReceived } = WebSocketStore.getConnectionState()
        const wssState = WebSocketStore.getConnectionState()
        const wsState = !marketResponseReceived ? States.PENDING : connected ? States.OK : connecting ? States.WARN : States.ERROR
        this.setState({
            webSocketState: wsState,
            webSocketUrl: wssState.url
        })
    }

    updateEthereumNetworkState() {
        const { selectedAccountType } = AccountStore.getAccountState()
        const accountState = selectedAccountType != null ? States.OK : States.ERROR

        // web3Info will only be populated when using metamask
        const web3Info = WalletStore.getProvidedWeb3Info()

        let web3State = States.ERROR
        let web3Description = ""
        if (selectedAccountType == null) {
            web3State = States.ERROR
            web3Description = "Please unlock a wallet"
        } else {
            if (selectedAccountType === AccountType.METAMASK) {
                if (web3Info.netDescription == null || !web3Info.isMainNet) {
                    web3State = States.ERROR
                    web3Description = `Please connect to ${EthereumNetworks.getMainNetDescription()}`
                } else {
                    web3State = States.OK
                    web3Description = EthereumNetworks.getMainNetDescription()
                }
            } else {
                web3State = States.OK
                web3Description = EthereumNetworks.getMainNetDescription()
            }
        }

        this.setState({
            accountType: selectedAccountType,
            accountState: accountState,
            web3State: web3State,
            web3Description: web3Description
        })
    }

    toggleShowStatus = () => {
        this.setState({ popoverOpen: !this.state.popoverOpen })
    }

    getWebsocketMessage = () => {
        const { webSocketState, webSocketUrl } = this.state
        switch (webSocketState) {
            case States.OK:
                return `Connected to ${webSocketUrl}`
            case States.PENDING:
                return "Awaiting Market Data..."
            case States.WARN:
                return `Connecting to ${webSocketUrl}`
            case States.ERROR:
                return `Disconnected`
        }
    }

    getAccountMessage = () => {
        const { accountState, accountType } = this.state
        switch (accountState) {
            case States.OK:
                return `Provided by ${accountType === AccountType.METAMASK ? accountType : "INFURA"}`
            case States.ERROR:
                return null
        }
    }

    getNetworkMessage = () => {
        return this.state.web3Description
    }

    render() {
        const { webSocketState, accountState, web3State } = this.state
        const overall = _.maxBy([webSocketState, accountState, web3State], st => st.index)
        const ethereumNetworkState = _.maxBy([accountState, web3State], st => st.index)

        return (
            <div>
                <button className="btn" id="appStatus" type="button" onClick={this.toggleShowStatus}>
                    <div>
                        <span className={"fas fa-lg " + overall.class}></span>
                        <span className="ml-2">Status</span>
                    </div>
                </button>

                <Popover target="appStatus" isOpen={this.state.popoverOpen} placement="bottom" toggle={this.toggleShowStatus}>
                    <div className="shadow gas-prices">
                        <PopoverBody>
                            <Box title="Status">
                                <BoxSection>
                                    <AppStatusRow title="GammaDex Websocket" state={webSocketState} message={this.getWebsocketMessage()} />

                                    <div className="sub-card">
                                        <AppStatusRow className="sub-card" title="Ethereum Network" state={ethereumNetworkState} message={this.getNetworkMessage()}>
                                            <Conditional displayCondition={this.getAccountMessage() != null}>
                                                <span>{this.getAccountMessage()}<br /></span>
                                            </Conditional>
                                            <BlockNumberDetail state={ethereumNetworkState} />
                                        </AppStatusRow>
                                    </div>
                                </BoxSection>
                            </Box>
                        </PopoverBody>
                    </div>
                </Popover>
            </div>
        )
    }
}