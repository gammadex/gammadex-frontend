import React from 'react'

import { shallow, mount } from 'enzyme'
import GasPriceChooser from '../components/GasPriceChooser'
import * as GasActions from '../actions/GasActions'
import GasPriceStore from '../stores/GasPriceStore'
import web3 from 'web3'
import BigNumber from 'bignumber.js'

function mountGasPriceChooser() {
    // workaround for "The target <target id> could not be identified in the dom, tip: check spelling"
    // https://github.com/reactstrap/reactstrap/issues/773
    const div = document.createElement('div')
    document.body.appendChild(div)
    // mount does render child components
    const wrapper = mount(<GasPriceChooser />, { attachTo: div })
    return wrapper
}
describe('GasPriceChooser', () => {
    beforeAll(() => {
        GasActions.gasPricesRetrieved(
            BigNumber(web3.utils.toWei('4', 'gwei')),
            BigNumber(web3.utils.toWei('6', 'gwei')),
            BigNumber(web3.utils.toWei('9', 'gwei')),
            BigNumber(web3.utils.toWei('12', 'gwei')),
            new Date(),
            14.5)
    })
    it('should render default (= average) gas price', () => {
        const wrapper = mountGasPriceChooser()
        expect(wrapper.text()).toEqual('Gas Price:6 Gwei')
    })
    // This test fails due to popper.js issues with the mocking framework enzyme
    // it(`should open Popover when 'gasPrice' button is clicked`, () => {
    //     const wrapper = mountGasPriceChooser()
    //     wrapper.find('button').simulate('click')
    //     expect(wrapper.state().popoverOpen).toEqual(true)
    // })
    it(`onSliderChange event handler should update current gas price to the event value`, () => {
        // due to child rendering issues between enzyme and popper.js, we can't grab the Slider component
        // and trigger the event from that
        const wrapper = mountGasPriceChooser()
        wrapper.instance().onSliderChange('8')
        expect(wrapper.text()).toEqual('Gas Price:8 Gwei')
        expect(GasPriceStore.getCurrentGasPriceWei().toString()).toEqual(web3.utils.toWei('8', 'gwei'))
    })
    it(`onUseRecommended event callback should update current gas price to the average`, () => {
        const wrapper = mountGasPriceChooser()
        wrapper.instance().onUseRecommended( { preventDefault() {} })
        expect(wrapper.text()).toEqual('Gas Price:6 Gwei')
        expect(GasPriceStore.getCurrentGasPriceWei().toString()).toEqual(web3.utils.toWei('6', 'gwei'))
    })
    it(`onUseCheapest event callback should update current gas price to the safe low value`, () => {
        const wrapper = mountGasPriceChooser()
        wrapper.instance().onUseCheapest( { preventDefault() {} })
        expect(wrapper.text()).toEqual('Gas Price:4 Gwei')
        expect(GasPriceStore.getCurrentGasPriceWei().toString()).toEqual(web3.utils.toWei('4', 'gwei'))
    })       
    it(`onUseExpensive event callback should update current gas price to the fastest value`, () => {
        const wrapper = mountGasPriceChooser()
        wrapper.instance().onUseExpensive( { preventDefault() {} })
        expect(wrapper.text()).toEqual('Gas Price:12 Gwei')
        expect(GasPriceStore.getCurrentGasPriceWei().toString()).toEqual(web3.utils.toWei('12', 'gwei'))
    })         
})