/**
 *
 * @class layer.UI.handlers.message.messageViewer
 * @extends layer.UI.components.Component
 */
import { registerComponent } from '../components/component';

registerComponent('layer-titled-display-container', {
  style: `
    layer-titled-display-container {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }
    layer-titled-display-container.layer-title-icon-empty .layer-card-title-bar-icon {
      display: none;
    }
    layer-titled-display-container .layer-card-title-bar {
      display: flex;
      flex-direction: row;
    }
    layer-titled-display-container .layer-card-title-bar-text {
      flex-grow: 1;
    }
  `,
  template: `
  <div class="layer-card-title-bar">
    <div layer-id='icon' class="layer-card-title-bar-icon"></div>
    <div layer-id='title' class="layer-card-title-bar-text"></div>
  </div>
  <div layer-id='UIContainer' class='layer-card-top'></div>
  `,

   // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    model: {},
    ui: {
      set() {
        while (this.nodes.UIContainer.firstChild) this.nodes.UIContainer.removeChild(this.nodes.UIContainer.firstChild);
        if (this.properties.ui) this.nodes.UIContainer.appendChild(this.properties.ui);
      },
    },
    title: {
      set(title) {
        this.nodes.title.innerHTML = title;
      },
    },
    icon: {
      value: '',
      set(icon, oldIcon) {
        if (oldIcon) this.nodes.icon.classList.remove(oldIcon);
        if (icon) this.nodes.icon.classList.add(icon);
        this.toggleClass('layer-title-icon-empty', !Boolean(icon));
      },
    },
  },
  methods: {
    onAfterCreate() {
      this.model.on('change', this.onRerender, this);
    },

    /**
     *
     * @method
     */
    onRender() {
      this.onRerender();
    },

    onRerender() {
       this.icon = this.properties.ui.getIconClass();
       this.title = this.properties.ui.getTitle();
    },
  },
});

