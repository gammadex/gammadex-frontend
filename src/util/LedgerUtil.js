import * as Web3 from 'web3'
import createLedgerSubprovider from "../hacks/LedgerWeb3SubProvider"
import TransportU2F from "@ledgerhq/hw-transport-u2f"
import ProviderEngine from "web3-provider-engine"
import RpcSubprovider from "web3-provider-engine/subproviders/rpc"

export function getLedgerWeb3(deriviationPath, web3Url, networkId) {
    const engine = new ProviderEngine()
    const getTransport = () => TransportU2F.create()
    // We need our own version of createLedgerSubprovider since the Ledger provided one has a bug with
    // address lookup when using web3 1.0.x - TODO - file a bug report - WR
    const ledger = createLedgerSubprovider(getTransport, {
        path: deriviationPath,
        networkId: networkId,
        accountsLength: 5
    })
    engine.addProvider(ledger)
    engine.addProvider(new RpcSubprovider({rpcUrl: web3Url}))
    engine.start()
    //engine.stop()

    // engineWithNoEventEmitting is needed because infura doesn't support newBlockHeaders event :( - WR
    // https://github.com/ethereum/web3.js/issues/951
    const engineWithNoEventEmitting = Object.assign(engine, {on: false})

    return new Web3(engineWithNoEventEmitting)
}

export function isDerivationPathValid(derivationPath) {
    return !!derivationPath.match("m/44'/(60|61)'/[0-9]+'")
}

export function stripDerivationPathPrefix(derivationPath) {
    return derivationPath.replace('m/', '')
}
