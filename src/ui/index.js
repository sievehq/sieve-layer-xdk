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

import LayerUI from './layer-ui';

// Load Required Components
import Component from './components/component';
import './components/layer-replaceable-content';
import './components/layer-conversation-view';


import './handlers/text/autolinker';
import './handlers/text/emoji';
import './handlers/text/newline';
import dateSeparator from './ui-utils/date-separator';

// Card Viewers
import './handlers/message/layer-message-viewer';
import './messages/layer-message-viewer-expanded';

// Load standard cards
import './messages/status/layer-status-message-view';
import './messages/response/layer-response-message-view';
import './messages/text/layer-text-message-view';
import './messages/link/layer-link-message-view';
import './messages/image/layer-image-message-view';
import './messages/buttons/layer-buttons-message-view';

// Load standard card containers
import './messages/layer-standard-message-view-container';
import './messages/layer-titled-message-view-container';
import './messages/layer-dialog-message-view-container';

// Load standard card actions
import './message-actions/open-expanded-view-action';
import './message-actions/open-url-action';
import './message-actions/open-file-action';
import './message-actions/open-map-action';

import Clickable from './mixins/clickable';
import FileDropTarget from './mixins/file-drop-target';
import MessageHandler from './mixins/message-handler';
import HasQuery from './mixins/has-query';
import List from './mixins/list';
import ListItem from './mixins/list-item';
import ListSelection from './mixins/list-selection';
import ListItemSelection from './mixins/list-item-selection';
import FocusOnKeydown from './mixins/focus-on-keydown';
import MessageViewMixin from './messages/message-view-mixin';
import QueryEndIndicator from './mixins/query-end-indicator';
import SizeProperty from './mixins/size-property';
import Throttler from './mixins/throttler';

LayerUI.mixins = {
  Clickable,
  FileDropTarget,
  MessageHandler,
  HasQuery,
  List,
  ListItem,
  ListSelection,
  ListItemSelection,
  FocusOnKeydown,
  MessageViewMixin,
  QueryEndIndicator,
  SizeProperty,
  Throttler,
  Component,
};
LayerUI.UIUtils.dateSeparator = dateSeparator;

// If we don't expose global.layerUI then custom templates can not load and call window.Layer.UI.registerTemplate()
module.exports = LayerUI;
