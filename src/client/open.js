import React from 'react';
import $ from 'jquery';
import params from './components/params'
import {CLIENT_ID} from './components/constants'
import StreamSaver from './vendor/StreamSaver';

const Crypto = require('./components/crypto');

module.exports = React.createClass({

  getInitialState() {
    const items = params.ids.split(',').map(function(id){return {id}});
    return {items, password:''};
  },


  componentWillMount() {
    this.state.items.forEach(this.loadMeta);
  },


  gapiParams() {
    return {
        method: 'GET',
        headers: {
          "Authorization": "Bearer " + gapi.auth.getToken().access_token
        },
        mode: 'cors',
        cache: 'no-store'
    }
  },


  loadMeta(item) {
    fetch("https://www.googleapis.com/drive/v3/files/" + item.id + "/?fields=name,properties", this.gapiParams()).then(res => {
      return res.json()
    }).then(json => {
      item.meta = json;
      this.forceUpdate();
    });
  },


  decrypt(item) {
    fetch("https://www.googleapis.com/drive/v3/files/" + item.id + "/?alt=media", this.gapiParams()).then(res => {
      const key = this.keyFor(item);
      const name = this.decryptName(item, key);
      const fileStream = StreamSaver.createWriteStream(name)
      const decryptor = Crypto.encryptor(key, item.meta.properties.salt)
      const writer = fileStream.getWriter()
      const reader = res.body.getReader()
      const pump = () => reader.read()
        .then(({ value, done }) => {
          if (done) {
            const u8out = Crypto.finalizeU8(decryptor);
            if (u8out.length > 0) {
              return writer.write(u8out).then(() => { writer.close() });
            } else {
              return writer.close()
            }
          } else {
            // value comes in as Uint8Array
            const u8out = Crypto.processU8(decryptor, value);
            if (u8out.length > 0) {
              return writer.write(u8out).then(pump);
            } else {
              return pump();
            }
          }
        })
      // Start the reader
      pump().then(() => {
          //console.log('Closed the stream, Done writing')
      })
    });
  },


  keyFor(item) {
    const salt = item.meta.properties.salt;
    return Crypto.secure_hash(this.state.password, salt)
  },


  isCorrectKey(item, key) {
    const hash = Crypto.hash(key);
    if (item.meta.properties.key_hash) {
      return hash == item.meta.properties.key_hash;
    } else {
      return false;
    }
  },


  decryptName(item, key) {
    return Crypto.decryptStr(key, item.meta.properties.salt, item.meta.properties.enc_name);
  },


  render() {
    //console.log("state", this.state);
    var rows = [];
    const cannotDecrypt = ("Incorrect Password");
    this.state.items.forEach(item => {
      if (item.meta) {
        const key = this.keyFor(item);
        if (this.isCorrectKey(item,key)) {
          const decName = this.decryptName(item, key);
          rows.push(
            <tr key={item.id}>
              <td>{item.meta.name}</td>
              <td>Password OK!</td>
              <td><a className="encLink" href="#" onClick={this.decrypt.bind(this,item)}>{decName}</a></td>
            </tr>);
        } else {
          rows.push(
            <tr key={item.id}>
              <td>{item.meta.name}</td>
              <td>Incorrect Password</td>
              <td>Not Possible</td>
            </tr>);
        }
      }
    });

    return (
      <div>
        <h2>File Download</h2>
        <div>

          <div>
            <div className="textPrompt">
              <label>Password</label>
              <input type="password" value={this.state.password}
                  onChange={event => this.setState({password:event.target.value})}/>
            </div>
            <p className="details">Must be the same password used during upload</p>
          </div>

          <table className="dl-list">
            <thead>
              <tr>
                <th style={{minWidth: "160px"}}>File</th>
                <th style={{minWidth: "160px"}}>Status</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
      </div>
    );
  }
});
