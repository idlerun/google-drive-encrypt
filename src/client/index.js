require('!style-loader!css-loader!sass-loader!./css/app.sass');

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import params from './params';

import {CLIENT_ID} from './constants'
const SCOPES = ['https://www.googleapis.com/auth/drive',
              'https://www.googleapis.com/auth/drive.install'];

import Open from './open';
import New from './new';


var Main = React.createClass({
  getInitialState() {
    return { auth: undefined }
  },

  componentWillMount() {
    $(window).load(this.init);
  },


  authorize(immediate, cb) {
    console.log("Auth with immediate=",immediate);
    return gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': immediate,
        'response_type':'token'}, cb)
  },

  init() {
    gapi.client.init({
      'clientId': CLIENT_ID,
      'scope': SCOPES.join(' ')
    }).then(() => {
      this.authorize(true, this.handleAuthResult);
    });
  },

  handleAuthResult(authResult) {
    console.log("handleAuthResult", authResult);
    var authorizeDiv = document.getElementById('authorize-div');
    if (authResult && !authResult.error) {
      gapi.client.load('drive', 'v3', () => {this.setState({auth:authResult})});
    } else {
      this.setState({auth:false});
    }
  },


  startAuth() {
    this.authorize(false).then(this.handleAuthResult);
  },


  render() {
    if (this.state.auth == undefined) {
      // checking initial auth state
      return (<div></div>)
    }
    if (this.state.auth) {
      if (params.action == 'open') {
        return <Open/>
      } else if (params.action == 'create') {
        return <New/>
      }
    }

    /*
        <div style={{display: chrome.app.isInstalled ? 'none' : 'block'}}>
          <button onClick={chrome.webstore.install}>Add to Chrome</button>
        </div>

        <div style={{display: chrome.app.isInstalled ? 'block' : 'none'}}>
          Chrome App is installed!
        </div>
    */

    return (
      <div>
        <h1>Drive Encryption</h1>

        <p>Store encrypted files in your Google Drive</p>

        <div style={{display: this.state.auth ? 'block' : 'none'}}>
          Google Drive connection is authorized. Please see usage instructions below.
        </div>

        <div style={{display: this.state.auth ? 'none' : 'block'}}>
          <button onClick={this.startAuth}>Click to allow connection to your Google Drive</button>
        </div>


        <div>
          <h2>Usage</h2>

          <div>
            <h3>Upload an Encrypted File</h3>
            <ul>
              <li>Open the Google Drive folder to which you would like to upload</li>
              <li>Under the "New" menu, choose "More" then "Drive Encryption"</li>
              <li>Enter a password for the encrypted uploads in the Password field</li>
              <li>Drag and drop (or click to select) or or more files to upload</li>
              <li>Return to Google Drive and verify that the encrypted files are saved as expected</li>
            </ul>
          </div>

          <div>
            <h3>Download an Encrypted File</h3>
            <ul>
              <li>In Google Drive, select the '.enc' extension files you would like to access</li>
              <li>Right click and choose "Open with" then "Drive Encryption"</li>
              <li>Enter the password which was used to encrypt the files during upload</li>
              <li>When the correct password is entered, a download link will appear</li>
              <li>Download any decrypted files you would like</li>
            </ul>
          </div>
        </div>


        <div>
          <h2>FAQ</h2>

          <div>
            <h3>What does this app do?</h3>
            <p>
              This app provides bank-grade AES256 encryption of individual files in your Google Drive. The names of uploaded files are also encrypted to ensure full privacy of data.
            </p>
          </div>

          <div>
            <h3>Who can see my data?</h3>  
            <p>
              Nobody. All encryption and decryption happens on your own computer (in this browser) before any data gets transferred to Google.
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
      </div>
    )
  }
});

ReactDOM.render( <Main />, document.querySelector('#root') );
