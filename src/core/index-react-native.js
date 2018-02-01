// TODO: Not updated to work with XDK yet

import { NetInfo } from 'react-native';
import base64JS from 'base64-js';
import Layer from './index';
/* istanbul ignore next */

global.getNativeSupport = function(module) {
  switch(module) {
    case 'atob':
      return function(b64Str) {
        let byteArray = base64JS.toByteArray(b64Str);
        let strArray = [];
        for (let i=0, l=byteArray.length; i<l; i++) {
          strArray[i] = String.fromCharCode(byteArray[i]);
        }
        return strArray.join('');
      }
    case 'btoa':
      return function(str) {
        let arr = str.split("").map((val) => {
          return val.charCodeAt(0);
        });
        return base64JS.fromByteArray(arr);
      }
    case 'setImmediate':
      // Globally defined by RN environment
      return setImmediate;
    case 'OnlineEvents':
      return NetInfo;
  }
};
module.exports = Layer;
