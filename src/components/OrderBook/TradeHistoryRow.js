import React from "react"
import Round from "../CustomComponents/Round"
import Etherscan from "../CustomComponents/Etherscan"
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap'
import Date from "../CustomComponents/Date"

export default class TradeHistoryRow extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const {trade, token, id} = this.props

        const cssClass = (trade.side === 'buy') ? 'buy-green' : 'sell-red'
        const popId = `Popover_${id}_${trade.txHash}`

        return (
            <tr>
                <td><Round price softZeros>{trade.price}</Round></td>
                <td onClick={this.toggle} className="clickable"><Round>{String(trade.amount)}</Round></td>
                <td onClick={this.toggle} className="clickable"><Round>{String(trade.amountBase)}</Round></td>
                <td onClick={this.toggle} className="clickable">
                    <small><Date noSeconds>{trade.date}</Date><br/></small>
                </td>
                <td><Etherscan type="tx" address={trade.txHash} display="icon"/></td>
            </tr>
        )
    }
}