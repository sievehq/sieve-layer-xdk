/*
 * Why does this file exist?
 * 1. component.js depends upon utilities in base.js; if this code were in base.js,
 *    then base.js would also depend upon component.js; this would be a pain.
 * 2.
 * Import this if you want just a basic setup without any built-in widgets.
 *
 * Import index.js instead of you want a standard setup with standard widgets installed.
 */

 /**
  * @class Layer.UI
  */

import 'webcomponents.js/webcomponents-lite';
import layerUI from './base';
import { registerComponent, registerAll, unregisterComponent } from './components/component';
import './handlers/message/layer-message-unknown';
import { Client } from '../core';
import { registerTextHandler } from './handlers/text/text-handlers';

layerUI.registerComponent = registerComponent;

/**
 * Unregister a component.  Must be called before layerUI.init().
 *
 * Use this call to prevent a component from being registered with the document.
 * Currently this works only on components that have been already called with `layerUI.registerComponent`
 * but which have not yet been completed via a call to `layerUI.init()`.
 *
 * This is not typically needed, but allows you to defer creation of a widget, and then at some point later in your application lifecycle
 * define a replacement for that widget. You can not redefine an html tag that is registered with the document... but this prevents it from
 * being registered yet.
 *
 * @method unregisterComponent
 */
layerUI.unregisterComponent = unregisterComponent;

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
 * @param {Object} settings     list any settings you want changed from their default values.
 * @param {Object} mixins       hash of component names with mixins to add to the component
 */
layerUI.init = function init(settings = {}) {
  Object.keys(settings).forEach((name) => {
    if (name !== 'mixins') {
      layerUI.settings[name] = settings[name];
    }
  });
  if (!layerUI.settings.client && layerUI.settings.appId) {
    layerUI.settings.client = Client.getClient(layerUI.settings.appId);
  }

  layerUI.setupMixins(settings.mixins || {});

  // Register all widgets
  registerAll();

  // Enable the text handlers
  layerUI.settings.textHandlers.forEach((handlerName) => {
    registerTextHandler({ name: handlerName });
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
 * `setupMixins` may be called multiple times; however, at this time, only
 * a single mixin is supported per component.
 *
 * TODO: Support arrays of mixins
 *
 * @method setupMixins
 * @param {Object} mixins
 */
layerUI.setupMixins = function setupMixins(mixins) {
  if (!layerUI.settings.mixins) layerUI.settings.mixins = {};
  Object.keys(mixins).forEach((componentName) => {
    layerUI.settings.mixins[componentName] = Object.assign({}, layerUI.settings[componentName] || {}, mixins[componentName]);
  });
};

if (global && global.document) {
  global.document.addEventListener('DOMContentLoaded', function() {
    const useSafariCss = navigator.vendor && navigator.vendor.indexOf('Apple') > -1;
    if (useSafariCss) document.body.classList.add('safari');
  });
}


module.exports = layerUI;

