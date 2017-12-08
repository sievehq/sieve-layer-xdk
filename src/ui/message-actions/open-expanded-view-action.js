/**
 * Simple action handler for the `layer-open-expanded-view` action.  Opens a dialog showing the model that the action is performed against
 *
 * @class Layer.UI.MessageActions.OpenExpandedView
 */

import { registerMessageActionHandler } from '../base';
import { logger } from '../../util';

const openExpandedView = ({ messageViewer, model }) => {
  const dialog = document.createElement('layer-message-viewer-expanded');
  dialog.model = model;
  let node = messageViewer;
  while (node && node.tagName !== 'BODY' && node.tagName !== 'LAYER-CONVERSATION-VIEW') {
    node = node.parentNode;
  }
  if (node.tagName === 'LAYER-CONVERSATION-VIEW') {
    dialog.parentComponent = node;
  }
  if (node.tagName === 'BODY' || node.tagName === 'LAYER-CONVERSATION-VIEW') {
    node.appendChild(dialog);
  } else {
    logger.error('Unable to find a layer-conversation-view or body containing', messageViewer);
  }
};

registerMessageActionHandler('layer-open-expanded-view', openExpandedView);