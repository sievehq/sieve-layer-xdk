/**
 * Detects urls and replaces them with anchor tags
 *
 * @class Layer.UI.handlers.text.Autolinker
 */
//import Autolinker from 'autolinker';
import IsUrl from '../../ui-utils/is-url';
import { register } from './text-handlers';

const testExpr = IsUrl();
/*const autolinker = new Autolinker({
  truncate: {
    length: 40,
    location: 'middle',
  },
  className: 'layer-parsed-url',
});*/

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
    textData.text = textData.text.replace(testExpr, (url) => {
      let shortUrl = url.replace(/^\w+\:\/+/, '');
      if (url.length > 50) {
        const firstSlash = url.indexOf('/', 15);
        const lastSlash = url.lastIndexOf('/');
        shortUrl = url.substring(0, firstSlash) + '...' + url.substring(lastSlash);
      }
      return `<a href='${url}' class='layer-parsed-url'>${shortUrl}</a>`;
    });
  },
});
