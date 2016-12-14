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
      </div>
    )
  }
});
