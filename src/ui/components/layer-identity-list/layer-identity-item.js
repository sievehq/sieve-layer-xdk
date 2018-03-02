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
import Util from '../../../utils';
import { registerComponent } from '../component';
import ListItem from '../../mixins/list-item';
import SizeProperty from '../../mixins/size-property';
import Clickable from '../../mixins/clickable';

registerComponent('layer-identity-item', {
  mixins: [ListItem, SizeProperty, Clickable],
  template: `
    <div class='layer-list-item' layer-id='listItem'>
      <layer-avatar layer-id='avatar' show-presence='true'></layer-avatar>
      <layer-presence layer-id='presence' class='presence-without-avatar' size='medium'></layer-presence>
      <label class='layer-identity-name' layer-id='title'></label>
      <layer-age layer-id='age'></layer-age>
      <layer-replaceable-content
        layer-id='rightSide'
        class='layer-identity-right-side'
        name='identityRowRightSide'>
      </layer-replaceable-content>
    </div>
  `,
  style: `
    layer-identity-item {
      display: flex;
      flex-direction: column;
    }
    layer-identity-item .layer-list-item {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    layer-identity-item .layer-list-item label {
      flex-grow: 1;
      width: 100px; /* Flexbox bug */
    }
    layer-identity-item.layer-item-filtered .layer-list-item,
    layer-identity-item.layer-identity-item-empty,
    layer-identity-item layer-presence.presence-without-avatar,
    layer-identity-item.layer-size-tiny layer-avatar,
    layer-identity-item.layer-size-tiny layer-age {
      display: none;
    }
    layer-identity-item.layer-size-tiny layer-presence {
      display: block;
    }
  `,
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
      const checkboxHit = evt.target === this.nodes.checkbox;
      const checked = checkboxHit ? this.nodes.checkbox.checked : !this.isSelected; // toggle

      const identity = this.item;

      // Trigger the event and see if evt.preventDefault() was called
      const allowResult = this.trigger(`layer-identity-item-${checked ? 'selected' : 'deselected'}`, {
        item: identity,
        originalTarget: evt.target,
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
    onSelection(evt) {
      // No-op
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
        match = filter.test(identity.displayName) ||
          filter.test(identity.firstName) ||
          filter.test(identity.lastName) ||
          filter.test(identity.emailAddress);
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
