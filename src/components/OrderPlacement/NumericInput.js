import React from "react"
import { FormGroup, FormFeedback, Label, Col, Input, FormText, InputGroupAddon, Button } from 'reactstrap'

export default class NumericInput extends React.Component {
    static cleanValueToDecimal(value) {
        return value
            .replace(/[^0-9.]/g, () => "") // globally strip everything that isn't a digit or a .
            .replace(/^\./, () => "0.") // force numbers starting with . to be 0.
            .replace(/^([0-9]*\.[0-9]*).*/, (m, p1) => p1) // replace any poo following sensible decimal (e.g. second ".")
    }

    onChangeFilteringInput = (e) => {
        const cleanValue = NumericInput.cleanValueToDecimal(e.target.value)
        this.props.onChange(cleanValue)
    }

    onMax() {
        this.props.onMax()
    }

    render() {
        const { name, unitName, fieldName, value, valid = true, errorMessage = null, disabled = false, helpMessage = null, onMax = null } = this.props
        const isInvalid = valid !== null && !valid

        let maxButton = null
        if (typeof (onMax) === 'function') {
            maxButton = <InputGroupAddon addonType="append"><Button color="secondary" onClick={() => this.onMax()}>MAX</Button></InputGroupAddon>
        }

        return (
            <FormGroup row>
                <Label for={fieldName} sm={3}>{name}</Label>
                <Col sm={9}>
                    <div className="input-group">
                        <Input id={fieldName}
                            disabled={disabled}
                            value={value}
                            onChange={this.onChangeFilteringInput}
                            placeholder="0.00"
                            invalid={isInvalid} />
                        {maxButton}
                        <div className="input-group-append">
                            <div className="input-group-text">{unitName}</div>
                        </div>
                        <FormFeedback>{errorMessage}</FormFeedback>
                        <FormText color="muted">{helpMessage}</FormText>
                    </div>
                </Col>
            </FormGroup>
        )
    }
}