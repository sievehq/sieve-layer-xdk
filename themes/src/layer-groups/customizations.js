var config = {
  'layer-message-list': {
    properties: {
      replaceableContent: {
        value: {
          messageRowRightSide: function() {
            var menu = document.createElement('layer-menu-button');
            return menu;
          },
          messageRowLeftSide: function() {
            var avatar = document.createElement('layer-avatar');
            avatar.setAttribute('layer-id', 'avatar');
            avatar.size = 'small';
            return avatar;
          },

          messageRowHeader: function(messageWidget) {
            var sender = messageWidget.item.sender;
            var parent = document.createElement('div');

            var name = document.createElement('span');
            name.innerHTML = sender.displayName;
            name.classList.add('layer-sender-name');
            parent.appendChild(name);

            var dateWidget = document.createElement('layer-date');
            dateWidget.setAttribute('layer-id', 'date');
            parent.appendChild(dateWidget);

            return parent;
          },
          messageRowFooter: function(messageWidget) {
            var status = document.createElement('layer-message-status');
            status.setAttribute('layer-id', 'status');
            return status;
          },
        }
      }
    }
  }
};
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
} else if (typeof layerUI !== 'undefined') {
  layerUI.setupMixins(config);
} else {
  window.layerUIConfig = config;
  console.log('Customization.js results stashed in window.layerUIConfig but you must apply it using layerUI.setupMixins(layerUIConfig)');
}