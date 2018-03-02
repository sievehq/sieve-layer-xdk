/**
 * Simple action handler for the `open-url` action which looks for a url in either the customData
 * or the selected model, and calls the `showFullScreen` method
 *
 * @class Layer.UI.MessageActions.OpenURLAction
 */

import { register } from './index';
import { showFullScreen } from '../ui-utils';

const openUrlHandler = ({ data, model }) => {
  const url = data.url || model.url;
  if (!url && model.fetchUrl) {
    // This fails; opening window async is a security violation.
    // Suggested fixes? None yet.
    model.fetchUrl(aUrl => showFullScreen(aUrl));
  } else if (url) {
    showFullScreen(url);
  }
};
register('open-url', openUrlHandler);
