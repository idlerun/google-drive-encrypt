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
    if (this.state.auth == undefined) {
      // checking initial auth state
      return (<div></div>)
    }
    if (this.state.auth) {
      if (params.action == 'open') {
        return <Open/>
      } else if (params.action == 'create') {
        return <New/>
      } else {
        return (
          <div>
            You have Google Drive Encryption installed correctly.
            This app integrates into Google Drive in the "Open With" and "New" menus.
          </div>
        )
      }
    } else {
      return (
        <div>
          <button onClick={this.startAuth}>Install Application</button>
        </div>
      )
    }
  }
});

ReactDOM.render( <Main />, document.querySelector('#root') );
