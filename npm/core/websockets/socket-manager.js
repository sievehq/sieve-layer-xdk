/**
 * This component manages
 *
 * 1. recieving websocket events
 * 2. Processing them
 * 3. Triggering events on completing them
 * 4. Sending them
 *
 * Applications typically do not interact with this component, but may subscribe
 * to the `message` event if they want richer event information than is available
 * through the Layer.Core.Client class.
 *
 * @class  Layer.Core.Websockets.SocketManager
 * @extends Layer.Core.Root
 * @private
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _settings = require('../../settings');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _layerError = require('../layer-error');

var _constants = require('../../constants');

var _version = require('../../version');

var _version2 = _interopRequireDefault(_version);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var SocketManager = function (_Root) {
  _inherits(SocketManager, _Root);

  /**
   * Create a new websocket manager
   *
   *      var socketManager = new Layer.Core.Websockets.SocketManager({});
   *
   * @method
   * @param  {Object} options
   * @return {Layer.Core.Websockets.SocketManager}
   */
  function SocketManager(options) {
    _classCallCheck(this, SocketManager);

    // Insure that on/off methods don't need to call bind, therefore making it easy
    // to add/remove functions as event listeners.
    var _this = _possibleConstructorReturn(this, (SocketManager.__proto__ || Object.getPrototypeOf(SocketManager)).call(this, options));

    _this._onMessage = _this._onMessage.bind(_this);
    _this._onOpen = _this._onOpen.bind(_this);
    _this._onSocketClose = _this._onSocketClose.bind(_this);
    _this._onError = _this._onError.bind(_this);

    // If the client is authenticated, start it up.
    if (_settings.client.isAuthenticated && _settings.client.onlineManager.isOnline) {
      _this.connect();
    }

    _settings.client.on('online', _this._onlineStateChange, _this);

    // Any time the Client triggers a ready event we need to reconnect.
    _settings.client.on('authenticated', _this.connect, _this);

    _this._lastTimestamp = Date.now();
    return _this;
  }

  /**
   * Call this when we want to reset all websocket state; this would be done after a lengthy period
   * of being disconnected.  This prevents Event.replay from being called on reconnecting.
   *
   * @method _reset
   * @private
   */


  _createClass(SocketManager, [{
    key: '_reset',
    value: function _reset() {
      this._lastTimestamp = 0;
      this._lastDataFromServerTimestamp = 0;
      this._lastCounter = null;
      this._hasCounter = false;

      this._needsReplayFrom = null;
    }

    /**
     * Event handler is triggered any time the client's online state changes.
     * If going online we need to reconnect (i.e. will close any existing websocket connections and then open a new connection)
     * If going offline, close the websocket as its no longer useful/relevant.
     * @method _onlineStateChange
     * @private
     * @param {Layer.Core.LayerEvent} evt
     */

  }, {
    key: '_onlineStateChange',
    value: function _onlineStateChange(evt) {
      if (!_settings.client.isAuthenticated) return;
      if (evt.isOnline) {
        this._reconnect(evt.reset);
      } else {
        _utils.logger.info('Websocket closed due to ambigious connection state');
        this.close();
      }
    }

    /**
     * Reconnect to the server, optionally resetting all data if needed.
     * @method _reconnect
     * @private
     * @param {boolean} reset
     */

  }, {
    key: '_reconnect',
    value: function _reconnect(reset) {
      // The sync manager will reissue any requests once it receives a 'connect' event from the websocket manager.
      // There is no need to have an error callback at this time.
      // Note that calls that come from sources other than the sync manager may suffer from this.
      // Once the websocket implements retry rather than the sync manager, we may need to enable it
      // to trigger a callback after sufficient time.  Just delete all callbacks.
      this.close();
      if (reset) this._reset();
      this.connect();
    }

    /**
     * Connect to the websocket server
     *
     * Note that if you'd like to see how dead websockets are handled, you can try something like this:
     *
     * ```
     * var WS = function WebSocket(url) {
        this.url = url;
        this.close = function() {};
        this.send = function(msg) {console.log("SEND ", msg);};
        this.addEventListener = function(name, callback) {
          this["on" + name] = callback;
        };
        this.removeEventListener = function() {};
        this.readyState = 1;
        setTimeout(function() {this.onopen();}.bind(this), 100);
      };
      WS.CONNECTING = 0;
      WS.OPEN = 1;
      WS.CLOSING = 2;
      WS.CLOSED = 3;
      ```
     *
     * @method connect
     * @param  {Layer.Core.SyncEvent} evt - Ignored parameter
     */

  }, {
    key: 'connect',
    value: function connect(evt) {
      var _this2 = this;

      if (_settings.client.isDestroyed || !_settings.client.isOnline) return;
      if (this._socket) return this._reconnect();

      this._closing = false;

      this._lastCounter = -1;

      // Get the URL and connect to it
      var url = _settings.client.websocketUrl + '/?session_token=' + _settings.client.sessionToken;

      _utils.logger.info('Websocket Connecting');

      // Load up our websocket component or shim
      var WS = WebSocket;

      try {
        this._socket = new WS(url, _constants.WEBSOCKET_PROTOCOL);
      } catch (err) {
        // Errors at this point tend to show up in IE11 during unit tests;
        // slow things down a bit if this is throwing errors as the assumption is that
        // unit tests are opening too many connections.
        _utils.logger.error('Failed to establish websocket ', err);
        setTimeout(function () {
          return _this2._onError();
        }, 1000);
        return;
      }

      // If its the shim, set the event hanlers
      /* istanbul ignore if */
      if (typeof WebSocket === 'undefined') {
        this._socket.onmessage = this._onMessage;
        this._socket.onclose = this._onSocketClose;
        this._socket.onopen = this._onOpen;
        this._socket.onerror = this._onError;
      }

      // If its a real websocket, add the event handlers
      else {
          this._socket.addEventListener('message', this._onMessage);
          this._socket.addEventListener('close', this._onSocketClose);
          this._socket.addEventListener('open', this._onOpen);
          this._socket.addEventListener('error', this._onError);
        }

      // Trigger a failure if it takes >= 5 seconds to establish a connection
      this._connectionFailedId = setTimeout(this._connectionFailed.bind(this), 5000);
    }

    /**
     * Clears the scheduled call to _connectionFailed that is used to insure the websocket does not get stuck
     * in CONNECTING state. This call is used after the call has completed or failed.
     *
     * @method _clearConnectionFailed
     * @private
     */

  }, {
    key: '_clearConnectionFailed',
    value: function _clearConnectionFailed() {
      if (this._connectionFailedId) {
        clearTimeout(this._connectionFailedId);
        this._connectionFailedId = 0;
      }
    }

    /**
     * Called after 5 seconds of entering CONNECTING state without getting an error or a connection.
     * Calls _onError which will cause this attempt to be stopped and another connection attempt to be scheduled.
     *
     * @method _connectionFailed
     * @private
     */

  }, {
    key: '_connectionFailed',
    value: function _connectionFailed() {
      this._connectionFailedId = 0;
      var msg = 'Websocket failed to connect to server';
      _utils.logger.warn(msg);

      // TODO: At this time there is little information on what happens when closing a websocket connection that is stuck in
      // readyState=CONNECTING.  Does it throw an error?  Does it call the onClose or onError event handlers?
      // Remove all event handlers so that calling close won't trigger any calls.
      try {
        this.isOpen = false;
        this._removeSocketEvents();
        if (this._socket) {
          this._socket.close();
          this._socket = null;
        }
      } catch (e) {}
      // No-op


      // Now we can call our error handler.
      this._onError(new Error(msg));
    }

    /**
     * The websocket connection is reporting that its now open.
     *
     * @method _onOpen
     * @private
     */

  }, {
    key: '_onOpen',
    value: function _onOpen() {
      this._clearConnectionFailed();
      if (this._isOpen()) {
        this._lostConnectionCount = 0;
        this.isOpen = true;
        this.trigger('connected');
        _utils.logger.debug('Websocket Connected');
        if (this._hasCounter && this._lastTimestamp) {
          this.resync(this._lastTimestamp);
        } else {
          this._enablePresence();
          this._reschedulePing();
        }
      }
    }

    /**
     * Tests to see if the websocket connection is open.  Use the isOpen property
     * for external tests.
     * @method _isOpen
     * @private
     * @returns {Boolean}
     */

  }, {
    key: '_isOpen',
    value: function _isOpen() {
      if (!this._socket) return false;
      /* istanbul ignore if */
      if (typeof WebSocket === 'undefined') return true;
      return this._socket && this._socket.readyState === WebSocket.OPEN;
    }

    /**
     * If not isOpen, presumably failed to connect
     * Any other error can be ignored... if the connection has
     * failed, onClose will handle it.
     *
     * @method _onError
     * @private
     * @param  {Error} err - Websocket error
     */

  }, {
    key: '_onError',
    value: function _onError(err) {
      if (this._closing) return;
      this._clearConnectionFailed();
      _utils.logger.debug('Websocket Error causing websocket to close', err);
      if (!this.isOpen) {
        this._removeSocketEvents();
        this._lostConnectionCount++;
        this._scheduleReconnect();
      } else {
        this._onSocketClose();
        this._socket.close();
        this._socket = null;
      }
    }

    /**
     * Shortcut method for sending a signal
     *
     *    manager.sendSignal({
            'type': 'typing_indicator',
            'object': {
              'id': this.conversation.id
            },
            'data': {
              'action': state
            }
          });
     *
     * @method sendSignal
     * @param  {Object} body - Signal body
     */

  }, {
    key: 'sendSignal',
    value: function sendSignal(body) {
      if (this._isOpen()) {
        this._socket.send(JSON.stringify({
          type: 'signal',
          body: body
        }));
      }
    }

    /**
     * Shortcut to sending a Counter.read request
     *
     * @method getCounter
     * @param  {Function} callback
     * @param {boolean} callback.success
     * @param {number} callback.lastCounter
     * @param {number} callback.newCounter
     */

  }, {
    key: 'getCounter',
    value: function getCounter(_callback) {
      var _this3 = this;

      var tooSoon = Date.now() - this._lastGetCounterRequest < 1000;
      if (tooSoon) {
        if (!this._lastGetCounterId) {
          this._lastGetCounterId = setTimeout(function () {
            _this3._lastGetCounterId = 0;
            _this3.getCounter(_callback);
          }, Date.now() - this._lastGetCounterRequest - 1000);
        }
        return;
      }
      this._lastGetCounterRequest = Date.now();
      if (this._lastGetCounterId) {
        clearTimeout(this._lastGetCounterId);
        this._lastGetCounterId = 0;
      }

      _utils.logger.debug('Websocket request: getCounter');
      _settings.client.socketRequestManager.sendRequest({
        data: {
          method: 'Counter.read'
        },
        callback: function callback(result) {
          _utils.logger.debug('Websocket response: getCounter ' + result.data.counter);
          if (_callback) {
            if (result.success) {
              _callback(true, result.data.counter, result.fullData.counter);
            } else {
              _callback(false);
            }
          }
        },
        isChangesArray: false
      });
    }

    /**
     * Replays all missed change packets since the specified timestamp
     *
     * @method resync
     * @param  {string|number}   timestamp - Iso formatted date string; if number will be transformed into formatted date string.
     * @param  {Function} [callback] - Optional callback for completion
     */

  }, {
    key: 'resync',
    value: function resync(timestamp, callback) {
      var _this4 = this;

      if (!timestamp) throw new Error(_layerError.ErrorDictionary.valueNotSupported);
      if (typeof timestamp === 'number') timestamp = new Date(timestamp).toISOString();

      // Cancel any prior operation; presumably we lost connection and they're dead anyways,
      // but the callback triggering on these could be disruptive.
      _settings.client.socketRequestManager.cancelOperation('Event.replay');
      _settings.client.socketRequestManager.cancelOperation('Presence.sync');
      this._replayEvents(timestamp, function () {
        _this4._enablePresence(timestamp, function () {
          _this4.trigger('synced');
          if (callback) callback();
        });
      });
    }

    /**
     * Replays all missed change packets since the specified timestamp
     *
     * @method _replayEvents
     * @private
     * @param  {string|number}   timestamp - Iso formatted date string; if number will be transformed into formatted date string.
     * @param  {Function} [callback] - Optional callback for completion
     */

  }, {
    key: '_replayEvents',
    value: function _replayEvents(timestamp, _callback2) {
      var _this5 = this;

      // If we are simply unable to replay because we're disconnected, capture the _needsReplayFrom
      if (!this._isOpen() && !this._needsReplayFrom) {
        _utils.logger.debug('Websocket request: _replayEvents updating _needsReplayFrom');
        this._needsReplayFrom = timestamp;
      } else {
        _utils.logger.info('Websocket request: _replayEvents');
        _settings.client.socketRequestManager.sendRequest({
          data: {
            method: 'Event.replay',
            data: {
              from_timestamp: timestamp
            }
          },
          callback: function callback(result) {
            return _this5._replayEventsComplete(timestamp, _callback2, result.success);
          },
          isChangesArray: false
        });
      }
    }

    /**
     * Callback for handling completion of replay.
     *
     * @method _replayEventsComplete
     * @private
     * @param  {Date}     timestamp
     * @param  {Function} callback
     * @param  {Boolean}   success
     */

  }, {
    key: '_replayEventsComplete',
    value: function _replayEventsComplete(timestamp, callback, success) {
      var _this6 = this;

      if (success) {
        this._replayRetryCount = 0;

        // If replay was completed, and no other requests for replay, then we're done.
        if (!this._needsReplayFrom) {
          _utils.logger.info('Websocket replay complete');
          if (callback) callback();
        }

        // If replayEvents was called during a replay, then replay
        // from the given timestamp.  If request failed, then we need to retry from _lastTimestamp
        else if (this._needsReplayFrom) {
            _utils.logger.info('Websocket replay partially complete');
            var t = this._needsReplayFrom;
            this._needsReplayFrom = null;
            this._replayEvents(t);
          }
      }

      // We never got a done event; but either got an error from the server or the request timed out.
      // Use exponential backoff incremented integers that getExponentialBackoffSeconds mapping to roughly
      // 0.4 seconds - 12.8 seconds, and then stops retrying.
      else if (this._replayRetryCount < 8) {
          var maxDelay = 20;
          var delay = _utils2.default.getExponentialBackoffSeconds(maxDelay, Math.min(15, this._replayRetryCount + 2));
          _utils.logger.info('Websocket replay retry in ' + delay + ' seconds');
          setTimeout(function () {
            return _this6._replayEvents(timestamp);
          }, delay * 1000);
          this._replayRetryCount++;
        } else {
          _utils.logger.error('Websocket Event.replay has failed');
        }
    }

    /**
     * Resubscribe to presence and replay missed presence changes.
     *
     * @method _enablePresence
     * @private
     * @param  {Date}     timestamp
     * @param  {Function} callback
     */

  }, {
    key: '_enablePresence',
    value: function _enablePresence(timestamp, callback) {
      _settings.client.socketRequestManager.sendRequest({
        data: {
          method: 'Presence.subscribe'
        },
        callback: null,
        isChangesArray: false
      });

      if (_settings.client.isPresenceEnabled) {
        _settings.client.socketRequestManager.sendRequest({
          data: {
            method: 'Presence.update',
            data: [{ operation: 'set', property: 'status', value: 'auto' }]
          },
          callback: null,
          isChangesArray: false
        });
      }

      if (timestamp) {
        this.syncPresence(timestamp, callback);
      } else if (callback) {
        callback({ success: true });
      }
    }

    /**
     * Synchronize all presence data or catch up on missed presence data.
     *
     * Typically this is called by {@link Layer.Core.Websockets.SocketManager#_enablePresence} automatically,
     * but there may be occasions where an app wants to directly trigger this action.
     *
     * @method syncPresence
     * @param {String} timestamp    `Date.toISOString()` formatted string, returns all presence changes since that timestamp.  Returns all followed presence
     *       if no timestamp is provided.
     * @param {Function} [callback]   Function to call when sync is completed.
     */

  }, {
    key: 'syncPresence',
    value: function syncPresence(timestamp, callback) {
      if (timestamp) {
        // Return value for use in unit tests
        return _settings.client.socketRequestManager.sendRequest({
          data: {
            method: 'Presence.sync',
            data: {
              since: timestamp
            }
          },
          isChangesArray: true,
          callback: callback
        });
      }
    }

    /**
     * Handles a new websocket packet from the server
     *
     * @method _onMessage
     * @private
     * @param  {Object} evt - Message from the server
     */

  }, {
    key: '_onMessage',
    value: function _onMessage(evt) {
      this._lostConnectionCount = 0;
      try {
        var msg = JSON.parse(evt.data);
        var skippedCounter = this._lastCounter + 1 !== msg.counter;
        this._hasCounter = true;
        this._lastCounter = msg.counter;
        this._lastDataFromServerTimestamp = Date.now();

        // If we've missed a counter, replay to get; note that we had to update _lastCounter
        // for replayEvents to work correctly.
        if (skippedCounter) {
          this.resync(this._lastTimestamp);
        } else {
          this._lastTimestamp = new Date(msg.timestamp).getTime();
        }

        this.trigger('message', {
          data: msg
        });

        this._reschedulePing();
      } catch (err) {
        _utils.logger.error('Layer-Websocket: Failed to handle websocket message: ' + err + '\n', evt.data);
      }
    }

    /**
     * Reschedule a ping request which helps us verify that the connection is still alive,
     * and that we haven't missed any events.
     *
     * @method _reschedulePing
     * @private
     */

  }, {
    key: '_reschedulePing',
    value: function _reschedulePing() {
      if (this._nextPingId) {
        clearTimeout(this._nextPingId);
      }
      this._nextPingId = setTimeout(this._ping.bind(this), this.pingFrequency);
    }

    /**
     * Send a counter request to the server to verify that we are still connected and
     * have not missed any events.
     *
     * @method _ping
     * @private
     */

  }, {
    key: '_ping',
    value: function _ping() {
      _utils.logger.debug('Websocket ping');
      this._nextPingId = 0;
      if (this._isOpen()) {
        // NOTE: onMessage will already have called reschedulePing, but if there was no response, then the error handler would NOT have called it.
        this.getCounter(this._reschedulePing.bind(this));
      }
    }

    /**
     * Close the websocket.
     *
     * @method close
     */

  }, {
    key: 'close',
    value: function close() {
      _utils.logger.debug('Websocket close requested');
      this._closing = true;
      this.isOpen = false;
      if (this._socket) {
        // Close all event handlers and set socket to null
        // without waiting for browser event to call
        // _onSocketClose as the next command after close
        // might require creating a new socket
        this._onSocketClose();
        this._socket.close();
        this._socket = null;
      }
    }

    /**
     * Send a packet across the websocket
     * @method send
     * @param {Object} obj
     */

  }, {
    key: 'send',
    value: function send(obj) {
      this._socket.send(JSON.stringify(obj));
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.close();
      if (this._nextPingId) clearTimeout(this._nextPingId);
      _get(SocketManager.prototype.__proto__ || Object.getPrototypeOf(SocketManager.prototype), 'destroy', this).call(this);
    }

    /**
     * If the socket has closed (or if the close method forces it closed)
     * Remove all event handlers and if appropriate, schedule a retry.
     *
     * @method _onSocketClose
     * @private
     */

  }, {
    key: '_onSocketClose',
    value: function _onSocketClose() {
      _utils.logger.debug('Websocket closed');
      this.isOpen = false;
      if (!this._closing) {
        this._scheduleReconnect();
      }

      this._removeSocketEvents();
      this.trigger('disconnected');
    }

    /**
     * Removes all event handlers on the current socket.
     *
     * @method _removeSocketEvents
     * @private
     */

  }, {
    key: '_removeSocketEvents',
    value: function _removeSocketEvents() {
      /* istanbul ignore if */
      if (typeof WebSocket !== 'undefined' && this._socket) {
        this._socket.removeEventListener('message', this._onMessage);
        this._socket.removeEventListener('close', this._onSocketClose);
        this._socket.removeEventListener('open', this._onOpen);
        this._socket.removeEventListener('error', this._onError);
      } else if (this._socket) {
        this._socket.onmessage = null;
        this._socket.onclose = null;
        this._socket.onopen = null;
        this._socket.onerror = null;
      }
      this._clearConnectionFailed();
    }

    /**
     * Schedule an attempt to reconnect to the server.  If the onlineManager
     * declares us to be offline, don't bother reconnecting.  A reconnect
     * attempt will be triggered as soon as the online manager reports we are online again.
     *
     * Note that the duration of our delay can not excede the onlineManager's ping frequency
     * or it will declare us to be offline while we attempt a reconnect.
     *
     * @method _scheduleReconnect
     * @private
     */

  }, {
    key: '_scheduleReconnect',
    value: function _scheduleReconnect() {
      var _this7 = this;

      if (this.isDestroyed || !_settings.client || !_settings.client.isOnline || !_settings.client.isAuthenticated || this._isOpen()) return;

      var delay = _utils2.default.getExponentialBackoffSeconds(this.maxDelaySecondsBetweenReconnect, Math.min(15, this._lostConnectionCount));
      _utils.logger.debug('Websocket Reconnect in ' + delay + ' seconds');
      if (!this._reconnectId) {
        this._reconnectId = setTimeout(function () {
          _this7._reconnectId = 0;
          _this7._validateSessionBeforeReconnect();
        }, delay * 1000);
      }
    }

    /**
     * Before the scheduled reconnect can call `connect()` validate that we didn't lose the websocket
     * due to loss of authentication.
     *
     * @method _validateSessionBeforeReconnect
     * @private
     */

  }, {
    key: '_validateSessionBeforeReconnect',
    value: function _validateSessionBeforeReconnect() {
      var _this8 = this;

      if (this.isDestroyed || !_settings.client.isOnline || !_settings.client.isAuthenticated || this._isOpen()) return;

      var maxDelay = this.maxDelaySecondsBetweenReconnect * 1000;
      var diff = Date.now() - this._lastValidateSessionRequest - maxDelay;
      if (diff < 0) {
        // This is identical to whats in _scheduleReconnect and could be cleaner
        if (!this._reconnectId) {
          this._reconnectId = setTimeout(function () {
            _this8._reconnectId = 0;
            _this8._validateSessionBeforeReconnect();
          }, Math.abs(diff) + 1000);
        }
      } else {
        this._lastValidateSessionRequest = Date.now();
        _settings.client.xhr({
          url: '/?action=validateConnectionForWebsocket&client=' + _version2.default,
          method: 'GET',
          sync: false
        }, function (result) {
          if (result.success) _this8.connect();
          if (result.status === 401) {
            // client-authenticator.js captures this state and handles it; `connect()` will be called once reauthentication completes
          } else {
            _this8._scheduleReconnect();
          }
        });
      }
    }
  }]);

  return SocketManager;
}(_root2.default);

/**
 * Is the websocket connection currently open?
 * @property {Boolean}
 */


SocketManager.prototype.isOpen = false;

/**
 * setTimeout ID for calling connect()
 * @private
 * @property {Number}
 */
SocketManager.prototype._reconnectId = 0;

/**
 * setTimeout ID for calling _connectionFailed()
 * @private
 * @property {Number}
 */
SocketManager.prototype._connectionFailedId = 0;

SocketManager.prototype._lastTimestamp = 0;
SocketManager.prototype._lastDataFromServerTimestamp = 0;
SocketManager.prototype._lastCounter = null;
SocketManager.prototype._hasCounter = false;

SocketManager.prototype._needsReplayFrom = null;

SocketManager.prototype._replayRetryCount = 0;

SocketManager.prototype._lastGetCounterRequest = 0;
SocketManager.prototype._lastGetCounterId = 0;

/**
 * Time in miliseconds since the last call to _validateSessionBeforeReconnect
 * @property {Number}
 */
SocketManager.prototype._lastValidateSessionRequest = 0;

/**
 * Frequency with which the websocket checks to see if any websocket notifications
 * have been missed.  This test is done by calling `getCounter`
 *
 * @property {Number}
 */
SocketManager.prototype.pingFrequency = 30000;

/**
 * Delay between reconnect attempts
 *
 * @property {Number}
 */
SocketManager.prototype.maxDelaySecondsBetweenReconnect = 30;

/**
 * The Socket Connection instance
 * @property {Websocket}
 */
SocketManager.prototype._socket = null;

/**
 * Is the websocket connection being closed by a call to close()?
 * If so, we can ignore any errors that signal the socket as closing.
 * @property {Boolean}
 */
SocketManager.prototype._closing = false;

/**
 * Number of failed attempts to reconnect.
 * @property {Number}
 */
SocketManager.prototype._lostConnectionCount = 0;

SocketManager._supportedEvents = [
/**
 * A data packet has been received from the server.
 * @event message
 * @param {Layer.Core.LayerEvent} layerEvent
 * @param {Object} layerEvent.data - The data that was received from the server
 */
'message',

/**
 * The websocket is now connected.
 * @event connected
 * @protected
 */
'connected',

/**
 * The websocket is no longer connected
 * @event disconnected
 * @protected
 */
'disconnected',

/**
 * Websocket events were missed; we are resyncing with the server
 * @event replay-begun
 */
'syncing',

/**
 * Websocket events were missed; we resynced with the server and are now done
 * @event replay-begun
 */
'synced'].concat(_root2.default._supportedEvents);
_root2.default.initClass.apply(SocketManager, [SocketManager, 'SocketManager', _namespace2.default.Websockets]);
module.exports = SocketManager;