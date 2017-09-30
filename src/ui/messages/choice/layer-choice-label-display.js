/**
 *
 *
 *
 * @class layerUI.handlers.message.ChoiceModel
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';

import MessageDisplayMixin from '../message-display-mixin';
import '../../components/layer-action-button/layer-action-button';

registerComponent('layer-choice-label-display', {
  mixins: [MessageDisplayMixin],
  template: `
    <div layer-id='question' class='layer-choice-display-question'></div>
    <div layer-id='answer' class='layer-choice-display-answer'></div>
  `,
  style: `
  layer-choice-label-display {
    display: flex;
    flex-direction: row;
  }
  layer-choice-label-display .layer-choice-display-answer {
    flex-grow: 1;
  }
  `,
  properties: {
    label: {
      value: 'Choices',
    },
  },
  methods: {
    onRerender() {
      this.nodes.question.innerHTML = this.model.question;
      const selectedChoice = this.model.choices.filter(choice => choice.id === this.model.selectedAnswer)[0];
      this.nodes.answer.innerHTML = selectedChoice ? selectedChoice.text : '';
      this.toggleClass('layer-choice-no-selection', !Boolean(selectedChoice));
    },
  },
});
