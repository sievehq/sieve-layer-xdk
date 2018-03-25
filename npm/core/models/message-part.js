/**
 * The MessagePart class represents an element of a message.
 *
 *      // Create a Message Part with any mimeType
 *      var part = new Layer.Core.MessagePart({
 *          body: "hello",
 *          mimeType: "text/plain"
 *      });
 *
 *      // Create a text/plain only Message Part
 *      var part = new Layer.Core.MessagePart("Hello I am text/plain");
 *
 * You can also create a Message Part from a File Input dom node:
 *
 *      var fileInputNode = document.getElementById("myFileInput");
 *      var part = new Layer.Core.MessagePart(fileInputNode.files[0]);
 *
 * You can also create Message Parts from a file drag and drop operation:
 *
 *      onFileDrop: function(evt) {
 *           var files = evt.dataTransfer.files;
 *           var m = conversation.createMessage({
 *               parts: files.map(function(file) {
 *                  return new Layer.Core.MessagePart({body: file, mimeType: file.type});
 *               }
 *           });
 *      });
 *
 * ### Blobs vs Strings
 *
 * You should always expect to see the `body` property be a Blob **unless** the mimeType is listed in Layer.Core.MessagePart.TextualMimeTypes,
 * in which case the value will be a String.  You can add mimeTypes to TextualMimeTypes:
 *
 * ```
 * Layer.Core.MessagePart.TextualMimeTypes = ['text/plain', 'text/mountain', /^application\/json(\+.+)$/]
 * ```
 *
 * Any mimeType matching the above strings and regular expressions will be transformed to text before being delivered to your app; otherwise it
 * must be a Blob.  Note that the above snippet sets a static property that is set once, and affects all MessagePart objects for the lifespan of
 * the app.
 *
 * ### Accesing Rich Content
 *
 * There are two ways of accessing rich content
 *
 * 1. Access the data directly: `part.fetchContent(function(data) {myRenderData(data);})`. This approach downloads the data,
 *    writes it to the the `body` property, writes a Data URI to the part's `url` property, and then calls your callback.
 *    By downloading the data and storing it in `body`, the data does not expire.
 * 2. Access the URL rather than the data.  When you first receive the Message Part it will have a valid `url` property; however, this URL expires.  *    URLs are needed for streaming, and for content that doesn't yet need to be rendered (e.g. hyperlinks to data that will render when clicked).
 *    The url property will return a string if the url is valid, or '' if its expired.  Call `part.fetchStream(callback)` to get an updated URL.
 *    The following pattern is recommended:
 *
 * ```
 * if (!part.url) {
 *   part.fetchStream(function(url) {myRenderUrl(url)});
 * } else {
 *   myRenderUrl(part.url);
 * }
 * ```
 *
 * NOTE: `Layer.Core.MessagePart.url` should have a value when the message is first received, and will only fail `if (!part.url)` once the url has expired.
 *
 * @class  Layer.Core.MessagePart
 * @extends Layer.Core.Root
 * @author Michael Kantor
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _settings = require('../../settings');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

var _content = require('./content');

var _content2 = _interopRequireDefault(_content);

var _layerError = require('../layer-error');

var _layerError2 = _interopRequireDefault(_layerError);

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _constants = require('../../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var MessagePart = function (_Root) {
  _inherits(MessagePart, _Root);

  /**
   * Constructor
   *
   * @method constructor
   * @param  {Object} options - Can be an object with body and mimeType, or it can be a string, or a Blob/File
   * @param  {string} options.body - Any string larger than 2kb will be sent as Rich Content, meaning it will be uploaded to cloud storage and must be separately downloaded from the Message when its received.
   * @param  {string} [options.mimeType=text/plain] - Mime type; can be anything; if your client doesn't have a renderer for it, it will be ignored.
   * @param  {number} [options.size=0] - Size of your part. Will be calculated for you if not provided.
   *
   * @return {Layer.Core.MessagePart}
   */
  function MessagePart(options) {
    _classCallCheck(this, MessagePart);

    var newOptions = options;
    if (typeof options === 'string') {
      newOptions = { body: options };
      if ((arguments.length <= 1 ? 0 : arguments.length - 1) > 0) {
        newOptions.mimeType = arguments.length <= 1 ? undefined : arguments[1];
      } else {
        newOptions.mimeType = _constants.STANDARD_MIME_TYPES.TEXT;
      }
    } else if (_utils2.default.isBlob(options) || _utils2.default.isBlob(options.body)) {
      var body = options instanceof Blob ? options : options.body;
      var mimeType = _utils2.default.isBlob(options.body) ? options.mimeType : body.type;
      newOptions = {
        id: options.id,
        mimeType: mimeType,
        body: body,
        size: body.size,
        hasContent: 'hasContent' in options ? options.hasContent : true
      };
      if (options.mimeAttributes) newOptions.mimeAttributes = options.mimeAttributes;
    }

    var _this = _possibleConstructorReturn(this, (MessagePart.__proto__ || Object.getPrototypeOf(MessagePart)).call(this, newOptions));

    if (!_this.mimeAttributes) _this.mimeAttributes = {};
    _this.mimeType = _this._moveMimeTypeToAttributes(_this.mimeType);

    // Don't expose encoding; blobify it if its encoded.
    if (options.encoding === 'base64') {
      _this.body = _utils2.default.base64ToBlob(_this.body, _this.mimeType);
    }

    // Could be a blob because it was read out of indexedDB,
    // or because it was created locally with a file
    // Or because of base64 encoded data.
    var isBlobBody = _utils2.default.isBlob(_this.body);
    var textual = _this.isTextualMimeType();

    // Custom handling for non-textual content
    if (!textual) {
      // If the body exists and is a blob, extract the data uri for convenience; only really relevant for image and video HTML tags.
      if (!isBlobBody && _this.body) _this.body = new Blob([_this.body], { type: _this.mimeType });
      if (_this.body) _this.url = URL.createObjectURL(_this.body);
    }

    if (_this._content) {
      _this.size = _this._content.size;
    } else if (!_this.size && _this.body) {
      _this.size = _utils2.default.isBlob(_this.body) ? _this.body.size : _this.body.length;
    }

    // If our textual content is a blob, turning it into text is asychronous, and can't be done in the synchronous constructor
    // This will only happen when the client is attaching a file.  Conversion for locally created messages is done while calling `Message.send()`
    return _this;
  }

  _createClass(MessagePart, [{
    key: '_moveMimeTypeToAttributes',
    value: function _moveMimeTypeToAttributes(mimeType) {
      var attributes = this.mimeAttributes;
      var parameters = mimeType.split(/\s*;\s*/);
      if (!parameters) return;
      var wasInitializing = this.isInitializing;
      this.isInitializing = true;
      mimeType = parameters.shift();
      this.isInitializing = wasInitializing;

      parameters.forEach(function (param) {
        var index = param.indexOf('=');
        if (index === -1) {
          attributes[param] = true;
        } else {
          var pName = param.substring(0, index);
          var pValue = param.substring(index + 1);
          attributes[pName] = pValue;
        }
      });
      return mimeType;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.__url) {
        URL.revokeObjectURL(this.__url);
        this.__url = null;
      }
      this.body = null;
      _get(MessagePart.prototype.__proto__ || Object.getPrototypeOf(MessagePart.prototype), 'destroy', this).call(this);
    }

    /**
     * Get the Layer.Core.Message associated with this Layer.Core.MessagePart.
     *
     * @method _getMessage
     * @private
     * @return {Layer.Core.Message}
     */

  }, {
    key: '_getMessage',
    value: function _getMessage() {
      if (this._message) {
        return this._message;
      } else if (_settings.client) {
        return _settings.client.getMessage(this.id.replace(/\/parts.*$/, ''));
      }
      return null;
    }

    /**
     * Download Rich Content from cloud server.
     *
     * For MessageParts with rich content, this method will load the data from google's cloud storage.
     * The body property of this MessagePart is set to the result.
     *
     *      messagepart.fetchContent()
     *      .on("content-loaded", function() {
     *          render(messagepart.body);
     *      });
     *
     * Note that a successful call to `fetchContent` will also cause Query change events to fire.
     * In this example, `render` will be called by the query change event that will occur once the content has downloaded:
     *
     * ```
     *  query.on('change', function(evt) {
     *    render(query.data);
     *  });
     *  messagepart.fetchContent();
     * ```
     *
     *
     * @method fetchContent
     * @param {Function} [callback]
     * @param {Mixed} callback.data - Either a string (mimeType=text/plain) or a Blob (all other mimeTypes)
     * @return {Layer.Core.Content} this
     */

  }, {
    key: 'fetchContent',
    value: function fetchContent(callback) {
      var _this2 = this;

      if (this._content && !this.isFiring) {
        this.isFiring = true;
        var type = this.mimeType === 'image/jpeg+preview' ? 'image/jpeg' : this.mimeType;
        this._content.loadContent(type, function (err, result) {
          if (!_this2.isDestroyed) _this2._fetchContentCallback(err, result, callback);
        });
      }
      return this;
    }

    /**
     * Callback with result or error from calling fetchContent.
     *
     * @private
     * @method _fetchContentCallback
     * @param {Layer.Core.LayerEvent} err
     * @param {Object} result
     * @param {Function} callback
     */

  }, {
    key: '_fetchContentCallback',
    value: function _fetchContentCallback(err, result, callback) {
      var _this3 = this;

      if (err) {
        this.trigger('content-loaded-error', err);
      } else {
        this.isFiring = false;
        if (this.isTextualMimeType()) {
          _utils2.default.fetchTextFromFile(result, function (text) {
            return _this3._fetchContentComplete(text, callback);
          });
        } else {
          this.url = URL.createObjectURL(result);
          this._fetchContentComplete(result, callback);
        }
      }
    }

    /**
     * Callback with Part Body from _fetchContentCallback.
     *
     * @private
     * @method _fetchContentComplete
     * @param {Blob|String} body
     * @param {Function} callback
     */

  }, {
    key: '_fetchContentComplete',
    value: function _fetchContentComplete(body, callback) {
      var message = this._getMessage();
      if (!message) return;

      // NOTE: This will trigger a messageparts:change event, and therefore a messages:change event
      this.body = body;

      this.trigger('content-loaded');

      if (callback) callback(this.body);
    }

    /**
     * Access the URL to the remote resource.
     *
     * Useful for streaming the content so that you don't have to download the entire file before rendering it.
     * Also useful for content that will be openned in a new window, and does not need to be fetched now.
     *
     * For MessageParts with Rich Content, will lookup a URL to your Rich Content.
     * Useful for streaming and content so that you don't have to download the entire file before rendering it.
     *
     * ```
     * messagepart.fetchStream(function(url) {
     *     render(url);
     * });
     * ```
     *
     * Note that a successful call to `fetchStream` will also cause Query change events to fire.
     * In this example, `render` will be called by the query change event that will occur once the `url` has been refreshed:
     *
     * ```
     *  query.on('change', function(evt) {
     *      render(query.data);
     *  });
     *  messagepart.fetchStream();
     * ```
     *
     * @method fetchStream
     * @param {Function} [callback]
     * @param {Mixed} callback.url
     * @return {Layer.Core.Content} this
     */

  }, {
    key: 'fetchStream',
    value: function fetchStream(callback) {
      var _this4 = this;

      if (!this._content) throw new Error(_layerError.ErrorDictionary.contentRequired);
      if (this._content.isExpired()) {
        this._content.refreshContent(function (url) {
          return _this4._fetchStreamComplete(url, callback);
        });
      } else {
        this._fetchStreamComplete(this._content.downloadUrl, callback);
      }
      return this;
    }

    // Does not set this.url; instead relies on fact that this._content.downloadUrl has been updated

  }, {
    key: '_fetchStreamComplete',
    value: function _fetchStreamComplete(url, callback) {
      this.trigger('url-loaded');

      this._triggerAsync('messageparts:change', {
        oldValue: '',
        newValue: url,
        property: 'url'
      });

      if (callback) callback(url);
    }

    /**
     * Preps a MessagePart for sending.  Normally that is trivial.
     * But if there is rich content, then the content must be uploaded
     * and then we can trigger a "parts:send" event indicating that
     * the part is ready to send.
     *
     * @method _send
     * @protected
     * @fires parts:send
     */

  }, {
    key: '_send',
    value: function _send() {
      // There is already a Content object, presumably the developer
      // already took care of this step for us.
      if (this._content) {
        this._sendWithContent();
      }

      // If the size is large, Create and upload the Content
      else if (this.size > 2048) {
          this._generateContentAndSend();
        }

        // If the body is a blob, but is not YET Rich Content, do some custom analysis/processing:
        else if (_utils2.default.isBlob(this.body)) {
            this._sendBlob();
          }

          // Else the message part can be sent as is.
          else {
              this._sendBody();
            }
    }
  }, {
    key: 'getMimeTypeWithAttributes',
    value: function getMimeTypeWithAttributes() {
      var _this5 = this;

      var attributeString = Object.keys(this.mimeAttributes).map(function (key) {
        if (_this5.mimeAttributes[key] === true) return key;
        return key + '=' + _this5.mimeAttributes[key];
      }).join(';');
      return this.mimeType + (attributeString ? ';' + attributeString : '');
    }
  }, {
    key: '_sendBody',
    value: function _sendBody() {
      if (typeof this.body !== 'string') {
        var err = 'MessagePart.body must be a string in order to send it';
        _utils.logger.error(err, { mimeType: this.mimeType, body: this.body });
        throw new Error(err);
      }

      var obj = {
        mime_type: this.getMimeTypeWithAttributes(),
        body: this.body,
        id: this.id
      };
      this.trigger('parts:send', obj);
    }
  }, {
    key: '_sendWithContent',
    value: function _sendWithContent() {
      this.trigger('parts:send', {
        id: this.id,
        mime_type: this.getMimeTypeWithAttributes(),
        content: {
          size: this.size,
          id: this._content.id
        }
      });
    }

    /**
     * This method is only called if Blob.size < 2048.
     *
     * However, conversion to base64 can impact the size, so we must retest the size
     * after conversion, and then decide to send the original blob or the base64 encoded data.
     *
     * @method _sendBlob
     * @private
     */

  }, {
    key: '_sendBlob',
    value: function _sendBlob() {
      var _this6 = this;

      /* istanbul ignore else */
      if (this.body.size < 2048) {
        _utils2.default.blobToBase64(this.body, function (base64data) {
          var body = base64data.substring(base64data.indexOf(',') + 1);
          var obj = {
            body: body,
            id: _this6.id,
            mime_type: _this6.getMimeTypeWithAttributes()
          };
          obj.encoding = 'base64';
          _this6.trigger('parts:send', obj);
        });
      } else {
        this._generateContentAndSend(_settings.client);
      }
    }

    /**
     * Create an rich Content object on the server
     * and then call _processContentResponse
     *
     * @method _generateContentAndSend
     * @private
     */

  }, {
    key: '_generateContentAndSend',
    value: function _generateContentAndSend() {
      var _this7 = this;

      this.hasContent = true;
      var body = void 0;
      if (!_utils2.default.isBlob(this.body)) {
        body = _utils2.default.base64ToBlob(_utils2.default.utoa(this.body), this.mimeType);
      } else {
        body = this.body;
      }
      _settings.client.xhr({
        url: '/content',
        method: 'POST',
        headers: {
          'Upload-Content-Type': this.mimeType,
          'Upload-Content-Length': body.size,
          'Upload-Origin': typeof location !== 'undefined' ? location.origin : ''
        },
        sync: {}
      }, function (result) {
        return _this7._processContentResponse(result.data, body);
      });
    }

    /**
     * Creates a Layer.Core.Content object from the server's
     * Content object, and then uploads the data to google cloud storage.
     *
     * @method _processContentResponse
     * @private
     * @param  {Object} response
     * @param  {Blob} body
     * @param {Number} [retryCount=0]
     */

  }, {
    key: '_processContentResponse',
    value: function _processContentResponse(response, body) {
      var _this8 = this;

      var retryCount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      this._content = new _content2.default(response.id);
      this.hasContent = true;
      (0, _utils.xhr)({
        url: response.upload_url,
        method: 'PUT',
        data: body,
        headers: {
          'Upload-Content-Length': this.size,
          'Upload-Content-Type': this.mimeType
        }
      }, function (result) {
        return _this8._processContentUploadResponse(result, response, body, retryCount);
      });
    }

    /**
     * Process the response to uploading the content to google cloud storage.
     *
     * Result is either:
     *
     * 1. trigger `parts:send` on success
     * 2. call `_processContentResponse` to retry
     * 3. trigger `messages:sent-error` if retries have failed
     *
     * @method _processContentUploadResponse
     * @private
     * @param  {Object} uploadResult    Response from google cloud server; note that the xhr method assumes some layer-like behaviors and may replace non-json responses with js objects.
     * @param  {Object} contentResponse Response to `POST /content` from before
     * @param  {Blob} body
     * @param  {Number} retryCount
     */

  }, {
    key: '_processContentUploadResponse',
    value: function _processContentUploadResponse(uploadResult, contentResponse, body, retryCount) {
      if (!uploadResult.success) {
        if (!_settings.client.onlineManager.isOnline) {
          _settings.client.onlineManager.once('connected', this._processContentResponse.bind(this, contentResponse), this);
        } else if (retryCount < MessagePart.MaxRichContentRetryCount) {
          this._processContentResponse(contentResponse, body, retryCount + 1);
        } else {
          _utils.logger.error('Failed to upload rich content; triggering message:sent-error event; status of ', uploadResult.status, this);
          this._getMessage().trigger('messages:sent-error', {
            error: new _layerError2.default({
              message: 'Upload of rich content failed',
              httpStatus: uploadResult.status,
              code: 0,
              data: uploadResult.xhr
            }),
            part: this
          });
          this.destroy();
        }
      } else {
        this.trigger('parts:send', {
          id: this.id,
          mime_type: this.getMimeTypeWithAttributes(),
          content: {
            size: this.size,
            id: this._content.id
          }
        });
      }
    }

    /**
     * Updates the MessagePart with new data from the server.
     *
     * Currently, MessagePart properties do not update... however,
     * the Layer.Core.Content object that Rich Content MessageParts contain
     * do get updated with refreshed expiring urls.
     *
     * @method _populateFromServer
     * @param  {Object} part - Server representation of a part
     * @private
     */

  }, {
    key: '_populateFromServer',
    value: function _populateFromServer(part) {
      var _this9 = this;

      // don't accept changes to mimeType (though do make sure we aren't
      // rejecting changes to mime type attributes). Primarily protects
      // a TextMessage from being converted to `text/plain` where it started
      if (this.mimeType && part.mime_type.indexOf(this.mimeType) === -1) {
        return;
      }

      if (part.encoding === 'base64') {
        part.body = _utils2.default.base64ToBlob(part.body, part.mime_type);
      }

      if (part.content && this._content) {
        this._content.downloadUrl = part.content.download_url;
        this._content.expiration = new Date(part.content.expiration);
        // TODO: May need to invalidate this.body, but need to identify the conditions where this happens
      } else {
        var textual = this.isTextualMimeType();

        // Custom handling for non-textual content
        if (!textual) {

          // If the body exists and is a blob, extract the data uri for convenience; only really relevant for image and video HTML tags.
          if (part.body && _utils2.default.isBlob(part.body)) {
            _utils2.default.blobToBase64(this.body, function (inputBase64) {
              if (!inputBase64) {
                _utils.logger.error('Invalid Blob for ' + _this9.id + ' ' + _this9.mimeType + '  ', _this9.body);
              }
              if (inputBase64 !== _utils2.default.btoa(part.body)) {
                _this9.body = new Blob([part.body], { type: _this9.mimeType });
                if (_this9.body) _this9.url = URL.createObjectURL(_this9.body);
              }
            });
          } else {
            this.body = null;
            this.url = '';
          }
        } else {
          this.body = part.body;
        }
      }
      this.mimeType = part.mime_type;
      this.updatedAt = part.updated_at ? new Date(part.updated_at) : null;

      if (!part.body && part.content) {
        this.hasContent = true;
      } else if (!_utils2.default.isBlob(part.body) && !this.isTextualMimeType()) {
        // this.body = Util.base64ToBlob(Util.utoa(part.body), this.mimeType);
        this.body = _utils2.default.base64ToBlob(part.body, this.mimeType);
      } else {
        this.body = part.body;
      }
    }

    /**
     * Is the mimeType for this MessagePart defined as textual content?
     *
     * If the answer is true, expect a `body` of string, else expect `body` of Blob.
     *
     * To change whether a given MIME Type is treated as textual, see Layer.Core.MessagePart.TextualMimeTypes.
     *
     * @method isTextualMimeType
     * @returns {Boolean}
     */

  }, {
    key: 'isTextualMimeType',
    value: function isTextualMimeType() {
      var i = 0;
      for (i = 0; i < MessagePart.TextualMimeTypes.length; i++) {
        var test = MessagePart.TextualMimeTypes[i];
        if (typeof test === 'string') {
          if (test === this.mimeType) return true;
        } else if (test instanceof RegExp) {
          if (this.mimeType.match(test)) return true;
        }
      }
      return false;
    }

    /**
     * Returns a Layer.Core.MessageTypeModel representing this Message Part.
     *
     * Will return an existing model if one already exists for this Message Part.
     *
     * ```
     * var model = part.createModel();
     * ```
     *
     * @method createModel
     * @returns {Layer.Core.MessageTypeModel}
     */

  }, {
    key: 'createModel',
    value: function createModel() {
      if (!this._messageTypeModel) {
        var message = this._getMessage();
        if (message) {
          this._messageTypeModel = _settings.client.createMessageTypeModel(message, this);
        }
      }
      return this._messageTypeModel;
    }

    /**
     * This method is automatically called any time the body is changed.
     *
     * Note that it is not called during initialization.  Any developer who does:
     *
     * ```
     * part.body = "Hi";
     * ```
     *
     * can expect this to trigger a change event, which will in turn trigger a `messages:change` event on the Layer.Core.Message.
     *
     * @method __updateBody
     * @private
     * @param {String} newValue
     * @param {String} oldValue
     */

  }, {
    key: '__updateBody',
    value: function __updateBody(newValue, oldValue) {
      var _this10 = this;

      if (_utils2.default.isBlob(newValue) && _utils2.default.isBlob(oldValue)) {
        _utils2.default.blobToBase64(newValue, function (newValueStr) {
          _utils2.default.blobToBase64(oldValue, function (oldValueStr) {
            if (newValueStr !== oldValueStr) {
              _this10._triggerAsync('messageparts:change', {
                property: 'body',
                newValue: newValue,
                oldValue: oldValue
              });
            }
          });
        });
      } else {
        this._triggerAsync('messageparts:change', {
          property: 'body',
          newValue: newValue,
          oldValue: oldValue
        });
      }
    }

    /**
     * This method is automatically called any time the mimeType is changed.
     *
     * Note that it is not called during initialization.  Any developer who does:
     *
     * ```
     * part.mimeType = "text/mountain";
     * ```
     *
     * can expect this to trigger a change event, which will in turn trigger a `messages:change` event on the Layer.Core.Message.
     *
     * @method __updateMimeType
     * @private
     * @param {String} newValue
     * @param {String} oldValue
     */

  }, {
    key: '__adjustMimeType',
    value: function __adjustMimeType(newValue) {
      if (newValue.match(/;/)) {
        this.mimeAttributes = {};
        return this._moveMimeTypeToAttributes(newValue);
      }
      return newValue;
    }
  }, {
    key: '__updateMimeType',
    value: function __updateMimeType(newValue, oldValue) {
      this._triggerAsync('messageparts:change', {
        property: 'mimeType',
        newValue: newValue,
        oldValue: oldValue
      });
    }
  }, {
    key: '_updateUrl',
    value: function _updateUrl(newValue, oldValue) {
      if (oldValue) URL.revokeObjectURL(oldValue);
    }
  }, {
    key: '__adjustUpdatedAt',
    value: function __adjustUpdatedAt(date) {
      if (typeof date === 'string') return new Date(date);
    }

    /**
     * Accepts json-patch operations for modifying recipientStatus.
     *
     * @method _handlePatchEvent
     * @private
     * @param  {Object[]} data - Array of operations
     */

  }, {
    key: '_handlePatchEvent',
    value: function _handlePatchEvent(newValue, oldValue, paths) {}
  }, {
    key: '__getNodeId',
    value: function __getNodeId() {
      // mime type node-id for backwards compat with `1.0.0-pre1.x`
      if (this.mimeAttributes['node-id']) {
        return this.mimeAttributes['node-id'];
      } else if (this.id) {
        return _utils2.default.uuid(this.id);
      } else if (this._tmpUUID) {
        return this._tmpUUID;
      } else {
        this._tmpUUID = _utils2.default.generateUUID();
        return this._tmpUUID;
      }
    }
  }, {
    key: '__getParentId',
    value: function __getParentId() {
      return this.mimeAttributes['parent-node-id'] ? _utils2.default.uuid(this.mimeAttributes['parent-node-id']) : '';
    }
  }, {
    key: '__getRole',
    value: function __getRole() {
      return this.mimeAttributes.role || '';
    }

    /**
     * Creates a MessagePart from a server representation of the part
     *
     * @method _createFromServer
     * @private
     * @static
     * @param  {Object} part - Server representation of a part
     */

  }], [{
    key: '_createFromServer',
    value: function _createFromServer(part) {
      var content = part.content ? _content2.default._createFromServer(part.content) : null;

      // Turn base64 data into a Blob
      if (part.encoding === 'base64') part.body = _utils2.default.base64ToBlob(part.body, part.mime_type.replace(/;.*/, ''));

      // Create the MessagePart
      return new MessagePart({
        id: part.id,
        mimeType: part.mime_type,
        body: part.body || '',
        _content: content,
        hasContent: Boolean(content),
        size: part.size || 0,
        updatedAt: part.updated_at ? new Date(part.updated_at) : null
      });
    }
  }]);

  return MessagePart;
}(_root2.default);

/**
 * Server generated identifier for the part
 * @property {string}
 */


MessagePart.prototype.id = '';

/**
 * Body of your message part.
 *
 * This is the core data of your part.
 *
 * If this is `null` then most likely Layer.Core.Message.hasContent is true, and you
 * can either use the Layer.Core.MessagePart.url property or the Layer.Core.MessagePart.fetchContent method.
 *
 * @property {string}
 */
MessagePart.prototype.body = null;

/**
 * Rich content object.
 *
 * This will be automatically created for you if your Layer.Core.MessagePart.body
 * is large.
 * @property {Layer.Core.Content}
 * @private
 */
MessagePart.prototype._content = null;

/**
 * The Part has rich content
 * @property {Boolean}
 */
MessagePart.prototype.hasContent = false;

/**
 * The Message Part is currently loading its Rich Content from the server.
 *
 * @property {Boolean}
 */
MessagePart.prototype.isFiring = false;

/**
 * URL to rich content object.
 *
 * Parts with rich content will be initialized with this property set.  But its value will expire.
 *
 * Will contain an expiring url at initialization time and be refreshed with calls to `Layer.Core.MessagePart.fetchStream()`.
 * Will contain a non-expiring url to a local resource if `Layer.Core.MessagePart.fetchContent()` is called.
 *
 * @property {Layer.Core.Content}
 */
Object.defineProperty(MessagePart.prototype, 'url', {
  enumerable: true,
  get: function get() {
    // Its possible to have a url and no content if it has been instantiated but not yet sent.
    // If there is a __url then its a local url generated from the body property and does not expire.
    if (this.__url) return this.__url;
    if (this._content) return this._content.isExpired() ? '' : this._content.downloadUrl;
    return '';
  },
  set: function set(inValue) {
    this.__url = inValue;
  }
});

/**
 * Mime Type for the data represented by the MessagePart.
 *
 * Typically this is the type for the data in Layer.Core.MessagePart.body;
 * if there is Rich Content, then its the type of Content that needs to be
 * downloaded.
 *
 * @property {String}
 */
MessagePart.prototype.mimeType = 'text/plain';

/**
 * Mime Type Attributes are attributes provided via the mimeType.
 *
 * These attributes are removed from the mimeType and moved into a hash.
 *
 * @property {Object}
 */
MessagePart.prototype.mimeAttributes = null;

/**
 * Time that the part was last updated.
 *
 * If the part was created after the message was sent, or the part was updated after the
 * part was sent then this will have a value.
 *
 * @property {Date}
 */
MessagePart.prototype.updatedAt = null;

/**
 * Size of the Layer.Core.MessagePart.body.
 *
 * Will be set for you if not provided.
 * Only needed for use with rich content.
 *
 * @property {number}
 */
MessagePart.prototype.size = 0;

/**
 * Message Parts are organized into a tree structure; this identifies the Message Part's Parent node in the Tree.
 *
 * ```
 * var parentId = messagePart.parentId;
 * var parentNode = message.filterParts(part => part.nodeId === parentId)[0];
 * ```
 *
 * Or just:
 *
 * ```
 * var parentNode = message.getRootPart();
 * ```
 *
 * @property {String}
 */
MessagePart.prototype.parentId = '';

/**
 * Every Message Part has a nodeId identifying it within the Message Part Tree heirarchy setup by the
 * Layer.Core.MessageTypeModel.
 *
 * This nodeId will typically be based off of the MessagePart's `id` property.
 *
 * @property {String}
 */
MessagePart.prototype.nodeId = '';

/**
 * Every Message Part within the MessagePart Heirarchy has a role within that structure; get that role.
 *
 * @property {String}
 */
MessagePart.prototype.role = '';

/**
 * Cache any model created for this Message Part.
 *
 * @property {Layer.Core.MessageTypeModel} _messageTypeModel
 * @private
 */
MessagePart.prototype._messageTypeModel = null;

// We want to avoid setting this as it creates circular references.
// however, we need to set this until the message has been registered
MessagePart.prototype._message = null;

/**
 * Array of mime types that should be treated as text.
 *
 * Treating a MessagePart as text means that even if the `body` gets a File or Blob,
 * it will be transformed to a string before being delivered to your app.
 *
 * This value can be customized using strings and regular expressions:
 *
 * ```
 * Layer.Core.MessagePart.TextualMimeTypes = ['text/plain', 'text/mountain', /^application\/json(\+.+)$/]
 * ```
 *
 * @static
 * @property {Mixed[]}
 */
MessagePart.TextualMimeTypes = [/^text\/.+$/, /^application\/json(\+.+)?$/, /\+json$/, /-json$/];

/**
 * Number of retry attempts to make before giving up on uploading Rich Content to Google Cloud Storage.
 *
 * @property {Number}
 */
MessagePart.MaxRichContentRetryCount = 3;

MessagePart._supportedEvents = ['parts:send', 'content-loaded', 'url-loaded', 'content-loaded-error', 'messageparts:change'].concat(_root2.default._supportedEvents);
_root2.default.initClass.apply(MessagePart, [MessagePart, 'MessagePart', _namespace2.default]);

module.exports = MessagePart;