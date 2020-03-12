import React from 'react';
import $ from 'jquery';
import params from './components/params'
import {CLIENT_ID} from './components/constants'
import StreamSaver from './vendor/StreamSaver';

import Performance from './components/performance'

const Crypto = require('./components/crypto');

//console.log("host", Crypto.hash(window.location.hostname));

module.exports = React.createClass({

  getInitialState() {
    const items = params.ids.split(',').map(function(id){return {id}});
    return {
        host: Crypto.hash(window.location.hostname),
        items,
        password:'',
        metaQueue:items.slice()
    };
  },


  componentWillMount() {
    // start a few threads loading meta in parallel
    for(var i=0; i<5; i++){
      setTimeout(this.loadNextMeta, 0);
    }
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

  /**
   * Loading meta too fast will start getting 403 errors
   */
  loadNextMeta() {
    //console.log("loadNextMeta");
    if (this.state.metaQueue.length > 0) {
      const item = this.state.metaQueue.shift();
      return this.loadMeta(item);
    }
  },


  loadMeta(item) {
    //console.log("loadMeta", item);
    fetch("https://www.googleapis.com/drive/v3/files/" + item.id + "/?fields=name,properties", this.gapiParams())
    .then(res => {
      if (res.status == 200) {
        setTimeout(this.loadNextMeta, 0);
        return res.json();
      } else {
        this.state.metaQueue.unshift(item);
        // back off a bit when we get an error
        setTimeout(this.loadNextMeta, 500);
        throw 'Fetch failed with response code ' + res.status;
      }
    }).then(json => {
      //console.log("meta", item.id, json);
      item.meta = json;
      this.forceUpdate();
    }).catch(e => {
      console.log(e);
    });
  },


  decrypt(item, key) {
    fetch("https://www.googleapis.com/drive/v3/files/" + item.id + "/?alt=media", this.gapiParams()).then(res => {
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
              if(!this.state.host.startsWith("12ca") /*127.0.0.1*/ && 
                  !this.state.host.startsWith("4996") /*localhost*/ &&
                  !this.state.host.startsWith("b70b") /*drive-encrypt.com*/) {
                // corrupt output if not on valid host
                u8out[0] = u8out >> 1;
              }
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
    var iterations = 128;
    if ('iterations' in item.meta.properties) {
      iterations = parseInt(item.meta.properties.iterations);
    }
    //Crypto.secure_hash(this.state.password, salt, iterations);
    return Performance.profile("secure_hash(" + iterations + ")", ()=>{
      return Crypto.secure_hash(this.state.password, salt, iterations);
    });
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
    var name = item.meta.properties.enc_name;
    for(var i=1; i<100; i++) {
      const key = 'enc_name(' + i + ')';
      if (key in item.meta.properties) {
        name += item.meta.properties[key];
      } else {
        break;
      }
    }
    return Crypto.decryptStr(key, item.meta.properties.salt, name);
  },
  
  
  renderBrowserWarning() {
    if (navigator.userAgent.indexOf('Chrome') == -1) {
      return (<p className="warning">WARNING: Download is currently only supported on Google Chrome (see FAQ)</p>)
    } else {
      return undefined
    }
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
              <td><a className="encLink" href="#" onClick={this.decrypt.bind(this,item,key)}>{decName}</a></td>
            </tr>);
        } else {
          rows.push(
            <tr key={item.id}>
              <td>{item.meta.name}</td>
              <td>Incorrect Password</td>
              <td>Not Possible</td>
            </tr>);
        }
      } else {
        rows.push(
            <tr key={item.id}>
              <td className="loadingMeta">Loading...</td>
              <td></td>
              <td></td>
            </tr>);
      }
    });

    return (
      <div>
        <h2>File Download</h2>
        <div>
        
          {this.renderBrowserWarning()}

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
                <th>File</th>
                <th>Status</th>
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
