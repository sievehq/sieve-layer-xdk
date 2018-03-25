/**
 * Call this function to initialize all of the Backbone Views needed to handle the Layer UI for Web widgets.
 *
 * Initialize this adapter using:
 *
 * ```javascript
 * import Backbone from 'backbone';
 * import '@layerhq/web-xdk/ui/adapters/backbone';
 * var LayerUIViews = Layer.UI.adapters.backbone(Backbone);
 * var conversationPanelView = new LayerUIViews.ConversationPanel({conversationId: 'layer:///conversations/UUID'});
 * var conversationsListView = new LayerUIViews.ConversationsList();
 * var identitiesListView = new LayerUIViews.UserList();
 * var notifierView = new LayerUIViews.Notifier({notifyInForeground: 'toast'});
 * var sendButton = new LayerUIViews.SendButton();
 * var fileUploadButton = new LayerUIViews.FileUploadButton();
 * ```
 *
 * Calling this will expose the following React Components:
 *
 * * ConversationPanelView: A wrapper around a Layer.UI.components.ConversationView
 * * ConversationsListView: A wrapper around a Layer.UI.components.ConversationListPanel
 * * IdentitiesListView: A wrapper around a Layer.UI.components.IdentityListPanel
 * * NotifierView: A wrapper around a Layer.UI.components.misc.Notifier
 * * SendButton: An optional button that can be provided to ConversationPanelView's `composeButtons` property
 *   to add a simple Send button to the Composer
 * * FileUploadButton: An optional button that can be provided to ConversationPanelView's `composeButtons` property
 *   to add a simple Select and Send File button to the Composer
 *
 *
 * Any occurances of a layer widget in your html should be associated with these views:
 *
 * ```html
 * < !-- Associated with the NotifierView -->
 * < layer-notifier notify-in-foreground="toast"></layer-notifier>
 *
 * < !-- Associated with the ConversationView -->
 * < layer-conversation-view conversation-id="layer:///conversations/UUID"></layer-conversation-view>
 * ```
 *
 * ### Importing
 *
 * Not included with the standard build. To import:
 *
 * ```
 * import '@layerhq/web-xdk/ui/adapters/backbone';
 * ```
 *
 * @class Layer.UI.adapters.backbone
 * @singleton
 * @param {Object} backbone     Pass in the backbone library
 */
'use strict';

var _componentServices = require('../component-services');

var _index = require('./index');


var libraryResult = void 0;
function initBackbone(backbone) {
  if (libraryResult) return libraryResult;
  libraryResult = {};

  // Gather all UI Components
  Object.keys(_componentServices.ComponentsHash).forEach(function (componentName) {
    var component = _componentServices.ComponentsHash[componentName];

    // Get the camel case Component name
    var className = (componentName.substring(0, 1).toUpperCase() + componentName.substring(1).replace(/-(.)/g, function (str, value) {
      return value.toUpperCase();
    })).replace(/^Layer/, '');

    // Define the Backbone View
    var view = libraryResult[className] = backbone.View.extend({
      el: componentName,
      initialize: function initialize(options) {
        var _this = this;

        Object.keys(options || {}).forEach(function (propertyName) {
          _this[propertyName] = options[propertyName];
        });
      }
    });

    // Define getters/setters so that the View acts as though it were the WebComponent it wraps
    component.properties.forEach(function (propertyDef) {
      Object.defineProperty(view.prototype, propertyDef.propertyName, {
        set: function set(value) {
          this.$el[0][propertyDef.propertyName] = value;
        },
        get: function get() {
          return this.$el[0][propertyDef.propertyName];
        }
      });
    });
  });
  return libraryResult;
}

module.exports = initBackbone;
(0, _index.register)('backbone', initBackbone);