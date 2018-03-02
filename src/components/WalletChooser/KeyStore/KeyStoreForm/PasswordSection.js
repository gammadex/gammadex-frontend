import React from "react"
import Empty from "../../../Empty"

export default class PasswordSection extends React.Component {
    render() {
        const {passwordError, rememberKeyStoreFile, onRememberChange, onUnlock, onPasswordChange} = this.props
        const passwordErrorClass = passwordError ? " is-invalid" : ""

        return <div>
            <div className="form-group">
                <input type="password"
                       placeholder="Keystore password"
                       className={"form-control " + passwordErrorClass}
                       onChange={onPasswordChange}/>
            </div>

            <div className="form-group">
                <div className="custom-control custom-checkbox my-1 mr-sm-2">
                    <input type="checkbox"
                           className="custom-control-input"
                           id="rememberKeyFile"
                           onChange={onRememberChange}
                           value="true"
                           checked={rememberKeyStoreFile}/>
                    <label className="custom-control-label" htmlFor="rememberKeyFile">Remember for next time.</label>
                    <small>You will be prompted for your password next time you visit</small>
                </div>
            </div>

            <div className="form-group">
                <a href="#" className="btn btn-primary"
                   onClick={onUnlock}>Unlock</a>
            </div>
        </div>
    }
}