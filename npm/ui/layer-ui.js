/**
 * @class Layer.UI
 * @static
 *
 * The layerUI contains utilities for working with the layerUI components.
 *
 * The key method to know here is the `init()` method.  Any use of the library will need a call:
 *
 * ```
 * Layer.UI.init({
 *   appId: 'layer:///apps/staging/my-app-id'
 * });
 * ```
 *
 * Or
 *
 * Layer.UI.init({
 *   appId: 'layer:///apps/staging/my-app-id'
 * });
 * ```
 *
 * See layerUI.settings for more options to Layer.UI.init.
 *
 * One other property deserving special mention: layerUI.adapters.  Adapters help you to use these widgets within other UI frameworks.
 * It is not required to use an adapter, but it solves many inconsistencies in how these frameworks handle webcomponents built using this framework.
 *
 * While there are many other methods defined here, for new projects ignore everything except layerUI.settings, Layer.UI.init and layerUI.adapters.
 */
'use strict';

require('webcomponents.js/webcomponents-lite');

var _component = require('./components/component');

require('./handlers/message/layer-message-unknown');

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

var _componentServices = require('./component-services');

var _componentServices2 = _interopRequireDefault(_componentServices);

var _settings = require('../settings');

var _settings2 = _interopRequireDefault(_settings);

var _messageHandlers = require('./handlers/message/message-handlers');

var _messageHandlers2 = _interopRequireDefault(_messageHandlers);

var _textHandlers = require('./handlers/text/text-handlers');

var _textHandlers2 = _interopRequireDefault(_textHandlers);

var _listSeparatorManager = require('./ui-utils/list-separator-manager');

var _listSeparatorManager2 = _interopRequireDefault(_listSeparatorManager);

var _adapters = require('./adapters');

var _adapters2 = _interopRequireDefault(_adapters);

var _messageActions = require('./message-actions');

var _messageActions2 = _interopRequireDefault(_messageActions);

var _index = require('./ui-utils/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }



var LayerUI = {
  Constants: _constants2.default,
  settings: _settings2.default,
  registerComponent: _component.registerComponent,
  _registerAll: _component._registerAll,
  unregisterComponent: _component.unregisterComponent,
  buildStyle: _componentServices2.default.buildStyle,
  buildAndRegisterTemplate: _componentServices2.default.buildAndRegisterTemplate,
  registerTemplate: _componentServices2.default.registerTemplate,
  handlers: {
    message: _messageHandlers2.default,
    text: _textHandlers2.default
  },
  components: _componentServices.ComponentsHash, // backwards compatability
  ComponentsHash: _componentServices.ComponentsHash,
  ListSeparatorManager: _listSeparatorManager2.default,
  adapters: _adapters2.default,
  UIUtils: _index2.default,
  MessageActions: _messageActions2.default
};

/**
 * Call init with any custom settings, and to register all components with the dom.
 *
 * Note that `init()` must be called prior to putting any webcomponents into a document.
 *
 * Note as well that if passing in your appId, you must have instantiated a Layer.Core.Client with that appId
 * prior to putting any webcomponents into your document.
 *
 * ```javascript
 * Layer.UI.init({
 *   appId: 'layer:///apps/staging/my-app-id'
 * });
 * ```
 *
 * See layerUI.settings for more options to Layer.UI.init.
 *
 * @method init
 * @static
 */
LayerUI.init = function init() {
  LayerUI.setupMixins(_settings2.default.mixins || {});

  // Register all widgets
  (0, _component._registerAll)();

  // Enable the text handlers
  _settings2.default.textHandlers.forEach(function (handlerName) {
    _textHandlers2.default.register({ name: handlerName });
  });
};

/**
 * Provide additional mixins; must be used prior to calling `Layer.init()`.
 *
 * ```
 * var mixins = {
 *   'my-tag-name1': {
 *      properties: {
 *        prop1: {}
 *      },
 *      methods: {
 *        onCreate() {
 *          console.log("Created");
 *        }
 *      }
 *    }
 * };
 * Layer.UI.setupMixins(mixins);
 * Layer.init({ appId });
 * ```
 *
 * * `setupMixins` may be called multiple times, and can add multiple mixins to the same class.
 *
 * `setupMixins` can also take an array of mixins:
 *
 * ```
 * var mixins = {
 *   'my-tag-name1': [
 *     {
 *        properties: {
 *          prop1: {}
 *        }
 *      },
 *      {
 *        properties: {
 *          prop2: {}
 *        }
 *      }
 *    }]
 * };
 * Layer.UI.setupMixins(mixins);
 * Layer.init({ appId });
 * ```
 *
 * Why use it?  If you have multiple places in your code that specify mixins,
 * they may each separately call this method to setup your mixin instead of
 * having to do it all in one big `Layer.init()` call.
 *
 * @method setupMixins
 * @param {Object} mixins
 */
LayerUI.setupMixins = function setupMixins(mixins) {
  if (!LayerUI.settings._mixins) LayerUI.settings._mixins = {};
  Object.keys(mixins).forEach(function (componentName) {
    if (!LayerUI.settings._mixins[componentName]) {
      LayerUI.settings._mixins[componentName] = [];
    }
    if (!Array.isArray(mixins[componentName])) {
      LayerUI.settings._mixins[componentName].push(mixins[componentName]);
    } else {
      LayerUI.settings._mixins[componentName] = LayerUI.settings._mixins[componentName].concat(mixins[componentName]);
    }
  });
};

if (global && global.document) {
  global.document.addEventListener('DOMContentLoaded', function () {
    var useSafariCss = navigator.vendor && navigator.vendor.indexOf('Apple') > -1;
    if (useSafariCss) document.body.classList.add('safari');
  });
}

module.exports = LayerUI;