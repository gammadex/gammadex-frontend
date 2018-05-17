import React from "react"
import Etherscan from "../components/CustomComponents/Etherscan"
import _ from "lodash"

export function getTransferInitiated(amount, type, unit, txHash) {
    return (
        <div>
            <div>Generated transaction for {type} of {amount} {unit}</div>
            <div><Etherscan type="tx" address={txHash.toString()}/></div>
        </div>
    )
}

export function getTransferComplete(amount, type, unit) {
    const ucType = _.capitalize(type)
    return `${ucType} of ${amount} ${unit} completed`
}

export function getTransferFailed(amount, type, unit, error) {
    const ucType = _.capitalize(type)
    return `${ucType} of ${amount} ${unit} failed - ${error.message}`
}

