import React from "react"
import _ from 'lodash'
import {FormGroup, FormFeedback, Label, Col, Input, FormText, InputGroupAddon, Button} from 'reactstrap'
import Conditional from "../CustomComponents/Conditional"
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import {safeBigNumber} from "../../EtherConversion"
import BigNumber from 'bignumber.js'

export default class NumericInput extends React.Component {
    constructor(props) {
        super(props)
        this.formFeedback = this.formFeedback.bind(this)
        this.formText = this.formText.bind(this)
        this.gasFeeFormText = this.gasFeeFormText.bind(this)
        this.updateSliderValue = this.updateSliderValue.bind(this)
        this.calcSliderValue = this.calcSliderValue.bind(this)
        this.componentDidUpdate = this.componentDidUpdate.bind(this)

        this.state = {
            sliderValue: this.calcSliderValue()
        }
    }

    componentDidUpdate() {
        this.updateSliderValue()
    }

    updateSliderValue() {
        const sv = this.calcSliderValue()
        if (sv !== this.state.sliderValue) {
            this.setState(({
                sliderValue: this.calcSliderValue()
            }))
        }
    }

    calcSliderValue() {
        const {slider, value} = this.props

        if (slider && !_.isUndefined(value)) {
            const {max} = slider
            const ratio = max.toString() === "0" ? 0 : safeBigNumber(value).div(BigNumber(max)).toNumber()

            return Math.round(100 * ratio)
        }

        return null
    }

    static cleanValueToDecimal(value) {
        return value
            .replace(/[^0-9.]/g, () => "") // globally strip everything that isn't a digit or a .
            .replace(/^\./, () => "0.") // force numbers starting with . to be 0.
            .replace(/^([0-9]*\.[0-9]*).*/, (m, p1) => p1) // replace any poo following sensible decimal (e.g. second ".")
    }

    static cleanValueToInteger(value) {
        return value
            .replace(/[^0-9]/g, () => "") // globally strip everything that isn't a digit
    }

    cleanValue = (value) => {
        const {forceInteger = false} = this.props
        return forceInteger ? NumericInput.cleanValueToInteger(value) : NumericInput.cleanValueToDecimal(value)
    }

    onChangeFilteringInput = (e) => {
        const value = this.cleanValue(e.target.value)

        this.props.onChange(value)
    }

    onChangeByPercentage = (sliderValue) => {
        const {slider} = this.props
        if (slider) {
            const {min, max} = slider

            let value = min.plus(max.times(safeBigNumber(sliderValue).div(safeBigNumber(100))))
            if (sliderValue < 100) {
                value = value.toFixed(2)
            }
            value = this.cleanValue(value.toString())

            this.props.onChange(value)

            this.setState({
                sliderValue
            })
        }
    }

    onMax() {
        this.props.onMax()
    }

    onAction() {
        this.props.onAction()
    }

    onSubmit = event => {
        const {
            valid = true,
            disabled = false,
            actionDisabled = false,
            submittable = false
        } = this.props

        if (valid && !disabled && !actionDisabled && submittable) {
            this.props.onAction()
        }

        event.preventDefault()
    }

    render() {
        const {
            name,
            unitName,
            fieldName,
            value,
            valid = true,
            disabled = false,
            onMax = null,
            onAction = null,
            actionName = null,
            actionDisabled = false,
            placeholder = "0.00",
            submittable = false,
            slider,
            addendum
        } = this.props
        const isInvalid = valid !== null && !valid

        let maxButton = this.createMaxButton(onMax, fieldName)
        let label = this.createLabel(fieldName, name)
        const inputWidth = label === null ? 12 : 9
        let actionButton = this.createActionButton(onAction, actionName, fieldName, actionDisabled)
        let sliderComponent = this.createSlider(slider)
        let addendumComponent = this.createAddendum(addendum)

        const input = (
            <div className="input-group">
                <Input id={fieldName}
                       autoComplete="off"
                       disabled={disabled}
                       value={value}
                       onChange={this.onChangeFilteringInput}
                       placeholder={placeholder}
                       invalid={isInvalid}/>
                <Conditional displayCondition={unitName != null}>
                    <span className={"input-unit " + (disabled ? "disabled" : "")}>{unitName}</span>
                </Conditional>
                {maxButton}
                {actionButton}
                {this.formFeedback()}
                {this.formText()}
            </div>
        )

        const content = submittable ? <form onSubmit={this.onSubmit}>{input}</form> : input

        return (
            <FormGroup row className="numeric-input">
                {label}
                <Col sm={inputWidth}>
                    {content}
                    {sliderComponent}
                    {addendumComponent}
                </Col>
            </FormGroup>
        )
    }

    createLabel(fieldName, name) {
        let label = <Label for={fieldName} sm={3}>{name}</Label>
        if (name == null) {
            label = null //<Label for={fieldName} sm={0}></Label>
        }
        return label
    }

    createMaxButton(onMax, fieldName) {
        let maxButton = null
        if (typeof (onMax) === 'function') {
            maxButton = <Button id={fieldName + 'MaxButton'} className="ml-1" onClick={() => this.onMax()}>MAX</Button>
        }
        return maxButton
    }

    createActionButton(onAction, actionName, fieldName, actionDisabled) {
        let actionButton = null
        if (typeof (onAction) === 'function' && actionName) {
            actionButton = <div className="action-button">
                <Button id={fieldName + "Button"} color="primary" className="btn-block" disabled={actionDisabled}
                        onClick={() => this.onAction()}>{actionName}
                </Button>
                {this.gasFeeFormText()}
            </div>
        }
        return actionButton
    }

    createAddendum(addendum) {
        let addendumComponent = null
        if (addendum) {
            if (_.isArray(addendum)) {
                addendumComponent = <div className="numeric-input-addendum">
                    {addendum.map((a, id) => <div key={id}>{a}</div>)}
                </div>

            } else {
                addendumComponent = <div className="numeric-input-addendum">{addendum}</div>
            }
        }
        return addendumComponent
    }

    createSlider(slider) {
        let sliderComponent = null
        if (slider) {
            const {sliderValue} = this.state

            if (_.isNumber(sliderValue)) {
                const marks = {
                    0: '0%',
                    25: '25%',
                    50: '50%',
                    75: '75%',
                    100: '100%',
                }

                sliderComponent = <div className="numeric-input-slider">
                    <Slider min={0} max={100} defaultValue={sliderValue} value={sliderValue} marks={marks} included={false} onChange={this.onChangeByPercentage}/>
                </div>
            }
        }
        return sliderComponent
    }

    formFeedback() {
        const {errorMessage = null, feedbackIcon = null, invalidFeedbackAbove = false} = this.props
        const feedbackClass = invalidFeedbackAbove ? "feedback-above" : "feedback-below"
        if (feedbackIcon) {
            return <FormFeedback className={feedbackClass}><i className={feedbackIcon}></i>&nbsp;&nbsp;{errorMessage}</FormFeedback>
        } else if (errorMessage) {
            return <FormFeedback className={feedbackClass}>{errorMessage}</FormFeedback>
        } else {
            return null
        }
    }

    formText() {
        const {helpMessage = null, helpIcon = null} = this.props
        if (helpIcon) {
            return <FormText color="muted"><i className={helpIcon}></i>&nbsp;&nbsp;{helpMessage}x</FormText>
        } else if (helpMessage) {
            return <FormText color="muted">{helpMessage}</FormText>
        } else {
            return null
        }
    }

    gasFeeFormText() {
        const {actionDisabled, gasFeeInfo} = this.props
        if (gasFeeInfo && !actionDisabled) {
            return <FormText color="muted">{gasFeeInfo}</FormText>
        } else {
            return null
        }

    }
}