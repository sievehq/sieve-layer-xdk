/**
 * The Layer User Item represents a single user within a User List.
 *
 * This widget could be used to represent a User elsewhere, in places where a `<layer-avatar />` is insufficient.
 *
 * This widget includes a checkbox for selection.
 *
 * @class Layer.UI.components.IdentityListPanel.Item
 * @mixin Layer.UI.mixins.ListItem
 * @mixin Layer.UI.mixins.SizeProperty
 * @mixin Layer.UI.mixins.Clickable
 * @extends Layer.UI.Component
 */
import Layer from '../../../../core';
import Util from '../../../../utils';
import { registerComponent } from '../../component';
import ListItem from '../../../mixins/list-item';
import SizeProperty from '../../../mixins/size-property';
import Clickable from '../../../mixins/clickable';
import '../../layer-avatar/layer-avatar';
import '../../layer-age/layer-age';

registerComponent('layer-identity-item', {
  mixins: [ListItem, SizeProperty, Clickable],
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
      noGetterFromSetter: true,
      set(value) {
        if (this.nodes.checkbox) this.nodes.checkbox.checked = value;
        this.innerNode.classList[value ? 'add' : 'remove']('layer-identity-item-selected');
      },
      get() {
        return this.nodes.checkbox ? this.nodes.checkbox.checked : Boolean(this.properties.isSelected);
      },
    },

    /**
     * @inheritdoc Layer.UI.components.IdentityListPanel.List#nameRenderer
     *
     * @property {Function} nameRenderer
     */
    nameRenderer: {},

    // See Layer.UI.SizeProperty.size
    size: {
      value: 'medium',
      set(size) {
        if (size !== 'tiny') this.nodes.avatar.size = size;
      },
    },

    // See Layer.UI.SizeProperty.supportedSizes
    supportedSizes: {
      value: ['tiny', 'small', 'medium'],
    },
  },
  methods: {

    // Lifecycle method
    onCreate() {
      if (!this.id) this.id = Util.generateUUID();
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
    _onClick(evt) {
      evt.stopPropagation();
      const checked = evt.target === this.nodes.checkbox ? this.isSelected : !this.isSelected; // toggle
      const identity = this.item;

      // Trigger the event and see if evt.preventDefault() was called
      const customEventResult = this.trigger(`layer-identity-item-${checked ? 'selected' : 'deselected'}`, {
        item: identity,
        originalTarget: evt.target,
      });

      if (customEventResult) {
        this.isSelected = checked;
        this.onSelection(evt);
      } else {
        evt.preventDefault();
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
    onSelection(evt) {
      // No-op
    },

    // Lifecycle event
    onRender() {
      this.onRerender();
    },

    // Lifecycle event
    onRerender() {
      this.nodes.avatar.users = [this.item];
      this.nodes.title.innerHTML = this.nameRenderer ? this.nameRenderer(this.item) : this.item.displayName;
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
     *            mode: Layer.UI.registerCompoennt.MODES.OVERWRITE,
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
    onRenderTitle() {
      this.nodes.title.innerHTML = this.item.displayName;
    },

    /**
     * Run a filter on this item, and hide it if it doesn't match the filter.
     *
     * @method _runFilter
     * @param {String/RegExp/Function} filter
     */
    _runFilter(filter) {
      const identity = this.properties.item;
      let match = false;
      if (!filter) {
        match = true;
      } else if (filter instanceof RegExp) {
        match = filter.test(identity.displayName) || filter.test(identity.firstName) || filter.test(identity.lastName) || filter.test(identity.emailAddress);
      } else if (typeof filter === 'function') {
        match = filter(identity);
      } else {
        filter = filter.toLowerCase();
        match =
          identity.displayName.toLowerCase().indexOf(filter) !== -1 ||
          identity.firstName.toLowerCase().indexOf(filter) !== -1 ||
          identity.lastName.toLowerCase().indexOf(filter) !== -1 ||
          identity.emailAddress.toLowerCase().indexOf(filter) !== -1;
      }
      this.classList[match ? 'remove' : 'add']('layer-item-filtered');
    },
  },
});


