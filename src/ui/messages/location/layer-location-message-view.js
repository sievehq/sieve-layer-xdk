/**
 * UI for a Location Message
 *
 * You must set your Google Maps API key in `window.googleMapsAPIKey`
 *
 * @class Layer.UI.messages.LocationMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.Component
 */
import { registerComponent } from '../../components/component';
import MessageViewMixin from '../message-view-mixin';
import Constants from '../../constants';

registerComponent('layer-location-message-view', {
  mixins: [MessageViewMixin],
  template: '<img layer-id="img" />',
  style: `
  layer-message-viewer.layer-location-message-view {
    cursor: pointer;
  }
  layer-message-viewer.layer-location-message-view:not(.layer-location-message-view-address-only) {
    max-width: 640px;
  }
  .layer-location-message-view-address-only layer-location-message-view {
    display: none;
  }
  layer-location-message-view img {
    display: block;
  }
  layer-message-viewer.layer-location-message-view .layer-location-message-show-street-address .layer-card-description p.layer-line-wrapping-paragraphs + p.layer-line-wrapping-paragraphs {
    margin-top: 0px;
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
        this.messageViewer.toggleClass('layer-location-message-view-address-only', value);
        this._setupContainerClasses();
      },
    },

    // See parent class
    widthType: {
      value: Constants.WIDTH.FULL,
    },

    /**
     * Use a Standard Display Container to render this UI.
     *
     * @property {String} [messageViewContainerTagName=layer-standard-message-view-container]
     */
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-message-view-container',
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
     * As part of the Message UI lifecycle, this is called to update the `<layer-standard-message-view-container />` CSS classes.
     *
     * Adds an optional "Next Arrow" to the metadata, and optionally hides itself.
     *
     * @method _setupContainerClasses
     * @protected
     */
    _setupContainerClasses() {
      this.parentComponent.toggleClass('layer-arrow-next-container', this.hideMap);
      this.parentComponent.toggleClass('layer-no-core-ui', this.hideMap);
      this.parentComponent.toggleClass('layer-location-message-show-street-address', this.model.street1 && !this.model.description);
    },
  },
});
