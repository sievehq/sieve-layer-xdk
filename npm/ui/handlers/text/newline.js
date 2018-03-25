/**
 * The Layer Newline TextHandler replaces all newline characters with <p/> tags.
 *
 * @class Layer.UI.handlers.text.NewLine
 */
'use strict';

var _textHandlers = require('./text-handlers');

(0, _textHandlers.register)({
  name: 'newline',
  order: 600,
  requiresEnable: true,
  handler: function handler(textData) {
    var body = textData.text;
    if (body.match(/^<p.*?>[\s\S]*<\/p>$/)) return;
    /*
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
    */
    var bodyParts = body.split('\n').filter(function (str) {
      return str.match(/\S/);
    }).map(function (str) {
      return str.trim();
    });
    textData.text = '<p class="layer-line-wrapping-paragraphs">' + bodyParts.join('</p><p class="layer-line-wrapping-paragraphs">') + '</p>';
  }
}); 