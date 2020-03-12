require('./css/app.sass');

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import params from './components/params';
import Crypto from './components/crypto';

//window.Crypto = Crypto;
//window.CryptoJS = require("crypto-js");

import {CLIENT_ID} from './components/constants';

import Open from './open';
import New from './new';
import Faq from './faq';
import Tos from './tos';
import Usage from './usage';
import Why from './why';

function getScopes() {
  var scopes = ['https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.install'];
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
    $(window).on('load', () => {
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
                <a className="toDriveReady" href="https://drive.google.com">
                  <div className="driveLink">
                    <span>
                      Click here to visit your 
                    </span>
                    <img src="drive_logo.png"/>
                  </div>
                  <div className="miniUsage">
                    <h4>To create a file:</h4>
                    <img style={{width: "300px"}} src="usage/drive-new-mini.png"/>
                    <h4>To open a file:</h4>
                    <img style={{width: "350px"}} src="usage/drive-open-mini.png"/>
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

          //<img src="drive_logo.png"/>
          content = (
            <div className="authPage">
              <div>
                <h3>Welcome!</h3>
                <p>
                  Upload a file to Google Drive; it will be encrypted before it leaves your computer!
                </p>
                <a href="flow.png"><img src="flow.png"/></a>
              </div>

              <a href="#" onClick={this.startAuth} className="toDrive">
                <span>Click here to get started!</span>
                <img src="drive_icon.png"/>
              </a>
              <h3 style={{marginTop: "30px"}}>More info:</h3>
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
