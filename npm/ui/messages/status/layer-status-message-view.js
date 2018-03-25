/**
 * UI for a Status Message
 *
 * A Status Message is any message rendered as though it does not come from any given user, and instead
 * shown as a centered informational message that doesn't look like a message sent by anyone.
 *
 * ### Importing
 *
 * Not included with the standard build. Import with:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/status/layer-status-message-view';
 * ```
 *
 * @class Layer.UI.messages.StatusMessageView
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

require('./layer-status-message-model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-status-message-view', {
  style: 'layer-status-message-view {\ndisplay: block;\n}\n.layer-root-viewer.layer-status-message-view > * > .layer-card-top {\ndisplay: block;\n}\nlayer-status-message-view p {\ntext-align: center;\n}',
  mixins: [_messageViewMixin2.default],
  properties: {
    widthType: {
      value: _constants2.default.WIDTH.ANY
    },
    messageViewContainerTagName: {
      value: ''
    }
  },
  methods: {
    onRerender: function onRerender() {
      this.innerHTML = (0, _textHandlers.processText)(this.model.text);
    }
  }
}); 