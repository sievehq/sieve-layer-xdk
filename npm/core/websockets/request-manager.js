/**
 * @class  Layer.Core.Websockets.RequestManager
 * @private
 *
 * This class allows one to send requests to the websocket server, and provide a callback,
 * And have that callback either called by the correct websocket server response, or
 * be called with a timeout.
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); 


var _settings = require('../../settings');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _layerError = require('../layer-error');

var _layerError2 = _interopRequireDefault(_layerError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Wait 15 seconds for a response and then give up
var DELAY_UNTIL_TIMEOUT = 15 * 1000;

var WebsocketRequestManager = function () {
  /**
   * Create a new websocket change manager
   *
   *      var websocketRequestManager = new Layer.Core.RequestManager({
   *          socketManager: client.Websockets.SocketManager
   *      });
   *
   * @method
   * @param  {Object} options
   * @param {Layer.Core.Websockets.SocketManager} socketManager
   * @returns {Layer.Core.Websockets.RequestManager}
   */
  function WebsocketRequestManager(options) {
    _classCallCheck(this, WebsocketRequestManager);

    this.socketManager = options.socketManager;
    this.socketManager.on({
      message: this._handleResponse,
      disconnected: this._reset
    }, this);

    this._requestCallbacks = {};
  }

  /**
   * Reset all requests we are waiting for responses to.
   *
   * @method _reset
   * @private
   */


  _createClass(WebsocketRequestManager, [{
    key: '_reset',
    value: function _reset() {
      this._requestCallbacks = {};
    }

    /**
     * This is an imprecise method; it will cancel ALL requests of a given type.
     *
     * @method cancelOperation
     * @param {String} methodName    `Message.create`, `Event.sync`, etc...
     */

  }, {
    key: 'cancelOperation',
    value: function cancelOperation(methodName) {
      var _this = this;

      Object.keys(this._requestCallbacks).forEach(function (key) {
        var requestConfig = _this._requestCallbacks[key];
        if (requestConfig.method === methodName) delete _this._requestCallbacks[key];
      });
    }

    /**
     * Handle a response to a request.
     *
     * @method _handleResponse
     * @private
     * @param  {Layer.Core.LayerEvent} evt
     */

  }, {
    key: '_handleResponse',
    value: function _handleResponse(evt) {
      if (evt.data.type === 'response') {
        var msg = evt.data.body;
        var requestId = msg.request_id;
        _utils.logger.debug('Websocket response ' + requestId + ' ' + (msg.success ? 'Successful' : 'Failed'));

        if (requestId && this._requestCallbacks[requestId]) {
          this._processResponse(requestId, evt);
        }
      }
    }

    /**
     * Process a response to a request; used by _handleResponse.
     *
     * Refactored out of _handleResponse so that unit tests can easily
     * use it to trigger completion of a request.
     *
     * @method _processResponse
     * @private
     * @param {String} requestId
     * @param {Object} evt   Data from the server
     */

  }, {
    key: '_processResponse',
    value: function _processResponse(requestId, evt) {
      var request = this._requestCallbacks[requestId];
      var msg = evt.data.body;
      var data = (msg.success ? msg.data : new _layerError2.default(msg.data)) || {};

      if (msg.success) {
        if (request.isChangesArray) {
          this._handleChangesArray(data.changes);
        }
        if ('batch' in data) {
          request.batchTotal = data.batch.count;
          request.batchIndex = data.batch.index;
          if (request.isChangesArray) {
            request.results = request.results.concat(data.changes);
          } else if ('results' in data && Array.isArray(data.results)) {
            request.results = request.results.concat(data.results);
          }
          if (data.batch.index < data.batch.count - 1) return;
        }
      }
      request.callback({
        success: msg.success,
        fullData: 'batch' in data ? request.results : evt.data,
        data: data
      });
      delete this._requestCallbacks[requestId];
    }

    /**
     * Any request that contains an array of changes should deliver each change
     * to the socketChangeManager.
     *
     * @method _handleChangesArray
     * @private
     * @param {Object[]} changes   "create", "update", and "delete" requests from server.
     */

  }, {
    key: '_handleChangesArray',
    value: function _handleChangesArray(changes) {
      changes.forEach(function (change) {
        return _settings.client.socketChangeManager._processChange(change);
      });
    }

    /**
     * Shortcut for sending a request; builds in handling for callbacks
     *
     *    manager.sendRequest({
     *      data: {
     *        operation: "delete",
     *        object: {id: "layer:///conversations/uuid"},
     *        data: {deletion_mode: "all_participants"}
     *      },
     *      callback: function(result) {
     *        alert(result.success ? "Yay" : "Boo");
     *      },
     *      isChangesArray: false
     *    });
     *
     * @method sendRequest
     * @param  {Object} options
     * @param  {Object} options.data                     Data to send to the server
     * @param  {Function} [options.callback=null]       Handler for success/failure callback
     * @param  {Boolean} [options.isChangesArray=false] Response contains a changes array that can be fed directly to change-manager.
     * @returns the request callback object if there is one; primarily for use in testing.
     */

  }, {
    key: 'sendRequest',
    value: function sendRequest(_ref) {
      var data = _ref.data,
          callback = _ref.callback,
          _ref$isChangesArray = _ref.isChangesArray,
          isChangesArray = _ref$isChangesArray === undefined ? false : _ref$isChangesArray;

      if (!this._isOpen()) {
        return !callback ? undefined : callback(new _layerError2.default({
          success: false,
          data: { id: 'not_connected', code: 0, message: 'WebSocket not connected' }
        }));
      }
      var body = _utils2.default.clone(data);
      body.request_id = 'r' + this._nextRequestId++;
      _utils.logger.debug('Request ' + body.request_id + ' is sending');
      if (callback) {
        this._requestCallbacks[body.request_id] = {
          request_id: body.request_id,
          date: Date.now(),
          callback: callback,
          isChangesArray: isChangesArray,
          method: data.method,
          batchIndex: -1,
          batchTotal: -1,
          results: []
        };
      }

      this.socketManager.send({
        type: 'request',
        body: body
      });
      this._scheduleCallbackCleanup();
      if (body.request_id) return this._requestCallbacks[body.request_id];
    }

    /**
     * Flags a request as having failed if no response within 2 minutes
     *
     * @method _scheduleCallbackCleanup
     * @private
     */

  }, {
    key: '_scheduleCallbackCleanup',
    value: function _scheduleCallbackCleanup() {
      if (!this._callbackCleanupId) {
        this._callbackCleanupId = setTimeout(this._runCallbackCleanup.bind(this), DELAY_UNTIL_TIMEOUT + 50);
      }
    }

    /**
     * Calls callback with an error.
     *
     * NOTE: Because we call requests that expect responses serially instead of in parallel,
     * currently there should only ever be a single entry in _requestCallbacks.  This may change in the future.
     *
     * @method _runCallbackCleanup
     * @private
     */

  }, {
    key: '_runCallbackCleanup',
    value: function _runCallbackCleanup() {
      var _this2 = this;

      this._callbackCleanupId = 0;
      // If the websocket is closed, ignore all callbacks.  The Sync Manager will reissue these requests as soon as it gets
      // a 'connected' event... they have not failed.  May need to rethink this for cases where third parties are directly
      // calling the websocket manager bypassing the sync manager.
      if (this.isDestroyed || !this._isOpen()) return;
      var count = 0;
      var abort = false;
      var now = Date.now();
      Object.keys(this._requestCallbacks).forEach(function (requestId) {
        var callbackConfig = _this2._requestCallbacks[requestId];
        if (abort) return;

        // If the request hasn't expired, we'll need to reschedule callback cleanup; else if its expired...
        if (callbackConfig && now < callbackConfig.date + DELAY_UNTIL_TIMEOUT) {
          count++;
        }

        // If there has been no data from the server, there's probably a problem with the websocket; reconnect.
        else if (now > _this2.socketManager._lastDataFromServerTimestamp + DELAY_UNTIL_TIMEOUT) {
            // Retrying isn't currently handled here; its handled by the caller (typically sync-manager); so clear out all requests,
            // notifying the callers that they have failed.
            abort = true;
            _this2._failAll();
            _this2.socketManager._reconnect(false);
          } else {
            // The request isn't responding and the socket is good; fail the request.
            _this2._timeoutRequest(requestId);
          }
      });
      if (count) this._scheduleCallbackCleanup();
    }

    /**
     * Any requests that have not had responses are considered as failed if we disconnect without a response.
     *
     * Call all callbacks with a `server_unavailable` error.  The caller may retry,
     * but this component does not have built-in retry.
     *
     * @method _failAll
     * @private
     */

  }, {
    key: '_failAll',
    value: function _failAll() {
      var _this3 = this;

      Object.keys(this._requestCallbacks).forEach(function (requestId) {
        try {
          _utils.logger.warn('Websocket request aborted due to reconnect');
          _this3._requestCallbacks[requestId].callback({
            success: false,
            status: 503,
            data: new _layerError2.default({
              id: 'socket_dead',
              message: 'Websocket appears to be dead. Reconnecting.',
              url: 'https:/developer.layer.com/docs/websdk',
              code: 0,
              status: 503,
              httpStatus: 503
            })
          });
        } catch (err) {
          // Do nothing
        }
        delete _this3._requestCallbacks[requestId];
      });
    }
  }, {
    key: '_timeoutRequest',
    value: function _timeoutRequest(requestId) {
      try {
        _utils.logger.warn('Websocket request timeout');
        this._requestCallbacks[requestId].callback({
          success: false,
          data: new _layerError2.default({
            id: 'request_timeout',
            message: 'The server is not responding. We know how much that sucks.',
            url: 'https:/developer.layer.com/docs/websdk',
            code: 0,
            status: 408,
            httpStatus: 408
          })
        });
      } catch (err) {
        // Do nothing
      }
      delete this._requestCallbacks[requestId];
    }
  }, {
    key: '_isOpen',
    value: function _isOpen() {
      return this.socketManager._isOpen();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.isDestroyed = true;
      if (this._callbackCleanupId) clearTimeout(this._callbackCleanupId);
      this._requestCallbacks = null;
    }
  }]);

  return WebsocketRequestManager;
}();

WebsocketRequestManager.prototype._nextRequestId = 1;

WebsocketRequestManager.prototype._requestCallbacks = null;

WebsocketRequestManager.prototype._callbackCleanupId = 0;

WebsocketRequestManager.prototype.socketManager = null;

module.exports = _namespace2.default.Websockets.RequestManager = WebsocketRequestManager;