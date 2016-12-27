import React from 'react';

module.exports = React.createClass({
  render() {
    return (
      <div className="usage">
        <h2>Why do I want this?</h2>

        <div>
          <h3>Why Google Drive?</h3>
          <p>
            Google Drive is an incredibly useful service which lets you access your files anywhere.
            It provides far more safety for your data than any other backup solution you could use,
            such as an external hard drive.
          </p>
          <p>
            Just imagine how much you would lose if your house burned down!
          </p>
          <p>
            For more information, see <a href="https://support.google.com/drive/answer/2424384?hl=en">Getting Started with Google Drive</a>
          </p>
        </div>
        <div>
          <h3>Why encrypt?</h3>
          <p>
            Some files are too private to upload to the internet, such as sensitive tax information or private
            photos. We still want a secure copy of these files, but without the risk of someone grabbing them from a logged-in computer.
          </p>
          <p>
            Encryption is a technique of protecting your files to prevent anyone from seeing the contents without providing the password.
            Storing encrypted files in your Google Drive provides all of the benefits of online storage (access anywhere, loss protection, etc.)
            without the potential risk.
          </p>
        </div>
        <div>
          <h3>What is Secure File Encryption?</h3>
          <p>
            Secure File Encryption is an add-on for Google Drive which allows you to easily encrypt your files before uploading them to Google Drive
          </p>
          <p>
            You will need to enter a password during upload and the same password any time you want to access those files.
          </p>
          <p>
            All of the encryption and decryption is run on your own browser, so none of your sensitive information ever leaves your computer even temporarily.
          </p>
        </div>
        <div>
          <h3>How do I get started?</h3>
          <p style={{display:this.props.auth ? 'none':'block'}}>
            Visit the <a href="#">Home Page</a> and click on the 'authenticate with your Google Drive' button to connect the add-on with your Google Drive.
          </p>
          <p>
            Follow the <a href="#usage">Usage Guide</a> to get started uploading files to your Google Drive.
          </p>
        </div>
      </div>
    )
  }
});


