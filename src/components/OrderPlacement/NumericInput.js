import React from "react"
import {FormGroup, FormFeedback, Label, Col, Input} from 'reactstrap'

export default class NumericInput extends React.Component {
    constructor(props) {
        super(props)
    }

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

    render() {
        const {name, unitName, fieldName, value, valid = true, errorMessage = null} = this.props
        const isInvalid = valid !== null && !valid;

        return (
            <FormGroup row>
                <Label for={fieldName} sm={3}>{name}</Label>
                <Col sm={9}>
                    <div className="input-group">
                        <Input id={fieldName}
                               value={value}
                               onChange={this.onChangeFilteringInput}
                               placeholder="0.00"
                               invalid={isInvalid}/>
                        <div className="input-group-append">
                            <div className="input-group-text">{unitName}</div>
                        </div>
                        <FormFeedback>{errorMessage}</FormFeedback>
                    </div>
                </Col>
            </FormGroup>
        )
    }
}