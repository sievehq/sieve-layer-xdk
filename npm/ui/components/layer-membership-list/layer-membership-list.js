/**
 * The Layer Membership List renders a pagable list of Layer.Core.Membership objects, and allows the user to
 * see who else is in the Layer.Core.Channel with them.
 *
 * This Component can be added to your project directly in the HTML file:
 *
 * ```
 * <layer-membership-list></layer-membership-list>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var membersList = document.createElement('layer-membership-list');
 * ```
 *
 * ### Importing
 *
 * Not included with the standard build. To import pick one:
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-membership-list';
 * import '@layerhq/web-xdk/ui/components/layer-membership-list/layer-membership-list';
 * ```
 *
 * @class Layer.UI.components.MembershipListPanel.List
 * @experimental This feature is incomplete, and available as Preview only.
 * @extends Layer.UI.Component
 * @mixin Layer.UI.mixins.List
 * @mixin Layer.UI.mixins.ListSelection
 */
'use strict';

var _settings = require('../../../settings');

var _core = require('../../../core');

var _core2 = _interopRequireDefault(_core);

var _component = require('../component');

var _list = require('../../mixins/list');

var _list2 = _interopRequireDefault(_list);

var _listSelection = require('../../mixins/list-selection');

var _listSelection2 = _interopRequireDefault(_listSelection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Channel = _core2.default.Channel; 


(0, _component.registerComponent)('layer-membership-list', {
  mixins: [_list2.default, _listSelection2.default],
  // TODO: This is probably broken and needs to be updated to match other lists with a meta section at the top
  template: '<div class="layer-load-indicator" layer-id="loadIndicator">Loading users...</div>',
  style: 'layer-membership-list {\noverflow-y: auto;\ndisplay: block;\n}\nlayer-membership-list .layer-load-indicator {\ndisplay: none;\n}\nlayer-membership-list.layer-loading-data .layer-load-indicator {\ndisplay: block;\n}',

  /**
   * The user has clicked to select an Member in the Membership List.
   *
   * ```javascript
   *    membersList.onMembershipSelected = function(evt) {
   *      var memberSelected = evt.detail.item;
   *
   *      // To prevent the UI from proceding to add the member to the selectedIdentities
   *      evt.preventDefault();
   *    };
   * ```
   *
   *  OR
   *
   * ```javascript
   *    document.body.addEventListener('layer-membership-selected', function(evt) {
   *      var memberSelected = evt.detail.item;
   *
   *      // To prevent the UI from proceding to add the member to the selectedIdentities:
   *      evt.preventDefault();
   *    });
   * ```
   *
   * @event layer-membership-selected
   * @param {CustomEvent} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Membership} evt.detail.item
   */

  /**
   * A membership selection change has occurred
   *
   * See the {@link Layer.UI.components.MembershipListPanel.List#layer-membership-selected layer-membership-selected} event for more detail.
   *
   * @property {Function} onMembershipSelected
   * @param {CustomEvent} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Membership} evt.detail.item
   */

  events: ['layer-membership-selected'],
  properties: {
    /**
     * ID of the Channel whose membership is being shown by this panel.
     *
     * This property may need to be changed any time you change to view a different Channel.
     *
     * Alternative: See Layer.UI.components.MembershipListPanel.List.channel property.  Strings however are easier to stick
     * into html template files.
     *
     * ```
     * function selectChannel(selectedChannel) {
     *   // These two lines are equivalent:
     *   widget.channel = selectedChannel;
     *   widget.channelId = selectedChannel.id;
     * }
     * ```
     *
     * @property {String} [channelId='']
     */
    channelId: {
      set: function set(value) {
        var _this = this;

        // Clear the channel id if its invalid
        if (value && value.indexOf('layer:///channels') !== 0 && value.indexOf('layer:///channels') !== 0) {
          this.properties.channelId = '';
        }

        // Set the channel... when the client is ready.
        if (_settings.client && this.channelId) {
          if (_settings.client.isReady && !_settings.client.isDestroyed) {
            this.channel = _settings.client.getObject(this.channelId, true);
          } else {
            _settings.client.once('ready', function () {
              if (_this.channelId) _this.channel = _settings.client.getObject(_this.channelId, true);
            }, this);
          }
        }
      }
    },

    /**
     * The Channel whose Membership is being shown by this panel.
     *
     * This property may need to be changed any time you change to view a different channel.
     *
     * Alternative: See Layer.UI.components.MembershipListPanel.List.channelId property for an easier property to use
     * within html templates.
     *
     * ```
     * function selectchannel(selectedChannel) {
     *   // These two lines are equivalent:
     *   widget.channelId = selectedChannel.id;
     *   widget.channel = selectedChannel;
     * }
     * ```
     *
     * @property {Layer.Core.Channel} channel
     */
    channel: {
      set: function set(value) {
        if (value && !(value instanceof Channel)) value = this.properties.channel = null;
        if (this.query) {
          this.query.update({
            predicate: value ? 'channel.id = "' + value.id + '"' : ''
          });
        }
      }
    },

    /**
     * The model to generate a Query for if a Query is not provided.
     *
     * @readonly
     * @private
     * @property {String} [_queryModel=Layer.Core.Query.Membership]
     */
    _queryModel: {
      value: _core2.default.Query.Membership
    },

    /**
     * The event name to trigger on selecting a Member.
     *
     * @readonly
     * @private
     * @property {String} [_selectedItemEventName=layer-membership-selected]
     */
    _selectedItemEventName: {
      value: 'layer-membership-selected'
    }
  },
  methods: {

    /**
     * Append a Layer.UI.components.IdentityListPanel.Item to the Document Fragment
     *
     * @method _generateItem
     * @param {Layer.Core.Membership} membership
     * @private
     */
    _generateItem: function _generateItem(membership) {
      var membershipWidget = document.createElement('layer-membership-item');
      membershipWidget.item = membership;
      membershipWidget.id = this._getItemId(membership.id);
      membershipWidget._runFilter(this.filter);
      return membershipWidget;
    }
  }
});