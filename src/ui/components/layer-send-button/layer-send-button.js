/**
 * The Layer Send button widget provides an alternative to hitting a keyboard `ENTER` key for sending a message.
 *
 * Its assumed that this button will be used within the layer.UI.components.ComposeButtonPanel.
 * If using it elsewhere, note that it triggers a `layer-send-click` event that you would listen for to do your own processing.
 * If using it in the ComposeButtonPanel, this event will be received and handled by the Composer and will not propagate any further.
 *
 * ```
 * document.body.addEventListener('layer-send-click', function(evt) {
 *    var messageParts = evt.custom.parts;
 *    conversation.createMessage({ parts: messageParts }).send();
 * }
 * ```
 *
 * A send button is added to a project as follows:
 *
 * ```
 * myConversationPanel.composeButtons = [
 *    document.createElement('layer-send-button')
 * ];
 * ```
 *
 * @class layer.UI.components.SendButton
 * @extends Layer.UI.components.Component
 */
import { registerComponent } from '../component';
import Clickable from '../../mixins/clickable';

registerComponent('layer-send-button', {
  mixins: [Clickable],
  properties: {
    text: {
      value: 'SEND',
      set(value) {
        this.firstChild.innerHTML = value;
      },
    },
  },
  methods: {
    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate() {
      this.addClickHandler('send-click', this, this.onClick.bind(this));
    },

    /**
     * MIXIN HOOK: Called whenever the button is clicked.
     *
     * @method
     * @param {Event} evt
     */
    onClick(evt) {
      this.trigger('layer-send-click');
    },
  },
});
