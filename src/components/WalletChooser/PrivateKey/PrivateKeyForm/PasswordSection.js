import React from "react"

export default class PrivateKey extends React.Component {
    render() {
        const {
            privateKeyAddress,
            password,
            confirmPassword,
            passwordError,
            confirmPasswordError,
            onPasswordChange,
            onConfirmPasswordChange
        } = this.props

        let passwordErrorClass = ""
        if (password.length > 0) {
            passwordErrorClass = passwordError ? " is-invalid" : " is-valid"
        }

        let confirmPasswordErrorClass = ""
        if (confirmPassword.length > 0) {
            confirmPasswordErrorClass = confirmPasswordError ? " is-invalid" : " is-valid"
        }

        return <div>

            <div className="form-group">
                <input type="text"
                       name="username"
                       hidden={true}
                       value={privateKeyAddress ? privateKeyAddress : ""}/>
            </div>

            <div className="form-group">
                <input type="password"
                       name="password"
                       placeholder="Choose password"
                       className={"form-control " + passwordErrorClass}
                       value={password}
                       onChange={onPasswordChange}/>
            </div>

            <div className="form-group">
                <input type="password"
                       name="confirmPassword"
                       placeholder="Confirm password"
                       className={"form-control " + confirmPasswordErrorClass}
                       value={confirmPassword}
                       onChange={onConfirmPasswordChange}/>
            </div>

            <div className="form-group">
                <div>
                    <small>Password must be at least 8 characters long</small>
                </div>
            </div>
        </div>
    }
}