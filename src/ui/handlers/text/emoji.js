/**
 * The Layer Emoji TextHandler replaces all :smile: and :-) with emoji images
 *
 * @class layerUI.handlers.text.Emoji
 */
import Twemoji from 'twemoji';
import RemarkableParser from 'remarkable-emoji/setEmoji';
import layerUI from '../../base';

layerUI.registerTextHandler({
  base: location.protocol + '://twemoji.maxcdn.com/',
  name: 'emoji',
  order: 300,
  requiresEnable: true,
  handler(textData) {
    // Bug in RemarkableParser requires extra spacing around html tags to keep them away from the emoticon.
    let text = textData.text.replace(/<br\/>/g, ' <br/> ');

    // Parse it
    const parsed = RemarkableParser(text);

    // See if its an all-emoji line by replacing all emojis with empty strings
    // and seeing if there's anything left when we're done.
    const allEmojiLine = !Twemoji.replace(parsed, () => '').match(/\S/);

    // Render the emoji images
    text = Twemoji.parse(RemarkableParser(text), {
      size: allEmojiLine ? '36x36' : '16x16',
      className: allEmojiLine ? 'emoji emoji-line' : 'emoji',
    });

    // Undo the extra spacing we added above
    text = text.replace(/ <br\/> /g, '<br/>');
    textData.text = text;
  },
});
