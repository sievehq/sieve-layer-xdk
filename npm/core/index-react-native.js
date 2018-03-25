'use strict';

var _reactNative = require('react-native');

var _base64Js = require('base64-js');

var _base64Js2 = _interopRequireDefault(_base64Js);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* istanbul ignore next */

global.getNativeSupport = function (module) {
  switch (module) {
    case 'atob':
      return function (b64Str) {
        var byteArray = _base64Js2.default.toByteArray(b64Str);
        var strArray = [];
        for (var i = 0, l = byteArray.length; i < l; i++) {
          strArray[i] = String.fromCharCode(byteArray[i]);
        }
        return strArray.join('');
      };
    case 'btoa':
      return function (str) {
        var arr = str.split('').map(function (val) {
          return val.charCodeAt(0);
        });
        return _base64Js2.default.fromByteArray(arr);
      };
    case 'setImmediate':
      // Globally defined by RN environment
      return setImmediate;
    case 'OnlineEvents':
      return _reactNative.NetInfo;
  }
}; // TODO: Not updated to work with XDK yet

/* eslint-disable-next-line */

module.exports = _index2.default;