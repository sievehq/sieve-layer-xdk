'use strict';

var _layerUi = require('./layer-ui');

var _layerUi2 = _interopRequireDefault(_layerUi);

require('./adapters/angular');

require('./adapters/backbone');

require('./adapters/react');

var _component = require('./components/component');

var _component2 = _interopRequireDefault(_component);

require('./components/layer-replaceable-content');

require('./components/layer-notifier');

require('./components/layer-conversation-view');

require('./components/layer-conversation-list');

require('./components/layer-identity-list');

require('./components/layer-membership-list');

require('./components/layer-file-upload-button');

require('./components/layer-send-button');

require('./handlers/text/autolinker');

require('./handlers/text/emoji');

require('./handlers/text/newline');

var _dateSeparator = require('./ui-utils/date-separator');

var _dateSeparator2 = _interopRequireDefault(_dateSeparator);

require('./handlers/message/layer-message-viewer');

require('./messages/layer-message-viewer-expanded');

require('./messages/status/layer-status-message-view');

require('./messages/response/layer-response-message-view');

require('./messages/receipt/layer-receipt-message-view');

require('./messages/choice/layer-choice-message-view');

require('./messages/text/layer-text-message-view');

require('./messages/image/layer-image-message-view');

require('./messages/carousel/layer-carousel-message-view');

require('./messages/buttons/layer-buttons-message-view');

require('./messages/file/layer-file-message-view');

require('./messages/link/layer-link-message-view');

require('./messages/location/layer-location-message-view');

require('./messages/product/layer-product-message-view');

require('./messages/feedback/layer-feedback-message-view');

require('./messages/layer-standard-message-view-container');

require('./messages/layer-titled-message-view-container');

require('./messages/layer-dialog-message-view-container');

require('./message-actions/open-expanded-view-action');

require('./message-actions/open-url-action');

require('./message-actions/open-file-action');

require('./message-actions/open-map-action');

var _clickable = require('./mixins/clickable');

var _clickable2 = _interopRequireDefault(_clickable);

var _fileDropTarget = require('./mixins/file-drop-target');

var _fileDropTarget2 = _interopRequireDefault(_fileDropTarget);

var _messageHandler = require('./mixins/message-handler');

var _messageHandler2 = _interopRequireDefault(_messageHandler);

var _hasQuery = require('./mixins/has-query');

var _hasQuery2 = _interopRequireDefault(_hasQuery);

var _list = require('./mixins/list');

var _list2 = _interopRequireDefault(_list);

var _listItem = require('./mixins/list-item');

var _listItem2 = _interopRequireDefault(_listItem);

var _listSelection = require('./mixins/list-selection');

var _listSelection2 = _interopRequireDefault(_listSelection);

var _listItemSelection = require('./mixins/list-item-selection');

var _listItemSelection2 = _interopRequireDefault(_listItemSelection);

var _focusOnKeydown = require('./mixins/focus-on-keydown');

var _focusOnKeydown2 = _interopRequireDefault(_focusOnKeydown);

var _messageViewMixin = require('./messages/message-view-mixin');

var _messageViewMixin2 = _interopRequireDefault(_messageViewMixin);

var _queryEndIndicator = require('./mixins/query-end-indicator');

var _queryEndIndicator2 = _interopRequireDefault(_queryEndIndicator);

var _sizeProperty = require('./mixins/size-property');

var _sizeProperty2 = _interopRequireDefault(_sizeProperty);

var _throttler = require('./mixins/throttler');

var _throttler2 = _interopRequireDefault(_throttler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Standard Card Containers


// Load from components folder
/*
 * This file is used to create a browserified build with the following properties:
 *
 * * Initializes webcomponent-light polyfil
 * * Hooks up all methods/properties in the layerUI namespace
 * * Initializes and registers all widgets of this library
 *
 * Note that you may create your own build that includes:
 *
 * * webcomponent polyfil
 * * Hooks up all methods/properties in the layerUI namespace
 * * Pick and choose modules from the lib folder to include
 *
 * NOTE: JSDuck is picking up on LayerUI and defining it to be a class
 * which we don't want; do not let JSDuck parse this file.
 *
 */

_layerUi2.default.mixins = {
  Clickable: _clickable2.default,
  FileDropTarget: _fileDropTarget2.default,
  MessageHandler: _messageHandler2.default,
  HasQuery: _hasQuery2.default,
  List: _list2.default,
  ListItem: _listItem2.default,
  ListSelection: _listSelection2.default,
  ListItemSelection: _listItemSelection2.default,
  FocusOnKeydown: _focusOnKeydown2.default,
  MessageViewMixin: _messageViewMixin2.default,
  QueryEndIndicator: _queryEndIndicator2.default,
  SizeProperty: _sizeProperty2.default,
  Throttler: _throttler2.default,
  Component: _component2.default
};

// Standard Card Actions


// Load standard cards


// Card Viewers


// Load Adapters

_layerUi2.default.UIUtils.dateSeparator = _dateSeparator2.default;

// If we don't expose global.layerUI then custom templates can not load and call window.Layer.UI.registerTemplate()
module.exports = _layerUi2.default;