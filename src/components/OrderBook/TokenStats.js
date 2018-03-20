import React from "react"
import OrderBookStore from '../../stores/OrderBookStore'

export default class TokenStats extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            trade: null,
            tradeUp: null,
            bid: null,
            bidUp: null,
            offer: null,
            offerUp: null,
        }
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveCurrentPrices)
    }

    componentWillUnmount() {
        OrderBookStore.removeListener("change", this.saveCurrentPrices)
    }

    /*
     TODO - this is bollocks really.

     Should really just go with difference to latest trade for bid / offer move direction indicator

     Currently the latest bid or offer is diffed to the next older one and this may not be the same as the one at the
     top of the order book
      */
    saveCurrentPrices = () => {
        this.setState(function (prevState, props) {
            // TODO - maybe this logic should go in Store or a util called by store
            let trade = null, tradeUp = null
            const trades = OrderBookStore.getTwoLatestTradePrices()
            if (trades) {
                trade = trades[1]
                tradeUp = TokenStats.isUp(trades[0], trades[1])
            }

            let bid = null, bidUp = null
            const bids = OrderBookStore.getTwoLatestBidPrices()
            if (bids) {
                bid = bids[1]
                bidUp = TokenStats.isUp(bids[0], bids[1])
            }

            let offer = null, offerUp = null
            const offers = OrderBookStore.getTwoLatestOfferPrices()
            if (offers) {
                offer = offers[1]
                offerUp = TokenStats.isUp(offers[0], offers[1])
            }

            return {
                trade: trade,
                tradeUp: tradeUp,
                bid: bid,
                bidUp: bidUp,
                offer: offer,
                offerUp: offerUp,
            }
        })
    }

    static isUp(prev, curr) {
        if (prev && curr) {
            if (prev > curr) {
                return false
            } else if (prev < curr) {
                return true
            } else {
                return null
            }
        } else {
            return null
        }
    }

    render() {
        const {token} = this.props
        const {trade, tradeUp, bid, bidUp, offer, offerUp} = this.state
        const tradeTitleClass = this.getTitleClass(trade, tradeUp)
        const tradePriceClass = this.getPriceClass(trade, tradeUp)
        const bidTitleClass = this.getTitleClass(bid, bidUp)
        const bidPriceClass = this.getPriceClass(bid, bidUp)
        const offerTitleClass = this.getTitleClass(offer, offerUp)
        const offerPriceClass = this.getPriceClass(offer, offerUp)

        if (trade && bid && offer) {
            return (
                <div>
                    <h2>{token} / ETH</h2>
                    <div className="row">
                        <div className="col-lg-1"><strong className={tradeTitleClass}>Last</strong></div>
                        <div className="col-lg-11">{trade}</div>
                    </div>
                    <div className="row">
                        <div className="col-lg-1"><strong className={bidTitleClass}>Bid</strong></div>
                        <div className="col-lg-11">{bid}</div>
                    </div>
                    <div className="row">
                        <div className="col-lg-1"><strong className={offerTitleClass}>Offer</strong></div>
                        <div className="col-lg-11">{offer}</div>
                    </div>
                </div>
            )
        } else {
            return <div></div>
        }
    }

    getTitleClass(val, up) {
        if (! val || up === null) {
            return ""
        } else if (up) {
            return "price-up"
        } else {
            return "price-down"
        }
    }

    getPriceClass(val, up) {
        if (! val || up === null) {
          return ""
        } else if (up) {
            return "p-l-5 fas fa-arrow-circle-up price-up"
        } else {
            return "p-l-5 fas fa-arrow-circle-down price-down"
        }
    }
}

