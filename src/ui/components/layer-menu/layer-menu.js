/**
 * The Layer Menu renders a menu absolutely positioned beside the specified node.
 *
 * ```
 * var menuButton = document.createElement('layer-menu-button');
 * menuButton.item = message;
 * menuButton.options = [
 *   {text: "delete", method: function(item) {item.delete(Layer.Constants.DELETION_MODE.ALL);}
 * ];
 * ```
 *
 * @class layerUI.components.MenuButton
 * @extends layerUI.components.Component
 */
import Layer from '../../../core';
import Constants from '../../../constants';
import { registerComponent } from '../../components/component';
import Clickable from '../../mixins/clickable';

registerComponent('layer-menu', {
  mixins: [Clickable],
  properties: {
    options: {
      set(value) {
        const menu = document.createElement('div');
        menu.classList.add('layer-menu-button-menu-list');
        value.forEach((option) => {
          const menuItem = document.createElement('div');
          menuItem.classList.add('layer-menu-button-menu-item');
          menuItem.innerHTML = option.text;
          this.addClickHandler('menu-item-click', menuItem, evt => option.method());
          menu.appendChild(menuItem);
        });
        if (this.firstChild) {
          this.replaceChild(menu, this.firstChild);
        } else {
          this.appendChild(menu);
        }
      },
    },

    /**
     * Different buttons may need menus of differing widths; set it here and its applied by the button, not style sheet.
     *
     * @proeprty {Number} [menuWidth=100]
     */
    menuWidth: {
      value: 100,
      type: Number,
      set(value) {
        this.style.minWidth = value + 'px';
      },
    },

    isShowing: {
      set(value) {
        if (value) {
          this._showNear(this.near);
        }
        this.toggleClass('layer-menu-list-showing', value);
      },
    },

    near: {
      set(value) {
        if (value && this.isShowing) this._showNear(value);
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
      this.addClickHandler('background-click', document, this.onDocumentClick.bind(this));
    },

    onDestroy() {
      this.removeClickHandler('background-click', document);
    },

    onDocumentClick(evt) {
      if (this.isShowing) this.isShowing = false;
    },


    _showNear() {
      const node = this.near;
      const bounds = node.getBoundingClientRect();
      if (bounds.right + this.menuWidth > document.body.clientWidth) {
        this.style.left = '';
        this.style.right = '5px';
      } else {
        this.style.right = '';
        this.style.left = bounds.right + 'px';
      }
      // TODO: May have to fix issues with this showing too low or high
      this.style.bottom = '';
      this.style.top = bounds.bottom + 'px';
      this.style.minWidth = this.menuWidth + 'px';
      setTimeout(() => {
        if (this.offsetTop + this.clientHeight > document.body.clientHeight) {
          this.style.top = '';
          this.style.bottom = '2px';
        }
      }, 1);
    },
  },
});
