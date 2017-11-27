/**
 * The Start of Conversation which renders some customizable welcome message based on the Conversation
 *
 * TODO: Document this
 *
 * @class layer.UI.components.Age
 * @extends layer.UI.components.Component
 */
import { registerComponent } from '../../component';

registerComponent('layer-start-of-conversation', {
  properties: {

    /**
     * Conversation that we are at the start of.
     *
     * @property {Layer.Core.Conversation}
     */
    conversation: {
      set(value) {
        this.nodes.startDate.date = value ? value.createdAt : null;
      },
    },
  },
});

