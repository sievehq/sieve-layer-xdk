/**
 * @inheritdoc Layer.Core.Message
 *
 * @class Layer.Core.Message.ConversationMessage
 * @extends Layer.Core.Message
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _settings = require('../../settings');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

var _message = require('./message');

var _message2 = _interopRequireDefault(_message);

var _layerError = require('../layer-error');

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var ConversationMessage = function (_Message) {
  _inherits(ConversationMessage, _Message);

  function ConversationMessage(options) {
    _classCallCheck(this, ConversationMessage);

    if (options.conversation) options.conversationId = options.conversation.id;

    var _this = _possibleConstructorReturn(this, (ConversationMessage.__proto__ || Object.getPrototypeOf(ConversationMessage)).call(this, options));

    _this._disableEvents = true;
    if (!options.fromServer) _this.recipientStatus = {};else _this.__updateRecipientStatus(_this.recipientStatus);
    _this._disableEvents = false;

    _this.isInitializing = false;
    if (options && options.fromServer) {
      _settings.client._addMessage(_this);
      var status = _this.recipientStatus[_settings.client.user.id];
      if (status && status !== _constants2.default.RECEIPT_STATE.READ && status !== _constants2.default.RECEIPT_STATE.DELIVERED) {
        _utils2.default.defer(function () {
          return _this._sendReceipt('delivery');
        });
      }
    } else {
      _this.parts.forEach(function (part) {
        part._message = _this;
      });
    }
    return _this;
  }

  /**
   * Get the Layer.Core.Conversation associated with this Layer.Core.Message.ConversationMessage.
   *
   * @method getConversation
   * @param {Boolean} load       Pass in true if the Layer.Core.Conversation should be loaded if not found locally
   * @return {Layer.Core.Conversation}
   */


  _createClass(ConversationMessage, [{
    key: 'getConversation',
    value: function getConversation(load) {
      if (this.conversationId) {
        return _settings.client.getConversation(this.conversationId, load);
      }
      return null;
    }

    /**
     * On loading this one item from the server, after _populateFromServer has been called, due final setup.
     *
     * @method _loaded
     * @private
     * @param {Object} data  Data from server
     */

  }, {
    key: '_loaded',
    value: function _loaded(data) {
      this.conversationId = data.conversation.id;
      _settings.client._addMessage(this);
    }

    /**
     * Accessor called whenever the app accesses `message.recipientStatus`.
     *
     * Insures that participants who haven't yet been sent the Message are marked as Layer.Constants.RECEIPT_STATE.PENDING
     *
     * @method __getRecipientStatus
     * @param {string} pKey - The actual property key where the value is stored
     * @private
     * @return {Object}
     */

  }, {
    key: '__getRecipientStatus',
    value: function __getRecipientStatus(pKey) {
      var value = this[pKey] || {};
      var id = _settings.client.user.id;
      var conversation = this.getConversation(false);
      if (conversation) {
        conversation.participants.forEach(function (participant) {
          if (!value[participant.id]) {
            value[participant.id] = participant.id === id ? _constants2.default.RECEIPT_STATE.READ : _constants2.default.RECEIPT_STATE.PENDING;
          }
        });
      }
      return value;
    }

    /**
     * Handle changes to the recipientStatus property.
     *
     * Any time the recipientStatus property is set,
     * Recalculate all of the receipt related properties:
     *
     * 1. isRead
     * 2. readStatus
     * 3. deliveryStatus
     *
     * @method __updateRecipientStatus
     * @private
     * @param  {Object} status - Object describing the delivered/read/sent value for each participant
     *
     */

  }, {
    key: '__updateRecipientStatus',
    value: function __updateRecipientStatus(status, oldStatus) {
      var conversation = this.getConversation(false);

      if (!conversation || _utils2.default.doesObjectMatch(status, oldStatus)) return;

      var id = _settings.client.user.id;
      var isSender = this.sender.isMine;
      var userHasRead = status[id] === _constants2.default.RECEIPT_STATE.READ;

      try {
        // -1 so we don't count this user
        var userCount = conversation.participants.length - 1;

        // If sent by this user or read by this user, update isRead/unread
        if (!this.__isRead && (isSender || userHasRead)) {
          this.__isRead = true; // no __updateIsRead event fired
        }

        // Update the readStatus/deliveryStatus properties

        var _getReceiptStatus2 = this._getReceiptStatus(status, id),
            readCount = _getReceiptStatus2.readCount,
            deliveredCount = _getReceiptStatus2.deliveredCount;

        this._setReceiptStatus(readCount, deliveredCount, userCount);
      } catch (error) {}
      // Do nothing


      // Only trigger an event
      // 1. we're not initializing a new Message
      // 2. the user's state has been updated to read; we don't care about updates from other users if we aren't the sender.
      //    We also don't care about state changes to delivered; these do not inform rendering as the fact we are processing it
      //    proves its delivered.
      // 3. The user is the sender; in that case we do care about rendering receipts from other users
      if (!this.isInitializing && oldStatus) {
        var usersStateUpdatedToRead = userHasRead && oldStatus[id] !== _constants2.default.RECEIPT_STATE.READ;
        if (usersStateUpdatedToRead || isSender) {
          this._triggerAsync('messages:change', {
            oldValue: oldStatus,
            newValue: status,
            property: 'recipientStatus'
          });
        }
      }
    }

    /**
     * Get the number of participants who have read and been delivered
     * this Message
     *
     * @method _getReceiptStatus
     * @private
     * @param  {Object} status - Object describing the delivered/read/sent value for each participant
     * @param  {string} id - Identity ID for this user; not counted when reporting on how many people have read/received.
     * @return {Object} result
     * @return {number} result.readCount
     * @return {number} result.deliveredCount
     */

  }, {
    key: '_getReceiptStatus',
    value: function _getReceiptStatus(status, id) {
      var readCount = 0;
      var deliveredCount = 0;
      Object.keys(status).filter(function (participant) {
        return participant !== id;
      }).forEach(function (participant) {
        if (status[participant] === _constants2.default.RECEIPT_STATE.READ) {
          readCount++;
          deliveredCount++;
        } else if (status[participant] === _constants2.default.RECEIPT_STATE.DELIVERED) {
          deliveredCount++;
        }
      });

      return {
        readCount: readCount,
        deliveredCount: deliveredCount
      };
    }

    /**
     * Sets the Layer.Core.Message.ConversationMessage.readStatus and Layer.Core.Message.ConversationMessage.deliveryStatus properties.
     *
     * @method _setReceiptStatus
     * @private
     * @param  {number} readCount
     * @param  {number} deliveredCount
     * @param  {number} userCount
     */

  }, {
    key: '_setReceiptStatus',
    value: function _setReceiptStatus(readCount, deliveredCount, userCount) {
      if (readCount === userCount) {
        this.readStatus = _constants2.default.RECIPIENT_STATE.ALL;
      } else if (readCount > 0) {
        this.readStatus = _constants2.default.RECIPIENT_STATE.SOME;
      } else {
        this.readStatus = _constants2.default.RECIPIENT_STATE.NONE;
      }
      if (deliveredCount === userCount) {
        this.deliveryStatus = _constants2.default.RECIPIENT_STATE.ALL;
      } else if (deliveredCount > 0) {
        this.deliveryStatus = _constants2.default.RECIPIENT_STATE.SOME;
      } else {
        this.deliveryStatus = _constants2.default.RECIPIENT_STATE.NONE;
      }
    }

    /**
     * Handle changes to the isRead property.
     *
     * If someone called m.isRead = true, AND
     * if it was previously false, AND
     * if the call didn't come from Layer.Core.Message.ConversationMessage.__updateRecipientStatus,
     * Then notify the server that the message has been read.
     *
     *
     * @method __updateIsRead
     * @private
     * @param  {boolean} value - True if isRead is true.
     */

  }, {
    key: '__updateIsRead',
    value: function __updateIsRead(value) {
      if (value) {
        var conversation = this.getConversation();
        if (!this._inPopulateFromServer && (!conversation || !conversation._inMarkAllAsRead)) {
          this._sendReceipt(_constants2.default.RECEIPT_STATE.READ);
        }
        this._triggerMessageRead();
        if (conversation) conversation.unreadCount--;
      }
    }

    /**
     * Trigger events indicating changes to the isRead/isUnread properties.
     *
     * @method _triggerMessageRead
     * @private
     */

  }, {
    key: '_triggerMessageRead',
    value: function _triggerMessageRead() {
      var value = this.isRead;
      this._triggerAsync('messages:change', {
        property: 'isRead',
        oldValue: !value,
        newValue: value
      });
      this._triggerAsync('messages:change', {
        property: 'isUnread',
        oldValue: value,
        newValue: !value
      });
    }

    /**
     * Send a Read or Delivery Receipt to the server.
     *
     * For Read Receipt, you can also just write:
     *
     * ```
     * message.isRead = true;
     * ```
     *
     * You can retract a Delivery or Read Receipt; once marked as Delivered or Read, it can't go back.
     *
     * ```
     * messsage.sendReceipt(Layer.Constants.RECEIPT_STATE.READ);
     * ```
     *
     * @method sendReceipt
     * @param {string} [type=Layer.Constants.RECEIPT_STATE.READ] - One of Layer.Constants.RECEIPT_STATE.READ or Layer.Constants.RECEIPT_STATE.DELIVERY
     * @return {Layer.Core.Message.ConversationMessage} this
     */

  }, {
    key: 'sendReceipt',
    value: function sendReceipt() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _constants2.default.RECEIPT_STATE.READ;

      if (type === _constants2.default.RECEIPT_STATE.READ) {
        if (this.isRead) {
          return this;
        } else {
          // Without triggering the event, clearObject isn't called,
          // which means those using the toObject() data will have an isRead that doesn't match
          // this instance.  Which typically leads to lots of extra attempts
          // to mark the message as read.
          this.__isRead = true;
          this._triggerMessageRead();
          var conversation = this.getConversation(false);
          if (conversation) conversation.unreadCount--;
        }
      }
      this._sendReceipt(type);
      return this;
    }

    /**
     * Send a Read or Delivery Receipt to the server.
     *
     * This bypasses any validation and goes direct to sending to the server.
     *
     * NOTE: Server errors are not handled; the local receipt state is suitable even
     * if out of sync with the server.
     *
     * @method _sendReceipt
     * @private
     * @param {string} [type=read] - One of Layer.Constants.RECEIPT_STATE.READ or Layer.Constants.RECEIPT_STATE.DELIVERY
     */

  }, {
    key: '_sendReceipt',
    value: function _sendReceipt(type) {
      var _this2 = this;

      // This little test exists so that we don't send receipts on Conversations we are no longer
      // participants in (participants = [] if we are not a participant)
      var conversation = this.getConversation(false);
      if (conversation && conversation.participants.length === 0) return;

      this._setSyncing();
      this._xhr({
        url: '/receipts',
        method: 'POST',
        data: {
          type: type
        },
        sync: {
          // This should not be treated as a POST/CREATE request on the Message
          operation: 'RECEIPT'
        }
      }, function () {
        return _this2._setSynced();
      });
    }

    /**
     * Delete the Message from the server.
     *
     * This call will support various deletion modes.  Calling without a deletion mode is deprecated.
     *
     * Deletion Modes:
     *
     * * Layer.Constants.DELETION_MODE.ALL: This deletes the local copy immediately, and attempts to also
     *   delete the server's copy.
     * * Layer.Constants.DELETION_MODE.MY_DEVICES: Deletes this Message from all of my devices; no effect on other users.
     *
     * @method delete
     * @param {String} deletionMode
     */
    // Abstract Method

  }, {
    key: 'delete',
    value: function _delete(mode) {
      if (this.isDestroyed) throw new Error(_layerError.ErrorDictionary.isDestroyed);
      var queryStr = void 0;
      switch (mode) {
        case _constants2.default.DELETION_MODE.ALL:
        case true:
          queryStr = 'mode=all_participants';
          break;
        case _constants2.default.DELETION_MODE.MY_DEVICES:
          queryStr = 'mode=my_devices';
          break;
        default:
          throw new Error(_layerError.ErrorDictionary.deletionModeUnsupported);
      }

      var id = this.id;
      this._xhr({
        url: '?' + queryStr,
        method: 'DELETE'
      }, function (result) {
        if (!result.success && (!result.data || result.data.id !== 'not_found' && result.data.id !== 'authentication_required')) {
          _message2.default.load(id);
        }
      });

      this._deleted();
      this.destroy();
    }
  }, {
    key: 'toObject',
    value: function toObject() {
      if (!this._toObject) {
        this._toObject = _get(ConversationMessage.prototype.__proto__ || Object.getPrototypeOf(ConversationMessage.prototype), 'toObject', this).call(this);
        this._toObject.recipientStatus = _utils2.default.clone(this.recipientStatus);
      }
      return this._toObject;
    }

    /*
     * Creates a message from the server's representation of a message.
     *
     * Similar to _populateFromServer, however, this method takes a
     * message description and returns a new message instance using _populateFromServer
     * to setup the values.
     *
     * @method _createFromServer
     * @protected
     * @static
     * @param  {Object} message - Server's representation of the message
     * @return {Layer.Core.Message.ConversationMessage}
     */

  }], [{
    key: '_createFromServer',
    value: function _createFromServer(message) {
      var fromWebsocket = message.fromWebsocket;
      var conversationId = void 0;
      if (message.conversation) {
        conversationId = message.conversation.id;
      } else {
        conversationId = message.conversationId;
      }

      var isMine = message.sender.user_id !== _settings.client.user.userId;
      return new ConversationMessage({
        conversationId: conversationId,
        fromServer: message,
        _fromDB: message._fromDB,
        _notify: message.notification && fromWebsocket && message.is_unread && isMine ? message.notification : null
      });
    }
  }]);

  return ConversationMessage;
}(_message2.default);

/**
 * True if this Message has been read by this user.
 *
 * You can change isRead programatically
 *
 *      m.isRead = true;
 *
 * This will automatically notify the server that the message was read by your user.
 * @property {Boolean}
 */


ConversationMessage.prototype.isRead = false;

/**
 * Read/delivery State of all participants.
 *
 * This is an object containing keys for each participant,
 * and a value of:
 *
 * * Layer.Constants.RECEIPT_STATE.SENT
 * * Layer.Constants.RECEIPT_STATE.DELIVERED
 * * Layer.Constants.RECEIPT_STATE.READ
 * * Layer.Constants.RECEIPT_STATE.PENDING
 *
 * @property {Object}
 */
ConversationMessage.prototype.recipientStatus = null;

/**
 * Have the other participants read this Message yet.
 *
 * This value is one of:
 *
 *  * Layer.Constants.RECIPIENT_STATE.ALL
 *  * Layer.Constants.RECIPIENT_STATE.SOME
 *  * Layer.Constants.RECIPIENT_STATE.NONE
 *
 *  This value is updated any time recipientStatus changes.
 *
 * See Layer.Core.Message.ConversationMessage.recipientStatus for a more detailed report.
 *
 * @property {String}
 */
ConversationMessage.prototype.readStatus = _constants2.default.RECIPIENT_STATE.NONE;

/**
 * Have the other participants received this Message yet.
 *
  * This value is one of:
 *
 *  * Layer.Constants.RECIPIENT_STATE.ALL
 *  * Layer.Constants.RECIPIENT_STATE.SOME
 *  * Layer.Constants.RECIPIENT_STATE.NONE
 *
 *  This value is updated any time recipientStatus changes.
 *
 * See Layer.Core.Message.ConversationMessage.recipientStatus for a more detailed report.
 *
 *
 * @property {String}
 */
ConversationMessage.prototype.deliveryStatus = _constants2.default.RECIPIENT_STATE.NONE;

ConversationMessage.inObjectIgnore = _message2.default.inObjectIgnore;
ConversationMessage._supportedEvents = [].concat(_message2.default._supportedEvents);
_root2.default.initClass.apply(ConversationMessage, [ConversationMessage, 'ConversationMessage', _namespace2.default.Message]);
module.exports = ConversationMessage;