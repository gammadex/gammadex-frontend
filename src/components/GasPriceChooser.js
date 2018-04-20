import React from "react"
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import GasPriceStore from '../stores/GasPriceStore'
import * as GasActions from "../actions/GasActions"
import {Box, BoxSection} from "./CustomComponents/Box"
import {Popover, PopoverBody} from 'reactstrap'
import {gweiToWei, weiToGwei, gweiToEth} from "../EtherConversion"
import * as _ from "lodash"
import {OperationWeights} from "../ContractOperations"

export default class GasPriceChooser extends React.Component {
    constructor(props) {
        super(props)

        this.saveGasPrices = this.saveGasPrices.bind(this)

        this.state = {
            safeLowWei: null,
            averageWei: null,
            fastWei: null,
            fastestWei: null,
            lastGasPriceRetrieveTime: null,
            currentGasPriceWei: 1,
            popoverOpen: false,
            ethereumPriceUsd: null,
            ethereumPriceRetrieveTime: null
        }
    }

    componentDidMount() {
        GasPriceStore.on("change", this.saveGasPrices)
        this.saveGasPrices()
    }

    saveGasPrices() {
        const {safeLowWei, averageWei, fastWei, fastestWei} = GasPriceStore.getPrices()

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

    toggleGasPrice = () => {
        this.setState({
            popoverOpen: !this.state.popoverOpen
        });
    }

    static safeWeiToGwei(wei) {
        return (_.isObject(wei) || _.isNumber(wei)) ? weiToGwei(wei).toNumber() : wei
    }

    getTimeDescription() {
        const {safeLowWei, averageWei, fastWei, currentGasPriceWei} = this.state

        if (! safeLowWei || !averageWei || !fastWei || !currentGasPriceWei) {
            return null
        }

        if (currentGasPriceWei.isGreaterThanOrEqualTo(fastWei)) {
            return "under two minutes"
        } else if (currentGasPriceWei.isGreaterThanOrEqualTo(averageWei)) {
            return "two to five minutes"
        } else if (currentGasPriceWei.isGreaterThanOrEqualTo(safeLowWei)) {
            return "five to 30 minutes"
        } else {
            return "over 30 minutes"
        }
    }

    render() {
        const {popoverOpen, currentGasPriceWei, ethereumPriceUsd} = this.state

        const currentGasPriceGwei = GasPriceChooser.safeWeiToGwei(currentGasPriceWei)

        const gasCostsEth = _.mapValues(OperationWeights, gwei => gweiToEth(gwei * currentGasPriceGwei).toFixed(6))
        const gasCostsUsd = _.mapValues(gasCostsEth, e => (e * ethereumPriceUsd).toFixed(2))
        const timeDescription = this.getTimeDescription()

        return (
            <div>
                <button className="btn" id="gasPrice" onClick={this.toggleGasPrice}>Gas
                    Price: {currentGasPriceGwei}&nbsp;Gwei
                </button>

                <Popover target="gasPrice" isOpen={popoverOpen} placement="bottom">
                    <div className="shadow gas-prices">
                        <PopoverBody>
                            <Box title="Gas Price Per Unit">
                                <BoxSection>

                                    <div className="row">
                                        <div className="col-lg-6">
                                            <div>Cheapest</div>
                                            <div>Slowest</div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="float-right">Expensive</div>
                                            <br/>
                                            <div className="float-right">Fastest</div>
                                        </div>
                                    </div>

                                    <Slider min={1} max={100} defaultValue={40} onChange={this.onSliderChange} value={currentGasPriceGwei}/>

                                    <div className="row">
                                        <div className="col-lg-12 text-center">
                                            <span className="gas-price-value">{currentGasPriceGwei} Gwei</span>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-lg-12 text-center">
                                            {timeDescription} transaction speed estimate from <a target="_blank" rel="noopener"
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
                                                <td>Deposit</td>
                                                <td>{gasCostsEth.DEPOSIT}</td>
                                                <td>${gasCostsUsd.DEPOSIT}</td>
                                            </tr>
                                            <tr>
                                                <td>Withdraw</td>
                                                <td>{gasCostsEth.WITHDRAW}</td>
                                                <td>${gasCostsUsd.WITHDRAW}</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </BoxSection>
                                <BoxSection>
                                    <div className="row">
                                        <div className="col-lg-12 text-center">
                                            <button className="btn" onClick={this.toggleGasPrice}>Close</button>
                                        </div>
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