import React from "react"
import Round from "../CustomComponents/Round"
import Etherscan from "../CustomComponents/Etherscan"
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap'
import Date from "../CustomComponents/Date"

export default class TradeHistoryRow extends React.Component {
    constructor(props) {
        super(props)

        this.toggle = this.toggle.bind(this)
        this.state = {
            popoverOpen: false
        }
    }

    toggle() {
        this.setState({
            popoverOpen: !this.state.popoverOpen
        })
    }

    render() {
        const {trade, token, id} = this.props

        const cssClass = (trade.side === 'buy') ? 'buy-green' : 'sell-red'
        const popId = `Popover_${id}_${trade.txHash}`

        return (
            <tr>
                <td onClick={this.toggle} className={"clickable " + cssClass}>
                    <span id={popId}></span>

                    <Popover placement="top" isOpen={this.state.popoverOpen} target={popId} toggle={this.toggle}>
                        <PopoverHeader>{trade.side} of <Round>{trade.amount}</Round> {token}</PopoverHeader>
                        <PopoverBody>
                            <div><strong>Transaction: </strong> <Etherscan type="tx" address={trade.txHash} display="truncate"/></div>
                        </PopoverBody>
                    </Popover>

                    <Round price>{trade.price}</Round>
                </td>
                <td onClick={this.toggle} className="clickable"><Round>{trade.amount}</Round></td>
                <td onClick={this.toggle} className="clickable"><Round>{trade.amountBase}</Round></td>
                <td onClick={this.toggle} className="clickable">
                    <small><Date noSeconds>{trade.date}</Date><br/></small>
                </td>
            </tr>
        )
    }
}