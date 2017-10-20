/**
 * Provides a Button Panel for adding custom actions to the layerUI.Composer panel.
 *
 * You can populate this button panel using the layer.UI.components.ConversationPanel.composeButtons property.
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
 * layer.UI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * @class layer.UI.components.ComposeButtonPanel
 * @extends layer.UI.components.Component
 * @removed
 */
import { registerComponent } from '../../../components/component';

registerComponent('layer-compose-button-panel', {
  properties: {
    /**
     * Custom buttons to put in the panel.
     *
     * @property {HTMLElement[]} [buttons=[]]
     */
    buttons: {
      value: [],
      set(value) {
        this.classList[value && value.length ? 'remove' : 'add']('is-empty');
        this.onRender();
      },
    },
  },
  methods: {
    /**
     * Render any custom buttons provided via the `buttons` property.
     *
     * @method
     * @private
     */
    onRender() {
      this.innerHTML = '';
      if (this.buttons.length) {
        const fragment = document.createDocumentFragment();
        this.buttons.forEach(button => fragment.appendChild(button));
        this.appendChild(fragment);
      }
    },
  },
});

