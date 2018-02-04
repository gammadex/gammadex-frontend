import React from "react"
import OrderBookStore from '../../stores/OrderBookStore'

export default class TokenStats extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            last: null,
            lastUp: null,
            bid: null,
            bidUp: null,
            offer: null,
            offerUp: null,
        }

        this.saveCurrentPrices = this.saveCurrentPrices.bind(this)
    }

    componentWillMount() {
        OrderBookStore.on("change", this.saveCurrentPrices)
    }

    // TODO - this is buggy as hell - needs a test written
    saveCurrentPrices() {
        this.setState(function (prevState, props) {
            const last = OrderBookStore.getFirstTradePriceOrNull()
            const prevLast = prevState.last ? prevState.last : OrderBookStore.getSecondTradePriceOrNull()
            const lastUp = TokenStats.isUp(prevLast, last)

            const bid = OrderBookStore.getFirstBidPriceOrNull()
            const prevBid = prevState.bid ? prevState.bid : last
            const bidUp = TokenStats.isUp(prevBid, bid)

            const offer = OrderBookStore.getFirstOfferPriceOrNull()
            const prevOffer = prevState.offer ? prevState.offer : last
            const offerUp = TokenStats.isUp(prevOffer, offer)

            return {
                last: last,
                lastUp: lastUp,
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
        const {last, lastUp, bid, bidUp, offer, offerUp} = this.state
        const lastTitleClass = this.getTitleClass(last, lastUp)
        const lastPriceClass = this.getPriceClass(last, lastUp)
        const bidTitleClass = this.getTitleClass(bid, bidUp)
        const bidPriceClass = this.getPriceClass(bid, bidUp)
        const offerTitleClass = this.getTitleClass(offer, offerUp)
        const offerPriceClass = this.getPriceClass(offer, offerUp)

        return (
            <div>
                <h2>{token} / ETH</h2>
                <div className="row">
                    <div className="col-lg-1"><strong className={lastTitleClass}>Last</strong></div>
                    <div className="col-lg-1">&nbsp;</div>
                    <div className="col-lg-1"><strong className={lastPriceClass}></strong></div>
                    <div className="col-lg-9">{last}</div>
                </div>
                <div className="row">
                    <div className="col-lg-1"><strong className={bidTitleClass}>Bid</strong></div>
                    <div className="col-lg-1">&nbsp;</div>
                    <div className="col-lg-1"><strong className={bidPriceClass}></strong></div>
                    <div className="col-lg-9">{bid}</div>
                </div>
                <div className="row">
                    <div className="col-lg-1"><strong className={offerTitleClass}>Offer</strong></div>
                    <div className="col-lg-1">&nbsp;</div>
                    <div className="col-lg-1"><strong className={offerPriceClass}></strong></div>
                    <div className="col-lg-9">{offer}</div>
                </div>
            </div>
        )
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
        if (! val) {
          return "p-l-5 "
        } else if (up === null) {
            return "p-l-5 "
        } else if (up) {
            return "p-l-5 fas fa-arrow-circle-up price-up"
        } else {
            return "p-l-5 fas fa-arrow-circle-down price-down"
        }
    }
}

