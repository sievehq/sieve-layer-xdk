/**
 * The Layer Plain Text MessageHandler renders a single text/plain message part.
 *
 * See layerUI.registerTextHandler for details on adding new text processing capabilities.
 *
 * @class layerUI.handlers.message.TextPlain
 * @extends layerUI.components.Component
 */
import { registerMessageComponent } from '../../components/component';
import MessageHandler from '../../mixins/message-handler';
import LayerUI from '../../base';

registerMessageComponent('layer-message-text-plain', {
  // Note: This template is for use within a MessageItem in a MessageList, else its blown away by the message text
  // which if burried so deeply in the dom, becomes problematic to render inline with other elements such as `conversation.lastMessage` to the right of
  // conversation name.  Use of this template in a Message Item allows us to have afterText nodes that contain additional content
  // but which is not inside of the text bubble
  template: '<div class="layer-message-text" layer-id="text"></div>',
  mixins: [MessageHandler],
  properties: {
    label: {
      label: 'Text',
    },
    html: {
      set(html) {
        if (this.parentComponent.isMessageListItem) {
          this.nodes.text.innerHTML = html;
        } else {
          this.innerHTML = html;
        }
      },
    },
  },
  methods: {
    /**
     * This component can render any message that starts with text/plain message part
     *
     * @method
     */
    handlesMessage(message, container) {
      return message.parts[0].mimeType === 'text/plain';
    },

    /**
     * Replaces any html tags with escaped html tags so that the recipient
     * sees tags rather than rendered html.
     *
     * @method
     * @private
     */
    _fixHtml(body) {
      body = body.replace(/</g, '&lt;');
      body = body.replace(/>/g, '&gt;');
      return body;
    },

    /**
     * Format the text and render it.
     *
     * Iterates over all Text Handlers allowing each to modify the `text` property, as well as to append values to `afterText`
     *
     * Renders the results after all TextHandlers have run.
     *
     * @method
     */
    onRender() {
      if (!LayerUI.textHandlersOrdered) this._setupOrderedHandlers();

      const text = this.message.parts[0].body;
      const textData = {
        text: this._fixHtml(text),
        afterText: [],
        afterClasses: [],
      };

      // Iterate over each handler, calling each handler.
      // Perform a cheap trick until we can update our API so that
      // css classes can be associated with each item.
      // This is a cheap trick because a TextHandler could arbitrarily edit the `afterText` array,
      // removing previously added elements.  And this code would then break.
      LayerUI.textHandlersOrdered.forEach((handlerDef) => {
        const afterText = textData.afterText.concat([]);
        handlerDef.handler(textData, this.message, Boolean(this.parentComponent && this.parentComponent.isMessageListItem));
        const last = textData.afterText[textData.afterText.length - 1];
        if (afterText.indexOf(last) === -1) {
          textData.afterClasses[textData.afterText.length - 1] = 'layer-message-text-plain-' + handlerDef.name;
        }
      });
      this.html = textData.text;

      if (textData.afterText.length && this.parentComponent && this.parentComponent.isMessageListItem) {
        textData.afterText.forEach((textItem, i) => {
          const div = document.createElement('div');
          div.classList.add('layer-message-text-plain-after-text');
          div.classList.add(textData.afterClasses[i]);
          div.innerHTML = textItem;
          if (div.firstChild.properties) div.firstChild.properties.parentComponent = this;
          this.appendChild(div);
        });
      }
    },

    /**
     * Order the Text handlers if they haven't previously been sorted.
     *
     * This is run as a method, but is treated more like a run-once static method.
     *
     * @method
     * @private
     */
    _setupOrderedHandlers() {
      LayerUI.textHandlersOrdered = Object.keys(LayerUI.textHandlers).filter(handlerName =>
        LayerUI.textHandlers[handlerName].enabled)
      .map(handlerName => LayerUI.textHandlers[handlerName])
      .sort((a, b) => {
        if (a.order > b.order) return 1;
        if (b.order > a.order) return -1;
        return 0;
      });
    },

    /**
     * Rerender any message that was rendered as a preview and is now no longer a preview.
     *
     * @method onSent
     */
    onSent() {
      this.onRender();
    },
  },
});
