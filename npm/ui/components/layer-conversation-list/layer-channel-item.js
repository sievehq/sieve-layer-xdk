/**
 * The Layer Channel Item widget renders a single Channel, typically for use representing a
 * channel within a list of channels.
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
 * import '@layerhq/web-xdk/ui/components/layer-conversation-list/layer-channel-item';
 * ```
 *
 * @class Layer.UI.components.ConversationListPanel.Item.Channel
 * @experimental
 * @extends Layer.UI.Component
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


(0, _component.registerComponent)('layer-channel-item', {
  mixins: [_listItem2.default, _listItemSelection2.default, _sizeProperty2.default],
  template: '<div class=\'layer-list-item\' layer-id=\'innerNode\'><div class=\'layer-channel-item-content\'><div layer-id=\'title\' class=\'layer-channel-title\'></div></div></div>',
  style: 'layer-channel-item {\ndisplay: flex;\nflex-direction: column;\n}\nlayer-channel-item .layer-list-item {\ndisplay: flex;\nflex-direction: row;\nalign-items: center;\n}\nlayer-channel-item  .layer-list-item .layer-channel-item-content {\nflex-grow: 1;\nwidth: 100px;\n}\nlayer-channel-item.layer-item-filtered .layer-list-item {\ndisplay: none;\n}',
  properties: {

    // Every List Item has an item property, here it represents the Conversation to render
    item: {
      set: function set(newConversation, oldConversation) {
        if (newConversation) this.onRerender();
      }
    },

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

    supportedSizes: {
      value: ['tiny', 'small', 'medium', 'large']
    }
  },
  methods: {
    onRerender: function onRerender() {
      if (this.item) this.nodes.title.innerHTML = this.item.name;
    },


    /**
     * Run a filter on this item; not match => hidden; match => shown.
     *
     * @method _runFilter
     * @param {String/RegExp/Function} filter
     */
    _runFilter: function _runFilter(filter) {
      var channel = this.properties.item;
      var match = void 0;
      if (!filter) {
        match = true;
      } else if (typeof filter === 'function') {
        match = filter(channel);
      } else if (filter instanceof RegExp) {
        match = filter.test(channel.name);
      } else {
        filter = filter.toLowerCase();
        match = channel.name.toLowerCase().indexOf(filter) !== -1;
      }
      this.classList[match ? 'remove' : 'add']('layer-item-filtered');
    }
  }
});