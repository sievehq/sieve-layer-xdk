/**
 * UI for a Product Message representing a Product Model
 *
 * The Product Message may also be combined with a Button Model to allow the user to perform
 * actions upon the Message. Some UIs may provide a full screen view that enables additional interactions.
 *
 * @class Layer.UI.messages.ProductMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.Component
 */
import { registerComponent } from '../../components/component';
import MessageViewMixin from '../message-view-mixin';
import LayerUI, { Constants } from '../../base';

registerComponent('layer-product-message-view', {
  style: `
  layer-product-message-view {
    display: block;
  }
  layer-product-message-view > .layer-card-top {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  layer-product-message-view > .layer-card-top > img {
    display: block;
  }
  layer-message-viewer.layer-product-message-view {
    cursor: pointer;
  }
  layer-product-message-view.layer-no-image .layer-card-top {
    display: none;
  }
  layer-product-message-view .layer-card-product-description:empty,
  layer-product-message-view .layer-card-product-choices:empty,
  layer-product-message-view .layer-card-product-name:empty,
  layer-product-message-view .layer-card-product-header:empty,
  layer-product-message-view .layer-card-product-price:empty {
    display: none;
  }
  `,
  template: `
    <div layer-id='UIContainer' class='layer-card-top'>
      <img layer-id="image" />
    </div>
    <div class="layer-card-body-outer">
        <div class="layer-card-product-header" layer-id="brand" ></div>
        <div layer-id="name" class="layer-card-product-name"></div>

        <div layer-id="price" class="layer-card-product-price"></div>
        <div layer-id="choices" class="layer-card-product-choices"></div>
        <div layer-id="description" class="layer-card-product-description"></div>
    </div>
  `,
  mixins: [MessageViewMixin],

  properties: {
    widthType: {
      value: Constants.WIDTH.FULL,
    },

    // Carousels of these things should not fill _any_ sized screen; put a max.
    preferredMaxWidth: {
      value: 500,
    },
  },
  methods: {

    /**
     * Assume that any property of the Product Model can change, and that any Model change should rerender
     * the entire Product View.
     *
     * @method onRerender
     */
    onRerender() {

      // Render the basic info fields
      this.nodes.name.innerHTML = LayerUI.processText(this.model.name);
      this.nodes.brand.innerHTML = LayerUI.processText(this.model.brand);
      this.nodes.price.innerHTML = LayerUI.processText(this.model.getFormattedPrice());
      this.nodes.description.innerHTML = LayerUI.processText(this.model.description);

      // Render the image (at some point we may want a way to see multiple images)
      // If no images, hide the image area
      this.nodes.image.src = this.model.imageUrls[0];
      this.toggleClass('layer-no-image', this.model.imageUrls.length === 0);

      const optionsParentNode = this.nodes.choices;

      // This currently only renders once, so changes to the options list will NOT render.
      // We will eventually need identify what needs to be added, what needs to be updated, etc...
      if (!optionsParentNode.firstChild) {
        this.model.options.forEach((optionsModel) => {
          optionsModel.action = { event: this.model.actionEvent, data: this.model.data || { url: this.model.url } };
          this.createElement('layer-message-viewer', {
            model: optionsModel,
            messageViewContainerTagName: false,
            cardBorderStyle: 'none',
            parentNode: this.nodes.choices,
          });
        });
      }
    },
  },
});
