/**
 * The Layer Avatar widget renders an icon representing a user or users.
 *
 * This widget appears within
 *
 * * layer.UI.components.MessagesListPanel.Item: Represents the sender of a Message
 * * layer.UI.components.ConversationsListPanel.Item.Conversation: Represents the participants of a Conversation
 * * layer.UI.components.IdentitiesListPanel.Item: Represents a user in a User List
 *
 * Rendering is done using data from the `layer.Core.Identity` object for each user, using the layer.Core.Identity.avatarUrl if available to
 * add an image, or first initials from layer.Core.Identity.firstName, layer.Core.Identity.lastName if no avatarUrl is available.
 * layer.Core.Identity.displayName is used as a fallback.
 *
 * The simplest way to customize this widget is to replace it with your own implementation of the `<layer-avatar />` tag.
 *
 * ```javascript
 * layer.UI.registerComponent('layer-avatar', {
 *    properties: {
 *      users: {
 *        set: function(value) {
 *           this.render();
 *        }
 *      }
 *    },
 *    methods: {
 *      render: function() {
 *        this.innerHTML = 'All Hail ' + this.properties.users[0].displayName;
 *      }
 *    }
 * });
 *
 * // Call init after custom components are defined
 * layer.UI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * Note that the main parameter is a `users` array, not a single user:
 *
 * * When used in a Messages List or Identities List, there will be only one user in the list
 * * When used in a Conversations List, there may be multiple users who are participants of the Conversation.
 *
 * @class layer.UI.components.Avatar
 * @extends layer.UI.components.Component
 */
import Core from '../../../core';

import { registerComponent } from '../component';
import '../layer-presence/layer-presence';
import SizeProperty from '../../mixins/size-property';
import MainComponent from '../../mixins/main-component';

registerComponent('layer-avatar', {
  mixins: [SizeProperty, MainComponent],
  properties: {
    item: {
      set(value) {
        if (value instanceof Core.Message) {
          this.users = [value.sender];
        } else if (value instanceof Core.Conversation) {
          this.users = value.participants;
        } else {
          this.users = [];
        }
      },
    },

    /**
     * Array of users to be represented by this Avatar.
     *
     * Typically this only has one user represented with a layer.Core.Identity.
     *
     * @property {layer.Core.Identity[]} [users=[]}
     */
    users: {
      value: [],
      set(newValue, oldValue) {
        if (Array.isArray(newValue)) {
          newValue = newValue.map(user => (user instanceof Core.Identity ? user : this.client.getIdentity(user.id)));
          this.properties.users = newValue;
        }

        // If nothing changed other than the array pointer, do nothing
        if (oldValue && newValue && newValue.length === oldValue.length) {
          const matches = newValue.filter(identity => oldValue.indexOf(identity) !== -1);
          if (matches !== newValue.length) return;
        }

        if (!newValue) newValue = [];
        if (!Array.isArray(newValue)) newValue = [newValue];
        newValue = newValue.map((identity) => {
          if (identity instanceof Core.Identity) {
            return identity;
          } else {
            return this.client.getIdentity(identity.id);
          }
        });
        this.properties.users = newValue;


        // classList.toggle doesn't work right in IE 11
        this.toggleClass('layer-has-user', newValue.length);
        this.onRender();
      },
    },

    showPresence: {
      value: true,
      type: Boolean,
    },

    size: {
      value: 'medium',
      set(value) {
        if (this.nodes.presence) this.nodes.presence.size = value === 'larger' ? 'large' : value;
      },
    },
    supportedSizes: {
      value: ['small', 'medium', 'large', 'larger'],
    },
  },
  methods: {

    /**
     * Render the users represented by this widget.
     *
     * @method
     * @private
     */
    onRender() {
      const users = this.users.length === 1 ? this.users : this.users.filter(user => !user.sessionOwner);
      // Clear the innerHTML if we have rendered something before
      if (this.users.length) {
        this.innerHTML = '';
      }

      // Render each user
      if (users.length === 1) {
        this._renderUser(users[0]);
      } else {
        this._sortMultiAvatars().forEach(this._renderUser.bind(this));
      }

      // Add the "cluster" css if rendering multiple users
      // No classList.toggle due to poor IE11 support
      this.classList[users.length > 1 ? 'add' : 'remove']('layer-avatar-cluster');
      if (users.length === 1 && this.showPresence && users[0].getClient().isPresenceEnabled) {
        this.nodes.presence = document.createElement('layer-presence');
        this.nodes.presence.classList.add('layer-presence-within-avatar');
        this.nodes.presence.item = users[0];
        this.nodes.presence.size = this.size === 'larger' ? 'large' : this.size;
        this.appendChild(this.nodes.presence);
      }
    },

    /**
     * Render each individual user.
     *
     * @method
     * @private
     */
    _renderUser(user, users) {
      const span = document.createElement('span');
      if (user.avatarUrl && !this.properties.failedToLoadImage) {
        span.classList.remove('layer-text-avatar');
        const img = document.createElement('img');
        span.appendChild(img);
        img.onerror = () => {
          img.parentNode.removeChild(img);
          this._setupTextAvatar(span, user);
        };
        img.src = user.avatarUrl;
      } else {
        this._setupTextAvatar(span, user);
      }
      this.appendChild(span);
    },

    _setupTextAvatar(node, user) {
      const text = this.onGenerateInitials(user);
      node.innerHTML = text;
      node.classList[text ? 'add' : 'remove']('layer-text-avatar');
      node.classList[!text ? 'add' : 'remove']('layer-empty-avatar');
    },

    /**
     * MIXIN HOOK: Replace this with your own initial generator
     *
     * A user's intitials are put into an avatar if no image is present.
     * You can replace Layer's method for coming up with initials with your own:
     *
     * ```
     * layer.UI.init({
     *   mixins: {
     *     'layer-avatar': {
     *        methods: {
     *          onGenerateInitials: {
     *            mode: layerUI.Component.MODES.OVERWRITE, // replace existing mechanism
     *            value: function onGenerateInitials() {
     *              return 'OO';
     *            }
     *          }
     *        }
     *      }
     *   }
     * });
     * ```
     *
     * @method
     * @param {layer.Core.Identity} user
     * @returns {String}
     */
    onGenerateInitials(user) {
      // Use first and last name if provided
      if (user.firstName || user.lastName) {
        return user.firstName.substring(0, 1).toUpperCase() + user.lastName.substring(0, 1).toUpperCase();
      }

      // Use displayName to try and find a first and last name
      else if (user.displayName.indexOf(' ') !== -1) {
        return user.displayName.substr(0, 1).toUpperCase() +
          user.displayName.substr(user.displayName.lastIndexOf(' ') + 1, 1).toUpperCase();
      }

      // If all else fails, use the first two letters
      else {
        return user.displayName.substring(0, 2).toUpperCase();
      }
    },

    _sortMultiAvatars() {
      return this.users
          .filter(user => !user.sessionOwner)
          .sort((userA, userB) => {
            if (userA.type === 'BOT' && userB.type !== 'BOT') return 1;
            if (userB.type === 'BOT' && userA.type !== 'BOT') return -1;
            if (userA.avatarUrl && !userB.avatarUrl) return -1;
            if (userB.avatarUrl && !userA.avatarUrl) return 1;
            if (!userA.avatarUrl) {
              if (this.onGenerateInitials(userA) && !this.onGenerateInitials(userB)) return -1;
              if (this.onGenerateInitials(userB) && !this.onGenerateInitials(userA)) return 1;
            }
            if (this.users.indexOf(userA) > this.users.indexOf(userB)) return 1;
            return -1;
          });
    },
  },
});

