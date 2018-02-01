/**
 * The Layer widget renders the Layer.Core.Conversation.lastMessage.
 *
 * Customize the look and feel of your Last Message withing the Layer.UI.components.ConversationListPanel.List
 * by overriding the `onRerender` method:
 *
 * ```
 * Layer.init({
 *   mixins: {
 *     'layer-conversation-last-message', {
 *        methods: {
 *          onRerender: {
 *            mode: Layer.UI.registerComponent.MODES.OVERWRITE,
 *            value: function() {
 *              this.innerHTML = this.model ? this.model.getOneLineSummary() : '';
 *            }
 *          }
 *        }
 *     }
 *   }
 * });
 * ```
 *
 * This may be used to render more than just a one line of text as well; rendering Interactive Messages for example.
 *
 * ### Importing
 *
 * Import this using
 *
 * ```
 * import '@layerhq/web-xdk/lib/ui/components/layer-conversation-last-message';
 * ```
 *
 * @class Layer.UI.components.ConversationLastMessage
 * @extends Layer.UI.Component
 */
import { registerComponent } from './component';

registerComponent('layer-conversation-last-message', {
  style: `
    layer-conversation-last-message, .layer-custom-mime-type {
      display: block;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  `,
  properties: {

    /**
     * The Layer.Core.Message to be rendered
     *
     * @property {Layer.Core.Message} [item=null]
     */
    item: {
      set(newValue, oldValue) {
        if (oldValue) oldValue.off(null, null, this);
        if (newValue) newValue.on('conversations:change', this._handleChangeEvent, this);
        if (newValue && newValue.lastMessage) {
          this.model = newValue.lastMessage.createModel();
        } else {
          this.model = null;
        }

        this.onRender();
      },
    },

    /**
     * Message Type Model representing the Conversation's Last Message
     *
     * @property {Layer.Core.MessageTypeModel} model
     */
    model: {},

    /**
     * Provide a function to determine if the last message is rendered in the Conversation List.
     *
     * By default, only text/plain last-messages are rendered in the Conversation List.  A Message that is NOT rendered
     * is instead rendered using the MessageHandler's label: `(ICON) Image Message`
     *
     * ```javascript
     * listItem.canFullyRenderLastMessage = function(message) {
     *     return true; // Render all Last Messages
     * }
     * ```
     *
     * @property {Function} [canFullyRenderLastMessage=null]
     * @removed
     */
  },
  methods: {

    // Lifecycle method
    onRerender() {
      this.innerHTML = this.model ? this.model.getOneLineSummary() : '';
    },

    /**
     * Insure that any time the Layer.Core.Conversation changes, onRerender is only called if the change
     * involves a new `lastMessage` value.
     *
     * @param {Event} evt
     * @private
     */
    _handleChangeEvent(evt) {
      if (evt.hasProperty('lastMessage')) {
        this.model = this.item.lastMessage ? this.item.lastMessage.createModel() : null;
        this.onRerender();
      }
    },
  },
});
