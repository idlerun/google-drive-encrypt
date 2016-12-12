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

  init() {
    gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
      }, this.handleAuthResult);
  },

  handleAuthResult(authResult) {
    var authorizeDiv = document.getElementById('authorize-div');
    if (authResult && !authResult.error) {
      gapi.client.load('drive', 'v3', () => {this.setState({auth:authResult})});
    } else {
      this.setState({auth:false});
    }
  },


  startAuth() {
    gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': false
      }, this.handleAuthResult);
  },


  render() {
    console.log("state",this.state);
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

    var installMsg = this.state.auth ?
        (<p>You have Google Drive Encryption installed correctly.</p>) :
        (<p>Install Google Drive Encryption into your Google Drive by clicking
           <button onClick={this.startAuth}>Install</button>
         </p>);

    return (
      <div>
        <h1>Google Drive Encryption</h1>

        <div>
          <h2>What is this app?</h2>
          <p>
            This app provides bank-grade AES256 encryption of individual files in your Google Drive. The names of uploaded files are also encrypted to ensure full privacy of data.
          </p>
          <p>
            All encryption and decryption happens on your own computer (in this browser) before any data gets transferred to Google.
          </p>
          <p>
            No data is sent to our servers. In fact, this site has no server-side component. Everything is running as local code that is already loaded in your browser. Web savvy users can check the Networking tab in debugging tools to verify this.
          </p>
        </div>

        <div>
          <h2>Usage</h2>
          {installMsg}

          <div>
            <h3>Start a new upload</h3>
            <p>
              Start an Encrypted Upload from Google Drive by locating Google Drive Encryption in the "New" Menu
            </p>
            <img style={{width:'400px'}} src="example-create.png"/>
          </div>

          <div>
            <h3>Upload an encrypted file</h3>
            <p>
              Enter an encryption password on the Google Drive Encryption page which opens. Once a password is entered, you will be able to drag and drop (or click to select) files to upload to Google Drive.
            </p>
            <p>[[TODO add screen shot]]</p>
          </div>

          <div>
            <h3>Open an encrypted file</h3>
            <p>
              Locate the .enc file which you would like to open. Right click on the file and choose "Open with Google Drive Encryption"
            </p>
            <img style={{width:'500px'}} src="example-open.png"/>
          </div>

          <div>
            <h3>Download and decrypt</h3>
            <p>
              Enter the correct password for the file and a download link with the correct filename will appear. Click to download the originally uploaded file.
            </p>
            <p>[[TODO add screen shot]]</p>
          </div>
        </div>
        
      </div>
    )
  }
});

ReactDOM.render( <Main />, document.querySelector('#root') );
