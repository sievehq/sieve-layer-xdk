import Constants from './constants';
import Core from './core';
import Util from './util';
import UI from './ui';

const version = '1.0.0-pre1.7';

function init(options) {
  const client = Core.Client.getClient(options.appId) || new Core.Client(options);
  UI.init(options);
  return client;
}

module.exports = { UI, Core, Util, Constants, init, version };
if (typeof global !== 'undefined') global.Layer = global.layer = module.exports;