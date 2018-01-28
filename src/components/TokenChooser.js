import React from "react";
import ConfigStore from '../stores/ConfigStore'
import TokenStore from '../stores/TokenStore'
import * as TokenActions from "../actions/TokenActions"
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import _ from "lodash"

export default class TokenChooser extends React.Component {
    constructor() {
        super()

        this.state = {
            selectedToken: {},
            tokenOptions: []
        }

        this.saveTokens = this.saveTokens.bind(this)
        this.saveSelectedToken = this.saveSelectedToken.bind(this)
    }

    componentWillMount() {
        TokenStore.on("change", this.saveSelectedToken)
        ConfigStore.on("change", this.saveTokens)
    }

    saveTokens() {
        const tokens = ConfigStore.getTokens().map((tk) => {
            return {
                value: tk.address,
                label: tk.name
            }
        })
        const tokenOptions = _.sortBy(tokens, (tk) => tk.label)
        const selectedToken = ConfigStore.getDefaultToken()

        this.setState({
            tokenOptions,
            selectedToken
        })
    }

    saveSelectedToken() {
        const state = this.state
        const selectedToken = TokenStore.getSelectedToken()
        if (selectedToken && selectedToken.address) {
            state.selectedToken = selectedToken
            this.setState(state)
        }
    }

    handleSelect(select) {
        if (select && select.value) {
            TokenActions.selectToken(select.label, select.value)
        }
    }

    render() {
        const {selectedToken, tokenOptions} = this.state

        return (
            <div className="row">
                <div className="col-lg-12">
                    <label htmlFor="tokens"><b>Token:</b></label>

                    <Select
                        name="form-field-name"
                        value={selectedToken.address}
                        onChange={this.handleSelect.bind(this)}
                        options={tokenOptions}
                        clearable={false}
                    />
                </div>
            </div>
        );
    }
}

