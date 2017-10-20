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

registerComponent('layer-choice-view', {
  mixins: [MessageViewMixin],
  template: `
    <div layer-id='question' class='layer-choice-view-question'></div>
    <div layer-id='answers' class='layer-choice-view-answers'></div>
  `,
  style: `
  layer-choice-view .layer-choice-view-answers {
    display: flex;
    flex-direction: column;
  }

  `,
  //layerCardId: 'layer-choice-view',
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
      return 'layer-poll-view-icon';
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
      this.toggleClass('layer-choice-view-complete', this.model.selectedAnswer);

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
