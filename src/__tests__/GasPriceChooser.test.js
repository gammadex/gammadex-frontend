import React from 'react'

import { shallow, mount } from 'enzyme'
import GasPriceChooser from '../components/GasPriceChooser'
import * as GasActions from '../actions/GasActions'
import { gweiToWei } from '../EtherConversion'
import GasPriceStore from '../stores/GasPriceStore'
import web3 from 'web3'

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
            gweiToWei(40 / 10),
            gweiToWei(60 / 10),
            gweiToWei(90 / 10),
            gweiToWei(120 / 10),
            new Date(),
            14.5)
    })
    it('renders without crashing', () => {
        // shallow does not render child components
        const wrapper = shallow(
            <GasPriceChooser />
        )
        expect(wrapper).toMatchSnapshot()
    })
    it('should render default (= average) gas price', () => {
        const wrapper = mountGasPriceChooser()
        expect(wrapper.text()).toEqual('Gas Price: 6 Gwei')
    })
    it(`should open Popover when 'gasPrice' button is clicked`, () => {
        const wrapper = mountGasPriceChooser()
        wrapper.find('button').simulate('click')
        expect(wrapper.state().popoverOpen).toEqual(true)
    })
    it(`onSliderChange event handler should update current gas price to the event value`, () => {
        // due to child rendering issues between enzyme and popper.js, we can't grab the Slider component
        // and trigger the event from that
        const wrapper = mountGasPriceChooser()
        wrapper.instance().onSliderChange('8')
        expect(wrapper.text()).toEqual('Gas Price: 8 Gwei')
        expect(GasPriceStore.getCurrentGasPriceWei().toString()).toEqual(web3.utils.toWei('8', 'gwei'))
    })
    it(`onUseRecommended event callback should update current gas price to the average`, () => {
        const wrapper = mountGasPriceChooser()
        wrapper.instance().onUseRecommended()
        expect(wrapper.text()).toEqual('Gas Price: 6 Gwei')
        expect(GasPriceStore.getCurrentGasPriceWei().toString()).toEqual(web3.utils.toWei('6', 'gwei'))
    })
    it(`onUseCheapest event callback should update current gas price to the safe low value`, () => {
        const wrapper = mountGasPriceChooser()
        wrapper.instance().onUseCheapest()
        expect(wrapper.text()).toEqual('Gas Price: 4 Gwei')
        expect(GasPriceStore.getCurrentGasPriceWei().toString()).toEqual(web3.utils.toWei('4', 'gwei'))
    })       
    it(`onUseExpensive event callback should update current gas price to the fastest value`, () => {
        const wrapper = mountGasPriceChooser()
        wrapper.instance().onUseExpensive()
        expect(wrapper.text()).toEqual('Gas Price: 12 Gwei')
        expect(GasPriceStore.getCurrentGasPriceWei().toString()).toEqual(web3.utils.toWei('12', 'gwei'))
    })         
})