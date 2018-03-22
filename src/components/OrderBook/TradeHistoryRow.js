import React from "react"
import Config from "../../Config"
import TruncatedNumber from "../CustomComponents/TruncatedNumber"
import Date from "../CustomComponents/Date"

export default class OrdersTableRow extends React.Component {
    render() {
        const {trade} = this.props

        return (
            <tr>
                <td><TruncatedNumber>{trade.price}</TruncatedNumber></td>
                <td><TruncatedNumber>{trade.amount}</TruncatedNumber></td>
                <td><TruncatedNumber>{trade.amountBase}</TruncatedNumber></td>
                <td>{trade.side}</td>
                <td><Date>{trade.date}</Date></td>
                <td>
                    <button className="btn btn-sm btn-secondary table-button" target="_blank" rel="noopener" href={`${Config.getEtherscanUrl()}/tx/${trade.txHash}`}>View Transaction</button>
                </td>
            </tr>
        )
    }
}
