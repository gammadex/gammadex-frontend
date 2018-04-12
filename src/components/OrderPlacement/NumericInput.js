import React from "react"
import {FormGroup, FormFeedback, Label, Col, Input} from 'reactstrap'

export default class NumericInput extends React.Component {
    render() {
        const {name, unitName, fieldName, value, onChange, valid = null, errorMessage = null} = this.props

        return (
            <FormGroup row>
                <Label for={fieldName} sm={3}>{name}</Label>
                <Col sm={9}>
                    <div className="input-group">
                        <Input type="number" min={0} id={fieldName}
                               value={value}
                               onChange={onChange}
                               placeholder="0.00"
                               step="any"
                               valid={valid}/>
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