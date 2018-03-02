/**
 * @class Layer
 * @static
 */

/* eslint-disable import/first */
if (global.Layer) throw new Error('You appear to have multiple copies of the Layer Web XDK loaded at the same time');

import Constants from './constants';
import Core from './core/index-all';
import Utils from './utils';
import UI from './ui/index-all';
import version from './version';
import Settings from './settings';

Settings.client = new Core.Client({});
function init(options) {
  let client = Settings.client;
  if (!client || client.isDestroyed) client = Settings.client = new Core.Client({});
  Object.keys(options).forEach((name) => {
    Settings[name] = options[name];
    if (client[name] !== undefined) client[name] = options[name];
  });

  UI.init();
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
module.exports = { UI, Core, Utils, Constants, init, version, get client() { return Settings.client; }, Settings };
if (typeof global !== 'undefined') global.Layer = global.layer = module.exports;
