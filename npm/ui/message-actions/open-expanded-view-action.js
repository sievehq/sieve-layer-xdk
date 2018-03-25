/**
 * Simple action handler for the `layer-open-expanded-view` action.  Opens a dialog showing the model that the action is performed against
 *
 * @class Layer.UI.MessageActions.OpenExpandedView
 */
'use strict';

var _index = require('./index');

var _utils = require('../../utils');



var openExpandedView = function openExpandedView(_ref) {
  var messageViewer = _ref.messageViewer,
      model = _ref.model,
      data = _ref.data;

  var dialog = document.createElement('layer-message-viewer-expanded');
  dialog.model = model;
  dialog.openActionData = data;
  var node = messageViewer;
  while (node && node.tagName !== 'BODY' && node.tagName !== 'LAYER-CONVERSATION-VIEW') {
    node = node.parentNode;
  }
  if (node.tagName === 'LAYER-CONVERSATION-VIEW') {
    dialog.parentComponent = node;
  }
  if (node.tagName === 'BODY' || node.tagName === 'LAYER-CONVERSATION-VIEW') {
    node.appendChild(dialog);
  } else {
    _utils.logger.error('Unable to find a layer-conversation-view or body containing', messageViewer);
  }
};

(0, _index.register)('layer-open-expanded-view', openExpandedView);