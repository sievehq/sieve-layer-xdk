/**
 * Simple action handler for the `open-file` action.  It accepts either a `url` or `source_url` from
 * the data provided by either a Message Model's `actionData` (if event is triggered by selecting the Message)
 * or by an Action Button's `data` property (if the event is triggered by selecting the button).
 * Failing to find either of those, it will look at the Message Model's `getSourceUrl` method
 * or the selected model, and calls the MessageViewer `showFullScreen` method
 *
 * @class Layer.UI.MessageActions.OpenFileAction
 */
'use strict';

var _index = require('./index');

var _uiUtils = require('../ui-utils');

var _utils = require('../../utils');

var openFileHandler = function openFileHandler(_ref) {
  var data = _ref.data,
      model = _ref.model;

  if (data.url || data.source_url) {
    (0, _uiUtils.showFullScreen)(data.url || data.source_url);
  } else if (model.getSourceUrl) {
    model.getSourceUrl(function (url) {
      return (0, _uiUtils.showFullScreen)(url);
    });
  } else {
    _utils.logger.error('No getSourceUrl method for the "open-file" Message Action for model ', model);
  }
}; 

(0, _index.register)('open-file', openFileHandler);