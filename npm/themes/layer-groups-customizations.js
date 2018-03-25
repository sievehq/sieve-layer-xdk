import UI from '../ui/layer-ui';
import RCUtils from '../ui/ui-utils/replaceable-content-utils';

function messageHeader(messageWidget) {
  const sender = messageWidget.item.sender;
  const parent = document.createElement('div');

  const name = document.createElement('span');
  name.innerHTML = sender.displayName;
  name.classList.add('layer-sender-name');
  parent.appendChild(name);

  const dateWidget = document.createElement('layer-date');
  dateWidget.setAttribute('layer-id', 'date');
  parent.appendChild(dateWidget);

  return parent;
}

const config = {
  'layer-message-list': {
    properties: {
      replaceableContent: {
        value: {
          messageSentRightSide: RCUtils.statusNode + RCUtils.menuNode,
          messageReceivedRightSide: RCUtils.menuNode,
          messageSentLeftSide: RCUtils.avatarNode,
          messageReceivedLeftSide: RCUtils.avatarNode,
          messageSentHeader: messageHeader,
          messageReceivedHeader: messageHeader,
          messageSentFooter: null,
          messageReceivedFooter: null
        }
      }
    }
  },
  'layer-message-status': {
    properties: {
      deliveredGroupTemplate: {
        value: 'delivered',
      },
      readGroupTemplate: {
        value: 'read',
      }
    }
  },
  'layer-conversation-list': {
    properties: {
      size: {
        value: 'small'
      }
    }
  }
};

UI.setupMixins(config);
