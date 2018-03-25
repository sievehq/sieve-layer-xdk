/**
 * The Unknown MessageHandler renders unhandled content with a placeholder politely
 * suggesting that a developer should probably handle it.
 *
 * @class Layer.UI.handlers.message.Unknown
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('../../components/component');

var _messageHandler = require('../../mixins/message-handler');

var _messageHandler2 = _interopRequireDefault(_messageHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-message-unknown', {
  mixins: [_messageHandler2.default],
  methods: {
    /**
     * Render a message that is both polite and mildly annoying.
     *
     * @method
     * @private
     */
    onRender: function onRender() {
      var mimeTypes = this.message.mapParts(function (part) {
        return part.mimeType;
      }).join(', ');
      this.innerHTML = 'Message with MIME Types ' + mimeTypes + ' has been received but has no renderer';
    }
  }
});

// Do not register this handler