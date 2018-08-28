import React from 'react'

export function clickPersonIcon() {
    return (
        <p>Click the person icon [ <i className="fas fa-user"></i> ] in the top right hand corner of the screen to open the account menu.</p>
    )
}

export function exchangePageDisplayed() {
    return (
        <p>The main GammaDEX Exchange page will now be displayed. The top right hand corner icon has now been replaced with your wallet address next to a blockie representation of this address.
                     Clicking on this will open the account menu, from which you can: 1) open your wallet address in Etherscan [ <i className="fas fa-external-link-square-alt"></i> ] 2) copy your wallet address to the clipboard [ <i className="fas fa-copy"></i> ].</p>
    )
}