/**
 * Alternate UI for a Choice Message.
 *
 * This View is used when the model's `type` is `label`.
 *
 * ### Importing
 *
 * Not included with the standard build. Import using either:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/choice/layer-choice-message-view';
 * import '@layerhq/web-xdk/ui/messages/choice/layer-choice-label-message-view';
 * ```
 *
 * @class Layer.UI.messages.ChoiceLabelMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('../../components/component');

var _messageViewMixin = require('../message-view-mixin');

var _messageViewMixin2 = _interopRequireDefault(_messageViewMixin);

require('../../components/layer-action-button');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-choice-label-message-view', {
  mixins: [_messageViewMixin2.default],
  template: '<div layer-id=\'label\' class=\'layer-choice-message-view-label\'></div><div layer-id=\'choice\' class=\'layer-choice-message-view-choice\'></div>',
  style: 'layer-choice-label-message-view {\ndisplay: flex;\nflex-direction: row;\n}\nlayer-choice-label-message-view .layer-choice-message-view-choice {\nflex-grow: 1;\n}',
  methods: {

    /**
     * Whenever this view is initialized or the view updated, rerender it.
     *
     * @method onRerender
     */
    onRerender: function onRerender() {
      this.nodes.label.innerHTML = this.model.label;
      var choice = this.model.selectedChoice;
      this.nodes.choice.innerHTML = choice ? choice.text : '';
      this.toggleClass('layer-choice-no-selection', !choice);
    }
  }
}); 