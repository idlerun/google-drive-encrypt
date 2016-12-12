import React from 'react';
import $ from 'jquery';
import params from './params'
import {CLIENT_ID} from './constants'

const Crypto = require('./crypto');
const Upload = require('./upload');

const Dropzone = require('react-dropzone');

module.exports = React.createClass({

  getInitialState() {
    return {
      password:'',
      uploads: [],
      uploadIdx: 0
    };
  },


  upload(entry) {
    const file = entry.file;
    const salt = Crypto.random();
    const key = Crypto.secure_hash(this.state.password, salt);
    const key_hash = Crypto.hash(key);
    const name = Crypto.random().substr(48) + ".enc";
    entry.dstName = name;
    const enc_name = Crypto.encryptStr(key, salt, file.name);
    const metadata = { name, parents: [params.folderId],
        properties: {
          salt, key_hash, enc_name
        }};
    const upl = new Upload({
      token: gapi.auth.getToken().access_token,
      key, iv:salt, file, metadata,
      onComplete: this.onComplete, onError:console.log, onProgress:this.onProgress});
    upl.upload();
    forceUpdate();
  },


  onDrop(acceptedFiles, rejectedFiles) {
    const pending = acceptedFiles.map(file => { return {file, state: "pending" }});
    this.setState({uploads: this.state.uploads.concat(pending)});
  },


  onComplete() {
    this.state.uploads[this.state.uploadIdx].state = "done";
    this.state.uploads[this.state.uploadIdx].progress = "100%";
    this.state.uploadIdx = this.state.uploadIdx + 1;
    this.forceUpdate();
  },


  onProgress(pct) {
    this.state.uploads[this.state.uploadIdx].progress = Math.round(pct*1000)/10 + "%";
    this.forceUpdate();
  },


  canStart() {
    return this.state.uploads.length > 0 && this.state.password.length > 0;
  },


  render() {
    if (this.state.uploadIdx < this.state.uploads.length) {
      const up = this.state.uploads[this.state.uploadIdx]
      if (up.state == "pending") {
        up.state = "uploading";
        this.upload(up);
      }
    }

    var rows = this.state.uploads.map((entry,index) =>
      ( <tr key={index}>
          <td>{entry.file.name}</td>
          <td>{entry.state}</td>
          <td>{entry.progress}</td>
          <td>{entry.dstName}</td>
        </tr> )
    );

    var dropZone;
    if (this.state.password.length > 0) {
      dropZone = (
        <Dropzone className="dz" activeClassName="dz-active" 
              rejectClassName="dz-reject" onDrop={this.onDrop}>
          <div>Drop files here, or click to select files to upload.</div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>State</th>
                <th>Progress</th>
                <th>Destination</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </Dropzone>
      );
    } else {
      dropZone = (
        <div>
          Enter a password to encrypted file upload
        </div>
      )
    }

    return (
      <div>
        <h1>Google Drive Encryption</h1>
        <h2>File Upload</h2>
        <div>
          <p>Enter a password to be used for encrypting your files. This same password will be needed to download your files</p>
          <label>Password: </label>
          <input type="password" value={this.state.password}
              onChange={event => this.setState({password:event.target.value})}>
          </input>
        </div>
        {dropZone}
      </div>
    );
  }
});
