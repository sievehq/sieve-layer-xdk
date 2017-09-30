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

registerComponent('layer-choice-tiles-display', {
  mixins: [MessageDisplayMixin],
  template: `
    <div layer-id='question' class='layer-choice-display-question'></div>
    <div layer-id='answers' class='layer-choice-display-answers'></div>
  `,
  style: `
  layer-choice-tiles-display {
    display: block;
  }
  layer-choice-tiles-display .layer-choice-display-answers {

  }
  `,
  properties: {
    label: {
      value: 'Choices',
    },
  },
  methods: {

    onAfterCreate() {
      this.nodes.question.innerHTML = this.model.question;
      this.model.choices.forEach((choice) => {
        const button = this.createElement('layer-action-button', {
          text: choice.text,
          event: 'layer-choice-select',
          data: { id: choice.id },
          parentNode: this.nodes.answers,
        });
      });
    },

    onRerender() {
      this.toggleClass('layer-choice-display-complete', this.model.selectedAnswer);
      if (this.model.selectedAnswer) {
        for (let i = 0; i < this.nodes.options.childNodes.length; i++) {
          const child = this.nodes.options.childNodes[i];
          child.disabled = !this.model.allowReselect || this.model.selectedAnswer === child.data.id;
          child.selected = this.model.selectedAnswer === child.data.id;
        }
      }
    },

    onChoiceSelect(data) {
      this.model.selectAnswer(data);
    },

    runAction({ event, data }) {
      if (event === 'layer-choice-select') {
        this.onChoiceSelect(data);
      }
    },
  },
});
