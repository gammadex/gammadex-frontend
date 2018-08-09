import React from "react"
import _ from "lodash"
import { Box, BoxSection } from "./CustomComponents/Box"
import { Popover, PopoverBody } from 'reactstrap'
import WalletStore from "../stores/WalletStore"
import AccountStore from "../stores/AccountStore"
import WebSocketStore from '../stores/WebSocketStore'
import GasPriceStore from '../stores/GasPriceStore'
import AppStatusRow from "./AppStatus/AppStatusRow"
import { States } from "./AppStatus/AppStatusRow"
import Config from "../Config"
import BlockNumberDetail from "./BlockNumberDetail"
import AccountType from "../AccountType"
import * as EthereumNetworks from "../util/EthereumNetworks"
import Conditional from "./CustomComponents/Conditional"
import { safeBigNumber } from "../EtherConversion"

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
            web3Description: "",
            gasState: States.OK,
            gasDescription: ""
        }

        this.onSocketConnectionChange = this.onSocketConnectionChange.bind(this)
        this.updateAccountState = this.updateAccountState.bind(this)
    }

    componentDidMount() {
        WebSocketStore.on("change", this.onSocketConnectionChange)
        WalletStore.on("change", this.updateAccountState)
        AccountStore.on("change", this.updateAccountState)
        GasPriceStore.on("change", this.updateAccountState)
        this.updateAccountState()
        this.onSocketConnectionChange()
    }

    componentWillUnmount() {
        WebSocketStore.removeListener("change", this.onSocketConnectionChange)
        WalletStore.removeListener("change", this.updateAccountState)
        AccountStore.removeListener("change", this.updateAccountState)
        GasPriceStore.removeListener("change", this.updateAccountState)
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

    updateAccountState() {
        const { selectedAccountType, walletBalanceEthWei } = AccountStore.getAccountState()
        const accountState = States.OK

        // web3Info will only be populated when using metamask
        const web3Info = WalletStore.getProvidedWeb3Info()

        let web3State = States.ERROR
        let web3Description = ""
        if (!web3Info.connected) {
            web3State = States.ERROR
            web3Description = "Cannot establish connection"
        }
        else if (selectedAccountType == null) {
            web3State = States.OK
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

        const { safeLowWei, averageWei, fastWei } = GasPriceStore.getPrices()
        const currentGasPriceWei = GasPriceStore.getCurrentGasPriceWei()

        let gasState = States.OK
        let gasDescription = ""
        if (selectedAccountType != null && safeBigNumber(walletBalanceEthWei).isZero()) {
            gasState = States.WARN
            gasDescription = "Wallet has no ETH for gas fees"
        } else if (selectedAccountType != null && safeLowWei && averageWei && fastWei && currentGasPriceWei && currentGasPriceWei.isLessThan(safeLowWei)) {
            gasState = States.WARN
            gasDescription = "Very low gas price (30+ mins)"
        }

        this.setState({
            accountType: selectedAccountType,
            accountState: accountState,
            web3State: web3State,
            web3Description: web3Description,
            gasState: gasState,
            gasDescription: gasDescription
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
        if(accountType == null) return null
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
        const { webSocketState, accountType, accountState, web3State, gasState, gasDescription } = this.state
        const overall = _.maxBy([webSocketState, accountState, web3State, gasState], st => st.index)
        const ethereumNetworkState = _.maxBy([accountState, web3State], st => st.index)

        return (
            <li className="nav-item dropdown">

                <button className="nav-link dropdown-toggle btn btn-link" style={{ "height": "36px" }} id="appStatus" aria-haspopup="true" aria-expanded="false" onClick={this.toggleShowStatus}>
                    <span className={"mr-2 fas fa-lg " + overall.class}></span><span className="no-mobile">Status</span>
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
                                            <Conditional displayCondition={accountType != null && ethereumNetworkState != States.ERROR}>
                                                <BlockNumberDetail />
                                            </Conditional>
                                        </AppStatusRow>
                                    </div>
                                    <Conditional displayCondition={accountType != null && gasState != States.OK}>
                                        <div className="sub-card">
                                            <AppStatusRow title="Gas" state={gasState} message={gasDescription} />
                                        </div>
                                    </Conditional>
                                </BoxSection>
                            </Box>
                        </PopoverBody>
                    </div>
                </Popover>
            </li>
        )
    }
}