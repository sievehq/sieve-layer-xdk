/**
 *
 * @class layer.UI.handlers.message.messageViewer
 * @extends layer.UI.components.Component
 */
import { registerComponent } from '../../components/component';
import MessageViewMixin from '../message-view-mixin';

registerComponent('layer-product-view', {
  style: `layer-product-view {
    display: block;
  }
  layer-message-viewer.layer-product-view {
    cursor: pointer;
  }
  layer-product-view.layer-no-image .layer-card-top {
    display: none;
  }
  `,
  template: `
    <div layer-id='UIContainer' class='layer-card-top'>
      <img layer-id="image" />
    </div>
    <div class="layer-card-body-outer">
        <div class="layer-card-product-header">
          <div layer-id="brand" class="layer-card-product-brand"></div>
          <div layer-id="model" class="layer-card-product-model"></div>
        </div>
        <div layer-id="name" class="layer-card-product-name"></div>

        <div layer-id="price" class="layer-card-product-price"></div>
        <div layer-id="choices" class="layer-card-product-choices"></div>
        <div layer-id="description" class="layer-card-product-description"></div>
    </div>
  `,
  mixins: [MessageViewMixin],
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    widthType: {
      value: 'full-width',
    },
    preferredMaxWidth: {
      value: 500,
    },
  },
  methods: {
    _fixHtml(body) {
      body = body.replace(/</g, '&lt;');
      body = body.replace(/>/g, '&gt;');
      return body;
    },

    onRerender() {
      this.nodes.name.innerHTML = this._fixHtml(this.model.name);
      this.nodes.brand.innerHTML = this._fixHtml(this.model.brand);
      this.nodes.price.innerHTML = this._fixHtml(this.model.getFormattedPrice());
      this.nodes.description.innerHTML = this._fixHtml(this.model.description);

      this.nodes.image.src = this.model.imageUrls[0];
      this.toggleClass('layer-no-image', this.model.imageUrls.length === 0);

      const optionsParent = this.nodes.choices;

      if (!optionsParent.firstChild) {
        this.model.options.forEach((optionsModel) => {
          optionsModel.action = { event: this.model.actionEvent, data: this.model.data || { url: this.model.url } };
          this.createElement('layer-message-viewer', {
            message: this.model.message,
            rootPart: optionsModel.part,
            model: optionsModel,
            //messageViewContainerTagName: false,
            cardBorderStyle: 'none',
            parentNode: this.nodes.choices,
          });
        });
      }
      /*
      if (this.model.detailModel) {
        this.createElement('layer-message-viewer', {
          message: this.model.message,
          rootPart: this.model.detailModel.part,
          model: this.model.detailModel,
          //messageViewContainerTagName: false,
          cardBorderStyle: 'none',
          parentNode: this,
        });
      }*/
    },

    /**
     *
     * @method
     */
    onRender() {

    },
  },
});
