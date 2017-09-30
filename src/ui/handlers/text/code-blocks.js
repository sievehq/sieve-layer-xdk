/**
 * The Layer Code Block TextHandler replaces all \`\`\` with code blocks, and all \` with inline code blocks.
 *
 * @class layerUI.handlers.text.CodeBlocks
 */
import layerUI from '../../base';

layerUI.registerTextHandler({
  name: 'code-blocks',
  order: 500,
  requiresEnable: true,
  handler(textData) {
    let text = textData.text.replace(/```[\s\S]*?```/g, block =>
       `<pre class="code_block">${block.substring(3, block.length - 3)}</pre>`);

    // note .* means single line; [\s\S]* means multiline
    text = text.replace(/`.*?`/g, block =>
        `<code>${block.substring(1, block.length - 1)}</code>`);
    textData.text = text;
  },
});
