import React from "react"

export default class SafetyWarning extends React.Component {
    render() {
        return <div>
            <h4><span className="fas fa-exclamation-triangle text-warning"></span>&nbsp;This is not a recommended way to access your wallet</h4>
            <br />
            <p>Where possible we recommend you use a safer alternative, such as a Hardware Wallet or at the very least MetaMask.</p>
            <p>Entering your Private Key or unlocking your JSON Keystore on a website is risky, which can leave you open to phishing attacks and loss of funds. Always verify that you are using the correct GammaDEX website and bookmark it appropriately. If something does not look right, please report this in our Support channels.</p>
            <br />
        </div>
    }
}

