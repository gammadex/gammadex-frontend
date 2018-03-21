import * as TimerActions from "../actions/TimerActions"

export function startTimer() {
    setInterval(() => {
        TimerActions.timerFired()
    }, 15000)
}