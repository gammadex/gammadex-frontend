# EtherGamma ReactJS Spike

## Running

```
npm install
npm run dev
npm run prod
```

## Debug Mode

To use wallet address (read-only) without private key:

https://localhost:3000/#!/debug/ 

## Running Tests

```
npm run test
```

### Running Tests On Linux

You can get this error if too many files are being watched causing Linux barfs. 

```
fs.js:1445
    throw error;
```

The default test run script for apps created with create-react-app (like this one) tries to watch all files in the root directory, including .git and node_modules. 
There is a lower bound set for the number of files which can be watched on linux. One heavyweight solution is to bump the number of allowable watchers on your system.

System level workaround:

* https://github.com/facebook/jest/issues/3254
* https://github.com/amasad/sane/issues/104

### Running Tests on MacOS

When running the tests you may encounter:

```
Error: Error watching file for changes: EMFILE
```

Workaround:

* https://github.com/facebook/create-react-app/issues/871

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
