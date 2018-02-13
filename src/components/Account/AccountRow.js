import React from "react"
import { Button } from 'reactstrap'

export default class AccountTableRow extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { token, decimals, walletBalanceWei, exchangeBalanceWei, transaction, toggleModal } = this.props

        return (
            <tr>
                <td>
                    <Button color="primary" onClick={() => toggleModal(token === "ETH", true)}>Deposit</Button>{' '}
                    <Button color="primary" onClick={() => toggleModal(token === "ETH", false)}>Withdraw</Button>{' '}
                </td>
                <td>{token}</td>
                <td>{Number(walletBalanceWei) / Math.pow(10, Number(decimals))}</td>
                <td>{Number(exchangeBalanceWei) / Math.pow(10, Number(decimals))}</td>
                <td>{(transaction ? <a href={`https://ropsten.etherscan.io/tx/${transaction}`}>{transaction}</a> : "")}</td>
            </tr>
        )
    }
}
