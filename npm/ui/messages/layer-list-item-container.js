'use strict';

var _component = require('../components/component');

(0, _component.registerComponent)('layer-list-item-container', {
  style: 'layer-list-item-container {\ndisplay: flex;\nflex-direction: row;\nflex-grow: 1;\n}\nlayer-list-item-container.layer-card-no-metadata .layer-card-body {\ndisplay: none;\n}\nlayer-list-item-container .layer-card-body {\nflex-grow: 1;\n}',
  template: '<div layer-id=\'UIContainer\' class=\'layer-card-left\'></div><div class="layer-card-body"><div layer-id="title" class="layer-card-title"></div><div layer-id="description" class="layer-card-description"></div><div layer-id="footer" class="layer-card-footer"></div></div>',

  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    cardBorderStyle: {
      noGetterFromSetter: true,
      get: function get() {
        return this.properties.cardBorderStyle || this.properties.ui.cardBorderStyle || 'list';
      }
    },
    model: {},
    ui: {
      set: function set() {
        while (this.nodes.UIContainer.firstChild) {
          this.nodes.UIContainer.removeChild(this.nodes.UIContainer.firstChild);
        }if (this.properties.ui) this.nodes.UIContainer.appendChild(this.properties.ui);
      }
    },
    title: {
      set: function set(title) {
        this.nodes.title.innerHTML = title;
      }
    },
    description: {
      set: function set(description) {
        this.nodes.description.innerHTML = description;
      }
    },
    footer: {
      set: function set(footer) {
        this.nodes.footer.innerHTML = footer;
      }
    }
  },
  methods: {
    onAfterCreate: function onAfterCreate() {
      this.model.on('message-type-model:change', this.onRerender, this);
    },
    onRerender: function onRerender() {
      var model = this.properties.model;
      this.title = model.getTitle();
      this.description = model.getDescription();
      this.footer = model.getFooter();
      this.toggleClass('layer-card-no-metadata', !this.title && !this.description && !this.footer);
    }
  }
}); /* NOT SUPPORTED
     *
     * @class Layer.UI.handlers.message.messageViewer
     * @extends Layer.UI.Component
     */