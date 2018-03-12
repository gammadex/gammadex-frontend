import React from "react"
import * as TokenActions from "../actions/TokenActions"
import * as WebSocketActions from "../actions/WebSocketActions"
import Select from 'react-select'
import 'react-select/dist/react-select.css'

export default class DropDownTokenChooser extends React.Component {
    constructor(props) {
        super(props)
    }

    handleSelect(select) {
        if (select && select.value) {
            TokenActions.selectToken(select.label, select.value)
            WebSocketActions.getMarket()
        }
    }

    render() {
        const {token, tokenOptions} = this.props

        return (
            <div className="row">
                <div className="col-lg-12">
                    <label htmlFor="tokens"><b>Token:</b></label>

                    <Select
                        name="form-field-name"
                        value={token.address}
                        onChange={this.handleSelect.bind(this)}
                        options={tokenOptions}
                        clearable={false}
                    />
                </div>
            </div>
        )
    }
}
