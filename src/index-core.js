import Constants from './constants';
import Core from './core';
import Util from './util';

const version = '1.0.0-pre1.1';

function init(options) {
  const client = new Core.Client(options);
  return client;
}

module.exports = { Core, Util, Constants, init, version };
if (typeof global !== 'undefined') global.Layer = module.exports;