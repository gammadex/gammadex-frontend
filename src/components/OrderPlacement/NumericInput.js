import React from "react"
import {FormGroup, FormFeedback, Label, Col, Input} from 'reactstrap'

export default class NumericInput extends React.Component {
    render() {
        const {name, unitName, fieldName, value, onChange, valid=null, errorMessage=null} = this.props

        return (
            <FormGroup row>
                <Label for={fieldName} sm={3}>{name}</Label>
                <Col sm={6}>
                    <Input type="number" min={0} id={fieldName}
                           value={value}
                           onChange={onChange}
                           valid={valid}/>
                    <FormFeedback>{errorMessage}</FormFeedback>
                </Col>
                <Label sm={3}>{unitName}</Label>
            </FormGroup>
        )
    }
}
