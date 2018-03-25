/**
 * The Layer Conversation Item widget renders a single Conversation, typically for use representing a
 * conversation within a list of conversations.
 *
 * This is designed to go inside of the Layer.UI.components.ConversationListPanel.List widget, and be a
 * concise enough summary that it can be scrolled through along
 * with hundreds of other Conversations Item widgets.
 *
 * Future Work:
 *
 * * Badges for unread messages (currently just adds a css class so styling can change if there are any unread messages)
 *
 * ### Importing
 *
 * Not included with the standard build. To import pick one:
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-conversation-list';
 * import '@layerhq/web-xdk/ui/components/layer-conversation-list/layer-conversation-item';
 * ```
 *
 * @class Layer.UI.components.ConversationListPanel.Item.Conversation
 * @extends Layer.UI.Component
 * @mixin Layer.UI.mixins.ListItem
 * @mixin Layer.UI.mixins.SizeProperty
 * @mixin Layer.UI.mixins.ListItemSelection
 */
'use strict';

var _component = require('../../components/component');

var _listItem = require('../../mixins/list-item');

var _listItem2 = _interopRequireDefault(_listItem);

var _listItemSelection = require('../../mixins/list-item-selection');

var _listItemSelection2 = _interopRequireDefault(_listItemSelection);

var _sizeProperty = require('../../mixins/size-property');

var _sizeProperty2 = _interopRequireDefault(_sizeProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-conversation-item', {
  mixins: [_listItem2.default, _listItemSelection2.default, _sizeProperty2.default],
  /* eslint-disable-next-line max-len */
  template: '<div class=\'layer-list-item\' layer-id=\'innerNode\'><layer-replaceable-content\nclass=\'layer-conversation-left-side\'\nname=\'conversationRowLeftSide\'></layer-replaceable-content><div class=\'layer-conversation-item-content\'><div class=\'layer-conversation-title-row\'><layer-conversation-title layer-id=\'title\'></layer-conversation-title><layer-conversation-item-date layer-id=\'date\'></layer-conversation-item-date></div><layer-conversation-last-message layer-id=\'lastMessage\'></layer-conversation-last-message></div><layer-replaceable-content\nclass=\'layer-conversation-right-side\'\nname=\'conversationRowRightSide\'></layer-replaceable-content></div>',
  style: 'layer-conversation-item {\ndisplay: flex;\nflex-direction: column;\n}\nlayer-conversation-item .layer-list-item {\ndisplay: flex;\nflex-direction: row;\nalign-items: center;\n}\nlayer-conversation-item  .layer-list-item .layer-conversation-item-content {\nflex-grow: 1;\nwidth: 100px;\n}\nlayer-conversation-item .layer-conversation-title-row {\ndisplay: flex;\nflex-direction: row;\n}\nlayer-conversation-item .layer-conversation-title-row layer-conversation-title {\nflex-grow: 1;\nwidth: 100px;\n}\nlayer-conversation-item.layer-item-filtered .layer-list-item,\nlayer-conversation-item layer-presence,\nlayer-conversation-item .layer-group-counter,\nlayer-conversation-item.layer-size-tiny layer-avatar {\ndisplay: none;\n}\nlayer-conversation-item layer-avatar layer-presence,\nlayer-conversation-item.layer-size-tiny.layer-group-conversation .layer-group-counter,\nlayer-conversation-item.layer-size-tiny.layer-direct-message-conversation layer-presence {\ndisplay: block;\n}',
  properties: {

    /**
     * The Item to render in this list item row; specifically, the Layer.Core.Conversation represented by this row.
     *
     * @property {Layer.Core.Conversation} item
     */
    item: {},

    /**
     * Enable deletion of this Conversation.
     *
     * This property is currently assumed to be settable at creation time only,
     * and does not rerender if changed.
     *
     * This property does nothing if you remove the `delete` node from the template.
     *
     * @property {Boolean} [deleteConversationEnabled=false]
     * @removed
     */

    /**
     * Provide a function to determine if the last message is rendered in the Conversation List.
     *
     * By default, only text/plain last-messages are fully rendered in the Conversation List.
     *
     * All other messages are rendered using the `label` passed in with their Layer.UI.handlers.message.register call.
     *
     * ```javascript
     * listItem.canFullyRenderLastMessage = function(message) {
     *     return true; // Render the current Messages
     * }
     * ```
     *
     * @property {Function} [canFullyRenderLastMessage=null]
     * @removed
     */

    // See Layer.UI.mixins.SizeProperty.size
    size: {
      value: 'large',
      set: function set(size) {
        var _this = this;

        Object.keys(this.nodes).forEach(function (nodeName) {
          var node = _this.nodes[nodeName];
          if (node.supportedSizes && node.supportedSizes.indexOf(size) !== -1) {
            node.size = size;
          }
        });
      }
    },

    // See Layer.UI.mixins.SizeProperty.supportedSizes
    supportedSizes: {
      value: ['tiny', 'small', 'medium', 'large']
    },

    /**
     * Set the date format for the Conversation Item.
     *
     * Note that typically you'd set Layer.UI.components.ConversationListPanel.List.dateFormat instead, and this would set it for all
     * Conversation Item components.
     *
     * @property {Object} [dateFormat]
     */
    dateFormat: {
      value: {
        today: { hour: 'numeric', minute: 'numeric' },
        week: { weekday: 'short' },
        older: { month: 'short', year: 'numeric' },
        default: { month: 'short', day: 'numeric' }
      },
      set: function set(dateFormat) {
        var _this2 = this;

        if (dateFormat && this.nodes.date) {
          Object.keys(dateFormat).forEach(function (formatName) {
            return _this2.nodes.date[formatName + 'Format'] = dateFormat[formatName];
          });
        }
      }
    },

    /**
     * Provide a function that returns the menu items this Message Item.
     *
     * > *Notes*
     * >
     * > 1. This is called each time the user clicks on a menu button next to a message to open the menu,
     * but is not dynamic in that it will regenerate the list while its open.
     * > 2. This only works if your `<layer-message-item-sent />` or `<layer-message-item-received />` has a `<layer-menu-button layer-id='menuButton'/>`;
     * >    The `layer-id` is required... unless explicitly setting `messageListItem.nodes.menuButton = <layer-menu-button />;`
     *
     * Format is:
     *
     * ```
     * widget.getMenuItems = function(conversation) {
     *   return [
     *     {text: "label1", method: method1},
     *     {text: "label2", method: method2},
     *     {text: "label3", method: method3}
     *   ];
     * }
     * ```
     *
     * @property {Function} getMenuItems
     * @property {Layer.Core.Conversation} getMenuItems.conversation
     * @property {Object[]} getMenuItems.return
     */
    getMenuItems: {
      type: Function,
      set: function set() {
        if (this.nodes.menuButton) {
          this.nodes.menuButton.getMenuItems = this.properties.getMenuItems;
        }
      }
    }
  },
  methods: {

    // Lifecycle method
    onRerender: function onRerender() {
      var users = this.item.participants.filter(function (user) {
        return !user.isMine;
      });
      var isUnread = this.item.lastMessage && !this.item.lastMessage.isRead;

      // Group counter only shows when size = tiny and there is more than one other
      // participant; set it to have the number of participants.
      if (this.nodes.groupCounter) this.nodes.groupCounter.innerHTML = users.length;

      // Setup the CSS class to indicate group/direct-message
      this.toggleClass('layer-group-conversation', users.length > 1);
      this.toggleClass('layer-direct-message-conversation', users.length <= 1);

      // If there is a date node, wire it up to render the correct value
      if (this.nodes.date) {
        if (!this.item.lastMessage) {
          this.nodes.date.date = null;
          this.nodes.date.value = '';
        } else if (this.item.lastMessage.isNew()) {
          this.item.lastMessage.on('messages:change', this.onRerender, this);
          this.nodes.date.value = '';
        } else if (this.item.lastMessage.isSaving()) {
          this.nodes.date.value = 'Pending'; // LOCALIZE!
          this.item.lastMessage.on('messages:change', this.onRerender, this);
        } else {
          this.item.lastMessage.off('messages:change', this.onRerender, this);
          this.nodes.date.date = this.item.lastMessage.sentAt;
        }
      }

      // Setup the avatar and presence nodes
      if (this.nodes.avatar) {
        this.nodes.avatar.users = users;
      }
      if (this.nodes.presence) this.nodes.presence.item = users.length === 1 ? users[0] : null;

      // Setup the unread style
      this.toggleClass('layer-conversation-unread-messages', isUnread);
    },


    /**
     * Run a filter on this item; if the filter returns `false` hide the item, else show the item
     *
     * Note that this does not filter data out of the Layer.Core.Query.data; to do that,
     * see Layer.Core.Query.filter. This filter is for doing local search,
     * that filter is not for search, but for removing invalid data from the dataset such
     * that only requerying the server will restore the data.
     *
     * @method _runFilter
     * @param {String/RegExp/Function} filter
     */
    _runFilter: function _runFilter(filter) {
      var conversation = this.properties.item;
      var match = void 0;
      if (!filter) {
        match = true;
      } else if (typeof filter === 'function') {
        match = filter(conversation);
      } else {
        var values = [];
        if (conversation.metadata.conversationName) values.push(conversation.metadata.conversationName);
        conversation.participants.forEach(function (identity) {
          values.push(identity.displayName);
          values.push(identity.firstName);
          values.push(identity.lastName);
          values.push(identity.emailAddress);
        });
        if (filter instanceof RegExp) {
          match = values.filter(function (value) {
            return filter.test(value);
          }).length;
        } else {
          filter = filter.toLowerCase();
          match = values.filter(function (value) {
            if (value) {
              return value.toLowerCase().indexOf(filter) !== -1;
            } else {
              return false;
            }
          }).length;
        }
      }
      this.classList[match ? 'remove' : 'add']('layer-item-filtered');
    }
  }
});