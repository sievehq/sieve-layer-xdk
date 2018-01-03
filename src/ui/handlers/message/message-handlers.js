/**
 * This class is setup to handle the older way of registering messages, and should
 * not be used in new project.
 *
 * @deprecated
 * @class Layer.UI.handlers.message.MessageHandlers
 */
import Settings from '../../settings';

/**
 * Array of message handlers.  See layerUI.registerMessageHandler.
 *
 * @property {Object[]} messageHandlers
 * @private
 */
const messageHandlers = [];
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
 * Layer.UI.MessageHandlers.registerMessageHandler({
 *     tagName: 'text-image-location-part',
 *     label: 'Map',
 *     handlesMessage: function(message, container) {
 *       return (message.parts.length === 3 && message.parts[0].mimeType.match(/image\/jpeg/ && message.parts[1].mimeType === 'text/plain' && message.parts[2].mimeType === 'location/json');
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
 * @method registerMessageHandler
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
module.exports.registerMessageHandler = function registerMessageHandler(options) {
  if (!options.order) options.order = 0;
  let pushed = false;
  for (let i = 0; i < messageHandlers.length; i++) {
    if (options.order <= messageHandlers[i].order) {
      messageHandlers.splice(i, 0, options);
      pushed = true;
      break;
    }
  }
  if (!pushed) messageHandlers.push(options);
};


/**
 * Return the handler object needed to render this Message.
 *
 * ```
 * Layer.UI.MessageHandlers.getHandler(message, container);
 * ```
 *
 * This function calls the `handlesMessage` call for each handler registered via layerUI.registerMessageHandler and
 * returns the first handler that says it will handle this Message.
 *
 * @method getHandler
 * @static
 * @param {Layer.Core.Message} message
 * @param {HTMLElement} container     The container that this will be rendered within
 * @return {Object} handler     See layerUI.registerMessageHandler for the structure of a handler.
 */
module.exports.getHandler = (message, container) => {
  const handlers =
    messageHandlers.filter(handler => handler.handlesMessage(message, container));
  return handlers[0] || Settings.defaultHandler;
};
