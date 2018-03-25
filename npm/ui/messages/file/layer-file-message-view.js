/**
 * UI for a File Message
 *
 * ### Importing
 *
 * Not included with the standard build. Import using:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/file/layer-file-message-view';
 * ```
 *
 * @class Layer.UI.messages.FileMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('../../components/component');

var _messageViewMixin = require('../message-view-mixin');

var _messageViewMixin2 = _interopRequireDefault(_messageViewMixin);

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

require('./layer-file-message-model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-file-message-view', {
  mixins: [_messageViewMixin2.default],

  // Adapated from github.com/picturepan2/fileicon.css
  style: 'layer-file-message-view {\ndisplay: block;\nwidth: 100%;\n}',

  properties: {
    // See parent class
    widthType: {
      value: _constants2.default.WIDTH.FLEX
    },

    /**
     * Currently used only by the Carousel, establishes how much the Carousel can compress this width down to.
     *
     * @property {Number} [preferredMinWidth=250]
     */
    preferredMinWidth: {
      type: Number,
      value: 250
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
     * Whenever this component is rendered/rerendered, update its CSS Class to reflect the file type.
     *
     * Adds "layer-file-mime-type" to the class.
     *
     * @method onRerender
     */
    onRerender: function onRerender() {
      this.classList.add('layer-file-' + this.model.mimeType.replace(/[/+]/g, '-'));
    }
  }
});