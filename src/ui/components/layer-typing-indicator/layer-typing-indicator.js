/**
 * The Layer Typing Indicator widget renders a short description of who is currently typing into the current Conversation.
 *
 * This is designed to go inside of the layerUI.Conversation widget.
 *
 * The simplest way to customize the behavior of this widget is using the `layer-typing-indicator-change` event.
 *
 * TODO: Provide a Layer.UI.components.ConversationView.typingIndicatorRenderer property
 *
 * @class Layer.UI.components.TypingIndicator
 * @extends Layer.UI.components.Component
 */

/**
 * Custom handler to use for rendering typing indicators.
 *
 * By calling `evt.preventDefault()` on the event you can provide your own custom typing indicator text to this widget:
 *
 * ```javascript
 * document.body.addEventListener('layer-typing-indicator-change', function(evt) {
 *    evt.preventDefault();
 *    var widget = evt.target;
 *    var typingUsers = evt.detail.typing;
 *    var pausedUsers = evt.detail.paused;
 *    var text = '';
 *    if (typingUsers.length) text = typingUsers.length + ' users are typing';
 *    if (pausedUsers.length && typingUsers.length) text += ' and ';
 *    if (pausedUsers.length) text += pausedUsers.length + ' users have paused typing';
 *    widget.value = text;
 * });
 * ```
 *
 * Note that as long as you have called `evt.preventDefault()` you can also just directly manipulate child domNodes of `evt.detail.widget`
 * if a plain textual message doesn't suffice.
 *
 * @event layer-typing-indicator-change
 * @param {Event} evt
 * @param {Object} evt.detail
 * @param {Layer.Core.Identity[]} evt.detail.typing
 * @param {Layer.Core.Identity[]} evt.detail.paused
 */
import { registerComponent } from '../component';

registerComponent('layer-typing-indicator', {
  properties: {
    /**
     * The Conversation whose typing indicator activity we are reporting on.
     *
     * @property {Layer.Core.Conversation} [conversation=null]
     */
    conversation: {
      set(value) {
        if (value) {
          this.client = value.getClient();
          const state = this.client.getTypingState(value);
          this.onRerender({
            conversationId: value.id,
            typing: state.typing,
            paused: state.paused,
          });
        } else {
          this.value = '';
        }
      },
    },

    /**
     * The Client we are connected with; we need it to receive typing indicator events from the WebSDK.
     *
     * This property is typically set indirectly by setting the layerUI.TypingIndicator.conversation.
     *
     * @property {Layer.Core.Client} [client=null]
     */
    client: {
      set(newClient, oldClient) {
        if (oldClient) oldClient.off(null, null, this);
        if (newClient) newClient.on('typing-indicator-change', this.onRerender, this);
      },
    },

    /**
     * The value property is the text/html being rendered.
     *
     * @property {String} [value=""]
     */
    value: {
      set(text) {
        this.nodes.panel.innerHTML = text || '';
        // classList.toggle doesn't work right in IE11
        this.classList[text ? 'add' : 'remove']('layer-typing-occuring');
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

    },

    onRender() {
      if (this.conversation && this.conversation.id) {
        const data = this.client.getTypingState(this.conversation.id);
        data.conversationId = this.conversation.id;
        this.onRerender(data);
      }
    },

    /**
     * Whenever there is a typing indicator event, rerender our UI
     *
     * @method onRerender
     * @param {Layer.Core.LayerEvent} evt
     */
    onRerender(evt) {
      // We receive typing indicator events for ALL Conversations; ignore them if they don't apply to the current Conversation
      if (this.conversation && evt.conversationId === this.conversation.id) {

        // Trigger an event so that the application can decide if it wants to handle the event itself.
        const customEvtResult = this.trigger('layer-typing-indicator-change', {
          typing: evt.typing,
          paused: evt.paused,
          widget: this,
        });

        // If the app lets us handle the event, set the value of this widget to something appropriate
        if (customEvtResult) {
          this.showAsTyping(evt.typing);
        }
      }
    },

    showAsTyping(identities) {
      const names = identities.map(user => user.firstName || user.displayName || user.lastName).filter(name => name);
      switch (names.length) {
        case 0:
          if (identities.length) {
            this.value = 'User is typing';
          } else {
            this.value = '';
          }
          break;
        case 1:
          this.value = names.join(', ') + ' is typing';
          break;
        case 2:
          this.value = `${names[0]} and ${names[1]} are typing`;
          break;
        default:
          this.value = `${names[0]}, ${names[1]} and ${names.length - 2} others are typing`;
      }
    },
  },
});

