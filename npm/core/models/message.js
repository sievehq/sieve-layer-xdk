/**
 * The Message Class represents Messages sent amongst participants
 * of of a Conversation.
 *
 * The simplest way to create and send a message is:
 *
 *      var m = conversation.createMessage('Hello there').send();
 *      var m = channel.createMessage('Hello there').send();
 *
 * For conversations that involve notifications (primarily for Android and IOS), the more common pattern is:
 *
 *      var m = conversation.createMessage('Hello there').send({text: "Message from Fred: Hello there"});
 *
 * Channels do not at this time support notifications.
 *
 * Typically, rendering would be done as follows:
 *
 *      // Create a Layer.Core.Query that loads Messages for the
 *      // specified Conversation.
 *      var query = client.createQuery({
 *        model: Query.Message,
 *        predicate: 'conversation = "' + conversation.id + '"'
 *      });
 *
 *      // Any time the Query's data changes the 'change'
 *      // event will fire.
 *      query.on('change', function(layerEvt) {
 *        renderNewMessages(query.data);
 *      });
 *
 *      // This will call will cause the above event handler to receive
 *      // a change event, and will update query.data.
 *      conversation.createMessage('Hello there').send();
 *
 * The above code will trigger the following events:
 *
 *  * Message Instance fires
 *    * messages:sending: An event that lets you modify the message prior to sending
 *    * messages:sent: The message was received by the server
 *  * Query Instance fires
 *    * change: The query has received a new Message
 *    * change:add: Same as the change event but does not receive other types of change events
 *
 * When creating a Message there are a number of ways to structure it.
 * All of these are valid and create the same exact Message:
 *
 *      // Full API style:
 *      var m = conversation.createMessage({
 *          parts: [new Layer.Core.MessagePart({
 *              body: 'Hello there',
 *              mimeType: 'text/plain'
 *          })]
 *      });
 *
 *      // Option 1: Pass in an Object instead of an array of Layer.Core.MessageParts
 *      var m = conversation.createMessage({
 *          parts: {
 *              body: 'Hello there',
 *              mimeType: 'text/plain'
 *          }
 *      });
 *
 *      // Option 2: Pass in an array of Objects instead of an array of Layer.Core.MessageParts
 *      var m = conversation.createMessage({
 *          parts: [{
 *              body: 'Hello there',
 *              mimeType: 'text/plain'
 *          }]
 *      });
 *
 *      // Option 3: Pass in a string (automatically assumes mimeType is text/plain)
 *      // instead of an array of objects.
 *      var m = conversation.createMessage({
 *          parts: 'Hello'
 *      });
 *
 *      // Option 4: Pass in an array of strings (automatically assumes mimeType is text/plain)
 *      var m = conversation.createMessage({
 *          parts: ['Hello']
 *      });
 *
 *      // Option 5: Pass in just a string and nothing else
 *      var m = conversation.createMessage('Hello');
 *
 *      // Option 6: Use addPart.
 *      var m = converseation.createMessage();
 *      m.addPart({body: "hello", mimeType: "text/plain"});
 *
 * Key methods, events and properties for getting started:
 *
 * Properties:
 *
 * * Layer.Core.Message.id: this property is worth being familiar with; it identifies the
 *   Message and can be used in `client.getMessage(id)` to retrieve it
 *   at any time.
 * * Layer.Core.Message.internalId: This property makes for a handy unique ID for use in dom nodes.
 *   It is gaurenteed not to change during this session.
 * * Layer.Core.Message.isRead: Indicates if the Message has been read yet; set `m.isRead = true`
 *   to tell the client and server that the message has been read.
 * * Layer.Core.Message.parts: A Set of Layer.Core.MessagePart classes representing the contents of the Message.
 * * Layer.Core.Message.sentAt: Date the message was sent
 * * Layer.Core.Message.sender `userId`: Conversation participant who sent the Message. You may
 *   need to do a lookup on this id in your own servers to find a
 *   displayable name for it.
 *
 * Note that the `message.sender.isMine` boolean property is a frequently useful property:
 *
 * ```
 * if (!message.sender.isMine) {
 *    alert("You didn't send this message");
 * }
 * ```
 *
 * Methods:
 *
 * * Layer.Core.Message.send(): Sends the message to the server and the other participants.
 * * Layer.Core.Message.on() and Layer.Core.Message.off(); event listeners built on top of the `backbone-events-standalone` npm project
 *
 * Events:
 *
 * * `messages:sent`: The message has been received by the server. Can also subscribe to
 *   this event from the Layer.Core.Client which is usually simpler.
 *
 * @class  Layer.Core.Message
 * @extends Layer.Core.Syncable
 */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _settings = require('../../settings');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

var _syncable = require('./syncable');

var _syncable2 = _interopRequireDefault(_syncable);

var _messagePart = require('./message-part');

var _messagePart2 = _interopRequireDefault(_messagePart);

var _layerError = require('../layer-error');

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _identity = require('./identity');

var _identity2 = _interopRequireDefault(_identity);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var Message = function (_Syncable) {
  _inherits(Message, _Syncable);

  /**
   * See Layer.Core.Conversation.createMessage()
   *
   * @method constructor
   * @return {Layer.Core.Message}
   */
  function Message() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Message);

    // Unless this is a server representation, this is a developer's shorthand;
    // fill in the missing properties around isRead/isUnread before initializing.
    if (!options.fromServer) {
      if ('isUnread' in options) {
        options.isRead = !options.isUnread && !options.is_unread;
        delete options.isUnread;
      } else {
        options.isRead = true;
      }
    } else {
      options.id = options.fromServer.id;
    }

    var parts = options.parts;
    options.parts = null;

    var _this = _possibleConstructorReturn(this, (Message.__proto__ || Object.getPrototypeOf(Message)).call(this, options));

    _this.isInitializing = true;
    if (options && options.fromServer) {
      _this._populateFromServer(options.fromServer);
      _this.__updateParts(_this.parts);
    } else {
      _this.parts = parts || new Set();
      if (_settings.client) _this.sender = _settings.client.user;
      _this.sentAt = new Date();
    }
    _this._regenerateMimeAttributesMap();
    _this.isInitializing = false;
    return _this;
  }

  _createClass(Message, [{
    key: '__adjustUpdatedAt',
    value: function __adjustUpdatedAt(date) {
      if (typeof date === 'string') return new Date(date);
    }

    /**
     * Turn input into valid Layer.Core.MessageParts.
     *
     * This method is automatically called any time the parts
     * property is set (including during intialization).  This
     * is where we convert strings into MessageParts, and instances
     * into arrays.
     *
     * @method __adjustParts
     * @private
     * @param  {Mixed} parts -- Could be a string, array, object or MessagePart instance
     * @return {Layer.Core.MessagePart[]}
     */

  }, {
    key: '__adjustParts',
    value: function __adjustParts(parts) {
      var _this2 = this;

      var adjustedParts = new Set();
      if (typeof parts === 'string') {
        adjustedParts.add(new _messagePart2.default({
          body: parts,
          mimeType: 'text/plain'
        }));
      } else if (Array.isArray(parts) || parts instanceof Set) {
        parts.forEach(function (part) {
          var result = void 0;
          if (part instanceof _messagePart2.default) {
            result = part;
          } else if (part.mime_type && !part.mimeType) {
            result = _settings.client._createObject(part);
          } else {
            result = new _messagePart2.default(part);
          }
          adjustedParts.add(result);
        });
      } else if (parts && (typeof parts === 'undefined' ? 'undefined' : _typeof(parts)) === 'object') {
        adjustedParts.add(new _messagePart2.default(parts));
      }
      this._setupPartIds(adjustedParts);

      // If we already have parts, identify the added/removed parts and process them
      if (adjustedParts) {
        var currentParts = this.parts || new Set();
        var addedParts = [];
        var removedParts = [];
        adjustedParts.forEach(function (part) {
          if (!currentParts.has(part)) addedParts.push(part);
        });
        currentParts.forEach(function (part) {
          if (!adjustedParts.has(part)) removedParts.push(part);
        });

        addedParts.forEach(function (part) {
          return part.on('messageparts:change', _this2._onMessagePartChange, _this2);
        });
        removedParts.forEach(function (part) {
          return part.destroy();
        });
      }
      return adjustedParts;
    }
  }, {
    key: '__updateParts',
    value: function __updateParts(parts) {
      this._regenerateMimeAttributesMap();
    }
  }, {
    key: '_regenerateMimeAttributesMap',
    value: function _regenerateMimeAttributesMap() {
      var _this3 = this;

      this._mimeAttributeMap = {};
      if (this.parts) this.parts.forEach(function (part) {
        return _this3._addToMimeAttributesMap(part);
      });
    }
  }, {
    key: '_addToMimeAttributesMap',
    value: function _addToMimeAttributesMap(part) {
      var map = this._mimeAttributeMap;
      Object.keys(part.mimeAttributes).forEach(function (name) {
        if (!(name in map)) map[name] = [];
        map[name].push({ part: part, value: part.mimeAttributes[name] });
      });
    }

    /**
     * Add a Layer.Core.MessagePart to this Message.
     *
     * Should only be called on an unsent Message.
     *
     * ```
     * message.addPart({mimeType: 'text/plain', body: 'Frodo really is a Dodo'});
     *
     * // OR
     * message.addPart(new Layer.Core.MessagePart({mimeType: 'text/plain', body: 'Frodo really is a Dodo'}));
     * ```
     *
     * @method addPart
     * @param  {Layer.Core.MessagePart/Object} part - A Layer.Core.MessagePart instance or a `{mimeType: 'text/plain', body: 'Hello'}` formatted Object.
     * @returns {Layer.Core.Message} this
     */

  }, {
    key: 'addPart',
    value: function addPart(part) {
      if (part) {
        var oldValue = this.parts ? [].concat(this.parts) : null;
        var mPart = part instanceof _messagePart2.default ? part : new _messagePart2.default(part);
        if (!this.parts.has(mPart)) this.parts.add(mPart);

        mPart.off('messageparts:change', this._onMessagePartChange, this); // if we already subscribed, don't create a redundant subscription
        mPart.on('messageparts:change', this._onMessagePartChange, this);
        if (!part.id) part.id = this.id + '/parts/' + (part._tmpUUID || _utils2.default.generateUUID());
        this._addToMimeAttributesMap(mPart);
        this.trigger('messages:change', {
          property: 'parts',
          oldValue: oldValue,
          newValue: this.parts
        });
        this.trigger('messages:part-added', { part: mPart });
      }
      return this;
    }

    /**
     * Any time a Part changes, the Message has changed; trigger the `messages:change` event.
     *
     * Currently, this only looks at changes to body or mimeType, and does not handle changes to url/rich content.
     *
     * @method _onMessagePartChange
     * @private
     * @param {Layer.Core.LayerEvent} evt
     */

  }, {
    key: '_onMessagePartChange',
    value: function _onMessagePartChange(evt) {
      var _this4 = this;

      evt.changes.forEach(function (change) {
        _this4._triggerAsync('messages:change', {
          property: 'parts.' + change.property,
          oldValue: change.oldValue,
          newValue: change.newValue,
          part: evt.target
        });
      });
    }

    /**
     * Your unsent Message will show up in Query results and be rendered in Message Lists.
     *
     * This method is only needed for Messages that should show up in a Message List Widget that
     * is driven by Query data, but where the Layer.Core.Message.send method has not yet been called.
     *
     * Once you have called `presend` your message should show up in your Message List.  However,
     * typically you want to be able to edit and rerender that Message. After making changes to the Message,
     * you can trigger change events:
     *
     * ```
     * var message = conversation.createMessage({parts: [{mimeType: 'custom/card', body: null}]});
     * message.presend();
     *
     * message.parts[0].body = 'Frodo is a Dodo';
     * message.trigger('messages:change');
     * ```
     *
     * Note that if using Layer UI for Web, the `messages:change` event will trigger an `onRerender` call,
     * not an `onRender` call, so the capacity to handle editing of messages will require the ability to render
     * all possible edits within `onRerender`.
     *
     * It is assumed that at some point either `send()` or `destroy()` will be called on this message
     * to complete or cancel this process.
     *
     * @method presend
     * @return this
     */

  }, {
    key: 'presend',
    value: function presend() {
      var _this5 = this;

      var conversation = this.getConversation(false);

      if (!conversation) {
        throw new Error(_layerError.ErrorDictionary.conversationMissing);
      }

      if (this.syncState !== _constants2.default.SYNC_STATE.NEW) {
        throw new Error(_layerError.ErrorDictionary.alreadySent);
      }
      conversation._setupMessage(this);

      // Make sure all data is in the right format for being rendered
      this._readAllBlobs(function () {
        _settings.client._addMessage(_this5);
      });
      return this;
    }

    /**
     * Send the message to all participants of the Conversation.
     *
     * Message must have parts and a valid conversation to send successfully.
     *
     * The send method takes a `notification` object. In normal use, it provides the same notification to ALL
     * recipients, but you can customize notifications on a per recipient basis, as well as embed actions into the notification.
     *
     * For the Full Notification API, see [Server Docs](https://docs.layer.com/reference/server_api/push_notifications.out).
     *
     * ```
     * message.send({
     *    title: "New Hobbit Message",
     *    text: "Frodo-the-Dodo: Hello Sam, what say we waltz into Mordor like we own the place?",
     *    sound: "whinyhobbit.aiff"
     * });
     * ```
     *
     * @method send
     * @param {Object} [notification]            Parameters for controling how the phones manage notifications of the new Message.
     *                                           See IOS and Android docs for details.
     * @param {String} [notification.title]      Title to show on lock screen and notification bar
     * @param {String} [notification.text]       Text of your notification
     * @param {String} [notification.sound]      Name of an audio file or other sound-related hint
     * @return {Layer.Core.Message} this
     */

  }, {
    key: 'send',
    value: function send(notification) {
      var _this6 = this;

      var conversation = this.getConversation(true);

      if (!conversation) {
        throw new Error(_layerError.ErrorDictionary.conversationMissing);
      }

      if (this.syncState !== _constants2.default.SYNC_STATE.NEW) {
        throw new Error(_layerError.ErrorDictionary.alreadySent);
      }

      if (conversation.isLoading) {
        conversation.once(conversation.constructor.eventPrefix + ':loaded', function () {
          return _this6.send(notification);
        });
        conversation._setupMessage(this);
        return this;
      }

      if (!this.parts || !this.parts.size) {
        throw new Error(_layerError.ErrorDictionary.partsMissing);
      }

      this._setSyncing();

      // Make sure that the Conversation has been created on the server
      // and update the lastMessage property
      conversation.send(this);

      // If we are sending any File/Blob objects, and their Mime Types match our test,
      // wait until the body is updated to be a string rather than File before calling _addMessage
      // which will add it to the Query Results and pass this on to a renderer that expects "text/plain" to be a string
      // rather than a blob.
      this._readAllBlobs(function () {
        // Calling this will add this to any listening Queries... so position needs to have been set first;
        // handled in conversation.send(this)
        _settings.client._addMessage(_this6);

        // allow for modification of message before sending
        _this6.trigger('messages:sending', { notification: notification });

        var data = {
          parts: new Array(_this6.parts.size),
          id: _this6.id
        };
        if (notification && _this6.conversationId) data.notification = notification;

        _this6._preparePartsForSending(data);
      });
      return this;
    }

    /**
     * Any MessagePart that contains a textual blob should contain a string before we send.
     *
     * If a MessagePart with a Blob or File as its body were to be added to the Client,
     * The Query would receive this, deliver it to apps and the app would crash.
     * Most rendering code expecting text/plain would expect a string not a File.
     *
     * When this user is sending a file, and that file is textual, make sure
     * its actual text delivered to the UI.
     *
     * @method _readAllBlobs
     * @private
     */

  }, {
    key: '_readAllBlobs',
    value: function _readAllBlobs(callback) {
      var count = 0;
      var parts = this.filterParts(function (part) {
        return _utils2.default.isBlob(part.body) && part.isTextualMimeType();
      });
      parts.forEach(function (part) {
        _utils2.default.fetchTextFromFile(part.body, function (text) {
          part.body = text;
          count++;
          if (count === parts.length) callback();
        });
      });
      if (!parts.length) callback();
    }

    /**
     * Insures that each part is ready to send before actually sending the Message.
     *
     * @method _preparePartsForSending
     * @private
     * @param  {Object} structure to be sent to the server
     */

  }, {
    key: '_preparePartsForSending',
    value: function _preparePartsForSending(data) {
      var _this7 = this;

      var count = 0;
      var parts = [];
      this.parts.forEach(function (part) {
        return parts.push(part);
      }); // convert set to array so we have the index
      parts.forEach(function (part, index) {
        part.once('parts:send', function (evt) {
          data.parts[index] = {
            mime_type: evt.mime_type,
            id: evt.id
          };
          if (evt.content) data.parts[index].content = evt.content;
          if (evt.body) data.parts[index].body = evt.body;
          if (evt.encoding) data.parts[index].encoding = evt.encoding;

          count++;
          if (count === _this7.parts.size) {
            _this7._send(data);
          }
        }, _this7);
        part._send();
      });
    }

    /**
     * Handle the actual sending.
     *
     * Layer.Core.Message.send has some potentially asynchronous
     * preprocessing to do before sending (Rich Content); actual sending
     * is done here.
     *
     * @method _send
     * @private
     */

  }, {
    key: '_send',
    value: function _send(data) {
      var _this8 = this;

      var conversation = this.getConversation(false);

      _settings.client._triggerAsync('state-change', {
        started: true,
        type: 'send_' + _utils2.default.typeFromID(this.id),
        telemetryId: 'send_' + _utils2.default.typeFromID(this.id) + '_time',
        id: this.id
      });
      this.sentAt = new Date();
      _settings.client.sendSocketRequest({
        method: 'POST',
        body: {
          method: 'Message.create',
          object_id: conversation.id,
          data: data
        },
        sync: {
          depends: [this.conversationId, this.id],
          target: this.id
        }
      }, function (success, socketData) {
        return _this8._sendResult(success, socketData);
      });
    }
  }, {
    key: '_getSendData',
    value: function _getSendData(data) {
      data.object_id = this.conversationId;
      return data;
    }

    /**
      * Layer.Core.Message.send() Success Callback.
      *
      * If successfully sending the message; triggers a 'sent' event,
      * and updates the message.id/url
      *
      * @method _sendResult
      * @private
      * @param {Object} messageData - Server description of the message
      */

  }, {
    key: '_sendResult',
    value: function _sendResult(_ref) {
      var success = _ref.success,
          data = _ref.data;

      _settings.client._triggerAsync('state-change', {
        ended: true,
        type: 'send_' + _utils2.default.typeFromID(this.id),
        telemetryId: 'send_' + _utils2.default.typeFromID(this.id) + '_time',
        result: success,
        id: this.id
      });
      if (this.isDestroyed) return;

      if (success) {
        this._populateFromServer(data);
        this._triggerAsync('messages:sent');
        this._triggerAsync('messages:change', {
          property: 'syncState',
          oldValue: _constants2.default.SYNC_STATE.SAVING,
          newValue: _constants2.default.SYNC_STATE.SYNCED
        });
      } else {
        this.trigger('messages:sent-error', { error: data });
        this.destroy();
      }
      this._setSynced();
    }

    /* NOT FOR JSDUCK
     * Standard `on()` provided by Layer.Core.Root.
     *
     * Adds some special handling of 'messages:loaded' so that calls such as
     *
     *      var m = client.getMessage('layer:///messages/123', true)
     *      .on('messages:loaded', function() {
     *          myrerender(m);
     *      });
     *      myrender(m); // render a placeholder for m until the details of m have loaded
     *
     * can fire their callback regardless of whether the client loads or has
     * already loaded the Message.
     *
     * @method on
     * @param  {string} eventName
     * @param  {Function} eventHandler
     * @param  {Object} context
     * @return {Layer.Core.Message} this
     */

  }, {
    key: 'on',
    value: function on(name, callback, context) {
      var hasLoadedEvt = name === 'messages:loaded' || name && (typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object' && name['messages:loaded'];

      if (hasLoadedEvt && !this.isLoading) {
        var callNow = name === 'messages:loaded' ? callback : name['messages:loaded'];
        _utils2.default.defer(function () {
          return callNow.apply(context);
        });
      }
      _get(Message.prototype.__proto__ || Object.getPrototypeOf(Message.prototype), 'on', this).call(this, name, callback, context);
      return this;
    }

    /**
     * Remove this Message from the system.
     *
     * This will deregister the Message, remove all events
     * and allow garbage collection.
     *
     * @method destroy
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      _settings.client._removeMessage(this);
      this.parts.forEach(function (part) {
        return part.destroy();
      });
      this.__parts = null;

      _get(Message.prototype.__proto__ || Object.getPrototypeOf(Message.prototype), 'destroy', this).call(this);
    }

    /**
     * Setup message-part ids for parts that lack that id; for locally created parts.
     *
     * @private
     * @method _setupPartIds
     * @param {Layer.Core.MessagePart[]} parts
     */

  }, {
    key: '_setupPartIds',
    value: function _setupPartIds(parts) {
      var _this9 = this;

      // Assign IDs to preexisting Parts so that we can call getPartById()
      if (parts) {
        parts.forEach(function (part) {
          if (!part.id) part.id = _this9.id + '/parts/' + (part._tmpUUID || _utils2.default.generateUUID());
        });
      }
    }

    /**
     * Populates this instance with the description from the server.
     *
     * Can be used for creating or for updating the instance.
     *
     * @method _populateFromServer
     * @protected
     * @param  {Object} m - Server description of the message
     */

  }, {
    key: '_populateFromServer',
    value: function _populateFromServer(message) {
      var _this10 = this;

      this._inPopulateFromServer = true;

      this.id = message.id;
      this.url = message.url;
      var oldPosition = this.position;
      this.position = message.position;
      this._setupPartIds(message.parts);
      var parts = new Set();
      message.parts.forEach(function (part) {
        var existingPart = _this10.getPartById(part.id);
        if (existingPart) {
          existingPart._populateFromServer(part);
          parts.add(existingPart);
        } else {
          var mPart = _messagePart2.default._createFromServer(part);
          parts.add(mPart);
        }
      });
      this.parts = parts;

      this.recipientStatus = message.recipient_status || {};

      this.isRead = 'is_unread' in message ? !message.is_unread : true;

      this.sentAt = new Date(message.sent_at);
      this.receivedAt = message.received_at ? new Date(message.received_at) : undefined;
      if (!this.updatedAt || this.updatedAt.toISOString() !== message.updated_at) {
        this.updatedAt = message.updated_at ? new Date(message.updated_at) : null;
      }

      var sender = void 0;
      if (message.sender.id) {
        sender = _settings.client.getIdentity(message.sender.id);
      }

      // Because there may be no ID, we have to bypass client._createObject and its switch statement.
      if (!sender) {
        sender = _identity2.default._createFromServer(message.sender);
      }
      this.sender = sender;

      this._setSynced();

      if (oldPosition && oldPosition !== this.position) {
        this._triggerAsync('messages:change', {
          oldValue: oldPosition,
          newValue: this.position,
          property: 'position'
        });
      }
      this._inPopulateFromServer = false;
    }

    /**
     * Returns the Message's Layer.Core.MessagePart with the specified the part ID.
     *
     * ```
     * var part = client.getMessagePart('layer:///messages/6f08acfa-3268-4ae5-83d9-6ca00000000/parts/0');
     * ```
     *
     * @method getPartById
     * @param {string} partId
     * @return {Layer.Core.MessagePart}
     */

  }, {
    key: 'getPartById',
    value: function getPartById(partId) {
      var part = this.parts ? this.filterParts(function (aPart) {
        return aPart.id === partId;
      })[0] : null;
      return part || null;
    }

    /**
     * Utility for filtering Message Parts since the Javascript Set object lacks a `filter` method.
     *
     * ```
     * var parts = message.filterParts(part => part.mimeType == "just/ducky");
     * ```
     *
     * @method filterParts
     * @param {Function} fn
     * @param {Set} [optionalParts]   If searching on parts from somewhere other than `this.parts`
     */

  }, {
    key: 'filterParts',
    value: function filterParts(fn, optionalParts) {
      var result = [];
      (optionalParts || this.parts).forEach(function (part) {
        if (!fn || fn(part)) result.push(part);
      });
      return result;
    }

    /**
     * Utility for filtering Message Parts by MIME Type.
     *
     * ```
     * var parts = message.filterPartsByMimeType("text/plain");
     * ```
     *
     * @method filterPartsByMimeType
     * @param {Function} fn
     */

  }, {
    key: 'filterPartsByMimeType',
    value: function filterPartsByMimeType(mimeType) {
      return this.filterParts(function (part) {
        return part.mimeType === mimeType;
      });
    }

    /**
     * Utility for filtering Message Parts and returning a single part.
     *
     * If no function provided just returns the first part found.
     *
     * ```
     * var randomPart = message.findPart();
     * var specificPart = message.findPart(part => part.mimeType == "dog/cat");
     * ```
     *
     * @method findPart
     * @param {Function} [fn]
     */

  }, {
    key: 'findPart',
    value: function findPart(fn) {
      var result = this.filterParts(function (part) {
        if (fn) return fn(part);
        return true;
      });
      return result[0];
    }

    /**
     * Utility for running `map` on Message Parts  since the Javascript Set object lacks a `filter` method.
     *
     * ```
     * var parts = message.mapParts(part => part.toObject());
     * ```
     *
     * @method mapParts
     * @param {Function} fn
     * @param {Set} [optionalParts]   If searching on parts from somewhere other than `this.parts`
     */

  }, {
    key: 'mapParts',
    value: function mapParts(fn, optionalParts) {
      var result = [];
      (optionalParts || this.parts).forEach(function (part) {
        result.push(fn(part));
      });
      return result;
    }

    /**
     * Returns array of Layer.Core.MessagePart that have the specified MIME Type attribute.
     *
     * ```
     * // get all parts where mime type has "lang=en-us" in it
     * var enUsParts = message.getPartsMatchingAttribute({'lang': 'en-us'});
     *
     * // Get all parts with the specified role AND parent-node-id
     * var sourcePart = message.getPartsMatchingAttribute({'parent-node-id': 'image1', 'role': 'source'});
     * ```
     *
     * @method getPartsMatchingAttribute
     * @param {Object} matches
     * @returns {Layer.Core.MessagePart[]}
     */

  }, {
    key: 'getPartsMatchingAttribute',
    value: function getPartsMatchingAttribute(matches) {
      var _this11 = this;

      var first = true;
      var results = [];
      Object.keys(matches).forEach(function (attributeName) {
        var attributeValue = matches[attributeName];
        var tmpResults = (_this11._mimeAttributeMap[attributeName] || []).filter(function (item) {
          return item.value === attributeValue;
        }).map(function (item) {
          return item.part;
        });
        if (first) {
          results = tmpResults;
          first = false;
        } else {
          results = results.filter(function (item) {
            return tmpResults.indexOf(item) !== -1;
          });
        }
      });
      return results;
    }

    /**
     * Return the Layer.Core.MessagePart that represents the root of the Message Part Tree structure for this Message.
     *
     * ```
     * var part = message.getRootPart();
     * ```
     *
     * @method getRootPart
     * @returns {Layer.Core.MessagePart}
     */

  }, {
    key: 'getRootPart',
    value: function getRootPart() {
      if (!this._rootPart) {
        this._rootPart = this.getPartsMatchingAttribute({ role: 'root' })[0] || null;
      }
      return this._rootPart;
    }

    /**
     * Creates a new Layer.Core.MessageTypeModel that represents this Message (or returns a cached version of the same).
     *
     * ```
     * var model = message.createModel();
     * ```
     *
     * @method createModel
     * @returns {Layer.Core.MessageTypeModel}
     */

  }, {
    key: 'createModel',
    value: function createModel() {
      if (!this._messageTypeModel) {
        var rootPart = this.getRootPart();
        if (rootPart) {
          this._messageTypeModel = rootPart.createModel();
        }
      }
      return this._messageTypeModel;
    }

    /**
     * Return the name of the Layer.Core.MessageTypeModel class that represents this Message; for use in simple tests.
     *
     * ```
     * if (message.getModelName() === "TextModel") {
     *    console.log("Yet another text message");
     * }
     * ```
     *
     * @method getModelName
     * @returns {String}
     */

  }, {
    key: 'getModelName',
    value: function getModelName() {
      var model = this.createModel();
      return model.getModelName();
    }

    /**
     * If there is a single message part that has the named attribute, return its value.
     *
     * If there are 0 or more than one message parts with this attribute, returns `null` instead.
     *
     * @method getAttributeValue
     * @param {String} name
     * @returns {String}
     */

  }, {
    key: 'getAttributeValue',
    value: function getAttributeValue(name) {
      if (!this._mimeAttributeMap[name] || this._mimeAttributeMap[name].length > 1) return null;
      return this._mimeAttributeMap[name][0].value;
    }

    /**
     * Accepts json-patch operations for modifying recipientStatus.
     *
     * @method _handlePatchEvent
     * @private
     * @param  {Object[]} data - Array of operations
     */

  }, {
    key: '_handlePatchEvent',
    value: function _handlePatchEvent(newValue, oldValue, paths) {
      var _this12 = this;

      this._inLayerParser = false;
      if (paths[0].indexOf('recipient_status') === 0) {
        this.__updateRecipientStatus(this.recipientStatus, oldValue);
      } else if (paths[0] === 'parts') {
        oldValue = this.filterParts(null, oldValue); // transform to array
        newValue = this.filterParts(null, newValue);
        var oldValueParts = oldValue.map(function (part) {
          return _settings.client.getMessagePart(part.id);
        }).filter(function (part) {
          return part;
        });
        var removedParts = oldValue.filter(function (part) {
          return !_settings.client.getMessagePart(part.id);
        });
        var addedParts = newValue.filter(function (part) {
          return oldValueParts.indexOf(part) === -1;
        });

        addedParts.forEach(function (part) {
          return _this12.addPart(part);
        });

        // TODO: Should fire "messages:change" event
        removedParts.forEach(function (partObj) {
          return _this12.trigger('messages:part-removed', { part: partObj });
        });
      }
      this._inLayerParser = true;
    }

    /**
     * Returns absolute URL for this resource.
     * Used by sync manager because the url may not be known
     * at the time the sync request is enqueued.
     *
     * @method _getUrl
     * @param {String} url - relative url and query string parameters
     * @return {String} full url
     * @private
     */

  }, {
    key: '_getUrl',
    value: function _getUrl(url) {
      return this.url + (url || '');
    }

    // The sync object is a hint to the sync-manager

  }, {
    key: '_setupSyncObject',
    value: function _setupSyncObject(sync) {
      if (sync !== false) {
        sync = _get(Message.prototype.__proto__ || Object.getPrototypeOf(Message.prototype), '_setupSyncObject', this).call(this, sync);
        if (!sync.depends) {
          sync.depends = [this.conversationId];
        } else if (sync.depends.indexOf(this.id) === -1) {
          sync.depends.push(this.conversationId);
        }
      }
      return sync;
    }

    /**
     * Get all text parts of the Message.
     *
     * Utility method for extracting all of the text/plain parts
     * and concatenating all of their bodys together into a single string.
     *
     * @method getText
     * @param {string} [joinStr='.  '] If multiple message parts of type text/plain, how do you want them joined together?
     * @return {string}
     * @removed
     */

    // See Root class

  }, {
    key: '_triggerAsync',
    value: function _triggerAsync(evtName, args) {
      this._clearObject();
      _get(Message.prototype.__proto__ || Object.getPrototypeOf(Message.prototype), '_triggerAsync', this).call(this, evtName, args);
    }

    // See Root class

  }, {
    key: 'trigger',
    value: function trigger(evtName, args) {
      this._clearObject();
      return _get(Message.prototype.__proto__ || Object.getPrototypeOf(Message.prototype), 'trigger', this).call(this, evtName, args);
    }

    /**
     * Identifies whether a Message receiving the specified patch data should be loaded from the server.
     *
     * Applies only to Messages that aren't already loaded; used to indicate if a change event is
     * significant enough to load the Message and trigger change events on that Message.
     *
     * At this time there are no properties that are patched on Messages via websockets
     * that would justify loading the Message from the server so as to notify the app.
     *
     * Only recipient status changes and maybe is_unread changes are sent;
     * neither of which are relevant to an app that isn't rendering that message.
     *
     * @method _loadResourceForPatch
     * @static
     * @private
     */

  }], [{
    key: '_loadResourceForPatch',
    value: function _loadResourceForPatch(patchData) {
      return false;
    }
  }]);

  return Message;
}(_syncable2.default);

/**
 * Conversation ID or Channel ID that this Message belongs to.
 *
 * @property {string}
 * @readonly
 */


Message.prototype.conversationId = '';

/**
 * Set of Layer.Core.MessagePart objects.
 *
 * Use {@link #addPart} to modify this Set.
 *
 * @property {Layer.Core.MessagePart[]}
 * @readonly
 */
Message.prototype.parts = null;

/**
 * Time that the message was sent.
 *
 * Note that a locally created Layer.Core.Message will have a `sentAt` value even
 * though its not yet sent; this is so that any rendering code doesn't need
 * to account for `null` values.  Sending the Message may cause a slight change
 * in the `sentAt` value.
 *
 * @property {Date}
 * @readonly
 */
Message.prototype.sentAt = null;

/**
 * Time that the first delivery receipt was sent by your
 * user acknowledging receipt of the message.
 * @property {Date}
 * @readonly
 */
Message.prototype.receivedAt = null;

/**
 * Identity object representing the sender of the Message.
 *
 * Most commonly used properties of Identity are:
 * * displayName: A name for your UI
 * * userId: Name for the user as represented on your system
 * * name: Represents the name of a service if the sender was an automated system.
 *
 *      <span class='sent-by'>
 *        {message.sender.displayName || message.sender.name}
 *      </span>
 *
 * @property {Layer.Core.Identity}
 * @readonly
 */
Message.prototype.sender = null;

/**
 * Position of this message within the conversation.
 *
 * NOTES:
 *
 * 1. Deleting a message does not affect position of other Messages.
 * 2. A position is not gaurenteed to be unique (multiple messages sent at the same time could
 * all claim the same position)
 * 3. Each successive message within a conversation should expect a higher position.
 *
 * @property {Number}
 * @readonly
 */
Message.prototype.position = 0;

/**
 * Hint used by Layer.Core.Client on whether to trigger a messages:notify event.
 *
 * @property {boolean}
 * @private
 */
Message.prototype._notify = false;

/**
 * This property is here for convenience only; it will always be the opposite of isRead.
 * @property {Boolean}
 * @readonly
 */
Object.defineProperty(Message.prototype, 'isUnread', {
  enumerable: true,
  get: function get() {
    return !this.isRead;
  }
});

/**
 * A map of every Message Part attribute.
 *
 * Structure is:
 *
 * ```
 * {
 *    attributeName: [
 *      {
 *        part: partWithThisValue,
 *        value: theValue
 *      },
 *      {
 *        part: partWithThisValue,
 *        value: theValue
 *      }
 *    ],
 *    attributeName2: [...]
 * }
 * ```
 * @property {Object}
 * @private
 */
Message.prototype._mimeAttributeMap = null;

/**
 * Time that the part was last updated.
 *
 * If the part was created after the message was sent, or the part was updated after the
 * part was sent then this will have a value.
 *
 * @property {Date}
 */
Message.prototype.updatedAt = null;

Message.prototype._toObject = null;

Message.prototype._rootPart = null;
Message.prototype._messageTypeModel = null;

Message.prototype._inPopulateFromServer = false;

Message.eventPrefix = 'messages';

Message.eventPrefix = 'messages';

Message.prefixUUID = 'layer:///messages/';

Message.inObjectIgnore = _syncable2.default.inObjectIgnore;

Message.imageTypes = ['image/gif', 'image/png', 'image/jpeg', 'image/jpg'];

Message._supportedEvents = [

/**
 * Message has been loaded from the server.
 *
 * Note that this is only used in response to the Layer.Core.Message.load() method.
 *
 * ```
 * var m = client.getMessage('layer:///messages/123', true)
 *    .on('messages:loaded', function() {
 *        myrerender(m);
 *    });
 * myrender(m); // render a placeholder for m until the details of m have loaded
 * ```
 *
 * @event
 * @param {Layer.Core.LayerEvent} evt
 */
'messages:loaded',

/**
 * The load method failed to load the message from the server.
 *
 * Note that this is only used in response to the Layer.Core.Message.load() method.
 * @event
 * @param {Layer.Core.LayerEvent} evt
 */
'messages:loaded-error',

/**
 * Message deleted from the server.
 *
 * Caused by a call to Layer.Core.Message.delete() or a websocket event.
 * @param {Layer.Core.LayerEvent} evt
 * @event
 */
'messages:delete',

/**
 * Message is about to be sent.
 *
 * Last chance to modify or validate the message prior to sending.
 *
 *     message.on('messages:sending', function(evt) {
 *        message.addPart({mimeType: 'application/location', body: JSON.stringify(getGPSLocation())});
 *     });
 *
 * Typically, you would listen to this event more broadly using `client.on('messages:sending')`
 * which would trigger before sending ANY Messages.
 *
 * You may also use this event to modify or remove a notification:
 *
 * ```
 * client.on('messages:sending', function(evt) {
 *   if (evt.target.getModelName() === 'ResponseModel') {
 *     evt.detail.notification.text = evt.detail.notification.title = '';
 *   }
 * });
 * ```
 *
 * @event
 * @param {Layer.Core.LayerEvent} evt
 * @param {Layer.Core.Message} evt.target
 * @param {Object} evt.detail
 * @param {Object} evt.detail.notification
 */
'messages:sending',

/**
 * Message has been received by the server.
 *
 * It does NOT indicate delivery to other users.
 *
 * It does NOT indicate messages sent by other users.
 *
 * @event
 * @param {Layer.Core.LayerEvent} evt
 */
'messages:sent',

/**
 * Server failed to receive the Message.
 *
 * Message will be deleted immediately after firing this event.
 *
 * @event
 * @param {Layer.Core.LayerEvent} evt
 * @param {Layer.Core.LayerEvent} evt.error
 */
'messages:sent-error',

/**
 * The recipientStatus property has changed.
 *
 * This happens in response to an update
 * from the server... but is also caused by marking the current user as having read
 * or received the message.
 * @event
 * @param {Layer.Core.LayerEvent} evt
 */
'messages:change',

/**
 * A new Message Part has been added
 *
 * @event
 * @param {Layer.Core.LayerEvent} evt
 * @param {Layer.Core.MessagePart} evt.part
 */
'messages:part-added',

/**
 * A new Message Part has been removed
 *
 * @event
 * @param {Layer.Core.LayerEvent} evt
 * @param {Layer.Core.MessagePart} evt.part
 */
'messages:part-removed'].concat(_syncable2.default._supportedEvents);

_root2.default.initClass.apply(Message, [Message, 'Message', _namespace2.default]);
_syncable2.default.subclasses.push(Message);
module.exports = Message;