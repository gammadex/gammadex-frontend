import React from "react"
import Conditional from "../../../CustomComponents/Conditional"
import { Alert} from 'reactstrap'

export default class PasswordSection extends React.Component {
    render() {
        const { address, passwordError, rememberKeyStoreFile, onRememberChange, onPasswordChange } = this.props
        const passwordErrorClass = passwordError ? " is-invalid" : ""

        return <div>

            <div className="form-group">
                <input type="text"
                    name="username"
                    hidden={true}
                    value={address} />
            </div>

            <div className="form-group">
                <input type="password"
                    placeholder="Keystore password"
                    className={"form-control " + passwordErrorClass}
                    onChange={onPasswordChange} />
            </div>


            <Conditional displayCondition={passwordError}>
                <Alert color="danger">
                    Sorry, wrong password. Please try again.
                        </Alert>
            </Conditional>

            <div className="form-group">
                <div className="custom-control custom-checkbox my-1 mr-sm-2">
                    <input type="checkbox"
                        className="custom-control-input"
                        id="rememberKeyFile"
                        onChange={onRememberChange}
                        value="true"
                        checked={rememberKeyStoreFile} />
                    <label className="custom-control-label" htmlFor="rememberKeyFile">Remember for next visit</label>
                    <small class="form-text text-muted">
                        Your Wallet File will be stored in your browser's local storage. You will be prompted for your Keystore password each time you visit GammaDEX.
                            <br /><br />No sensitive wallet data is transmitted to or stored on GammaDEX servers, encrypted or otherwise.
                    </small>
                </div>
            </div>

            <div className="form-group">
                <input className="btn btn-primary" type="submit" value="Unlock" />
            </div>
        </div>
    }
}