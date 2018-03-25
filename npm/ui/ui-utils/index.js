/**
 * @class Layer.UI.UIUtils
 * @static
 */
'use strict';

var _animatedScroll = require('./animated-scroll');

var _statusMessageManager = require('./status-message-manager');

var _statusMessageManager2 = _interopRequireDefault(_statusMessageManager);

var _listSeparatorManager = require('./list-separator-manager');

var _listSeparatorManager2 = _interopRequireDefault(_listSeparatorManager);

var _replaceableContentUtils = require('./replaceable-content-utils');

var _replaceableContentUtils2 = _interopRequireDefault(_replaceableContentUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Utility returns whether or not the window is in the background.
 *
 * @method isInBackground
 * @returns {Boolean}
 */

module.exports.isInBackground = function () {
  return !document.hasFocus() || document.hidden;
};

/**
 * Placeholder for a mechanism for all Message Types to share for showing a zoomed in version of their content.
 *
 * Eventually should open an in-app dialog
 *
 * @method showFullScreen
 * @param {String} url
 */
module.exports.showFullScreen = function (url) {
  return window.open(url);
};

/**
 * Calculates a scaled size given a set of dimensions and the maximum allowed width/height.
 *
 * @method normalizeSize
 * @param {Object} dimensions    `width` and `height` of the actual image/video/object
 * @param {Object} maxSizes      `width` and `height` of the maximum allowed dimensions
 * @returns {Object}             `width` and `height` that is proportional to dimensions and within maxSizes
 */
module.exports.normalizeSize = function (dimensions, maxSizes) {

  if (!dimensions) return maxSizes;

  var size = {
    width: dimensions.previewWidth || dimensions.width,
    height: dimensions.previewHeight || dimensions.height
  };

  // Scale dimensions down to our maximum sizes if needed
  if (size.width > maxSizes.width) {
    var width = size.width;
    size.width = maxSizes.width;
    size.height = size.height * maxSizes.width / width;
  }
  if (size.height > maxSizes.height) {
    var height = size.height;
    size.height = maxSizes.height;
    size.width = size.width * maxSizes.height / height;
  }

  // Return scaled sizes
  return {
    width: Math.round(size.width),
    height: Math.round(size.height)
  };
};

module.exports.animatedScrollTo = _animatedScroll.animatedScrollTo;
module.exports.animatedScrollLeftTo = _animatedScroll.animatedScrollLeftTo;
module.exports.ReplaceableSnippets = _replaceableContentUtils2.default;
Object.keys(_statusMessageManager2.default).forEach(function (keyName) {
  return module.exports[keyName] = _statusMessageManager2.default[keyName];
});
Object.keys(_listSeparatorManager2.default).forEach(function (keyName) {
  return module.exports[keyName] = _listSeparatorManager2.default[keyName];
});