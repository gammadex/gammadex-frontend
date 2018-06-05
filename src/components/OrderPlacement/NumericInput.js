import React from "react"
import { FormGroup, FormFeedback, Label, Col, Input, FormText, InputGroupAddon, Button } from 'reactstrap'

export default class NumericInput extends React.Component {
    constructor(props) {
        super(props)
        this.formFeedback = this.formFeedback.bind(this)
        this.formText = this.formText.bind(this)
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

    onChangeFilteringInput = (e) => {
        const { forceInteger = false } = this.props
        const cleanValue = forceInteger ? NumericInput.cleanValueToInteger(e.target.value) : NumericInput.cleanValueToDecimal(e.target.value)
        this.props.onChange(cleanValue)
    }

    onMax() {
        this.props.onMax()
    }

    onAction() {
        this.props.onAction()
    }

    formFeedback() {
        const { errorMessage = null, feedbackIcon = null } = this.props
        if (feedbackIcon) {
            return <FormFeedback><i className={feedbackIcon}></i>&nbsp;&nbsp;{errorMessage}</FormFeedback>
        } else {
            return <FormFeedback>{errorMessage}</FormFeedback>
        }
    }

    formText() {
        const { helpMessage = null, helpIcon = null } = this.props
        if (helpIcon) {
            return <FormText color="muted"><i className={helpIcon}></i>&nbsp;&nbsp;{helpMessage}</FormText>
        } else {
            return <FormText color="muted">{helpMessage}</FormText>
        }
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
            errorMessage = null,
            disabled = false,
            helpMessage = null,
            onMax = null,
            onAction = null,
            actionName = null,
            actionDisabled = false,
            placeholder = "0.00",
            submittable = false
        } = this.props
        const isInvalid = valid !== null && !valid

        let maxButton = null
        if (typeof (onMax) === 'function') {
            maxButton = <InputGroupAddon addonType="append"><Button color="link"
                onClick={() => this.onMax()}>MAX</Button></InputGroupAddon>
        }

        let firstCol = <Label for={fieldName} sm={3}>{name}</Label>
        if (typeof (onAction) === 'function' && actionName) {
            firstCol = <Col sm={3}><Button color="primary" disabled={actionDisabled}
                onClick={() => this.onAction()}>{actionName}</Button></Col>
        }

        const input = (
            <div className="input-group">
                <Input id={fieldName}
                    autoComplete="off"
                    disabled={disabled}
                    value={value}
                    onChange={this.onChangeFilteringInput}
                    placeholder={placeholder}
                    invalid={isInvalid} />
                {maxButton}
                <div className="input-group-append">
                    <div className="input-group-text">{unitName}</div>
                </div>
                {this.formFeedback()}
                {this.formText()}
            </div>
        )

        const content = submittable ? <form onSubmit={this.onSubmit}>{input}</form> : input

        return (
            <FormGroup row>
                {firstCol}
                <Col sm={9}>
                    {content}
                </Col>
            </FormGroup>
        )
    }
}