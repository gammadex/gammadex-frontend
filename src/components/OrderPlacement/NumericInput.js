import React from "react"
import {FormGroup, FormFeedback, Label, Col, Input} from 'reactstrap'

export default class NumericInput extends React.Component {
    constructor(props) {
        super(props)
        this.state = { prevKey: null }
    }

    /**
     * Prevent negative or non-numeric values from being pasted
     */
    onPaste = (e) => {
        const check = Number(this.props.value + e.clipboardData.getData('Text'))
        if (isNaN(check) || check < 0) {
            e.preventDefault()
        }
    }

    /**
     * Only accept numeric inputs
     */
    onKeyDown = (e) => {
        // Allow navigation, backspace, delete, insert and tab
        if ((e.keyCode > 34 && e.keyCode < 41) || [8, 9, 45, 46].includes(e.keyCode)) {
            return
        }

        // Allow CTRL-A, copy/paste
        if (e.ctrlKey === true && [65, 67, 86, 88].includes(e.keyCode)) {
            return
        }

        // Take the existing value and concatenate the next character. If the result is
        // NaN then reject the character.
        const check = Number(this.props.value + e.key)
        if ((this.state.prevKey === "." && e.key === ".") || isNaN(check)) {
            e.preventDefault()
        }

        this.state.prevKey = e.key
    }

    render() {
        const {name, unitName, fieldName, value, onChange, valid = true, errorMessage = null} = this.props
        const isInvalid = valid != null && !valid;

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
                               invalid={isInvalid} onKeyDown={this.onKeyDown} onPaste={this.onPaste}/>
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