/**
 * Simple action handler for the `open-url` action which looks for a url in either the customData
 * or the selected model, and calls the `showFullScreen` method
 *
 * @class Layer.UI.MessageActions.OpenURLAction
 */

import { registerMessageActionHandler, showFullScreen } from '../base';

const openUrlHandler = ({ data, model }) => {
  const url = data.url || model.url;
  showFullScreen(url);
};
registerMessageActionHandler('open-url', openUrlHandler);
