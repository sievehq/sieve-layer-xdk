'use strict';

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

var _core = require('./core');

var _core2 = _interopRequireDefault(_core);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _version = require('./version');

var _version2 = _interopRequireDefault(_version);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable import/first */
if (global.Layer) throw new Error('You appear to have multiple copies of the Layer Web XDK loaded at the same time');

_settings2.default.client = new _core2.default.Client({});
function init(options) {
  var client = _settings2.default.client;
  if (!client || client.isDestroyed) client = _settings2.default.client = new _core2.default.Client({});
  Object.keys(options).forEach(function (name) {
    _settings2.default[name] = options[name];
    if (client[name] !== undefined) client[name] = options[name];
  });

  return client;
}

module.exports = { Core: _core2.default, Utils: _utils2.default, Constants: _constants2.default, init: init, version: _version2.default, get client() {
    return _settings2.default.client;
  }, Settings: _settings2.default };
if (typeof global !== 'undefined') global.Layer = global.layer = module.exports;