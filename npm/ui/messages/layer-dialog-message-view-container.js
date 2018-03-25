/**
 * Similar to the Layer.UI.messages.TitledMessageViewContainer, this adds a title and a close button
 * to a container that wraps a Message Type View.
 *
 * ### Importing
 *
 * Included with the standard build. For custom build,  import with:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/layer-dialog-message-view-container
 * ```
 *
 * @class Layer.UI.messages.DialogMessageViewContainer
 * @extends Layer.UI.Component
 * @mixin Layer.UI.mixins.Clickable
 */
'use strict';

var _component = require('../components/component');

var _clickable = require('../mixins/clickable');

var _clickable2 = _interopRequireDefault(_clickable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-dialog-message-view-container', {
  mixins: [_clickable2.default],
  style: 'layer-dialog-message-view-container {\ndisplay: flex;\nflex-direction: column;\nalign-items: stretch;\n}\nlayer-dialog-message-view-container.layer-title-icon-empty .layer-card-title-bar-icon {\ndisplay: none;\n}\nlayer-dialog-message-view-container .layer-card-title-bar {\ndisplay: flex;\nflex-direction: row;\n}\nlayer-dialog-message-view-container .layer-card-title-bar-text {\nflex-grow: 1;\n}\nlayer-dialog-message-view-container:not(.layer-show-close-button) .layer-card-title-close-button {\ndisplay: none;\n}\nlayer-dialog-message-view-container .layer-card-top {\nflex-grow: 1;\ndisplay: flex;\nflex-direction: column;\n}\nlayer-dialog-message-view-container .layer-card-top > * {\nflex-grow: 1;\n}',
  template: '<div class="layer-card-title-bar"><div layer-id=\'icon\' class="layer-card-title-bar-icon"></div><div layer-id=\'title\' class="layer-card-title-bar-text"></div><div layer-id=\'titleButtons\' class="layer-card-title-buttons"><div layer-id=\'close\' class="layer-card-title-close-button">&times;</div></div></div><div layer-id=\'UIContainer\' class=\'layer-card-top\'></div>',

  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    /**
     * The Layer.Core.MessageTypeModel whose data is rendered here.
     *
     * @property {Layer.Core.MessageTypeModel} model
     */
    model: {},

    /**
     * The action data of the button or Message that was used to open this expanded viewer.
     *
     * @property {Object}
     */
    openActionData: {},

    /**
     * The Layer.UI.messages.MessageViewMixin that is wrapped by this UI Component.
     *
     * @property {Layer.UI.messages.MessageViewMixin} ui
     */
    ui: {
      set: function set() {
        while (this.nodes.UIContainer.firstChild) {
          this.nodes.UIContainer.removeChild(this.nodes.UIContainer.firstChild);
        }if (this.properties.ui) this.nodes.UIContainer.appendChild(this.properties.ui);
      }
    },

    /**
     * Title for the titlebar; comes from `this.properties.ui._getTitle()`
     *
     * @property {String} title
     */
    title: {
      set: function set(title) {
        this.nodes.title.innerHTML = title;
      }
    },

    /**
     * Icon for the titlebar; comes from `this.properties.ui._getIconClass()`
     *
     * @property {String} icon
     */
    icon: {
      value: '',
      set: function set(icon, oldIcon) {
        if (oldIcon) this.nodes.icon.classList.remove(oldIcon);
        if (icon) this.nodes.icon.classList.add(icon);
        this.toggleClass('layer-title-icon-empty', !icon);
      }
    },

    /**
     * Show a close button in the titlebar to close the dialog?:
     *
     * @property {Boolean} [isCloseButtonShowing=false]
     */
    isCloseButtonShowing: {
      value: false,
      set: function set(value) {
        this.toggleClass('layer-show-close-button', value);
      }
    }
  },
  methods: {
    onCreate: function onCreate() {
      this.addClickHandler('close-click', this.nodes.close, this.onCloseClick.bind(this));
    },
    onAfterCreate: function onAfterCreate() {
      this.model.on('message-type-model:change', this.onRerender, this);
    },
    onRerender: function onRerender() {
      this.icon = this.properties.ui._getIconClass();
      this.title = this.properties.ui._getTitle();
    },


    /**
     * Mixin Hook: On clicking the close button, destroy the parent component (the dialog)
     *
     * @method onCloseClick
     */
    onCloseClick: function onCloseClick() {
      this.parentComponent.destroy();
    }
  }
});