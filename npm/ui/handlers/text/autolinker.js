/**
 * Detects urls and replaces them with anchor tags
 *
 * @class Layer.UI.handlers.text.Autolinker
 */
'use strict';

var _isUrl = require('../../ui-utils/is-url');

var _isUrl2 = _interopRequireDefault(_isUrl);

var _textHandlers = require('./text-handlers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


var testExpr = (0, _isUrl2.default)();

/**
 * The Layer Image TextHandler replaces all image URLs with image tags
 *
 * @class Layer.UI.handlers.text.Autolinker
 */
(0, _textHandlers.register)({
  name: 'autolinker',
  order: 300,
  requiresEnable: true,
  handler: function handler(textData) {
    textData.text = textData.text.replace(testExpr, function (url) {
      var shortUrl = url.replace(/^\w+:\/+/, '');
      if (url.length > 50) {
        var firstSlash = url.indexOf('/', 15);
        var lastSlash = url.lastIndexOf('/');
        shortUrl = url.substring(0, firstSlash) + '...' + url.substring(lastSlash);
      }
      return '<a href=\'' + url + '\' target=\'_blank\' class=\'layer-parsed-url\'>' + shortUrl + '</a>';
    });
  }
});