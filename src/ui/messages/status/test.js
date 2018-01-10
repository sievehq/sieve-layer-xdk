describe('Status Message Components', function() {
  var StatusModel;
  var conversation;
  var testRoot;
  var client;

  beforeEach(function() {
    jasmine.clock().install();
    restoreAnimatedScrollTo = Layer.UI.UIUtils.animatedScrollTo;
    spyOn(Layer.UI.UIUtils, "animatedScrollTo").and.callFake(function(node, position, duration, callback) {
      var timeoutId = setTimeout(function() {
        node.scrollTop = position;
        if (callback) callback();
      }, duration);
      return function() {
        clearTimeout(timeoutId);
      };
    });

    client = new Layer.init({
      appId: 'layer:///apps/staging/Fred'
    });
    client.user = new Layer.Core.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      displayName: 'Frodo the Dodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true,
      isMine: true
    });
    client._clientAuthenticated();
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });

    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    testRoot.style.display = 'flex';
    testRoot.style.flexDirection = 'column';
    testRoot.style.height = '300px';

    StatusModel = Layer.Core.Client.getMessageTypeModelClass("StatusModel");

    Layer.Utils.defer.flush();
    jasmine.clock().tick(800);
  });


  afterEach(function() {
    Layer.UI.UIUtils.animatedScrollTo = restoreAnimatedScrollTo;
    Layer.Core.Client.removeListenerForNewClient();
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
      Layer.Core.Client.removeListenerForNewClient();
      if (el) el.onDestroy();
    });

    it("Should render its text", function() {
      var model = new StatusModel({
        text: "hello"
      });
      el.model = model;
      Layer.Utils.defer.flush();

      expect(el.firstChild.tagName).toEqual("P");
      expect(el.firstChild.className).toEqual("layer-line-wrapping-paragraphs");
      expect(el.firstChild.childNodes[0].textContent).toEqual("hello");

    });

    it("Should render newline characters", function() {
      var model = new StatusModel({
        text: "hello\nthere"
      });
      el.model = model;
      Layer.Utils.defer.flush();

      expect(el.childNodes[0].tagName).toEqual("P");
      expect(el.childNodes[0].className).toEqual("layer-line-wrapping-paragraphs");
      expect(el.childNodes[0].childNodes[0].textContent).toEqual("hello");

      expect(el.childNodes[1].tagName).toEqual("P");
      expect(el.childNodes[1].className).toEqual("layer-line-wrapping-paragraphs");
      expect(el.childNodes[1].childNodes[0].textContent).toEqual("there");
    });

    it("Should render links", function() {
      var model = new StatusModel({
        text: "hello from https://layer.com"
      });
      el.model = model;
      Layer.Utils.defer.flush();

      expect(el.firstChild.tagName).toEqual("P");
      expect(el.firstChild.className).toEqual("layer-line-wrapping-paragraphs");

      expect(el.firstChild.childNodes[0].textContent).toEqual("hello from ");
      expect(el.firstChild.childNodes[1].href).toEqual("https://layer.com/");
      expect(el.firstChild.childNodes[1].innerHTML).toEqual("layer.com");
      expect(el.firstChild.childNodes[1].className).toEqual("layer-parsed-url");
    });
  });
});
