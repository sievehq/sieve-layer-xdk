import layerUI from '../base';

/**
 * Call this function to initialize all of the Backbone Views needed to handle the Layer UI for Web widgets.
 *
 * Initialize this adapter using:
 *
 * ```javascript
 * var Backbone = require('backbone');
 * var LayerUIViews = layerUI.adapters.backbone(Backbone);
 * var conversationPanelView = new LayerUIViews.ConversationPanel(client, {conversationId: 'layer:///conversations/UUID'});
 * var conversationsListView = new LayerUIViews.ConversationsList(client);
 * var identitiesListView = new LayerUIViews.UserList(client);
 * var notifierView = new LayerUIViews.Notifier(client, {notifyInForeground: 'toast'});
 * var sendButton = new LayerUIViews.SendButton(client);
 * var fileUploadButton = new LayerUIViews.FileUploadButton(client);
 * ```
 *
* Calling this will expose the following React Components:
 *
 * * ConversationPanelView: A wrapper around a layerUI.components.ConversationPanel
 * * ConversationsListView: A wrapper around a layerUI.components.ConversationsListPanel
 * * IdentitiesListView: A wrapper around a layerUI.components.IdentitiesListPanel
 * * NotifierView: A wrapper around a layerUI.components.misc.Notifier
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
 * @class layerUI.adapters.backbone
 * @singleton
 * @param {Object} backbone     Pass in the backbone library
 */
let libraryResult;
function initBackbone(backbone) {
  if (libraryResult) return libraryResult;
  libraryResult = {};

  // Gather all UI Components
  Object.keys(layerUI.components)
  .forEach((componentName) => {
    const component = layerUI.components[componentName];

    // Get the camel case Component name
    const className = (componentName.substring(0, 1).toUpperCase() +
      componentName.substring(1).replace(/-(.)/g, (str, value) => value.toUpperCase())
    ).replace(/^Layer/, '');

    // Define the Backbone View
    const view = libraryResult[className] = backbone.View.extend({
      el: componentName,
      initialize: function initialize(client, options) {
        this.client = client;
        Object.keys(options || {}).forEach((propertyName) => {
          this[propertyName] = options[propertyName];
        });
      },
    });

    // Define getters/setters so that the View acts as though it were the WebComponent it wraps
    component.properties.forEach((propertyDef) => {
      Object.defineProperty(view.prototype, propertyDef.propertyName, {
        set(value) {
          this.$el[0][propertyDef.propertyName] = value;
        },
        get() {
          return this.$el[0][propertyDef.propertyName];
        },
      });
    });
  });
  return libraryResult;
}

module.exports = initBackbone;
layerUI.addAdapter('backbone', initBackbone);

