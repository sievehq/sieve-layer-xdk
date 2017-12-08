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

// Load Adapters
import './adapters/angular';
import './adapters/backbone';
import './adapters/react';

// Load Main Components
import './components/conversation-list/layer-conversation-list/layer-conversation-list';
import './components/identity-list/layer-identity-list/layer-identity-list';
import './components/membership-list-panel/layer-membership-list/layer-membership-list';
import './components/layer-conversation-view/layer-conversation-view';
import './components/layer-notifier/layer-notifier';
import './components/layer-presence/layer-presence';


// Load standard utilities
import './components/layer-file-upload-button/layer-file-upload-button';
import './components/layer-send-button/layer-send-button';
import './handlers/message/layer-message-viewer';
import './messages/layer-message-viewer-expanded.js';

import './handlers/text/autolinker';
import './handlers/text/code-blocks';
import './handlers/text/emoji';
import './handlers/text/newline';
import './utils/date-separator';

// Load standard cards

import './messages/status/layer-status-message-model';
import './messages/status/layer-status-message-view';

import './messages/response/layer-response-message-model';
import './messages/response/layer-response-message-view';

import './messages/receipt/layer-receipt-message-model';
import './messages/receipt/layer-receipt-message-view';

import './messages/choice/layer-choice-message-model';
import './messages/choice/layer-choice-message-view';
import './messages/choice/layer-choice-tiles-message-view';
import './messages/choice/layer-choice-label-message-view';


import './messages/layer-standard-message-view-container';
import './messages/layer-titled-message-view-container';
import './messages/layer-dialog-message-view-container';

//import './messages/layer-list-item-container';
import './messages/text/layer-text-message-view';
import './messages/text/layer-text-message-model';

import './messages/image/layer-image-message-model';
import './messages/image/layer-image-message-view';

// import './messages/list/list-model';
// import './messages/list/layer-list-view';

import './messages/carousel/layer-carousel-message-model';
import './messages/carousel/layer-carousel-message-view';

import './messages/buttons/layer-buttons-message-model';
import './messages/buttons/layer-buttons-message-view';

import './messages/file/layer-file-message-model';
import './messages/file/layer-file-message-view';

import './messages/link/layer-link-message-model';
import './messages/link/layer-link-message-view';

import './messages/location/layer-location-message-model';
import './messages/location/layer-location-message-view';

// import './messages/address/address-model';
// import './messages/address/layer-address-view';

import './messages/product/layer-product-message-model';
import './messages/product/layer-product-message-view';

import './messages/models/layer-person-model';
import './messages/models/layer-organization-model';

import './messages/feedback/layer-feedback-message-view';
import './messages/feedback/layer-feedback-message-expanded-view';
import './messages/feedback/layer-feedback-message-model';

import './message-actions/open-expanded-view-action';
import './message-actions/open-url-action';
import './message-actions/open-file-action';
import './message-actions/open-map-action';

import MessageHandler from './mixins/message-handler';
import HasQuery from './mixins/has-query';
import MainComponent from './mixins/main-component';
import List from './mixins/list';
import ListItem from './mixins/list-item';
import ListSelection from './mixins/list-selection';
import ListItemSelection from './mixins/list-item-selection';
import FocusOnKeydown from './mixins/focus-on-keydown';
import MessageViewMixin from './messages/message-view-mixin';

LayerUI.mixins = {
  MessageHandler,
  HasQuery,
  MainComponent,
  List,
  ListItem,
  ListSelection,
  ListItemSelection,
  FocusOnKeydown,
  MessageViewMixin,
};

// If we don't expose global.layerUI then custom templates can not load and call window.layer.UI.registerTemplate()
module.exports = LayerUI;
