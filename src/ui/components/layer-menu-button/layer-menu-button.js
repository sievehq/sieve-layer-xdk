/**
 * The Layer Menu Button renders a menu button and has associated menu items.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own menu capability.
 *
 * Note that the `item` property can refer to any data, but is expected to be used for subclasses of Layer.Core.Root such as
 * Layer.Core.Message, Layer.Core.Conversation, Layer.Core.Identity, etc...
 *
 * ```
 * var menuButton = document.createElement('layer-menu-button');
 * menuButton.item = message;
 * menuButton.getMenuOptions = function(item) {
 *     return [
 *       {text: "delete", method: function() {item.delete(Layer.Constants.DELETION_MODE.ALL);}
 *     ];
 * };
 * ```
 *
 * > *Note*
 * >
 * > The Layer.UI.components.MenuButton.item is used within the Layer.UI.components.MenuButton.getMenuOptions method, and is
 * > not directly provided to your Menu Item Methods, as illustrated above.
 *
 * > *Note*
 * >
 * > The Layer.UI.components.MenuButton.getMenuOptions is called each time the user clicks on the Menu Button;
 * > your menu freshness is based solely on the user click time; updates that take place after that do not affect
 * > the menu that is displayed.
 *
 *
 * @class Layer.UI.components.MenuButton
 * @extends Layer.UI.Component
 * @mixin Layer.UI.mixins.Clickable
 */
import { registerComponent } from '../../components/component';
import '../layer-menu/layer-menu';
import Clickable from '../../mixins/clickable';

registerComponent('layer-menu-button', {
  mixins: [Clickable],
  properties: {

    /**
     * Get the menu options to display in the menu.
     *
     * This is called each time the user clicks the menu button.
     *
     * Menu items are provided via a `getMenuOptions` Function provided by the application,
     * or a `getMenuOptions` provided by the Layer.UI.components.MenuButton.parentComponent
     *
     * @property {Function} getMenuOptions
     * @property {Layer.Core.Root} getMenuOptions.item
     * @property {Object[]} getMenuOptions.return
     */
    getMenuOptions: {
      type: Function,
      noGetterFromSetter: true,
      value() { return []; },
      get() {
        if (this.properties.getMenuOptions) return this.properties.getMenuOptions;
        if (this.parentComponent && this.parentComponent.getMenuOptions) return this.parentComponent.getMenuOptions;
      },
      set(value) {
        this.toggleClass('layer-has-menu', Boolean(value));
      },
    },


    /**
     * The (optional) item represents some piece of data that this button will generate a menu for.
     *
     * If this Menu Button is part of the template for a List Item (and this button has a `layer-id`),
     * then its item property will automatically be set to the List's item.
     *
     * @property {Layer.Core.Root} [item]
     */
    item: {},

    /**
     * Different buttons may need menus of differing widths; set it here and its applied by the button, not style sheet.
     *
     * Width is applied after each click, and is not updated between clicks.
     *
     * @property {Number} [menuWidth=100]
     */
    menuWidth: {
      value: 100,
      type: Number,
    },
  },
  methods: {

    // Lifecycle
    onCreate() {
      this.addClickHandler('menu-click', this, this.onButtonClick.bind(this));
    },

    /**
     * Mixin Hook: Override this method to have your own menuing system kick in.
     *
     * Note that Button Clicks do not bubble up, they simply generate a `<layer-menu />` and show it.
     *
     * @method onButtonClick
     * @param {Event} evt
     */
    onButtonClick(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      const options = this.getMenuOptions(this.item);

      // If there are options, update the menu's items and show it
      if (options) {
        let menuNode = document.querySelector('layer-menu');
        if (!menuNode) {
          menuNode = document.createElement('layer-menu');
          document.body.appendChild(menuNode);
        }

        menuNode.items = options;
        if (this.menuWidth) menuNode.menuWidth = this.menuWidth;

        if (!menuNode.isShowing || menuNode.near !== this) {
          menuNode.near = this;
          menuNode.isShowing = true;
        }
      }
    },
  },
});
