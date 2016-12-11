var CryptoJS = require("crypto-js");

// From https://groups.google.com/forum/#!topic/crypto-js/TOb92tcJlU0
CryptoJS.enc.u8array = {
  stringify: function (wordArray) {
      var words = wordArray.words;
      var sigBytes = wordArray.sigBytes;
      var u8 = new Uint8Array(sigBytes);
      for (var i = 0; i < sigBytes; i++) {
          var byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
          u8[i]=byte;
      }
      return u8;
  },

  parse: function (u8arr) {
      if (!u8arr) {
          return undefined;
      }
      var len = u8arr.length;
      var words = [];
      for (var i = 0; i < len; i++) {
          words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
      }
      return CryptoJS.lib.WordArray.create(words, len);
  }
};

function blobToWordsPromise(blob) {
  return new Promise(function(resolve, reject) {
    var fileReader = new FileReader();
    fileReader.onload = function() {
        var arrayBuffer = new Uint8Array(this.result);
        var words = CryptoJS.enc.u8array.parse(arrayBuffer);
        resolve(words);
    };
    fileReader.readAsArrayBuffer(blob);
  });
}

function wordsToBlob(words) {
  var u8 = CryptoJS.enc.u8array.stringify(words)
  return new Blob([u8])
}

function config(iv) {
  return {
    iv: iv,
    padding: CryptoJS.pad.NoPadding,
    mode: CryptoJS.mode.OFB
  }
}

function encryptStr(hexKey, iv, plainValue) {
  var args = {
    key: CryptoJS.enc.Hex.parse(hexKey),
    data: CryptoJS.enc.Utf8.parse(plainValue),
    iv: CryptoJS.enc.Hex.parse(iv)
  };
  var encrypted = CryptoJS.AES.encrypt(args.data, args.key, config(args.iv));
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}

function encryptor(hexKey, iv) {
  var args = {
    key: CryptoJS.enc.Hex.parse(hexKey),
    iv: CryptoJS.enc.Hex.parse(iv)
  };
  return CryptoJS.algo.AES.createEncryptor(args.key, config(args.iv));
}

function decryptor(hexKey, iv) {
  var args = {
    key: CryptoJS.enc.Hex.parse(hexKey),
    iv: CryptoJS.enc.Hex.parse(iv)
  };
  return CryptoJS.algo.AES.createDecryptor(args.key, config(args.iv));
}

function decryptStr(hexKey, iv, ciphertext) {
  var args = {
    key: CryptoJS.enc.Hex.parse(hexKey),
    ciphertext: CryptoJS.enc.Hex.parse(ciphertext), 
    iv: CryptoJS.enc.Hex.parse(iv)
  };
  var decrypted = CryptoJS.AES.decrypt(args, args.key, config(args.iv));
  return decrypted.toString(CryptoJS.enc.Utf8);
}

function random() {
  return CryptoJS.lib.WordArray.random(256/8).toString(CryptoJS.enc.Hex);
}

function secure_hash(data, salt) {
  return CryptoJS.PBKDF2(
      data,
      CryptoJS.enc.Hex.parse(salt),
      { keySize: 256/32, iterations: 128 }
  ).toString(CryptoJS.enc.Hex);
}

function hash(data) {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
}

module.exports = { encryptStr, decryptStr, encryptor, decryptor, random, secure_hash, hash, wordsToBlob, blobToWordsPromise };