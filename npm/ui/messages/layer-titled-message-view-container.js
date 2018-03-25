/**
 * Container for Message Type Views that adds a titlebar.
 *
 * ### Importing
 *
 * Included with the standard build. For custom build,  import with:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/layer-titled-message-view-container
 * ```
 *
 * @class Layer.UI.messages.TitledMessageViewContainer
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('../components/component');

(0, _component.registerComponent)('layer-titled-message-view-container', {
  style: 'layer-titled-message-view-container {\ndisplay: flex;\nflex-direction: column;\nalign-items: stretch;\n}\nlayer-titled-message-view-container.layer-title-icon-empty .layer-card-title-bar-icon {\ndisplay: none;\n}\nlayer-titled-message-view-container.layer-no-title .layer-card-title-bar {\ndisplay: none;\n}\nlayer-titled-message-view-container .layer-card-title-bar {\ndisplay: flex;\nflex-direction: row;\n}\nlayer-titled-message-view-container .layer-card-title-bar-text {\nflex-grow: 1;\n}',
  template: '<div class="layer-card-title-bar"><div layer-id=\'icon\' class="layer-card-title-bar-icon"></div><div layer-id=\'title\' class="layer-card-title-bar-text"></div></div><div layer-id=\'UIContainer\' class=\'layer-card-top\'></div>',

  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    /**
     * The Layer.Core.MessageTypeModel whose data is rendered here.
     *
     * @property {Layer.Core.MessageTypeModel} model
     */
    model: {},

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
        this.toggleClass('layer-no-title', !title);
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
    }
  },
  methods: {
    onAfterCreate: function onAfterCreate() {
      this.model.on('message-type-model:change', this.onRerender, this);
    },
    onRerender: function onRerender() {
      this.icon = this.properties.ui._getIconClass();
      this.title = this.properties.ui._getTitle();
    }
  }
}); 