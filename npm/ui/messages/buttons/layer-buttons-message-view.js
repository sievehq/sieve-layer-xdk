/**
 * UI for a Buttons Message.
 *
 * ### Importing
 *
 * Included with the standard build. For a custom build, import:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/buttons/layer-buttons-message-view';
 * ```
 *
 * @class Layer.UI.messages.ButtonsView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('../../components/component');

require('../../components/layer-action-button');

require('../../components/layer-choice-button');

var _messageViewMixin = require('../message-view-mixin');

var _messageViewMixin2 = _interopRequireDefault(_messageViewMixin);

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

require('./layer-buttons-message-model');

var _utils = require('../../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-buttons-message-view', {
  template: '<div class="layer-button-content" layer-id="content"></div><div class="layer-button-list" layer-id="buttons"></div>',
  style: 'layer-buttons-message-view {\ndisplay: flex;\nflex-direction: column;\n}\nlayer-buttons-message-view .layer-button-content {\nflex-grow: 1;\ndisplay: flex;\nflex-direction: row;\n}\n.layer-button-list {\ndisplay: flex;\nflex-direction: column;\nalign-items: stretch;\njustify-content: center;\n}',
  mixins: [_messageViewMixin2.default],
  properties: {

    /**
     * Button Message has a widthType that is whatever its child has, or if its just buttons, use Layer.UI.Constants.WIDTH.FLEX.
     *
     * @property {String} [widthType=Layer.UI.Constants.WIDTH.FLEX]
     */
    widthType: {
      get: function get() {
        if (this.properties.contentView && this.properties.contentView.widthType !== _constants2.default.WIDTH.ANY) {
          return this.properties.contentView.widthType;
        } else {
          return _constants2.default.WIDTH.FLEX;
        }
      }
    },

    /**
     * Button Messages use whatever its content view's preferred max width is... or 350.
     *
     * @property {Number} [preferredMaxWidth=350]
     */
    preferredMaxWidth: {
      get: function get() {
        return this.properties.contentView ? this.properties.contentView.nodes.ui.preferredMaxWidth : 350;
      }
    }
  },
  methods: {

    /**
     * After creating the component (Lifecycle method) initialize the sub-model if present.
     *
     * @method onAfterCreate
     */
    onAfterCreate: function onAfterCreate() {
      var _this = this;

      // Either there is a Content Model for this Message in which case genereate a Viewer for it...
      // or flag this Message UI as having no-content
      if (this.model.contentModel) {
        this.properties.contentView = this.createElement('layer-message-viewer', {
          model: this.model.contentModel,
          parentNode: this.nodes.content,
          name: 'subviewer'
        });
      } else {
        this.classList.add('layer-button-card-no-content');
      }

      // For each button (or button-set) in the Button Model's buttons array, add them to the UI
      this.model.buttons.forEach(function (button) {
        var widget = void 0;
        var model = void 0;

        // If any button is actually a set of buttons all on a single row, insure a reasonable minimum width
        // by adding a css class
        if ('choices' in button && button.choices.length > 1) {
          _this.parentComponent.classList.add('layer-button-card-with-choices');
        }

        switch (button.type) {
          // Generate an Action Button with the specified text, tooltip, event and event data
          case 'action':
            widget = _this.createElement('layer-action-button', {
              text: button.text,
              tooltip: button.tooltip,
              event: button.event,
              data: button.data
            });
            break;
          case 'choice':
            // Generate a Choice Button (which will generate a set of its own buttons) and pass it
            // the model representing the Choice.
            model = _this.model.choices[button.data.responseName || 'selection'];
            if (model) {
              widget = _this.createElement('layer-choice-button', {
                model: model
              });
            } else {
              _utils.logger.error('Failed to find a Choice Model to render');
            }
            break;
        }
        _this.nodes.buttons.appendChild(widget);
      });
    },


    /**
     * Any time there is a model change, this lifecycle method is called.
     *
     * In case the change contains an update to the Choice Message Responses,
     * update each Choice Model's Responses object
     *
     * TODO: This looks wrong, the Button Model should update the Choice Models,
     *       and the Choice Models should trigger a change event to rerender the Choice Buttons.
     *       Investigate Further.
     *
     * @method onRerender
     */
    onRerender: function onRerender() {
      for (var i = 0; i < this.nodes.buttons.childNodes.length; i++) {
        var node = this.nodes.buttons.childNodes[i];
        if (node.tagName === 'LAYER-CHOICE-BUTTON') {
          node.model.responses = this.model.responses;
        }
      }
    },


    /**
     * This is called by Layer.UI.handlers.message.MessageViewer._runAction when the user clicks on the Message UI.
     *
     * On clicking the Message UI, either a button has been clicked in which case this method is not called,
     * or else we deliver the click event to the subviewer if it exists, or else tell the
     * MessageViewer's _runAction method to handle it on its own.
     *
     * @param {Object} action
     * @param {String} action.event   Event name
     * @param {Object} action.data    Data to use when processing the event, in addition to the model's data
     */
    runAction: function runAction(action) {
      if (this.nodes.subviewer) {
        this.nodes.subviewer._runAction(action);
        return true;
      }
    }
  }
}); 