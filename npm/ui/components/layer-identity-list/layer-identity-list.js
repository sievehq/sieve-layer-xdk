/**
 * The Layer User List renders a pagable list of Layer.Core.Identity objects, and allows the user to select people to talk with.
 *
 * This is typically used for creating/updating Conversation participant lists, also usable for listing who
 * is a part of an existing Layer.Core.Conversation or Layer.Core.Channel.
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
 * ## Common Properties
 *
 * * {@link #selectedIdentities}: Get/set the currently selected Identities in the List
 * * {@link #onIdentitySelected}: Set a function to be called when an Identity is selected
 * * {@link #onIdentityDeselected}: Set a function to be called when an Identity is deselected
 *
 * ```javascript
 * identityList.selectedIdentities = [identity3, identity6];
 * identityList.onIdentitySelected = identityList.onIdentityDeselected = function(evt) {
 *    log("The new selected users are: ", identityList.selectedIdentities.map(identity => identity.displayName).join(', '));
 * }
 * ```
 *
 * ## Events
 *
 * Events listed here come from either this component, or its subcomponents.
 *
 * * {@link #layer-identity-deselected}: User has clicked to unselect an Identity
 * * {@link #layer-identity-selected}: User has clicked to select an Identity
 *
 * ### Importing
 *
 * Not included with the standard build. To import pick one:
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-identity-list';
 * import '@layerhq/web-xdk/ui/components/layer-identity-list/layer-identity-list';
 * ```
 *
 * @class Layer.UI.components.IdentityListPanel.List
 * @extends Layer.UI.Component
 * @mixin Layer.UI.mixins.List
 * @mixin Layer.UI.mixins.ListLoadIndicator
 * @mixin Layer.UI.mixins.HasQuery
 * @mixin Layer.UI.mixins.ListLoadIndicator
 * @mixin Layer.UI.mixins.SizeProperty
 * @mixin Layer.UI.mixins.EmptyList
 * @mixin Layer.UI.mixins.QueryEndIndicator
 */
'use strict';

var _settings = require('../../../settings');

var _core = require('../../../core');

var _core2 = _interopRequireDefault(_core);

var _utils = require('../../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _component = require('../component');

var _list = require('../../mixins/list');

var _list2 = _interopRequireDefault(_list);

var _hasQuery = require('../../mixins/has-query');

var _hasQuery2 = _interopRequireDefault(_hasQuery);

var _listLoadIndicator = require('../../mixins/list-load-indicator');

var _listLoadIndicator2 = _interopRequireDefault(_listLoadIndicator);

var _emptyList = require('../../mixins/empty-list');

var _emptyList2 = _interopRequireDefault(_emptyList);

var _queryEndIndicator = require('../../mixins/query-end-indicator');

var _queryEndIndicator2 = _interopRequireDefault(_queryEndIndicator);

var _sizeProperty = require('../../mixins/size-property');

var _sizeProperty2 = _interopRequireDefault(_sizeProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-identity-list', {
  mixins: [_list2.default, _hasQuery2.default, _listLoadIndicator2.default, _sizeProperty2.default, _emptyList2.default, _queryEndIndicator2.default],
  template: '<div class=\'layer-list-meta\' layer-id=\'listMeta\'><div class=\'layer-empty-list\' layer-id=\'emptyNode\'></div><div class=\'layer-meta-toggle\'><layer-replaceable-content layer-id=\'emptyNode\' class=\'layer-empty-list\' name=\'emptyNode\'>\nNo Users yet\n</layer-replaceable-content><layer-replaceable-content\nlayer-id=\'endOfResultsNode\'\nclass=\'layer-end-of-results-indicator\'\nname=\'endOfResultsNode\'></layer-replaceable-content><layer-replaceable-content layer-id=\'loadIndicator\' class=\'layer-load-indicator\' name=\'loadIndicator\'><layer-loading-indicator></layer-loading-indicator></layer-replaceable-content></div></div>',

  style: 'layer-identity-list {\noverflow-y: auto;\ndisplay: block;\n}\nlayer-identity-list:not(.layer-loading-data) .layer-load-indicator,\nlayer-identity-list:not(.layer-end-of-results) .layer-end-of-results-indicator {\ndisplay: none;\n}',

  /**
   * The user has clicked to select an Identity in the Identities List.
   *
   * ```javascript
   *    identityList.onIdentitySelected = function(evt) {
   *      var identityAdded = evt.detail.item;
   *      var selectedIdentities = evt.target.selectedIdentities;
   *
   *      // Note that identityAdded is not yet in selectedIdentities so that you may prevent it from being added using:
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
   *      // Note that identityAdded is not yet in selectedIdentities so that you may prevent it from being added using:
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
   * @inheritdoc #event-layer-identity-selected
   *
   * @property {Function} onIdentitySelected
   * @property {Event} evt
   * @property {Object} evt.detail
   * @property {Layer.Core.Identity} evt.detail.item
   */

  /**
   * The user has clicked to deselect a identity in the identities list.
   *
   *    identityList.onIdentityDeselected = function(evt) {
   *      var identityRemoved = evt.detail.item;
   *      var selectedIdentities = evt.target.selectedIdentities;
   *
   *      // Note that identityRemoved is not yet removed from selectedIdentities so that you may prevent it from being removed using:
   *      evt.preventDefault();
   *    };
   *
   *  OR
   *
   *    document.body.addEventListener('layer-identity-deselected', function(evt) {
   *      var identityRemoved = evt.detail.item;
   *      var selectedIdentities = evt.target.selectedIdentities;
   *
   *      // Note that identityRemoved is not yet removed from selectedIdentities so that you may prevent it from being removed using:
   *      evt.preventDefault();
   *    });
   *
   * @event layer-identity-deselected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Identity} evt.detail.item
   */

  /**
   * @inheritdoc #event-layer-identity-deselected
   *
   * @property {Function} onIdentityDeselected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Identity} evt.detail.item
   */

  /**
   * The user has clicked to deselect a identity in the identities list, and your app wants to immediately see
   * the complete list of selected identities.
   *
   * @{link #event#layer-identity-selected} asks you to confirm before the selection changes, thus you do not
   * have the complete list of selected identities. Therefore use this event to get the complete list:
   *
   *    identityList.onIdentitySelectionComplete = function(evt) {
   *      var selectedIdentities = evt.target.selectedIdentities;
   *    };
   *
   *  OR
   *
   *    document.body.addEventListener('layer-identity-selection-complete', function(evt) {
   *      var selectedIdentities = evt.target.selectedIdentities;
   *    });
   *
   * @event layer-identity-selection-complete
   * @param {Event} evt
   */

  /**
   * @inheritdoc #event-layer-identity-selection-complete
   *
   * @property {Function} onIdentityDeselected
   * @param {Event} evt
   */
  events: ['layer-identity-selected', 'layer-identity-deselected', 'layer-identity-selection-complete'],
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
      set: function set(value) {
        if (!value) value = [];
        if (!Array.isArray(value)) return;

        this.properties.selectedIdentities = value.map(function (identity) {
          if (!(identity instanceof _core2.default.Identity)) return _settings.client.getIdentity(identity.id);
          return identity;
        });
        this._renderSelection();
      },
      get: function get() {
        if (!Array.isArray(this.properties.selectedIdentities)) this.properties.selectedIdentities = [];
        return this.properties.selectedIdentities;
      }
    },

    /**
     * Provide property to override the function used to render a name for each Identity Item.
     *
     * Note that changing this function will not rerender the list; it should be set on initializing the component.
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
      type: Function
    },

    /**
     * Provide property manage the metadata section of the Large Identity Item (requires the {@link #size} property to be `large`).
     *
     * Note that changing this will not rerender the list.
     *
     * ```javascript
     * identityList.metadataRenderer = function(identity) {
     *    return identity.metadata.department;
     * };
     * ```
     *
     * @property {Function} [metadataRenderer=null]
     * @property {Layer.Core.Identity} metadataRenderer.identity
     * @property {String} metadataRenderer.return
     */
    metadataRenderer: {
      type: Function
    },

    // See Layer.UI.mixins.SizeProperty.size
    size: {
      value: 'medium',
      propagateToChildren: true
    },

    // See Layer.UI.mixins.SizeProperty.supportedSizes
    supportedSizes: {
      value: ['tiny', 'small', 'medium', 'large']
    },

    /**
     * The model to generate a Query for if a Query is not provided.
     *
     * @readonly
     * @private
     * @property {String} [_queryModel=Layer.Core.Query.Identity]
     */
    _queryModel: {
      value: _core2.default.Query.Identity
    },

    /**
     * Provide a hash of DOM generation functions to insert custom content into.
     *
     * The Identity List supports the following Content Areas:
     *
     * * identityRowRightSide: Nodes that appear to the right of each Identity Item; defaults to rendering a checkbox
     * * loadIndicator: Node for rendering the fact that Identities are loading
     * * emptyNode: Node for rendering the fact that there are no Identities for this user
     * * endOfReultsNode: Node for rendering that we have scrolled to the end of the Identities from the server
     *
     * @property {Object} replaceableContent
     */
    replaceableContent: {
      value: {
        identityRowRightSide: function identityRowRightSide(widget) {
          var div = document.createElement('div');
          var checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.setAttribute('layer-id', 'checkbox');
          div.appendChild(checkbox);
          return div;
        }
      }
    }
  },
  methods: {

    // Lifecycle method
    onCreate: function onCreate() {
      if (!this.id) this.id = _utils2.default.generateUUID();

      this.addEventListener('layer-identity-item-selected', this._handleIdentitySelect.bind(this));
      this.addEventListener('layer-identity-item-deselected', this._handleIdentityDeselect.bind(this));
    },


    /**
     * Handle a user Selection event triggered by a Layer.UI.components.IdentityListPanel.Item.
     *
     * Adds the Identity to {@link #selectedIdentities}.
     *
     * @method _handleIdentitySelect
     * @private
     * @param {Event} evt
     */
    _handleIdentitySelect: function _handleIdentitySelect(evt) {
      evt.stopPropagation();
      var identity = evt.detail.item;
      var index = this.selectedIdentities.indexOf(identity);

      // If the item is not in our selectedIdentities array, add it
      if (index === -1) {
        // If app calls prevent default, then don't add the identity to our selectedIdentities list, just call preventDefault on the original event.
        if (this.trigger('layer-identity-selected', { item: identity })) {
          this.selectedIdentities.push(identity);
          this.trigger('layer-identity-selection-complete');
        } else {
          evt.preventDefault();
        }
      }
    },


    /**
     * Handle a user Deselection event triggered by a Layer.UI.components.IdentityListPanel.Item.
     *
     * Removes the identity from {@link #selectedIdentities}.
     *
     * @method _handleIdentityDeselect
     * @private
     * @param {Event} evt
     */
    _handleIdentityDeselect: function _handleIdentityDeselect(evt) {
      evt.stopPropagation();
      var identity = evt.detail.item;
      var index = this.selectedIdentities.indexOf(identity);

      // If the item is in our selectedIdentities array, remove it
      if (index !== -1) {
        // If app calls prevent default, then don't remove the identity, just call preventDefault on the original event.
        if (this.trigger('layer-identity-deselected', { item: identity })) {
          this.selectedIdentities.splice(index, 1);
          this.trigger('layer-identity-selection-complete');
        } else {
          evt.preventDefault();
        }
      }
    },


    /**
     * Append a Layer.UI.components.IdentityListPanel.Item to the Document Fragment
     *
     * @method _generateItem
     * @param {Layer.Core.Identity} identity
     * @private
     */
    _generateItem: function _generateItem(identity) {
      var identityWidget = document.createElement('layer-identity-item');
      identityWidget.item = identity;
      identityWidget.id = this._getItemId(identity.id);
      identityWidget.nameRenderer = this.nameRenderer;
      identityWidget.metadataRenderer = this.metadataRenderer;
      identityWidget.isSelected = this.selectedIdentities.indexOf(identity) !== -1;
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
    onRerender: function onRerender() {
      var evt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      switch (evt.type) {
        // If its a remove event, find the user and remove its widget.
        case 'remove':
          {
            var removalIndex = this.selectedIdentities.indexOf(evt.target);
            if (removalIndex !== -1) this.selectedIdentities.splice(removalIndex, 1);
            break;
          }

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
    _renderSelection: function _renderSelection() {
      var _this = this;

      var selectedNodes = this.querySelectorAllArray('.layer-identity-item-selected').map(function (node) {
        return node.parentNode;
      });
      var selectedIds = this.selectedIdentities.map(function (identity) {
        return '#' + _this._getItemId(identity.id);
      });
      var nodesToSelect = this.selectedIdentities.length ? this.querySelectorAllArray(selectedIds.join(', ')) : [];
      selectedNodes.forEach(function (node) {
        if (nodesToSelect.indexOf(node) === -1) node.isSelected = false;
      });
      nodesToSelect.forEach(function (node) {
        if (selectedNodes.indexOf(node) === -1) node.isSelected = true;
      });
    }
  }
});