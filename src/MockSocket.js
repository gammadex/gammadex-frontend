import OrderFactory from "./OrderFactory"
import Config from './Config'
import EtherDeltaWeb3 from "./EtherDeltaWeb3"
import * as MockOrderUtil from "./MockOrderUtil"
import BigNumber from 'bignumber.js'
import OrderSide from "./OrderSide"

// this is hacky as hell, but useful as we'll need some of this logic in the backend!
class MockSocket {
    init(handlers) {
        this.handlers = handlers

        this.saveMarketToLocalStorage = this.saveMarketToLocalStorage.bind(this)
        this.updateOrder = this.updateOrder.bind(this)
        this.timerFired = this.timerFired.bind(this)
        setInterval(() => {
            this.timerFired()
        }, 15000)

        if (!localStorage.mockMarket) {
            this.mockMarket = this.generateMockMarket()
            this.saveMarketToLocalStorage()
        } else {
            this.mockMarket = JSON.parse(localStorage.mockMarket)
        }
        this.emitMarket()
    }

    saveMarketToLocalStorage() {
        localStorage.mockMarket = JSON.stringify(this.mockMarket)
    }

    emitMarket() {
        const marketMessage = {
            orders: {
                buys: this.mockMarket.orders.buys.map(o => { return MockOrderUtil.orderDetailToSocketOrder(o) }),
                sells: this.mockMarket.orders.sells.map(o => { return MockOrderUtil.orderDetailToSocketOrder(o) })
            },
            trades: this.generateTrades() // TODO add these to local storage
        }
        this.handlers.market(marketMessage)
    }

    timerFired() {
        EtherDeltaWeb3.promiseCurrentBlockNumber()
            .then(blockNumber => {
                this.mockMarket.orders.buys.forEach(o => {
                    this.updateOrder(o, blockNumber)
                })
                this.mockMarket.orders.sells.forEach(o => {
                    this.updateOrder(o, blockNumber)
                })
            })
    }

    updateOrder(orderDetail, blockNumber) {
        EtherDeltaWeb3.promiseAvailableVolume(orderDetail.order)
            .then(availableVolume => {
                const bigAvailableVolume = BigNumber(availableVolume)
                let orderUpdated = false
                if(blockNumber >= orderDetail.order.expires) {
                    orderDetail.deleted = true
                    orderUpdated = true
                }
                if(!(bigAvailableVolume.isEqualTo(BigNumber(orderDetail.contractAvailableVolume)))) {
                    orderDetail.contractAvailableVolume = bigAvailableVolume
                    orderUpdated = true
                }

                if(BigNumber(orderDetail.contractAvailableVolume).isZero() && !orderDetail.deleted) {
                    orderDetail.deleted = true
                    orderUpdated = true
                }
                
                if(orderUpdated) {
                    this.saveMarketToLocalStorage()
                    // const ordersMessage = {
                    //     buys: [
                    //         MockOrderUtil.orderDetailToSocketOrder(orderDetail)
                    //     ],
                    //     sells: []
                    // }
                    // this.handlers.orders(ordersMessage)
                    // TODO OrderMerger.mergeOrders does not seem to update the book correctly
                    this.emitMarket()
                }
            })
    }

    purge() {
        localStorage.removeItem("mockMarket")
    }

    generateMockMarket() {
        const makerAddress = "0xed230018BF455D72D8b6D416FE2e1b1D8d5D9376"
        const makerPrivateKey = "222941a07030ef2477b547da97259a33f4e3a6febeb081da8210cffc86dd138f"
        const tstDecimals = Config.getTokenDecimals('TST')
        const tstDivisor = Math.pow(10, tstDecimals)
        const buyOrder1 = MockOrderUtil.orderDetailFromOrder(OrderFactory.createOrder(OrderSide.BUY, 10000000, 0.004, 0.08, Config.getTokenAddress('TST'), tstDecimals, makerAddress, makerPrivateKey))
        const buyOrder2 = MockOrderUtil.orderDetailFromOrder(OrderFactory.createOrder(OrderSide.BUY, 10000000, 0.0041, 0.31, Config.getTokenAddress('TST'), tstDecimals, makerAddress, makerPrivateKey))
        const buyOrder3 = MockOrderUtil.orderDetailFromOrder(OrderFactory.createOrder(OrderSide.BUY, 10000000, 0.0038, 20, Config.getTokenAddress('TST'), tstDecimals, makerAddress, makerPrivateKey))
        const sellOrder1 = MockOrderUtil.orderDetailFromOrder(OrderFactory.createOrder(OrderSide.SELL, 10000000, 0.0064, 0.11, Config.getTokenAddress('TST'), tstDecimals, makerAddress, makerPrivateKey))
        const sellOrder2 = MockOrderUtil.orderDetailFromOrder(OrderFactory.createOrder(OrderSide.SELL, 10000000, 0.0061, 0.75, Config.getTokenAddress('TST'), tstDecimals, makerAddress, makerPrivateKey))
        const sellOrder3 = MockOrderUtil.orderDetailFromOrder(OrderFactory.createOrder(OrderSide.SELL, 10000000, 0.71, 100.4, Config.getTokenAddress('TST'), tstDecimals, makerAddress, makerPrivateKey))

        return {
            orders: {
                buys: [buyOrder1, buyOrder2, buyOrder3],
                sells: [sellOrder1, sellOrder2, sellOrder3]
            }
        }
    }

    generateTrades() {
        return [
            {
                amount: "0.05",
                amountBase: "0.00031999999999999997",
                buyer: "0xed230018bf455d72d8b6d416fe2e1b1d8d5d9376",
                date: "2018-03-09T17:56:27.799Z",
                price: "0.0063999999999999994",
                seller: "0xed230018bf455d72d8b6d416fe2e1b1d8d5d9376",
                side: "buy",
                tokenAddr: "0x722dd3f80bac40c951b51bdd28dd19d435762180",
                txHash: "0xd556ebbc3b3989a9e427f508a7b4f1c4b01c9fa81ca56211e9cdaf5e0ffed784"
            },
            {
                amount: "0.01",
                amountBase: "0.00004",
                buyer: "0xed230018bf455d72d8b6d416fe2e1b1d8d5d9376",
                date: "2018-03-09T18:02:07.127Z",
                price: "0.004",
                seller: "0xed230018bf455d72d8b6d416fe2e1b1d8d5d9376",
                side: "sell",
                tokenAddr: "0x722dd3f80bac40c951b51bdd28dd19d435762180",
                txHash: "0x193e12edfc2169f6706c8e22139f9902a9b95ef62c3dfd6155930baeccef28c1"
            }
        ]
    }

}

export default new MockSocket()