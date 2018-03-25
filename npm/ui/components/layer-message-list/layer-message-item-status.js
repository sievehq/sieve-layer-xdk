/**
 * This widget renders any status message  within the Message List.
 *
 * Status Messages are rendered as centered text without any "sender name", avatar, timestamp or status.
 *
 * A message is registered to be rendered as a Status Message using:
 *
 * ```
 * Layer.UI.statusMimeTypes.push(myMIMEType);
 * ```
 *
 * That MIME Type must correspond with the Root Message Part in your Message.
 *
 * ### Importing
 *
 * Included with the standard build. If creating a custom build, import:
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-message-list/layer-message-item-status';
 * ```
 *
 * @class Layer.UI.components.MessageListPanel.StatusItem
 * @extends Layer.UI.Component
 * @mixin Layer.UI.components.MessageListPanel.Item
 */
'use strict';

var _component = require('../component');

var _layerMessageItemMixin = require('./layer-message-item-mixin');

var _layerMessageItemMixin2 = _interopRequireDefault(_layerMessageItemMixin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-message-item-status', {
  mixins: [_layerMessageItemMixin2.default],
  template: '<div class=\'layer-list-item\' layer-id=\'innerNode\'><layer-replaceable-content class=\'layer-message-header\' name=\'messageStatusHeader\'></layer-replaceable-content><div class=\'layer-message-row\' layer-id=\'messageRow\'><layer-replaceable-content class=\'layer-message-left-side\' name=\'messageStatusLeftSide\'></layer-replaceable-content><div class=\'layer-message-item-main\'><layer-message-viewer layer-id=\'messageViewer\'></layer-message-viewer></div><layer-replaceable-content\nclass=\'layer-message-right-side\'\nname=\'messageStatusRightSide\'></layer-replaceable-content></div><layer-replaceable-content class=\'layer-message-footer\' name=\'messageStatusFooter\'></layer-replaceable-content></div>',
  style: 'layer-message-item-status {\ndisplay: flex;\nflex-direction: column;\nalign-content: stretch;\n}\nlayer-message-item-status .layer-list-item {\ndisplay: flex;\nflex-direction: row;\nalign-items: stretch;\n}\nlayer-message-item-status  .layer-message-item-main {\noverflow: hidden;\ntext-align: center;\n}\nlayer-message-item-status .layer-message-item-main {\nflex-grow: 1;\nwidth: 100px;\n}\nlayer-message-item-status.layer-message-item-hide-replaceable-content .layer-message-right-side,\nlayer-message-item-status.layer-message-item-hide-replaceable-content .layer-message-left-side {\ndisplay: none;\n}'
});