/**
 * The Layer widget renders a title for a layer.Conversation.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own Conversation titles:
 *
 * ```
 * layerUI.registerComponent('layer-conversation-title', {
 *    properties: {
 *      item: {
 *        set: function(value) {
 *           this.innerHTML = this.item.metadata.myCustomTitle;
 *        }
 *      }
 *    }
 * });
 *
 * // Call init after custom components are defined
 * layerUI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * @class layerUI.components.ConversationTitle
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';

registerComponent('layer-conversation-title', {
  properties: {

    /**
     * The layer.Conversation to be rendered.
     *
     * @property {layer.Conversation} [item=null]
     */
    item: {
      set(newConversation, oldConversation) {
        if (oldConversation) oldConversation.off(null, null, this);
        if (newConversation) newConversation.on('conversations:change', this.onRerender, this);
        this.onRender();
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
      this.onRerender();
    },

    /**
     * Rerender the widget any time a new conversation is assigned or that conversation has a relevant change event.
     *
     * @method
     * @private
     * @param {Event} evt
     */
    onRerender(evt) {
      if (!evt || evt.hasProperty('metadata') || evt.hasProperty('participants')) {
        const conversation = this.item;

        // If no conversation, empty the widget
        if (!conversation) {
          this.innerHTML = '';
        } else {
          let title = conversation.metadata.conversationName;
          if (!title) {
            const users = conversation.participants
              .filter(user => !user.sessionOwner) // don't show the user their own name
              .filter(user => user.displayName || user.firstName || user.lastName);
            if (users.length === 1) {
              title = users[0].displayName || users[0].firstName || users[0].lastName;
            } else {
              const sortedUsers = this._sortNames();
              const sortedNames = sortedUsers.slice(0, 3).map(user => user.firstName || user.lastName || user.displayName);
              let names = sortedNames.join(', ');
              if (sortedUsers.length > 3) names += '&#8230;';
              title = names || 'No Title';
            }
          }
          if (title !== this.innerHTML) this.innerHTML = title;
        }
      }
    },

    _sortNames() {
      const participants = this.item.participants;
      return participants
          .filter(user => !user.sessionOwner)
          .filter(user => user.firstName || user.lastName || user.displayName)
          .sort((userA, userB) => {
            if (userA.type === 'BOT' && userB.type !== 'BOT') return 1;
            if (userB.type === 'BOT' && userA.type !== 'BOT') return -1;
            if ((!userA.firstName && !userA.lastName) && (userB.firstName || userB.lastName)) return 1;
            if ((userA.firstName || userA.lastName) && (!userB.firstName && !userB.lastName)) return -1;
            if (!userA.firstName && !userA.lastName) {
              if (userA.displayName && !userB.displayName) return -1;
              if (!userA.displayName && userB.displayName) return 1;
            }
            if (participants.indexOf(userA) > participants.indexOf(userB)) return 1;
            return -1;
          });
    },
  },
});
