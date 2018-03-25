/**
 * Layer Client.  Access the layer by calling create and receiving it
 * from the "ready" callback.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 var client = Layer.init({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   appId: "layer:///apps/staging/ffffffff-ffff-ffff-ffff-ffffffffffff",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   isTrustedDevice: false,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   challenge: function(evt) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     myAuthenticator({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       nonce: evt.nonce,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       onSuccess: evt.callback
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   ready: function(client) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     alert("Yay, I finally got my client!");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 }).connect("sampleuserId");
 * The Layer Client/ClientAuthenticator classes have been divided into:
 *
 * 1. ClientAuthenticator: Manages all authentication and connectivity related issues
 * 2. Client: Manages access to Conversations, Queries, Messages, Events, etc...
 *
 * @class Layer.Core.ClientAuthenticator
 * @private
 * @extends Layer.Core.Root
 * @author Michael Kantor
 *
 */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _namespace = require('./namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('./root');

var _root2 = _interopRequireDefault(_root);

var _socketManager = require('./websockets/socket-manager');

var _socketManager2 = _interopRequireDefault(_socketManager);

var _changeManager = require('./websockets/change-manager');

var _changeManager2 = _interopRequireDefault(_changeManager);

var _requestManager = require('./websockets/request-manager');

var _requestManager2 = _interopRequireDefault(_requestManager);

var _layerError = require('./layer-error');

var _layerError2 = _interopRequireDefault(_layerError);

var _onlineStateManager = require('./online-state-manager');

var _onlineStateManager2 = _interopRequireDefault(_onlineStateManager);

var _syncManager = require('./sync-manager');

var _syncManager2 = _interopRequireDefault(_syncManager);

var _identity = require('./models/identity');

var _identity2 = _interopRequireDefault(_identity);

var _syncEvent = require('./sync-event');

var _constants = require('../constants');

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 
// Optional Component


var MAX_XHR_RETRIES = 3;

var ClientAuthenticator = function (_Root) {
  _inherits(ClientAuthenticator, _Root);

  function ClientAuthenticator() {
    _classCallCheck(this, ClientAuthenticator);

    return _possibleConstructorReturn(this, (ClientAuthenticator.__proto__ || Object.getPrototypeOf(ClientAuthenticator)).apply(this, arguments));
  }

  _createClass(ClientAuthenticator, [{
    key: '_initComponents',


    /**
     * Create a new Client.
     *
     * This should be called via `Layer.init()`:
     *
     *      var client = Layer.init({
     *          appId: "layer:///apps/staging/uuid"
     *      });
     *
     * For trusted devices, you can enable storage of data to indexedDB and localStorage with the `isTrustedDevice` and `isPersistenceEnabled` property:
     *
     *      var client = Layer.init({
     *          appId: "layer:///apps/staging/uuid",
     *          isTrustedDevice: true,
     *          isPersistenceEnabled: true
     *      });
     *
     * @method constructor
     * @param  {Object} options
     * @param  {string} options.appId           - "layer:///apps/production/uuid"; Identifies what
     *                                            application we are connecting to.
     * @param  {string} [options.url=https://api.layer.com] - URL to log into a different REST server
     * @param {number} [options.logLevel=ERROR] - Provide a log level that is one of Layer.Constants.LOG.NONE, Layer.Constants.LOG.ERROR,
     *                                            Layer.Constants.LOG.WARN, Layer.Constants.LOG.INFO, Layer.Constants.LOG.DEBUG
     * @param {boolean} [options.isTrustedDevice=false] - If this is not a trusted device, no data will be written to indexedDB nor localStorage,
     *                                            regardless of any values in Layer.Core.Client.persistenceFeatures.
     * @param {Object} [options.isPersistenceEnabled=false] If Layer.Core.Client.isPersistenceEnabled is true, then indexedDB will be used to manage a cache
     *                                            allowing Query results, messages sent, and all local modifications to be persisted between page reloads.
     */

    /**
     * Initialize the subcomponents of the ClientAuthenticator
     *
     * @method _initComponents
     * @private
     */
    value: function _initComponents() {
      // Setup the websocket manager; won't connect until we trigger an authenticated event
      this.socketManager = new _socketManager2.default({});

      this.socketChangeManager = new _changeManager2.default({
        socketManager: this.socketManager
      });

      this.socketRequestManager = new _requestManager2.default({
        socketManager: this.socketManager
      });

      this.onlineManager = new _onlineStateManager2.default({
        socketManager: this.socketManager
      });

      this.onlineManager.on('connected', this._handleOnlineChange, this);
      this.onlineManager.on('disconnected', this._handleOnlineChange, this);

      this.syncManager = new _syncManager2.default({
        onlineManager: this.onlineManager,
        socketManager: this.socketManager,
        requestManager: this.socketRequestManager
      });
    }

    /**
     * Destroy the subcomponents of the ClientAuthenticator
     *
     * @method _destroyComponents
     * @private
     */

  }, {
    key: '_destroyComponents',
    value: function _destroyComponents() {
      this.syncManager.destroy();
      this.onlineManager.destroy();
      this.socketManager.destroy();
      this.socketChangeManager.destroy();
      this.socketRequestManager.destroy();
      if (this.dbManager) this.dbManager.destroy();
    }

    /**
     * Is Persisted Session Tokens disabled?
     *
     * @method _isPersistedSessionsDisabled
     * @returns {Boolean}
     * @private
     */

  }, {
    key: '_isPersistedSessionsDisabled',
    value: function _isPersistedSessionsDisabled() {
      return !global.localStorage || this.persistenceFeatures && !this.persistenceFeatures.sessionToken;
    }

    /**
     * Restore the sessionToken from localStorage.
     *
     * This sets the sessionToken rather than returning the token.
     *
     * @method _restoreLastSession
     * @private
     */

  }, {
    key: '_restoreLastSession',
    value: function _restoreLastSession() {
      if (this._isPersistedSessionsDisabled()) return;
      try {
        var sessionData = global.localStorage[_constants.LOCALSTORAGE_KEYS.SESSIONDATA + this.appId];
        if (!sessionData) return;
        var parsedData = JSON.parse(sessionData);
        if (parsedData.expires < Date.now()) {
          global.localStorage.removeItem(_constants.LOCALSTORAGE_KEYS.SESSIONDATA + this.appId);
        } else {
          this.sessionToken = parsedData.sessionToken;
        }
      } catch (error) {
        // No-op
      }
    }

    /**
     * Restore the Identity for the session owner from localStorage.
     *
     * @method _restoreLastSession
     * @private
     * @return {Layer.Core.Identity}
     */

  }, {
    key: '_restoreLastUser',
    value: function _restoreLastUser() {
      try {
        var sessionData = global.localStorage[_constants.LOCALSTORAGE_KEYS.SESSIONDATA + this.appId];
        if (!sessionData) return null;
        var userObj = JSON.parse(sessionData).user;
        return new _identity2.default({
          isMine: true,
          fromServer: userObj
        });
      } catch (error) {
        return null;
      }
    }

    /**
     * Has the userID changed since the last login?
     *
     * @method _hasUserIdChanged
     * @param {string} userId
     * @returns {boolean}
     * @private
     */

  }, {
    key: '_hasUserIdChanged',
    value: function _hasUserIdChanged(userId) {
      try {
        var sessionData = global.localStorage[_constants.LOCALSTORAGE_KEYS.SESSIONDATA + this.appId];
        if (!sessionData) return true;
        return JSON.parse(sessionData).user.user_id !== userId;
      } catch (error) {
        return true;
      }
    }

    /**
     * Get a nonce and start the authentication process
     *
     * @method _connect
     * @private
     */

  }, {
    key: '_connect',
    value: function _connect() {
      var _this2 = this;

      this._triggerAsync('state-change', {
        started: true,
        type: 'authentication',
        telemetryId: 'auth_time',
        id: null
      });
      this.xhr({
        url: '/nonces',
        method: 'POST',
        sync: false
      }, function (result) {
        return _this2._connectionResponse(result);
      });
    }

    /**
     * Initiates the connection.
     *
     * Called by constructor().
     *
     * Will either attempt to validate the cached sessionToken by getting conversations,
     * or if no sessionToken, will call /nonces to start process of getting a new one.
     *
     * ```javascript
     * var client = Layer.init({appId: myAppId});
     * client.connect('Frodo-the-Dodo');
     * ```
     *
     * @method connect
     * @param {string} userId - User ID of the user you are logging in as
     * @returns {Layer.Core.ClientAuthenticator} this
     */

  }, {
    key: 'connect',
    value: function connect() {
      var userId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      if (!this.appId) throw new Error(_layerError.ErrorDictionary.appIdMissing);
      if (this.isAuthenticated) return this;

      var user = void 0;
      this.isConnected = false;
      this._lastChallengeTime = 0;
      this._wantsToBeAuthenticated = true;
      this.user = null;
      this.onlineManager.start();
      if (!this.isTrustedDevice || !userId || this._isPersistedSessionsDisabled() || this._hasUserIdChanged(userId)) {
        this._clearStoredData();
      }

      if (this.isTrustedDevice && userId) {
        this._restoreLastSession(userId);
        user = this._restoreLastUser();
        if (user) this.user = user;
      }

      if (!this.user) {
        this.user = new _identity2.default({
          userId: userId,
          isMine: true,
          id: userId ? _identity2.default.prefixUUID + encodeURIComponent(userId) : ''
        });
      }

      if (this.sessionToken && this.user.userId) {
        this._sessionTokenRestored();
      } else {
        this._connect();
      }
      return this;
    }

    /**
     * Initiates the connection with a session token.
     *
     * This call is for use when you have received a Session Token from some other source; such as your server,
     * and wish to use that instead of doing a full auth process.
     *
     * The Client will presume the token to be valid, and will asynchronously trigger the `ready` event.
     * If the token provided is NOT valid, this won't be detected until a request is made using this token,
     * at which point the `challenge` method will trigger.
     *
     * NOTE: The `connected` event will not be triggered on this path.
     *
     * ```javascript
     * var client = Layer.init({appId: myAppId});
     * client.connectWithSession('Frodo-the-Dodo', mySessionToken);
     * ```
     *
     * @method connectWithSession
     * @param {String} userId
     * @param {String} sessionToken
     * @returns {Layer.Core.ClientAuthenticator} this
     */

  }, {
    key: 'connectWithSession',
    value: function connectWithSession(userId, sessionToken) {
      var _this3 = this;

      if (!this.appId) throw new Error(_layerError.ErrorDictionary.appIdMissing);
      if (this.isAuthenticated) return this;

      var user = void 0;
      this.isConnected = false;
      this.user = null;
      this._lastChallengeTime = 0;
      this._wantsToBeAuthenticated = true;
      if (!userId || !sessionToken) throw new Error(_layerError.ErrorDictionary.sessionAndUserRequired);
      if (!this.isTrustedDevice || this._isPersistedSessionsDisabled() || this._hasUserIdChanged(userId)) {
        this._clearStoredData();
      }
      if (this.isTrustedDevice) {
        user = this._restoreLastUser();
        if (user) this.user = user;
      }

      this.onlineManager.start();

      if (!this.user) {
        this.user = new _identity2.default({
          userId: userId,
          isMine: true
        });
      }

      this.isConnected = true;
      setTimeout(function () {
        if (!_this3.isAuthenticated) {
          _this3._authComplete({ session_token: sessionToken }, false);
        }
      }, 1);
      return this;
    }

    /**
     * Called when our request for a nonce gets a response.
     *
     * If there is an error, calls _connectionError.
     *
     * If there is nonce, calls _connectionComplete.
     *
     * @method _connectionResponse
     * @private
     * @param  {Object} result
     */

  }, {
    key: '_connectionResponse',
    value: function _connectionResponse(result) {
      if (!result.success) {
        this._connectionError(result.data);
      } else {
        this._connectionComplete(result.data);
      }
    }

    /**
     * We are now connected (we have a nonce).
     *
     * If we have successfully retrieved a nonce, then
     * we have entered a "connected" but not "authenticated" state.
     * Set the state, trigger any events, and then start authentication.
     *
     * @method _connectionComplete
     * @private
     * @param  {Object} result
     * @param  {string} result.nonce - The nonce provided by the server
     *
     * @fires connected
     */

  }, {
    key: '_connectionComplete',
    value: function _connectionComplete(result) {
      this.isConnected = true;
      this.trigger('connected');
      this._authenticate(result.nonce);
    }

    /**
     * Called when we fail to get a nonce.
     *
     * @method _connectionError
     * @private
     * @param  {Layer.Core.LayerEvent} err
     *
     * @fires connected-error
     */

  }, {
    key: '_connectionError',
    value: function _connectionError(error) {
      this.trigger('connected-error', { error: error });
    }

    /* CONNECT METHODS END */

    /* AUTHENTICATE METHODS BEGIN */

    /**
     * Start the authentication step.
     *
     * We start authentication by triggering a "challenge" event that
     * tells the app to use the nonce to obtain an identity_token.
     *
     * @method _authenticate
     * @private
     * @param  {string} nonce - The nonce to provide your identity provider service
     *
     * @fires challenge
     */

  }, {
    key: '_authenticate',
    value: function _authenticate(nonce) {
      this._lastChallengeTime = Date.now();
      if (nonce) {
        this.trigger('challenge', {
          nonce: nonce,
          callback: this.answerAuthenticationChallenge.bind(this)
        });
      }
    }

    /**
     * Accept an identityToken and use it to create a session.
     *
     * Typically, this method is called using the function pointer provided by
     * the challenge event, but it can also be called directly.
     *
     *      getIdentityToken(nonce, function(identityToken) {
     *          client.answerAuthenticationChallenge(identityToken);
     *      });
     *
     * @method answerAuthenticationChallenge
     * @param  {string} identityToken - Identity token provided by your identity provider service
     */

  }, {
    key: 'answerAuthenticationChallenge',
    value: function answerAuthenticationChallenge(identityToken) {
      var _this4 = this;

      // Report an error if no identityToken provided
      if (!identityToken) {
        _utils.logger.error(_layerError.ErrorDictionary.identityTokenMissing);
        throw new Error(_layerError.ErrorDictionary.identityTokenMissing);
      } else {
        var userData = _utils2.default.decode(identityToken.split('.')[1]);
        var identityObj = JSON.parse(userData);

        if (!identityObj.prn) {
          // TODO: Move to dictionary
          var err = 'Your identity token prn (user id) is empty';
          _utils.logger.error(err);
          throw new Error(err);
        }

        if (this.user.userId && this.user.userId !== identityObj.prn) {
          _utils.logger.error(_layerError.ErrorDictionary.invalidUserIdChange);
          throw new Error(_layerError.ErrorDictionary.invalidUserIdChange);
        }

        this.user._setUserId(identityObj.prn);

        if (identityObj.display_name) this.user.displayName = identityObj.display_name;
        if (identityObj.avatar_url) this.user.avatarUrl = identityObj.avatar_url;

        this.xhr({
          url: '/sessions',
          method: 'POST',
          sync: false,
          data: {
            identity_token: identityToken,
            app_id: this.appId
          }
        }, function (result) {
          return _this4._authResponse(result, identityToken);
        });
      }
    }

    /**
     * Called when our request for a sessionToken receives a response.
     *
     * @private
     * @method _authResponse
     * @param  {Object} result
     * @param  {string} identityToken
     */

  }, {
    key: '_authResponse',
    value: function _authResponse(result, identityToken) {
      this._triggerAsync('state-change', {
        ended: true,
        type: 'authentication',
        telemetryId: 'auth_time',
        result: result.success
      });
      if (!result.success) {
        this._authError(result.data, identityToken);
      } else {
        this._authComplete(result.data, false);
      }
    }

    /**
     * Authentication is completed, update state and trigger events.
     *
     * @method _authComplete
     * @private
     * @param  {Object} result
     * @param  {Boolean} fromPersistence
     * @param  {string} result.session_token - Session token received from the server
     *
     * @fires authenticated
     */

  }, {
    key: '_authComplete',
    value: function _authComplete(result, fromPersistence) {
      var _this5 = this;

      if (!result || !result.session_token) {
        throw new Error(_layerError.ErrorDictionary.sessionTokenMissing);
      }
      this.sessionToken = result.session_token;

      // If _authComplete was called because we accepted an auth loaded from storage
      // we don't need to update storage.
      if (!this._isPersistedSessionsDisabled() && !fromPersistence) {
        try {
          _identity2.default.toDbObjects([this.user], function (userObjs) {
            global.localStorage[_constants.LOCALSTORAGE_KEYS.SESSIONDATA + _this5.appId] = JSON.stringify({
              sessionToken: _this5.sessionToken || '',
              user: userObjs[0],
              expires: Date.now() + 30 * 60 * 60 * 24 * 1000
            });
          });
        } catch (e) {
          // Do nothing
        }
      }

      this._clientAuthenticated();
    }

    /**
     * Authentication has failed.
     *
     * @method _authError
     * @private
     * @param  {Layer.Core.LayerEvent} result
     * @param  {string} identityToken Not currently used
     *
     * @fires authenticated-error
     */

  }, {
    key: '_authError',
    value: function _authError(error, identityToken) {
      this.trigger('authenticated-error', { error: error });
    }

    /**
     * Sets state and triggers events for both connected and authenticated.
     *
     * If reusing a sessionToken cached in localStorage,
     * use this method rather than _authComplete.
     *
     * @method _sessionTokenRestored
     * @private
     *
     * @fires connected, authenticated
     */

  }, {
    key: '_sessionTokenRestored',
    value: function _sessionTokenRestored() {
      this.isConnected = true;
      this.trigger('connected');
      this._clientAuthenticated();
    }

    /**
     * The client is now authenticated, and doing some setup
     * before calling _clientReady.
     *
     * @method _clientAuthenticated
     * @private
     */

  }, {
    key: '_clientAuthenticated',
    value: function _clientAuthenticated() {
      var _this6 = this;

      if (!this.isTrustedDevice) this.isPersistenceEnabled = false;
      this._setupDbSettings();

      // Update state and trigger the event
      this.isAuthenticated = true;
      this.trigger('authenticated');

      // Before calling _clientReady, load the session owner's full Identity.
      if (this.isPersistenceEnabled && this.dbManager) {
        this.dbManager.onOpen(function () {
          return _this6._loadUser();
        });
      } else {
        this._loadUser();
      }
    }
  }, {
    key: '_setupDbSettings',
    value: function _setupDbSettings() {
      // If no persistenceFeatures are specified, set them all
      // to true or false to match isTrustedDevice.
      if (!this.persistenceFeatures || !this.isPersistenceEnabled) {
        var sessionToken = void 0;
        if (this.persistenceFeatures && 'sessionToken' in this.persistenceFeatures) {
          sessionToken = Boolean(this.persistenceFeatures.sessionToken);
        } else {
          sessionToken = this.isTrustedDevice;
        }
        this.persistenceFeatures = {
          conversations: this.isPersistenceEnabled,
          channels: this.isPersistenceEnabled,
          messages: this.isPersistenceEnabled,
          identities: this.isPersistenceEnabled,
          syncQueue: this.isPersistenceEnabled,
          sessionToken: sessionToken
        };
      }

      // Setup the Database Manager
      if (!this.dbManager) {
        if (!_namespace.DbManager) {
          if (this.isPersistenceEnabled && this.isTrustedDevice) {
            _utils.logger.error('DbManager NOT imported. Persistence disabled!');
          }
        } else {
          this.dbManager = new _namespace.DbManager({
            tables: this.persistenceFeatures,
            enabled: this.isPersistenceEnabled
          });
        }
      }
    }

    /**
     * Load the session owner's full identity.
     *
     * Note that failure to load the identity will not prevent
     * _clientReady, but is certainly not a desired outcome.
     *
     * @method _loadUser
     */

  }, {
    key: '_loadUser',
    value: function _loadUser() {
      var _this7 = this;

      // We're done if we got the full identity from localStorage.
      if (this.user.isFullIdentity) {
        this._clientReady();
      } else {
        // load the user's full Identity so we have presence;
        this.user._load();
        this.user.once('identities:loaded', function () {
          _this7.user.off('identities:loaded-error', null, _this7);
          if (!_this7._isPersistedSessionsDisabled()) {
            _this7._writeSessionOwner();
            _this7.user.on('identities:change', _this7._writeSessionOwner, _this7);
          }
          _this7._clientReady();
        }, this).once('identities:loaded-error', function (evt) {
          _this7.user.off('identities:loaded', null, _this7);
          if (evt.error.id !== 'authentication_required') {
            if (!_this7.user.displayName) _this7.user.displayName = _this7.defaultOwnerDisplayName;
            _this7._clientReady();
          }
        }, this);
      }
    }

    /**
     * Write the latest state of the Session's Identity object to localStorage
     *
     * @method _writeSessionOwner
     * @private
     */

  }, {
    key: '_writeSessionOwner',
    value: function _writeSessionOwner() {
      try {
        // Update the session data in localStorage with our full Identity.
        var sessionData = JSON.parse(global.localStorage[_constants.LOCALSTORAGE_KEYS.SESSIONDATA + this.appId]);
        _identity2.default.toDbObjects([this.user], function (users) {
          return sessionData.user = users[0];
        });
        global.localStorage[_constants.LOCALSTORAGE_KEYS.SESSIONDATA + this.appId] = JSON.stringify(sessionData);
      } catch (e) {
        // no-op
      }
    }

    /**
     * Called to flag the client as ready for action.
     *
     * This method is called after authenication AND
     * after initial conversations have been loaded.
     *
     * @method _clientReady
     * @private
     * @fires ready
     */

  }, {
    key: '_clientReady',
    value: function _clientReady() {
      if (!this.isReady) {
        this.isReady = true;
        this.trigger('ready');
      }
    }

    /* CONNECT METHODS END */

    /* START SESSION MANAGEMENT METHODS */

    /**
     * Deletes your sessionToken from the server, and removes all user data from the Client.
     * Call `client.connect()` to restart the authentication process.
     *
     * This call is asynchronous; some browsers (ahem, safari...) may not have completed the deletion of
     * persisted data if you
     * navigate away from the page.  Use the callback to determine when all necessary cleanup has completed
     * prior to navigating away.
     *
     * Note that while all data should be purged from the browser/device, if you are offline when this is called,
     * your session token will NOT be deleted from the web server.  Why not? Because it would involve retaining the
     * request after all of the user's data has been deleted, or NOT deleting the user's data until we are online.
     *
     * @method logout
     * @param {Function} callback
     * @return {Layer.Core.ClientAuthenticator} this
     */

  }, {
    key: 'logout',
    value: function logout(callback) {
      this._wantsToBeAuthenticated = false;
      var callbackCount = 1;
      var counter = 0;
      if (this.isAuthenticated) {
        callbackCount++;
        this.xhr({
          method: 'DELETE',
          url: '/sessions/' + escape(this.sessionToken),
          sync: false
        }, function () {
          counter++;
          if (counter === callbackCount && callback) callback();
        });
      }

      // Clear data even if isAuthenticated is false
      // Session may have expired, but data still cached.
      this._clearStoredData(function () {
        counter++;
        if (counter === callbackCount && callback) callback();
      });

      this._resetSession();
      return this;
    }
  }, {
    key: '_clearStoredData',
    value: function _clearStoredData(callback) {
      if (global.localStorage) localStorage.removeItem(_constants.LOCALSTORAGE_KEYS.SESSIONDATA + this.appId);
      if (this.dbManager) {
        this.dbManager.deleteTables(callback);
      } else if (callback) {
        callback();
      }
    }

    /**
     * Log out/clear session information.
     *
     * Use this to clear the sessionToken and all information from this session.
     *
     * @method _resetSession
     * @private
     */

  }, {
    key: '_resetSession',
    value: function _resetSession() {
      this.isReady = false;
      this.isConnected = false;
      this.isAuthenticated = false;

      if (this.sessionToken) {
        this.sessionToken = '';
        if (global.localStorage) {
          localStorage.removeItem(_constants.LOCALSTORAGE_KEYS.SESSIONDATA + this.appId);
        }
      }

      this.trigger('deauthenticated');
      this.onlineManager.stop();
    }

    /**
     * Register your IOS device to receive notifications.
     * For use with native code only (Cordova, React Native, Titanium, etc...)
     *
     * @method registerIOSPushToken
     * @param {Object} options
     * @param {string} options.deviceId - Your IOS device's device ID
     * @param {string} options.iosVersion - Your IOS device's version number
     * @param {string} options.token - Your Apple APNS Token
     * @param {string} [options.bundleId] - Your Apple APNS Bundle ID ("com.layer.bundleid")
     * @param {Function} [callback=null] - Optional callback
     * @param {Layer.Core.LayerEvent} callback.error - LayerError if there was an error; null if successful
     */

  }, {
    key: 'registerIOSPushToken',
    value: function registerIOSPushToken(options, callback) {
      this.xhr({
        url: 'push_tokens',
        method: 'POST',
        sync: false,
        data: {
          token: options.token,
          type: 'apns',
          device_id: options.deviceId,
          ios_version: options.iosVersion,
          apns_bundle_id: options.bundleId
        }
      }, function (result) {
        return callback(result.data);
      });
    }

    /**
     * Register your Android device to receive notifications.
     * For use with native code only (Cordova, React Native, Titanium, etc...)
     *
     * @method registerAndroidPushToken
     * @param {Object} options
     * @param {string} options.deviceId - Your IOS device's device ID
     * @param {string} options.token - Your GCM push Token
     * @param {string} options.senderId - Your GCM Sender ID/Project Number
     * @param {Function} [callback=null] - Optional callback
     * @param {Layer.Core.LayerEvent} callback.error - LayerError if there was an error; null if successful
     */

  }, {
    key: 'registerAndroidPushToken',
    value: function registerAndroidPushToken(options, callback) {
      this.xhr({
        url: 'push_tokens',
        method: 'POST',
        sync: false,
        data: {
          token: options.token,
          type: 'gcm',
          device_id: options.deviceId,
          gcm_sender_id: options.senderId
        }
      }, function (result) {
        return callback(result.data);
      });
    }

    /**
     * Register your Android device to receive notifications.
     * For use with native code only (Cordova, React Native, Titanium, etc...)
     *
     * @method unregisterPushToken
     * @param {string} deviceId - Your IOS device's device ID
     * @param {Function} [callback=null] - Optional callback
     * @param {Layer.Core.LayerEvent} callback.error - LayerError if there was an error; null if successful
     */

  }, {
    key: 'unregisterPushToken',
    value: function unregisterPushToken(deviceId, callback) {
      this.xhr({
        url: 'push_tokens/' + deviceId,
        method: 'DELETE'
      }, function (result) {
        return callback(result.data);
      });
    }

    /* SESSION MANAGEMENT METHODS END */

    /* ACCESSOR METHODS BEGIN */

    /**
     * __ Methods are automatically called by property setters.
     *
     * Any attempt to execute `this.userAppId = 'xxx'` will cause an error to be thrown
     * if the client is already connected.
     *
     * @private
     * @method __adjustAppId
     * @param {string} value - New appId value
     */

  }, {
    key: '__adjustAppId',
    value: function __adjustAppId() {
      if (this.isConnected || this._wantsToBeAuthenticated) throw new Error(_layerError.ErrorDictionary.cantChangeIfConnected);
    }

    /**
     * __ Methods are automatically called by property setters.
     *
     * Any attempt to execute `this.user = userIdentity` will cause an error to be thrown
     * if the client is already connected.
     *
     * @private
     * @method __adjustUser
     * @param {string} user - new Identity object
     */

  }, {
    key: '__adjustUser',
    value: function __adjustUser(user) {
      if (this.isConnected) {
        throw new Error(_layerError.ErrorDictionary.cantChangeIfConnected);
      }
    }

    // Virtual methods

  }, {
    key: '_addIdentity',
    value: function _addIdentity(identity) {}
  }, {
    key: '_removeIdentity',
    value: function _removeIdentity(identity) {}

    /* ACCESSOR METHODS END */

    /* COMMUNICATIONS METHODS BEGIN */

  }, {
    key: 'sendSocketRequest',
    value: function sendSocketRequest(data, callback) {
      var isChangesArray = Boolean(data.isChangesArray);
      if (this._wantsToBeAuthenticated && !this.isAuthenticated) this._connect();

      if (data.sync) {
        var target = data.sync.target;
        var depends = data.sync.depends;
        if (target && !depends) depends = [target];

        this.syncManager.request(new _syncEvent.WebsocketSyncEvent({
          data: data.body,
          operation: data.method,
          returnChangesArray: isChangesArray,
          target: target,
          depends: depends,
          callback: callback
        }));
      } else {
        if (typeof data.data === 'function') data.data = data.data();
        this.socketRequestManager.sendRequest({ data: data, isChangesArray: isChangesArray, callback: callback });
      }
    }

    /**
     * This event handler receives events from the Online State Manager and generates an event for those subscribed
     * to client.on('online')
     *
     * @method _handleOnlineChange
     * @private
     * @param {Layer.Core.LayerEvent} evt
     */

  }, {
    key: '_handleOnlineChange',
    value: function _handleOnlineChange(evt) {
      if (!this._wantsToBeAuthenticated) return;
      var duration = evt.offlineDuration;
      var isOnline = evt.eventName === 'connected';
      var obj = { isOnline: isOnline };
      if (isOnline) {
        obj.reset = duration > ClientAuthenticator.ResetAfterOfflineDuration;

        // TODO: Use a cached nonce if it hasn't expired
        if (!this.isAuthenticated) this._connect();
      }
      this.trigger('online', obj);
    }

    /**
     * Main entry point for sending xhr requests or for queing them in the syncManager.
     *
     * This call adjust arguments for our REST server.
     *
     * @method xhr
     * @protected
     * @param  {Object}   options
     * @param  {string}   options.url - URL relative client's url: "/conversations"
     * @param  {Function} callback
     * @param  {Object}   callback.result
     * @param  {Mixed}    callback.result.data - If an error occurred, this is a Layer.Core.LayerEvent;
     *                                          If the response was application/json, this will be an object
     *                                          If the response was text/empty, this will be text/empty
     * @param  {XMLHttpRequest} callback.result.xhr - Native xhr request object for detailed analysis
     * @param  {Object}         callback.result.Links - Hash of Link headers
     * @return {Layer.Core.ClientAuthenticator} this
     */

  }, {
    key: 'xhr',
    value: function xhr(options, callback) {
      if (!options.sync || !options.sync.target) {
        options.url = this._xhrFixRelativeUrls(options.url || '');
      }

      options.withCredentials = true;
      if (!options.method) options.method = 'GET';
      if (!options.headers) options.headers = {};
      this._xhrFixHeaders(options.headers);
      this._xhrFixAuth(options.headers);

      // Note: this is not sync vs async; this is syncManager vs fire it now
      if (options.sync === false) {
        this._nonsyncXhr(options, callback, 0);
      } else {
        this._syncXhr(options, callback);
      }
      return this;
    }

    /**
     * For xhr calls that go through the sync manager, queue it up.
     *
     * @method _syncXhr
     * @private
     * @param  {Object}   options
     * @param  {Function} callback
     */

  }, {
    key: '_syncXhr',
    value: function _syncXhr(options, callback) {
      var _this8 = this;

      if (!options.sync) options.sync = {};
      if (this._wantsToBeAuthenticated && !this.isAuthenticated) this._connect();

      var innerCallback = function innerCallback(result) {
        _this8._xhrResult(result, callback);
      };
      var target = options.sync.target;
      var depends = options.sync.depends;
      if (target && !depends) depends = [target];

      this.syncManager.request(new _syncEvent.XHRSyncEvent({
        url: options.url,
        data: options.data,
        telemetry: options.telemetry,
        method: options.method,
        operation: options.sync.operation || options.method,
        headers: options.headers,
        callback: innerCallback,
        target: target,
        depends: depends
      }));
    }

    /**
     * For xhr calls that don't go through the sync manager,
     * fire the request, and if it fails, refire it up to 3 tries
     * before reporting an error.  1 second delay between requests
     * so whatever issue is occuring is a tiny bit more likely to resolve,
     * and so we don't hammer the server every time there's a problem.
     *
     * @method _nonsyncXhr
     * @private
     * @param  {Object}   options
     * @param  {Function} callback
     * @param  {number}   retryCount
     */

  }, {
    key: '_nonsyncXhr',
    value: function _nonsyncXhr(options, callback, retryCount) {
      var _this9 = this;

      (0, _utils.xhr)(options, function (result) {
        if ([502, 503, 504].indexOf(result.status) !== -1 && retryCount < MAX_XHR_RETRIES) {
          setTimeout(function () {
            return _this9._nonsyncXhr(options, callback, retryCount + 1);
          }, 1000);
        } else {
          _this9._xhrResult(result, callback);
        }
      });
    }

    /**
     * Fix authentication header for an xhr request
     *
     * @method _xhrFixAuth
     * @private
     * @param  {Object} headers
     */

  }, {
    key: '_xhrFixAuth',
    value: function _xhrFixAuth(headers) {
      if (this.sessionToken && !headers.Authorization) {
        headers.authorization = 'Layer session-token="' + this.sessionToken + '"'; // eslint-disable-line
      }
    }

    /**
     * Fix relative URLs to create absolute URLs needed for CORS requests.
     *
     * @method _xhrFixRelativeUrls
     * @private
     * @param  {string} relative or absolute url
     * @return {string} absolute url
     */

  }, {
    key: '_xhrFixRelativeUrls',
    value: function _xhrFixRelativeUrls(url) {
      var result = url;
      if (url.indexOf('https://') === -1) {
        if (url[0] === '/') {
          result = this.url + url;
        } else {
          result = this.url + '/' + url;
        }
      }
      return result;
    }

    /**
     * Fixup all headers in preparation for an xhr call.
     *
     * 1. All headers use lower case names for standard/easy lookup
     * 2. Set the accept header
     * 3. If needed, set the content-type header
     *
     * @method _xhrFixHeaders
     * @private
     * @param  {Object} headers
     */

  }, {
    key: '_xhrFixHeaders',
    value: function _xhrFixHeaders(headers) {
      // Replace all headers in arbitrary case with all lower case
      // for easy matching.
      var headerNameList = Object.keys(headers);
      headerNameList.forEach(function (headerName) {
        if (headerName !== headerName.toLowerCase()) {
          headers[headerName.toLowerCase()] = headers[headerName];
          delete headers[headerName];
        }
      });

      if (!headers.accept) headers.accept = _constants.ACCEPT;

      if (!headers['content-type']) headers['content-type'] = 'application/json';
    }

    /**
     * Handle the result of an xhr call
     *
     * @method _xhrResult
     * @private
     * @param  {Object}   result     Standard xhr response object from the xhr lib
     * @param  {Function} [callback] Callback on completion
     */

  }, {
    key: '_xhrResult',
    value: function _xhrResult(result, callback) {
      if (this.isDestroyed) return;

      if (!result.success) {
        // Replace the response with a LayerError instance
        if (result.data && _typeof(result.data) === 'object') {
          this._generateError(result);
        }

        // If its an authentication error, reauthenticate
        // don't call _resetSession as that wipes all data and screws with UIs, and the user
        // is still authenticated on the customer's app even if not on Layer.
        if (result.status === 401 && this._wantsToBeAuthenticated) {
          if (this.isAuthenticated) {
            var hasOldSessionToken = result.request.headers && result.request.headers.authorization;
            var oldSessionToken = hasOldSessionToken ? result.request.headers.authorization.replace(/^.*"(.*)".*$/, '$1') : '';

            // Ignore auth errors if in response to a no longer in use sessionToken
            if (oldSessionToken && this.isReady && this.sessionToken && oldSessionToken !== this.sessionToken) return;

            _utils.logger.warn('SESSION EXPIRED!');
            this.isAuthenticated = false;
            this.isReady = false;
            if (global.localStorage) localStorage.removeItem(_constants.LOCALSTORAGE_KEYS.SESSIONDATA + this.appId);
            this.trigger('deauthenticated');
            if (result.data && result.data.getNonce) {
              this._authenticate(result.data.getNonce());
            }
          } else if (this._lastChallengeTime > Date.now() + ClientAuthenticator.TimeBetweenReauths) {
            if (result.data && result.data.getNonce) {
              this._authenticate(result.data.getNonce());
            }
          }
        }
      }
      if (callback) callback(result);
    }

    /**
     * Transforms xhr error response into a Layer.Core.LayerEvent instance.
     *
     * Adds additional information to the result object including
     *
     * * url
     * * data
     *
     * @method _generateError
     * @private
     * @param  {Object} result - Result of the xhr call
     */

  }, {
    key: '_generateError',
    value: function _generateError(result) {
      result.data = new _layerError2.default(result.data);
      if (!result.data.httpStatus) result.data.httpStatus = result.status;
      result.data.log();
    }

    /* END COMMUNICATIONS METHODS */

  }]);

  return ClientAuthenticator;
}(_root2.default);

/**
 * State variable; indicates that client is currently authenticated by the server.
 * Should never be true if isConnected is false.
 * @property {Boolean}
 * @readonly
 */


ClientAuthenticator.prototype.isAuthenticated = false;

/**
 * State variable; indicates that client is currently connected to server
 * (may not be authenticated yet)
 * @property {Boolean}
 * @readonly
 */
ClientAuthenticator.prototype.isConnected = false;

/**
 * State variable; indicates that client is ready for the app to use.
 * Use the 'ready' event to be notified when this value changes to true.
 *
 * @property {boolean}
 * @readonly
 */
ClientAuthenticator.prototype.isReady = false;

/**
 * State variable; indicates if the WebSDK thinks that the app WANTS to be connected.
 *
 * An app wants to be connected if it has called `connect()` or `connectWithSession()`
 * and has not called `logout()`.  A client that is connected will receive reauthentication
 * events in the form of `challenge` events.
 *
 * @property {boolean}
 * @readonly
 */
ClientAuthenticator.prototype._wantsToBeAuthenticated = false;

/**
 * If presence is enabled, then your presence can be set/restored.
 *
 * @property {Boolean} [isPresenceEnabled=true]
 */
ClientAuthenticator.prototype.isPresenceEnabled = true;

/**
 * Your Layer Application ID. Can not be changed once connected.
 *
 * To find your Layer Application ID, see your Layer Developer Dashboard.
 *
 * @property {String}
 */
ClientAuthenticator.prototype.appId = '';

/**
 * Identity information about the authenticated user.
 *
 * @property {Layer.Core.Identity}
 */
ClientAuthenticator.prototype.user = null;

/**
 * Your current session token that authenticates your requests.
 *
 * @property {String}
 * @readonly
 */
ClientAuthenticator.prototype.sessionToken = '';

/**
 * Time that the last challenge was issued
 *
 * @property {Number}
 * @private
 */
ClientAuthenticator.prototype._lastChallengeTime = 0;

/**
 * URL to Layer's Web API server.
 *
 * Only muck with this if told to by Layer Staff.
 * @property {String}
 */
ClientAuthenticator.prototype.url = 'https://api.layer.com';

/**
 * URL to Layer's Websocket server.
 *
 * Only muck with this if told to by Layer Staff.
 * @property {String}
 */
ClientAuthenticator.prototype.websocketUrl = 'wss://websockets.layer.com';

/**
 * Web Socket Manager
 * @property {Layer.Core.Websockets.SocketManager}
 */
ClientAuthenticator.prototype.socketManager = null;

/**
 * Web Socket Request Manager
 * @property {Layer.Core.Websockets.RequestManager}
 */
ClientAuthenticator.prototype.socketRequestManager = null;

/**
 * Web Socket Manager
 * @property {Layer.Core.Websockets.ChangeManager}
 */
ClientAuthenticator.prototype.socketChangeManager = null;

/**
 * Service for managing online as well as offline server requests
 * @property {Layer.Core.SyncManager}
 */
ClientAuthenticator.prototype.syncManager = null;

/**
 * Service for managing online/offline state and events
 * @property {Layer.Core.OnlineStateManager}
 */
ClientAuthenticator.prototype.onlineManager = null;

/**
 * If this is a trusted device, then we can write personal data to persistent memory.
 * @property {boolean}
 */
ClientAuthenticator.prototype.isTrustedDevice = false;

/**
 * To enable indexedDB storage of query data, set this true.  Experimental.
 *
 * @property {boolean}
 */
ClientAuthenticator.prototype.isPersistenceEnabled = false;

/**
 * If this Layer.Core.Client.isTrustedDevice is true, then you can control which types of data are persisted.
 *
 * Note that values here are ignored if `isPersistenceEnabled` hasn't been set to `true`.
 *
 * Properties of this Object can be:
 *
 * * identities: Write identities to indexedDB? This allows for faster initialization.
 * * conversations: Write conversations to indexedDB? This allows for faster rendering
 *                  of a Conversation List
 * * messages: Write messages to indexedDB? This allows for full offline access
 * * syncQueue: Write requests made while offline to indexedDB?  This allows the app
 *              to complete sending messages after being relaunched.
 * * sessionToken: Write the session token to localStorage for quick reauthentication on relaunching the app.
 *
 *      Layer.init({
 *        isTrustedDevice: true,
 *        persistenceFeatures: {
 *          conversations: true,
 *          identities: true,
 *          messages: false,
 *          syncQueue: false,
 *          sessionToken: true
 *        }
 *      });
 *
 * @property {Object}
 */
ClientAuthenticator.prototype.persistenceFeatures = null;

/**
 * Database Manager for read/write to IndexedDB
 * @property {Layer.Core.DbManager}
 */
ClientAuthenticator.prototype.dbManager = null;

/**
 * If a display name is not loaded for the session owner, use this name.
 *
 * @property {string}
 */
ClientAuthenticator.prototype.defaultOwnerDisplayName = 'You';

/**
 * Is true if the client is authenticated and connected to the server;
 *
 * Typically used to determine if there is a connection to the server.
 *
 * Typically used in conjunction with the `online` event.
 *
 * @property {boolean}
 */
Object.defineProperty(ClientAuthenticator.prototype, 'isOnline', {
  enumerable: true,
  get: function get() {
    return this.onlineManager && this.onlineManager.isOnline;
  }
});

/**
 * Log levels; one of:
 *
 *    * Layer.Constants.LOG.NONE
 *    * Layer.Constants.LOG.ERROR
 *    * Layer.Constants.LOG.WARN
 *    * Layer.Constants.LOG.INFO
 *    * Layer.Constants.LOG.DEBUG
 *
 * @property {number}
 */
Object.defineProperty(ClientAuthenticator.prototype, 'logLevel', {
  enumerable: false,
  get: function get() {
    return _utils.logger.level;
  },
  set: function set(value) {
    _utils.logger.level = value;
  }
});

/**
 * Short hand for getting the userId of the authenticated user.
 *
 * Could also just use client.user.userId
 *
 * @property {string} userId
 */
Object.defineProperty(ClientAuthenticator.prototype, 'userId', {
  enumerable: true,
  get: function get() {
    return this.user ? this.user.userId : '';
  },
  set: function set() {}
});

/**
 * Time to be offline after which we don't do a WebSocket Events.replay,
 * but instead just refresh all our Query data.  Defaults to 30 hours.
 *
 * @property {number}
 * @static
 */
ClientAuthenticator.ResetAfterOfflineDuration = 1000 * 60 * 60 * 30;

/**
 * Number of miliseconds delay must pass before a subsequent challenge is issued.
 *
 * This value is here to insure apps don't get challenge requests while they are
 * still processing the last challenge event.
 *
 * @property {Number}
 * @static
 */
ClientAuthenticator.TimeBetweenReauths = 30 * 1000;

/**
 * List of events supported by this class
 * @static
 * @protected
 * @property {string[]}
 */
ClientAuthenticator._supportedEvents = [
/**
 * The client is ready for action
 *
 *      client.on('ready', function(evt) {
 *          renderMyUI();
 *      });
 *
 * @event
 */
'ready',

/**
 * Fired when connected to the server.
 * Currently just means we have a nonce.
 * Not recommended for typical applications.
 * @event connected
 */
'connected',

/**
 * Fired when unsuccessful in obtaining a nonce.
 *
 * Not recommended for typical applications.
 * @event connected-error
 * @param {Object} event
 * @param {Layer.Core.LayerEvent} event.error
 */
'connected-error',

/**
 * We now have a session and any requests we send aught to work.
 * Typically you should use the ready event instead of the authenticated event.
 * @event authenticated
 */
'authenticated',

/**
 * Failed to authenticate your client.
 *
 * Either your identity-token was invalid, or something went wrong
 * using your identity-token.
 *
 * @event authenticated-error
 * @param {Object} event
 * @param {Layer.Core.LayerEvent} event.error
 */
'authenticated-error',

/**
 * This event fires when a session has expired or when `Layer.Core.Client.logout` is called.
 * Typically, it is enough to subscribe to the challenge event
 * which will let you reauthenticate; typical applications do not need
 * to subscribe to this.
 *
 * @event deauthenticated
 */
'deauthenticated',

/**
 * @event challenge
 * Verify the user's identity.
 *
 * This event is where you verify that the user is who we all think the user is,
 * and provide an identity token to validate that.
 *
 * ```javascript
 * client.on('challenge', function(evt) {
 *    myGetIdentityForNonce(evt.nonce, function(identityToken) {
 *      evt.callback(identityToken);
 *    });
 * });
 * ```
 *
 * @param {Object} event
 * @param {string} event.nonce - A nonce for you to provide to your identity provider
 * @param {Function} event.callback - Call this once you have an identity-token
 * @param {string} event.callback.identityToken - Identity token provided by your identity provider service
 */
'challenge',

/**
 * @event session-terminated
 * If your session has been terminated in such a way as to prevent automatic reconnect,
 *
 * this event will fire.  Common scenario: user has two tabs open;
 * one tab the user logs out (or you call client.logout()).
 * The other tab will detect that the sessionToken has been removed,
 * and will terminate its session as well.  In this scenario we do not want
 * to automatically trigger a challenge and restart the login process.
 */
'session-terminated',

/**
 * @event online
 *
 * This event is used to detect when the client is online (connected to the server)
 * or offline (still able to accept API calls but no longer able to sync to the server).
 *
 *      client.on('online', function(evt) {
 *         if (evt.isOnline) {
 *             statusDiv.style.backgroundColor = 'green';
 *         } else {
 *             statusDiv.style.backgroundColor = 'red';
 *         }
 *      });
 *
 * @param {Object} event
 * @param {boolean} event.isOnline
 */
'online',

/**
 * State change events are used for internal communications.
 *
 * Primarily used so that the Telemetry component can monitor and report on
 * system activity.
 *
 * @event
 * @private
 */
'state-change',

/**
 * An operation has been received via the websocket.
 *
 * Used for custom/complex operations that cannot be handled via `udpate` requests.
 *
 * @event
 * @private
 */
'websocket:operation'].concat(_root2.default._supportedEvents);

_root2.default.initClass.apply(ClientAuthenticator, [ClientAuthenticator, 'ClientAuthenticator', _namespace2.default]);

module.exports = ClientAuthenticator;