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
import './handlers/message/layer-message-video';
import './handlers/text/autolinker';
import './handlers/text/code-blocks';
import './handlers/text/emoji';
import './handlers/text/images';
import './handlers/text/newline';
import './handlers/text/youtube';
import './utils/date-separator';

// Load standard cards
import './messages/text/layer-text-model';
import './messages/text/layer-text-view';

import './messages/status/layer-status-model';
import './messages/status/layer-status-view';

import './messages/response/layer-response-model';
import './messages/response/layer-response-view';

import './messages/receipt/layer-receipt-model';
import './messages/receipt/layer-receipt-view';

import './messages/choice/layer-choice-model';
import './messages/choice/layer-choice-view';
import './messages/choice/layer-choice-tiles-view';
import './messages/choice/layer-choice-label-view';


import './messages/layer-standard-display-container';
import './messages/layer-titled-display-container';
//import './messages/layer-list-item-container';
import './messages/text/layer-text-view';
import './messages/text/layer-text-model';

import './messages/image/layer-image-model';
import './messages/image/layer-image-view';

// import './messages/list/list-model';
// import './messages/list/layer-list-view';

import './messages/carousel/layer-carousel-model';
import './messages/carousel/layer-carousel-view';

import './messages/buttons/layer-buttons-model';
import './messages/buttons/layer-buttons-view';

import './messages/file/layer-file-model';
import './messages/file/layer-file-view';

import './messages/link/layer-link-model';
import './messages/link/layer-link-view';

import './messages/location/layer-location-model';
import './messages/location/layer-location-view';

// import './messages/address/address-model';
// import './messages/address/layer-address-view';

import './messages/product/layer-product-model';
import './messages/product/layer-product-view';

import './messages/models/layer-person-model';
import './messages/models/layer-organization-model';

import './messages/message-type-list/message-type-list-view';
import './messages/message-type-list/message-type-list-model';

import { animatedScrollTo, animatedScrollLeftTo } from './utils/animated-scroll';
import MessageHandler from './mixins/message-handler';
import HasQuery from './mixins/has-query';
import MainComponent from './mixins/main-component';
import List from './mixins/list';
import ListItem from './mixins/list-item';
import ListSelection from './mixins/list-selection';
import ListItemSelection from './mixins/list-item-selection';
import FocusOnKeydown from './mixins/focus-on-keydown';
import MessageViewMixin from './messages/message-view-mixin';


LayerUI.animatedScrollTo = animatedScrollTo;
LayerUI.animatedScrollLeftTo = animatedScrollLeftTo;

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
