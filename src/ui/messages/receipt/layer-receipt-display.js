/**
 *
 * @class layerUI.handlers.message.messageViewer
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import MessageDisplayMixin from '../message-display-mixin';

registerComponent('layer-product-card-mini', {
  template: `
    <img layer-id='img' />
    <div class='layer-product-card-mini-right'>
      <div layer-id="name" class="layer-receipt-display-name"></div>
      <div layer-id="options" class="layer-receipt-display-options"></div>
      <div layer-id="quantity" class="layer-receipt-display-quantity"></div>
      <div layer-id="price" class="layer-receipt-display-price"></div>
    </div>
  `,
  style: `layer-product-card-mini {
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
        const selectedOptions = this.item.options.map((choiceModel) => {
          if (choiceModel.selectedAnswer) {
            return choiceModel.choices.filter(choice => choice.id === choiceModel.selectedAnswer)[0].text;
          }
        }).filter(selectedText => selectedText).join(', ');
        this.nodes.options.innerHTML = selectedOptions;
      }
    },
  },
});

registerComponent('layer-receipt-display', {
  template: `
  <div class="layer-receipt-for-products" layer-id="products"></div>
  <div class='layer-receipt-details'>
    <div class='layer-paid-with layer-receipt-detail-item'>
      <label>Paid with</label>
      <div class="layer-receipt-paid-with layer-card-description" layer-id='paidWith'></div>
    </div>
    <div class='layer-address layer-receipt-detail-item'>
      <label>Ship to</label>
      <layer-message-viewer layer-id='shipTo' hide-map='true'></layer-message-viewer>
    </div>
    <div class='layer-receipt-summary layer-receipt-detail-item'>
      <label>Total</label>
      <span class='layer-receipt-price' layer-id='total'></span>
    </div>
  </div>
  `,
  style: `layer-receipt-display {
    display: block;
  }
  layer-message-viewer.layer-receipt-display {
    padding-bottom: 0px;
  }
  layer-receipt-display.layer-receipt-no-payment .layer-paid-with {
    display: none;
  }
  `,
  mixins: [MessageDisplayMixin],
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-titled-display-container',
    },
    widthType: {
      value: 'full-width',
    },
  },
  methods: {

    getIconClass() {
      return 'layer-receipt-display-icon';
    },
    getTitle() {
      return this.model.title || 'Order Confirmation';
    },

    /**
     *
     * @method
     */
    onRender() {

    },

    onRerender() {
      this.nodes.products.innerHTML = '';
      this.model.items.forEach((item) => {
        this.createElement('layer-product-card-mini', {
          item,
          parentNode: this.nodes.products,
        });
      });

      if (this.model.shippingAddressModel) {
        const shipTo = this.nodes.shipTo;
        this.model.shippingAddressModel.showAddress = true;
        shipTo.rootPart = this.model.shippingAddressModel.part;
        shipTo.model = this.model.shippingAddressModel;

        shipTo.message = this.model.message;
        shipTo.cardBorderStyle = 'none';
        shipTo._onAfterCreate();

        shipTo.nodes.ui.hideMap = true;
      }

      this.nodes.total.innerHTML = new Number(this.model.summary.totalCost)
        .toLocaleString(navigator.language, {
          currency: this.model.currency,
          style: 'currency',
        });
      this.nodes.paidWith.innerHTML = this.model.paymentMethod || 'Unknown';

      this.toggleClass('layer-receipt-no-payment', !this.model.paymentMethod);
    },
  },
});

