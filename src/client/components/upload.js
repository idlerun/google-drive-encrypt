// based on https://github.com/googledrive/cors-upload-sample

const Crypto = require('./crypto');

/**
 * Helper class for resumable uploads using XHR/CORS. Can upload any Blob-like item, whether
 * files or in-memory constructs.
 *
 * @example
 * var content = new Blob(["Hello world"], {"type": "text/plain"});
 * var uploader = new EncryptedUploader({
 *   file: content,
 *   token: accessToken,
 *   onComplete: function(data) { ... }
 *   onError: function(data) { ... }
 * });
 * uploader.upload();
 *
 * @constructor
 * @param {object} options Hash of options
 * @param {string} options.token Access token
 * @param {blob} options.file Blob-like item to upload
 * @param {string} [options.fileId] ID of file if replacing
 * @param {object} [options.params] Additional query parameters
 * @param {object} [options.metadata] File metadata
 * @param {function} [options.onComplete] Callback for when upload is complete
 * @param {function} [options.onProgress] Callback for status for the in-progress upload
 * @param {function} [options.onError] Callback if upload fails
 */
var EncryptedUploader = function(options) {
  var noop = function() {};
  this.file = options.file;
  this.contentType = 'application/octet-stream';
  this.metadata = options.metadata || {
    
  };
  if (!options.key) {
    throw "Missing required parameter 'key'";
  }
  if (!options.iv) {
    throw "Missing required parameter 'iv'";
  }
  this.encryptor = Crypto.encryptor(options.key, options.iv);

  this.token = options.token;
  this.onComplete = options.onComplete || noop;
  this.onProgress = options.onProgress || noop;
  this.onError = options.onError || noop;
  this.offset = 0;
  this.chunkSize = 262144;

  this.url = options.url;
  if (!this.url) {
    var params = options.params || {};
    params.uploadType = 'resumable';
    this.url = this.buildUrl_(options.fileId, params, options.baseUrl);
  }
  this.httpMethod = options.fileId ? 'PUT' : 'POST';
};

/**
 * Initiate the upload.
 */
EncryptedUploader.prototype.upload = function() {
  var self = this;
  var xhr = new XMLHttpRequest();

  xhr.open(this.httpMethod, this.url, true);
  xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('X-Upload-Content-Length', this.file.size);
  xhr.setRequestHeader('X-Upload-Content-Type', this.contentType);

  xhr.onload = function(e) {
    if (e.target.status < 400) {
      var location = e.target.getResponseHeader('Location');
      this.url = location;
      this.sendFile_();
    } else {
      this.onUploadError_(e);
    }
  }.bind(this);
  xhr.onerror = this.onUploadError_.bind(this);
  xhr.send(JSON.stringify(this.metadata));
};

/**
 * Send the actual file content.
 *
 * @private
 */
EncryptedUploader.prototype.sendFile_ = function() {
  var end = Math.min(this.offset + this.chunkSize, this.file.size);
  var content = this.file.slice(this.offset, end);

  // reading from file is async promise
  Crypto.blobToWordsPromise(content).then(wordsIn => {
    var encWords
    if (end < this.file.size) {
      encWords = this.encryptor.process(wordsIn);
      //console.log("process");
    } else {
      encWords = this.encryptor.finalize(wordsIn);
      //console.log("finalize");
    }
    const encContent = Crypto.wordsToBlob(encWords);
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', this.url, true);
    xhr.setRequestHeader('Content-Type', this.contentType);
    xhr.setRequestHeader('Content-Range', "bytes " + this.offset + "-" + (this.offset+encContent.size-1) + "/" + this.file.size);
    xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
    if (xhr.upload) {
      xhr.upload.addEventListener('progress', this.onProgress_.bind(this));
    }
    xhr.onload = this.onContentUploadSuccess_.bind(this);
    xhr.onerror = this.onContentUploadError_.bind(this);
    xhr.send(encContent);
    this.offset = this.offset + content.size;
  });
};

EncryptedUploader.prototype.onProgress_ = function(oEvent) {
  // offset is increased immediately, so need to calculate backward
  const complete = this.offset - oEvent.total + oEvent.loaded;
  this.onProgress(complete / this.file.size);
};

/**
 * Handle successful responses for uploads. Depending on the context,
 * may continue with uploading the next chunk of the file or, if complete,
 * invokes the caller's callback.
 *
 * @private
 * @param {object} e XHR event
 */
EncryptedUploader.prototype.onContentUploadSuccess_ = function(e) {
  if (e.target.status == 200 || e.target.status == 201) {
    this.onComplete(e.target.response);
  } else if (e.target.status == 308) {
    // more to send
    this.sendFile_();
  } else {
    this.onContentUploadError_(e);
  }
};

/**
 * Handles errors for uploads. Either retries or aborts depending
 * on the error.
 *
 * @private
 * @param {object} e XHR event
 */
EncryptedUploader.prototype.onContentUploadError_ = function(e) {
  this.onError(e.target.response);
};

/**
 * Handles errors for the initial request.
 *
 * @private
 * @param {object} e XHR event
 */
EncryptedUploader.prototype.onUploadError_ = function(e) {
  this.onError(e.target.response); // TODO - Retries for initial upload
};

/**
 * Construct a query string from a hash/object
 *
 * @private
 * @param {object} [params] Key/value pairs for query string
 * @return {string} query string
 */
EncryptedUploader.prototype.buildQuery_ = function(params) {
  params = params || {};
  return Object.keys(params).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
};

/**
 * Build the drive upload URL
 *
 * @private
 * @param {string} [id] File ID if replacing
 * @param {object} [params] Query parameters
 * @return {string} URL
 */
EncryptedUploader.prototype.buildUrl_ = function(id, params, baseUrl) {
  var url = baseUrl || 'https://www.googleapis.com/upload/drive/v3/files/';
  if (id) {
    url += id;
  }
  var query = this.buildQuery_(params);
  if (query) {
    url += '?' + query;
  }
  return url;
};

module.exports = EncryptedUploader;
