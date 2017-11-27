/**
 * The Layer User List renders a pagable list of Layer.Core.Identity objects, and allows the user to select people to talk with.
 *
 * This is typically used for creating/updating Conversation participant lists.
 *
 * This Component can be added to your project directly in the HTML file:
 *
 * ```
 * <layer-identity-list></layer-identity-list>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var identitylist = document.createElement('layer-identity-list');
 * ```
 *
 * And then its properties can be set as:
 *
 * ```javascript
 * var identityList = document.querySelector('layer-identity-list');
 * identityList.selectedIdentities = [identity3, identity6];
 * identityList.onIdentitySelected = identityList.onIdentityDeselected = function(evt) {
 *    log("The new selected users are: ", identityList.selectedIdentities);
 * }
 * ```
 *
 * ## Events
 *
 * Events listed here come from either this component, or its subcomponents.
 *
 * * {@link layer.UI.components.IdentitiesListPanel.List#layer-identity-deselected layer-identity-deselected}: User has clicked to unselect an Identity
 * * {@link layer.UI.components.IdentitiesListPanel.List#layer-identity-selected layer-identity-selected}: User has clicked to select an Identity
 *
 * @class layer.UI.components.IdentitiesListPanel.List
 * @extends layer.UI.components.Component
 * @mixin layerUI.mixins.List
 * @mixin layerUI.mixins.MainComponent
 * @mixin layerUI.mixins.ListLoadIndicator
 */
import Core from '../../../../core';
import Util from '../../../../util';
import { registerComponent } from '../../component';
import List from '../../../mixins/list';
import MainComponent from '../../../mixins/main-component';
import HasQuery from '../../../mixins/has-query';
import ListLoadIndicator from '../../../mixins/list-load-indicator';
import EmptyList from '../../../mixins/empty-list';
import QueryEndIndicator from '../../../mixins/query-end-indicator';
import SizeProperty from '../../../mixins/size-property';
import '../layer-identity-item/layer-identity-item';

registerComponent('layer-identity-list', {
  mixins: [List, MainComponent, HasQuery, ListLoadIndicator, SizeProperty, EmptyList, QueryEndIndicator],

  /**
   * The user has clicked to select an Identity in the Identities List.
   *
   * ```javascript
   *    identityList.onIdentitySelected = function(evt) {
   *      var identityAdded = evt.detail.item;
   *      var selectedIdentities = evt.target.selectedIdentities;
   *
   *      // To prevent the UI from proceding to add the identity to the selectedIdentities:
   *      // Note that identityAdded is not yet in selectedIdentities so that you may prevent it from being added.
   *      evt.preventDefault();
   *    };
   * ```
   *
   *  OR
   *
   * ```javascript
   *    document.body.addEventListener('layer-identity-selected', function(evt) {
   *      var identityAdded = evt.detail.item;
   *      var selectedIdentities = evt.target.selectedIdentities;
   *
   *      // To prevent the UI from proceding to add the identity to the selectedIdentities:
   *      // Note that identityAdded is not yet in selectedIdentities so that you may prevent it from being added.
   *      evt.preventDefault();
   *    });
   * ```
   *
   * @event layer-identity-selected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Identity} evt.detail.item
   */
  /**
   * A identity selection change has occurred
   *
   * See the {@link layer.UI.components.IdentitiesListPanel.List#layer-identity-selected layer-identity-selected} event for more detail.
   *
   * @property {Function} onIdentitySelected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Identity} evt.detail.item
   */

  /**
   * The user has clicked to deselect a identity in the identities list.
   *
   *    identityList.onIdentityDeselected = function(evt) {
   *      var identityRemoved = evt.detail.item;
   *      var selectedIdentities = evt.target.selectedIdentities;
   *
   *      // To prevent the UI from proceding to add the identity to the selectedIdentities:
   *      // Note that identityRemoved is still in selectedIdentities so that you may prevent it from being removed.
   *      evt.preventDefault();
   *    };
   *
   *  OR
   *
   *    document.body.addEventListener('layer-identity-deselected', function(evt) {
   *      var identityRemoved = evt.detail.item;
   *      var selectedIdentities = evt.target.selectedIdentities;
   *
   *      // To prevent the UI from proceding to add the identity to the selectedIdentities:
   *      // Note that identityRemoved is still in selectedIdentities so that you may prevent it from being removed.
   *      evt.preventDefault();
   *    });
   *
   * @event layer-identity-deselected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Identity} evt.detail.item
   */
  /**
   * A identity selection change has occurred
   *
   * See the {@link layer.UI.components.IdentitiesListPanel.List#layer-identity-deselected layer-identity-deselected} event for more detail.
   *
   * @property {Function} onIdentityDeselected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Identity} evt.detail.item
   */

  events: ['layer-identity-selected', 'layer-identity-deselected'],
  properties: {

    /**
     * Array of Layer.Core.Identity objects representing the identities who should be rendered as Selected.
     *
     * This property can be used both get and set the selected identities; however, if setting you should not be manipulating
     * the existing array, but rather setting a new array:
     *
     * Do NOT do this:
     *
     * ```javascript
     * list.selectedIdentities.push(identity1); // DO NOT DO THIS
     * ```
     *
     * Instead, Please do this:
     *
     * ```javascript
     * var newList = list.selectedIdentities.concat([]);
     * newList.push(identity1);
     * list.selectedIdentities = newList;
     * ```
     *
     * You can clear the list with
     *
     * ```javascript
     * list.selectedIdentities = [];
     * ```
     *
     * @property {Layer.Core.Identity[]} [selectedIdentities=[]]
     */
    selectedIdentities: {
      set(value) {
        if (!value) value = [];
        if (!Array.isArray(value)) return;
        if (!value) value = [];
        this.properties.selectedIdentities = value.map((identity) => {
          if (!(identity instanceof Core.Identity)) return this.properties.client.getIdentity(identity.id);
          return identity;
        });
        this._renderSelection();
      },
    },

    /**
     * Provide property to override the function used to render a name for each Identity Item.
     *
     * Note that changing this function will not rerender the list.
     *
     * ```javascript
     * identitiesList.nameRenderer = function(identity) {
     *    return 'Dark Lord ' + identity.firstName
     * };
     * ```
     *
     * @property {Function} [nameRenderer=null]
     */
    nameRenderer: {
      type: Function,
    },

    size: {
      value: 'medium',
      propagateToChildren: true,
    },

    supportedSizes: {
      value: ['tiny', 'small', 'medium'],
    },

    /**
     * The model to generate a Query for if a Query is not provided.
     *
     * @readonly
     * @private
     * @property {String} [_queryModel=Layer.Core.Query.Identity]
     */
    _queryModel: {
      value: Core.Query.Identity,
    },

    replaceableContent: {
      value: {
        identityRowRightSide(widget) {
          const div = document.createElement('div');
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.setAttribute('layer-id', 'checkbox');
          div.appendChild(checkbox);
          return div;
        },
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
      if (!this.id) this.id = Util.generateUUID();
      this.properties.selectedIdentities = [];

      this.addEventListener('layer-identity-item-selected', this._handleIdentitySelect.bind(this));
      this.addEventListener('layer-identity-item-deselected', this._handleIdentityDeselect.bind(this));
    },

    /**
     * Handle a user Selection event triggered by a layer.UI.components.IdentitiesListPanel.Item.
     *
     * Adds the Identity to the selectedIdentities array.
     *
     * @method _handleIdentitySelect
     * @private
     * @param {Event} evt
     */
    _handleIdentitySelect(evt) {
      evt.stopPropagation();
      const identity = evt.detail.item;
      const index = this.selectedIdentities.indexOf(identity);

      // If the item is not in our selectedIdentities array, add it
      if (index === -1) {
        // If app calls prevent default, then don't add the identity to our selectedIdentities list, just call preventDefault on the original event.
        if (this.trigger('layer-identity-selected', { item: identity })) {
          this.selectedIdentities.push(identity);
        } else {
          evt.preventDefault();
        }
      }
    },


    /**
     * Handle a user Deselection event triggered by a layer.UI.components.IdentitiesListPanel.Item
     *
     * Removes the identity from the selectedIdentities array.
     *
     * @method _handleIdentityDeselect
     * @private
     * @param {Event} evt
     */
    _handleIdentityDeselect(evt) {
      evt.stopPropagation();
      const identity = evt.detail.item;
      const index = this.selectedIdentities.indexOf(identity);

      // If the item is in our selectedIdentities array, remove it
      if (index !== -1) {
        // If app calls prevent default, then don't remove the identity, just call preventDefault on the original event.
        if (this.trigger('layer-identity-deselected', { item: identity })) {
          this.selectedIdentities.splice(index, 1);
        } else {
          evt.preventDefault();
        }
      }
    },

    /**
     * Append a layer.UI.components.IdentitiesListPanel.Item to the Document Fragment
     *
     * @method _generateItem
     * @param {Layer.Core.Identity} identity
     * @private
     */
    _generateItem(identity) {
      const identityWidget = document.createElement('layer-identity-item');
      identityWidget.item = identity;
      identityWidget.id = this._getItemId(identity.id);
      identityWidget.nameRenderer = this.nameRenderer;
      identityWidget.selected = this.selectedIdentities.indexOf(identity) !== -1;
      identityWidget._runFilter(this.filter);
      return identityWidget;
    },

    /**
     * Call this on any Query change events.
     *
     * This updates the selectedIdentities after doing standard query update
     *
     * @method onRerender
     * @private
     * @param {Event} evt
     */
    onRerender(evt = {}) {
      switch (evt.type) {
        // If its a remove event, find the user and remove its widget.
        case 'remove':
          const removalIndex = this.selectedIdentities.indexOf(evt.target);
          if (removalIndex !== -1) this.selectedIdentities.splice(removalIndex, 1);
          break;

        // If its a reset event, all data is gone, rerender everything.
        case 'reset':
          this.selectedIdentities = [];
          break;
      }
    },

    /**
     * Update the selected property of all Identity Items based on the selectedIdentities property.
     *
     * @method _renderSelection
     * @private
     */
    _renderSelection() {
      const selectedNodes = this.querySelectorAllArray('.layer-identity-item-selected').map(node => node.parentNode);
      const selectedIds = this.selectedIdentities.map(identity => '#' + this._getItemId(identity.id));
      const nodesToSelect = this.selectedIdentities.length ? this.querySelectorAllArray(selectedIds.join(', ')) : [];
      selectedNodes.forEach((node) => {
        if (nodesToSelect.indexOf(node) === -1) node.selected = false;
      });
      nodesToSelect.forEach((node) => {
        if (selectedNodes.indexOf(node) === -1) node.selected = true;
      });
    },
  },
});

