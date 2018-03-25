/**
 * This widget renders any message sent by this user within the Message List.
 *
 * ### Importing
 *
 * Included with the standard build. If creating a custom build, import:
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-message-list/layer-message-item-sent';
 * ```
 *
 * @class Layer.UI.components.MessageListPanel.SentItem
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

(0, _component.registerComponent)('layer-message-item-sent', {
  mixins: [_layerMessageItemMixin2.default],
  template: '<div class=\'layer-list-item\' layer-id=\'innerNode\'><layer-replaceable-content class=\'layer-message-header\' name=\'messageSentHeader\'></layer-replaceable-content><div class=\'layer-message-row\' layer-id=\'messageRow\'><layer-replaceable-content\nclass=\'layer-message-left-side\'\nname=\'messageSentLeftSide\'></layer-replaceable-content><div class=\'layer-message-item-main\'><layer-message-viewer layer-id=\'messageViewer\'></layer-message-viewer><div class=\'layer-message-item-content\' layer-id=\'content\'></div></div><layer-replaceable-content\nclass=\'layer-message-right-side\'\nname=\'messageSentRightSide\'></layer-replaceable-content></div><layer-replaceable-content class=\'layer-message-footer\' name=\'messageSentFooter\'></layer-replaceable-content></div>',
  style: 'layer-message-item-sent {\ndisplay: flex;\nflex-direction: column;\nalign-content: stretch;\n}\nlayer-message-item-sent .layer-list-item {\ndisplay: flex;\nflex-direction: column;\nalign-items: stretch;\n}\nlayer-message-item-sent .layer-message-item-main {\ntext-align: right;\nflex-grow: 1;\noverflow: hidden;\nwidth: 100px;\n}\nlayer-message-item-sent .layer-message-item-main .layer-message-item-content {\ndisplay: flex;\nflex-direction: row;\njustify-content: flex-end;\n}\nlayer-message-item-sent .layer-message-right-side > div {\ndisplay: flex;\nflex-direction: row;\nalign-items: center;\n}\nlayer-message-item-sent.layer-message-item-hide-replaceable-content .layer-message-right-side,\nlayer-message-item-sent.layer-message-item-hide-replaceable-content .layer-message-left-side {\ndisplay: none;\n}',
  properties: {
    replaceableContent: {
      value: {
        messageSentRightSide: _replaceableContentUtils2.default.avatarNode + _replaceableContentUtils2.default.menuNode,
        messageSentFooter: _replaceableContentUtils2.default.statusNode + _replaceableContentUtils2.default.dateNode
      }
    }
  }
}); 