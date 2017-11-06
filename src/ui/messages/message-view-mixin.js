import { registerComponent } from '../components/component';

module.exports = {
  properties: {
    model: {
      set(model, oldModel) {
        if (oldModel) oldModel.off(null, null, this);
        if (model) model.on('change', this.onRerender, this);
      },
    },
    cardBorderStyle: {
    },
    messageViewer: {},
    // One of:
    // "full-width": Uses all available width
    // "chat-bubble": No minimum, maximum is all available width; generallay does not look like a card
    // "flex-width": card that has a minimum and a maximum but tries for an optimal size for its contents
    widthType: {},
    preferredWidth: {
      type: Number,
      value: 350,
    },
    preferredMinWidth: {
      get() {
        return this.properties.preferredMinWidth || 192;
      },
    },
    preferredMaxWidth: {
      get() {
        return this.properties.preferredMaxWidth || 1000;
      },
    },
    isHeightAllocated: {
      value: true,
      set(value) {
        if (value) {
          this.trigger('message-height-change');
        }
      },
    },
  },
  methods: {
    onRender: {
      mode: registerComponent.MODES.AFTER,
      value() {
        this.onRerender();
      },
    },
    onRerender() {
      if (this.messageViewer) {
        this.messageViewer.widthType = this.widthType || 'flex-width';
      }
    },
    generateMessageViewer({ model, parentNode, messageViewContainerTagName, cssClassList, cardBorderStyle }) {
      const child = this.createElement('layer-message-viewer', {
        message: this.model.message,
        rootPart: model.part,
        model,
        parentNode,
        messageViewContainerTagName,
        cssClassList,
        cardBorderStyle,
      });

      return child;
    },
    setupContainerClasses() {
      this.parentComponent.toggleClass('layer-card-no-metadata',
        !this.model.getTitle() && !this.model.getDescription() && !this.model.getFooter());
    },
    onDestroy() {
      delete this.properties.messageViewer;
    },
  },
};
