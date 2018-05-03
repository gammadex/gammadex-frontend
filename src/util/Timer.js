class Timer {
    constructor() {
        this.timerRefs = {}
    }

    start(func, ms) {
        this.timerRefs[func] = window.setInterval(func, ms)
    }

    stop(func) {
        const ref = this.timerRefs[func]
        if (typeof ref !== 'undefined') {
            window.clearInterval(ref)
        }

        delete this.timerRefs.func
    }
}

export default new Timer()