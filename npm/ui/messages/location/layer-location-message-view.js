/**
 * UI for a Location Message
 *
 * You must set your Google Maps API key in `window.googleMapsAPIKey`
 *
 * ### Importing
 *
 * Not included with the standard build. Import with:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/location/layer-location-message-view';
 * ```
 *
 * @class Layer.UI.messages.LocationMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('../../components/component');

var _messageViewMixin = require('../message-view-mixin');

var _messageViewMixin2 = _interopRequireDefault(_messageViewMixin);

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

require('./layer-location-message-model');

var _utils = require('../../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-location-message-view', {
  mixins: [_messageViewMixin2.default],
  template: '<img layer-id="img" />',
  style: 'layer-message-viewer.layer-location-message-view {\ncursor: pointer;\n}\nlayer-message-viewer.layer-location-message-view:not(.layer-location-message-view-address-only) {\nmax-width: 640px;\n}\n.layer-location-message-view-address-only layer-location-message-view {\ndisplay: none;\n}\nlayer-location-message-view img {\ndisplay: block;\n}\nlayer-message-viewer.layer-location-message-view .layer-location-message-show-street-address\n.layer-standard-card-container-description p.layer-line-wrapping-paragraphs + p.layer-line-wrapping-paragraphs {\nmargin-top: 0px;\n}',
  properties: {
    height: {
      value: 250
    },

    /**
     * Set to `true` to tell the Component to hide the map.
     *
     * @property {Boolean} [hideMap=false]
     */
    hideMap: {
      value: false,
      type: Boolean,
      set: function set(value) {
        this.messageViewer.toggleClass('layer-location-message-view-address-only', value);
        this._setupContainerClasses();
      }
    },

    // See parent class
    widthType: {
      value: _constants2.default.WIDTH.FULL
    },

    preferredMaxWidth: {
      value: 640
    },

    /**
     * Use a Standard Display Container to render this UI.
     *
     * @property {String} [messageViewContainerTagName=layer-standard-message-view-container]
     */
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-message-view-container'
    }
  },
  methods: {

    // See parent class for definition
    onAttach: function onAttach() {
      // Once added to the DOM structure, we should be able to determine an optimal width for the map.
      if (!this.hideMap) this._updateImageSrc();
    },


    /**
     * Deterimne the image dimensions and fetch them from google maps service by setting an `<img src />` property.
     *
     * @method
     * @private
     */
    _updateImageSrc: function _updateImageSrc() {
      var _this = this;

      if (this.parentNode && this.parentNode.clientWidth) {
        (0, _utils.defer)(function () {
          var marker = void 0;
          if (_this.model.latitude) {
            marker = _this.model.latitude + ',' + _this.model.longitude;
          } else {
            marker = escape(_this.model.street1 + (_this.model.street2 ? ' ' + _this.model.street2 : '') + (' ' + _this.model.city + ' ' + _this.model.administrativeArea + ', ' + _this.model.postalCode + ' ' + _this.model.country));
          }
          _this.nodes.img.src = location.protocol + '//maps.googleapis.com/maps/api/staticmap?' + ('size=' + _this.parentNode.clientWidth + 'x' + _this.height + '&language=' + navigator.language.toLowerCase()) + ('&key=' + window.googleMapsAPIKey + '&zoom=' + _this.model.zoom + '&markers=' + marker);
        });
      }
    },


    // See parent class definition
    onRerender: function onRerender() {
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
    _setupContainerClasses: function _setupContainerClasses() {
      this.parentComponent.toggleClass('layer-arrow-next-container', this.hideMap);
      this.parentComponent.toggleClass('layer-no-core-ui', this.hideMap);
      this.parentComponent.toggleClass('layer-location-message-show-street-address', this.model.street1 && !this.model.description);
    }
  }
}); 