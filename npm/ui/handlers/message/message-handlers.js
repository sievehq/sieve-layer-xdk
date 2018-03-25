/**
 * This class is setup to handle the older way of registering messages, and should
 * not be used in new project.
 *
 * @deprecated Create Layer.Core.MessageTypeModel subclasses and UIs using Layer.UI.messages.MessageViewMixin instead.
 * @class Layer.UI.handlers.message
 */
'use strict';

var _settings = require('../../../settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Array of message handlers.
 *
 * @property {Object[]} messageHandlers
 * @private
 */
var messageHandlers = []; 

module.exports.messageHandlers = messageHandlers;

/**
 * Provide a handler for a message containing a specific set of mimeTypes.
 *
 * Your testFunction will return true if it handles the input message.
 * Handlers are evaluated in the order they are registered, so if you have
 * multiple handlers that handle a specific combination of parts, put the default
 * one first.  Handlers can be reordered by directly accessing and manipulating the layerUI.messageHandlers array.
 *
 * ```
 * Layer.UI.handlers.message.register({
 *     tagName: 'my-custom-message-type-handler',
 *     label: 'Map',
 *     handlesMessage: function(message, container) {
 *       const partsWithMyType = message.filterParts(part => part.mimeType === "my/custom-type");
 *       return partsWithMyType.length > 0;
 *    }
 * });
 * ```
 *
 * This example will create a `<text-image-locaton-part />` dom node to process any message with 3 parts:
 * an image/jpeg, text/plain and location/json parts.  Note that its up to your application to define a webcomponent for `text-image-location-part`
 * which receives the Message using its `item` property.
 *
 * Note that you can use the `container` argument to prevent some types of content from rendering as a Last Message within a Conversation List,
 * or use it so some MessageLists render things differently from others.
 *
 * @method register
 * @static
 * @param {Object} options
 * @param {Function} options.handlesMessage
 * @param {Layer.Core.Message} options.handlesMessage.message    Message to test and handle with our handler if it matches
 * @param {HTMLElement} options.handlesMessage.container     The container that this will be rendered within; typically identifies a specific
 *                                                          layerUI.MessageList or layerUI.ConversationItem.
 * @param {Boolean} options.handlesMessage.return          Return true to signal that this handler accepts this Message.
 * @param {String} options.tagName                          Dom node to create if this handler accepts the Message.
 * @param {Number} [options.order=0]                        Some handlers may need to be tested before other handlers to control which one gets
 *                                                          selected; Defaults to order=0, this handler is first
 */
module.exports.register = function register(options) {
  if (!options.order) options.order = 0;
  var pushed = false;
  for (var i = 0; i < messageHandlers.length; i++) {
    if (options.order <= messageHandlers[i].order) {
      messageHandlers.splice(i, 0, options);
      pushed = true;
      break;
    }
  }
  if (!pushed) messageHandlers.push(options);
};

// For unit test cleanup
module.exports.unregister = function (tagName) {
  for (var i = messageHandlers.length - 1; i >= 0; i--) {
    if (messageHandlers[i].tagName === tagName) messageHandlers.splice(i, 1);
  }
};

/**
 * Return the handler object needed to render this Message.
 *
 * ```
 * Layer.UI.handlers.message.getHandler(message, container);
 * ```
 *
 * This function calls the `handlesMessage` call for each handler registered via {@link #register} and
 * returns the first handler that says it will handle this Message.
 *
 * @method getHandler
 * @static
 * @param {Layer.Core.Message} message
 * @param {HTMLElement} container     The container that this will be rendered within
 * @return {Object} handler     See {@link #register} for the structure of a handler.
 */
module.exports.getHandler = function (message, container) {
  var handlers = messageHandlers.filter(function (handler) {
    return handler.handlesMessage(message, container);
  });
  return handlers[0] || _settings2.default.defaultHandler;
};