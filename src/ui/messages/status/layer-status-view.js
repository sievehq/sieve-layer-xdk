/**
 *
 * @class layer.UI.handlers.message.messageViewer
 * @extends layer.UI.components.Component
 */
import { registerComponent } from '../../components/component';
import MessageViewMixin from '../message-view-mixin';
import Base from '../../base';

registerComponent('layer-status-view', {
  style: `layer-status-view {
    display: block;
  }
  .layer-root-card.layer-status-view > * > .layer-card-top {
    display: block;
  }
  `,
  mixins: [MessageViewMixin],
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    html: {
      set(html) {
        this.innerHTML = html;
      },
    },
    widthType: {
      value: 'chat-bubble',
    },
    messageViewContainerTagName: {
      value: '',
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
      Base.textHandlersOrdered.forEach((handlerDef) => {
        handlerDef.handler(textData, this.message, true);
      });
      this.html = textData.text;
    },
  },
});
