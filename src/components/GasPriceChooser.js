import React from "react"
import Slider, {Range} from 'rc-slider'
import 'rc-slider/assets/index.css'
import GasPriceStore from '../stores/GasPriceStore'
import * as GasApi from "../apis/GasApi"
import Date from "./CustomComponents/Date"
import {Box, BoxSection} from "./CustomComponents/Box"
import {Popover, PopoverBody} from 'reactstrap'

export default class GasPriceChooser extends React.Component {
    constructor(props) {
        super(props)

        this.saveGasPrices = this.saveGasPrices.bind(this)

        this.state = {
            safeLow: null,
            average: null,
            fast: null,
            fastest: null,
            lastRetrieveTime: null,
            currentGasPriceGwei: 1,
            popoverOpen: false
        }
    }

    componentDidMount() {
        GasPriceStore.on("change", this.saveGasPrices)
        this.saveGasPrices()
    }

    saveGasPrices() {
        const {safeLow, average, fast, fastest} = GasPriceStore.getPrices()

        this.setState({
            safeLow,
            average,
            fast,
            fastest,
            lastRetrieveTime: GasPriceStore.getLastRetrieveTime(),
            currentGasPriceGwei: GasPriceStore.getCurrentGasPriceGwei(),
        })
    }

    onSliderChange = (value) => {
        this.setState({
            currentGasPriceGwei: value
        })
    }

    toggleGasPrice = () => {
        this.setState({
            popoverOpen: !this.state.popoverOpen
        });
    }

    render() {
        const {popoverOpen, safeLow, average, fast, currentGasPriceGwei, lastRetrieveTime} = this.state

        return (
            <div>
                <button className="btn" id="gasPrice" onClick={this.toggleGasPrice}>Gas
                    Price: {currentGasPriceGwei}&nbsp;Gwei
                </button>

                <Popover target="gasPrice" isOpen={popoverOpen} placement="bottom">
                    <div className="shadow">
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

                                    <Slider min={1} max={100} defaultValue={40} onChange={this.onSliderChange}
                                            value={currentGasPriceGwei}/>

                                    <div className="row">
                                        <div className="col-lg-12 text-center">
                                            <span className="gas-price-value">{currentGasPriceGwei} Gwei</span>
                                        </div>
                                    </div>

                                </BoxSection>
                                <BoxSection>

                                    <div>
                                        <a target="_blank" rel="noopener"
                                           href="https://ethgasstation.info/">ethgasstation.info</a> prices as of <Date
                                        date={lastRetrieveTime}/>
                                    </div>

                                    <div>
                                        <table className="table">
                                            <tbody>
                                            <tr>
                                                <td>Slow (&lt;30m)</td>
                                                <td>{safeLow} Gwei</td>
                                            </tr>
                                            <tr>
                                                <td>Standard (&lt;5m)</td>
                                                <td>{average} Gwei</td>
                                            </tr>
                                            <tr>
                                                <td>Fast (&lt;2m)</td>
                                                <td>{fast} Gwei</td>
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