/**
 * The Layer User Item represents a single user within a User List.
 *
 * This widget could be used to represent a User elsewhere, in places where a `<layer-avatar />` is insufficient.
 *
 * This widget includes a checkbox for selection.
 *
 * ### Importing
 *
 * Not included with the standard build. To import pick one:
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-identity-list';
 * import '@layerhq/web-xdk/ui/components/layer-identity-list/layer-identity-item';
 * ```
 *
 * @class Layer.UI.components.IdentityListPanel.Item
 * @mixin Layer.UI.mixins.ListItem
 * @mixin Layer.UI.mixins.SizeProperty
 * @mixin Layer.UI.mixins.Clickable
 * @extends Layer.UI.Component
 */
'use strict';

var _utils = require('../../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _component = require('../component');

var _listItem = require('../../mixins/list-item');

var _listItem2 = _interopRequireDefault(_listItem);

var _sizeProperty = require('../../mixins/size-property');

var _sizeProperty2 = _interopRequireDefault(_sizeProperty);

var _clickable = require('../../mixins/clickable');

var _clickable2 = _interopRequireDefault(_clickable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-identity-item', {
  mixins: [_listItem2.default, _sizeProperty2.default, _clickable2.default],
  template: '<div class=\'layer-list-item\' layer-id=\'listItem\'><layer-avatar layer-id=\'avatar\' show-presence=\'true\'></layer-avatar><layer-presence layer-id=\'presence\' class=\'presence-without-avatar\' size=\'medium\'></layer-presence><div class=\'layer-identity-inner\'><label class=\'layer-identity-name\' layer-id=\'title\'></label><div class=\'layer-identity-metadata\' layer-id=\'metadata\'></div></div><layer-age layer-id=\'age\'></layer-age><layer-replaceable-content\nlayer-id=\'rightSide\'\nclass=\'layer-identity-right-side\'\nname=\'identityRowRightSide\'></layer-replaceable-content></div>',
  style: 'layer-identity-item {\ndisplay: flex;\nflex-direction: column;\n}\nlayer-identity-item .layer-list-item {\ndisplay: flex;\nflex-direction: row;\nalign-items: center;\n}\nlayer-identity-item .layer-list-item .layer-identity-inner {\nflex-grow: 1;\nwidth: 100px;\n}\nlayer-identity-item.layer-item-filtered .layer-list-item,\nlayer-identity-item.layer-identity-item-empty,\nlayer-identity-item layer-presence.presence-without-avatar,\nlayer-identity-item.layer-size-tiny layer-avatar,\nlayer-identity-item.layer-size-tiny layer-age {\ndisplay: none;\n}\nlayer-identity-item.layer-size-tiny layer-presence {\ndisplay: block;\n}\nlayer-identity-item .layer-identity-inner {\ndisplay: flex;\nflex-direction: column;\n}\nlayer-identity-item:not(.layer-size-large) .layer-identity-metadata {\ndisplay: none;\n}',
  properties: {

    /**
     * Is this Itentity Item currently selected?
     *
     * Setting this to true will set the checkbox to checked, and add a
     * `layer-identity-item-selected` css class.
     *
     * @property {Boolean} [isSelected=false]
     */
    isSelected: {
      type: Boolean,
      set: function set(value) {
        if (this.nodes.checkbox) this.nodes.checkbox.checked = value;
        this.innerNode.classList[value ? 'add' : 'remove']('layer-identity-item-selected');
      },
      get: function get() {
        return this.nodes.checkbox ? this.nodes.checkbox.checked : Boolean(this.properties.isSelected);
      }
    },

    /**
     * @inheritdoc Layer.UI.components.IdentityListPanel.List#nameRenderer
     *
     * @property {Function} nameRenderer
     */
    nameRenderer: {},

    /**
     * @inheritdoc Layer.UI.components.IdentityListPanel.List#metadataRenderer
     *
     * @property {Function} metadataRenderer
     */
    metadataRenderer: {},

    // See Layer.UI.SizeProperty.size
    size: {
      value: 'medium',
      set: function set(size) {
        if (size !== 'tiny') this.nodes.avatar.size = size;
      }
    },

    // See Layer.UI.SizeProperty.supportedSizes
    supportedSizes: {
      value: ['tiny', 'small', 'medium', 'large']
    }
  },
  methods: {

    // Lifecycle method
    onCreate: function onCreate() {
      if (!this.id) this.id = _utils2.default.generateUUID();
      this.addClickHandler('item-click', this.nodes.listItem, this._onClick.bind(this));
    },


    /**
     * If any part of the List Item is clicked, update the checkbox/selected state
     *
     * Trigger a `layer-identity-item-selected` or `layer-identity-item-deselected` event;
     * If the custom event is canceled, roll back the change.
     *
     * @method _onClick
     * @param {Event} evt
     * @private
     */
    _onClick: function _onClick(evt) {
      evt.stopPropagation();
      var checkboxHit = evt.target === this.nodes.checkbox;
      var checked = checkboxHit ? this.nodes.checkbox.checked : !this.isSelected; // toggle

      var identity = this.item;

      // Trigger the event and see if evt.preventDefault() was called
      var allowResult = this.trigger('layer-identity-item-' + (checked ? 'selected' : 'deselected'), {
        item: identity,
        originalTarget: evt.target
      });

      if (allowResult) {
        this.isSelected = checked;
        if (checkboxHit) this.innerNode.classList[checked ? 'add' : 'remove']('layer-identity-item-selected');
        this.onSelection(evt);
      } else {
        evt.preventDefault();
        if (checkboxHit) this.nodes.checkbox.checked = !checked;
      }
    },


    /**
     * MIXIN HOOK: Each time a an item's selection state changes, this will be called.
     *
     * Useful as a way to add behaviors to a list Item whenever its state changes:
     *
     * ```
     * Layer.init({
     *   mixins: {
     *     'layer-identity-item': {
     *        methods: {
     *          onSelection() {
     *            this.toggleClass('is-selected', this.isSelected);
     *          }
     *         }
     *      }
     *   }
     * });
     * ```
     *
     * @method onSelection
     */
    onSelection: function onSelection(evt) {
      // No-op
    },


    // Lifecycle event
    onRerender: function onRerender() {
      this.nodes.avatar.users = [this.item];
      if (this.nodes.title) {
        this.nodes.title.innerHTML = this.nameRenderer ? this.nameRenderer(this.item) : this.item.displayName;
      }
      if (this.nodes.metadata && this.metadataRenderer) {
        this.nodes.metadata.innerHTML = this.metadataRenderer(this.item);
      }
      this.nodes.age.date = this.item.lastSeenAt;
      this.toggleClass('layer-identity-item-empty', !this.item.displayName);
    },


    /**
     * Mixin Hook: Override this to use an alternate title.
     *
     * ```
     * Layer.init({
     *   mixins: {
     *     'layer-identity-item': {
     *        methods: {
     *          onRenderTitle: {
     *            mode: Layer.UI.registerCompoent.MODES.OVERWRITE,
     *            value() {
     *                this.nodes.title.innerHTML = "hey ho " + this.item.displayName;
     *            }
     *          }
     *        }
     *      }
     *   }
     * });
     * ```
     *
     * @method onRenderTitle
     */
    onRenderTitle: function onRenderTitle() {
      this.nodes.title.innerHTML = this.item.displayName;
    },


    /**
     * Run a filter on this item, and hide it if it doesn't match the filter.
     *
     * @method _runFilter
     * @param {String/RegExp/Function} filter
     */
    _runFilter: function _runFilter(filter) {
      var identity = this.properties.item;
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