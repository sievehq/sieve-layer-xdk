/**
 * Subcomponent of Layer.UI.messages.ReceiptView for rendering individual Product Models
 *
 * @class Layer.UI.messages.ReceiptProductView
 * @extends Layer.UI.components.Component
 */
import { registerComponent } from '../../components/component';

registerComponent('layer-receipt-product-view', {
  template: `
    <img layer-id='img' />
    <div class='layer-receipt-product-view-right'>
      <div layer-id="name" class="layer-receipt-view-name"></div>
      <div layer-id="options" class="layer-receipt-view-options"></div>
      <div layer-id="quantity" class="layer-receipt-view-quantity"></div>
      <div layer-id="price" class="layer-receipt-view-price"></div>
    </div>
  `,
  style: `layer-receipt-product-view {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }
  `,
  properties: {
    item: {},
  },
  methods: {
    onRender() {
      this.onRerender();
    },
    onRerender() {
      this.nodes.img.src = this.item.imageUrls[0];
      this.nodes.name.innerHTML = this.item.name;
      this.nodes.price.innerHTML = this.item.getFormattedPrice();
      this.nodes.quantity.innerHTML = this.item.quantity !== 1 ? this.item.quantity : '';
      if (this.item.options) {
        const selectedOptions = this.item.options.map((choiceModel, index) => {
          if (choiceModel.selectedAnswer) {
            return choiceModel.getText(choiceModel.getChoiceIndexById(choiceModel.selectedAnswer));
          }
        }).filter(selectedText => selectedText).join(', ');
        this.nodes.options.innerHTML = selectedOptions;
      }
    },
  },
});