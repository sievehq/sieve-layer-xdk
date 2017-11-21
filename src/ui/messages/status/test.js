describe('Status Message Components', function() {
  var StatusModel;
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

    StatusModel = layer.Core.Client.getMessageTypeModelClass("StatusModel");

    layer.Util.defer.flush();
    jasmine.clock().tick(800);
  });


  afterEach(function() {
    layer.UI.animatedScrollTo = restoreAnimatedScrollTo;
    layer.Core.Client.removeListenerForNewClient();
  });

  describe("Model Tests", function() {
    it("Should create an appropriate Message", function() {
      var model = new StatusModel({
        text: "a"
      });
      model.generateMessage(conversation, function(message) {
        expect(message.parts.length).toEqual(1);
        expect(message.parts[0].mimeType).toEqual('application/vnd.layer.status+json');
        expect(JSON.parse(message.parts[0].body)).toEqual({
          text: "a"
        });
      });
    });

    it("Should instantiate a Model from a Message with metadata", function() {
      var m = conversation.createMessage({
        parts: [{
          mimeType: StatusModel.MIMEType + '; role=root',
          body: JSON.stringify({
            text: "a"
          })
        }]
      });
      var m = new StatusModel({
        message: m,
        part: m.parts[0]
      });
      expect(m.text).toEqual("a");
    });

    it("Should have a suitable one line summary", function() {
      var model1 = new StatusModel({
        text: "a"
      });

      expect(model1.getOneLineSummary()).toEqual("a");
    });
  });

  describe("View Tests", function() {
    var el;
    beforeEach(function() {
      el = document.createElement('layer-status-message-view');
      testRoot.appendChild(el);
    });
    afterEach(function() {
      document.body.removeChild(testRoot);
      layer.Core.Client.removeListenerForNewClient();
      if (el) el.onDestroy();
    });

    it("Should render its text", function() {
      var model = new StatusModel({
        text: "hello"
      });
      el.model = model;
      layer.Util.defer.flush();

      expect(el.innerHTML).toEqual("<p class=\"layer-line-wrapping-paragraphs\">hello</p>");
    });

    it("Should render newline characters", function() {
      var model = new StatusModel({
        text: "hello\nthere"
      });
      el.model = model;
      layer.Util.defer.flush();

      expect(el.innerHTML).toEqual("<p class=\"layer-line-wrapping-paragraphs\">hello</p><p class=\"layer-line-wrapping-paragraphs\">there</p>");
    });

    it("Should render links", function() {
      var model = new StatusModel({
        text: "hello from https://layer.com"
      });
      el.model = model;
      layer.Util.defer.flush();

      expect(el.innerHTML).toEqual("<p class=\"layer-line-wrapping-paragraphs\">hello from <a href=\"https://layer.com\" class=\"layer-parsed-url layer-parsed-url-url\" target=\"_blank\" rel=\"noopener noreferrer\">layer.com</a></p>");
    });
  });
});
