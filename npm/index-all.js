/**
 * @class Layer
 * @static
 */
'use strict';

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

var _indexAll = require('./core/index-all');

var _indexAll2 = _interopRequireDefault(_indexAll);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _indexAll3 = require('./ui/index-all');

var _indexAll4 = _interopRequireDefault(_indexAll3);

var _version = require('./version');

var _version2 = _interopRequireDefault(_version);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }



/* eslint-disable import/first */
if (global.Layer) throw new Error('You appear to have multiple copies of the Layer Web XDK loaded at the same time');

_settings2.default.client = new _indexAll2.default.Client({});
function init(options) {
  var client = _settings2.default.client;
  if (!client || client.isDestroyed) client = _settings2.default.client = new _indexAll2.default.Client({});
  Object.keys(options).forEach(function (name) {
    _settings2.default[name] = options[name];
    if (client[name] !== undefined) client[name] = options[name];
  });

  _indexAll4.default.init();
  return client;
}

/**
 * Access the XDK-UI Library
 *
 * @property {Object} UI
 * @readonly
 */

/**
 * Access the XDK-Core Library
 *
 * @property {Object} Core
 * @readonly
 */

/**
 * Access the XDK Utils Library
 *
 * @property {Object} Utils
 * @readonly
 */

/**
 * Access the XDK Constants  {@link Layer.Constants}
 *
 * @property {Object} Constants
 * @readonly
 */

/**
 * Initialize the XDK and Layer Client
 *
 * ```
 * Layer.init({
 *   appId: "layer:///apps/staging/UUID"
 * });
 * ```
 *
 * @method init
 * @returns Layer.Core.Client
 */

/**
 * XDK Version
 *
 * ```
 * Layer.version
 * ```
 *
 * @property {String} version
 * @readonly
 */

/**
 * Access the Layer Client
 *
 * @property {Layer.Core.Client} client
 * @readonly
 */
module.exports = { UI: _indexAll4.default, Core: _indexAll2.default, Utils: _utils2.default, Constants: _constants2.default, init: init, version: _version2.default, get client() {
    return _settings2.default.client;
  }, Settings: _settings2.default };
if (typeof global !== 'undefined') global.Layer = global.layer = module.exports;