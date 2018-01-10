describe('Response Message Components', function() {
  var ResponseModel, TextModel;
  var conversation;
  var testRoot;
  var uuidPart, uuidMessage;
  var responseToMessage;
  var client;

  beforeEach(function() {
    uuidMessage = Layer.Utils.generateUUID();
    uuidPart = Layer.Utils.generateUUID();

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

    ResponseModel = Layer.Core.Client.getMessageTypeModelClass("ResponseModel");
    TextModel = Layer.Core.Client.getMessageTypeModelClass("TextModel");

    responseToMessage = conversation.createMessage("hello");
    responseToMessage.presend();

    Layer.Utils.defer.flush();
    jasmine.clock().tick(800);
  });


  afterEach(function() {
    Layer.Core.Client.removeListenerForNewClient();
    Layer.UI.UIUtils.animatedScrollTo = restoreAnimatedScrollTo;
  });

  describe("Model Tests", function() {

    it("Should create an appropriate Message with a display", function() {
      var model = new ResponseModel({
        responseTo: responseToMessage.parts[0].id,
        participantData: {
          hey: "ho"
        },
        displayModel: new TextModel({
          text: "howdy"
        }),
      });
      model.generateMessage(conversation, function(message) {
        expect(message.parts.length).toEqual(2);
        expect(message.parts[0].mimeType).toEqual(ResponseModel.MIMEType);
        expect(message.parts[1].mimeType).toEqual(TextModel.MIMEType);

        expect(JSON.parse(message.parts[0].body)).toEqual({
          response_to: responseToMessage.parts[0].id,
          participant_data: {hey: "ho"}
        });

        expect(JSON.parse(message.parts[1].body)).toEqual({
          text: "howdy"
        });
      });
    });

    it("Should create an appropriate Message without a display", function() {
      var model = new ResponseModel({
        responseTo: responseToMessage.parts[0].id,
        participantData: {
          hey: "ho"
        }
      });
      model.generateMessage(conversation, function(message) {
        expect(message.parts.length).toEqual(1);
        expect(message.parts[0].mimeType).toEqual(ResponseModel.MIMEType);

        expect(JSON.parse(message.parts[0].body)).toEqual({
          response_to: responseToMessage.parts[0].id,
          participant_data: {hey: "ho"}
        });
      });
    });


    it("Should instantiate a Model from a Message with a display", function() {
      var message = conversation.createMessage({
        parts: [
          {
            mimeType: ResponseModel.MIMEType + '; role=root; node-id=' + uuidPart,
            body: JSON.stringify({
              response_to: uuidMessage,
              participant_data: {user_a: {hey: "ho"}}
            })
          },
          {
            mimeType: TextModel.MIMEType + '; role=message; parent-node-id=' + uuidPart,
            body: JSON.stringify({text: "ho hum"})
          }
        ]
      });
      var model = new ResponseModel({
        message: message,
        part: message.parts[0]
      });
      expect(model.responseTo).toEqual(uuidMessage);
      expect(model.participantData).toEqual({user_a: {hey: "ho"}});
      expect(model.displayModel.text).toEqual("ho hum");
    });

    it("Should instantiate a Model from a Message without a display", function() {
      var m = conversation.createMessage({
        parts: [
          {
            mimeType: ResponseModel.MIMEType + '; role=root; node-id=' + uuidPart,
            body: JSON.stringify({
              response_to: uuidMessage,
              participant_data: {user_a: {hey: "ho"}}
            })
          }
        ]
      });
      var m = new ResponseModel({
        message: m,
        part: m.parts[0]
      });
      expect(m.responseTo).toEqual(uuidMessage);
      expect(m.participantData).toEqual({user_a: {hey: "ho"}});
      expect(m.displayModel).toBe(null);
    });

    it("Should have a suitable one line summary", function() {
      var model1 = new ResponseModel({
        responseTo: responseToMessage.parts[0].id,
        participantData: {
          hey: "ho"
        },
        displayModel: new TextModel({
          text: "howdy"
        }),
      });
      var model2 = new ResponseModel({
        responseTo: responseToMessage.parts[0].id,
        participantData: {
          hey: "ho"
        }
      });

      expect(model1.getOneLineSummary()).toEqual("howdy");
      expect(model2.getOneLineSummary()).toEqual("");
    });
  });

  describe("View Tests", function() {
    var el;
    beforeEach(function() {
      el = document.createElement('layer-response-message-view');
      testRoot.appendChild(el);
    });
    afterEach(function() {
      document.body.removeChild(testRoot);
      Layer.Core.Client.removeListenerForNewClient();
      if (el) el.onDestroy();
    });

    it("Should render its displayModel", function() {
      var model = new ResponseModel({
        responseTo: responseToMessage.parts[0].id,
        participantData: {
          hey: "ho"
        },
        displayModel: new TextModel({
          text: "howdy"
        }),
      });
      el.model = model;
      Layer.Utils.defer.flush();

      expect(el.firstChild.tagName).toEqual("LAYER-MESSAGE-VIEWER");
      expect(el.firstChild.model).toBe(model.displayModel);
    });

    it("Should omit its displayModel", function() {
      var model = new ResponseModel({
        responseTo: responseToMessage.parts[0].id,
        participantData: {
          hey: "ho"
        }
      });
      el.model = model;
      Layer.Utils.defer.flush();

      expect(el.firstChild).toBe(null);
    });
  });
});
