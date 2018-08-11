import React from "react"
import {safeBigNumber} from "../../EtherConversion"
import _ from "lodash"
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import BigNumber from 'bignumber.js'
import PropTypes from "prop-types"
import NumericInput from "./NumericInput"

class OrderPercentageSlider extends React.Component {
    constructor(props) {
        super()

        this.updateSliderValue = this.updateSliderValue.bind(this)
        this.calcSliderValue = this.calcSliderValue.bind(this)
        this.componentDidUpdate = this.componentDidUpdate.bind(this)

        this.state = {
            sliderValue: this.calcSliderValue(props)
        }
    }

    componentDidUpdate() {
        this.updateSliderValue()
    }

    updateSliderValue(props) {
        const sv = this.calcSliderValue()
        if (sv !== this.state.sliderValue) {
            this.setState(({
                sliderValue: this.calcSliderValue()
            }))
        }
    }

    calcSliderValue(props) {
        const p = props || this.props

        const {maxValue, value} = p

        if (maxValue && !_.isUndefined(value)) {
            const ratio = maxValue.toString() === "0" ? 0 : safeBigNumber(value).div(BigNumber(maxValue)).toNumber()

            return Math.round(100 * ratio)
        }

        return null
    }

    onChangeByPercentage = (sliderValue) => {
        const {minValue, maxValue} = this.props

        let value = minValue.plus(maxValue.times(safeBigNumber(sliderValue).div(safeBigNumber(100))))
        // This causes the slider to round and snap around small values, e.g. 0.0097 ETH becomes 0.01 which may be greater
        // than the user's balance
        //
        // if (sliderValue < 100) {
        //     value = value.toFixed(2)
        // }
        value = this.cleanValue(value.toString())

        this.props.onChange(value)

        this.setState({
            sliderValue
        })
    }

    cleanValue = (value) => {
        const {forceInteger = false} = this.props
        return forceInteger ? NumericInput.cleanValueToInteger(value) : NumericInput.cleanValueToDecimal(value)
    }

    render() {
        const {slider, addendum} = this.props

        let sliderComponent = this.createSlider(slider)
        let addendumComponent = this.createAddendum(addendum)

        return (
            <div>
                {sliderComponent}
                {addendumComponent}
            </div>
        )
    }

    createAddendum(addendum) {
        let addendumComponent = null
        if (addendum) {
            if (_.isArray(addendum)) {
                addendumComponent = <div className="percentage-slider-addendum">
                    {addendum.map((a, id) => <div key={id}>{a}</div>)}
                </div>

            } else {
                addendumComponent = <div className="percentage-slider-addendum">{addendum}</div>
            }
        }
        return addendumComponent
    }

    createSlider() {
        const {sliderValue} = this.state
        const {disabled} = this.props
        let sliderComponent = null
        if (_.isNumber(sliderValue)) {
            const marks = {
                0: '0%',
                25: '25%',
                50: '50%',
                75: '75%',
                100: '100%',
            }

            sliderComponent = <div className="percentage-slider">
                <Slider disabled={disabled} min={0} max={100} defaultValue={sliderValue} value={sliderValue} marks={marks} included={false} onChange={this.onChangeByPercentage}/>
            </div>
        }

        return sliderComponent
    }
}

export default OrderPercentageSlider
