/**
 * Simple action handler for the `open-file` action.  It accepts either a `url` or `source_url` from
 * the data provided by either a Message Model's `actionData` (if event is triggered by selecting the Message)
 * or by an Action Button's `data` property (if the event is triggered by selecting the button).
 * Failing to find either of those, it will look at the Message Model's `getSourceUrl` method
 * or the selected model, and calls the MessageViewer `showFullScreen` method
 *
 * @class Layer.UI.MessageActions.OpenFileAction
 */

import { registerMessageActionHandler, showFullScreen } from '../base';
import { logger } from '../../util';

const openFileHandler = ({ data, model }) => {
  if (data.url || data.source_url) {
    showFullScreen(data.url || data.source_url);
  } else if (model.getSourceUrl) {
    model.getSourceUrl(url => showFullScreen(url));
  } else {
    logger.error('No getSourceUrl method for the "open-file" Message Action for model ', model);
  }
};

registerMessageActionHandler('open-file', openFileHandler);
