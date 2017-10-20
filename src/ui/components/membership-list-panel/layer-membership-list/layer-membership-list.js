/**
 * The Layer Membership List renders a pagable list of layer.Membership objects, and allows the user to
 * see who else is in the Channel with them.
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
 * @class layer.UI.components.MembershipListPanel.List
 * @experimental This feature is incomplete, and available as Preview only.
 * @extends layer.UI.components.Component
 * @mixin layerUI.mixins.List
 * @mixin layerUI.mixins.MainComponent
 * @mixin layerUI.mixins.ListSelection
 */
import Core from '../../../../core';
import { registerComponent } from '../../component';
import List from '../../../mixins/list';
import MainComponent from '../../../mixins/main-component';
import ListSelection from '../../../mixins/list-selection';
import '../layer-membership-item/layer-membership-item';

registerComponent('layer-membership-list', {
  mixins: [List, ListSelection, MainComponent],


  /**
   * The user has clicked to select an Member in the Membership List.
   *
   * ```javascript
   *    membersList.onMembershipSelected = function(evt) {
   *      var memberSelected = evt.detail.item;
   *
   *      // To prevent the UI from proceding to add the member to the selectedIdentities:
   *      // Note that memberAdded is not yet in selectedIdentities so that you may prevent it from being added.
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
   *      // Note that memberAdded is not yet in selectedIdentities so that you may prevent it from being added.
   *      evt.preventDefault();
   *    });
   * ```
   *
   * @event layer-membership-selected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Membership} evt.detail.item
   */
  /**
   * A membership selection change has occurred
   *
   * See the {@link layer.UI.components.MembershipListPanel.List#layer-membership-selected layer-membership-selected} event for more detail.
   *
   * @property {Function} onMembershipSelected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Membership} evt.detail.item
   */

  events: ['layer-membership-selected'],
  properties: {
    /**
     * ID of the Channel whose membership is being shown by this panel.
     *
     * This property may need to be changed any time you change to view a different Channel.
     *
     * Alternative: See layer.UI.components.MembershipListPanel.List.channel property.  Strings however are easier to stick
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
      set(value) {
        if (value && value.indexOf('layer:///channels') !== 0 && value.indexOf('layer:///channels') !== 0) this.properties.channelId = '';
        if (this.client && this.channelId) {
          if (this.client.isReady && !this.client.isDestroyed) {
            this.channel = this.client.getObject(this.channelId, true);
          } else {
            this.client.once('ready', () => {
              if (this.channelId) this.channel = this.client.getObject(this.channelId, true);
            });
          }
        }
      },
    },

    /**
     * The Channel whose Membership is being shown by this panel.
     *
     * This property may need to be changed any time you change to view a different channel.
     *
     * Alternative: See layer.UI.components.MembershipListPanel.List.channelId property for an easier property to use
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
     * @property {layer.Channel}
     */
    channel: {
      set(value) {
        if (value && !(value instanceof Layer.Channel)) value = this.properties.channel = null;
        if (this.query) {
          this.query.update({
            predicate: value ? `channel.id = "${value.id}"` : '',
          });
        }
      },
    },

    /**
     * The model to generate a Query for if a Query is not provided.
     *
     * @readonly
     * @private
     * @property {String} [_queryModel=layer.Core.Query.Membership]
     */
    _queryModel: {
      value: Core.Query.Membership,
    },

    /**
     * The event name to trigger on selecting a Member.
     *
     * @readonly
     * @private
     * @property {String} [_selectedItemEventName=layer-membership-selected]
     */
    _selectedItemEventName: {
      value: 'layer-membership-selected',
    },
  },
  methods: {

    /**
     * Append a layer.UI.components.IdentitiesListPanel.Item to the Document Fragment
     *
     * @method _generateItem
     * @param {layer.Membership} membership
     * @private
     */
    _generateItem(membership) {
      const membershipWidget = document.createElement('layer-membership-item');
      membershipWidget.item = membership;
      membershipWidget.id = this._getItemId(membership.id);
      membershipWidget._runFilter(this.filter);
      return membershipWidget;
    },
  },
});
