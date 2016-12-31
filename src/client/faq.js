import React from 'react';

module.exports = React.createClass({
  render() {
    return (
      <div className="faq">
        <h2>FAQ</h2>

        <div>
          <h3>What does this app do?</h3>
          <p>
            This app provides bank-grade AES256 encryption of individual files in your Google Drive. The names of uploaded files can also be encrypted to ensure full privacy of data.
          </p>
        </div>

        <div>
          <h3>Who can see my data?</h3>  
          <p>
            Nobody! All encryption and decryption happens on your own computer (in this browser) before any data gets transferred to Google.
          </p>
        </div>

        <div>
          <h3>How does it work?</h3>
          <p>
            This app uses cutting edge browser support from Google Chrome to encrypt your files on the fly as they are uploaded to Google Drive and decrypt them during download.
          </p>
        </div>

        <div>
          <h3>How do I know you aren't saving a copy of my files?</h3>
          <p>
            No data is sent to our servers at all. In fact, this site doesn't even have backend code.
          </p>
          <p>Web savvy users can check the Networking tab in debugging tools to verify what data is leaving the browser</p>
        </div>

        <div>
          <h3>I'm encryption savvy, what are you really doing?</h3>
          <ul>
            <li>A 256 bit random salt is generated for each file</li>
            <li>Your password is hashed with the salt using a PBKDF2 128 iteration hash to generate a 256 bit encryption key</li>
            <li>The encryption key is hashed with SHA256 to allow verification of the correct key before download</li>
            <li>The original filename is encrypted with AES256-OFB-PKCS7 to allow download with the same name</li>
            <li>Each file is encrypted with AES256-OFB-NoPadding during multi-part upload by JavaScript (in browser)</li>
            <li>The salt, hash of the key, and encrypted filename are included on the uploaded file as metadata</li>
          </ul>
          <p>
            With the information here, a particularly savvy user could download their own .enc file and decrypt it themselves (but would still need the password).
          </p>
        </div>
      </div>
    )
  }
});
