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

function finalizeU8(cryptor) {
  const wordsOut = cryptor.finalize();
  return CryptoJS.enc.u8array.stringify(wordsOut);
}

function processU8(cryptor, u8in) {
  const wordsIn = CryptoJS.enc.u8array.parse(u8in);
  const wordsOut = cryptor.process(wordsIn);
  return CryptoJS.enc.u8array.stringify(wordsOut);
}

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


function encryptStr(hexKey, hexIv, plainValue) {
  const key = CryptoJS.enc.Hex.parse(hexKey);
  const data = CryptoJS.enc.Utf8.parse(plainValue);
  const iv = CryptoJS.enc.Hex.parse(hexIv);
  var encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.OFB
  });
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}


function decryptStr(hexKey, hexIv, hexCiphertext) {
  const key = CryptoJS.enc.Hex.parse(hexKey);
  const ciphertext = CryptoJS.enc.Hex.parse(hexCiphertext);
  const iv = CryptoJS.enc.Hex.parse(hexIv);
  var decrypted = CryptoJS.AES.decrypt({ciphertext}, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.OFB
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

function encryptor(hexKey, hexIv) {
  const key = CryptoJS.enc.Hex.parse(hexKey);
  const iv = CryptoJS.enc.Hex.parse(hexIv);
  return CryptoJS.algo.AES.createEncryptor(key, {
    iv: iv,
    padding: CryptoJS.pad.NoPadding,
    mode: CryptoJS.mode.OFB
  });
}

function decryptor(hexKey, hexIv) {
  const key = CryptoJS.enc.Hex.parse(hexKey);
  const iv = CryptoJS.enc.Hex.parse(hexIv);
  return CryptoJS.algo.AES.createDecryptor(key, {
    iv: iv,
    padding: CryptoJS.pad.NoPadding,
    mode: CryptoJS.mode.OFB
  });
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

module.exports = { encryptStr, decryptStr, encryptor, decryptor, random, secure_hash, hash, wordsToBlob, blobToWordsPromise, finalizeU8, processU8 };