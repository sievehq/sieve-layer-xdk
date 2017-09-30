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

var LayerUI = require('./layer-ui');

// Load Adapters
require('./adapters/angular');
require('./adapters/backbone');
require('./adapters/react');

// Load Main Components
require('./components/conversation-list/layer-conversation-list/layer-conversation-list');
require('./components/identity-list/layer-identity-list/layer-identity-list');
require('./components/membership-list-panel/layer-membership-list/layer-membership-list');
require('./components/layer-conversation-view/layer-conversation-view');
require('./components/layer-notifier/layer-notifier');
require('./components/layer-presence/layer-presence');


// Load standard utilities
require('./components/layer-file-upload-button/layer-file-upload-button');
require('./components/layer-send-button/layer-send-button');
require('./handlers/message/layer-message-viewer');
//require('./handlers/message/layer-message-text-plain');
require('./handlers/message/layer-message-image/layer-message-image');
require('./handlers/message/layer-message-video');
require('./handlers/text/autolinker');
require('./handlers/text/code-blocks');
require('./handlers/text/emoji');
require('./handlers/text/images');
require('./handlers/text/newline');
require('./handlers/text/youtube');
require('./utils/date-separator');

// Load standard cards
require('./messages/text/layer-text-model');
require('./messages/text/layer-text-display');

require('./messages/response/layer-response-model');
require('./messages/response/layer-response-display');

require('./messages/receipt/layer-receipt-model');
require('./messages/receipt/layer-receipt-display');

require('./messages/choice/layer-choice-model');
require('./messages/choice/layer-choice-display');
require('./messages/choice/layer-choice-tiles-display');
require('./messages/choice/layer-choice-label-display');


require('./messages/layer-standard-display-container');
require('./messages/layer-titled-display-container');
//require('./messages/layer-list-item-container');
require('./messages/text/layer-text-display');
require('./messages/text/layer-text-model');

require('./messages/image/layer-image-model');
require('./messages/image/layer-image-display');

// require('./messages/list/list-model');
// require('./messages/list/layer-list-display');

require('./messages/carousel/layer-carousel-model');
require('./messages/carousel/layer-carousel-display');

require('./messages/buttons/layer-buttons-model');
require('./messages/buttons/layer-buttons-display');

require('./messages/file/layer-file-model');
require('./messages/file/layer-file-display');

require('./messages/link/layer-link-model');
require('./messages/link/layer-link-display');

require('./messages/location/layer-location-model');
require('./messages/location/layer-location-display');

// require('./messages/address/address-model');
// require('./messages/address/layer-address-display');

require('./messages/product/layer-product-model');
require('./messages/product/layer-product-display');

require('./messages/models/layer-person-model');
require('./messages/models/layer-organization-model');

LayerUI.animatedScrollTo = require('./utils/animated-scroll').animatedScrollTo;
LayerUI.animatedScrollLeftTo = require('./utils/animated-scroll').animatedScrollLeftTo;

LayerUI.mixins = {
  MessageHandler: require('./mixins/message-handler'),
  HasQuery: require('./mixins/has-query'),
  MainComponent: require('./mixins/main-component'),
  List: require('./mixins/list'),
  ListItem: require('./mixins/list-item'),
  ListSelection: require('./mixins/list-selection'),
  ListItemSelection: require('./mixins/list-item-selection'),
  FocusOnKeydown: require('./mixins/focus-on-keydown'),
  MessageDisplayMixin: require('./messages/message-display-mixin'),
};

// If we don't expose global.layerUI then custom templates can not load and call window.layerUI.registerTemplate()
module.exports = LayerUI;
