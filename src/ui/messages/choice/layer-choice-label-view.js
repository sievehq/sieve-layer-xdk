/**
 *
 *
 *
 * @class layer.UI.handlers.message.ChoiceModel
 * @extends layer.UI.components.Component
 */
import { registerComponent } from '../../components/component';

import MessageViewMixin from '../message-view-mixin';
import '../../components/layer-action-button/layer-action-button';

registerComponent('layer-choice-label-view', {
  mixins: [MessageViewMixin],
  template: `
    <div layer-id='question' class='layer-choice-view-question'></div>
    <div layer-id='answer' class='layer-choice-view-answer'></div>
  `,
  style: `
  layer-choice-label-view {
    display: flex;
    flex-direction: row;
  }
  layer-choice-label-view .layer-choice-view-answer {
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
