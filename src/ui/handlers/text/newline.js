/**
 * The Layer Newline TextHandler replaces all newline characters with <br/> tags.
 *
 * Any newline character that appears within a code block should
 * NOT be replaced with a <br/> tag as the code block will render that as a visible
 * <br/> rather than go to the next line.
 *
 * @class layerUI.handlers.text.NewLine
 */
import layerUI from '../../base';

layerUI.registerTextHandler({
  name: 'newline',
  order: 600,
  requiresEnable: true,
  handler(textData) {
    let body = textData.text;
    const codeBlockIndices = [];
    const codeBlocks = [];
    let lastIndex = 0;
    while (lastIndex !== -1) {
      lastIndex = body.indexOf('```', lastIndex);
      if (lastIndex !== -1) {
        codeBlockIndices.push(lastIndex);
        lastIndex += 3;
      }
    }

    for (let i = 1; i < codeBlockIndices.length; i++) {
      codeBlocks.push([codeBlockIndices[i - 1], codeBlockIndices[i]]);
    }

    function isInCodeBlock(index) {
      return Boolean(codeBlocks.filter(block => index > block[0] && index < block[1]).length);
    }

    body = body.replace(/\n/g, (text, index) => {
      if (isInCodeBlock(index)) {
        return text;
      } else {
        return '<br/>';
      }
    });
    textData.text = '<p>' + body.split('<br/>').join('</p><p>') + '</p>';
  },
});
