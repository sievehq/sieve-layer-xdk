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

registerComponent('layer-choice-display', {
  mixins: [MessageDisplayMixin],
  template: `
    <div layer-id='question' class='layer-choice-display-question'></div>
    <div layer-id='answers' class='layer-choice-display-answers'></div>
  `,
  style: `
  layer-choice-display .layer-choice-display-answers {
    display: flex;
    flex-direction: column;
  }

  `,
  //layerCardId: 'layer-choice-display',
  properties: {
    label: {
      value: 'Choices',
    },
    messageContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-titled-message-container',
    },
    widthType: {
      value: 'flex-width',
    },
  },
  methods: {

    getIconClass() {
      return 'layer-poll-card-icon';
    },
    getTitle() {
      return this.model.title;
    },

    onAfterCreate() {
      this.nodes.question.innerHTML = this.model.question;
      this.model.choices.forEach((choice) => {
        this.createElement('layer-action-button', {
          text: choice.text,
          event: 'layer-choice-select',
          data: { id: choice.id },
          icon: choice.icon,
          parentNode: this.nodes.answers,
        });
      });
    },

    onRerender() {
      this.toggleClass('layer-choice-display-complete', this.model.selectedAnswer);

      this.model.choices.forEach((choice, index) => {
        const button = this.nodes.answers.childNodes[index];
        button.text = this.model.getText(index);
        button.selected = this.model.isSelectedIndex(index);
        if (this.model.selectedAnswer && !this.model.allowReselect || !this.model.allowDeselect && button.selected) {
          button.disabled = true;
        } else {
          button.disabled = false;
        }
      });
    },

    onChoiceSelect(data) {
      this.model.selectAnswer(data);
    },

    runAction({ event, data }) {
      if (event === 'layer-choice-select') {
        this.onChoiceSelect(data);

        const rootPart = this.model.message.getPartsMatchingAttribute({ role: 'root' })[0];
        const rootModel = this.client.getMessageTypeModel(rootPart.id);
        this.trigger(this.model.responseName, {
          model: this.model,
          data: this.model,
          rootModel,
        });
      }
    },
  },
});
