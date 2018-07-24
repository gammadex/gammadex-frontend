import React from "react"
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import GasPriceStore from '../stores/GasPriceStore'
import * as GasActions from "../actions/GasActions"
import { Box, BoxSection } from "./CustomComponents/Box"
import { Popover, PopoverBody } from 'reactstrap'
import { gweiToWei, weiToGwei, gweiToEth, baseWeiToEth, safeBigNumber } from "../EtherConversion"
import * as _ from "lodash"
import { OperationCosts } from "../ContractOperations"
import WalletStore from "../stores/WalletStore"
import AccountStore from "../stores/AccountStore"
import EtherDeltaWeb3 from "../EtherDeltaWeb3"
import { setFavourite } from "../util/FavouritesDao"
import Favourites from "../util/Favourites"
import Round from "./CustomComponents/Round"
import BigNumber from 'bignumber.js'

export default class GasPriceChooser extends React.Component {
    constructor(props) {
        super(props)

        this.saveGasPrices = this.saveGasPrices.bind(this)
        this.onAccountChange = this.onAccountChange.bind(this)

        this.state = {
            accountState: null,
            safeLowWei: null,
            averageWei: null,
            fastWei: null,
            fastestWei: null,
            lastGasPriceRetrieveTime: null,
            currentGasPriceWei: 1,
            popoverOpen: false,
            ethereumPriceUsd: null,
            ethereumPriceRetrieveTime: null,
            estimateGas: EtherDeltaWeb3.estimateGas
        }
    }

    componentDidMount() {
        GasPriceStore.on("change", this.saveGasPrices)
        AccountStore.on("change", this.onAccountChange)
        this.saveGasPrices()
        this.onAccountChange()
    }

    componentWillUnmount() {
        GasPriceStore.removeListener("change", this.saveGasPrices)
        AccountStore.removeListener("change", this.onAccountChange)
    }

    onAccountChange() {
        this.setState({
            accountState: AccountStore.getAccountState()
        })
    }

    saveGasPrices() {
        const { safeLowWei, averageWei, fastWei, fastestWei } = GasPriceStore.getPrices()

        this.setState({
            safeLowWei,
            averageWei,
            fastWei,
            fastestWei,
            lastGasPriceRetrieveTime: GasPriceStore.getGasPriceLastRetrieveTime(),
            currentGasPriceWei: GasPriceStore.getCurrentGasPriceWei(),
            ethereumPriceUsd: GasPriceStore.getEthereumPriceUsd(),
            ethereumPriceRetrieveTime: GasPriceStore.getEthereumPriceRetrieveTime()
        })
    }

    onSliderChange = (valueInGwei) => {
        GasActions.setCurrentGasPrice(gweiToWei(valueInGwei))
    }

    onUseRecommended = event => {
        event.preventDefault()
        GasActions.gasPricesUseRecommended()
    }

    onUseCheapest = event => {
        event.preventDefault()
        GasActions.gasPricesUseCheapest()
    }

    onUseExpensive = event => {
        event.preventDefault()
        GasActions.gasPricesUseFastest()
    }

    toggleGasPrice = (event) => {
        this.setState({
            popoverOpen: !this.state.popoverOpen
        })
    }

    static safeWeiToGwei(wei) {
        return (_.isObject(wei) || _.isNumber(wei)) ? weiToGwei(wei).toNumber() : wei
    }

    getTimeDescription() {
        const { safeLowWei, averageWei, fastWei, currentGasPriceWei } = this.state

        if (!safeLowWei || !averageWei || !fastWei || !currentGasPriceWei) {
            return null
        }

        if (currentGasPriceWei.isGreaterThanOrEqualTo(fastWei)) {
            return "Under two minutes"
        } else if (currentGasPriceWei.isGreaterThanOrEqualTo(averageWei)) {
            return "Two to five minutes"
        } else if (currentGasPriceWei.isGreaterThanOrEqualTo(safeLowWei)) {
            return "Five to 30 minutes"
        } else {
            return "Over 30 minutes"
        }
    }

    onEstimateGasChange = (event) => {
        const { estimateGas } = this.state
        EtherDeltaWeb3.estimateGas = !estimateGas
        setFavourite(Favourites.ESTIMATE_GAS, !estimateGas)
        this.setState({
            estimateGas: !estimateGas
        })
    }

    render() {
        const { popoverOpen, currentGasPriceWei, ethereumPriceUsd, fastWei, averageWei, estimateGas, accountState} = this.state


        const averageGwei = GasPriceChooser.safeWeiToGwei(averageWei)
        const currentGasPriceGwei = GasPriceChooser.safeWeiToGwei(currentGasPriceWei)

        const gasCostsEth = _.mapValues(OperationCosts, gwei => gweiToEth(gwei * currentGasPriceGwei).toFixed(6))
        const gasCostsUsd = _.mapValues(gasCostsEth, e => (e * ethereumPriceUsd).toFixed(2))
        const timeDescription = this.getTimeDescription()

        let availableQty = null
        let availableUnit = "ETH"
        if(accountState) {
            const { walletBalanceEthWei } = accountState
            const walletBalanceEth = baseWeiToEth(walletBalanceEthWei).toString()
            if(popoverOpen && safeBigNumber(gasCostsEth.TAKE_ORDER).isGreaterThan(BigNumber(0))) {
                availableQty = `~${Number(safeBigNumber(walletBalanceEth).div(safeBigNumber(gasCostsEth.TAKE_ORDER)).dp(0, BigNumber.ROUND_FLOOR))}`
                availableUnit = "Trades"
            } else {
                availableQty = <Round fallback="-">{walletBalanceEth}</Round>
            }
        }

        return (
            <div>
                {/* <button className="btn" id="gasPrice" type="button" onClick={this.toggleGasPrice}>
                    <i className="fas fa-gas-pump mr-2"></i>Gas Price:<span style={{ "width": "20px", "display": "inline-block", "textAlign": "right" }}>{currentGasPriceGwei}</span>&nbsp;Gwei
                </button> */}

                <button className="btn btn-lg" style={{ "text-align": "left", "width": "150px", "height": "36px", "position": "relative" }} id="gasPrice" onClick={this.toggleGasPrice}>
                    <span style={{ "position": "absolute", "right": "2px", "top": "50%", "transform": "translateY(-50%)", "font-size": "100%" }} className="fas fa-gas-pump mr-2">&nbsp;</span>
                    <span style={{ "font-size": "80%","position": "absolute", "top": "2px"}}>Gas Price: {currentGasPriceGwei} Gwei</span>
                    <span style={{ "font-size": "65%", "position": "absolute", "bottom": "2px" }}>Wallet: {availableQty} {availableUnit}</span>
                    </button>

                <Popover target="gasPrice" isOpen={popoverOpen} placement="bottom" toggle={this.toggleGasPrice}>
                    <div className="shadow gas-prices">
                        <PopoverBody>
                            <Box title="Gas Price Per Unit">
                                <BoxSection>
                                    <div className="row">
                                        <div className="col-lg-4">
                                            <div><a href="#" onClick={this.onUseCheapest}>Cheapest</a></div>
                                            <div>Slower</div>
                                        </div>
                                        <div className="col-lg-4 txt-center">
                                            <div><a href="#" onClick={this.onUseRecommended}>Average</a></div>
                                        </div>
                                        <div className="col-lg-4">
                                            <div className="float-right"><a href="#" onClick={this.onUseExpensive}>Expensive</a></div>
                                            <br />
                                            <div className="float-right">Faster</div>
                                        </div>
                                    </div>

                                    <Slider min={1} max={200} defaultValue={averageGwei} onChange={this.onSliderChange} value={currentGasPriceGwei} />

                                    <div className="row">
                                        <div className="col-lg-12 text-center">
                                            <span className="gas-price-value">{currentGasPriceGwei} Gwei</span>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-lg-12 text-center">
                                            {timeDescription} transaction speed estimate from <a target="_blank" rel="noopener noreferrer"
                                                href="https://ethgasstation.info/">ethgasstation.info</a>
                                        </div>
                                    </div>
                                </BoxSection>
                                <BoxSection>
                                    <div>
                                        <table className="table">
                                            <tbody>
                                                <tr>
                                                    <th>Operation</th>
                                                    <th>Gas Fee (ETH)</th>
                                                    <th>Gas Fee (USD)</th>
                                                </tr>
                                                <tr>
                                                    <td>Trade</td>
                                                    <td>{gasCostsEth.TAKE_ORDER}</td>
                                                    <td>${gasCostsUsd.TAKE_ORDER}</td>
                                                </tr>
                                                <tr>
                                                    <td>Cancel Order</td>
                                                    <td>{gasCostsEth.CANCEL_ORDER}</td>
                                                    <td>${gasCostsUsd.CANCEL_ORDER}</td>
                                                </tr>
                                                <tr>
                                                    <td>Deposit ETH</td>
                                                    <td>{gasCostsEth.DEPOSIT_ETH}</td>
                                                    <td>${gasCostsUsd.DEPOSIT_ETH}</td>
                                                </tr>
                                                <tr>
                                                    <td>Deposit Token</td>
                                                    <td>{gasCostsEth.DEPOSIT_TOK}</td>
                                                    <td>${gasCostsUsd.DEPOSIT_TOK}</td>
                                                </tr>
                                                <tr>
                                                    <td>Withdraw ETH</td>
                                                    <td>{gasCostsEth.WITHDRAW_ETH}</td>
                                                    <td>${gasCostsUsd.WITHDRAW_ETH}</td>
                                                </tr>
                                                <tr>
                                                    <td>Withdraw Token</td>
                                                    <td>{gasCostsEth.WITHDRAW_TOK}</td>
                                                    <td>${gasCostsUsd.WITHDRAW_TOK}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <strong>The above costs are a rough guideline only</strong>. Actual gas cost can vary depending on a number of factors, including the token being operated on.
                                        <hr/>

                                        <form className="form-inline">
                                            <div className="form-check form-check-inline">
                                                <input className="form-check-input" type="checkbox" id="estimateGasCheckbox" onChange={this.onEstimateGasChange} value={"true"} checked={estimateGas} />
                                                <label className="form-check-label" htmlFor="estimateGasCheckbox">&nbsp;Estimate gas limit</label>
                                            </div>
                                        </form>
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