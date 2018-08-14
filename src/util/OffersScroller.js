export function scrollOffersToBottom() {
    const offersDiv = document.getElementById("orders-div-offer")

    if (offersDiv) {
        offersDiv.parentNode.scrollTop = offersDiv.parentNode.scrollHeight

        return true
    }

    return false
}