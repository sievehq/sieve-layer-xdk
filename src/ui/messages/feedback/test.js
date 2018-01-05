describe('Feedback Message Components', function() {
  var FeedbackModel, ResponseModel;
  var conversation;
  var testRoot;
  var client;

  var styleNode;
  beforeAll(function() {
    styleNode = document.createElement('style');
    styleNode.innerHTML = 'layer-message-viewer.layer-feedback-view  {width: 300px; height: 150px;}';
    document.body.appendChild(styleNode);
  });

  afterAll(function() {
    document.body.removeChild(styleNode);
  });

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
      sessionOwner: true
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

    FeedbackModel = Layer.Core.Client.getMessageTypeModelClass("FeedbackModel");
    ResponseModel = Layer.Core.Client.getMessageTypeModelClass("ResponseModel");

    Layer.Utils.defer.flush();
    jasmine.clock().tick(800);
    jasmine.clock().uninstall();
  });


  afterEach(function() {
    if (client) client.destroy();
    Layer.UI.UIUtils.animatedScrollTo = restoreAnimatedScrollTo;
    Layer.Core.Client.removeListenerForNewClient();
  });

  describe("Model Tests", function() {
    it("Should create an appropriate Message", function() {
      var model = new FeedbackModel({
        title: "title1",
        prompt: "rate it",
        promptWait: "wait to rate it",
        summary: "${customer} didn't like you",
        responseMessage: "${customer} didn't respond to you",
        placeholder: "got something to say, do ya?",
        enabledFor: [client.user.id],
      });

      model.generateMessage(conversation, function(m) {
        message = m;
      });
      expect(message.parts.length).toEqual(1);
      expect(message.parts[0].mimeType).toEqual(FeedbackModel.MIMEType);
      expect(JSON.parse(message.parts[0].body)).toEqual({
        title: "title1",
        prompt: "rate it",
        prompt_wait: "wait to rate it",
        summary: "${customer} didn't like you",
        response_message: "${customer} didn't respond to you",
        placeholder: "got something to say, do ya?",
        enabled_for: [client.user.id],
      });
    });

    it("Should instantiate a Model from a Message ", function() {
      var uuid1 = Layer.Utils.generateUUID();
      var uuid2 = Layer.Utils.generateUUID();
      var m = conversation.createMessage({
        id: 'layer:///messages/' + uuid1,
        parts: [
          {
            id: 'layer:///messages/' + uuid1 + '/parts/' + uuid2,
            mime_type: FeedbackModel.MIMEType + '; role=root',
            body: JSON.stringify({
              title: "title1",
              prompt: "rate it",
              prompt_wait: "wait to rate it",
              summary: "${customer} didn't like you",
              response_message: "${customer} didn't respond to you",
              placeholder: "got something to say, do ya?",
              enabled_for: [client.user.id],
            }),
          }
        ]
      });
      var model = new FeedbackModel({
        message: m,
        part: m.parts[0]
      });

      // Posttest
      expect(model.title).toEqual("title1");
      expect(model.prompt).toEqual("rate it");
      expect(model.promptWait).toEqual("wait to rate it");
      expect(model.summary).toEqual("${customer} didn't like you");
      expect(model.responseMessage).toEqual("${customer} didn't respond to you");
      expect(model.placeholder).toEqual("got something to say, do ya?");
      expect(model.enabledFor).toEqual([client.user.id]);
    });

    it("Should process the response", function() {
      var model = new FeedbackModel({
        enabledFor: [client.user.id]
      });

      var responses = {};
      responses[client.user.userId] = {
        rating: 4,
        comment: "hello"
      };
      model.responses = {
        participantData: responses
      };
      expect(model.rating).toEqual(4);
      expect(model.comment).toEqual("hello");
    });

    describe("The sendFeedback() method", function() {
      it("Should send a response message", function() {
        var tmp = Layer.Core.Conversation.prototype.send;
        spyOn(Layer.Core.Conversation.prototype, "send");

        var model = new FeedbackModel({
          enabledFor: [client.user.id]
        });
        model.generateMessage(conversation);
        model.message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
        model.rating = 2;
        model.comment = "howdy ho";
        TextModel = Layer.Core.Client.getMessageTypeModelClass("TextModel");

        // Run
        model.sendFeedback();

        // Posttest
        var args = Layer.Core.Conversation.prototype.send.calls.allArgs()[0];
        var parts = args[0].parts;
        expect(parts[0].mimeType).toEqual(ResponseModel.MIMEType);
        expect(parts[0].mimeAttributes.role).toEqual("root");
        expect(JSON.parse(parts[0].body)).toEqual(jasmine.objectContaining({
          response_to: model.message.id,
          response_to_node_id: model.message.parts[0].nodeId,
          participant_data: {
            rating: 2,
            comment: "howdy ho",
            sent_at: jasmine.any(String)
          }
        }));
        expect(parts[1].mimeType).toEqual(TextModel.MIMEType);
        expect(parts[1].mimeAttributes.role).toEqual("message");
        expect(parts[1].mimeAttributes['parent-node-id']).toEqual(parts[0].nodeId);
        expect(JSON.parse(parts[1].body)).toEqual(jasmine.objectContaining({
          text: client.user.displayName + " rated the experience 2 stars"
        }));


        // Cleanup
        Layer.Core.Conversation.prototype.send = tmp;
      });
    });
  });

  describe("View Tests", function() {
    var el, message, model;
    beforeEach(function() {
      el = document.createElement('layer-message-viewer');
      testRoot.appendChild(el);
      model = new FeedbackModel({
        enabledFor: [client.user.id]
      });

      model.generateMessage(conversation, function(m) {
        message = m;
      });

      el.message = message;

      Layer.Utils.defer.flush();
    });

    afterEach(function() {
      document.body.removeChild(testRoot);
      Layer.Core.Client.removeListenerForNewClient();
      if (el) el.onDestroy();
    });

    it("Should be correctly generated", function() {
      expect(el.nodes.ui.tagName).toEqual('LAYER-FEEDBACK-MESSAGE-VIEW');
      expect(el.firstChild.tagName).toEqual('LAYER-TITLED-MESSAGE-VIEW-CONTAINER');
    });

    it("Should render as editable", function() {
      spyOn(model, "isEditable").and.returnValue(true);
      el.nodes.ui.onRerender();
      expect(el.classList.contains('layer-feedback-enabled')).toBe(true);
    });

    it("Should render as uneditable", function() {
      spyOn(model, "isEditable").and.returnValue(false);
      el.nodes.ui.onRerender();
      expect(el.classList.contains('layer-feedback-enabled')).toBe(false);
    });

    it("Should show selected stars", function() {
      model.rating = 3;
      el.nodes.ui.onRerender();
      expect(el.nodes.ui.childNodes[0].innerHTML).toEqual("★");
      expect(el.nodes.ui.childNodes[1].innerHTML).toEqual("★");
      expect(el.nodes.ui.childNodes[2].innerHTML).toEqual("★");
      expect(el.nodes.ui.childNodes[3].innerHTML).toEqual("☆");
      expect(el.nodes.ui.childNodes[4].innerHTML).toEqual("☆");
    });

    it("Should set rating and call runAction if editable", function() {
      spyOn(el, "_runAction");
      spyOn(model, "isEditable").and.returnValue(true);

      // Run
      el.nodes.ui.childNodes[3].click();

      // Posttest
      expect(model.rating).toEqual(4);
      expect(el._runAction).toHaveBeenCalled();
    });

    it("Should trigger event even if uneditable", function() {
      spyOn(el, "_runAction");
      spyOn(model, "isEditable").and.returnValue(false);
      model.rating = 2;

      // Run
      el.nodes.ui.childNodes[3].click();

      // Posttest
      expect(model.rating).toEqual(2);
      expect(el._runAction).toHaveBeenCalled();
    });
  });

  describe("Expanded View Tests", function() {
    var el, ui, message, model;
    beforeEach(function() {
      el = document.createElement('layer-message-viewer-expanded');
      testRoot.appendChild(el);
      model = new FeedbackModel({
        title: "mytitle",
        prompt: "all hail ${customer}",
        promptWait: "all wait ${customer}",
        summary: "all summaries for ${customer}",
        enabledFor: [client.user.id]
      });

      model.generateMessage(conversation, function(m) {
        message = m;
      });

      el.model = model;

      Layer.Utils.defer.flush();
      ui = el.nodes.ui;
    });

    afterEach(function() {
      document.body.removeChild(testRoot);
      Layer.Core.Client.removeListenerForNewClient();
      if (el) el.onDestroy();
    });

    it("Should be correctly generated", function() {
      expect(ui.tagName).toEqual('LAYER-FEEDBACK-MESSAGE-EXPANDED-VIEW');
      expect(el.nodes.cardContainer.tagName).toEqual('LAYER-DIALOG-MESSAGE-VIEW-CONTAINER');
    });

    it("Should show selected stars", function() {
      model.rating = 3;
      ui.onRerender();
      expect(ui.nodes.ratings.childNodes[0].innerHTML).toEqual("★");
      expect(ui.nodes.ratings.childNodes[1].innerHTML).toEqual("★");
      expect(ui.nodes.ratings.childNodes[2].innerHTML).toEqual("★");
      expect(ui.nodes.ratings.childNodes[3].innerHTML).toEqual("☆");
      expect(ui.nodes.ratings.childNodes[4].innerHTML).toEqual("☆");
    });

    it("Should show the specified prompt", function() {
      spyOn(model, "isEditable").and.returnValue(true);
      ui.onRerender();
      expect(ui.nodes.label.innerHTML).toEqual("all hail " + client.user.displayName);
    });

    it("Should show the specified promptWait", function() {
      spyOn(model, "isEditable").and.returnValue(false);
      ui.onRerender();
      expect(ui.nodes.label.innerHTML).toEqual("all wait " + client.user.displayName);
    });

    it("Should show the specified summary", function() {
      model.sentAt = new Date();
      ui.onRerender();
      expect(ui.nodes.label.innerHTML).toEqual("all summaries for " + client.user.displayName);
    });

    it("Should change ratings on selecting enabled star", function() {
      spyOn(model, "isEditable").and.returnValue(true);

      // Run
      ui.nodes.ratings.childNodes[3].click();

      // Posttest
      expect(model.rating).toEqual(4);
    });

    it("Should not change ratings on selecting disabled star", function() {
      spyOn(model, "isEditable").and.returnValue(false);

      // Run
      ui.nodes.ratings.childNodes[3].click();

      // Posttest
      expect(model.rating).toEqual(0);
    });

    it("Should limit length", function() {
      ui.maxByteLength = 10;

      ui.nodes.input.value = "hello there";
      ui._onInputEvent({target: ui.nodes.input});

      expect(ui.nodes.input.value).toEqual("hello ther");
    });

    it("Should update the comment", function() {
      ui.nodes.input.value = "hello there";
      ui._onInputChange();
      expect(model.comment).toEqual("hello there");
    });

    it("Should send the feedback", function() {
      spyOn(el, "onDestroy").and.callThrough();
      spyOn(model, "sendFeedback");

      // Run
      ui.nodes.button.click();

      // Posttest
      expect(el.onDestroy).toHaveBeenCalledWith();
      expect(model.sendFeedback).toHaveBeenCalledWith();

    });
  });
});
