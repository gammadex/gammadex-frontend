import React from "react"
import PasswordSection from "./PasswordSection"
import Conditional from "../../../CustomComponents/Conditional"

export default class PrivateKey extends React.Component {
    render() {
        const {
            useEncryption,
            password,
            confirmPassword,
            passwordError,
            confirmPasswordError,
            onPasswordChange,
            onConfirmPasswordChange,
            onUseEncryptionChange
        } = this.props

        return <div>
            <div className="form-group">
                <div className="custom-control custom-checkbox my-1 mr-sm-2">
                    <input type="checkbox"
                           className="custom-control-input"
                           id="useEncryption"
                           onChange={onUseEncryptionChange}
                           value="true"
                           checked={useEncryption}
                    />
                    <label className="custom-control-label" htmlFor="useEncryption">Use a password to encrypt the
                        private key (recommended)</label>
                </div>
            </div>

            <Conditional displayCondition={useEncryption}>
                <PasswordSection
                    password={password}
                    confirmPassword={confirmPassword}
                    passwordError={passwordError}
                    confirmPasswordError={confirmPasswordError}
                    onPasswordChange={onPasswordChange}
                    onConfirmPasswordChange={onConfirmPasswordChange}
                />
            </Conditional>
        </div>
    }
}