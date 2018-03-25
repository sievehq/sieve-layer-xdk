/**
 * Adds handling of custom websocket operations.
 *
 * This is handled by a Client mixin rather than:
 *
 * * The Client itself so we can keep the client simple and clean
 * * The Websocket Change Manager so that the change manager does not need to know
 *   how to handle any operation on any data.  Its primarily aimed at insuring websocket
 *   events get processed, not knowing minute details of the objects.
 *
 * @class Layer.Core.mixins.WebsocketOperations
 */
'use strict';

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _constants = require('../../constants');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  lifecycle: {

    // Listen for any websocket operations and call our handler
    constructor: function constructor(options) {
      this.on('websocket:operation', this._handleWebsocketOperation, this);
    }
  },
  methods: {

    /**
     * Enourmous switch statement for handling our immense library of operations.
     *
     * Any time we have a Websocket Operation, this switch statement routes the event to the
     * appropriate handler.
     *
     * @param {Object} evt
     */
    _handleWebsocketOperation: function _handleWebsocketOperation(evt) {
      switch (evt.data.method) {
        case 'Conversation.mark_all_read':
          return this._handleMarkAllReadOperation(evt.data);
      }
    },


    /**
     * Process a mark_all_read websocket operation.
     *
     * This will update recipientStatus and isRead for all impacted messages.
     * Note that we don't have a good mechanism of organizing all messages and simply
     * iterate over all messages in the message cache checking if they are affected by the request.
     *
     * Future optimizations could:
     *
     * 1. Get the conversation if its cached, and update its lastMessage
     * 2. Iterate over all queries to see if a query is for messages in this conversation
     *
     * That would still miss messages created via websocket `create` events but not referenced
     * by any query or last message.
     *
     * @param {Object} body
     */
    _handleMarkAllReadOperation: function _handleMarkAllReadOperation(body) {
      var position = body.data.position;
      var conversation = this.getObject(body.object.id);
      if (!conversation) return;
      var identityId = body.data.identity.id;
      var isOwner = this.user.id === identityId;

      // Prevent read receipts from being sent when we set isRead=true
      conversation._inMarkAllAsRead = true;

      // Iterate over all messages, and operate on any message with the proper converation ID and position
      this.forEachMessage(function (m) {
        if (m.conversationId === conversation.id && m.position <= position) {

          // NOTE: We may want to trigger "messages:change" on recipientStatus if isOwner, but
          // don't have a strong use case for that event.
          if (isOwner) {
            m.recipientStatus[identityId] = _constants.RECEIPT_STATE.READ;
            m.isRead = true;
          } else if (m.recipientStatus[identityId] !== _constants.RECEIPT_STATE.READ) {
            var newRecipientStatus = _utils2.default.clone(m.recipientStatus);

            newRecipientStatus[identityId] = _constants.RECEIPT_STATE.READ;
            m.recipientStatus = newRecipientStatus;
          }
        }
      });
      conversation._inMarkAllAsRead = false;
    }
  }
}; 

_namespace2.default.mixins.Client.push(module.exports);