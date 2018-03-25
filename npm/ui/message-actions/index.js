/**
 * Class for registering/managing Message Actions.
 *
 * A Message Action is an action performed when clicking on a Message, typically a reusable
 * block of code that can be shared among diverse types of messages.  Occasionally, these may also
 * be actions triggered by Action Buttons.
 *
 * @class Layer.UI.MessageActions
 */
"use strict";



/**
 * Hash of Message Action Handlers, indexed by action name
 *
 * @property {Object} handlers
 * @private
 */
module.exports.handlers = {};

/**
 * Register a Message Action Handler.
 *
 * ```
 * Layer.UI.MessageActions.register('pay-my-credit-card-bill', function(evt) {
 *    var model = evt.detail.model;
 *    model.sendPayment();
 * });
 * ```
 *
 * @param {String} actionName   Name of the action that will trigger this handler
 * @param {Function} handler    The function that executes the handler
 */
module.exports.register = function register(actionName, handler) {
  module.exports[actionName] = handler;
};