// pretty much all nicked from https://github.com/etherdelta/bots/blob/82699ccd13d4808aff3911247fa71fb843ca48ec/js/service.js#L340
// with bit of touch up
import sha256 from 'js-sha256'
import BigNumber from 'bignumber.js'
import EtherDeltaWeb3 from './EtherDeltaWeb3'
import Config from './Config'

import * as EthJsUtil from "ethereumjs-util"

// TODO move into config file and support mainnet and testnet addresses
const etherDeltaAddress = "0x228344536a03c0910fb8be9c2755c1a0ba6f89e1"

class OrderFactory {
    constructor(web3) {
        this.web3 = web3
    }

    createOrder = (side, expires, price, amount, tokenAddress, tokenDecimals, userAddress, userPrivateKey) => {
        // web3js 1 supports message signing -> http://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html#sign
        // FIXMEPLEASE it's a nicer API but hey ho the shit doesn't work
        //
        // const sign = (msgToSignIn, privateKeyIn) => {
        //     try {
        //         const sig = this.web3.eth.accounts.sign(msgToSignIn.slice(2), '0x' + privateKeyIn)
        //         const addr = this.web3.eth.accounts.recover(sig);
        //         console.log(`address = ${addr}, priv key in = ${privateKeyIn}`)
        //         console.log(sig)
        //         const r = `${sig.r.toString('hex')}`
        //         const s = `${sig.s.toString('hex')}`
        //         const v = sig.v
        //         const result = { r, s, v, msg: msgToSignIn }
        //         return result
        //     } catch (err) {
        //         throw new Error(err)
        //     }
        // }

        const sign = (msgToSignIn, privateKeyIn) => {
            const prefixMessage = (msgIn) => {
                let msg = msgIn;
                msg = new Buffer(msg.slice(2), 'hex');
                msg = Buffer.concat([
                    new Buffer(`\x19Ethereum Signed Message:\n${msg.length.toString()}`),
                    msg]);
                msg = this.web3.utils.sha3(`0x${msg.toString('hex')}`, { encoding: 'hex' });
                msg = new Buffer(msg.slice(2), 'hex');
                return `0x${msg.toString('hex')}`;
            };
            const privateKey = privateKeyIn.substring(0, 2) === '0x' ?
                privateKeyIn.substring(2, privateKeyIn.length) : privateKeyIn;
            const msgToSign = prefixMessage(msgToSignIn);
            try {
                const sig = EthJsUtil.ecsign(
                    new Buffer(msgToSign.slice(2), 'hex'),
                    new Buffer(privateKey, 'hex'));
                const r = `0x${sig.r.toString('hex')}`;
                const s = `0x${sig.s.toString('hex')}`;
                const v = sig.v;
                const result = { r, s, v, msg: msgToSign };
                return result;
            } catch (err) {
                throw new Error(err);
            }
        };

        if (side !== 'buy' && side !== 'sell') throw new Error('Side must be buy or sell')
        const amountBigNum = new BigNumber(String(amount))
        const amountBaseBigNum = new BigNumber(String(amount * price))
        const tokenGet = side === 'buy' ? tokenAddress : Config.getBaseAddress()
        const tokenGive = side === 'sell' ? tokenAddress : Config.getBaseAddress()
        const amountGet = side === 'buy' ?
            this.toWei(amountBigNum, tokenDecimals) :
            this.toWei(amountBaseBigNum, Config.getBaseDecimals())
        const amountGive = side === 'sell' ?
            this.toWei(amountBigNum, tokenDecimals) :
            this.toWei(amountBaseBigNum, Config.getBaseDecimals())
        const orderNonce = Number(Math.random().toString().slice(2))

        const hash = `0x${this.orderHash(tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce)}`

        const sig = sign(hash, userPrivateKey)

        const contractAddr = etherDeltaAddress
        const orderObject = {
            amountGet,
            amountGive,
            tokenGet,
            tokenGive,
            contractAddr,
            expires,
            nonce: orderNonce,
            user: userAddress,
            v: sig.v,
            r: sig.r,
            s: sig.s,
        }

        return orderObject
    }

    orderHash = (tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce) => {
        const zeroPad = (num, places) => {
            const zero = (places - num.toString().length) + 1
            return Array(+(zero > 0 && zero)).join('0') + num
        }

        const parseToDigitsArray = (str, base) => {
            const digits = str.split('')
            const ary = []
            for (let i = digits.length - 1; i >= 0; i -= 1) {
                const n = parseInt(digits[i], base)
                if (isNaN(n)) return null
                ary.push(n)
            }
            return ary
        }

        const add = (x, y, base) => {
            const z = []
            const n = Math.max(x.length, y.length)
            let carry = 0
            let i = 0
            while (i < n || carry) {
                const xi = i < x.length ? x[i] : 0
                const yi = i < y.length ? y[i] : 0
                const zi = carry + xi + yi
                z.push(zi % base)
                carry = Math.floor(zi / base)
                i += 1
            }
            return z
        }

        const multiplyByNumber = (numIn, x, base) => {
            let num = numIn
            if (num < 0) return null
            if (num === 0) return []
            let result = []
            let power = x
            while (true) { // eslint-disable-line no-constant-condition
                if (num & 1) { // eslint-disable-line no-bitwise
                    result = add(result, power, base)
                }
                num = num >> 1; // eslint-disable-line operator-assignment, no-bitwise
                if (num === 0) break
                power = add(power, power, base)
            }
            return result
        }

        const convertBase = (str, fromBase, toBase) => {
            const digits = parseToDigitsArray(str, fromBase)
            if (digits === null) return null
            let outArray = []
            let power = [1]
            for (let i = 0; i < digits.length; i += 1) {
                if (digits[i]) {
                    outArray = add(outArray,
                        multiplyByNumber(digits[i], power, toBase), toBase)
                }
                power = multiplyByNumber(fromBase, power, toBase)
            }
            let out = ''
            for (let i = outArray.length - 1; i >= 0; i -= 1) {
                out += outArray[i].toString(toBase)
            }
            if (out === '') out = 0
            return out
        }

        const decToHex = (dec, lengthIn) => {
            let length = lengthIn
            if (!length) length = 32
            if (dec < 0) {
                // return convertBase((Math.pow(2, length) + decStr).toString(), 10, 16)
                return (new BigNumber(2)).pow(length).add(new BigNumber(dec)).toString(16)
            }
            let result = null
            try {
                result = convertBase(dec.toString(), 10, 16)
            } catch (err) {
                result = null
            }
            if (result) {
                return result
            }
            return (new BigNumber(dec)).toString(16)
        }

        const pack = (dataIn, lengths) => {
            let packed = ''
            const data = dataIn.map(x => x)
            for (let i = 0; i < lengths.length; i += 1) {
                if (typeof (data[i]) === 'string' && data[i].substring(0, 2) === '0x') {
                    if (data[i].substring(0, 2) === '0x') data[i] = data[i].substring(2)
                    packed += zeroPad(data[i], lengths[i] / 4)
                } else if (typeof (data[i]) !== 'number' && !(data[i] instanceof BigNumber) && /[a-f]/.test(data[i])) {
                    if (data[i].substring(0, 2) === '0x') data[i] = data[i].substring(2)
                    packed += zeroPad(data[i], lengths[i] / 4)
                } else {
                    // packed += zeroPad(new BigNumber(data[i]).toString(16), lengths[i]/4)
                    packed += zeroPad(decToHex(data[i], lengths[i]), lengths[i] / 4)
                }
            }
            return packed
        }

        const unpacked = [
            etherDeltaAddress,
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            expires,
            orderNonce,
        ]

        const condensed = pack(
            unpacked,
            [160, 160, 256, 160, 256, 256, 256])
        return sha256(new Buffer(condensed, 'hex'))
    }

    toEth = (wei, decimals) => new BigNumber(String(wei))
        .div(new BigNumber(10 ** decimals))
    toWei = (eth, decimals) => new BigNumber(String(eth))
        .times(new BigNumber(10 ** decimals)).dp(0, BigNumber.ROUND_FLOOR)
}

export default new OrderFactory(EtherDeltaWeb3.getWeb3()) // no no no