/**
 * @class Layer.utils.Logger
 * @private
 *
 */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }


/* eslint-disable no-console */
var _require$LOG = require('../constants').LOG,
    DEBUG = _require$LOG.DEBUG,
    INFO = _require$LOG.INFO,
    WARN = _require$LOG.WARN,
    ERROR = _require$LOG.ERROR,
    NONE = _require$LOG.NONE;

// Pretty arbitrary test that IE/edge fails and others don't.  Yes I could do a more direct
// test for IE/edge but its hoped that MS will fix this around the time they cleanup their internal console object.
// Note that uglifyjs with drop_console=true will throw an error on console.assert.toString().match; so we instead do (console.assert.toString() || "") which drop_console
// on replacing console.assert.toString() with (void 0) will still work


var supportsConsoleFormatting = Boolean(console.assert && (console.assert.toString() || '').match(/assert/));
var LayerCss = 'color: #888; font-weight: bold;';
var Black = 'color: black';
/* istanbulify ignore next */

var Logger = function () {
  function Logger() {
    _classCallCheck(this, Logger);
  }

  _createClass(Logger, [{
    key: 'log',
    value: function log(msg, obj, type, color) {
      /* istanbul ignore else */
      if ((typeof msg === 'undefined' ? 'undefined' : _typeof(msg)) === 'object') {
        obj = msg;
        msg = '';
      }
      var timestamp = new Date().toLocaleTimeString();
      var op = void 0;
      switch (type) {
        case DEBUG:
          op = 'debug';
          break;
        case INFO:
          op = 'info';
          break;
        case WARN:
          op = 'warn';
          break;
        case ERROR:
          op = 'error';
          break;
        default:
          op = 'log';
      }
      if (obj) {
        if (supportsConsoleFormatting) {
          console[op]('%cLayer%c ' + op.toUpperCase() + '%c [' + timestamp + ']: ' + msg, LayerCss, 'color: ' + color, Black, obj);
        } else {
          console[op]('Layer ' + op.toUpperCase() + ' [' + timestamp + ']: ' + msg, obj);
        }
      } else if (supportsConsoleFormatting) {
        console[op]('%cLayer%c ' + op.toUpperCase() + '%c [' + timestamp + ']: ' + msg, LayerCss, 'color: ' + color, Black);
      } else {
        console[op]('Layer ' + op.toUpperCase() + ' [' + timestamp + ']: ' + msg);
      }
    }
  }, {
    key: 'debug',
    value: function debug(msg, obj) {
      /* istanbul ignore next */
      if (this.level >= DEBUG) this.log(msg, obj, DEBUG, '#888');
    }
  }, {
    key: 'info',
    value: function info(msg, obj) {
      /* istanbul ignore next */
      if (this.level >= INFO) this.log(msg, obj, INFO, 'black');
    }
  }, {
    key: 'warn',
    value: function warn(msg, obj) {
      /* istanbul ignore next */
      if (this.level >= WARN) this.log(msg, obj, WARN, 'orange');
    }
  }, {
    key: 'error',
    value: function error(msg, obj) {
      /* istanbul ignore next */
      if (this.level >= ERROR) this.log(msg, obj, ERROR, 'red');
    }
  }]);

  return Logger;
}();

/* istanbul ignore next */


Logger.prototype.level = typeof jasmine === 'undefined' ? ERROR : NONE;

var logger = new Logger();

module.exports = logger;