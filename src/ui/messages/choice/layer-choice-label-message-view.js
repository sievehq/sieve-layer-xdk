/**
 * Alternate UI for a Choice Message.
 *
 * This View is used when the model's `type` is `label`.
 *
 * @class Layer.UI.messages.ChoiceLabelMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.components.Component
 */
import { registerComponent } from '../../components/component';

import MessageViewMixin from '../message-view-mixin';
import '../../components/layer-action-button/layer-action-button';

registerComponent('layer-choice-label-message-view', {
  mixins: [MessageViewMixin],
  template: `
    <div layer-id='label' class='layer-choice-message-view-label'></div>
    <div layer-id='choice' class='layer-choice-message-view-choice'></div>
  `,
  style: `
  layer-choice-label-message-view {
    display: flex;
    flex-direction: row;
  }
  layer-choice-label-message-view .layer-choice-message-view-choice {
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
      this.nodes.label.innerHTML = this.model.label;
      const selectedIndex = this.model.getChoiceIndexById(this.model.selectedChoice);

      this.nodes.choice.innerHTML = selectedIndex !== -1 ? this.model.getText(selectedIndex) : '';
      this.toggleClass('layer-choice-no-selection', selectedIndex === -1);
    },
  },
});
