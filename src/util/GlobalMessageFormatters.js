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
    const errorMessage = (error && error.message) ? `- ${error.message}` : ''
    return `${ucType} of ${amount} ${unit} failed ${errorMessage}`
}

export function getCancelInitiated(unit, txHash) {
    return (
        <div>
            <div>Generated transaction for cancel of {unit} order</div>
            <div><Etherscan type="tx" address={txHash.toString()}/></div>
        </div>
    )
}

export function getCancelComplete(unit) {
    return `Cancel open order of ${unit} completed`
}

export function getCancelFailed(unit, error) {
    const errorMessage = (error && error.message) ? `- ${error.message}` : ''
    return `Cancel open order of ${unit} failed ${errorMessage}`
}

export function getTradeInitiated(amount, unit, txHash) {
    return (
        <div>
            <div>Generated transaction for trade of {amount} {unit}</div>
            <div><Etherscan type="tx" address={txHash.toString()}/></div>
        </div>
    )
}

export function getTradeComplete(amount, unit) {
    return `Trade of ${amount} ${unit} completed`
}

export function getTradeFailed(amount, unit, error) {
    const errorMessage = (error && error.message) ? `- ${error.message}` : ''
    return `Trade of ${amount} ${unit} failed ${errorMessage}`
}
