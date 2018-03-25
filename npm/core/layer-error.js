/**
 * This class represents a Layer Error.
 *
 * At this point, a LayerError is only used in response to an error from the server.
 * It may be extended to report on internal errors... but typically internal errors
 * are reported via `throw new Error(...);`
 *
 * Layer Error is passed as part of the Layer.Core.LayerEvent's data property.
 *
 * Throw an error:
 *
 *     object.trigger('xxx-error', new LayerEvent({
 *       data: new LayerError()
 *     }));
 *
 *  Receive an Error:
 *
 *     conversation.on('loaded-error', function(errEvt) {
 *        var error = errEvt.data;
 *        console.error(error.message);
 *     });
 *
 * @class Layer.Core.LayerEvent
 */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); 


var _namespace = require('./namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LayerError = function () {
  function LayerError(options) {
    var _this = this;

    _classCallCheck(this, LayerError);

    if (options instanceof LayerError) {
      options = {
        errType: options.errType,
        httpStatus: options.httpStatus,
        message: options.message,
        code: options.code,
        url: options.url,
        data: options.data
      };
    } else if (options && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
      options.errType = options.id;
    } else {
      options = {
        message: options
      };
    }

    Object.keys(options).forEach(function (name) {
      return _this[name] = options[name];
    });
    if (!this.data) this.data = {};
  }

  /**
   * Returns either '' or a nonce.
   *
   * If a nonce has been returned
   * by the server as part of a session-expiration error,
   * then this method will return that nonce.
   *
   * @method getNonce
   * @return {string} nonce
   */


  _createClass(LayerError, [{
    key: 'getNonce',
    value: function getNonce() {
      return this.data && this.data.nonce ? this.data.nonce : '';
    }

    /**
     * String representation of the error
     *
     * @method toString
     * @return {string}
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this.code + ' (' + this.id + '): ' + this.message + '; (see ' + this.url + ')';
    }

    /**
     * Log the errors
     *
     * @method log
     */

  }, {
    key: 'log',
    value: function log() {
      _utils.logger.error('Layer-Error: ' + this.toString());
    }
  }]);

  return LayerError;
}();

/**
 * A string name for the event; these names are paired with codes.
 *
 * Codes can be looked up at https://docs.layer.com/reference/client_api/errors
 * @property {String}
 */


LayerError.prototype.errType = '';

/**
 * Numerical error code.
 *
 * https://docs.layer.com/reference/client_api/errors
 * @property {Number}
 */
LayerError.prototype.code = 0;

/**
 * URL to go to for more information on this error.
 * @property {String}
 */
LayerError.prototype.url = '';

/**
 * Detailed description of the error.
 * @property {String}
 */
LayerError.prototype.message = '';

/**
 * Http error code; no value if its a websocket response.
 * @property {Number}
 */
LayerError.prototype.httpStatus = 0;

/**
 * Contains data from the xhr request object.
 *
 *  * url: the url to the service endpoint
 *  * data: xhr.data,
 *  * xhr: XMLHttpRequest object
 *
 * @property {Object}
 */
LayerError.prototype.request = null;

/**
 * Any additional details about the error sent as additional properties.
 * @property {Object}
 */
LayerError.prototype.data = null;

/**
 * Pointer to the xhr object that fired the actual request and contains the response.
 * @property {XMLHttpRequest}
 */
LayerError.prototype.xhr = null;

/**
 * Dictionary of error messages
 * @property {Object} [ErrorDictionary={}]
 */
LayerError.ErrorDictionary = {
  appIdMissing: 'Property missing: appId is required',
  identityTokenMissing: 'Identity Token missing: answerAuthenticationChallenge requires an identity token',
  sessionTokenMissing: 'Session Token missing: _authComplete requires a {session_token: value} input',
  conversationMissing: 'Property missing: conversation is required',
  partsMissing: 'Property missing: parts is required',
  messageMissing: 'Property missing: message is required',
  moreParticipantsRequired: 'Conversation needs participants other than the current user',
  isDestroyed: 'Object is destroyed',
  urlRequired: 'Object needs a url property',
  invalidUrl: 'URL is invalid',
  invalidId: 'Identifier is invalid',
  idParamRequired: 'The ID Parameter is required',
  modelParamRequired: 'The Model Parameter is required',
  wrongClass: 'Parameter class error; should be: ',
  inProgress: 'Operation already in progress',
  cantChangeIfConnected: 'You can not change value after connecting',
  cantChangeUserId: 'You can not change the userId property',
  alreadySent: 'Already sent or sending',
  contentRequired: 'MessagePart requires rich content for this call',
  alreadyDestroyed: 'This object has already been destroyed',
  deletionModeUnsupported: 'Call to deletion was made with an unsupported deletion mode',
  sessionAndUserRequired: 'connectWithSession requires both a userId and a sessionToken',
  invalidUserIdChange: 'The prn field in the Identity Token must match the requested UserID',
  predicateNotSupported: 'The predicate is not supported for this value of model',
  invalidPredicate: 'The predicate does not match the expected format',
  appIdImmutable: 'The appId property cannot be changed',
  clientMustBeReady: 'The Client must have triggered its "ready" event before you can call this',
  modelImmutable: 'The model property cannot be changed',
  valueNotSupported: 'The value provided is not a supported value',
  permissionDenied: 'Operation not allowed on that object',
  adapterError: 'You must call Layer.init() before you can use an adapter'
};

module.exports = _namespace2.default.LayerError = LayerError;