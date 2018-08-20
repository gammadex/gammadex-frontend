
export function getTokenFromUrl() {
    const match = /.*#!\/exchange\/([^/]+)/.exec(window.location.href)

    return match ? match[1] : null
}
