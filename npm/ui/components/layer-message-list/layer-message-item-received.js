/**
 * This widget renders any message received by this user within the Message List.
 *
 * ### Importing
 *
 * Included with the standard build. If creating a custom build, import:
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-message-list/layer-message-item-received';
 * ```
 *
 * @class Layer.UI.components.MessageListPanel.ReceivedItem
 * @extends Layer.UI.Component
 * @mixin Layer.UI.components.MessageListPanel.Item
 */
'use strict';

var _component = require('../component');

var _layerMessageItemMixin = require('./layer-message-item-mixin');

var _layerMessageItemMixin2 = _interopRequireDefault(_layerMessageItemMixin);

var _replaceableContentUtils = require('../../ui-utils/replaceable-content-utils');

var _replaceableContentUtils2 = _interopRequireDefault(_replaceableContentUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-message-item-received', {
  mixins: [_layerMessageItemMixin2.default],
  template: '<div class=\'layer-list-item\' layer-id=\'innerNode\'><layer-replaceable-content class=\'layer-message-header\' name=\'messageReceivedHeader\'></layer-replaceable-content><div class=\'layer-message-row\' layer-id=\'messageRow\'><layer-replaceable-content\nclass=\'layer-message-left-side\'\nname=\'messageReceivedLeftSide\'></layer-replaceable-content><div class=\'layer-message-item-main\'><layer-message-viewer layer-id=\'messageViewer\'></layer-message-viewer><div class=\'layer-message-item-content\' layer-id=\'content\'></div></div><layer-replaceable-content\nclass=\'layer-message-right-side\'\nname=\'messageReceivedRightSide\'></layer-replaceable-content></div><layer-replaceable-content class=\'layer-message-footer\' name=\'messageReceivedFooter\'></layer-replaceable-content></div>',
  style: 'layer-message-item-received {\ndisplay: flex;\nflex-direction: column;\nalign-content: stretch;\n}\nlayer-message-item-received .layer-list-item {\ndisplay: flex;\nflex-direction: column;\nalign-content: stretch;\n}\nlayer-message-item-received  .layer-message-item-main {\nflex-grow: 1;\noverflow: hidden;\nwidth: 100px;\n}\nlayer-message-item-received layer-message-text-plain {\ndisplay: block;\n}\nlayer-message-item-received.layer-message-item-hide-replaceable-content .layer-message-right-side,\nlayer-message-item-received.layer-message-item-hide-replaceable-content .layer-message-left-side {\ndisplay: none;\n}',
  properties: {
    replaceableContent: {
      value: {
        messageReceivedLeftSide: _replaceableContentUtils2.default.avatarNode,
        messageReceivedRightSide: _replaceableContentUtils2.default.menuNode,
        messageReceivedFooter: _replaceableContentUtils2.default.dateNode,
        messageReceivedHeader: _replaceableContentUtils2.default.senderNode
      }
    }
  }
}); 