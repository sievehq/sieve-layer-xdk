/**
 * UI for a Response Message
 *
 * A Response Message is a Message sent indicating that a user has interacted with a Message and changed
 * its state in a manner that is shared with all users and persisted.  See the Response Model for more details.
 * The Response View simply renders any renderable part of the Response Message.
 *
 * ### Importing
 *
 * Included with the standard build. For custom build, Import with:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/response/layer-response-message-view';
 * ```
 *
 * @class Layer.UI.messages.ResponseMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('../../components/component');

var _messageViewMixin = require('../message-view-mixin');

var _messageViewMixin2 = _interopRequireDefault(_messageViewMixin);

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

require('./layer-response-message-model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-response-message-view', {
  mixins: [_messageViewMixin2.default],
  style: 'layer-message-viewer.layer-response-message-view {\nflex-grow: 1;\n}\nlayer-response-message-view {\ndisplay: flex;\nflex-direction: row;\njustify-content: center;\n}',
  properties: {

    // widthType is derived from the Response's contentView if there is one
    widthType: {
      get: function get() {
        return this.properties.contentView ? this.properties.contentView.widthType : _constants2.default.WIDTH.FLEX;
      }
    }
  },
  methods: {

    /**
     * After creating this component and setting its model, generate a Message Viewer for its displayable portion.
     *
     * @method onAfterCreate
     */
    onAfterCreate: function onAfterCreate() {
      // Generate the contentView from the displayModel
      if (this.model.displayModel) {
        this.properties.contentView = this.createElement('layer-message-viewer', {
          model: this.model.displayModel,
          parentNode: this,
          cardBorderStyle: 'none'
        });
      }
    }
  }
});