import React from "react"

export default class OrdersTableRow extends React.Component {
    render() {
        const {trade} = this.props

        return (
            <tr>
                <td>{trade.price}</td>
                <td>{trade.amount}</td>
                <td>{trade.amountBase}</td>
                <td>{trade.side}</td>
                <td>{trade.date}</td>
                <td>
                    <a className="btn btn-sm btn-primary table-button" target="_blank" rel="noopener" href={`https://etherscan.io/address/${trade.buyer}`}>Buyer</a>
                    <a className="btn btn-sm btn-primary table-button" target="_blank" rel="noopener" href={`https://etherscan.io/address/${trade.seller}`}>Seller</a>
                    <a className="btn btn-sm btn-primary table-button" target="_blank" rel="noopener" href={`https://etherscan.io/tx/${trade.txHash}`}>Transaction</a>
                </td>
            </tr>
        )
    }
}
