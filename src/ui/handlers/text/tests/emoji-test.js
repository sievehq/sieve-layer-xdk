describe("Emoji Text Handler", function() {
  var handler;
  beforeEach(function() {
    if (layerUI.components['layer-conversation-view'] && !layerUI.components['layer-conversation-view'].classDef) layerUI.init({});
    handler = layerUI.textHandlers.emoji.handler;
  });

  it("Should replace any occurance of :-) with an image", function() {
    var textData = {
      text: "hello :-)",
      afterText: []
    };
    handler(textData);
    expect(textData.text).toMatch(/^hello \<img/);
  });

  it("Should replace any occurance of :grin: with an image", function() {
    var textData = {
      text: "hello :grin: I am a :grin: er",
      afterText: []
    };
    handler(textData);
    expect(textData.text.match(/\<img/g).length).toEqual(2);
  });

  it("Should use emoji-line class iff only emojis are in the message", function() {
    var textData = {
      text: "hello :-) there :-(",
      afterText: []
    };
    handler(textData);
    expect(textData.text).not.toMatch(/emoji-line/);

    textData = {
      text: ":-) :-(",
      afterText: []
    };
    handler(textData);
    expect(textData.text.match(/emoji-line/g).length).toEqual(2);
  });

  it("Should handle br tags safely", function() {
    var textData = {
      text: "<br/>:-)<br/>:grin:<br/>",
      afterText: []
    };
    handler(textData);
    expect(textData.text).toMatch(/<br\/><img.*?\/?><br\/><img.*?\/?><br\/>/);
  });
});