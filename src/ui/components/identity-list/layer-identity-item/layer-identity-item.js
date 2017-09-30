/**
 * The Layer User Item represents a single user within a User List.
 *
 * This widget could be used to represent a User elsewhere, in places where a `<layer-avatar />` is insufficient.
 *
 * This widget includes a checkbox for selection.
 *
 * @class layerUI.components.IdentitiesListPanel.Item
 * @mixin layerUI.mixins.ListItem
 * @extends layerUI.components.Component
 */
import Layer from '../../../../core';
import Util from '../../../../util';
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
     * Is this user item currently selected?
     *
     * Setting this to true will set the checkbox to checked, and add a
     * `layer-identity-item-selected` css class.
     *
     * @property {Boolean} [selected=false]
     */
    selected: {
      type: Boolean,
      noGetterFromSetter: true,
      set(value) {
        if (this.nodes.checkbox) this.nodes.checkbox.checked = value;
        this.innerNode.classList[value ? 'add' : 'remove']('layer-identity-item-selected');
      },
      get() {
        return this.nodes.checkbox ? this.nodes.checkbox.checked : Boolean(this.properties.selected);
      },
    },

    /**
     * Provide property to override the function used to render a name for each Identity Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * identityItem.nameRenderer = function(identity) {
     *    return 'Dark Lord ' + identity.firstName;
     * };
     * ```
     *
     * @property {Function}
     */
    nameRenderer: {},

    size: {
      value: 'medium',
      set(size) {
        if (size !== 'tiny') this.nodes.avatar.size = size;
      },
    },

    supportedSizes: {
      value: ['tiny', 'small', 'medium'],
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
      this.addClickHandler('item-click', this.nodes.listItem, this.onClick.bind(this));
    },

    /**
     * If the checkbox state changes, make sure that the class is updated.
     *
     * If the custom event is canceled, roll back the change.
     *
     * @method onClick
     * @param {Event} evt
     * @private
     */
    onClick(evt) {
      evt.stopPropagation();
      const checked = evt.target === this.nodes.checkbox ? this.selected : !this.selected; // toggle
      const identity = this.item;

      // Trigger the event and see if evt.preventDefault() was called
      const customEventResult = this.trigger(`layer-identity-item-${checked ? 'selected' : 'deselected'}`, { item: identity });

      if (customEventResult) {
        this.selected = checked;
      } else {
        evt.preventDefault();
      }
      this.onSelection(evt);
    },

    /**
     * MIXIN HOOK: Each time a an item's selection state changes, this will be called.
     *
     * @method onSelection
     */
    onSelection(evt) {
      // No-op
    },

    /**
     * Render/rerender the user, showing the avatar and user's name.
     *
     * @method _render
     * @private
     */
    onRender() {
      this.onRerender();
    },

    /**
     * Update the rendering of the avatar/username
     *
     * @method _render
     * @private
     */
    onRerender() {
      this.nodes.avatar.users = [this.item];
      this.nodes.title.innerHTML = this.nameRenderer ? this.nameRenderer(this.item) : this.item.displayName;
      this.nodes.age.date = this.item.lastSeenAt;
      this.toggleClass('layer-identity-item-empty', !this.item.displayName);
    },

    /**
     * Mixin Hook: Override this to use an alternate title.
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
     * @param {String|Regex|Function} filter
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


