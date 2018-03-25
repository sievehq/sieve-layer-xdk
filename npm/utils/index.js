/**
 * Utility methods
 *
 * @class Layer.utils
 */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; 
/* eslint-disable no-restricted-properties */

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _defer = require('./defer');

var _defer2 = _interopRequireDefault(_defer);

var _layerParser = require('./layer-parser');

var _layerParser2 = _interopRequireDefault(_layerParser);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _xhr = require('./xhr');

var _xhr2 = _interopRequireDefault(_xhr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.atob = typeof atob === 'undefined' ? global.getNativeSupport('atob') : atob.bind(window);
exports.btoa = typeof btoa === 'undefined' ? global.getNativeSupport('btoa') : btoa.bind(window);
var LocalFileReader = typeof FileReader === 'undefined' ? global.getNativeSupport('FileReader') : FileReader;

/**
 * Generate a random UUID
 *
 * @method
 * @return {string}
 */
exports.generateUUID = _uuid2.default.v4;

/**
 * Returns the 'type' portion of a Layer ID.
 *
 *         switch(Utils.typeFromID(id)) {
 *             case 'conversations':
 *                 ...
 *             case 'message':
 *                 ...
 *             case: 'queries':
 *                 ...
 *         }
 *
 * Does not currently handle Layer App IDs.
 *
 * @method
 * @param  {string} id
 * @return {string}
 */
exports.typeFromID = function (id) {
  var matches = id.match(/([^/]*)(\/[^/]*)$/);
  return matches ? matches[1] : '';
};

/**
 * Returns the UUID portion of a Layer ID
 *
 * @method
 * @param  {string} id
 * @return {string}
 */
exports.uuid = function (id) {
  return (id || '').replace(/^.*\//, '');
};

exports.isEmpty = function (obj) {
  return Object.prototype.toString.apply(obj) === '[object Object]' && Object.keys(obj).length === 0;
};

exports.camelCase = function (str) {
  return str.replace(/[-_](.)/g, function (match, value) {
    return value.toUpperCase();
  });
};

/**
 * Turn a camel case name into a hyphenated name
 *
 * To camel case, use:
 *
 * ```
 * Utils.hyphenate("aCamelCalsedString", "_");
 * ```
 *
 * @method hyphenate
 * @static
 * @param {String} aCamelCasedString
 * @returns {String} a-hyphenated-string
 */
var regexHyphenate = /([a-z])([A-Z])/g;
exports.hyphenate = function (str) {
  var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '-';
  return str.replace(regexHyphenate, function (match, part1, part2) {
    return part1 + separator + part2.toLowerCase();
  });
};

/**
 * Simplified sort method.
 *
 * Provides a function to return the value to compare rather than do the comparison.
 *
 *      sortBy([{v: 3}, {v: 1}, v: 33}], function(value) {
 *          return value.v;
 *      }, false);
 *
 * @method
 * @param  {Mixed[]}   inArray      Array to sort
 * @param  {Function} fn            Function that will return a value to compare
 * @param  {Function} fn.value      Current value from inArray we are comparing, and from which a value should be extracted
 * @param  {boolean}  [reverse=false] Sort ascending (false) or descending (true)
 */
exports.sortBy = function (inArray, fn, reverse) {
  reverse = reverse ? -1 : 1;
  return inArray.sort(function (valueA, valueB) {
    var aa = fn(valueA);
    var bb = fn(valueB);
    if (aa === undefined && bb === undefined) return 0;
    if (aa === undefined && bb !== undefined) return 1;
    if (aa !== undefined && bb === undefined) return -1;
    if (aa > bb) return 1 * reverse;
    if (aa < bb) return -1 * reverse;
    return 0;
  });
};

/**
 * Quick and easy clone method.
 *
 * Does not work on circular references; should not be used
 * on objects with event listeners.
 *
 *      var newObj = Utils.clone(oldObj);
 *
 * @method
 * @param  {Object}     Object to clone
 * @return {Object}     New Object
 */
exports.clone = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Shallow Clone doesn't lose subpointers; for use on raw objects, not class instances.
 *
 *      var newObj = Utils.shallowClone(oldObj);
 *
 * @method
 * @param  {Object}     Object to clone
 * @return {Object}     New Object
 */
exports.shallowClone = function (obj) {
  var result = {};
  Object.keys(obj).forEach(function (keyName) {
    return result[keyName] = obj[keyName];
  });
  return result;
};

/**
 * Its necessary that the encoding algorithm for creating a URI matches the Layer Server's algorithm.
 * Failure to do that creates mismatching IDs that will then refer to different objects.
 *
 * Derived from https://github.com/kevva/strict-uri-encode
 *
 * @method strictEncodeURI
 * @param {String} str
 */
exports.strictEncodeURI = function (str) {
  return encodeURIComponent(str).replace(/[!~'()]/g, function (x) {
    return '%' + x.charCodeAt(0).toString(16).toUpperCase();
  });
};

/**
 * URL Decode a URL Encoded base64 string
 *
 * Copied from https://github.com/auth0-blog/angular-token-auth, but
 * appears in many places on the web.
 *
 * @method decode
 * @param {String} str   base64 string
 * @return str   Decoded string
 */
/* istanbul ignore next */
exports.decode = function (str) {
  var reg1 = new RegExp('_', 'g');
  var reg2 = new RegExp('-', 'g');
  var output = str.replace(reg2, '+').replace(reg1, '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw new Error('Illegal base64url string!');
  }
  return exports.atob(output);
};

/**
 * Returns a delay in seconds needed to follow an exponential
 * backoff pattern of delays for retrying a connection.
 *
 * Algorithm has two motivations:
 *
 * 1. Retry with increasingly long intervals up to some maximum interval
 * 2. Randomize the retry interval enough so that a thousand clients
 * all following the same algorithm at the same time will not hit the
 * server at the exact same times.
 *
 * The following are results before jitter for some values of counter:

      0: 0.1
      1: 0.2
      2: 0.4
      3: 0.8
      4: 1.6
      5: 3.2
      6: 6.4
      7: 12.8
      8: 25.6
      9: 51.2
      10: 102.4
      11. 204.8
      12. 409.6
      13. 819.2
      14. 1638.4 (27 minutes)

 * @method getExponentialBackoffSeconds
 * @param  {number} maxSeconds - This is not the maximum seconds delay, but rather
 * the maximum seconds delay BEFORE adding a randomized value.
 * @param  {number} counter - Current counter to use for calculating the delay; should be incremented up to some reasonable maximum value for each use.
 * @return {number}     Delay in seconds/fractions of a second
 */
exports.getExponentialBackoffSeconds = function getExponentialBackoffSeconds(maxSeconds, counter) {
  var secondsWaitTime = Math.pow(2, counter) / 10;
  var secondsOffset = Math.random(); // value between 0-1 seconds.
  if (counter < 2) secondsOffset = secondsOffset / 4; // values less than 0.2 should be offset by 0-0.25 seconds
  else if (counter < 6) secondsOffset = secondsOffset / 2; // values between 0.2 and 1.0 should be offset by 0-0.5 seconds

  if (secondsWaitTime >= maxSeconds) secondsWaitTime = maxSeconds;

  return secondsWaitTime + secondsOffset;
};

/**
 * Is this data a blob?
 *
 * @method isBlob
 * @param {Mixed} value
 * @returns {Boolean} - True if its a blob, false if not.
 */
exports.isBlob = function (value) {
  return typeof Blob !== 'undefined' && value instanceof Blob;
};

/**
 * Given a blob return a base64 string.
 *
 * @method blobToBase64
 * @param {Blob} blob - data to convert to base64
 * @param {Function} callback
 * @param {String} callback.result - Your base64 string result
 */
exports.blobToBase64 = function (blob, callback) {
  if (blob instanceof Blob) {
    var reader = new LocalFileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      return callback(reader.result.replace(/^.*?,/, ''));
    };
  } else {
    callback('');
  }
};

/**
 * Given a base64 string return a blob.
 *
 * @method base64ToBlob
 * @param {String} b64Data - base64 string data without any type prefixes
 * @param {String} contentType - mime type of the data
 * @returns {Blob}
 */
exports.base64ToBlob = function (b64Data, contentType) {
  try {
    var sliceSize = 512;
    var byteCharacters = exports.atob(b64Data);
    var byteArrays = [];
    var offset = void 0;

    for (offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var i = void 0;
      var slice = byteCharacters.slice(offset, offset + sliceSize);
      var byteNumbers = new Array(slice.length);
      for (i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  } catch (e) {
    // noop
  }
  return null;
};

/**
 * Does window.btao() in a unicode-safe way
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/btoa#Unicode_strings
 *
 * @method utoa
 * @param {String} str
 * @return {String}
 */
exports.utoa = function (str) {
  return exports.btoa(unescape(encodeURIComponent(str)));
};

/**
 * Does window.atob() in a way that can decode data from utoa()
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/btoa#Unicode_strings
 *
 * @method atou
 * @param {String} str
 * @return {String}
 */
exports.atou = function (str) {
  return decodeURIComponent(escape(exports.atob(str)));
};

/**
 * Given a File/Blob return a string.
 *
 * Assumes blob represents textual data.
 *
 * @method fetchTextFromFile
 * @param {Blob} file
 * @param {Function} callback
 * @param {String} callback.result
 */
exports.fetchTextFromFile = function (file, callback) {
  if (typeof file === 'string') return callback(file);
  var reader = new LocalFileReader();
  reader.addEventListener('loadend', function () {
    callback(reader.result);
  });
  reader.readAsText(file);
};

exports.defer = _defer2.default;
exports.layerParse = _layerParser2.default;

/**
 * Object comparison.
 *
 * Does a recursive traversal of two objects verifying that they are the same.
 * Is able to make metadata-restricted assumptions such as that
 * all values are either plain Objects or strings.
 *
 *      if (Utils.doesObjectMatch(conv1.metadata, conv2.metadata)) {
 *          alert('These two metadata objects are the same');
 *      }
 *
 * @method
 * @param  {Object} requestedData
 * @param  {Object} actualData
 * @return {boolean}
 */
exports.doesObjectMatch = function (requestedData, actualData) {
  if (!requestedData && actualData || requestedData && !actualData) return false;
  var requestedKeys = Object.keys(requestedData).sort();
  var actualKeys = Object.keys(actualData).sort();

  // If there are a different number of keys, fail.
  if (requestedKeys.length !== actualKeys.length) return false;

  // Compare key name and value at each index
  for (var index = 0; index < requestedKeys.length; index++) {
    var k1 = requestedKeys[index];
    var k2 = actualKeys[index];
    var v1 = requestedData[k1];
    var v2 = actualData[k2];
    if (k1 !== k2) return false;
    if (v1 && (typeof v1 === 'undefined' ? 'undefined' : _typeof(v1)) === 'object') {
      // Array comparison is not used by the Web XDK at this time.
      if (Array.isArray(v1)) {
        throw new Error('Array comparison not handled yet');
      } else if (!exports.doesObjectMatch(v1, v2)) {
        return false;
      }
    } else if (v1 !== v2) {
      return false;
    }
  }
  return true;
};

exports.isMobile = global.navigator ? Boolean(global.navigator.userAgent.match(/(mobile|android|phone)/i)) : false;
exports.isIOS = global.navigator ? Boolean(global.navigator.userAgent.match(/(iPhone|iPad)/i)) : false;

/**
 * Simple array inclusion test
 * @method includes
 * @param {Mixed[]} items
 * @param {Mixed} value
 * @returns {boolean}
 */
exports.includes = function (items, value) {
  return items.indexOf(value) !== -1;
};

/**
 * Some ASCII art when client initializes
 */
exports.asciiInit = function (version) {
  if (!version) return 'Missing version';

  var split = version.split('-');
  var line1 = split[0] || '';
  var line2 = split[1] || '';

  line1 += new Array(13 - line1.length).join(' ');
  line2 += new Array(14 - line2.length).join(' ');

  return '\n    /hNMMMMMMMMMMMMMMMMMMMms.\n  hMMy+/////////////////omMN-\n  MMN                    oMMo\n  MMN        Layer       oMMo\n  MMN       Web XDK      oMMo\n  MMM-                   oMMo\n  MMMy      v' + line1 + 'oMMo\n  MMMMo     ' + line2 + 'oMMo\n  MMMMMy.                oMMo\n  MMMMMMNy:\'             oMMo\n  NMMMMMMMMmy+:-.\'      \'yMM/\n  :dMMMMMMMMMMMMNNNNNNNNNMNs\n   -/+++++++++++++++++++:\'';
};

exports.logger = _logger2.default;
exports.xhr = _xhr2.default;