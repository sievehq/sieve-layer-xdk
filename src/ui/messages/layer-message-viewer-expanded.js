/**
 * A dialog for showing a Message Type Model in an expanded full (or near-full) screen view.
 *
 *
 * @class Layer.UI.message.MessageViewerExpanded
 * @extends Layer.UI.components.Component
 */
import { registerComponent } from '../components/component';
import Clickable from '../mixins/clickable';


registerComponent('layer-message-viewer-expanded', {
  mixins: [Clickable],
  style: `layer-message-viewer-expanded {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
    box-sizing: border-box;
  }
  layer-message-viewer-expanded .layer-message-viewer-expanded-inner {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: stretch;
  }
  layer-message-viewer-expanded .layer-message-viewer-expanded-inner > * {
    flex-grow: 1;
  }
  layer-message-viewer-expanded .layer-message-viewer-expanded-inner > layer-titled-display-container > .layer-card-top {
    height: 100%;
  }
  layer-message-viewer-expanded .layer-message-viewer-expanded-inner > layer-titled-display-container > .layer-card-top > * {

  }
  `,
  template: '<div class="layer-message-viewer-expanded-inner" layer-id="inner"></div>',

  properties: {
    model: {},
  },
  methods: {
    onCreate() {
      this.addClickHandler('dialog-click', this, this.onClick.bind(this));
    },
    onAfterCreate() {
      if (this.parentComponent) {
        this.properties.onConversationClose = this.onClose.bind(this);
        this.properties.parentComponentCached = this.parentComponent;
        this.parentComponent.addEventListener('layer-conversation-panel-change', this.properties.onConversationClose);
      }
    },
    onClick(evt) {
      if (evt.target === this) this.onClose();
    },
    onDestroy() {
      if (this.properties.onConversationClose) {
        delete this.properties.parentComponentCached;
        delete this.properties.onConversationClose;
      }
    },
    onClose() {
      this.properties.parentComponentCached.removeEventListener('layer-conversation-panel-change', this.properties.onConversationClose);
      this.destroy();
    },
    onRender() {
      const cardUIType = this.model.currentMessageRendererExpanded;
      this.classList.add(cardUIType);
      if (this.parentComponent && this.parentComponent.isMessageListItem) {
        this.parentComponent.classList.add('layer-message-item-' + cardUIType);
      }
      const cardUI = this.createElement(cardUIType, {
        model: this.model,
        messageViewer: this,
        noCreate: true,
      });
      this.nodes.ui = cardUI;

      const cardContainerClass = this.nodes.ui.messageViewContainerTagName;
      if (cardContainerClass) this.classList.add(cardContainerClass);

      if (cardContainerClass) {
        const cardContainer = this.createElement(cardContainerClass, {
          model: this.model,
          ui: cardUI,
          parentNode: this.nodes.inner,
          name: 'cardContainer',
          isCloseButtonShowing: true,
          noCreate: true, // tells createElement not to call _onAfterCreate just yet
        });
        cardContainer.ui = cardUI;
        cardUI.parentComponent = cardContainer;
      } else {
        this.nodes.inner.appendChild(cardUI);
      }

      CustomElements.takeRecords();
      if (this.nodes.cardContainer) this.nodes.cardContainer._onAfterCreate();
      if (cardUI._onAfterCreate) cardUI._onAfterCreate();
      if (this.nodes.cardContainer) cardUI.setupContainerClasses();
    }
  }
});
