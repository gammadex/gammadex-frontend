import React from "react"
import TruncatedNumber from "../CustomComponents/TruncatedNumber"
import Etherscan from "../CustomComponents/Etherscan"
import { Button, Popover, PopoverHeader, PopoverBody } from 'reactstrap'
import Date from "../CustomComponents/Date"

export default class OrdersTableRow extends React.Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            popoverOpen: false
        };
    }

    toggle() {
        this.setState({
            popoverOpen: !this.state.popoverOpen
        });
    }

    render() {
        const {trade, token} = this.props

        const cssClass = (trade.side === 'buy') ? 'buy-green' : 'sell-red'

        return (
            <tr className={cssClass}>
                <td onClick={this.toggle} className="clickable">
                    <span id={"Popover" + trade.txHash}></span>

                    <Popover placement="top" isOpen={this.state.popoverOpen} target={"Popover" + trade.txHash} toggle={this.toggle}>
                        <PopoverHeader>{trade.side} of <TruncatedNumber>{trade.amount}</TruncatedNumber> {token}</PopoverHeader>
                        <PopoverBody>
                            <div><strong>Date:</strong> <Date>{trade.date}</Date></div>
                        </PopoverBody>
                    </Popover>

                    <TruncatedNumber>{trade.price}</TruncatedNumber>
                </td>
                <td onClick={this.toggle} className="clickable"><TruncatedNumber>{trade.amount}</TruncatedNumber></td>
                <td onClick={this.toggle} className="clickable"><TruncatedNumber>{trade.amountBase}</TruncatedNumber></td>
                <td>
                    <Etherscan type="tx" address={trade.txHash} display="icon"/>
                </td>
            </tr>
        )
    }
}