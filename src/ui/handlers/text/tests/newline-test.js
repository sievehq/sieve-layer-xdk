describe("Newline Text Handler", function() {
  var handler;
  beforeEach(function() {
    handler = Layer.UI.textHandlers.newline.handler;
  });

  it("Should replace any occurance of newline with br tags", function() {
    var textData = {
      text: "hello\n\nyou\nare the enemy of \n the newline\nrevolution",
      afterText: []
    };
    handler(textData);
    expect(textData.text).toEqual('<p class="layer-line-wrapping-paragraphs">hello</p><p class="layer-line-wrapping-paragraphs">you</p><p class="layer-line-wrapping-paragraphs">are the enemy of</p><p class="layer-line-wrapping-paragraphs">the newline</p><p class="layer-line-wrapping-paragraphs">revolution</p>');
  });
});