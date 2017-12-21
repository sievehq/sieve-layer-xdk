describe("Emoji Text Handler", function() {
  var handler;
  beforeEach(function() {
    if (Layer.UI.components['layer-conversation-view'] && !Layer.UI.components['layer-conversation-view'].classDef) Layer.UI.init({});
    handler = Layer.UI.textHandlers.emoji.handler;
  });

  describe("Twemoji", function() {
    beforeEach(function() {
      Layer.UI.settings.useEmojiImages = true;
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

    it("Should use layer-emoji-line class iff only emojis are in the message", function() {
      var textData = {
        text: "hello :-) there :-(",
        afterText: []
      };
      handler(textData);
      expect(textData.text).not.toMatch(/layer-emoji-line/);

      textData = {
        text: ":-) :-(",
        afterText: []
      };
      handler(textData);
      expect(textData.text.match(/layer-emoji-line/g).length).toEqual(2);
    });

    it("Should handle br tags safely", function() {
      var textData = {
        text: "\n:-)\n:grin:\n",
        afterText: []
      };
      handler(textData);
      expect(textData.text).toMatch(/\n<img.*?\/?>\n<img.*?\/?>\n/);
    });
  });

  describe("No Twemoji", function() {
    beforeEach(function() {
      Layer.UI.settings.useEmojiImages = false;
    });
    it("Should replace any occurance of :-) with an span", function() {
      var textData = {
        text: "hello :-)",
        afterText: []
      };
      handler(textData);
      expect(textData.text).toMatch(/^hello \<span/);
    });

    it("Should replace any occurance of :grin: with an span", function() {
      var textData = {
        text: "hello :grin: I am a :grin: er",
        afterText: []
      };
      handler(textData);
      expect(textData.text.match(/\<span/g).length).toEqual(2);
    });

    it("Should use layer-emoji-line class iff only emojis are in the message", function() {
      var textData = {
        text: "hello :-) there :-(",
        afterText: []
      };
      handler(textData);
      expect(textData.text).not.toMatch(/layer-emoji-line/);

      textData = {
        text: ":-) :-(",
        afterText: []
      };
      handler(textData);
      expect(textData.text.match(/layer-emoji-line/g).length).toEqual(1);
    });

    it("Should handle br tags safely", function() {
      var textData = {
        text: "\n:-)\n:grin:\n",
        afterText: []
      };
      handler(textData);
      expect(textData.text).toMatch(/\n<span.*?>.<\/span><br/><span.*?>.<\/span>/);
    });
  });
});