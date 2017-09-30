describe("Newline Text Handler", function() {
  var handler;
  beforeEach(function() {
    if (layerUI.components['layer-conversation-view'] && !layerUI.components['layer-conversation-view'].classDef) layerUI.init({});
    handler = layerUI.textHandlers.newline.handler;
  });

  it("Should replace any occurance of newline with br tags", function() {
    var textData = {
      text: "hello\n\nyou\nare the enemy of \n the newline\nrevolution",
      afterText: []
    };
    handler(textData);
    expect(textData.text).toEqual("hello<br/><br/>you<br/>are the enemy of <br/> the newline<br/>revolution");
  });

  it("Should ignore codeblocks", function() {
    var textData = {
      text: "hello\n\nyou```\nare in\na code\nblock```and should not mess\nwith it\n",
      afterText: []
    };
    handler(textData);
    expect(textData.text).toEqual("hello<br/><br/>you```\nare in\na code\nblock```and should not mess<br/>with it<br/>");
  });
});