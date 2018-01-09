/**
 * @class Layer
 */
if (global.Layer) throw new Error('You appear to have multiple copies of the Layer Web XDK loaded at the same time');

import Constants from './constants';
import Core from './core/index-all';
import Utils from './utils';
import UI from './ui/index-all';
import version from './version';

function init(options) {
  const client = Core.Client.getClient(options.appId) || new Core.Client(options);
  options.client = client;
  UI.init(options);
  return client;
}

module.exports = { UI, Core, Utils, Constants, init, version };
if (typeof global !== 'undefined') global.Layer = global.layer = module.exports;
