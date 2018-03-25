/**
 * A Container is a parent class representing a container that manages a set of Messages.
 *
 * @class  Layer.Core.Container
 * @abstract
 * @extends Layer.Core.Syncable
 * @author  Michael Kantor
 */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _settings = require('../../settings');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _syncable = require('./syncable');

var _syncable2 = _interopRequireDefault(_syncable);

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var Container = function (_Syncable) {
  _inherits(Container, _Syncable);

  /**
   * Create a new conversation.
   *
   * The static `Layer.Core.Conversation.create()` method
   * will correctly lookup distinct Conversations and
   * return them; `new Layer.Core.Conversation()` will not.
   *
   * Developers should use `Layer.Core.Conversation.create()`.
   *
   * @method constructor
   * @protected
   * @param  {Object} options
   * @param {string[]/Layer.Core.Identity[]} options.participants - Array of Participant IDs or Layer.Core.Identity instances
   * @param {boolean} [options.distinct=true] - Is the conversation distinct
   * @param {Object} [options.metadata] - An object containing Conversation Metadata.
   * @return {Layer.Core.Conversation}
   */
  function Container() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Container);

    // Make sure the ID from handle fromServer parameter is used by the Root.constructor
    if (options.fromServer) options.id = options.fromServer.id;

    if (!options.metadata) options.metadata = {};

    var _this = _possibleConstructorReturn(this, (Container.__proto__ || Object.getPrototypeOf(Container)).call(this, options));

    _this.isInitializing = true;

    // If the options contains a full server definition of the object,
    // copy it in with _populateFromServer; this will add the Conversation
    // to the Client as well.
    if (options && options.fromServer) {
      _this._populateFromServer(options.fromServer);
    }

    if (!_this.metadata) _this.metadata = {};

    if (!_this.createdAt) {
      _this.createdAt = new Date();
    }
    _this.isInitializing = false;
    return _this;
  }

  /**
   * Send the Conversation/Channel/etc... to the server to be created there and shared with other participants.
   *
   * @method send
   * @param {Layer.Core.Message} [message]  Message being sent while creating the new resource
   * @returns this
   */


  _createClass(Container, [{
    key: 'send',
    value: function send(message) {
      var _this2 = this;

      if (this.isNew()) {
        this.createdAt = new Date();

        // Update the syncState
        this._setSyncing();

        _settings.client._triggerAsync('state-change', {
          started: true,
          type: 'send_' + _utils2.default.typeFromID(this.id),
          telemetryId: 'send_' + _utils2.default.typeFromID(this.id) + '_time',
          id: this.id
        });
        _settings.client.sendSocketRequest({
          method: 'POST',
          body: {}, // see _getSendData
          sync: {
            depends: this.id,
            target: this.id
          }
        }, function (result) {
          return _this2._createResult(result);
        });
      }
      if (message) this._setupMessage(message);
      return this;
    }

    /**
     * Populates this instance using server-data.
     *
     * Side effects add this to the Client.
     *
     * @method _populateFromServer
     * @private
     * @param  {Object} container - Server representation of the container
     */

  }, {
    key: '_populateFromServer',
    value: function _populateFromServer(container) {
      this._setSynced();

      var id = this.id;
      this.id = container.id;

      // IDs change if the server returns a matching Container
      if (id !== this.id) {
        _settings.client._updateContainerId(this, id);
        this._triggerAsync(this.constructor.eventPrefix + ':change', {
          oldValue: id,
          newValue: this.id,
          property: 'id'
        });
      }

      this.url = container.url;
      this.createdAt = new Date(container.created_at);
      this.metadata = container.metadata;
    }

    /**
     * Process result of send method.
     *
     * Note that we use _triggerAsync so that
     * events reporting changes to the Layer.Core.Conversation.id can
     * be applied before reporting on it being sent.
     *
     * Example: Query will now have the resolved Distinct IDs rather than the proposed ID
     * when this event is triggered.
     *
     * @method _createResult
     * @private
     * @param  {Object} result
     */

  }, {
    key: '_createResult',
    value: function _createResult(_ref) {
      var success = _ref.success,
          data = _ref.data;

      _settings.client._triggerAsync('state-change', {
        ended: true,
        type: 'send_' + _utils2.default.typeFromID(this.id),
        telemetryId: 'send_' + _utils2.default.typeFromID(this.id) + '_time',
        id: this.id
      });
      if (this.isDestroyed) return;
      if (success) {
        this._createSuccess(data);
      } else if (data.id === 'conflict') {
        this._createResultConflict(data);
      } else {
        this.trigger(this.constructor.eventPrefix + ':sent-error', { error: data });
        this.destroy();
      }
    }

    /**
     * Process the successful result of a create call
     *
     * @method _createSuccess
     * @private
     * @param  {Object} data Server description of Conversation/Channel
     */

  }, {
    key: '_createSuccess',
    value: function _createSuccess(data) {
      var id = this.id;
      this._populateFromServer(data);
      this._triggerAsync(this.constructor.eventPrefix + ':sent', {
        result: id === this.id ? Container.CREATED : Container.FOUND
      });
    }

    /**
     * Updates specified metadata keys.
     *
     * Updates the local object's metadata and syncs the change to the server.
     *
     *      conversation.setMetadataProperties({
     *          'title': 'I am a title',
     *          'colors.background': 'red',
     *          'colors.text': {
     *              'fill': 'blue',
     *              'shadow': 'black'
     *           },
     *           'colors.title.fill': 'red'
     *      });
     *
     * Use setMetadataProperties to specify the path to a property, and a new value for that property.
     * Multiple properties can be changed this way.  Whatever value was there before is
     * replaced with the new value; so in the above example, whatever other keys may have
     * existed under `colors.text` have been replaced by the new object `{fill: 'blue', shadow: 'black'}`.
     *
     * Note also that only string and subobjects are accepted as values.
     *
     * Keys with '.' will update a field of an object (and create an object if it wasn't there):
     *
     * Initial metadata: {}
     *
     *      conversation.setMetadataProperties({
     *          'colors.background': 'red',
     *      });
     *
     * Metadata is now: `{colors: {background: 'red'}}`
     *
     *      conversation.setMetadataProperties({
     *          'colors.foreground': 'black',
     *      });
     *
     * Metadata is now: `{colors: {background: 'red', foreground: 'black'}}`
     *
     * Executes as follows:
     *
     * 1. Updates the metadata property of the local object
     * 2. Triggers a conversations:change event
     * 3. Submits a request to be sent to the server to update the server's object
     * 4. If there is an error, no errors are fired except by Layer.Core.SyncManager, but another
     *    conversations:change event is fired as the change is rolled back.
     *
     * @method setMetadataProperties
     * @param  {Object} properties
     * @return {Layer.Core.Conversation} this
     *
     */

  }, {
    key: 'setMetadataProperties',
    value: function setMetadataProperties(props) {
      var _this3 = this;

      var layerPatchOperations = [];
      Object.keys(props).forEach(function (name) {
        var fullName = name;
        if (name) {
          if (name !== 'metadata' && name.indexOf('metadata.') !== 0) {
            fullName = 'metadata.' + name;
          }
          layerPatchOperations.push({
            operation: 'set',
            property: fullName,
            value: props[name]
          });
        }
      });

      this._inLayerParser = true;

      // Do this before setSyncing as if there are any errors, we should never even
      // start setting up a request.
      _utils2.default.layerParse({
        object: this,
        type: 'Conversation',
        operations: layerPatchOperations
      });
      this._inLayerParser = false;

      this._xhr({
        url: '',
        method: 'PATCH',
        data: JSON.stringify(layerPatchOperations),
        headers: {
          'content-type': 'application/vnd.layer-patch+json'
        }
      }, function (result) {
        if (!result.success && !_this3.isDestroyed && result.data.id !== 'authentication_required') _this3._load();
      });

      return this;
    }

    /**
     * Deletes specified metadata keys.
     *
     * Updates the local object's metadata and syncs the change to the server.
     *
     *      conversation.deleteMetadataProperties(
     *          ['title', 'colors.background', 'colors.title.fill']
     *      );
     *
     * Use deleteMetadataProperties to specify paths to properties to be deleted.
     * Multiple properties can be deleted.
     *
     * Executes as follows:
     *
     * 1. Updates the metadata property of the local object
     * 2. Triggers a conversations:change event
     * 3. Submits a request to be sent to the server to update the server's object
     * 4. If there is an error, no errors are fired except by Layer.Core.SyncManager, but another
     *    conversations:change event is fired as the change is rolled back.
     *
     * @method deleteMetadataProperties
     * @param  {string[]} properties
     * @return {Layer.Core.Conversation} this
     */

  }, {
    key: 'deleteMetadataProperties',
    value: function deleteMetadataProperties(props) {
      var _this4 = this;

      var layerPatchOperations = [];
      props.forEach(function (property) {
        if (property !== 'metadata' && property.indexOf('metadata.') !== 0) {
          property = 'metadata.' + property;
        }
        layerPatchOperations.push({
          operation: 'delete',
          property: property
        });
      }, this);

      this._inLayerParser = true;

      // Do this before setSyncing as if there are any errors, we should never even
      // start setting up a request.
      _utils2.default.layerParse({
        object: this,
        type: 'Conversation',
        operations: layerPatchOperations
      });
      this._inLayerParser = false;

      this._xhr({
        url: '',
        method: 'PATCH',
        data: JSON.stringify(layerPatchOperations),
        headers: {
          'content-type': 'application/vnd.layer-patch+json'
        }
      }, function (result) {
        if (!result.success && result.data.id !== 'authentication_required') _this4._load();
      });

      return this;
    }

    /**
     * Delete the Conversation from the server (internal version).
     *
     * This version of Delete takes a Query String that is packaged up by
     * Layer.Core.Conversation.delete and Layer.Core.Conversation.leave.
     *
     * @method _delete
     * @private
     * @param {string} queryStr - Query string for the DELETE request
     */

  }, {
    key: '_delete',
    value: function _delete(queryStr) {
      var _this5 = this;

      var id = this.id;
      this._xhr({
        method: 'DELETE',
        url: '?' + queryStr
      }, function (result) {
        return _this5._deleteResult(result, id);
      });

      this._deleted();
      this.destroy();
    }
  }, {
    key: '_handleWebsocketDelete',
    value: function _handleWebsocketDelete(data) {
      if (data.mode === _constants2.default.DELETION_MODE.MY_DEVICES && data.from_position) {
        _settings.client._purgeMessagesByPosition(this.id, data.from_position);
      } else {
        _get(Container.prototype.__proto__ || Object.getPrototypeOf(Container.prototype), '_handleWebsocketDelete', this).call(this);
      }
    }
  }, {
    key: '_getUrl',
    value: function _getUrl(url) {
      return this.url + (url || '');
    }
  }, {
    key: '_loaded',
    value: function _loaded(data) {
      this._register(this);
    }

    /**
     * Standard `on()` provided by Layer.Core.Root.
     *
     * Adds some special handling of 'conversations:loaded' so that calls such as
     *
     *      var c = client.getConversation('layer:///conversations/123', true)
     *      .on('conversations:loaded', function() {
     *          myrerender(c);
     *      });
     *      myrender(c); // render a placeholder for c until the details of c have loaded
     *
     * can fire their callback regardless of whether the client loads or has
     * already loaded the Conversation.
     *
     * @method on
     * @param  {string} eventName
     * @param  {Function} callback
     * @param  {Object} context
     * @return {Layer.Core.Conversation} this
     */

  }, {
    key: 'on',
    value: function on(name, callback, context) {
      var evtName = this.constructor.eventPrefix + ':loaded';
      var hasLoadedEvt = name === evtName || name && (typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object' && name[evtName];

      if (hasLoadedEvt && !this.isLoading && (this.isSynced() || this.isSaving())) {
        var callNow = name === evtName ? callback : name[evtName];
        _utils2.default.defer(function () {
          return callNow.apply(context);
        });
      }
      _get(Container.prototype.__proto__ || Object.getPrototypeOf(Container.prototype), 'on', this).call(this, name, callback, context);

      return this;
    }
  }, {
    key: '_triggerAsync',
    value: function _triggerAsync(evtName, args) {
      this._clearObject();
      _get(Container.prototype.__proto__ || Object.getPrototypeOf(Container.prototype), '_triggerAsync', this).call(this, evtName, args);
    }
  }, {
    key: 'trigger',
    value: function trigger(evtName, args) {
      this._clearObject();
      return _get(Container.prototype.__proto__ || Object.getPrototypeOf(Container.prototype), 'trigger', this).call(this, evtName, args);
    }
  }, {
    key: '__updateCreatedAt',
    value: function __updateCreatedAt(newValue, oldValue) {
      this._triggerAsync(this.constructor.eventPrefix + ':change', {
        property: 'createdAt',
        newValue: newValue,
        oldValue: oldValue
      });
    }

    /**
     * __ Methods are automatically called by property setters.
     *
     * Any change in the metadata property will call this method and fire a
     * change event.  Changes to the metadata object that don't replace the object
     * with a new object will require directly calling this method.
     *
     * @method __updateMetadata
     * @private
     * @param  {Object} newValue
     * @param  {Object} oldValue
     */

  }, {
    key: '__updateMetadata',
    value: function __updateMetadata(newValue, oldValue, paths) {
      if (this._inLayerParser) return;
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this._triggerAsync(this.constructor.eventPrefix + ':change', {
          property: 'metadata',
          newValue: newValue,
          oldValue: oldValue,
          paths: paths
        });
      }
    }
  }, {
    key: '_handlePatchEvent',
    value: function _handlePatchEvent(newValue, oldValue, paths) {
      if (paths[0].indexOf('metadata') === 0) {
        this.__updateMetadata(newValue, oldValue, paths);
      }
    }

    /**
     * Returns a plain object.
     *
     * Object will have all the same public properties as this
     * Conversation instance.  New object is returned any time
     * any of this object's properties change.
     *
     * @method toObject
     * @return {Object} POJO version of this.
     */

  }, {
    key: 'toObject',
    value: function toObject() {
      if (!this._toObject) {
        this._toObject = _get(Container.prototype.__proto__ || Object.getPrototypeOf(Container.prototype), 'toObject', this).call(this);
        this._toObject.metadata = _utils2.default.clone(this.metadata);
      }
      return this._toObject;
    }

    /**
     * Identifies whether a Conversation receiving the specified patch data should be loaded from the server.
     *
     * Any change to a Conversation indicates that the Conversation is active and of potential interest; go ahead and load that
     * Conversation in case the app has need of it.  In the future we may ignore changes to unread count.  Only relevant
     * when we get Websocket events for a Conversation that has not been loaded/cached on Client.
     *
     * @method _loadResourceForPatch
     * @static
     * @private
     */

  }], [{
    key: '_loadResourceForPatch',
    value: function _loadResourceForPatch(patchData) {
      return true;
    }
  }]);

  return Container;
}(_syncable2.default);

/**
 * Time that the conversation was created on the server.
 *
 * @property {Date}
 */


Container.prototype.createdAt = null;

/**
 * Metadata for the conversation.
 *
 * Metadata values can be plain objects and strings, but
 * no arrays, numbers, booleans or dates.
 * @property {Object}
 */
Container.prototype.metadata = null;

/**
 * The authenticated user is a current participant in this Conversation.
 *
 * Set to false if the authenticated user has been removed from this conversation.
 *
 * A removed user can see messages up to the time they were removed,
 * but can no longer interact with the conversation.
 *
 * A removed user can no longer see the participant list.
 *
 * Read and Delivery receipts will fail on any Message in such a Conversation.
 *
 * @property {Boolean}
 */
Container.prototype.isCurrentParticipant = true;

/**
 * Cache's a Distinct Event.
 *
 * On creating a Channel or Conversation that already exists,
 * when the send() method is called, we should trigger
 * specific events detailing the results.  Results
 * may be determined locally or on the server, but same Event may be needed.
 *
 * @property {Layer.Core.LayerEvent}
 * @private
 */
Container.prototype._sendDistinctEvent = null;

/**
 * Caches last result of toObject()
 * @property {Object}
 * @private
 */
Container.prototype._toObject = null;

/**
 * The Conversation/Channel that was requested has been created.
 *
 * Used in `conversations:sent` events.
 * @property {String}
 * @static
 */
Container.CREATED = 'Created';

/**
 * The Conversation/Channel that was requested has been found.
 *
 * This means that it did not need to be created.
 *
 * Used in `conversations:sent` events.
 * @property {String}
 * @static
 */
Container.FOUND = 'Found';

/**
 * The Conversation/Channel that was requested has been found, but there was a mismatch in metadata.
 *
 * If the createConversation request contained metadata and it did not match the Distinct Conversation
 * that matched the requested participants, then this value is passed to notify your app that the Conversation
 * was returned but does not exactly match your request.
 *
 * Used in `conversations:sent` events.
 * @property {String}
 * @static
 */
Container.FOUND_WITHOUT_REQUESTED_METADATA = 'FoundMismatch';

_root2.default.initClass.apply(Container, [Container, 'Container', _namespace2.default]);
_syncable2.default.subclasses.push(Container);
module.exports = Container;