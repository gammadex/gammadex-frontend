import React from "react"
import * as OrderBookActions from "../actions/OrderBookActions"
import OrderBookStore from '../stores/OrderBookStore'
import TradeHistoryTable from "./OrderBook/TradeHistoryTable"
import Pagination from './CustomComponents/Pagination'
import {Box, BoxSection} from "./CustomComponents/Box"

// TODO - use a TradeStore, not OrderBookStore
export default class TradeHistory extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            trades: [],
            tradesPage: 0,
            numTradesPages: 0,
        }
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveTrades)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveTrades)
    }

    changeTradesPage = (page) => {
        OrderBookActions.changeTradesPage(page)
    }

    saveTrades = () => {
        this.setState((prevState, props) => ({
            trades: OrderBookStore.getTradesOnCurrentPage(),
            tradesPage: OrderBookStore.getTradesPage(),
            numTradesPages: OrderBookStore.getNumTradesPages(),
        }))
    }

    render() {
        const {token, pageSize} = this.props
        const {trades, tradesPage, numTradesPages} = this.state

        return (
            <Box title="Trade History">
                <TradeHistoryTable base="ETH" token={token.name} trades={trades} pageSize={pageSize}/>

                <BoxSection>
                    <div className="float-right">
                        <Pagination page={tradesPage} numPages={numTradesPages}
                                    onPageChange={this.changeTradesPage}/>
                    </div>
                </BoxSection>
            </Box>
        )
    }
}