const wording = `0.1
17 July 2018
#### &#128202;What is GammaDEX?

GammaDEX is an **Decentralized Exchange** that leverages the EtherDelta Smart Contract for trade execution and aggregates liquidity from EtherDelta and ForkDelta. GammaDEX is a ground-up rewrite of the EtherDelta UI with a focus on: security, useability and advanced
account management, **it is _not_ a fork**.

You can unlock your existing EtherDelta/ForkDelta wallets in GammaDEX and benefit from the enhanced trading features.

For a deep-dive comparison of GammaDEX vs EtherDelta, see [TODO].
***
#### &#127963;Benefits of Decentralized Exchanges

* Your trading funds are safely stored on the blockchain within the Exchange Smart Contract. You can deposit/withdraw/trade directly with the Smart Contract using third-party tools such as MEW or Etherscan - even if the GammaDEX site is unavailable.
* GammaDEX does not hold or have access to your trading funds. Only the wallet holder (you) has access to these funds.
* **Any** ERC-20 Token is tradeable on the GammaDEX platform. You should thoroughly research the Tokens you intend to trade and ensure the Token Address is correct.
***
#### &#128274;Security

Given an increasing number of phishing attacks across the Ethereum ecosystem, GammaDEX takes wallet security very seriously. We strongly encourage and endorse the use of a Hardware Wallet (e.g. Ledger), or at the very least recommend you install MetaMask to manage your wallet and transactions.

You can unlock a wallet using a Private Key, **but this is discouraged**. You will be asked for a strong password which is used to encrypt your Private Keys before storing it (encrypted) in your browser's local storage. You will be promoted for this password every time you access GammaDEX.
***
#### &#9981;Gas prices
Deposits, Withdrawals and Trades modify the state of the blockchain, so must be sent as transactions to the Ethereum Network. This costs gas. In busy periods, the gas price can fluctuate. A higher gas pricer means your transaction is more likely to be executed faster by the miners. Conversely, a low gas price may mean your transaction gets bounced around the network and may take several hours or days to execute. GammaDEX pulls in gas information from ETH Gas Station, which gives you some indication on the expected confirmation time based on the gas price you have selected. We recommended you monitor the gas price situation and adapt your gas price based on your desired confirmation time under current gas conditions.
#### &#128395;Disclaimer
You are responsible for your own account, funds, and private keys. You are responsible for your own trading decisions, and the details and mechanics of the tokens you trade. GammaDEX is not responsible for your decisions, actions, or losses that result from using GammaDEX. GammaDEX makes no guarantee about the tokens that you trade using GammaDEX. GammaDEX does not hold your funds and does not offer refunds. While the information contained on GammaDEX is periodically updated, no guarantee is given that the information provided on GammaDEX is correct, complete, or up-to-date. By using GammaDEX, you acknowledge this and agree to these terms.
`

export default wording