/**
 * The Layer Emoji TextHandler replaces all :smile: and :-) with emoji images.
 *
 * Change {@link Layer.UI#settings} `useEmojiImages` to `false` to use native emoji characters.
 *
 * @class Layer.UI.handlers.text.Emoji
 */
'use strict';

var _twemoji = require('twemoji');

var _twemoji2 = _interopRequireDefault(_twemoji);

var _setEmoji = require('remarkable-emoji/setEmoji');

var _setEmoji2 = _interopRequireDefault(_setEmoji);

var _settings = require('../../../settings');

var _settings2 = _interopRequireDefault(_settings);

var _textHandlers = require('./text-handlers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|[\ud83c[\ude50\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g; // eslint-disable-line max-len

var replaceEmojis = function replaceEmojis(string, expr) {
  return string.replace(regex, expr);
};

(0, _textHandlers.register)({
  base: location.protocol + '://twemoji.maxcdn.com/',
  name: 'emoji',
  order: 400,
  requiresEnable: true,
  handler: function handler(textData) {
    // Bug in RemarkableParser requires extra spacing around html tags to keep them away from the emoticon.
    var text = textData.text.replace(/\n/g, ' \n ');

    // Parse it
    var parsed = (0, _setEmoji2.default)(text);

    if (_settings2.default.useEmojiImages) {
      // See if its an all-emoji line by replacing all emojis with empty strings
      // and seeing if there's anything left when we're done.
      var allEmojiLine = !_twemoji2.default.replace(parsed, function () {
        return '';
      }).match(/[\S\n]/);

      // Render the emoji images
      text = _twemoji2.default.parse((0, _setEmoji2.default)(text), {
        folder: 'svg',
        ext: '.svg',
        className: allEmojiLine ? 'layer-emoji layer-emoji-line' : 'layer-emoji'
      });
    } else {
      text = parsed;
      var _allEmojiLine = !replaceEmojis(parsed, '').match(/[\S\n]/);
      if (_allEmojiLine) {
        text = '<p class="layer-emoji-line">' + text.replace(/ \n /g, '<br/>') + '</p>';
      } else {
        text = replaceEmojis(text, function (str) {
          return '<span class=\'layer-emoji-char\'>' + str + '</span>';
        });
      }
    }

    // Undo the extra spacing we added above
    text = text.replace(/ \n /g, '\n');
    textData.text = text;
  }
});