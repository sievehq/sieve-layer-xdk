/**
 * Detects urls and replaces them with anchor tags
 *
 * @class Layer.UI.handlers.text.Autolinker
 */
import Autolinker from 'autolinker';
import { register } from './text-handlers';

const autolinker = new Autolinker({
  truncate: {
    length: 40,
    location: 'middle',
  },
  className: 'layer-parsed-url',
});
/**
 * The Layer Image TextHandler replaces all image URLs with image tags
 *
 * @class Layer.UI.handlers.text.Autolinker
 */
register({
  name: 'autolinker',
  order: 400,
  requiresEnable: true,
  handler(textData) {
    textData.text = autolinker.link(textData.text);
  },
});
