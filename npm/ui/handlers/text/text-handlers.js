/**
 * Utilities for processing text
 *
 * @class Layer.UI.handlers.text
 * @static
 */
'use strict';


var handlersOrdered = [];

/**
 * Hash of Text Handlers.  See {@link #register}.
 *
 * @property {Object} handlers
 * @private
 */
var handlers = {};
module.exports.handlers = handlers;

/**
 * Order the Text handlers if they haven't previously been sorted.
 *
 * @method _setupOrderedHandlers
 * @private
 */
module.exports._setupOrderedHandlers = function () {
  handlersOrdered = Object.keys(handlers).filter(function (handlerName) {
    return handlers[handlerName].enabled;
  }).map(function (handlerName) {
    return handlers[handlerName];
  }).sort(function (a, b) {
    if (a.order > b.order) return 1;
    if (b.order > a.order) return -1;
    return 0;
  });
};

/**
 * Removes tags from strings before rendering.
 *
 * This prevents `<script />` tags from being added via a Message.
 *
 * ```
 * this.innerHTML = Layer.UI.handlers.text.sanitizeText("hello <script> world");
 * ```
 *
 * @method sanitizeText
 * @param {String} text
 * @returns {String}
 */
module.exports.sanitizeText = function (text) {
  return (text || '').trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

/**
 * Transform text into HTML using all registered text handlers.
 *
 * ```
 * this.innerHTML = Layer.UI.handlers.text.processText("hello <script> world I :-) at thee");
 * ```
 *
 * @method processText
 * @param {String} text
 * @returns {String}
 */
module.exports.processText = function (text) {
  if (text === '') return text;
  if (!handlersOrdered.length) module.exports._setupOrderedHandlers();

  var processedText = module.exports.sanitizeText(text);

  var textData = {
    originalText: text,
    text: processedText.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
  };

  // Iterate over each handler, calling each handler.
  handlersOrdered.forEach(function (handlerDef) {
    handlerDef.handler(textData);
  });
  return textData.text;
};

/**
 * Provide a text processor for a `text/plain` message.
 *
 * There is a lot of preprocessing of text that may need to be done before rendering text:
 *
 * * Replacing `\n` with `<br/>`
 * * Turning emoticons symbols into images
 * * Replacing image URLs with image tags
 * * Adding HTML formatting around quoted text
 * * Make up your own...
 *
 * You can define your own handler with:
 *
 * ```
 * Layer.UI.handlers.text.register({
 *    name: 'youtube',
 *    order: 200,
 *    handler: function(textData) {
 *       textData.text = textData.text.replace(/https:\/\/(www\.)?(youtu\.be|youtube\.com)\/(watch\?.*v=)?([a-zA-Z0-9\-]+)/g, function(ignore1, ignore2, ignore3, ignore4, videoId) {
 *       return '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>';
 *   });
 * });
 * ```
 *
 * If there are Text Handlers that are defined but not yet enabled, you can enable them with:
 *
 * ```
 * Layer.UI.handlers.text.register({
 *    name: 'handler-name'
 * });
 * ```
 *
 * @method register
 * @param {Object} options
 * @param {String} options.name      A unique name to give your handler
 * @param {Number} options.order     A number used to sort your handler amongst other handlers as order
 *      of execution can matter for any text handler that modifies the text parsed by subsequent parsers.
 * @param {Function} options.handler
 * @param {Object} options.handler.textData
 * @param {String} options.handler.textData.text          Use this to read the current text value and write an update to it
 * @param {String} options.handler.textData.originalText  Text before any processing was done
 */
module.exports.register = function register(options) {
  if (handlers[options.name]) {
    if (options.handler) {
      Object.keys(options).forEach(function (optionKey) {
        handlers[options.name][optionKey] = options[optionKey];
      });
    } else {
      handlers[options.name].enabled = true;
    }
  } else {
    options.enabled = !options.handler || !options.requiresEnable;
    if (!('order' in options)) options.order = 100000;
    handlers[options.name] = options;
  }
};