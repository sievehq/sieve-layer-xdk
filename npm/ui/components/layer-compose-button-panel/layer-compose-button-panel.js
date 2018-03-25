/**
 * Provides a Button Panel for adding custom actions to the layerUI.Composer panel.
 *
 * You can populate this button panel using the Layer.UI.components.ConversationView.composeButtons property.
 *
 * Alternatively, you can replace this by defining a custom `layer-compose-button-panel` to make the resulting component entirely yours:
 *
 * ```
 * document.registerElement('layer-compose-button-panel', {
 *   prototype: Object.create(HTMLElement.prototype, {
 *     createdCallback: {
 *       value: function() {
 *         this.innerHTML = "<button>Click me!</button>";
 *       }
 *     }
 *   })
 * });
 *
 * // Call init after custom components are defined
 * Layer.UI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * @class Layer.UI.components.ComposeButtonPanel
 * @extends Layer.UI.Component
 * @removed
 */
"use strict";



(function () {
  var layerUI = require('../../layer-ui');
  layerUI.buildAndRegisterTemplate("layer-compose-button-panel", "", "");
  layerUI.buildStyle("layer-compose-button-panel", "layer-compose-button-panel.is-empty {\ndisplay: none;\n}\nlayer-compose-button-panel {\ndisplay: flex;\nflex-direction: row;\nalign-items: stretch;\n}", "");
})();