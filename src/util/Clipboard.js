/*
http://www.jomendez.com/2017/01/25/copy-clipboard-using-javascript/
 */

export function copyToClipboard(text, event) {
    if (event) {
        event.preventDefault()
    }

    if (window.clipboardData && window.clipboardData.setData) {
        return window.clipboardData.setData("Text", text)
    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        let textarea = document.createElement("textarea")
        textarea.textContent = text
        textarea.style.position = "fixed"
        document.body.appendChild(textarea)
        textarea.select()

        try {
            return document.execCommand("copy")
        } finally {
            document.body.removeChild(textarea)
        }
    }
}