/* m = $("layer-conversation-view").conversation.createMessage({parts: [
  {
    mimeType: "application/vnd.layer.location+json; role=root",
    body: '{"latitude": 37.7734858, "longitude": -122.3916087, "title": "Réveille Coffee Co.", "description": "Good coffee, but pricey, and when you hear people say the name, you know that they just reviled the place."}'
  }]}).send();
  */

/**
 * You must set your Google Maps API key in `window.googleMapsAPIKey`
 *
 * @class ???
 * @extends layer.UI.components.Component
 */
import { registerComponent } from '../../components/component';
import MessageViewMixin from '../message-view-mixin';
import { registerMessageActionHandler } from '../../base';

registerComponent('layer-location-view', {
  mixins: [MessageViewMixin],
  template: '<img layer-id="img" />',
  style: `
  layer-message-viewer.layer-location-view {
    cursor: pointer;
  }
  .layer-location-view-address-only {
    display: none;
  }
  `,
  properties: {
    mapHeight: {
      value: 300,
    },
    hideMap: {
      value: false,
      set(value) {
        this.toggleClass('layer-location-view-address-only', value);
        this.setupContainerClasses();
      },
    },
    widthType: {
      value: 'full-width',
    },
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-display-container',
    },
  },
  methods: {

    onAttach() {
      if (!this.hideMap) this._updateImageSrc();
    },

    _updateImageSrc() {
      if (this.parentNode && this.parentNode.clientWidth) {
        const marker = this.model.latitude ? this.model.latitude + ',' + this.model.longitude : escape(this.model.street1 + (this.model.street2 ? ' ' + this.model.street2 : '') + ` ${this.model.city} ${this.model.administrativeArea}, ${this.model.postalCode} ${this.model.country}`);

        this.nodes.img.src = `${location.protocol}//maps.googleapis.com/maps/api/staticmap?size=${this.parentNode.clientWidth}x${this.mapHeight}&language=${navigator.language}&key=${window.googleMapsAPIKey}&zoom=${this.model.zoom}&markers=${marker}`;
      }
    },

    onRender() {
      this.onRerender();
    },

    /**
     *
     * @method
     */
    onRerender() {
      this._updateImageSrc();
    },

    setupContainerClasses() {
      this.parentComponent.toggleClass('layer-arrow-next-container', this.hideMap);
      this.parentComponent.toggleClass('layer-no-core-ui', this.hideMap);
    },
  },
});

registerMessageActionHandler('open-map', function openMapHandler(customData) {
  let url;
  if (this.model.street1) {
    url = 'http://www.google.com/maps/?q=' +
      escape(this.model.street1 + (this.model.street2 ? ' ' + this.model.street2 : '') + ` ${this.model.city} ${this.model.administrativeArea}, ${this.model.postalCode} ${this.model.country}`);
  } else if (this.model.latitude) {
    url = `https://www.google.com/maps/search/?api=1&query=${this.model.latitude},${this.model.longitude}&zoom=${this.model.zoom}`;
  }
  if (url) window.open(url);
});
