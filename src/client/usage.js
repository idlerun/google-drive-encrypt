import React from 'react';

module.exports = React.createClass({
  render() {
    return (
      <div className="usage">
        <h2>Usage</h2>

        <div>
          <h3>Upload an Encrypted File</h3>

          <div className="details">
            <ul>
              <li>Visit <a href="https://drive.google.com">drive.google.com</a> and open the folder to which you want to upload</li>
              <li>Under the "New" menu, choose "More" then "Secure File Encryption"</li>
            </ul>
            <img src="usage/drive-new.png"/>
          </div>

          <div className="details">
            <ul>
              <li>Enter a password for the encrypted uploads in the Password field</li>
              <li>Drag and drop (or click to select) one or more files to upload</li>
            </ul>
            <img src="usage/encr-new.png"/>
          </div>
        </div>

        <div>
          <h3>Download an Encrypted File</h3>

          <div className="details">
            <ul>
              <li>In Google Drive, select the '.enc' extension file(s) you would like to access</li>
              <li>Right click and choose "Open with" then "Secure File Encryption"</li>
            </ul>
            <img src="usage/drive-open.png"/>
          </div>

          <div className="details">
            <ul>
              <li>Enter the password which was used to encrypt the files during upload</li>
              <li>When the correct password is entered, a download link will appear</li>
              <li>Download any decrypted files you would like</li>
            </ul>
            <img src="usage/encr-open-ok.png"/>
          </div>
          
        </div>
      </div>
    )
  }
});


