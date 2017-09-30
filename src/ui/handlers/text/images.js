/**
 * The Layer Image TextHandler replaces all image URLs with image tags
 *
 * @class layerUI.handlers.text.Images
 * @removed
 */
/*
import layerUI from '../../base';
import isUrl from '../../utils/is-url';

layerUI.registerTextHandler({
  name: 'images',
  order: 100,
  requiresEnable: true,
  handler(textData) {
    const matches = textData.text.match(isUrl(['png', 'jpg', 'jpeg', 'gif']));
    if (matches) {
      matches.forEach(match =>
        textData.afterText.push('<img class="layer-parsed-image" src="' + match + '"></img>'));
    }
  },
});
*/