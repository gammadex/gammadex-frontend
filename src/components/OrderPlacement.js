import React from "react"
import OrderBox from "./OrderPlacement/OrderBox.js"

export default class OrderPlacement extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { token } = this.props

        return (
            <div>
                <div className="row">
                    <div className="col-lg-6">
                        <OrderBox
                            type="buy"
                            tokenName={token.name}
                        />
                    </div>

                    <div className="col-lg-6">
                        <OrderBox
                            type="sell"
                            tokenName={token.name}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

