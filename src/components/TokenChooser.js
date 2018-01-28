import React from "react"
import TokenStore from '../stores/TokenStore'
import * as TokenActions from "../actions/TokenActions"
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import _ from "lodash"
import Config from '../Config'

export default class TokenChooser extends React.Component {
    constructor() {
        super()

        this.state = {
            selectedToken: Config.getDefaultToken(),
            tokenOptions: this.getTokens()
        }

        this.saveSelectedToken = this.saveSelectedToken.bind(this)
    }

    componentWillMount() {
        TokenStore.on("change", this.saveSelectedToken)
    }

    getTokens() {
        // TODO this sorting should fgo in the config object
        const tokens = Config.getTokens().map((tk) => {
            return {
                value: tk.address,
                label: tk.name
            }
        })

        return _.sortBy(tokens, (tk) => tk.label)
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
        )
    }
}

