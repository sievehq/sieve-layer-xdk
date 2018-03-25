/**
 * UI for a Product Message representing a Product Model
 *
 * The Product Message may also be combined with a Button Model to allow the user to perform
 * actions upon the Message. Some UIs may provide a full screen view that enables additional interactions.
 *
 * ### Importing
 *
 * Not included with the standard build. Import with:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/product/layer-product-message-view';
 * ```
 *
 * @class Layer.UI.messages.ProductMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('../../components/component');

var _messageViewMixin = require('../message-view-mixin');

var _messageViewMixin2 = _interopRequireDefault(_messageViewMixin);

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

var _textHandlers = require('../../handlers/text/text-handlers');

require('./layer-product-message-model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-product-message-view', {
  style: 'layer-product-message-view {\ndisplay: block;\n}\nlayer-product-message-view > .layer-card-top {\ndisplay: flex;\nflex-direction: column;\nalign-items: center;\n}\nlayer-product-message-view .layer-product-message-image {\ndisplay: block;\n}\nlayer-message-viewer.layer-product-message-view {\ncursor: pointer;\n}\nlayer-product-message-view.layer-no-image .layer-card-top {\ndisplay: none;\n}\nlayer-product-message-view .layer-card-product-description:empty,\nlayer-product-message-view .layer-card-product-choices:empty,\nlayer-product-message-view .layer-card-product-name:empty,\nlayer-product-message-view .layer-card-product-header:empty,\nlayer-product-message-view .layer-card-product-price:empty {\ndisplay: none;\n}',
  template: '<div layer-id="UIContainer" class="layer-card-top"><div class="layer-product-message-image" layer-id="image" ></div></div><div class="layer-card-body-outer"><div class="layer-card-product-header" layer-id="brand" ></div><div layer-id="name" class="layer-card-product-name"></div><div layer-id="price" class="layer-card-product-price"></div><div layer-id="choices" class="layer-card-product-choices"></div><div layer-id="description" class="layer-card-product-description"></div></div>',
  mixins: [_messageViewMixin2.default],

  properties: {
    widthType: {
      value: _constants2.default.WIDTH.FULL
    },

    // Carousels of these things should not fill _any_ sized screen; put a max.
    preferredMaxWidth: {
      value: 500
    }
  },
  methods: {

    /**
     * Assume that any property of the Product Model can change, and that any Model change should rerender
     * the entire Product View.
     *
     * @method onRerender
     */
    onRerender: function onRerender() {
      var _this = this;

      // Render the basic info fields
      this.nodes.name.innerHTML = (0, _textHandlers.processText)(this.model.name);
      this.nodes.brand.innerHTML = (0, _textHandlers.processText)(this.model.brand);
      this.nodes.price.innerHTML = (0, _textHandlers.processText)(this.model.getFormattedPrice());
      this.nodes.description.innerHTML = (0, _textHandlers.processText)(this.model.description);

      // Render the image (at some point we may want a way to see multiple images)
      // If no images, hide the image area
      this.nodes.image.style.backgroundImage = 'url(' + this.model.imageUrls[0] + ')';
      this.toggleClass('layer-no-image', this.model.imageUrls.length === 0);

      var optionsParentNode = this.nodes.choices;

      // This currently only renders once, so changes to the options list will NOT render.
      // We will eventually need identify what needs to be added, what needs to be updated, etc...
      if (!optionsParentNode.firstChild) {
        this.model.options.forEach(function (optionsModel) {
          optionsModel.action = { event: _this.model.actionEvent, data: _this.model.data || { url: _this.model.url } };
          _this.createElement('layer-message-viewer', {
            model: optionsModel,
            messageViewContainerTagName: false,
            cardBorderStyle: 'none',
            parentNode: _this.nodes.choices
          });
        });
      }
    }
  }
}); 