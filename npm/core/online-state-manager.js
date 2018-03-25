/**
 * This class manages a state variable for whether we are online/offline, triggers events
 * when the state changes, and determines when to perform tests to validate our online status.
 *
 * It performs the following tasks:
 *
 * 1. Any time we go more than this.pingFrequency (100 seconds) without any data from the server, flag us as being offline.
 *    Rationale: The websocket manager is calling `getCounter` every 30 seconds; so it would have had to fail to get any response
 *    3 times before we give up.
 * 2. While we are offline, ping the server until we determine we are in fact able to connect to the server
 * 3. Any time there is a browser `online` or `offline` event, check to see if we can in fact reach the server.  Do not trust either event to be wholly accurate.
 *    We may be online, but still unable to reach any services.  And Chrome tabs in our tests have shown `navigator.onLine` to sometimes be `false` even while connected.
 * 4. Trigger events `connected` and `disconnected` to let the rest of the system know when we are/are not connected.
 *    NOTE: The Websocket manager will use that to reconnect its websocket, and resume its `getCounter` call every 30 seconds.
 *
 * NOTE: Apps that want to be notified of changes to online/offline state should see Layer.Core.Client's `online` event.
 *
 * NOTE: One iteration of this class treated navigator.onLine = false as fact.  If onLine is false, then we don't need to test
 * anything.  If its true, then this class verifies it can reach layer's servers.  However, https://code.google.com/p/chromium/issues/detail?id=277372 has replicated multiple times in chrome; this bug causes one tab of chrome to have navigator.onLine=false while all other tabs
 * correctly report navigator.onLine=true.  As a result, we can't rely on this value and this class must continue to poll the server while
 * offline and to ignore values from navigator.onLine.  Future Work: Allow non-chrome browsers to use navigator.onLine.
 *
 * @class  Layer.Core.OnlineStateManager
 * @private
 * @extends Layer.Core.Root
 *
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _settings = require('../settings');

var _namespace = require('./namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('./root');

var _root2 = _interopRequireDefault(_root);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _constants = require('../constants');

var _version = require('../version');

var _version2 = _interopRequireDefault(_version);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var OnlineStateManager = function (_Root) {
  _inherits(OnlineStateManager, _Root);

  /**
   * Creates a new OnlineStateManager.
   *
   * An Application is expected to only have one of these.
   *
   *      var onlineStateManager = new Layer.Core.OnlineStateManager({
   *          socketManager: socketManager,
   *      });
   *
   * @method constructor
   * @param  {Object} options
   * @param  {Layer.Core.Websockets.SocketManager} options.socketManager - A websocket manager to monitor for messages
   */
  function OnlineStateManager(options) {
    _classCallCheck(this, OnlineStateManager);

    // Listen to all xhr events and websocket messages for online-status info
    var _this = _possibleConstructorReturn(this, (OnlineStateManager.__proto__ || Object.getPrototypeOf(OnlineStateManager)).call(this, options));

    _utils.xhr.addConnectionListener(function (evt) {
      return _this._connectionListener(evt);
    });
    _this.socketManager.on('message', function () {
      return _this._connectionListener({ status: 'connection:success' });
    }, _this);

    // Any change in online status reported by the browser should result in
    // an immediate update to our online/offline state
    /* istanbul ignore else */
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', _this._handleOnlineEvent.bind(_this));
      window.addEventListener('offline', _this._handleOnlineEvent.bind(_this));
    } else {
      var OnlineEvents = global.getNativeSupport('OnlineEvents');
      if (OnlineEvents) {
        OnlineEvents.addEventListener('change', _this._handleOnlineEvent.bind(_this));
      }
    }
    return _this;
  }

  /**
   * We don't actually start managing our online state until after the client has authenticated.
   * Call start() when we are ready for the client to start managing our state.
   *
   * The client won't call start() without first validating that we have a valid session, so by definition,
   * calling start means we are online.
   *
   * @method start
   */


  _createClass(OnlineStateManager, [{
    key: 'start',
    value: function start() {
      _utils.logger.info('OnlineStateManager: start');
      this.isClientReady = true;
      this.isOnline = true;

      this.checkOnlineStatus();
    }

    /**
     * If the client becomes unauthenticated, stop checking if we are online, and announce that we are offline.
     *
     * @method stop
     */

  }, {
    key: 'stop',
    value: function stop() {
      _utils.logger.info('OnlineStateManager: stop');
      this.isClientReady = false;
      this._clearCheck();
      this._changeToOffline();
    }

    /**
     * Schedules our next call to _onlineExpired if online or checkOnlineStatus if offline.
     *
     * @method _scheduleNextOnlineCheck
     * @private
     */

  }, {
    key: '_scheduleNextOnlineCheck',
    value: function _scheduleNextOnlineCheck(connectionFailure, callback) {
      _utils.logger.debug('OnlineStateManager: skip schedule');
      if (this.isDestroyed || !this.isClientReady) return;

      // Replace any scheduled calls with the newly scheduled call:
      this._clearCheck();

      // If this is called while we are online, then we are using this to detect when we've gone without data for more than pingFrequency.
      // Call this._onlineExpired after pingFrequency of no server responses.
      if (!connectionFailure && this.isOnline) {
        _utils.logger.debug('OnlineStateManager: Scheduled onlineExpired');
        this.onlineCheckId = setTimeout(this._onlineExpired.bind(this), this.pingFrequency);
      }

      // If this is called while we are offline, we're doing exponential backoff pinging the server to see if we've come back online.
      else {
          _utils.logger.info('OnlineStateManager: Scheduled checkOnlineStatus');
          var duration = _utils2.default.getExponentialBackoffSeconds(this.maxOfflineWait, Math.min(10, this.offlineCounter++));
          this.onlineCheckId = setTimeout(this.checkOnlineStatus.bind(this, callback), Math.floor(duration * 1000));
        }
    }

    /**
     * Cancels any upcoming calls to checkOnlineStatus
     *
     * @method _clearCheck
     * @private
     */

  }, {
    key: '_clearCheck',
    value: function _clearCheck() {
      if (this.onlineCheckId) {
        clearTimeout(this.onlineCheckId);
        this.onlineCheckId = 0;
      }
    }

    /**
     * Respond to the browser's online/offline events.
     *
     * Our response is not to trust them, but to use them as
     * a trigger to indicate we should immediately do our own
     * validation.
     *
     * @method _handleOnlineEvent
     * @private
     * @param  {Event} evt - Browser online/offline event object
     */

  }, {
    key: '_handleOnlineEvent',
    value: function _handleOnlineEvent(evt) {
      // Reset the counter because our first request may fail as they may not be
      // fully connected yet
      this.offlineCounter = 0;
      this.checkOnlineStatus();
    }

    /**
     * Our online state has expired; we are now offline.
     *
     * If this method gets called, it means that our connection has gone too long without any data
     * and is now considered to be disconnected.  Start scheduling tests to see when we are back online.
     *
     * @method _onlineExpired
     * @private
     */

  }, {
    key: '_onlineExpired',
    value: function _onlineExpired() {
      this._clearCheck();
      this._changeToOffline();
      this._scheduleNextOnlineCheck();
    }

    /**
     * Get a nonce to see if we can reach the server.
     *
     * We don't care about the result,
     * we just care about triggering a 'connection:success' or 'connection:error' event
     * which connectionListener will respond to.
     *
     *      client.onlineManager.checkOnlineStatus(function(result) {
     *          alert(result ? 'We're online!' : 'Doh!');
     *      });
     *
     * @method checkOnlineStatus
     * @param {Function} callback
     * @param {boolean} callback.isOnline - Callback is called with true if online, false if not
     */

  }, {
    key: 'checkOnlineStatus',
    value: function checkOnlineStatus(callback) {
      this._clearCheck();

      _utils.logger.info('OnlineStateManager: Firing XHR for online check');
      this._lastCheckOnlineStatus = new Date();
      // Ping the server and see if we're connected.
      (0, _utils.xhr)({
        url: _settings.client.url + '/ping?client=' + _version2.default,
        method: 'HEAD',
        headers: {
          accept: _constants.ACCEPT
        }
      }, function (_ref) {
        var status = _ref.status;

        // this.isOnline will be updated via _connectionListener prior to this line executing
        if (callback) callback(status !== 408);
      });
    }

    /**
     * On determining that we are offline, handles the state transition and logging.
     *
     * @method _changeToOffline
     * @private
     */

  }, {
    key: '_changeToOffline',
    value: function _changeToOffline() {
      if (this.isOnline) {
        this.isOnline = false;
        this.trigger('disconnected');
        _utils.logger.info('OnlineStateManager: Connection lost');
      }
    }

    /**
     * Called whenever a websocket event arrives, or an xhr call completes; updates our isOnline state.
     *
     * Any call to this method will reschedule our next is-online test
     *
     * @method _connectionListener
     * @private
     * @param  {string} evt - Name of the event; either 'connection:success' or 'connection:error'
     */

  }, {
    key: '_connectionListener',
    value: function _connectionListener(evt) {
      var _this2 = this;

      // If event is a success, change us to online
      var failed = evt.status !== 'connection:success';
      if (!failed) {
        var lastTime = this.lastMessageTime;
        this.lastMessageTime = new Date();
        if (!this.isOnline) {
          this.isOnline = true;
          this.offlineCounter = 0;
          this.trigger('connected', { offlineDuration: lastTime ? Date.now() - lastTime : 0 });
          if (this.connectedCounter === undefined) this.connectedCounter = 0;
          this.connectedCounter++;
          _utils.logger.info('OnlineStateManager: Connected restored');
        }
      }

      this._scheduleNextOnlineCheck(failed, function (result) {
        if (!result) _this2._changeToOffline();
      });
    }

    /**
     * Cleanup/shutdown
     *
     * @method destroy
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      this._clearCheck();
      this.socketManager = null;
      _get(OnlineStateManager.prototype.__proto__ || Object.getPrototypeOf(OnlineStateManager.prototype), 'destroy', this).call(this);
    }
  }]);

  return OnlineStateManager;
}(_root2.default);

OnlineStateManager.prototype.isClientReady = false;

/**
 * A Websocket manager whose 'message' event we will listen to
 * in order to know that we are still online.
 * @property {Layer.Core.Websockets.SocketManager}
 */
OnlineStateManager.prototype.socketManager = null;

/**
 * Number of test requests we've been offline for.
 *
 * Will stop growing once the number is suitably large (10-20).
 * @property {Number}
 */
OnlineStateManager.prototype.offlineCounter = 0;

/**
 * Maximum wait during exponential backoff while offline.
 *
 * While offline, exponential backoff is used to calculate how long to wait between checking with the server
 * to see if we are online again. This value determines the maximum wait; any higher value returned by exponential backoff
 * are ignored and this value used instead.
 * Value is measured in seconds.
 * @property {Number}
 */
OnlineStateManager.prototype.maxOfflineWait = 60;

/**
 * Minimum wait between tries in ms.
 * @property {Number}
 */
OnlineStateManager.prototype.minBackoffWait = 100;

/**
 * Time that the last successful message was observed.
 * @property {Date}
 */
OnlineStateManager.prototype.lastMessageTime = null;

/**
 * For debugging, tracks the last time we checked if we are online.
 * @property {Date}
 */
OnlineStateManager.prototype._lastCheckOnlineStatus = null;

/**
 * Are we currently online?
 * @property {Boolean}
 */
OnlineStateManager.prototype.isOnline = false;

/**
 * setTimeoutId for the next checkOnlineStatus() call.
 * @property {Number}
 */
OnlineStateManager.prototype.onlineCheckId = 0;

/**
 * If we are online, how often do we need to ping to verify we are still online.
 *
 * Value is reset any time we observe any messages from the server.
 * Measured in miliseconds. NOTE: Websocket has a separate ping which mostly makes
 * this one unnecessary.  May end up removing this one... though we'd keep the
 * ping for when our state is offline.
 * @property {Number}
 */
OnlineStateManager.prototype.pingFrequency = 100 * 1000;

OnlineStateManager._supportedEvents = [
/**
 * We appear to be online and able to send and receive
 * @event connected
 * @param {number} onlineDuration - Number of miliseconds since we were last known to be online
 */
'connected',

/**
 * We appear to be offline and unable to send or receive
 * @event disconnected
 */
'disconnected'].concat(_root2.default._supportedEvents);
_root2.default.initClass.apply(OnlineStateManager, [OnlineStateManager, 'OnlineStateManager', _namespace2.default]);
module.exports = OnlineStateManager;