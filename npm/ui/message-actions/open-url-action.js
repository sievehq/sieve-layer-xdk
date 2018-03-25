/**
 * Simple action handler for the `open-url` action which looks for a url in either the customData
 * or the selected model, and calls the `showFullScreen` method
 *
 * @class Layer.UI.MessageActions.OpenURLAction
 */
'use strict';

var _index = require('./index');

var _uiUtils = require('../ui-utils');



var openUrlHandler = function openUrlHandler(_ref) {
  var data = _ref.data,
      model = _ref.model;

  var url = data.url || model.url;
  if (!url && model.fetchUrl) {
    // This fails; opening window async is a security violation.
    // Suggested fixes? None yet.
    model.fetchUrl(function (aUrl) {
      return (0, _uiUtils.showFullScreen)(aUrl);
    });
  } else if (url) {
    (0, _uiUtils.showFullScreen)(url);
  }
};
(0, _index.register)('open-url', openUrlHandler);