/**
 * UI for a Location Message
 *
 * You must set your Google Maps API key in `window.googleMapsAPIKey`
 *
 * @class Layer.UI.messages.LocationView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.components.Component
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
  layer-location-view.layer-location-view-address-only {
    display: none;
  }
  `,
  properties: {

    /**
     * Height of the map in pixels.
     *
     * Should be set during initialization; not used to modify the map after rendering.
     *
     * @property {Number} [type=300]
     */
    mapHeight: {
      value: 300,
    },

    /**
     * Set to `true` to tell the Component to hide the map.
     *
     * @property {Boolean} [hideMap=false]
     */
    hideMap: {
      value: false,
      type: Boolean,
      set(value) {
        this.toggleClass('layer-location-view-address-only', value);
        this._setupContainerClasses();
      },
    },

    // See parent class
    widthType: {
      value: 'full-width',
    },

    /**
     * Use a Standard Display Container to render this UI.
     *
     * @property {String} [messageViewContainerTagName=layer-standard-display-container]
     */
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-display-container',
    },
  },
  methods: {

    // See parent class for definition
    onAttach() {
      // Once added to the DOM structure, we should be able to determine an optimal width for the map.
      if (!this.hideMap) this._updateImageSrc();
    },

    /**
     * Deterimne the image dimensions and fetch them from google maps service by setting an `<img src />` property.
     *
     * @method
     * @private
     */
    _updateImageSrc() {
      if (this.parentNode && this.parentNode.clientWidth) {
        const marker = this.model.latitude ? this.model.latitude + ',' + this.model.longitude : escape(this.model.street1 + (this.model.street2 ? ' ' + this.model.street2 : '') + ` ${this.model.city} ${this.model.administrativeArea}, ${this.model.postalCode} ${this.model.country}`);

        this.nodes.img.src = `${location.protocol}//maps.googleapis.com/maps/api/staticmap?size=${this.parentNode.clientWidth}x${this.mapHeight}&language=${navigator.language}&key=${window.googleMapsAPIKey}&zoom=${this.model.zoom}&markers=${marker}`;
      }
    },

    // See parent class definition
    onRerender() {
      this._updateImageSrc();
    },

    /**
     * As part of the Message UI lifecycle, this is called to update the <layer-standard-display-container /> CSS classes.
     *
     * Adds an optional "Next Arrow" to the metadata, and optionally hides itself.
     *
     * @method _setupContainerClasses
     * @protected
     */
    _setupContainerClasses() {
      this.parentComponent.toggleClass('layer-arrow-next-container', this.hideMap);
      this.parentComponent.toggleClass('layer-no-core-ui', this.hideMap);
    },
  },
});

registerMessageActionHandler('open-map', function openMapHandler(customData) {
  let url;
  if (this.model.street1) {
    url = 'http://www.google.com/maps/?q=' +
      escape(this.model.street1 + (this.model.street2 ? ' ' + this.model.street2 : '') +
      ` ${this.model.city} ${this.model.administrativeArea}, ${this.model.postalCode} ${this.model.country}`);
  } else if (this.model.latitude) {
    url = `https://www.google.com/maps/search/?api=1&query=${this.model.latitude},${this.model.longitude}&zoom=${this.model.zoom}`;
  }
  this.showFullScreen(url);
});
