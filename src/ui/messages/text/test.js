describe('Text Message Components', function() {
  var TextModel;
  var conversation;
  var testRoot;

  beforeEach(function() {
    jasmine.clock().install();
    restoreAnimatedScrollTo = layer.UI.animatedScrollTo;
    spyOn(layer.UI, "animatedScrollTo").and.callFake(function(node, position, duration, callback) {
      var timeoutId = setTimeout(function() {
        node.scrollTop = position;
        if (callback) callback();
      }, duration);
      return function() {
        clearTimeout(timeoutId);
      };
    });

    client = new layer.Core.Client({
      appId: 'layer:///apps/staging/Fred'
    });
    client.user = new layer.Core.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      displayName: 'Frodo the Dodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true,
      sessionOwner: true
    });
    client._clientAuthenticated();
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });

    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});

    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    testRoot.style.display = 'flex';
    testRoot.style.flexDirection = 'column';
    testRoot.style.height = '300px';

    TextModel = layer.Core.Client.getMessageTypeModelClass("TextModel");

    layer.Util.defer.flush();
    jasmine.clock().tick(800);
  });


  afterEach(function() {
    layer.UI.animatedScrollTo = restoreAnimatedScrollTo;
    layer.Core.Client.removeListenerForNewClient();
  });

  describe("Model Tests", function() {
    it("Should create an appropriate Message with metadata", function() {
      var model = new TextModel({
        text: "a",
        title: "b",
        author: "c",
        subtitle: "d"
      });
      model.generateMessage(conversation, function(message) {
        expect(message.parts.length).toEqual(1);
        expect(message.parts[0].mimeType).toEqual(TextModel.MIMEType);
        expect(JSON.parse(message.parts[0].body)).toEqual({
          text: "a",
          title: "b",
          author: "c",
          subtitle: "d"
        });
      });
    });

    it("Should create an appropriate Message without metadata", function() {
      var model = new TextModel({
        text: "a"
      });
      model.generateMessage(conversation, function(message) {
        expect(message.parts.length).toEqual(1);
        expect(message.parts[0].mimeType).toEqual(TextModel.MIMEType);
        expect(JSON.parse(message.parts[0].body)).toEqual({
          text: "a"
        });
      });

    });

    it("Should instantiate a Model from a Message with metadata", function() {
      var m = conversation.createMessage({
        parts: [{
          mimeType: TextModel.MIMEType + '; role=root',
          body: JSON.stringify({
            text: "a",
            title: "b",
            author: "c",
            subtitle: "d"
          })
        }]
      });
      var m = new TextModel({
        message: m,
        part: m.parts[0]
      });
      expect(m.text).toEqual("a");
      expect(m.title).toEqual("b");
      expect(m.author).toEqual("c");
      expect(m.subtitle).toEqual("d");
    });

    it("Should instantiate a Model from a Message without metadata", function() {
      var m = conversation.createMessage({
        parts: [{
          mimeType: TextModel.MIMEType + '; role=root',
          body: JSON.stringify({
            text: "a"
          })
        }]
      });
      var m = new TextModel({
        message: m,
        part: m.parts[0]
      });
      expect(m.text).toEqual("a");
      expect(m.title).toEqual("");
      expect(m.author).toEqual("");
      expect(m.subtitle).toEqual("");
    });

    it("Should respond to Standard Message Container calls for metadata", function() {
      var model1 = new TextModel({
        text: "a",
        title: "b",
        author: "c",
        subtitle: "d"
      });
      var model2 = new TextModel({
        text: "a"
      });

      expect(model1.getTitle()).toEqual("b");
      expect(model2.getTitle()).toEqual("");

      expect(model1.getDescription()).toEqual("d");
      expect(model2.getDescription()).toEqual("");

      expect(model1.getFooter()).toEqual("c");
      expect(model2.getFooter()).toEqual("");
    });

    it("Should have a suitable one line summary", function() {
      var model1 = new TextModel({
        text: "a",
        title: "b",
        author: "c",
        subtitle: "d"
      });
      var model2 = new TextModel({
        text: "a"
      });

      expect(model1.getOneLineSummary()).toEqual("b");
      expect(model2.getOneLineSummary()).toEqual("a");
    });
  });

  describe("View Tests", function() {
    var el;
    beforeEach(function() {
      el = document.createElement('layer-text-view');
      testRoot.appendChild(el);
    });
    afterEach(function() {
      document.body.removeChild(testRoot);
      layer.Core.Client.removeListenerForNewClient();
      if (el) el.onDestroy();
    });

    it("Should render its text", function() {
      var model = new TextModel({
        text: "hello"
      });
      el.model = model;
      layer.Util.defer.flush();

      expect(el.innerHTML).toEqual("<p>hello</p>");
    });
  });
});
