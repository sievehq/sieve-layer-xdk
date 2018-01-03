/**
 * Utilities for processing text
 *
 * @class Layer.UI.handlers.text.TextHandlers
 * @static
 */
let textHandlersOrdered = [];

/**
 * Hash of Text Handlers.  See {@link registerTextHandler}.
 *
 * @property {Object} handlers
 * @private
 */
const textHandlers = {};
module.exports.textHandlers = textHandlers;


 /**
 * Order the Text handlers if they haven't previously been sorted.
 *
 * @method _setupOrderedHandlers
 * @private
 */
module.exports._setupOrderedHandlers = () => {
  textHandlersOrdered = Object.keys(textHandlers).filter(handlerName =>
    textHandlers[handlerName].enabled)
  .map(handlerName => textHandlers[handlerName])
  .sort((a, b) => {
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
 * @method sanitizeText
 * @param {String} text
 * @returns {String}
 */
module.exports.sanitizeText = (text) => {
  return (text || '')
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Transform text into HTML with any processing and decorations needed.
 *
 * Uses the textHandlers to process the text
 *
 * @method processText
 * @param {String} text
 * @returns {String}
 */
module.exports.processText = (text) => {
  if (text === '') return text;
  if (!textHandlersOrdered.length) module.exports._setupOrderedHandlers();

  const processedText = module.exports.sanitizeText(text);

  const textData = {
    originalText: text,
    text: processedText.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'),
  };

  // Iterate over each handler, calling each handler.
  textHandlersOrdered.forEach((handlerDef) => {
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
 * You can enable a predefined Text Handler with:
 *
 * ```
 * layerUI.registerTextHandler({
 *    name: 'emoji'
 * });
 * ```
 *
 * You can define your own handler (defaults to enabled) with:
 *
 * ```
 * layerUI.registerTextHandler({
 *    name: 'youtube',
 *    order: 200,
 *    handler: function(textData) {
 *       textData.text = textData.text.replace(/https:\/\/(www\.)?(youtu\.be|youtube\.com)\/(watch\?.*v=)?([a-zA-Z0-9\-]+)/g, function(ignore1, ignore2, ignore3, ignore4, videoId) {
 *       return '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>';
 *   });
 * });
 * ```
 *
 * @method registerTextHandler
 * @static
 * @param {Object} options
 * @param {String} options.name      A unique name to give your handler
 * @param {Number} options.order     A number used to sort your handler amongst other handlers as order
 *      of execution can matter for any text handler that modifies the text parsed by subsequent parsers.
 * @param {Function} options.handler
 * @param {Object} options.handler.textData
 * @param {String} options.handler.textData.text          Use this to read the current text value and write an update to it
 * @param {String} options.handler.textData.originalText  Text before any processing was done
 */
module.exports.registerTextHandler = function registerTextHandler(options) {
  if (textHandlers[options.name]) {
    if (options.handler) {
      Object.keys(options).forEach((optionKey) => {
        textHandlers[options.name][optionKey] = options[optionKey];
      });
    } else {
      textHandlers[options.name].enabled = true;
    }
  } else {
    options.enabled = !options.handler || !options.requiresEnable;
    if (!('order' in options)) options.order = 100000;
    textHandlers[options.name] = options;
  }
};