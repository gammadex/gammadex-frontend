import React from "react"
import Round from "../CustomComponents/Round"
import Etherscan from "../CustomComponents/Etherscan"
import {Popover, PopoverHeader, PopoverBody} from 'reactstrap'
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
                <td><Round>{String(trade.amount)}</Round></td>
                <td><Round>{String(trade.amountBase)}</Round></td>
                <td className="before-etherscan-column">
                    <Date noSeconds>{trade.date}</Date>
                </td>
                <td className="etherscan-column"><Etherscan type="tx" address={trade.txHash} display="icon"/></td>
            </tr>
        )
    }
}