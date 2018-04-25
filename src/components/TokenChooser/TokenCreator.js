import React from "react"

export default class TokenCreator extends React.Component {
    constructor() {
        super()
        this.state = {
            symbol: "",
            address: "",
            decimals: 18
        }
    }

    onClick = event => {
        this.props.create(this.state)
    }

    addressChange = event => {
        this.setState({ address: event.target.value})
    }

    symbolChange = event => {
        this.setState({ symbol: event.target.value})
    }

    decimalsChange = event => {
        this.setState({ decimals: event.target.value})
    }

    render() {
        return (
            <div className="order-box">
                <div className="row form-group">
                    <label className="col-sm-3 col-form-label" htmlFor="address">Address</label>
                    <div className="col-sm-9">
                        <input className="form-control" id="address" placeholder="0x12345..."
                               onChange={this.addressChange} value={this.state.address}/>
                    </div>
                </div>

                <div className="row form-group">
                    <label className="col-sm-3 col-form-label" htmlFor="symbol">Symbol</label>
                    <div className="col-sm-9">
                        <input className="form-control" id="symbol" placeholder="XXX"
                               onChange={this.symbolChange} value={this.state.symbol}/>
                    </div>
                </div>

                <div className="row form-group">
                    <label className="col-sm-3 col-form-label" htmlFor="decimals">Decimals</label>
                    <div className="col-sm-9">
                        <input className="form-control" id="decimals" placeholder="18"
                               onChange={this.decimalsChange} value={this.state.decimals}/>
                    </div>
                </div>

                <div className="row form-group form-inline hdr-stretch-ctr">
                    <button className="btn-sm btn-primary form-control col-sm-4" onClick={this.onClick}>Add</button>
                </div>
            </div>
        )
    }
}