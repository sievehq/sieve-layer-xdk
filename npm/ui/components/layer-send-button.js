/**
 * The Layer Send button widget provides an alternative to hitting a keyboard `ENTER` key for sending a message.
 *
 * Its assumed that this button will be used within the Layer.UI.components.ComposeBar.
 * If using it elsewhere, note that it triggers a `layer-send-click` event that you would listen for to do your own processing.
 * If using it in the Layer.UI.components.ComposeBar, this event will be received and handled by the Compose Bar.
 *
 * ```
 * document.body.addEventListener('layer-send-click', function(evt) {
 *    var TextModel = Layer.Core.Client.getMessageTypeModelClass('TextModel');
 *    var model = new TextModel({ text: document.getElementById("myinput").value });
 *    model.send({ conversation });
 * });
 * ```
 *
 * A send button is added to a project as follows:
 *
 * ```
 * var myConversationView = document.createElement("layer-send-button");
 * var button = document.createElement("layer-send-button");
 * myConversationView.replaceableContent = {
 *    composerButtonPanelRight: button
 * };
 * ```
 *
 * ### Importing
 *
 * Any of the following will import this component
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-send-button';
 * ```
 *
 * @class Layer.UI.components.SendButton
 * @extends Layer.UI.Component
 * @mixin Layer.UI.mixins.Clickable
 */
'use strict';

var _component = require('./component');

var _clickable = require('../mixins/clickable');

var _clickable2 = _interopRequireDefault(_clickable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-send-button', {
  mixins: [_clickable2.default],
  template: '<i class="fas fa-paper-plane fa-lg"></i>',
  style: 'layer-send-button {\ncursor: pointer;\ndisplay: flex;\nflex-direction: row;\nalign-items: center;\n}\nlayer-send-button div {\ntext-align: center;\n}',
  methods: {
    // Lifecycle method
    onCreate: function onCreate() {
      this.addClickHandler('send-click', this, this.onClick.bind(this));
    },


    /**
     * MIXIN HOOK: Called whenever the button is clicked.
     *
     * ```
     * Layer.init({
     *     mixins: {
     *       'layer-send-button': {
     *         methods: {
     *           onClick() {
     *             console.log("User has clicked send button");
     *           }
     *         }
     *       }
     *     }
     * });
     * ```
     *
     * @method onClick
     * @param {Event} evt
     */
    onClick: function onClick(evt) {

      /**
       * The layer-send-click is triggered whenever this button is clicked.
       *
       * ```
       * document.body.addEventListener('layer-send-click', function(evt) {
       *   console.log("User has clicked send button");
       * });
       * ```
       *
       * @event layer-send-click
       */
      this.trigger('layer-send-click');
    }
  }
});