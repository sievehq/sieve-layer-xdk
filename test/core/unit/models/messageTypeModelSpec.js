/* eslint-disable */
describe("The Message Type Model class", function() {
  var appId = "Fred's App";
  var conversation,
      client,
      requests;

  afterAll(function() {

  });

  beforeEach(function() {
      jasmine.Ajax.install();
      requests = jasmine.Ajax.requests;
      client = new Layer.init({
          appId: appId,
          url: "https://doh.com"
      });
      client.userId = "999";
      client.user = new Layer.Core.Identity({
        userId: client.userId,
        id: "layer:///identities/" + client.userId,
        firstName: "first",
        lastName: "last",
        phoneNumber: "phone",
        emailAddress: "email",
        metadata: {},
        publicKey: "public",
        avatarUrl: "avatar",
        displayName: "display",
        syncState: Layer.Constants.SYNC_STATE.SYNCED,
        isFullIdentity: true,
        isMine: true
      });


      client._clientAuthenticated();
      client._clientReady();
      client.onlineManager.isOnline = true;

      conversation = Layer.Core.Conversation._createFromServer(responses.conversation2);
      requests.reset();
      client.syncManager.queue = [];
  });
  afterEach(function() {
      client.destroy();
      jasmine.Ajax.uninstall();
  });

  describe("The constructor", function() {
    it("Should initialize an emmpty Response Summary Model", function() {
      var model = new Layer.Core.MessageTypeModel({});
      expect(model.responses).toEqual(jasmine.any(Layer.Core.MessageTypeResponseSummaryModel));
      expect(Layer.Core.MessageTypeResponseSummaryModel).not.toBe(null);
    });
  });


  describe("The _parseMessage() method", function() {
    var model, message;

    beforeEach(function() {
      var ProductModel = Layer.Core.Client.getMessageTypeModelClass('ProductModel');
      model = new ProductModel({
        description: "hello there"
      });

      model.generateMessage(conversation, function(m) {message = m;});
    });
    afterEach(function() {
      model.destroy();
    });

    it("Should call responses._parseMessage if a response_summary is found", function() {
      // Setup
      spyOn(model, "_parseMessage").and.callThrough();
      spyOn(model.responses, "_parseMessage").and.callThrough();

      // Pretest
      model._parseMessage({description: "hello"});
      expect(model.responses._parseMessage).not.toHaveBeenCalled();
      model._parseMessage.calls.reset();

      // Run
      message.addPart(new Layer.Core.MessagePart({
        mimeType: "application/vnd.layer.responsesummary+json; parent-node-id=" + model.nodeId + "; role=response_summary",
        body: JSON.stringify({
          participant_data: {
            userA: { favorite: true }
          }
        })
      }));


      // Post test

      // Note that while we called _parseMessage({description: "hello"}) above
      // the Message Part body is still "hello there" and that is what this will be called with.
      expect(model._parseMessage).toHaveBeenCalledWith({description: "hello there"});
      expect(model.responses._parseMessage).toHaveBeenCalledWith({
        participant_data: {
          userA: { favorite: true }
        }
      });
    });

    it("Should trigger a change event if the response_summary contained changes", function() {
      // Setup
      spyOn(model, "_triggerAsync").and.callThrough();
      model._parseMessage({description: "hello"});

      // Pretest
      expect(model._triggerAsync).toHaveBeenCalledWith("message-type-model:change", {
        propertyName: "description",
        oldValue: "hello there",
        newValue: "hello"
      });
      model._triggerAsync.calls.reset();

      // Run
      message.addPart(new Layer.Core.MessagePart({
        mimeType: "application/vnd.layer.responsesummary+json; parent-node-id=" + model.nodeId + "; role=response_summary",
        body: JSON.stringify({
          participant_data: {
            userA: { favorite: true }
          }
        })
      }));

      // Posttest
      expect(model._triggerAsync).toHaveBeenCalledWith("message-type-model:change", {
        propertyName: 'responses._participantData',
        oldValue: {},
        newValue: {
          userA: { favorite: true }
        }
      });
    });

    it("Should call _processNewResponses but only after _parseMessage has completed if the response_summary contained changes", function() {
      // Setup
      spyOn(model, "_processNewResponses").and.callThrough();
      model._parseMessage({description: "hello"});

      // Run
      message.addPart(new Layer.Core.MessagePart({
        mimeType: "application/vnd.layer.responsesummary+json; parent-node-id=" + model.nodeId + "; role=response_summary",
        body: JSON.stringify({
          participant_data: {
            userA: { favorite: true }
          }
        })
      }));

      // Posttest
      expect(model._processNewResponses).not.toHaveBeenCalled();
      Layer.Utils.defer.flush();
      expect(model._processNewResponses).toHaveBeenCalled();
    });

    it("Should copy in all valid properties as camel cased properties", function() {
      model._parseMessage({
        description: "description",
        image_urls: ["heyho"],
        frodo: "dodo"
      });
      expect(model.description).toEqual("description");
      expect(model.imageUrls).toEqual(["heyho"]);
      expect(model.frodo).toBe(undefined);
    });
  });
});