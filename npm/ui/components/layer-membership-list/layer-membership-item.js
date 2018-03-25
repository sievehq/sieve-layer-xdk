/**
 * The Layer Membership Item represents a single user within a Membership List.
 *
 * ### Importing
 *
 * Not included with the standard build. To import pick one:
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-membership-list';
 * import '@layerhq/web-xdk/ui/components/layer-membership-list/layer-membership-item';
 * ```
 *
 * @class Layer.UI.components.MembershipListPanel.Item
 * @experimental
 * @extends Layer.UI.Component
 * @mixins Layer.UI.mixins.ListItem
 * @mixins Layer.UI.mixins.ListItemSelection
 */
'use strict';

var _listItem = require('../../mixins/list-item');

var _listItem2 = _interopRequireDefault(_listItem);

var _listItemSelection = require('../../mixins/list-item-selection');

var _listItemSelection2 = _interopRequireDefault(_listItemSelection);

var _component = require('../component');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-membership-item', {
  mixins: [_listItem2.default, _listItemSelection2.default],
  template: '<div class=\'layer-list-item\'><layer-avatar layer-id=\'avatar\'></layer-avatar><label class=\'layer-membership-name\' layer-id=\'title\'></label></div>',
  style: 'layer-membership-item {\ndisplay: flex;\nflex-direction: column;\n}\nlayer-membership-item .layer-list-item {\ndisplay: flex;\nflex-direction: row;\nalign-items: center;\n}\nlayer-membership-item .layer-list-item layer-avatar {\nmargin-right: 20px;\n}\nlayer-membership-item .layer-list-item label {\nflex-grow: 1;\nwidth: 100px;\n}\nlayer-membership-item.layer-item-filtered .layer-list-item,\nlayer-membership-item.layer-membership-item-empty {\ndisplay: none;\n}',
  properties: {
    item: {
      set: function set(member) {
        if (member) member.identity.on('identities:change', this.onRerender.bind(this));
      }
    }
  },
  methods: {
    /**
     * Render/rerender the user, showing the avatar and user's name.
     *
     * @method onRender
     * @private
     */
    onRender: function onRender() {
      this.nodes.avatar.users = [this.item.identity];
      this.onRerender();
    },


    /**
     * Render/rerender changes to the Identity object or Membership object.
     *
     * @method onRerender
     * @private
     */
    onRerender: function onRerender() {
      this.nodes.title.innerHTML = this.item.identity.displayName || 'User ID ' + this.item.identity.userId;
    },


    /**
     * Run a filter on this item, and hide it if it doesn't match the filter.
     *
     * @method _runFilter
     * @param {String/RegExp/Function} filter
     */
    _runFilter: function _runFilter(filter) {
      var identity = this.properties.item.identity;
      var match = false;
      if (!filter) {
        match = true;
      } else if (filter instanceof RegExp) {
        match = filter.test(identity.displayName) || filter.test(identity.firstName) || filter.test(identity.lastName) || filter.test(identity.emailAddress);
      } else if (typeof filter === 'function') {
        match = filter(identity);
      } else {
        filter = filter.toLowerCase();
        match = identity.displayName.toLowerCase().indexOf(filter) !== -1 || identity.firstName.toLowerCase().indexOf(filter) !== -1 || identity.lastName.toLowerCase().indexOf(filter) !== -1 || identity.emailAddress.toLowerCase().indexOf(filter) !== -1;
      }
      this.classList[match ? 'remove' : 'add']('layer-item-filtered');
    }
  }
}); 