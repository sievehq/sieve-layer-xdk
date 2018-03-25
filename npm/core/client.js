/**
 * The Layer Client; this is the top level component for any Layer based application.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   var client = new Layer.Core.Client({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     appId: 'layer:///apps/staging/ffffffff-ffff-ffff-ffff-ffffffffffff',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     challenge: function(evt) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       myAuthenticator({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         nonce: evt.nonce,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         onSuccess: evt.callback
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     ready: function(client) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       alert('I am Client; Server: Serve me!');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   }).connect('Fred')
 *
 * You can also initialize this as
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   var client = new Layer.Core.Client({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     appId: 'layer:///apps/staging/ffffffff-ffff-ffff-ffff-ffffffffffff'
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   client.on('challenge', function(evt) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     myAuthenticator({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       nonce: evt.nonce,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       onSuccess: evt.callback
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   client.on('ready', function(client) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     alert('I am Client; Server: Serve me!');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   client.connect('Fred');
 *
 * ## API Synopsis:
 *
 * The following Properties, Methods and Events are the most commonly used ones.  See the full API below
 * for the rest of the API.
 *
 * ### Properties:
 *
 * * Layer.Core.Client.userId: User ID of the authenticated user
 * * Layer.Core.Client.appId: The ID for your application
 *
 *
 * ### Methods:
 *
 * * Layer.Core.Client.createConversation(): Create a new Layer.Core.Conversation.
 * * Layer.Core.Client.createQuery(): Create a new Layer.Core.Query.
 * * Layer.Core.Client.getMessage(): Input a Message ID, and output a Layer.Core.Message or Layer.Core.Announcement from cache.
 * * Layer.Core.Client.getConversation(): Input a Conversation ID, and output a Layer.Core.Conversation from cache.
 * * Layer.Core.Client.on() and Layer.Core.Conversation.off(): event listeners
 * * Layer.Core.Client.destroy(): Cleanup all resources used by this client, including all Messages and Conversations.
 *
 * ### Events:
 *
 * * `challenge`: Provides a nonce and a callback; you call the callback once you have an Identity Token.
 * * `ready`: Your application can now start using the Layer services
 * * `messages:notify`: Used to notify your application of new messages for which a local notification may be suitable.
 *
 * ## Logging:
 *
 * There are two ways to change the log level for Layer's logger:
 *
 *     Layer.Core.Client.prototype.logLevel = Layer.Constants.LOG.INFO;
 *
 * or
 *
 *     var client = new Layer.Core.Client({
 *        appId: 'layer:///apps/staging/ffffffff-ffff-ffff-ffff-ffffffffffff',
 *        logLevel: Layer.Constants.LOG.INFO
 *     });
 *
 * @class  Layer.Core.Client
 * @extends Layer.Core.ClientAuthenticator
 * @mixin Layer.Core.mixins.ClientIdentities
 * @mixin Layer.Core.mixins.ClientMembership
 * @mixin Layer.Core.mixins.ClientConversations
 * @mixin Layer.Core.mixins.ClientChannels
 * @mixin Layer.Core.mixins.ClientMessages
 * @mixin Layer.Core.mixins.ClientQueries
 * @mixin Layer.Core.mixins.WebsocketOperations
 * @mixin Layer.Core.mixins.ClientMessageTypeModels
 */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _clientAuthenticator = require('./client-authenticator');

var _clientAuthenticator2 = _interopRequireDefault(_clientAuthenticator);

var _typingIndicatorListener = require('./typing-indicators/typing-indicator-listener');

var _typingIndicatorListener2 = _interopRequireDefault(_typingIndicatorListener);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _version = require('../version');

var _version2 = _interopRequireDefault(_version);

var _logger = require('../utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _root = require('./root');

var _root2 = _interopRequireDefault(_root);

var _typingListener = require('./typing-indicators/typing-listener');

var _typingListener2 = _interopRequireDefault(_typingListener);

var _typingPublisher = require('./typing-indicators/typing-publisher');

var _typingPublisher2 = _interopRequireDefault(_typingPublisher);

var _telemetryMonitor = require('./telemetry-monitor');

var _telemetryMonitor2 = _interopRequireDefault(_telemetryMonitor);

var _identity = require('./models/identity');

var _identity2 = _interopRequireDefault(_identity);

var _namespace = require('./namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _settings = require('../settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 

var Client = function (_ClientAuth) {
  _inherits(Client, _ClientAuth);

  /*
   * Adds conversations, messages and websockets on top of the authentication client.
   * jsdocs on parent class constructor.
   */
  function Client(options) {
    _classCallCheck(this, Client);

    var _this = _possibleConstructorReturn(this, (Client.__proto__ || Object.getPrototypeOf(Client)).call(this, options));

    _settings2.default.client = _this;

    _this._models = {};
    _this._runMixins('constructor', [options]);

    // Initialize Properties
    _this._scheduleCheckAndPurgeCacheItems = [];

    _this._initComponents();

    _this.on('online', _this._connectionRestored.bind(_this));

    _logger2.default.info(_utils2.default.asciiInit(_version2.default));
    return _this;
  }

  /* See parent method docs */


  _createClass(Client, [{
    key: '_initComponents',
    value: function _initComponents() {
      _get(Client.prototype.__proto__ || Object.getPrototypeOf(Client.prototype), '_initComponents', this).call(this);

      this._typingIndicators = new _typingIndicatorListener2.default({});
      this.telemetryMonitor = new _telemetryMonitor2.default({
        enabled: this.telemetryEnabled
      });
    }

    /**
     * Cleanup all resources (Conversations, Messages, etc...) prior to destroy or reauthentication.
     *
     * @method _cleanup
     * @private
     */

  }, {
    key: '_cleanup',
    value: function _cleanup() {
      if (this.isDestroyed) return;
      this._inCleanup = true;

      try {
        this._runMixins('cleanup', []);
      } catch (e) {
        _logger2.default.error(e);
      }

      if (this.socketManager) this.socketManager.close();
      this._inCleanup = false;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      // Cleanup all resources (Conversations, Messages, etc...)
      this._cleanup();

      this._destroyComponents();
      this.telemetryMonitor.destroy();

      _get(Client.prototype.__proto__ || Object.getPrototypeOf(Client.prototype), 'destroy', this).call(this);
      this._inCleanup = false;

      _settings2.default.client = null;
    }

    /**
     * Takes an array of Identity instances, User IDs, Identity IDs, Identity objects,
     * or Server formatted Identity Objects and returns an array of Identity instances.
     *
     * @method _fixIdentities
     * @private
     * @param {Mixed[]} identities - Something that tells us what Identity to return
     * @return {Layer.Core.Identity[]}
     */

  }, {
    key: '_fixIdentities',
    value: function _fixIdentities(identities) {
      var _this2 = this;

      return identities.map(function (identity) {
        if (identity instanceof _identity2.default) return identity;
        if (typeof identity === 'string') {
          return _this2.getIdentity(identity, true);
        } else if (identity && (typeof identity === 'undefined' ? 'undefined' : _typeof(identity)) === 'object') {
          if ('userId' in identity) {
            return _this2.getIdentity(identity.id || identity.userId);
          } else if ('user_id' in identity) {
            return _this2._createObject(identity);
          }
        }
        return null;
      });
    }

    /**
     * Takes as input an object id, and either calls getConversation() or getMessage() as needed.
     *
     * Will only get cached objects, will not get objects from the server.
     *
     * This is not a public method mostly so there's no ambiguity over using getXXX
     * or getObject.  getXXX typically has an option to load the resource, which this
     * does not.
     *
     * @method getObject
     * @param  {string} id - Message, Conversation or Query id
     * @param  {boolean} [canLoad=false] - Pass true to allow loading a object from
     *                                     the server if not found (not supported for all objects)
     * @return {Layer.Core.Message|Layer.Core.Conversation|Layer.Core.Query}
     */

  }, {
    key: 'getObject',
    value: function getObject(id) {
      var canLoad = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      switch (_utils2.default.typeFromID(id || '')) {
        case 'messages':
        case 'announcements':
          return this.getMessage(id, canLoad);
        case 'parts':
          return this.getMessagePart(id);
        case 'conversations':
          return this.getConversation(id, canLoad);
        case 'channels':
          return this.getChannel(id, canLoad);
        case 'queries':
          return this.getQuery(id);
        case 'identities':
          return this.getIdentity(id, canLoad);
        case 'members':
          return this.getMember(id, canLoad);
      }
      return null;
    }

    /**
     * Takes an object description from the server and either updates it (if cached)
     * or creates and caches it .
     *
     * @method _createObject
     * @protected
     * @param  {Object} obj - Plain javascript object representing a Message or Conversation
     */

  }, {
    key: '_createObject',
    value: function _createObject(obj) {
      var item = this.getObject(obj.id);
      if (item) {
        item._populateFromServer(obj);
        return item;
      } else {
        switch (_utils2.default.typeFromID(obj.id)) {
          case 'parts':
            return this._createMessagePartFromServer(obj);
          case 'messages':
            if (obj.conversation) {
              return this._createConversationMessageFromServer(obj);
            } else if (obj.channel) {
              return this._createChannelMessageFromServer(obj);
            }
            break;
          case 'announcements':
            return this._createAnnouncementFromServer(obj);
          case 'conversations':
            return this._createConversationFromServer(obj);
          case 'channels':
            return this._createChannelFromServer(obj);
          case 'identities':
            return this._createIdentityFromServer(obj);
          case 'members':
            return this._createMembershipFromServer(obj);
        }
      }
      return null;
    }

    /**
     * When a Layer.Core.Container's ID changes, we need to update
     * a variety of things and trigger events.
     *
     * @method _updateContainerId
     * @param {Layer.Core.Container} container
     * @param {String} oldId
     */

  }, {
    key: '_updateContainerId',
    value: function _updateContainerId(container, oldId) {
      if (container.id.match(/\/conversations\//)) {
        this._updateConversationId(container, oldId);
      } else {
        this._updateChannelId(container, oldId);
      }
    }

    /**
     * Merge events into smaller numbers of more complete events.
     *
     * Before any delayed triggers are fired, fold together all of the conversations:add
     * and conversations:remove events so that 100 conversations:add events can be fired as
     * a single event.
     *
     * @method _processDelayedTriggers
     * @private
     */

  }, {
    key: '_processDelayedTriggers',
    value: function _processDelayedTriggers() {
      if (this.isDestroyed) return;

      var addConversations = this._delayedTriggers.filter(function (evt) {
        return evt[0] === 'conversations:add';
      });
      var removeConversations = this._delayedTriggers.filter(function (evt) {
        return evt[0] === 'conversations:remove';
      });
      this._foldEvents(addConversations, 'conversations', this);
      this._foldEvents(removeConversations, 'conversations', this);

      var addMessages = this._delayedTriggers.filter(function (evt) {
        return evt[0] === 'messages:add';
      });
      var removeMessages = this._delayedTriggers.filter(function (evt) {
        return evt[0] === 'messages:remove';
      });

      this._foldEvents(addMessages, 'messages', this);
      this._foldEvents(removeMessages, 'messages', this);

      var addIdentities = this._delayedTriggers.filter(function (evt) {
        return evt[0] === 'identities:add';
      });
      var removeIdentities = this._delayedTriggers.filter(function (evt) {
        return evt[0] === 'identities:remove';
      });

      this._foldEvents(addIdentities, 'identities', this);
      this._foldEvents(removeIdentities, 'identities', this);

      _get(Client.prototype.__proto__ || Object.getPrototypeOf(Client.prototype), '_processDelayedTriggers', this).call(this);
    }
  }, {
    key: 'trigger',
    value: function trigger(eventName, evt) {
      this._triggerLogger(eventName, evt);
      return _get(Client.prototype.__proto__ || Object.getPrototypeOf(Client.prototype), 'trigger', this).call(this, eventName, evt);
    }

    /**
     * Does logging on all triggered events.
     *
     * All logging is done at `debug` or `info` levels.
     *
     * @method _triggerLogger
     * @private
     */

  }, {
    key: '_triggerLogger',
    value: function _triggerLogger(eventName, evt) {
      var infoEvents = ['conversations:add', 'conversations:remove', 'conversations:change', 'messages:add', 'messages:remove', 'messages:change', 'identities:add', 'identities:remove', 'identities:change', 'challenge', 'ready'];
      if (infoEvents.indexOf(eventName) !== -1) {
        if (evt && evt.isChange) {
          _logger2.default.info('Client Event: ' + eventName + ' ' + evt.changes.map(function (change) {
            return change.property;
          }).join(', '));
        } else {
          var text = '';
          if (evt) {
            // If the triggered event has these messages, use a simpler way of rendering info about them
            if (evt.message) text = evt.message.id;
            if (evt.messages) text = evt.messages.length + ' messages';
            if (evt.conversation) text = evt.conversation.id;
            if (evt.conversations) text = evt.conversations.length + ' conversations';
            if (evt.channel) text = evt.channel.id;
            if (evt.channels) text = evt.channels.length + ' channels';
          }
          _logger2.default.info('Client Event: ' + eventName + ' ' + text);
        }
        if (evt) _logger2.default.debug(evt);
      } else {
        _logger2.default.debug(eventName, evt);
      }
    }

    /**
     * If the session has been reset, dump all data.
     *
     * @method _resetSession
     * @private
     */

  }, {
    key: '_resetSession',
    value: function _resetSession() {
      this._cleanup();
      this._runMixins('reset', []);
      return _get(Client.prototype.__proto__ || Object.getPrototypeOf(Client.prototype), '_resetSession', this).call(this);
    }

    /**
     * Check to see if the specified objects can safely be removed from cache.
     *
     * Removes from cache if an object is not part of any Query's result set.
     *
     * @method _checkAndPurgeCache
     * @private
     * @param  {Layer.Core.Root[]} objects - Array of Messages or Conversations
     */

  }, {
    key: '_checkAndPurgeCache',
    value: function _checkAndPurgeCache(objects) {
      var _this3 = this;

      this._inCheckAndPurgeCache = true;
      objects.forEach(function (obj) {
        if (!obj.isDestroyed && !_this3._isCachedObject(obj)) {
          if (obj instanceof _root2.default === false) obj = _this3.getObject(obj.id);
          if (obj) obj.destroy();
        }
      });
      this._inCheckAndPurgeCache = false;
    }

    /**
     * Schedules _runScheduledCheckAndPurgeCache if needed, and adds this object
     * to the list of objects it will validate for uncaching.
     *
     * Note that any object that does not exist on the server (!isSaved()) is an object that the
     * app created and can only be purged by the app and not by the SDK.  Once its been
     * saved, and can be reloaded from the server when needed, its subject to standard caching.
     *
     * @method _scheduleCheckAndPurgeCache
     * @private
     * @param {Layer.Core.Root} object
     */

  }, {
    key: '_scheduleCheckAndPurgeCache',
    value: function _scheduleCheckAndPurgeCache(object) {
      var _this4 = this;

      if (object.isSaved()) {
        if (this._scheduleCheckAndPurgeCacheAt < Date.now()) {
          this._scheduleCheckAndPurgeCacheAt = Date.now() + Client.CACHE_PURGE_INTERVAL;
          setTimeout(function () {
            return _this4._runScheduledCheckAndPurgeCache();
          }, Client.CACHE_PURGE_INTERVAL);
        }
        this._scheduleCheckAndPurgeCacheItems.push(object);
      }
    }

    /**
     * Calls _checkAndPurgeCache on accumulated objects and resets its state.
     *
     * @method _runScheduledCheckAndPurgeCache
     * @private
     */

  }, {
    key: '_runScheduledCheckAndPurgeCache',
    value: function _runScheduledCheckAndPurgeCache() {
      if (this.isDestroyed) return; // Primarily triggers during unit tests
      var list = this._scheduleCheckAndPurgeCacheItems;
      this._scheduleCheckAndPurgeCacheItems = [];
      this._checkAndPurgeCache(list);
      this._scheduleCheckAndPurgeCacheAt = 0;
    }

    /**
     * Returns true if the specified object should continue to be part of the cache.
     *
     * Result is based on whether the object is part of the data for a Query.
     *
     * @method _isCachedObject
     * @private
     * @param  {Layer.Core.Root} obj - A Message or Conversation Instance
     * @return {Boolean}
     */

  }, {
    key: '_isCachedObject',
    value: function _isCachedObject(obj) {
      var list = Object.keys(this._models.queries);
      for (var i = 0; i < list.length; i++) {
        var query = this._models.queries[list[i]];
        if (query._getItem(obj.id)) return true;
      }
      return false;
    }

    /**
     * On restoring a connection, determine what steps need to be taken to update our data.
     *
     * A reset boolean property is passed; set based on  Layer.Core.ClientAuthenticator.ResetAfterOfflineDuration.
     *
     * Note it is possible for an application to have logic that causes queries to be created/destroyed
     * as a side-effect of Layer.Core.Query.reset destroying all data. So we must test to see if queries exist.
     *
     * @method _connectionRestored
     * @private
     * @param {boolean} reset - Should the session reset/reload all data or attempt to resume where it left off?
     */

  }, {
    key: '_connectionRestored',
    value: function _connectionRestored(evt) {
      var _this5 = this;

      if (evt.reset) {
        _logger2.default.debug('Client Connection Restored; Resetting all Queries');
        if (this.dbManager) {
          this.dbManager.deleteTables(function () {
            _this5.dbManager._open();
            Object.keys(_this5._models.queries).forEach(function (id) {
              var query = _this5._models.queries[id];
              if (query) query.reset();
            });
          });
        } else {
          Object.keys(this._models.queries).forEach(function (id) {
            var query = _this5._models.queries[id];
            if (query) query.reset();
          });
        }
      }
    }

    /**
     * Creates a Layer.Core.TypingIndicators.TypingListener instance
     * bound to the specified dom node.
     *
     *      var typingListener = client.createTypingListener(document.getElementById('myTextBox'));
     *      typingListener.setConversation(mySelectedConversation);
     *
     * Use this method to instantiate a listener, and call
     * Layer.Core.TypingIndicators.TypingListener.setConversation every time you want to change which Conversation
     * it reports your user is typing into.
     *
     * @method createTypingListener
     * @param  {HTMLElement} inputNode - Text input to watch for keystrokes
     * @return {Layer.Core.TypingIndicators.TypingListener}
     */

  }, {
    key: 'createTypingListener',
    value: function createTypingListener(inputNode) {
      return new _typingListener2.default({
        input: inputNode
      });
    }

    /**
     * Creates a Layer.Core.TypingIndicators.TypingPublisher.
     *
     * The TypingPublisher lets you manage your Typing Indicators without using
     * the Layer.Core.TypingIndicators.TypingListener.
     *
     *      var typingPublisher = client.createTypingPublisher();
     *      typingPublisher.setConversation(mySelectedConversation);
     *      typingPublisher.setState(Layer.Core.TypingIndicators.STARTED);
     *
     * Use this method to instantiate a listener, and call
     * Layer.Core.TypingIndicators.TypingPublisher.setConversation every time you want to change which Conversation
     * it reports your user is typing into.
     *
     * Use Layer.Core.TypingIndicators.TypingPublisher.setState to inform other users of your current state.
     * Note that the `STARTED` state only lasts for 2.5 seconds, so you
     * must repeatedly call setState for as long as this state should continue.
     * This is typically done by simply calling it every time a user hits
     * a key.
     *
     * @method createTypingPublisher
     * @return {Layer.Core.TypingIndicators.TypingPublisher}
     */

  }, {
    key: 'createTypingPublisher',
    value: function createTypingPublisher() {
      return new _typingPublisher2.default({});
    }

    /**
     * Get the current typing indicator state of a specified Conversation.
     *
     * Typically used to see if anyone is currently typing when first opening a Conversation.
     *
     * @method getTypingState
     * @param {String} conversationId
     */

  }, {
    key: 'getTypingState',
    value: function getTypingState(conversationId) {
      return this._typingIndicators.getState(conversationId);
    }
  }]);

  return Client;
}(_clientAuthenticator2.default);

/**
 * Array of items to be checked to see if they can be uncached.
 *
 * @private
 * @property {Layer.Core.Root[]}
 */


Client.prototype._scheduleCheckAndPurgeCacheItems = null;

/**
 * Time that the next call to _runCheckAndPurgeCache() is scheduled for in ms since 1970.
 *
 * @private
 * @property {number}
 */
Client.prototype._scheduleCheckAndPurgeCacheAt = 0;

/**
 * Set to false to disable telemetry gathering.
 *
 * No content nor identifiable information is gathered, only
 * usage and performance metrics.
 *
 * @property {Boolean}
 */
Client.prototype.telemetryEnabled = true;

/**
 * Gather usage and responsiveness statistics
 *
 * @private
 */
Client.prototype.telemetryMonitor = null;

/**
 * Any  Message that is part of a Query's results are kept in memory for as long as it
 * remains in that Query.  However, when a websocket event delivers new Messages  that
 * are NOT part of a Query, how long should they stick around in memory?  Why have them stick around?
 * Perhaps an app wants to post a notification of a new Message or Conversation... and wants to keep
 * the object local for a little while.  Default is 2 hours before checking to see if
 * the object is part of a Query or can be uncached.  Value is in miliseconds.
 * @static
 * @property {number}
 */

Client.CACHE_PURGE_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours * 60 minutes per hour * 60 seconds per minute * 1000 miliseconds/second

Client._ignoredEvents = ['conversations:loaded', 'conversations:loaded-error'];

Client._supportedEvents = [
/**
 * A Typing Indicator state has changed.
 *
 * Either a change has been received
 * from the server, or a typing indicator state has expired.
 *
 *      client.on('typing-indicator-change', function(evt) {
 *          if (evt.conversationId === myConversationId) {
 *              alert(evt.typing.join(', ') + ' are typing');
 *              alert(evt.paused.join(', ') + ' are paused');
 *          }
 *      });
 *
 * @event
 * @param {Layer.Core.LayerEvent} evt
 * @param {string} conversationId - ID of the Conversation users are typing into
 * @param {string[]} typing - Array of user IDs who are currently typing
 * @param {string[]} paused - Array of user IDs who are currently paused;
 *                            A paused user still has text in their text box.
 */
'typing-indicator-change'].concat(_clientAuthenticator2.default._supportedEvents);

Client.mixins = _namespace2.default.mixins.Client;

_root2.default.initClass.apply(Client, [Client, 'Client', _namespace2.default]);
module.exports = Client;