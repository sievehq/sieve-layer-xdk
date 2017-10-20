/**
 *
 * @class
 * @extends layer.UI.components.Component
 */
import { registerComponent } from '../component';
import Clickable from '../../mixins/clickable';

registerComponent('layer-action-button', {
  mixins: [Clickable],
  template: '<button class="layer-button" layer-id="button" tab-index="0"></button>',
  style: `layer-action-button {
    display: flex;
    flex-direction: column;
    align-content: stretch;
  }
  layer-action-button button {
    cursor: pointer;
  }
  .layer-button-content > * {
    max-width: 100%;
    width: 100%;
  }
  `,
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    text: {
      set(value) {
        this.nodes.button.innerHTML = value;
      },
    },
    tooltip: {
      set(value) {
        this.nodes.button.title = value;
      },
    },
    event: {},
    data: {},
    disabled: {
      type: Boolean,
      set(value) {
        this.nodes.button.disabled = value;
      },
    },
    icon: {
      set(value, oldValue) {
        if (oldValue) this.classList.remove(oldValue);
        if (value) this.classList.add(value);
      },
    },
    selected: {
      type: Boolean,
      set(value) {
        this.toggleClass('layer-action-button-selected', value);
      },
    },
  },
  methods: {
    /**
     * @method
     */
    onCreate() {
      this.addClickHandler('button-click', this, this._onClick.bind(this));
    },

    /**
     *
     * @method
     */
    onRender() {

    },


    _onClick(evt) {
      if (!this.event) return;
      evt.preventDefault();
      evt.stopPropagation();

      let cardView = this;
      while (cardView.tagName !== 'LAYER-MESSAGE-VIEWER' && cardView.parentComponent) {
        cardView = cardView.parentComponent;
      }
      if (cardView) cardView.runAction({ event: this.event, data: this.data });
      evt.target.blur();
    },
  },
});
