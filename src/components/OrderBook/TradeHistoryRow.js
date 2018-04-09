import React from "react"
import Round from "../CustomComponents/Round"
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
            <tr>
                <td onClick={this.toggle} className={"clickable " + cssClass}>
                    <span id={"Popover" + trade.txHash}></span>

                    <Popover placement="top" isOpen={this.state.popoverOpen} target={"Popover" + trade.txHash} toggle={this.toggle}>
                        <PopoverHeader>{trade.side} of <Round>{trade.amount}</Round> {token}</PopoverHeader>
                        <PopoverBody>
                            <div><strong>Date:</strong> <Date>{trade.date}</Date></div>
                        </PopoverBody>
                    </Popover>

                    <Round price>{trade.price}</Round>
                </td>
                <td onClick={this.toggle} className="clickable"><Round>{trade.amount}</Round></td>
                <td onClick={this.toggle} className="clickable"><Round>{trade.amountBase}</Round></td>
                <td>
                    <Etherscan type="tx" address={trade.txHash} display="icon"/>
                </td>
            </tr>
        )
    }
}