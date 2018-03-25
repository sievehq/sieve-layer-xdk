/**
 * UI for a Text Message
 *
 * ### Importing
 *
 * Included with the standard build. For custom build, Import with:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/text/layer-text-message-view';
 * ```
 *
 * @class Layer.UI.messages.TextMessageView
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

require('./layer-text-message-model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-text-message-view', {
  style: 'layer-text-message-view {\ndisplay: block;\n}\n.layer-root-viewer.layer-text-message-view > * > .layer-card-top {\ndisplay: block;\n}',
  mixins: [_messageViewMixin2.default],
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    widthType: {
      get: function get() {
        return this.parentComponent.isShowingMetadata ? _constants2.default.WIDTH.FLEX : _constants2.default.WIDTH.ANY;
      }
    },
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-message-view-container'
    }
  },
  methods: {
    onRerender: function onRerender() {
      this.innerHTML = (0, _textHandlers.processText)(this.model.text);
    }
  }
}); 