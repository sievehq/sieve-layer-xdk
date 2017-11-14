/**
 * Alternate UI for a Choice Message.
 *
 * This View is used when the model's `type` is `label`.
 *
 * @class Layer.UI.messages.ChoiceLabelView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.components.Component
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
  methods: {

    /**
     * Whenever this view is initialized or the view updated, rerender it.
     *
     * @method onRerender
     */
    onRerender() {
      this.nodes.question.innerHTML = this.model.question;
      const selectedIndex = this.model.getChoiceIndexById(this.model.selectedAnswer);

      this.nodes.answer.innerHTML = selectedIndex !== -1 ? this.model.getText(selectedIndex) : '';
      this.toggleClass('layer-choice-no-selection', selectedIndex === -1);
    },
  },
});
