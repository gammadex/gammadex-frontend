import React from "react"
import PasswordSection from "./PasswordSection"
import Conditional from "../../../CustomComponents/Conditional"

export default class PrivateKey extends React.Component {
    render() {
        const {
            privateKeyAddress,
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

            <Conditional displayCondition={useEncryption}>
                <PasswordSection
                    privateKeyAddress={privateKeyAddress}
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