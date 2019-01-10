# GammaDEX

GammaDEX is an open-source Ethereum token exchange written in ReactJS.

A live demo version with trading disabled is at [demo.gammadex.com](https://demo.gammadex.com)

![GammaDEX Logo](https://raw.githubusercontent.com/gammadex/gammadex-frontend/master/docs/gammadex-screenshot.png)


## Running

### Prerequisites for running

`gammadex-frontend` needs a running instance of the [gammadex-backend](https://github.com/gammadex/gammadex-backend) websocket.

The websocket provides the frontend with a list of tradeable tokens, order book contents and so on. 

### Environment variables 

When running or building there are three environment variables that can be set, two of which are required.

| Environment variable | Description                                      | Optionality |  
|----------------------|--------------------------------------------------|-------------|
| RACT_APP_ENV         | Either `production` or `development`             | required    |
| REACT_APP_SOCKET_URL | URL of the `gammadex-backend` websocket server   | required    |
| REACT_APP_DEMO_MODE  | When `true` trading is disabled                  | optional, default `false` |

The `production` environment uses the Ethereum mainnet. The `development` environment uses Ropsten.

### NodeJS Run Profiles

`gammadex-frontend` is a [create-react-app](https://github.com/facebook/create-react-app) based application so it can either be run 
as a node webapp (for development) or it can be built into a static website (for release purposes). Running as a node webapp is good for developing because it supports auto-reload whenever a file is edited. The following run profiles are provided:

| Name  | Description |
|-------|------|
| dev   | env is set to `development` but `REACT_APP_SOCKET_URL` is not set |
| prod  | env is set to `production` but `REACT_APP_SOCKET_URL` is not set  |
| demo  | demo mode is enabled, `REACT_APP_SOCKET_URL` is set to the demo URL (which has limited functionality) |

Assuming you have a production `gammadex-backend` websocket listening on `https://api.example.com` you can run like this on a UNIXy system (Linux/MacOS):

```bash
npm install # one-off npm install to ensure JS dependencies are installed in project
export REACT_APP_SOCKET_URL=https://api.example.com
npm run prod
``` 

## Building / Releasing

To build `gammadex-frontend` as a static site for releasing to a live environment you must set `RACT_APP_ENV`, `REACT_APP_SOCKET_URL` and `REACT_APP_DEMO_MODE` before building. React will populate these variables in the static site.

For example, this builds a mainnnet instance pointing at websocket `https://api.example.com`

```bash
npm install # one-off npm install to ensure JS dependencies are installed in project
export REACT_APP_SOCKET_URL=https://api.example.com
export REACT_APP_ENV=production
export REACT_APP_DEMO_MODE=false
npm run build
``` 

This will create a static site in the `build` directory.

## Testing

**The tests requires a local [Ganache](https://truffleframework.com/ganache) blockchain to be running.**

### Ganache

Globally install:

```bash
npm install -g ganache-cli@6.1.3
```

**Note - Version `6.1.3` is known to work - `6.1.5` doesn't work. Newer versions may or may not work**

In a new terminal start ganache, which also creates a test wallet populated with 1000 ETH (this exact wallet is used by the tests)

```
ganache-cli --account="0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef,1000000000000000000000000000" --port=19546
```

### Running Tests

```bash
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
