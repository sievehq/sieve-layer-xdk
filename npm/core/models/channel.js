/**
 * A Channel object represents a dialog amongst a large set
 * of participants.
 *
 * ```
 * var channel = client.createChannel({
 *   name: "frodo-the-dodo",
 *   members: ["layer:///identities/samwise", "layer:///identities/orc-army"],
 *   metadata: {
 *     subtopic: "Sauruman is the man.  And a Saurian",
 *     tooMuchInfo: {
 *       nose: "stuffed"
 *     }
 *   }
 * });
 *
 * channel.createMessage("Please don't eat me").send();
 * ```
 * NOTE: Sending a Message creates the Channel; this avoids having lots of unused channels being created.
 *
 * Key methods, events and properties for getting started:
 *
 * Properties:
 *
 * * Layer.Core.Channel.id: this property is worth being familiar with; it identifies the
 *   Channel and can be used in `client.getChannel(id)` to retrieve it.
 * * Layer.Core.Channel.name: this property names the channel; this may be human readable, though for localization purposes,
 *   you may instead want to use a common name that is distinct from your displayed name.  There can only be a single
 *   channel with a given name per app.
 * * Layer.Core.Channel.membership: Contains status information about your user's role in this Channel.
 * * Layer.Core.Channel.isCurrentParticipant: Shorthand for determining if your user is a member of the Channel.
 *
 * Methods:
 *
 * * Layer.Core.Channel.join() to join the Channel
 * * Layer.Core.Channel.leave() to leave the Channel
 * * Layer.Core.Channel.on() and Layer.Core.Channel.off(): event listeners built on top of the `backbone-events-standalone` npm project
 * * Layer.Core.Channel.createMessage() to send a message on the Channel.
 *
 * Events:
 *
 * * `channels:change`: Useful for observing changes to Channel name
 *   and updating rendering of your Channel
 *
 * Finally, to access a list of Messages in a Channel, see Layer.Core.Query.
 *
 * @class  Layer.Core.Channel
 * @experimental This feature is incomplete, and available as Preview only.
 * @extends Layer.Core.Container
 * @author  Michael Kantor
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _settings = require('../../settings');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

var _syncable = require('./syncable');

var _syncable2 = _interopRequireDefault(_syncable);

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _channelMessage = require('./channel-message');

var _channelMessage2 = _interopRequireDefault(_channelMessage);

var _layerError = require('../layer-error');

var _layerEvent = require('../layer-event');

var _layerEvent2 = _interopRequireDefault(_layerEvent);

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var Channel = function (_Container) {
  _inherits(Channel, _Container);

  function Channel() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Channel);

    // Setup default values
    if (!options.membership) options.membership = {};

    var _this = _possibleConstructorReturn(this, (Channel.__proto__ || Object.getPrototypeOf(Channel)).call(this, options));

    _this._members = _settings.client._fixIdentities(options.members || []).map(function (item) {
      return item.id;
    });
    _this._register();
    return _this;
  }

  /**
   * Destroy the local copy of this Channel, cleaning up all resources
   * it consumes.
   *
   * @method destroy
   */


  _createClass(Channel, [{
    key: 'destroy',
    value: function destroy() {
      this.lastMessage = null;
      _settings.client._removeChannel(this);
      _get(Channel.prototype.__proto__ || Object.getPrototypeOf(Channel.prototype), 'destroy', this).call(this);
      this.membership = null;
    }

    /**
     * Create a new Layer.Core.Message.ChannelMessage instance within this conversation
     *
     *      var message = channel.createMessage('hello');
     *
     *      var message = channel.createMessage({
     *          parts: [new Layer.Core.MessagePart({
     *                      body: 'hello',
     *                      mimeType: 'text/plain'
     *                  })]
     *      });
     *
     * See Layer.Core.Message.ChannelMessage for more options for creating the message.
     *
     * @method createMessage
     * @param  {String|Object} options - If its a string, a MessagePart is created around that string.
     * @param {Layer.Core.MessagePart[]} options.parts - A Set or array of MessageParts. If its a string, it will be turned into a Textual Message Part.
     * @return {Layer.Core.Message.ChannelMessage}
     */

  }, {
    key: 'createMessage',
    value: function createMessage() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var messageConfig = void 0;
      if (typeof options === 'string') {
        messageConfig = {
          parts: [{
            body: JSON.stringify({ text: options }),
            mimeType: _constants2.default.STANDARD_MIME_TYPES.TEXT + ';role=root'
          }]
        };
      } else {
        messageConfig = options;
      }
      messageConfig.conversationId = this.id;
      messageConfig._loadType = 'websocket'; // treat this the same as a websocket loaded object

      return new _channelMessage2.default(messageConfig);
    }
  }, {
    key: '_setupMessage',
    value: function _setupMessage(message) {
      message.position = Channel.nextPosition;
      Channel.nextPosition += 8192;
    }

    /**
     * Gets the data for a Create request.
     *
     * The Layer.Core.SyncManager needs a callback to create the Conversation as it
     * looks NOW, not back when `send()` was called.  This method is called
     * by the Layer.Core.SyncManager to populate the POST data of the call.
     *
     * @method _getSendData
     * @private
     * @return {Object} Websocket data for the request
     */

  }, {
    key: '_getSendData',
    value: function _getSendData(data) {
      var isMetadataEmpty = _utils2.default.isEmpty(this.metadata);
      var members = this._members || [];
      if (members.indexOf(_settings.client.user.id) === -1) members.push(_settings.client.user.id);
      return {
        method: 'Channel.create',
        data: {
          name: this.name,
          metadata: isMetadataEmpty ? null : this.metadata,
          id: this.id,
          members: members
        }
      };
    }

    /**
     * Populates this instance using server-data.
     *
     * Side effects add this to the Client.
     *
     * @method _populateFromServer
     * @private
     * @param  {Object} channel - Server representation of the channel
     */

  }, {
    key: '_populateFromServer',
    value: function _populateFromServer(channel) {
      this._inPopulateFromServer = true;

      // Disable events if creating a new Conversation
      // We still want property change events for anything that DOES change
      this._disableEvents = this.syncState === _constants2.default.SYNC_STATE.NEW;
      this.name = channel.name;

      this.isCurrentParticipant = Boolean(channel.membership);
      this.membership = !channel.membership || !channel.membership.id ? null : _settings.client._createObject(channel.membership);

      _get(Channel.prototype.__proto__ || Object.getPrototypeOf(Channel.prototype), '_populateFromServer', this).call(this, channel);
      this._register();

      this._disableEvents = false;
    }
  }, {
    key: '_createResultConflict',
    value: function _createResultConflict(data) {
      var channel = data.data;
      if (channel) {
        this._createSuccess(channel);
      } else {
        this.syncState = _constants2.default.SYNC_STATE.NEW;
        this._syncCounter = 0;
        this.trigger('channels:sent-error', { error: data });
      }

      this._inPopulateFromServer = false;
    }

    /**
     * Validation done on the name; triggered via setter before value is written.
     *
     * @method __adjustName
     * @private
     * @param {String} newValue
     */

  }, {
    key: '__adjustName',
    value: function __adjustName(newValue) {
      if (this._inPopulateFromServer || this._inLayerParser || this.isNew() || this.isLoading) return;
      throw new Error(_layerError.ErrorDictionary.permissionDenied);
    }

    /**
     * __ Methods are automatically called by property setters.
     *
     * Any change in the name property will call this method and fire a
     * change event.
     *
     * @method __updateName
     * @private
     * @param  {string} newValue
     * @param  {string} oldValue
     */

  }, {
    key: '__updateName',
    value: function __updateName(newValue, oldValue) {
      this._triggerAsync('channels:change', {
        property: 'name',
        oldValue: oldValue,
        newValue: newValue
      });
    }

    /**
     * Add the following members to the Channel.
     *
     * Unlike Conversations, Channels do not maintain state information about their members.
     * As such, if the operation fails there is no actual state change
     * for the channel.  Currently the only errors exposed are from the Layer.Core.Client.SyncManager.
     *
     * @method addMembers
     * @param {String[]} members   Identity IDs of users to add to this Channel
     * @return {Layer.Core.Channel} this
     *
     *
     *
     *
     *
     * @ignore until server supports it
     */

  }, {
    key: 'addMembers',
    value: function addMembers(members) {
      var _this2 = this;

      members = _settings.client._fixIdentities(members).map(function (item) {
        return item.id;
      });
      if (this.syncState === _constants2.default.SYNC_STATE.NEW) {
        this._members = this._members.concat(members);
        return this;
      }

      // TODO: Should use the bulk operation when it becomes available.
      members.forEach(function (identityId) {
        _this2._xhr({
          url: '/members/' + identityId.replace(/^layer:\/\/\/identities\//, ''),
          method: 'PUT'
        });
      });
      return this;
    }

    /**
     * Remove the following members from the Channel.
     *
     * Not yet supported.
     *
     * @method removeMembers
     * @param {String[]} members   Identity IDs of users to remove from this Channel
     * @return {Layer.Core.Channel} this
     *
     *
     *
     *
     *
     * @ignore until server supports it
     */

  }, {
    key: 'removeMembers',
    value: function removeMembers(members) {
      var _this3 = this;

      members = _settings.client._fixIdentities(members).map(function (item) {
        return item.id;
      });

      if (this.syncState === _constants2.default.SYNC_STATE.NEW) {
        members.forEach(function (id) {
          var index = _this3._members.indexOf(id);
          if (index !== -1) _this3._members.splice(index, 1);
        });
        return this;
      }

      // TODO: Should use the bulk operation when it becomes available.
      members.forEach(function (identityId) {
        _this3._xhr({
          url: '/members/' + identityId.replace(/^layer:\/\/\/identities\//, ''),
          method: 'DELETE'
        });
      });
      return this;
    }

    /**
     * Add the current user to this channel.
     *
     * @method join
     * @return {Layer.Core.Channel} this
     *
     *
     *
     *
     *
     * @ignore until server supports it
     */

  }, {
    key: 'join',
    value: function join() {
      return this.addMembers([_settings.client.user.id]);
    }

    /**
     * remove the current user from this channel.
     *
     * @method leave
     * @return {Layer.Core.Channel} this
     *
     *
     *
     *
     * @ignore until server supports it
     */

  }, {
    key: 'leave',
    value: function leave() {
      return this.removeMembers([_settings.client.user.id]);
    }

    /**
     * Return a Membership object for the specified Identity ID.
     *
     * If `members:loaded` is triggered, then your membership object
     * has been populated with data.
     *
     * If `members:loaded-error` is triggered, then your membership object
     * could not be loaded, either you have a connection error, or the user is not a member.
     *
     * ```
     * var membership = channel.getMember('FrodoTheDodo');
     * membership.on('membership:loaded', function(evt) {
     *    alert('He IS a member, quick, kick him out!');
     * });
     * membership.on('membership:loaded-error', function(evt) {
     *    if (evt.error.id === 'not_found') {
     *      alert('Sauruman, he is with the Elves!');
     *    } else {
     *      alert('Sauruman, would you please pick up your Palantir already? I can't connect!');
     *    }
     * });
     * ```
     * @method getMember
     * @param {String} identityId
     * @returns {Layer.Core.Membership}
     */

  }, {
    key: 'getMember',
    value: function getMember(identityId) {
      identityId = _settings.client._fixIdentities([identityId])[0].id;
      var membershipId = this.id + '/members/' + identityId.replace(/layer:\/\/\/identities\//, '');
      return _settings.client.getMember(membershipId, true);
    }

    /**
     * Delete the channel; not currently supported.
     *
     * @method delete
     */

  }, {
    key: 'delete',
    value: function _delete() {
      this._delete('');
    }

    /**
     * LayerPatch will call this after changing any properties.
     *
     * Trigger any cleanup or events needed after these changes.
     *
     * TODO: Move this to Layer.Core.Container
     *
     * @method _handlePatchEvent
     * @private
     * @param  {Mixed} newValue - New value of the property
     * @param  {Mixed} oldValue - Prior value of the property
     * @param  {string[]} paths - Array of paths specifically modified: ['participants'], ['metadata.keyA', 'metadata.keyB']
     */

  }, {
    key: '_handlePatchEvent',
    value: function _handlePatchEvent(newValue, oldValue, paths) {
      // Certain types of __update handlers are disabled while values are being set by
      // layer patch parser because the difference between setting a value (triggers an event)
      // and change a property of a value (triggers only this callback) result in inconsistent
      // behaviors.  Enable them long enough to allow __update calls to be made
      this._inLayerParser = false;
      try {
        var events = this._disableEvents;
        this._disableEvents = false;
        _get(Channel.prototype.__proto__ || Object.getPrototypeOf(Channel.prototype), '_handlePatchEvent', this).call(this, newValue, oldValue, paths);
        this._disableEvents = events;
      } catch (err) {
        // do nothing
      }
      this._inLayerParser = true;
    }

    /**
     * Register this Channel with the Client
     *
     * @method _register
     * @private
     */

  }, {
    key: '_register',
    value: function _register() {
      _settings.client._addChannel(this);
    }
  }, {
    key: '_deleteResult',
    value: function _deleteResult(result, id) {
      if (!result.success && (!result.data || result.data.id !== 'not_found' && result.data.id !== 'authentication_required')) {
        Channel.load(id);
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
        this._toObject = _get(Channel.prototype.__proto__ || Object.getPrototypeOf(Channel.prototype), 'toObject', this).call(this);
        this._toObject.membership = _utils2.default.clone(this.membership);
      }
      return this._toObject;
    }

    /**
     * Create a channel instance from a server representation of the channel.
     *
     * If the Channel already exists, will update the existing copy with
     * presumably newer values.
     *
     * @method _createFromServer
     * @protected
     * @static
     * @param  {Object} channel - Server representation of a Channel
     * @return {Layer.Core.Channel}
     */

  }], [{
    key: '_createFromServer',
    value: function _createFromServer(channel) {
      return new Channel({
        fromServer: channel,
        _fromDB: channel._fromDB
      });
    }

    /**
     * Find or create a new Channel.
     *
     *      var channel = Layer.Core.Channel.create({
     *          members: ['a', 'b'],
     *          private: true,
     *          metadata: {
     *              titleDetails: 'I am not a detail!'
     *          },
     *          'channels:loaded': function(evt) {
     *
     *          }
     *      });
     *
     * Recommend using `client.createChannel({...})`
     * instead of `Channel.create({...})`.
     *
     * @method create
     * @static
     * @protected
     * @param  {Object} options
     * @param  {string[]/Layer.Core.Identity[]} options.members - Array of Participant IDs or Layer.Core.Identity objects to create a channel with.
     * @param {boolean} [options.private=false] - Create a private channel
     * @param {Object} [options.metadata={}] - Initial metadata for Channel
     * @return {Layer.Core.Channel}
     */

  }, {
    key: 'create',
    value: function create(options) {
      if (!options.name) options.name = 'channel-' + String(Math.random()).replace(/\./, '');
      var newOptions = {
        name: options.name,
        private: options.private,
        members: options.members ? _settings.client._fixIdentities(options.members).map(function (item) {
          return item.id;
        }) : [],
        metadata: options.metadata
      };

      var channel = _settings.client.findCachedChannel(function (aChannel) {
        return aChannel.name === newOptions.name;
      });

      if (channel) {
        channel._sendDistinctEvent = new _layerEvent2.default({
          target: channel,
          result: !options.metadata || _utils2.default.doesObjectMatch(options.metadata, channel.metadata) ? Channel.FOUND : Channel.FOUND_WITHOUT_REQUESTED_METADATA
        }, 'channels:sent');
      }

      return channel || new Channel(newOptions);
    }
  }]);

  return Channel;
}(_container2.default);

/**
 * The Channel's name; this must be unique.
 *
 * Note that while you can use a displayable human readable name, you may also choose to use this
 * as an ID that you can easily localize to different languages.
 *
 * Must not be a UUID.
 *
 * @property {String} name
 */


Channel.prototype.name = '';

/**
 * The `membership` object contains details of this user's membership within this channel.
 *
 * NOTE: Initially, only `isMember` will be available.
 *
 * ```
 * {
 *     "isMember": true,
 *     "role": "user",
 *     "lastUnreadMessageId: "layer:///messages/UUID"
 * }
 * ```
 * @property {Object}
 */
Channel.prototype.membership = null;

Channel.prototype._members = null;

Channel.eventPrefix = 'channels';

// Math.pow(2, 64); a number larger than Number.MAX_SAFE_INTEGER, and larger than Java's Max Unsigned Long. And an easy to work with
// factor of 2
Channel.nextPosition = 18446744073709552000;

/**
 * Prefix to use when generating an ID for instances of this class
 * @property {String}
 * @static
 * @private
 */
Channel.prefixUUID = 'layer:///channels/';

Channel._supportedEvents = [

/**
 * The conversation is now on the server.
 *
 * Called after successfully creating the conversation
 * on the server.  The Result property is one of:
 *
 * * Channel.CREATED: A new Channel has been created
 * * Channel.FOUND: A matching named Channel has been found
 *
 * @event
 * @param {Layer.Core.LayerEvent} event
 * @param {string} event.result
 */
'channels:sent',

/**
 * An attempt to send this channel to the server has failed.
 * @event
 * @param {Layer.Core.LayerEvent} event
 * @param {Layer.Core.LayerEvent} event.error
 */
'channels:sent-error',

/**
 * The conversation is now loaded from the server.
 *
 * Note that this is only used in response to the Layer.Core.Channel.load() method.
 * from the server.
 * @event
 * @param {Layer.Core.LayerEvent} event
 */
'channels:loaded',

/**
 * An attempt to load this conversation from the server has failed.
 *
 * Note that this is only used in response to the Layer.Core.Channel.load() method.
 * @event
 * @param {Layer.Core.LayerEvent} event
 * @param {Layer.Core.LayerEvent} event.error
 */
'channels:loaded-error',

/**
 * The conversation has been deleted from the server.
 *
 * Caused by either a successful call to delete() on this instance
 * or by a remote user.
 * @event
 * @param {Layer.Core.LayerEvent} event
 */
'channels:delete',

/**
 * This channel has changed.
 *
 * @event
 * @param {Layer.Core.LayerEvent} event
 * @param {Object[]} event.changes - Array of changes reported by this event
 * @param {Mixed} event.changes.newValue
 * @param {Mixed} event.changes.oldValue
 * @param {string} event.changes.property - Name of the property that changed
 * @param {Layer.Core.Conversation} event.target
 */
'channels:change'].concat(_syncable2.default._supportedEvents);

_root2.default.initClass.apply(Channel, [Channel, 'Channel', _namespace2.default]);
_syncable2.default.subclasses.push(Channel);
module.exports = Channel;