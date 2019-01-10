
### Test coverage of critical codepaths (#117)

The general goal here is to have high confidence in the funds, trading and gas management sections of the codebase. It is not meant to be fully comprehensive, but the bare minimum MVP to ensure client funds are not at risk.

#### EtherDeltaWeb3

This is Gammadex's interface to the EtherDelta Smart Contract and web3 common methods (e.g. get current block number).

`EtherDeltaWeb3.test.js` exercises all of the class's methods, against a local ganache blockchain. What we're testing here is that the input params to each function are propogated through to the blockchain and have the necessary side effects. Input params for example for filling an order would include: the order itself, the amount to fill and the gas passed in by the caller.

We crucially test two distinct providers that get injected into EtherDeltaWeb3: MetaMask and Wallet (private key). The former calls the contract methods directly, the latter signs and sends raw transactions (with the contract method call as the payload).

#### React Component Testing

Here we test the major account affecting areas: Funding, Trading, Order Creation and Gas Management.

We wrap the components (e.g. `FillOrderBook.js`) using the `enzyme` library which allows us to perform headless testing. For that component for example we might test:

* That when the user clicks on an order it populates the fill component with those details
* When the user adjusts the fill quantity the total (eth) gets recalculated
* **When the user submits the trade, we call into `EtherDeltaWeb3` with the expected parameters (in most cases expanded to wei). This test is crucial to ensuring no client funds are at risk due to: price/amount/total miscalculation, wei miscalcuation or gas mismanagement.**
* We test two distinct ERC-20 tokens, one with 18 decimals the other with 9.

## Useful Links

### React

* https://reactjs.org/tutorial/tutorial.html
* https://reactjs.org/docs/state-and-lifecycle.html
* https://reactstrap.github.io/components
* https://github.com/rrag/react-stockcharts
* https://github.com/markerikson/react-redux-links/blob/master/react-component-patterns.md

### Why reactstrap ^5.0.0-beta?

* https://github.com/reactstrap/reactstrap/issues/659

### React Testing

* *Running tests* https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#running-tests
* *Testing React components* https://facebook.github.io/jest/docs/en/tutorial-react.html
* *Available insertion functions*: https://facebook.github.io/jest/docs/en/expect.html#content

### BootStrap

* https://bootstrapcreative.com/resources/bootstrap-4-css-classes-index/

### Font Awesome 

* https://fontawesome.com/

### EtherDelta API

* https://github.com/etherdelta/etherdelta.github.io/blob/master/docs/API.md

### EtherDelta Smart Contract on Ropsten

* https://ropsten.etherscan.io/address/0x228344536a03c0910fb8be9c2755c1a0ba6f89e1

### Socket.IO

* https://github.com/socketio/socket.io-client/blob/HEAD/docs/API.md#manager

## JS

* http://exploringjs.com/es6/ch_destructuring.html

### Potential NPM packages for charting:

* https://www.npmjs.com/package/time-spans
* https://www.npmjs.com/package/technicalindicators

### D3 / Charting

* *Using D3 and React* https://medium.com/@Elijah_Meeks/interactive-applications-with-react-d3-f76f7b3ebc71
* *TechchanJS* http://bl.ocks.org/andredumas/af8674d57980790137a0

### ERC-20 Test Tokenw:

* TST - https://github.com/uzyn/ERC20-TST

#### To request TST tokens:

* go to https://www.myetherwallet.com/#contracts
* ensure you are connected to ropsten (infura.io works)
* paste in the address and interface from the github
* scroll down to read/write contract and select showMeTheMoney
* set "_to" to your address
* set "_value" to 10000000000000000000  (this is 10 tokens = 10 * power(10,18))
* click write
* go to metamask and export your private key then paste it into myetherwallet to unlock, hit send
* this should give you 10 tokens

* BARRY - http://www.darrenbeck.co.uk/ethereum/crypto/solidity/barry/

#### To request BARRY tokens:

* send ETH to 0x7d3613dd9b10999115fe455c0295e4b8ab8dc35e and you will receive double the amount in BARRY

### Ledger Nano

* https://github.com/Neufund/ledger-wallet-provider
* https://github.com/LedgerHQ/ledgerjs/blob/master/docs/ethereum_ledger_integration.md
