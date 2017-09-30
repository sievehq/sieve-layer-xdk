/**
 *
 * @class layerUI.handlers.message.messageViewer
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import MessageDisplayMixin from '../message-display-mixin';
import Base from '../../base';

registerComponent('layer-text-display', {
  style: `layer-text-display {
    display: block;
  }
  .layer-root-card.layer-text-display > * > .layer-card-top {
    display: block;
  }
  `,
  mixins: [MessageDisplayMixin],
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    html: {
      set(html) {
        this.innerHTML = html;
      },
    },
    widthType: {
      get() {
        return this.parentComponent.isShowingMetadata ? 'flex-width' : 'chat-bubble';
      },
    },
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-display-container',
    },
  },
  methods: {
    onAfterCreate() {

    },

    /**
     *
     * @method
     */
    onRender() {

    },

    onRerender() {
      if (this.messageViewer) {
        this.messageViewer.toggleClass(
          'layer-message-as-chat-bubble',
          !this.model.title && !this.model.author
        );
      }
      this._processText();
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
     * Order the Text handlers if they haven't previously been sorted.
     *
     * This is run as a method, but is treated more like a run-once static method.
     *
     * @method
     * @private
     */
    _setupOrderedHandlers() {
      Base.textHandlersOrdered = Object.keys(Base.textHandlers).filter(handlerName =>
        Base.textHandlers[handlerName].enabled)
      .map(handlerName => Base.textHandlers[handlerName])
      .sort((a, b) => {
        if (a.order > b.order) return 1;
        if (b.order > a.order) return -1;
        return 0;
      });
    },

    _processText() {
      if (!Base.textHandlersOrdered) this._setupOrderedHandlers();

      const text = (this.model.text || '').trim();
      const textData = {
        text: this._fixHtml(text),
      };

      // Iterate over each handler, calling each handler.
      // Perform a cheap trick until we can update our API so that
      // css classes can be associated with each item.
      // This is a cheap trick because a TextHandler could arbitrarily edit the `afterText` array,
      // removing previously added elements.  And this code would then break.
      Base.textHandlersOrdered.forEach((handlerDef) => {
        handlerDef.handler(textData, this.message, this.parentComponent && this.parentComponent.tagName === 'LAYER-STANDARD-MESSAGE-CONTAINER');
      });
      this.html = textData.text;
    },
  },
});
