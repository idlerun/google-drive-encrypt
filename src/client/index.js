require('./css/app.sass');

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import params from './components/params';

import {CLIENT_ID} from './components/constants';

import Open from './open';
import New from './new';
import Faq from './faq';
import Usage from './usage';

function getScopes() {
  var scopes = ['https://www.googleapis.com/auth/drive'];
  if(!chrome || !chrome.app.isInstalled) {
    scopes.push('https://www.googleapis.com/auth/drive.install');
  }
  return scopes.join(' ');
}

var Main = React.createClass({
  getInitialState() {
    return {
        page: undefined,
        auth: undefined
    };
  },

  componentWillMount() {
    $(window).load(this.init);
    window.addEventListener('hashchange', this.hashChanged, false);
    this.hashChanged();
  },


  hashChanged() {
    var page = undefined;
    const hash = window.location.hash;
    if (hash == '#faq') {
      page = 'faq';
    } else if (hash == '#usage') {
      page = 'usage';
    }
    this.setState({page});
  },


  authorize(immediate, cb) {
    console.log("Auth with immediate=",immediate);
    return gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': getScopes(),
        'immediate': immediate,
        'response_type':'token'}, cb)
  },

  init() {
    gapi.client.init({
      'clientId': CLIENT_ID,
      'scope': getScopes()
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

    // lamest page routing in the world
    var content;
    if (this.state.page == 'faq') {
      content = <Faq/>
    } else if (this.state.page == 'usage') {
      content = <Usage/>
    } else {
      if (this.state.auth == undefined) {
        // wait until auth state is loaded
        content = (<span>Loading...</span>);
      } else {
        if (this.state.auth) {
          if (params.action == 'open') {
            content = (<Open/>);
          } else if (params.action == 'create') {
            content = (<New/>);
          } else {
            content = (
              <div>
                <h2>Ready for Encryption!</h2>
                <a className="toDrive" href="https://drive.google.com">
                  <img src="drive_logo.png"/>
                  <p>
                    Head over to your Google Drive to get started
                  </p>
                </a>
                <div className="usageFaqBlock">
                  <a href='#usage'>Usage Guide</a>
                  <a href='#faq'>Frequently Asked Questions</a>
                </div>
              </div>
            )
          }
        } else {
          content = (
            <div>
              <h2>Authentication Required</h2>
              <p>Your authentication with Google Drive is required: <button onClick={this.startAuth}>Authenticate</button></p>
              <ul>
                <li><a href='#usage'>Usage Guide</a></li>
                <li><a href='#faq'>Frequently Asked Questions</a></li>
              </ul>
            </div>
          )
        }
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
        <div onClick={()=>{window.location="https://drive-encrypt.com"}} id='heading'>
          <img src="icon.png"/>
          <div>
            <h1>Drive Encryption</h1>
            <p>Store encrypted files in your Google Drive™</p>
          </div>
        </div>

        <div id='content'>
          {content}
        </div>
      </div>

    )
  }
});

ReactDOM.render( <Main />, document.querySelector('#root') );
