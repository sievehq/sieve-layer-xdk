/**
 * The Layer Send button widget provides an alternative to hitting a keyboard `ENTER` key for sending a message.
 *
 * Its assumed that this button will be used within the Layer.UI.components.ComposeBar.
 * If using it elsewhere, note that it triggers a `layer-send-click` event that you would listen for to do your own processing.
 * If using it in the Layer.UI.components.ComposeBar, this event will be received and handled by the Compose Bar.
 *
 * ```
 * document.body.addEventListener('layer-send-click', function(evt) {
 *    var TextModel = Layer.Core.Client.getMessageTypeModelClass('TextModel');
 *    var model = new TextModel({ text: document.getElementById("myinput").value });
 *    model.send({ conversation });
 * });
 * ```
 *
 * A send button is added to a project as follows:
 *
 * ```
 * var myConversationView = document.createElement("layer-send-button");
 * var button = document.createElement("layer-send-button");
 * myConversationView.replaceableContent = {
 *    composerButtonPanelRight: button
 * };
 * ```
 *
 * ### Importing
 *
 * Any of the following will import this component
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-send-button';
 * ```
 *
 * @class Layer.UI.components.SendButton
 * @extends Layer.UI.Component
 * @mixin Layer.UI.mixins.Clickable
 */
import { registerComponent } from './component';
import Clickable from '../mixins/clickable';

registerComponent('layer-send-button', {
  mixins: [Clickable],
  template: '<i class="fas fa-paper-plane fa-lg"></i>',
  style: `
    layer-send-button {
      cursor: pointer;
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    layer-send-button div {
      text-align: center;
    }
  `,
  properties: {
    /**
     * Text to show in the button
     *
     * ```
     * var button = document.createElement("layer-send-button");
     * button.text = "Send it";
     * ```
     *
     * @property {String} [text=SEND]
     */
    text: {
      value: 'SEND',
      set(value) {
        this.firstChild.innerHTML = value;
      },
    },
  },
  methods: {
    // Lifecycle method
    onCreate() {
      this.addClickHandler('send-click', this, this.onClick.bind(this));
    },

    /**
     * MIXIN HOOK: Called whenever the button is clicked.
     *
     * ```
     * Layer.init({
     *     mixins: {
     *       'layer-send-button': {
     *         methods: {
     *           onClick() {
     *             console.log("User has clicked send button");
     *           }
     *         }
     *       }
     *     }
     * });
     * ```
     *
     * @method onClick
     * @param {Event} evt
     */
    onClick(evt) {

      /**
       * The layer-send-click is triggered whenever this button is clicked.
       *
       * ```
       * document.body.addEventListener('layer-send-click', function(evt) {
       *   console.log("User has clicked send button");
       * });
       * ```
       *
       * @event layer-send-click
       */
      this.trigger('layer-send-click');
    },
  },
});
