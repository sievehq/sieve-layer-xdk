describe("Youtube Text Handler", function() {
  var handler;
  beforeEach(function() {
    if (layerUI.components['layer-conversation-view'] && !layerUI.components['layer-conversation-view'].classDef) layerUI.init({});
    handler = layerUI.textHandlers.youtube.handler;
  });

  it("Should replace a youtube url with a video", function() {
    var textData = {
      text: "hello https://www.youtube.com/watch?v=0utzB6oDan0 there",
      afterText: []
    };
    handler(textData);
    expect(textData).toEqual({
      text: "hello https://www.youtube.com/watch?v=0utzB6oDan0 there",
      afterText: ['<iframe width="560" height="315" src="https://www.youtube.com/embed/0utzB6oDan0" frameborder="0" allowfullscreen></iframe>']
    });
  });

  it("Should replace a youtube sharing url with a video", function() {
    var textData = {
      text: "hello https://youtu.be/0utzB6oDan0 there",
      afterText: []
    };
    handler(textData);
    expect(textData).toEqual({
      text: "hello https://youtu.be/0utzB6oDan0 there",
      afterText: ['<iframe width="560" height="315" src="https://www.youtube.com/embed/0utzB6oDan0" frameborder="0" allowfullscreen></iframe>']
    });
  });

  it("Should do nothing if no youtube video found", function() {
    var textData = {
      text: "hello there",
      afterText: []
    };
    handler(textData);
    expect(textData).toEqual({
      text: "hello there",
      afterText: []
    });

  });
});
