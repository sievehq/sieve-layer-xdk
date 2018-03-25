/**
 * UI for a Receipt Message representing a Receipt for a Purchase.
 *
 * The Receipt Message may also be combined with a Button Model to act as an invoice
 * or request confirmation of a planned purchase.
 *
 * ### Importing
 *
 * Not included with the standard build. Import with:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/receipt/layer-receipt-message-view';
 * ```
 *
 * @class Layer.UI.messages.ReceiptMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('../../components/component');

var _messageViewMixin = require('../message-view-mixin');

var _messageViewMixin2 = _interopRequireDefault(_messageViewMixin);

require('./layer-receipt-message-product-view');

require('./layer-receipt-message-model');

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-receipt-message-view', {
  template: '<div class="layer-receipt-for-products" layer-id="products"></div><div class=\'layer-receipt-details\'><div class=\'layer-paid-with layer-receipt-detail-item\'><label>Paid with</label><div class="layer-receipt-paid-with layer-receipt-card-description" layer-id=\'paidWith\'></div></div><div class=\'layer-address layer-receipt-detail-item\'><label>Ship to</label><layer-message-viewer layer-id=\'shipTo\' hide-map=\'true\'></layer-message-viewer></div><div class=\'layer-receipt-summary layer-receipt-detail-item\'><label>Total</label><span class=\'layer-receipt-price\' layer-id=\'total\'></span></div></div>',
  style: 'layer-receipt-message-view {\ndisplay: block;\n}\nlayer-message-viewer.layer-receipt-message-view {\npadding-bottom: 0px;\n}\nlayer-receipt-message-view.layer-receipt-no-payment .layer-paid-with {\ndisplay: none;\n}\nlayer-receipt-message-view .layer-receipt-detail-item layer-message-viewer {\ndisplay: block;\n}',
  mixins: [_messageViewMixin2.default],
  properties: {

    // Use the Titled Message Container
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-titled-message-view-container'
    },
    widthType: {
      value: _constants2.default.WIDTH.FULL
    }
  },
  methods: {

    /**
     * Provide the Titled Message Container with an Icon CSS Class
     *
     * @method _getIconClass
     * @returns {String}
     * @protected
     */
    _getIconClass: function _getIconClass() {
      return 'layer-receipt-message-view-icon';
    },


    /**
     * Provides the Titled Message Container with title text
     *
     * @method _getTitle
     * @returns {String}
     * @protected
     */
    _getTitle: function _getTitle() {
      return this.model.title || 'Order Confirmation';
    },


    /**
     * Don't really know what data is and is not changeable in a Receipt Model, so just rerender everything on any change event.
     *
     * @method onRerender
     */
    onRerender: function onRerender() {
      var _this = this;

      // Clear the Product List
      this.nodes.products.innerHTML = '';

      // Generate the Product List
      this.model.items.forEach(function (item) {
        _this.createElement('layer-receipt-message-product-view', {
          item: item,
          parentNode: _this.nodes.products
        });
      });

      // Generate the Shipping Address
      if (this.model.shippingAddress) {
        var shipTo = this.nodes.shipTo;
        this.model.shippingAddress.showAddress = true;
        shipTo.model = this.model.shippingAddress;
        shipTo.cardBorderStyle = 'none';
        shipTo._onAfterCreate();
        shipTo.nodes.ui.hideMap = true;
      }

      // Setup the Totals and Paid With sections
      this.nodes.total.innerHTML = Number(this.model.summary.totalCost).toLocaleString(navigator.language, {
        currency: this.model.currency,
        style: 'currency'
      });
      this.nodes.paidWith.innerHTML = this.model.paymentMethod || 'Unknown';

      // If there is no paymentMethod, slap on a "no-payment" css class
      this.toggleClass('layer-receipt-no-payment', !this.model.paymentMethod);
    }
  }
}); 