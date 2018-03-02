import React from "react"

export default class FileChooser extends React.Component {
    render() {
        const {fileName, fileParseError, onKeyStoreFileChange} = this.props

        const fileNameDescription = fileName ? fileName : "Select key store file"
        const fileErrorClass = fileParseError ? "form-control is-invalid" : ""

        return <div className="form-group">
            <div className="custom-file ">
                <input type="file"
                       id="keystore"
                       className="custom-file-input"
                       onChange={onKeyStoreFileChange}/>

                <label htmlFor="keystore" className={"custom-file-label " + fileErrorClass}>{fileNameDescription}</label>
            </div>
        </div>
    }
}
