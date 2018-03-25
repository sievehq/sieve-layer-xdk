/**
 * The Layer Menu renders a menu absolutely positioned beside the specified node.
 *
 * Typically this is used in conjunction with Layer.UI.components.MenuButton.
 *
 * This example shows it being used without the MenuButton:
 *
 * ```
 * var menuNode = document.createElement('layer-menu');
 * document.body.appendChild(menuNode);
 *
 * var myMessage = message;
 * menuNode.items = [
 *   {text: "delete", method: function() {myMessage.delete(Layer.Constants.DELETION_MODE.ALL);}  },
 *   {text: "favorite", method: function() {myMarkFavorite(myMessage);}  }
 * ];
 * menuNode.near = document.getElementById('showMenuNextToThisNode');
 * menuNode.isShowing = true;
 * ```
 *
 * ### Importing
 *
 * Any of the following will import this component
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-menu';
 * ```
 *
 * @class Layer.UI.components.Menu
 * @extends Layer.UI.Component
 * @mixin Layer.UI.mixins.Clickable
 */
'use strict';

var _component = require('./component');

var _clickable = require('../mixins/clickable');

var _clickable2 = _interopRequireDefault(_clickable);

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-menu', {
  mixins: [_clickable2.default],
  style: 'layer-menu {\ndisplay: none;\nposition: absolute;\n}\nlayer-menu.layer-menu-list-showing {\ndisplay: block;\nz-index: 10;\n}',
  properties: {

    /**
     * Array of menu items.
     *
     * Each Menu item consists of `{text: "menu text", method: function() {yourAction()}}`.
     *
     * @property {Object[]} items
     * @property {String} items.text      Menu text; written to innerHTML so it can be used to generate structured items
     * @property {Function} items.method  Function to call if/when the menu text is selected
     */
    items: {
      set: function set(value) {
        var _this = this;

        var menu = document.createElement('div');
        menu.classList.add('layer-menu-button-menu-list');

        // Generate the menu items
        value.forEach(function (option, index) {
          var menuItem = document.createElement('div');
          menuItem.classList.add('layer-menu-button-menu-item');
          menuItem.innerHTML = option.text;
          _this.addClickHandler('menu-item-click-' + index, menuItem, function () {
            return option.method();
          });
          menu.appendChild(menuItem);
        });

        // Add the menu to the DOM
        if (this.firstChild) {
          this.replaceChild(menu, this.firstChild);
        } else {
          this.appendChild(menu);
        }
      }
    },

    /**
     * Different buttons may need menus of differing widths; set it here and its applied by the button, not style sheet (sets `minWidth`).
     *
     * ```
     * menu.width = 200;
     * ```
     *
     * @property {Number} [menuWidth=100]
     */
    menuWidth: {
      value: 100,
      type: Number,
      set: function set(value) {
        this.style.minWidth = value + 'px';
      }
    },

    /**
     * Change showing state to hidden (`false`) or shown (`true`)
     *
     * Show the menu with:
     *
     * ```
     * menu.isShowing = true;
     * ```
     *
     * @property {Boolean} [isShowing=false]
     */
    isShowing: {
      set: function set(value) {
        if (value) {
          this._showNear(this.near);
        }
        this.toggleClass('layer-menu-list-showing', value);
      }
    },

    /**
     * Show the menu near this DOM node.
     *
     * Show the menu next to a Conversation Item:
     *
     * ```
     * menu.near = myConversationItem;
     * ```
     *
     * @property {HTMLElement} [near=null]
     */
    near: {
      set: function set(value) {
        if (value && this.isShowing) this._showNear(value);
      }
    }
  },
  methods: {

    // Lifecycle
    onCreate: function onCreate() {
      this.addClickHandler('background-click', document, this.onDocumentClick.bind(this));
    },


    // Cleanup
    onDestroy: function onDestroy() {
      this.removeClickHandler('background-click', document);
    },


    /**
     * Whenever anything is clicked in the document, change Layer.UI.components.Menu.isShowing to `false`
     * @param {Event} evt
     */
    onDocumentClick: function onDocumentClick(evt) {
      if (this.isShowing) this.isShowing = false;
    },


    /**
     * Attempts to render the menu near the node specified by Layer.UI.components.Menu.near.
     *
     * @method _showNear
     * @private
     */
    _showNear: function _showNear() {
      var _this2 = this;

      var node = this.near;
      if (!node) return _utils.logger.error('layer-menu widget requires property "near"');
      var bounds = node.getBoundingClientRect();
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
      setTimeout(function () {
        if (_this2.offsetTop + _this2.clientHeight > document.body.clientHeight) {
          _this2.style.top = '';
          _this2.style.bottom = '2px';
        }
      }, 1);
    }
  }
}); 