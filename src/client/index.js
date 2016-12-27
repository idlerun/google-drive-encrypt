require('./css/app.sass');

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import params from './components/params';
import Crypto from './components/crypto';
window.Crypto = Crypto;

import {CLIENT_ID} from './components/constants';

import Open from './open';
import New from './new';
import Faq from './faq';
import Tos from './tos';
import Usage from './usage';
import Why from './why';

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
    window.addEventListener('hashchange', this.hashChanged, false);
    this.hashChanged();
    $(window).load(() => {
      gapi.client.init({
        'clientId': CLIENT_ID,
        'scope': getScopes()
      }).then(() => {
        this.authorize(true);
      });
    });
  },


  hashChanged() {
    var page = undefined;
    if (!params.action) {
      const hash = location.hash;
      if (hash == '#faq') {
        page = 'faq';
      } else if (hash == '#tos') {
        page = 'tos';
      } else if (hash == '#usage') {
        page = 'usage';
      } else if (hash == '#why') {
        page = 'why';
      }
    }
    this.setState({page});
  },


  authorize(immediate) {
    //console.log("Auth with immediate=",immediate);
    return gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': getScopes(),
        'immediate': immediate,
        'response_type':'token'},
        this.handleAuthResult)
  },


  handleAuthResult(authResult) {
    //console.log("handleAuthResult", authResult);
    var authorizeDiv = document.getElementById('authorize-div');
    if (authResult && !authResult.error) {
      gapi.client.load('drive', 'v3', () => {
        this.setState({auth:authResult});
      });
    } else {
      this.setState({auth:false});
    }
  },


  recordPage(page) {
    if (this.state.recordedPage != page) {
      ga('send', 'pageview', page);
      setTimeout(() => {
        this.setState({recordedPage:page});
      }, 0);
    }
  },


  startAuth() {
    this.authorize(false).then(this.handleAuthResult);
  },


  render() {
    // lamest page routing in the world
    var content;
    if (this.state.page == 'faq') {
      this.recordPage('faq');
      content = <Faq/>
    } else if (this.state.page == 'usage') {
      this.recordPage('usage');
      content = <Usage/>
    } else if (this.state.page == 'tos') {
      this.recordPage('tos');
      content = <Tos/>
    } else if (this.state.page == 'why') {
      this.recordPage('why');
      content = <Why auth={this.state.auth}/>
    } else {
      if (this.state.auth == undefined) {
        // wait until auth state is loaded
        content = (<span>Loading...</span>);
      } else {
        if (this.state.auth) {
          if (params.action == 'open') {
            this.recordPage('open');
            content = (<Open/>);
          } else if (params.action == 'create') {
            this.recordPage('create');
            content = (<New/>);
          } else {
            this.recordPage('ready');
            content = (
              <div>
                <h2>Ready for Encryption!</h2>
                <a className="toDrive" href="https://drive.google.com">
                  <img src="drive_logo.png"/>
                  <p>
                    Head over to your Google Drive to get started
                  </p>
                  <div className="miniUsage">
                    <img style={{width:"200px"}} src="usage/drive-new-mini.png"/>
                    <img style={{margin: "20px 20px 0 0",display:"inline-block",width:"250px"}} src="usage/drive-open-mini.png"/>
                  </div>
                </a>
                <div className="usageFaqBlock">
                  <a href='#why'>Why do I want this?</a>
                  <a href='#usage'>Usage Guide</a>
                  <a href='#faq'>Frequently Asked Questions</a>
                </div>
              </div>
            )
          }
        } else {
          this.recordPage('auth');
          content = (
            <div>
              <h2>Authentication Required</h2>

              <a href="#" onClick={this.startAuth} className="toDrive">
                <img src="drive_logo.png"/>
                <p>
                  Click here to authenticate with your Google Drive
                </p>
              </a>
              <div className="usageFaqBlock">
                <a href='#why'>Why do I want this?</a>
                <a href='#usage'>Usage Guide</a>
                <a href='#faq'>Frequently Asked Questions</a>
              </div>
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
        <a href='/#' id='heading'>
          <img src="icon.png"/>
          <div>
            <h1>Secure File Encryption</h1>
            <p>Safely store private encrypted files in your Google Drive™</p>
          </div>
        </a>

        <div id='content'>
          {content}
        </div>
      </div>

    )
  }
});

ReactDOM.render( <Main />, document.querySelector('#root') );
