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