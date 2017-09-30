describe("Code Block Text Handler", function() {
  var handler;
  beforeEach(function() {
    if (layerUI.components['layer-conversation-view'] && !layerUI.components['layer-conversation-view'].classDef) layerUI.init({});
    handler = layerUI.textHandlers['code-blocks'].handler;
  });

  it("Should replace all tripple tick blocks with pre blocks", function() {
    var textData = {
      text: "hello```The code\nis here\n\nbut all must end``` and this is not a code block ```and here we resume again``` and end again",
      afterText: []
    };
    handler(textData);
    expect(textData.text).toEqual("hello<pre class=\"code_block\">The code\nis here\n\nbut all must end</pre> and this is not a code block <pre class=\"code_block\">and here we resume again</pre> and end again");
  });

  it("Should replace all single tick blocks with code blocks", function() {
    var textData = {
      text: "hello`The code is here but all must end` and this is not a code block `and here we resume again` and end again",
      afterText: []
    };
    handler(textData);
    expect(textData.text).toEqual("hello<code>The code is here but all must end</code> and this is not a code block <code>and here we resume again</code> and end again");
  });
});