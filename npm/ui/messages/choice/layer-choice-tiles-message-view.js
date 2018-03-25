/**
 * The Choice Message is used to present users with choices to pick from.
 *
 * A basic Choice Message can be created with:
 *
 * ```
 * ChoiceMessage = Layer.Core.Client.getMessageTypeModelClass('ChoiceMessage')
 * model = new ChoiceMessage({
 *    label: "What do you want?",
 *    choices: [
 *       {text:  "Scrambled Eggs", id: "product_id_1836"},
 *       {text:  "Coffee", id: "product_id_8746"},
 *       {text:  "More sleep", id: "product_id_0"},
 *   ],
 * });
 * model.send({ conversation });
 * ```
 *
 * @class Layer.UI.messages.ChoiceMessageModel
 * @extends Layer.Core.MessageTypeModel
 */
'use strict';

var _component = require('../../components/component');

var _messageViewMixin = require('../message-view-mixin');

var _messageViewMixin2 = _interopRequireDefault(_messageViewMixin);

require('../../components/layer-action-button');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-choice-tiles-message-view', {
  mixins: [_messageViewMixin2.default],
  template: '<div layer-id=\'question\' class=\'layer-choice-message-view-question\'></div><div layer-id=\'answers\' class=\'layer-choice-message-view-answers\'></div>',
  style: 'layer-choice-tiles-message-view {\ndisplay: block;\n}\nlayer-choice-tiles-message-view .layer-choice-message-view-answers {\n}',
  properties: {
    label: {
      value: 'Choices'
    }
  },
  methods: {
    onAfterCreate: function onAfterCreate() {
      var _this = this;

      this.nodes.question.innerHTML = this.model.question;
      this.model.choices.forEach(function (choice) {
        _this.createElement('layer-action-button', {
          text: choice.text,
          event: 'layer-choice-select',
          data: { id: choice.id },
          parentNode: _this.nodes.answers
        });
      });
    },
    onRerender: function onRerender() {
      if (!this.model.allowReselect) {
        this.toggleClass('layer-choice-message-view-complete', this.model.selectedAnswer);
      }

      if (this.model.selectedAnswer) {
        for (var i = 0; i < this.nodes.options.childNodes.length; i++) {
          var child = this.nodes.options.childNodes[i];
          child.disabled = !this.model.allowReselect || this.model.selectedAnswer === child.data.id;
          child.selected = this.model.selectedAnswer === child.data.id;
        }
      }
    },
    _selectChoice: function _selectChoice(data) {
      this.model.selectAnswer(data);
    },
    runAction: function runAction(_ref) {
      var event = _ref.event,
          data = _ref.data;

      if (event === 'layer-choice-select') {
        this._selectChoice(data);
      }
    }
  }
}); 