import React from "react"

export default class OrdersTableRow extends React.Component {
    render() {
        const {trade} = this.props

        return (
            <tr>
                <td>{trade.price}</td>
                <td>{trade.amountBase}</td>
                <td>{trade.amount}</td>
                <td>{trade.side}</td>
                <td>{trade.date}</td>
            </tr>
        )
    }
}
