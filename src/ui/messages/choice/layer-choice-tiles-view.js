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

registerComponent('layer-choice-tiles-view', {
  mixins: [MessageViewMixin],
  template: `
    <div layer-id='question' class='layer-choice-view-question'></div>
    <div layer-id='answers' class='layer-choice-view-answers'></div>
  `,
  style: `
  layer-choice-tiles-view {
    display: block;
  }
  layer-choice-tiles-view .layer-choice-view-answers {

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
      this.toggleClass('layer-choice-view-complete', this.model.selectedAnswer);
      if (this.model.selectedAnswer) {
        for (let i = 0; i < this.nodes.options.childNodes.length; i++) {
          const child = this.nodes.options.childNodes[i];
          child.disabled = !this.model.allowReselect || this.model.selectedAnswer === child.data.id;
          child.selected = this.model.selectedAnswer === child.data.id;
        }
      }
    },

    _selectChoice(data) {
      this.model.selectAnswer(data);
    },

    runAction({ event, data }) {
      if (event === 'layer-choice-select') {
        this._selectChoice(data);
      }
    },
  },
});
