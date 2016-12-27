import React from 'react';
import $ from 'jquery';
import params from './components/params'
import {CLIENT_ID} from './components/constants'

const Crypto = require('./components/crypto');
const Upload = require('./components/upload');

const Dropzone = require('react-dropzone');

module.exports = React.createClass({

  getInitialState() {
    return {
      password:'',
      uploads: [],
      uploadIdx: 0,
      randomName: true
    };
  },


  upload(entry) {
    const file = entry.file;
    const salt = Crypto.random();
    const key = Crypto.secure_hash(this.state.password, salt);
    const key_hash = Crypto.hash(key);
    entry.dstName = this.state.randomName ? 
          Crypto.random().substr(48) + ".enc" :
          file.name + ".enc";
    const enc_name = Crypto.encryptStr(key, salt, file.name);
    var properties = {
      salt, key_hash, enc_name
    };

    // Split enc_name over multiply props to respect max key.length + value.length = 124
    const enc_name_parts = enc_name.match(/.{1,110}/g);
    properties['enc_name'] = enc_name_parts[0];
    for(var i=1; i<enc_name_parts.length; i++) {
      properties['enc_name(' + i + ')'] = enc_name_parts[i];
    }
    
    const metadata = { name:entry.dstName, parents: [params.folderId], properties };
    const upl = new Upload({
      token: gapi.auth.getToken().access_token,
      key, iv:salt, file, metadata,
      onComplete: this.onComplete, onError:this.onError.bind(this,entry), onProgress:this.onProgress});
    upl.upload();
  },


  onError(entry, errStr) {
    const err = JSON.parse(errStr);
    const message = err['error']['message'];
    const code = err['error']['code'];
    if (console){
      console.log("Upload error", "code=", code, "message=", message);
    }
    entry.state = "Failed (" + code + ")";
    this.state.uploads[this.state.uploadIdx].progress = undefined;
    this.state.uploadIdx = this.state.uploadIdx + 1;
    this.forceUpdate();
  },


  onDrop(acceptedFiles, rejectedFiles) {
    const pending = acceptedFiles.map(file => { return {
      file,
      state: "Pending"
    }});
    this.setState({uploads: this.state.uploads.concat(pending)});
  },


  onComplete() {
    this.state.uploads[this.state.uploadIdx].state = "Done";
    this.state.uploads[this.state.uploadIdx].progress = undefined;
    this.state.uploadIdx = this.state.uploadIdx + 1;
    this.forceUpdate();
  },


  onProgress(pct) {
    const progress = (pct*100).toFixed(1) + "%";
    if (this.state.uploads[this.state.uploadIdx].progress != progress){
      this.state.uploads[this.state.uploadIdx].progress = progress;
      this.forceUpdate();
    }
  },


  canStart() {
    return this.state.uploads.length > 0 && this.state.password.length > 0;
  },


  render() {
    //console.log(this.state);

    if (this.state.uploadIdx < this.state.uploads.length) {
      const up = this.state.uploads[this.state.uploadIdx]
      if (up.state == "Pending") {
        up.state = "Uploading";
        this.upload(up);
      }
    }

    var dropZone;
    if (this.state.password.length > 0) {
      var dzContent = (
          <div className="dz-empty">Drop files here, or click to select files to upload
          </div>
        );
      if (this.state.uploads.length > 0) {
        //console.log("length is >0");
        var rows = this.state.uploads.map((entry,index) =>
          ( <tr key={index}>
              <td>{entry.file.name}</td>
              <td>{entry.state} {entry.progress}</td>
              <td>{entry.dstName}</td>
            </tr> )
        );
        dzContent = (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th style={{minWidth:"155px"}}>Status</th>
                <th>Destination</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        )
      }

      dropZone = (
        <Dropzone className="dz" activeClassName="dz-active" 
              rejectClassName="dz-reject" onDrop={this.onDrop}>
          {dzContent}
        </Dropzone>
      );
    } else {
      dropZone = (
        <div className="dz-wait">
          <div>
            Enter a password to enable encrypted file upload
          </div>
        </div>
      )
    }

    return (
      <div>
        <h2>File Upload</h2>
        <div>
          <div className="textPrompt">
            <label>Password</label>
            <input type="password" value={this.state.password}
                onChange={event => this.setState({password:event.target.value})}/>
          </div>
          <p className="details">Password used to encrypt your files. The same password will be needed to download</p>
        </div>
        <div>
          <div className="checkboxPrompt" onClick={event => this.setState({randomName:!this.state.randomName})}>
            <input type="checkbox" checked={this.state.randomName} readOnly/>
            <label>Random filename</label>
          </div>
          <p className="details">Upload with original filename (searchable) or a random name (hidden)
          </p>
        </div>
        {dropZone}
      </div>
    );
  }
});
