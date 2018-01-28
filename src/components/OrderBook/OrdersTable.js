import React from "react"

export default class OrderBook extends React.Component {
    render() {
        const {base, token, orderTypeTitle} = this.props

        return (
            <div className="col-lg-6">
                <h3>{orderTypeTitle}</h3>
                <table id="bids" className="table table-striped">
                    <thead>
                    <tr>
                        <th>User</th>
                        <th>Total ({base})</th>
                        <th>Size (<span id="bidsToken">{token}</span>)</th>
                        <th>Bid ({base})</th>
                    </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
                <ul className="pagination float-right">
                    <li className="page-item"><a className="page-link" href="#">Previous</a></li>
                    <li className="page-item"><a className="page-link" href="#">1</a></li>
                    <li className="page-item"><a className="page-link" href="#">2</a></li>
                    <li className="page-item"><a className="page-link" href="#">3</a></li>
                    <li className="page-item"><a className="page-link" href="#">Next</a></li>
                </ul>
            </div>
        );
    }
}