import React from "react"
import OrderRow from './OrderRow'

export default class OrdersTable extends React.Component {
    render() {
        const {base, token, pendingToken, orderTypeTitle, orders, orderTypeColName} = this.props

        const rows = orders.map((order) => {
            return <OrderRow key={order.id} order={order}/>
        })

        let tokenSpan = <span className="text-warning">{pendingToken}</span>
        if (token != null) {
            tokenSpan = <span className="text-success">{token}</span>
        }

        return (
            <div className="col-lg-6">
                <h3>{orderTypeTitle}</h3>
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Total ({base})</th>
                        <th>Size ({tokenSpan})</th>
                        <th>{orderTypeColName} ({base})</th>
                    </tr>
                    {rows}
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
        )
    }
}