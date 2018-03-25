/**
 * Adds Channel handling to the Layer.Core.Client.
 *
 * @class Layer.Core.mixins.ClientChannels
 */
'use strict';

var _channel = require('../models/channel');

var _channel2 = _interopRequireDefault(_channel);

var _layerError = require('../layer-error');

var _channelMessage = require('../models/channel-message');

var _channelMessage2 = _interopRequireDefault(_channelMessage);

var _channelsQuery = require('../queries/channels-query');

var _channelsQuery2 = _interopRequireDefault(_channelsQuery);

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  events: [
  /**
   * One or more Layer.Core.Channel objects have been added to the client.
   *
   * They may have been added via the websocket, or via the user creating
   * a new Channel locally.
   *
   *      client.on('channels:add', function(evt) {
   *          evt.channels.forEach(function(channel) {
   *              myView.addChannel(channel);
   *          });
   *      });
   *
   * @event
   * @param {Layer.Core.LayerEvent} evt
   * @param {Layer.Core.Channel[]} evt.channels - Array of channels added
   */
  'channels:add',

  /**
   * One or more Layer.Core.Channel objects have been removed.
   *
   * A removed Channel is not necessarily deleted, its just
   * no longer being held in local memory.
   *
   * Note that typically you will want the `channels:delete` event
   * rather than channels:remove.
   *
   *      client.on('channels:remove', function(evt) {
   *          evt.channels.forEach(function(channel) {
   *              myView.removeChannel(channel);
   *          });
   *      });
   *
   * @event
   * @param {Layer.Core.LayerEvent} evt
   * @param {Layer.Core.Channel[]} evt.channels - Array of channels removed
   */
  'channels:remove',

  /**
   * A channel had a change in its properties.
   *
   * This change may have been delivered from a remote user
   * or as a result of a local operation.
   *
   *      client.on('channels:change', function(evt) {
   *          var metadataChanges = evt.getChangesFor('metadata');
   *          var participantChanges = evt.getChangesFor('members');
   *          if (metadataChanges.length) {
   *              myView.renderTitle(evt.target.metadata.title);
   *          }
   *          if (participantChanges.length) {
   *              myView.rendermembers(evt.target.members);
   *          }
   *      });
   *
   * NOTE: Typically such rendering is done using Events on Layer.Core.Query.
   *
   * @event
   * @param {Layer.Core.LayerEvent} evt
   * @param {Layer.Core.Channel} evt.target
   * @param {Object[]} evt.changes
   * @param {Mixed} evt.changes.newValue
   * @param {Mixed} evt.changes.oldValue
   * @param {string} evt.changes.property - Name of the property that has changed
   */
  'channels:change',

  /**
   * A call to Layer.Core.Channel.load has completed successfully
   *
   * @event
   * @param {Layer.Core.LayerEvent} evt
   * @param {Layer.Core.Channel} evt.target
   */
  'channels:loaded',

  /**
   * A Channel has been deleted from the server.
   *
   * Caused by either a successful call to Layer.Core.Channel.delete() on the Channel
   * or by a remote user.
   *
   *      client.on('channels:delete', function(evt) {
   *          myView.removeChannel(evt.target);
   *      });
   *
   * @event
   * @param {Layer.Core.LayerEvent} evt
   * @param {Layer.Core.Channel} evt.target
   */
  'channels:delete',

  /**
   * The channel is now on the server.
   *
   * Called after creating the channel
   * on the server.  The Result property is one of:
   *
   * * Layer.Core.Channel.CREATED: A new Channel has been created
   * * Layer.Core.Channel.FOUND: A matching Channel has been found
   *
   * All of these results will also mean that the updated property values have been
   * copied into your Channel object.  That means your metadata property may no
   * longer be its initial value; it will be the value found on the server.
   *
   *      client.on('channels:sent', function(evt) {
   *          switch(evt.result) {
   *              case Channel.CREATED:
   *                  alert(evt.target.id + ' Created!');
   *                  break;
   *              case Channel.FOUND:
   *                  alert(evt.target.id + ' Found!');
   *                  break;
   *          }
   *      });
   *
   * @event
   * @param {Layer.Core.LayerEvent} event
   * @param {string} event.result
   * @param {Layer.Core.Channel} target
   */
  'channels:sent',

  /**
   * A channel failed to load or create on the server.
   *
   *      client.on('channels:sent-error', function(evt) {
   *          alert(evt.data.message);
   *      });
   *
   * @event
   * @param {Layer.Core.LayerEvent} evt
   * @param {Layer.Core.LayerEvent} evt.data
   * @param {Layer.Core.Channel} target
   */
  'channels:sent-error'],
  lifecycle: {
    constructor: function constructor(options) {
      this._models.channels = {};
    },
    cleanup: function cleanup() {
      var _this = this;

      Object.keys(this._models.channels || {}).forEach(function (id) {
        var channel = _this._models.channels[id];
        if (channel && !channel.isDestroyed) {
          channel.destroy();
        }
      });
      this._models.channels = null;
    },
    reset: function reset() {
      this._models.channels = {};
    }
  },
  methods: {
    /**
     * Retrieve a channel by Identifier.
     *
     *      var c = client.getChannel('layer:///channels/uuid');
     *
     * If there is not a channel with that id, it will return null.
     *
     * If you want it to load it from cache and then from server if not in cache, use the `canLoad` parameter.
     * If loading from the server, the method will return
     * a Layer.Core.Channel instance that has no data; the `channels:loaded` / `channels:loaded-error` events
     * will let you know when the channel has finished/failed loading from the server.
     *
     *      var c = client.getChannel('layer:///channels/123', true)
     *      .on('channels:loaded', function() {
     *          // Render the Channel with all of its details loaded
     *          myrerender(c);
     *      });
     *      // Render a placeholder for c until the details of c have loaded
     *      myrender(c);
     *
     * Note in the above example that the `channels:loaded` event will trigger even if the Channel has previously loaded.
     *
     * @method getChannel
     * @param  {string} id
     * @param  {boolean} [canLoad=false] - Pass true to allow loading a channel from
     *                                    the server if not found
     * @return {Layer.Core.Channel}
     */
    getChannel: function getChannel(id, canLoad) {
      var result = null;

      if (typeof id !== 'string') throw new Error(_layerError.ErrorDictionary.idParamRequired);
      if (!_channel2.default.isValidId(id)) {
        id = _channel2.default.prefixUUID + id;
      }
      if (this._models.channels[id]) {
        result = this._models.channels[id];
      } else if (canLoad) {
        if (!this.isReady) throw new Error(_layerError.ErrorDictionary.clientMustBeReady);
        result = _channel2.default.load(id);
      }
      if (canLoad) result._loadType = 'fetched';
      return result;
    },


    /**
     * Adds a channel to the client.
     *
     * Typically, you do not need to call this; the following code
     * automatically calls _addChannel for you:
     *
     *      var conv = client.createChannel(['a', 'b']);
     *
     * @method _addChannel
     * @protected
     * @param  {Layer.Core.Channel} c
     */
    _addChannel: function _addChannel(channel) {
      var id = channel.id;
      if (!this._models.channels[id]) {
        // Register the Channel
        this._models.channels[id] = channel;

        // Make sure the client is set so that the next event bubbles up
        this._triggerAsync('channels:add', { channels: [channel] });

        this._scheduleCheckAndPurgeCache(channel);
      }
    },


    /**
     * Removes a channel from the client.
     *
     * Typically, you do not need to call this; the following code
     * automatically calls _removeChannel for you:
     *
     *      channel.destroy();
     *
     * @method _removeChannel
     * @protected
     * @param  {Layer.Core.Channel} c
     */
    _removeChannel: function _removeChannel(channel) {
      var _this2 = this;

      // Insure we do not get any events, such as message:remove
      channel.off(null, null, this);

      if (this._models.channels[channel.id]) {
        delete this._models.channels[channel.id];
        this._triggerAsync('channels:remove', { channels: [channel] });
      }

      // Remove any Message associated with this Channel
      Object.keys(this._models.messages || {}).forEach(function (id) {
        if (_this2._models.messages[id].channelId === channel.id) {
          _this2._models.messages[id].destroy();
        }
      });
    },


    /**
     * If the Channel ID changes, we need to reregister the Channel
     *
     * @method _updateChannelId
     * @protected
     * @param  {Layer.Core.Channel} channel - Channel whose ID has changed
     * @param  {string} oldId - Previous ID
     */
    _updateChannelId: function _updateChannelId(channel, oldId) {
      var _this3 = this;

      if (this._models.channels[oldId]) {
        this._models.channels[channel.id] = channel;
        delete this._models.channels[oldId];

        // This is a nasty way to work... but need to find and update all
        // channelId properties of all Messages or the Query's won't
        // see these as matching the query.
        Object.keys(this._models.messages).filter(function (id) {
          return _this3._models.messages[id].conversationId === oldId;
        }).forEach(function (id) {
          return _this3._models.messages[id].conversationId = channel.id;
        });
      }
    },


    /**
     * Searches locally cached channels for a matching channel.
     *
     * Iterates over channels calling a matching function until
     * the channel is found or all channels tested.
     *
     *      var c = client.findCachedChannel(function(channel) {
     *          if (channel.participants.indexOf('a') != -1) return true;
     *      });
     *
     * @method findCachedChannel
     * @param  {Function} f - Function to call until we find a match
     * @param  {Layer.Core.Channel} f.channel - A channel to test
     * @param  {boolean} f.return - Return true if the channel is a match
     * @param  {Object} [context] - Optional context for the *this* object
     * @return {Layer.Core.Channel}
     *
     * @deprecated
     * This should be replaced by iterating over your Layer.Core.Query data.
     */
    findCachedChannel: function findCachedChannel(func, context) {
      var test = context ? func.bind(context) : func;
      var list = Object.keys(this._models.channels);
      var len = list.length;
      for (var index = 0; index < len; index++) {
        var key = list[index];
        var channel = this._models.channels[key];
        if (test(channel, index)) return channel;
      }
      return null;
    },


    /**
     * This method is recommended way to create a Channel.
     *
     * ```
     *         client.createChannel({
     *             members: ['layer:///identities/a', 'layer:///identities/b'],
     *             name: 'a-channel'
     *         });
     *         client.createChannel({
     *             members: [userIdentityObjectA, userIdentityObjectB],
     *             name: 'another-channel'
     *         });
     *
     *         client.createChannel({
     *             members: ['layer:///identities/a', 'layer:///identities/b'],
     *             name: 'a-channel-with-metadata',
     *             metadata: {
     *                 topicDetails: 'I am a detail'
     *             }
     *         });
     * ```
     *
     * If you try to create a Channel with a name that already exists,
     * you will get back an existing Channel, and any requested metadata and members
     * will NOT be set; you will get whatever metadata the matching Conversation
     * already had, and no members will be added/removed.
     *
     * Whether the Channel already exists or not, a 'channels:sent' event
     * will be triggered asynchronously and the Channel object will be ready
     * at that time.  Further, the event will provide details on the result:
     *
     * ```
     *       var channel = client.createChannel({
     *          members: ['a', 'b'],
     *          name: 'yet-another-channel-with-metadata',
     *          metadata: {
     *                 topicDetails: 'I am a detail'
     *          }
     *       });
     *       channel.on('channels:sent', function(evt) {
     *           switch(evt.result) {
     *               case Channel.CREATED:
     *                   alert(channel.id + ' was created');
     *                   break;
     *               case Channel.FOUND:
     *                   alert(channel.id + ' was found');
     *                   break;
     *               case Channel.FOUND_WITHOUT_REQUESTED_METADATA:
     *                   alert(channel.id + ' was found but it already has a topicDetails so your requested detail was not set');
     *                   break;
     *            }
     *       });
     * ```
     *
     * Warning: This method will throw an error if called when you are not (or are no longer) an authenticated user.
     * That means if authentication has expired, and you have not yet reauthenticated the user, this will throw an error.
     *
     *
     * @method createChannel
     * @param  {Object} options
     * @param {string[]/Layer.Core.Identity[]} options.members - Array of UserIDs or UserIdentities
     * @param {String} options.name - The unique name for this Channel
     * @param {Object} [options.metadata={}] Metadata for your Channel
     * @return {Layer.Core.Channel}
     */
    createChannel: function createChannel(options) {
      // If we aren't authenticated, then we don't yet have a UserID, and won't create the correct Channel
      if (!this.isAuthenticated) throw new Error(_layerError.ErrorDictionary.clientMustBeReady);
      if (!('private' in options)) options.private = false;
      options._loadType = 'websocket'; // treat this the same as a websocket loaded object
      return _channel2.default.create(options);
    },
    _createChannelMessageFromServer: function _createChannelMessageFromServer(obj) {
      return _channelMessage2.default._createFromServer(obj);
    },
    _createChannelFromServer: function _createChannelFromServer(obj) {
      return _channel2.default._createFromServer(obj);
    },
    _createChannelsQuery: function _createChannelsQuery(options) {
      return new _channelsQuery2.default(options);
    }
  }
}; 

_namespace2.default.mixins.Client.push(module.exports);