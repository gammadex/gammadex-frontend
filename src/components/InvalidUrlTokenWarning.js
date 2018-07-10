import React from "react"
import Conditional from "./CustomComponents/Conditional"
import TokenStore from "../stores/TokenStore"
import {Popover, PopoverHeader, PopoverBody} from 'reactstrap'

export default class InvalidUrlTokenWarning extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            invalidTokenIdentifierInUrl: TokenStore.getInvalidTokenIdentifierInUrl(),
            invalidPopoverOpen: false,
        }

        this.onTokenStoreChange = this.onTokenStoreChange.bind(this)
    }

    componentDidMount() {
        TokenStore.on("change", this.onTokenStoreChange)
    }

    componentWillUnmount() {
        TokenStore.removeListener("change", this.onTokenStoreChange)
      }

    onTokenStoreChange() {
        this.setState({
            invalidTokenIdentifierInUrl: TokenStore.getInvalidTokenIdentifierInUrl(),
        })
    }

    toggleInvalidPopover = () => {
        this.setState({
            invalidPopoverOpen: !this.state.invalidPopoverOpen
        })
    }

    render() {
        const {invalidTokenIdentifierInUrl} = this.state

        return (
            <Conditional displayCondition={!!invalidTokenIdentifierInUrl}>
                <div className="alert alert-danger main-warning">Invalid token <span id="unlisted-popover-target" onClick={this.toggleInvalidPopover}><i className="fas fa-question-circle"></i></span></div>

                <Popover className="padded-popover" placement="bottom" isOpen={this.state.invalidPopoverOpen} target={"unlisted-popover-target"} toggle={this.toggleInvalidPopover}>
                    <PopoverHeader>Invalid token</PopoverHeader>
                    <PopoverBody>
                        <strong>{invalidTokenIdentifierInUrl}</strong> is not recognised as a token address or symbol
                    </PopoverBody>
                </Popover>

            </Conditional>
        )
    }
}