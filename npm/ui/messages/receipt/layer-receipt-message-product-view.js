/**
 * Subcomponent of Layer.UI.messages.ReceiptView for rendering individual Product Models
 *
 * @class Layer.UI.messages.ReceiptMessageProductView
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('../../components/component');

(0, _component.registerComponent)('layer-receipt-message-product-view', {
  template: '<div class=\'layer-receipt-message-image\' layer-id=\'img\'></div><div class=\'layer-receipt-message-product-view-right\'><div layer-id="name" class="layer-receipt-message-view-name"></div><div layer-id="options" class="layer-receipt-message-view-options"></div><div layer-id="quantity" class="layer-receipt-message-view-quantity"></div><div layer-id="price" class="layer-receipt-message-view-price"></div></div>',
  style: 'layer-receipt-message-product-view {\ndisplay: flex;\nflex-direction: row;\nalign-items: flex-start;\n}',
  properties: {
    /**
     * The Product Model to be rendered.
     *
     * @property {Layer.UI.messages.ProductMessageModel} item
     */
    item: {}
  },
  methods: {
    // Insure onRerender is called during intialization
    onRender: function onRender() {
      this.onRerender();
    },


    /**
     * Whenever the model changes, or during intialization (Lifecycle method) udpate all child nodes.
     *
     * @method onRerender
     */
    onRerender: function onRerender() {
      // Setup the basic DOM attributes
      this.nodes.img.style.backgroundImage = this.item.imageUrls[0] ? 'url(' + this.item.imageUrls[0] + ')' : '';
      this.nodes.name.innerHTML = this.item.name;
      this.nodes.price.innerHTML = this.item.getFormattedPrice();
      this.nodes.quantity.innerHTML = this.item.quantity !== 1 ? this.item.quantity : '';

      if (this.item.options) {
        // For each option within the Product Model, generate a string representing the selected options.  This is just a comma separated label, not interactive.
        var selectedOptions = this.item.options.map(function (choiceModel, index) {
          if (choiceModel.selectedAnswer) {
            return choiceModel.getText(choiceModel.getChoiceIndexById(choiceModel.selectedAnswer));
          } else {
            return null;
          }
        }).filter(function (selectedText) {
          return selectedText;
        }).join(', ');
        this.nodes.options.innerHTML = selectedOptions;
      }
    }
  }
}); 