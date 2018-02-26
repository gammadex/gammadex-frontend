export function removeHexPrefix(str) {
    return (str || "").replace(/^0x/, "")
}