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
          <h3>What browsers are supported?</h3>
          <p>
            Currently only Google Chrome is known to work well for the streaming download.
            We are using some complex browser support for the direct-to-browser streaming decryption download which makes browser support non-trivial.
            It may be possible to add support for additional browsers in the future.
          </p>
        </div>
        
        <div>
          <h3>What happens to my data if the service goes away some day?</h3>
          <p>
            Offline decryption code and instructions are available on github:<br/><a href="https://github.com/idlerun/offline-decrypt">https://github.com/idlerun/offline-decrypt</a>
          </p>
        </div>

        <div>
          <h3>How do I know you aren't saving a copy of my files?</h3>
          <p>
            No data is sent to our servers at all. In fact, this site doesn't even have backend code.
          </p>
          <p>Web savvy users can check the Networking tab in debugging tools to verify what data is leaving the browser</p>
          <p>
            Also feel free to inspect the source code:<br/>
            <a href="https://github.com/idlerun/google-drive-encrypt">
            https://github.com/idlerun/google-drive-encrypt</a>
          </p>
        </div>

        <div>
          <h3>I'm encryption savvy, what are you really doing?</h3>
          <ul>
            <li>A 256 bit random salt is generated for each file</li>
            <li>Your password is hashed with the salt using a PBKDF2 2000 iteration hash to generate a 256 bit encryption key</li>
            <li>The encryption key is hashed with SHA256 to allow verification of the correct key before download</li>
            <li>The original filename is encrypted with AES256-OFB-PKCS7 to allow download with the same name</li>
            <li>Each file is encrypted with AES256-OFB-NoPadding during multi-part upload by JavaScript (in browser)</li>
            <li>The salt, hash of the key, number of iterations, and encrypted filename are included on the uploaded file as metadata</li>
          </ul>
        </div>
      
      </div>
    )
  }
});
