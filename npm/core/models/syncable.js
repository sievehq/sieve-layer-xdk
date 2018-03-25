/**
 * The Syncable abstract clas represents resources that are syncable with the server.
 * This is currently used for Messages and Conversations.
 * It represents the state of the object's sync, as one of:
 *
 *  * Layer.Constants.SYNC_STATE.NEW: Newly created; local only.
 *  * Layer.Constants.SYNC_STATE.SAVING: Newly created; being sent to the server
 *  * Layer.Constants.SYNC_STATE.SYNCING: Exists on both client and server, but changes are being sent to server.
 *  * Layer.Constants.SYNC_STATE.SYNCED: Exists on both client and server and is synced.
 *  * Layer.Constants.SYNC_STATE.LOADING: Exists on server; loading it into client.
 *
 * @class Layer.Core.Syncable
 * @extends Layer.Core.Root
 * @abstract
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

var _layerError = require('../layer-error');

var _constants = require('../../constants');

var _settings = require('../../settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 

var Syncable = function (_Root) {
  _inherits(Syncable, _Root);

  function Syncable() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Syncable);

    var _this = _possibleConstructorReturn(this, (Syncable.__proto__ || Object.getPrototypeOf(Syncable)).call(this, options));

    _this.localCreatedAt = new Date();
    return _this;
  }

  /**
   * Fire an XHR request using the URL for this resource.
   *
   * For more info on xhr method parameters see {@link Layer.Core.Client#xhr}
   *
   * @method _xhr
   * @protected
   * @return {Layer.Core.Syncable} this
   */


  _createClass(Syncable, [{
    key: '_xhr',
    value: function _xhr(options, callback) {
      var _this2 = this;

      // initialize
      if (!options.url) options.url = '';
      if (!options.method) options.method = 'GET';

      // Validatation
      if (this.isDestroyed) throw new Error(_layerError.ErrorDictionary.isDestroyed);
      if (!this.constructor.enableOpsIfNew && options.method !== 'POST' && options.method !== 'GET' && this.syncState === _constants.SYNC_STATE.NEW) return this;

      if (!options.url.match(/^http(s):\/\//)) {
        if (options.url && !options.url.match(/^(\/|\?)/)) options.url = '/' + options.url;
        if (!options.sync) options.url = this.url + options.url;
      }

      // Setup sync structure
      options.sync = this._setupSyncObject(options.sync);

      if (options.method !== 'GET') {
        this._setSyncing();
      }

      _settings.client.xhr(options, function (result) {
        if (result.success && options.method !== 'GET' && !_this2.isDestroyed) {
          _this2._setSynced();
        }
        if (callback) callback(result);
      });
      return this;
    }
  }, {
    key: '_getBubbleEventsTo',
    value: function _getBubbleEventsTo() {
      return _settings.client;
    }

    /**
     * Setup an object to pass in the `sync` parameter for any sync requests.
     *
     * @method _setupSyncObject
     * @private
     * @param {Object} sync - Known parameters of the sync object to be returned; or null.
     * @return {Object} fleshed out sync object
     */

  }, {
    key: '_setupSyncObject',
    value: function _setupSyncObject(sync) {
      if (sync !== false) {
        if (!sync) sync = {};
        if (!sync.target) sync.target = this.id;
      }
      return sync;
    }

    /**
     * A websocket event has been received specifying that this resource
     * has been deleted.
     *
     * @method handleWebsocketDelete
     * @protected
     * @param {Object} data
     */

  }, {
    key: '_handleWebsocketDelete',
    value: function _handleWebsocketDelete(data) {
      this._deleted();
      this.destroy();
    }

    /**
     * The Object has been deleted.
     *
     * Destroy must be called separately, and handles most cleanup.
     *
     * @method _deleted
     * @protected
     */

  }, {
    key: '_deleted',
    value: function _deleted() {
      this.trigger(this.constructor.eventPrefix + ':delete');
    }

    /**
     * Load the resource identified via a Layer ID.
     *
     * Will load the requested resource from persistence or server as needed,
     * and trigger `type-name:loaded` when its loaded.  Instance returned by this
     * method will have only ID and URL properties, all others are unset until
     * the `conversations:loaded`, `messages:loaded`, etc... event has fired.
     *
     * ```
     * var message = Layer.Core.Message.load(messageId);
     * message.once('messages:loaded', function(evt) {
     *    alert("Message loaded");
     * });
     * ```
     *
     * @method load
     * @static
     * @param {string} id - `layer:///messages/UUID`
     * @return {Layer.Core.Syncable} - Returns an empty object that will be populated once data is loaded.
     */

  }, {
    key: '_load',


    /**
     * Load this resource from the server.
     *
     * Called from the static Layer.Core.Syncable.load() method
     *
     * @method _load
     * @private
     */
    value: function _load() {
      var _this3 = this;

      this.syncState = _constants.SYNC_STATE.LOADING;
      this._xhr({
        method: 'GET',
        sync: false
      }, function (result) {
        return _this3._loadResult(result);
      });
    }
  }, {
    key: '_loadResult',
    value: function _loadResult(result) {
      var _this4 = this;

      if (this.isDestroyed) return;
      var prefix = this.constructor.eventPrefix;
      if (!result.success) {
        this.syncState = _constants.SYNC_STATE.NEW;
        this._triggerAsync(prefix + ':loaded-error', { error: result.data });
        setTimeout(function () {
          if (!_this4.isDestroyed) _this4.destroy();
        }, 100); // Insure destroyed AFTER loaded-error event has triggered
      } else {
        this._populateFromServer(result.data);
        this._loaded(result.data);
        this.trigger(prefix + ':loaded');
      }
    }

    /**
     * Processing the result of a _load() call.
     *
     * Typically used to register the object and cleanup any properties not handled by _populateFromServer.
     *
     * @method _loaded
     * @private
     * @param  {Object} data - Response data from server
     */

  }, {
    key: '_loaded',
    value: function _loaded(data) {}

    /**
     * Object is new, and is queued for syncing, but does not yet exist on the server.
     *
     * That means it is currently out of sync with the server.
     *
     * @method _setSyncing
     * @private
     */

  }, {
    key: '_setSyncing',
    value: function _setSyncing() {
      this._clearObject();
      switch (this.syncState) {
        case _constants.SYNC_STATE.SYNCED:
          this.syncState = _constants.SYNC_STATE.SYNCING;
          break;
        case _constants.SYNC_STATE.NEW:
          this.syncState = _constants.SYNC_STATE.SAVING;
          break;
      }
      this._syncCounter++;
    }

    /**
     * Object is synced with the server and up to date.
     *
     * @method _setSynced
     * @private
     */

  }, {
    key: '_setSynced',
    value: function _setSynced() {
      this._clearObject();
      if (this._syncCounter > 0) this._syncCounter--;

      this.syncState = this._syncCounter === 0 ? _constants.SYNC_STATE.SYNCED : _constants.SYNC_STATE.SYNCING;
      this.isSending = false;
    }

    /**
     * Any time the instance changes, we should clear the cached toObject value
     *
     * @method _clearObject
     * @private
     */

  }, {
    key: '_clearObject',
    value: function _clearObject() {
      this._toObject = null;
    }

    // Any time there is an event triggered, assume that its state has changed and clear its cached object.
    // See parent class for docs

  }, {
    key: '_triggerAsync',
    value: function _triggerAsync(evtName, args) {
      this._clearObject();
      _get(Syncable.prototype.__proto__ || Object.getPrototypeOf(Syncable.prototype), '_triggerAsync', this).call(this, evtName, args);
    }

    // Any time there is an event triggered, assume that its state has changed and clear its cached object.
    // See parent class for docs

  }, {
    key: 'trigger',
    value: function trigger(evtName, args) {
      this._clearObject();
      _get(Syncable.prototype.__proto__ || Object.getPrototypeOf(Syncable.prototype), 'trigger', this).call(this, evtName, args);
    }

    /**
     * Returns a plain object.
     *
     * Object will have all the same public properties as this
     * Syncable instance.  New object is returned any time
     * any of this object's properties change.
     *
     * @method toObject
     * @return {Object} POJO version of this object.
     */

  }, {
    key: 'toObject',
    value: function toObject() {
      if (!this._toObject) {
        this._toObject = _get(Syncable.prototype.__proto__ || Object.getPrototypeOf(Syncable.prototype), 'toObject', this).call(this);
        this._toObject.isNew = this.isNew();
        this._toObject.isSaving = this.isSaving();
        this._toObject.isSaved = this.isSaved();
        this._toObject.isSynced = this.isSynced();
      }
      return this._toObject;
    }

    /**
     * Convert array of Syncable instances into an array of objects that can be inserted into indexedDB.
     *
     * Values should look a lot like they would look when coming from the server.
     *
     * @method toDbObjects
     * @private
     * @param {Layer.Core.Syncable[]} items
     * @param {Function} callback
     * @return {Object[]} items
     */

  }, {
    key: 'isNew',


    /**
     * Object is new, and is not yet queued for syncing
     *
     * @method isNew
     * @returns {boolean}
     */
    value: function isNew() {
      return this.syncState === _constants.SYNC_STATE.NEW;
    }

    /**
     * Object is new, and is queued for syncing
     *
     * @method isSaving
     * @returns {boolean}
     */

  }, {
    key: 'isSaving',
    value: function isSaving() {
      return this.syncState === _constants.SYNC_STATE.SAVING;
    }

    /**
     * Object exists on server.
     *
     * @method isSaved
     * @returns {boolean}
     */

  }, {
    key: 'isSaved',
    value: function isSaved() {
      return !(this.isNew() || this.isSaving());
    }

    /**
     * Object is fully synced.
     *
     * As best we know, server and client have the same values.
     *
     * @method isSynced
     * @returns {boolean}
     */

  }, {
    key: 'isSynced',
    value: function isSynced() {
      return this.syncState === _constants.SYNC_STATE.SYNCED;
    }
  }], [{
    key: 'load',
    value: function load(id) {

      var obj = {
        id: id,
        url: _settings.client.url + id.substring(8)
      };

      if (!Syncable.sortedSubclasses) {
        Syncable.sortedSubclasses = Syncable.subclasses.filter(function (item) {
          return item.prefixUUID;
        }).sort(function (a, b) {
          return a.prefixUUID.length - b.prefixUUID.length;
        });
      }

      var ConstructorClass = Syncable.sortedSubclasses.filter(function (aClass) {
        if (aClass.prefixUUID.indexOf('layer:///') === 0) {
          return obj.id.indexOf(aClass.prefixUUID) === 0;
        } else {
          return obj.id.indexOf(aClass.prefixUUID) !== -1;
        }
      })[0];
      var syncItem = new ConstructorClass(obj);
      var typeName = ConstructorClass.eventPrefix;

      if (typeName) {
        if (!_settings.client.dbManager) {
          if (!_settings.client.isReady) {
            syncItem.syncState = _constants.SYNC_STATE.LOADING;
            _settings.client.once('ready', function () {
              return syncItem._load();
            }, syncItem);
          } else {
            syncItem._load();
          }
        } else {
          _settings.client.dbManager.getObject(typeName, id, function (item) {
            if (syncItem.isDestroyed) return;
            if (item) {
              syncItem._populateFromServer(item);
              syncItem.trigger(typeName + ':loaded');
            } else if (!_settings.client.isReady) {
              syncItem.syncState = _constants.SYNC_STATE.LOADING;
              _settings.client.once('ready', function () {
                return syncItem._load();
              }, syncItem);
            } else {
              syncItem._load();
            }
          });
        }
      } else {
        syncItem._load();
      }

      syncItem.syncState = _constants.SYNC_STATE.LOADING;
      return syncItem;
    }
  }, {
    key: 'toDbObjects',
    value: function toDbObjects(items, callback) {
      return items.map(function (item) {
        return item.toObject();
      });
    }
  }]);

  return Syncable;
}(_root2.default);

/**
 * Unique identifier.
 *
 * @property {string}
 */


Syncable.prototype.id = '';

/**
 * URL to access the object on the server.
 *
 * @property {string}
 * @readonly
 * @protected
 */
Syncable.prototype.url = '';

/**
 * The time that this client created this instance.
 *
 * This value is not tied to when it was first created on the server.  Creating a new instance
 * based on server data will result in a new `localCreateAt` value.
 *
 * @property {Date}
 */
Syncable.prototype.localCreatedAt = null;

/**
 * Temporary property indicating that the instance was loaded from local database rather than server.
 *
 * @property {boolean}
 * @private
 */
Syncable.prototype._fromDB = false;

/**
 * The current sync state of this object.
 *
 * Possible values are:
 *
 *  * Layer.Constants.SYNC_STATE.NEW: Newly created; local only.
 *  * Layer.Constants.SYNC_STATE.SAVING: Newly created; being sent to the server
 *  * Layer.Constants.SYNC_STATE.SYNCING: Exists on both client and server, but changes are being sent to server.
 *  * Layer.Constants.SYNC_STATE.SYNCED: Exists on both client and server and is synced.
 *  * Layer.Constants.SYNC_STATE.LOADING: Exists on server; loading it into client.
 *
 * @property {string}
 */
Syncable.prototype.syncState = _constants.SYNC_STATE.NEW;

/**
 * Number of sync requests that have been requested.
 *
 * Counts down to zero; once it reaches zero, all sync
 * requests have been completed.
 *
 * @property {Number}
 * @private
 */
Syncable.prototype._syncCounter = 0;

/**
 * Specifies why this object was loaded.
 *
 * Values are:
 *
 * * fetched
 * * queried
 * * websocket
 *
 * Fetched objects must be destroyed by the fetcher when done.
 *
 * Queried objects can be destroyed once the query no longer uses them.
 *
 * Websocket objects can stick around for a while but must eventually be cleaned up unless they are used by a Query.
 * Currently, a websocket object will stick around for one hour unless its used by a Query.
 * Locally created objects are treated as websocket created objects since
 * once created we get a websocket create event for them.
 *
 * @property {String} [_loadType=queried]
 * @private
 */
Syncable.prototype._loadType = 'queried';

/**
 * Prefix to use when triggering events
 * @private
 * @static
 */
Syncable.eventPrefix = '';

Syncable.enableOpsIfNew = false;

/**
 * Is the object loading from the server?
 *
 * @property {boolean}
 */
Object.defineProperty(Syncable.prototype, 'isLoading', {
  enumerable: true,
  get: function get() {
    return this.syncState === _constants.SYNC_STATE.LOADING;
  }
});

/**
 * Array of classes that are subclasses of Syncable.
 *
 * Used by Factory function.
 * @private
 */
Syncable.subclasses = [];

Syncable._supportedEvents = [].concat(_root2.default._supportedEvents);
Syncable.inObjectIgnore = _root2.default.inObjectIgnore;
module.exports = Syncable;
_namespace2.default.Syncable = Syncable;