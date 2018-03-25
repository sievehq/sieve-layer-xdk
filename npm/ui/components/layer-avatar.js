/**
 * The Layer Avatar widget renders an icon representing a user or users.
 *
 * This widget appears within
 *
 * * Layer.UI.components.MessageListPanel.Item: Represents the sender of a Message
 * * Layer.UI.components.ConversationListPanel.Item.Conversation: Represents the participants of a Conversation
 * * Layer.UI.components.IdentityListPanel.Item: Represents a user in a User List
 *
 * Rendering is done using data from the `Layer.Core.Identity` object for each user, using the Layer.Core.Identity.avatarUrl if available to
 * add an image, or first initials from Layer.Core.Identity.firstName, Layer.Core.Identity.lastName if no avatarUrl is available.
 * Layer.Core.Identity.displayName is used as a fallback.
 *
 * The simplest way to customize this widget is to replace it with your own implementation of the `<layer-avatar />` tag.
 *
 * ```javascript
 * Layer.UI.registerComponent('layer-avatar', {
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
 * Layer.UI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * Note that the main parameter is a `users` array, not a single user:
 *
 * * When used in a Messages List or Identities List, there will be only one user in the list
 * * When used in a Conversations List, there may be multiple users who are participants of the Conversation.
 *
 * ### Importing
 *
 * Included in the default build. If creating a custom build, import:
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-avatar';
 * ```
 *
 * @class Layer.UI.components.Avatar
 * @extends Layer.UI.Component
 * @mixins Layer.UI.mixins.SizeProperty
 */
'use strict';

var _settings = require('../../settings');

var _core = require('../../core');

var _core2 = _interopRequireDefault(_core);

var _component = require('./component');

require('./layer-presence');

var _sizeProperty = require('../mixins/size-property');

var _sizeProperty2 = _interopRequireDefault(_sizeProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-avatar', {
  mixins: [_sizeProperty2.default],
  style: 'layer-avatar {\ndisplay: block;\n}\nlayer-avatar layer-presence {\nposition: absolute;\nbottom: 0px;\nright: 0px;\n}',
  properties: {

    /**
     * User to represent with this Avatar.
     *
     * Short cut to {@link #users} for when there is only a single user.
     *
     * @property {Layer.Core.Identity} [item=null]
     */
    item: {
      set: function set(value) {
        if (value instanceof _core2.default.Message) {
          this.users = [value.sender];
        } else if (value instanceof _core2.default.Conversation) {
          // If conversation is being loaded via `getConversation()` then wait for the participant list
          // to load before setting it
          if (!value.isLoading) {
            this.users = value.participants;
          }
        } else {
          this.users = [];
        }
      }
    },

    /**
     * Array of users to be represented by this Avatar.
     *
     * Typically this only has one user represented with a Layer.Core.Identity.
     *
     * Can use {@link #item} to set this instead.
     *
     * @property {Layer.Core.Identity[]} [users=[]}
     */
    users: {
      value: [],
      set: function set(newValue, oldValue) {
        if (Array.isArray(newValue)) {
          newValue = newValue.map(function (user) {
            return user instanceof _core2.default.Identity ? user : _settings.client.getIdentity(user.id);
          });
          this.properties.users = newValue;
        }

        // If nothing changed other than the array pointer, do nothing
        if (oldValue && newValue && newValue.length === oldValue.length) {
          var matches = newValue.filter(function (identity) {
            return oldValue.indexOf(identity) !== -1;
          });
          if (matches !== newValue.length) return;
        }

        if (!newValue) newValue = [];
        if (!Array.isArray(newValue)) newValue = [newValue];
        newValue = newValue.map(function (identity) {
          if (identity instanceof _core2.default.Identity) {
            return identity;
          } else {
            return _settings.client.getIdentity(identity.id);
          }
        });
        this.properties.users = newValue;

        // classList.toggle doesn't work right in IE 11
        this.toggleClass('layer-has-user', newValue.length);
        this.onRender();
      }
    },

    /**
     * Set whether to show or hide the Presence of the user when rendering this Avatar.
     *
     * @property {Boolean} [showPresence=true]
     */
    showPresence: {
      value: true,
      type: Boolean
    },

    size: {
      value: 'medium',
      set: function set(value) {
        if (this.nodes.presence) this.nodes.presence.size = value === 'larger' ? 'large' : value;
      }
    },
    supportedSizes: {
      value: ['small', 'medium', 'large', 'larger']
    }
  },
  methods: {

    /**
     * Render the users represented by this widget.
     *
     * @method
     * @private
     */
    onRender: function onRender() {
      var users = this.users.length === 1 ? this.users : this.users.filter(function (user) {
        return !user.isMine;
      });
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
      this.toggleClass('layer-avatar-cluster', users.length > 1);
      if (users.length === 1 && this.showPresence && _settings.client.isPresenceEnabled) {
        this.createElement('layer-presence', {
          size: this.size === 'larger' ? 'large' : this.size,
          item: users[0],
          name: 'presence',
          parentNode: this,
          classList: ['layer-presence-within-avatar']
        });
      }
    },


    /**
     * Render each individual user.
     *
     * @method
     * @private
     */
    _renderUser: function _renderUser(user, users) {
      var _this = this;

      var span = document.createElement('span');
      if (user.avatarUrl && !this.properties.failedToLoadImage) {
        span.classList.remove('layer-text-avatar');
        var img = document.createElement('img');
        span.appendChild(img);
        img.onerror = function () {
          img.parentNode.removeChild(img);
          _this._setupTextAvatar(span, user);
        };
        img.src = user.avatarUrl;
      } else {
        this._setupTextAvatar(span, user);
      }
      this.appendChild(span);
    },


    /**
     * Setup a single avatar (this may be a multi-avatar widget that gets called multiple times).
     *
     * @private
     * @method _setupTextAvatar
     * @param {HTMLElement} node    The HTML Element that will get the identity's intials
     * @param {Layer.Core.Identity} user   The Identity to represent with this node
     */
    _setupTextAvatar: function _setupTextAvatar(node, user) {
      var text = this.onGenerateInitials(user);
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
     * Layer.UI.init({
     *   mixins: {
     *     'layer-avatar': {
     *        methods: {
     *          onGenerateInitials: {
     *            mode: Layer.UI.registerComponent.MODES.OVERWRITE, // replace existing mechanism
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
     * @param {Layer.Core.Identity} user
     * @returns {String}
     */
    onGenerateInitials: function onGenerateInitials(user) {
      // Use first and last name if provided
      if (user.firstName || user.lastName) {
        return user.firstName.substring(0, 1).toUpperCase() + user.lastName.substring(0, 1).toUpperCase();
      }

      // Use displayName to try and find a first and last name
      else if (user.displayName.indexOf(' ') !== -1) {
          return user.displayName.substr(0, 1).toUpperCase() + user.displayName.substr(user.displayName.lastIndexOf(' ') + 1, 1).toUpperCase();
        }

        // If all else fails, use the first two letters
        else {
            return user.displayName.substring(0, 2).toUpperCase();
          }
    },
    _sortMultiAvatars: function _sortMultiAvatars() {
      var _this2 = this;

      return this.users.filter(function (user) {
        return !user.isMine;
      }).sort(function (userA, userB) {
        if (userA.type === 'BOT' && userB.type !== 'BOT') return 1;
        if (userB.type === 'BOT' && userA.type !== 'BOT') return -1;
        if (userA.avatarUrl && !userB.avatarUrl) return -1;
        if (userB.avatarUrl && !userA.avatarUrl) return 1;
        if (!userA.avatarUrl) {
          if (_this2.onGenerateInitials(userA) && !_this2.onGenerateInitials(userB)) return -1;
          if (_this2.onGenerateInitials(userB) && !_this2.onGenerateInitials(userA)) return 1;
        }
        if (_this2.users.indexOf(userA) > _this2.users.indexOf(userB)) return 1;
        return -1;
      });
    }
  }
}); 