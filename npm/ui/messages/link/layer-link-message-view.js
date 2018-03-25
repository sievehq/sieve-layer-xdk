/**
 * UI for a Link Message
 *
 * ### Importing
 *
 * Included with the standard build. For custom build, Import with:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/link/layer-link-message-view';
 * ```
 *
 * @class Layer.UI.messages.LinkMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('../../components/component');

var _messageViewMixin = require('../message-view-mixin');

var _messageViewMixin2 = _interopRequireDefault(_messageViewMixin);

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

require('./layer-link-message-model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }



(0, _component.registerComponent)('layer-link-message-view', {
  mixins: [_messageViewMixin2.default],

  style: 'layer-message-viewer.layer-link-message-view layer-standard-message-view-container {\ncursor: pointer;\ndisplay: block;\n}\nlayer-message-viewer.layer-link-message-view .layer-card-top {\nalign-items: stretch\n}\nlayer-link-message-view.layer-link-message-no-image .layer-link-message-view-image  {\ndisplay: none;\n}\nlayer-link-message-view .layer-link-message-view-image {\nwidth: 100%;\ndisplay: block;\n}\n.layer-card-width-flex-width layer-link-message-view a {\ndisplay: none;\n}\nlayer-message-viewer.layer-link-message-view  .layer-standard-card-container-footer a,\nlayer-message-viewer.layer-link-message-view  .layer-standard-card-container-footer a:visited,\nlayer-message-viewer.layer-link-message-view  .layer-standard-card-container-footer a:hover {\ncolor: inherit;\ntext-decoration: none;',

  template: '<div layer-id="image" class="layer-link-message-view-image"></div><a target="_blank" layer-id="link"></a>',
  properties: {
    widthType: {
      get: function get() {
        // Use a chat bubble if there is no metadata nor image to show, else render this as a normal card-like message
        return this.model.imageUrl || this.parentComponent.isShowingMetadata ? _constants2.default.WIDTH.FLEX : _constants2.default.WIDTH.ANY;
      }
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

    /**
     * Whenever a the model changes or is created, rerender basic properties.
     *
     * @method onRerender
     */
    onRerender: function onRerender() {
      this.nodes.image.style.backgroundImage = this.model.imageUrl ? 'url(' + this.model.imageUrl + ')' : '';
      this.toggleClass('layer-link-message-no-image', !this.model.imageUrl);
      this.nodes.link.src = this.model.url;
      this.nodes.link.innerHTML = this.model.url;
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
      if (this.widthType) {
        var isLinkOnly = this.widthType === _constants2.default.WIDTH.ANY;
        var op = isLinkOnly || this.model.imageUrl ? 'remove' : 'add';
        this.parentComponent.classList[op]('layer-arrow-next-container');
        this.parentComponent.classList[this.model.imageUrl || isLinkOnly ? 'remove' : 'add']('layer-no-core-ui');
      }
    }
  }
});