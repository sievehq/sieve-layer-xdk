describe('Choice Message Components', function() {
  var ChoiceModel;
  var conversation;
  var testRoot;

  var styleNode;
  beforeAll(function() {
    styleNode = document.createElement('style');
    styleNode.innerHTML = 'layer-message-viewer.layer-choice-message-view  {width: 300px; height: 150px;}';
    document.body.appendChild(styleNode);
  });

  afterAll(function() {
    document.body.removeChild(styleNode);
  });

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

    client = new Layer.Core.Client({
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

    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});

    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    testRoot.style.display = 'flex';
    testRoot.style.flexDirection = 'column';
    testRoot.style.height = '300px';

    ChoiceModel = Layer.Core.Client.getMessageTypeModelClass("ChoiceModel");

    layer.Util.defer.flush();
    jasmine.clock().tick(800);
    jasmine.clock().uninstall();
  });


  afterEach(function() {
    layer.UI.animatedScrollTo = restoreAnimatedScrollTo;
    Layer.Core.Client.removeListenerForNewClient();
  });

  describe("Model Tests", function() {
    it("Should create an appropriate Basic Model with suitable properties and defaults", function() {
      var model = new ChoiceModel({
        label: "hello",
        choices: [
          {text: "a", id: "aa"},
          {text: "b", id: "bb"},
          {text: "c", id: "cc"},
        ]
      });

      expect(model.label).toEqual("hello");
      expect(model.choices).toEqual([
        jasmine.objectContaining({text: "a", id: "aa"}),
        jasmine.objectContaining({text: "b", id: "bb"}),
        jasmine.objectContaining({text: "c", id: "cc"}),
      ]);
      expect(model.allowReselect).toBe(false);
      expect(model.allowDeselect).toBe(false);
      expect(model.allowMultiselect).toBe(false);
      expect(model.responseName).toBe('selection');
      expect(model.selectedAnswer).toBe('');
    });

    it("Should create an appropriate Basic Message", function() {
      var model = new ChoiceModel({
        label: "hello",
        choices: [
          {text: "a", id: "aa"},
          {text: "b", id: "bb"},
          {text: "c", id: "cc"},
        ]
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });

      expect(message.parts.length).toEqual(1);
      expect(message.parts[0].mimeType).toEqual('application/vnd.layer.choice+json');
      expect(JSON.parse(message.parts[0].body)).toEqual({
        label: "hello",
        choices: [
          {text: "a", id: "aa"},
          {text: "b", id: "bb"},
          {text: "c", id: "cc"},
        ]
      });

      expect(model.actionModels).toEqual([
        {
          type: 'action',
          text: 'a',
          event: 'layer-choice-select',
          data: { id: 'aa' },
        },
        {
          type: 'action',
          text: 'b',
          event: 'layer-choice-select',
          data: { id: 'bb' },
        },
        {
          type: 'action',
          text: 'c',
          event: 'layer-choice-select',
          data: { id: 'cc' },
        },
      ]);
    });



    it("Should instantiate a Basic Model from a Message with metadata", function() {
      var uuid1 = layer.Util.generateUUID();

      var m = conversation.createMessage({
        id: 'layer:///messages/' + uuid1,
        parts: [{
          id: 'layer:///messages/' + uuid1 + '/parts/' + layer.Util.generateUUID(),
          mime_type: ChoiceModel.MIMEType + '; role=root; node-id=a',
          body: JSON.stringify({
            label: "hello",
            choices: [
              {text: "a", id: "aa", states: {
                selected: {
                  text: "B",
                  tooltip: "BBB"
                }
              }},
              {text: "b", id: "bb", custom_response_data: {hey: "ho"}},
              {text: "c", id: "cc", tooltip: "Tips"},
            ]
          })
        }]
      });
      var model = new ChoiceModel({
        message: m,
        part: m.parts[0],
      });

      expect(model.label).toEqual("hello");
      expect(model.choices).toEqual([
        jasmine.objectContaining({text: "a", id: "aa", states: {
          selected: {
            text: "B",
            tooltip: "BBB"
          }
        }}),
        jasmine.objectContaining({text: "b", id: "bb", customResponseData: {hey: "ho"}}),
        jasmine.objectContaining({text: "c", id: "cc", tooltip: "Tips"}),
      ]);

      expect(model.actionModels).toEqual([
        {
          type: 'action',
          text: 'a',
          event: 'layer-choice-select',
          data: { id: 'aa' },
        },
        {
          type: 'action',
          text: 'b',
          event: 'layer-choice-select',
          data: { id: 'bb' },
        },
        {
          type: 'action',
          text: 'c',
          event: 'layer-choice-select',
          data: { id: 'cc' },
        },
      ]);
    });


    it("Should have a suitable one line summary", function() {
      var model = new ChoiceModel({
        label: "hello",
        title: "hey",
        choices: [
          {text: "a", id: "aa"},
          {text: "b", id: "bb"},
          {text: "c", id: "cc"},
        ]
      });
      expect(model.getOneLineSummary()).toEqual("hello");

      var model = new ChoiceModel({
        title: "hey",
        choices: [
          {text: "a", id: "aa"},
          {text: "b", id: "bb"},
          {text: "c", id: "cc"},
        ]
      });
      expect(model.getOneLineSummary()).toEqual("hey");

      var model = new ChoiceModel({
        choices: [
          {text: "a", id: "aa"},
          {text: "b", id: "bb"},
          {text: "c", id: "cc"},
        ]
      });
      expect(model.getOneLineSummary()).toEqual(model.constructor.prototype.title);
      expect(model.constructor.prototype.title.length > 0).toBe(true);
    });

    describe("The allowReselect property", function() {
      it("Should correctly initialize Message with allowReselect", function() {
        var model = new ChoiceModel({
          allowReselect: true,
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ]
        });
        model.generateMessage(conversation, function(m) {
          message = m;
        });
        expect(JSON.parse(message.parts[0].body).allow_reselect).toBe(true);
      });

      it("Should correctly initialize Model with allowReselect", function() {
        var uuid1 = layer.Util.generateUUID();

        var m = conversation.createMessage({
          id: 'layer:///messages/' + uuid1,
          parts: [{
            id: 'layer:///messages/' + uuid1 + '/parts/' + layer.Util.generateUUID(),
            mime_type: ChoiceModel.MIMEType + '; role=root; node-id=a',
            body: JSON.stringify({
              allow_reselect: true,
              label: "hello",
              choices: [
                {text: "a", id: "aa"},
                {text: "b", id: "bb"},
                {text: "c", id: "cc"},
              ]
            })
          }]
        });
        var model = new ChoiceModel({
          message: m,
          part: m.parts[0],
        });

        expect(model.allowReselect).toBe(true);
      });

      it("Should enable/disable selection", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
          preselectedChoice: "bb"
        });
        expect(model.isSelectionEnabledFor(0)).toBe(false);
        expect(model.isSelectionEnabledFor(1)).toBe(false);
        expect(model.isSelectionEnabledFor(2)).toBe(false);

        model.allowReselect = true;

        expect(model.isSelectionEnabledFor(0)).toBe(true);
        expect(model.isSelectionEnabledFor(1)).toBe(false);
        expect(model.isSelectionEnabledFor(2)).toBe(true);
      });
    });


    describe("The allowDeselect property", function() {
      it("Should correctly initialize Message with allowDeselect", function() {
        var model = new ChoiceModel({
          allowDeselect: true,
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ]
        });
        model.generateMessage(conversation, function(m) {
          message = m;
        });

        // This is *not* passed as part of the message; its set implicitly via allowDeselect
        //expect(JSON.parse(message.parts[0].body).allow_reselect).toBe(true);
        expect(JSON.parse(message.parts[0].body).allow_deselect).toBe(true);
      });

      it("Should correctly initialize Model with allowDeselect", function() {
        var uuid1 = layer.Util.generateUUID();

        var m = conversation.createMessage({
          id: 'layer:///messages/' + uuid1,
          parts: [{
            id: 'layer:///messages/' + uuid1 + '/parts/' + layer.Util.generateUUID(),
            mime_type: ChoiceModel.MIMEType + '; role=root; node-id=a',
            body: JSON.stringify({
              allow_deselect: true,
              label: "hello",
              choices: [
                {text: "a", id: "aa"},
                {text: "b", id: "bb"},
                {text: "c", id: "cc"},
              ]
            })
          }]
        });
        debugger;
        var model = new ChoiceModel({
          message: m,
          part: m.parts[0],
        });

        expect(model.allowReselect).toBe(true);
        expect(model.allowDeselect).toBe(true);
      });

      it("Should enable/disable selection", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
          allowReselect: true,
          preselectedChoice: "bb"
        });
        expect(model.isSelectionEnabledFor(0)).toBe(true);
        expect(model.isSelectionEnabledFor(1)).toBe(false);
        expect(model.isSelectionEnabledFor(2)).toBe(true);

        model.allowDeselect = true;

        expect(model.isSelectionEnabledFor(0)).toBe(true);
        expect(model.isSelectionEnabledFor(1)).toBe(true);
        expect(model.isSelectionEnabledFor(2)).toBe(true);
      });
    });

    describe("The allowMultiselect property", function() {
      it("Should correctly initialize Message with allowMultiselect", function() {
        var model = new ChoiceModel({
          allowMultiselect: true,
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ]
        });
        model.generateMessage(conversation, function(m) {
          message = m;
        });

        // This is *not* passed as part of the message; its set implicitly via allowMultiselect
        //expect(JSON.parse(message.parts[0].body).allow_reselect).toBe(true);
        //expect(JSON.parse(message.parts[0].body).allow_deselect).toBe(true);
        expect(JSON.parse(message.parts[0].body).allow_multiselect).toBe(true);
      });

      it("Should correctly initialize Model with allowMultiselect", function() {
        var uuid1 = layer.Util.generateUUID();

        var m = conversation.createMessage({
          id: 'layer:///messages/' + uuid1,
          parts: [{
            id: 'layer:///messages/' + uuid1 + '/parts/' + layer.Util.generateUUID(),
            mime_type: ChoiceModel.MIMEType + '; role=root; node-id=a',
            body: JSON.stringify({
              allow_multiselect: true,
              label: "hello",
              choices: [
                {text: "a", id: "aa"},
                {text: "b", id: "bb"},
                {text: "c", id: "cc"},
              ]
            })
          }]
        });
        var model = new ChoiceModel({
          message: m,
          part: m.parts[0],
        });

        expect(model.allowReselect).toBe(true);
        expect(model.allowDeselect).toBe(true);
        expect(model.allowMultiselect).toBe(true);
      });

      it("Should enable selection", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
          preselectedChoice: "bb",
          allowReselect: true
        });
        expect(model.isSelectionEnabledFor(0)).toBe(true);
        expect(model.isSelectionEnabledFor(1)).toBe(false);
        expect(model.isSelectionEnabledFor(2)).toBe(true);

        model.allowMultiselect = true;

        expect(model.isSelectionEnabledFor(0)).toBe(true);
        expect(model.isSelectionEnabledFor(1)).toBe(true);
        expect(model.isSelectionEnabledFor(2)).toBe(true);
      });


      it("Should route calls to selectAnswer", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
          preselectedChoice: "bb",
          allowReselect: true
        });
        model.generateMessage(conversation, function(m) {
          message = m;
        });

        spyOn(model, "_selectMultipleAnswers");
        spyOn(model, "_selectSingleAnswer");

        model.selectAnswer({id: "cc"});
        expect(model._selectSingleAnswer).toHaveBeenCalledWith({id: "cc"});
        model._selectSingleAnswer.calls.reset();
        expect(model._selectMultipleAnswers).not.toHaveBeenCalled();

        model.allowMultiselect = true;
        model.selectAnswer({id: "cc"});
        expect(model._selectSingleAnswer).not.toHaveBeenCalled();
        expect(model._selectMultipleAnswers).toHaveBeenCalledWith({id: "cc"});
      });
    });

    describe("The _selectSingleAnswer() method", function() {
      it("Will depend upon getChoiceIndexById()", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
          preselectedChoice: "bb"
        });
        expect(model.getChoiceIndexById(model.selectedAnswer)).toBe(1);

        model.selectedAnswer = "cc";
        expect(model.getChoiceIndexById(model.selectedAnswer)).toBe(2);
      });

      it("Will depend upon _getNameOfChoice()", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
          preselectedChoice: "bb"
        });
        expect(model._getNameOfChoice()).toEqual("hello");
      });

      it("Will handle standard selection", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
        });
        model.generateMessage(conversation, function(m) {
          message = m;
          message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
        });
        spyOn(model, "_sendResponse");
        spyOn(model, "trigger");

        expect(model.selectedAnswer).toBe('');
        model.selectAnswer({id: "bb"});
        expect(model.selectedAnswer).toBe("bb");

        var responseMessage = model._sendResponse.calls.allArgs()[0][0];
        var responsePart = responseMessage.parts[0];
        var textPart = responseMessage.parts[1];

        expect(textPart.mimeType).toEqual('application/vnd.layer.text+json');
        expect(textPart.parentId).toEqual(responsePart.nodeId);
        expect(textPart.role).toEqual("message");
        expect(JSON.parse(textPart.body)).toEqual({
          text: 'Frodo the Dodo selected "b" for "hello"'
        });

        expect(responsePart.nodeId.length > 0).toBe(true);
        expect(responsePart.mimeType).toEqual('application/vnd.layer.response+json');
        expect(JSON.parse(responsePart.body)).toEqual({
          participant_data: {selection: "bb"},
          response_to: message.id,
          response_to_node_id: model.part.nodeId
        });

        expect(model.trigger).toHaveBeenCalled();
      });

      it("Will handle standard deselection", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
          allowDeselect: true,
          preselectedChoice: "bb",
        });
        model.generateMessage(conversation, function(m) {
          message = m;
          message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
        });
        spyOn(model, "_sendResponse");
        spyOn(model, "trigger");

        expect(model.selectedAnswer).toBe("bb");
        model.selectAnswer({id: "bb"});
        expect(model.selectedAnswer).toBe('');

        var responseMessage = model._sendResponse.calls.allArgs()[0][0];
        var responsePart = responseMessage.parts[0];
        var textPart = responseMessage.parts[1];

        expect(textPart.mimeType).toEqual('application/vnd.layer.text+json');
        expect(textPart.parentId).toEqual(responsePart.nodeId);
        expect(textPart.role).toEqual("message");
        expect(JSON.parse(textPart.body)).toEqual({
          text: 'Frodo the Dodo deselected "b" for "hello"'
        });

        expect(responsePart.nodeId.length > 0).toBe(true);
        expect(responsePart.mimeType).toEqual('application/vnd.layer.response+json');
        expect(JSON.parse(responsePart.body)).toEqual({
          participant_data: {selection: ''},
          response_to: message.id,
          response_to_node_id: model.part.nodeId
        });

        expect(model.trigger).toHaveBeenCalled();
      });

      it("Will handle responseName", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
          responseName: "frodo"
        });
        model.generateMessage(conversation, function(m) {
          message = m;
          message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
        });
        spyOn(model, "_sendResponse");
        spyOn(model, "trigger");

        expect(model.selectedAnswer).toBe('');
        model.selectAnswer({id: "bb"});

        var responseMessage = model._sendResponse.calls.allArgs()[0][0];
        var responsePart = responseMessage.parts[0];

        expect(JSON.parse(responsePart.body)).toEqual({
          participant_data: {frodo: "bb"},
          response_to: message.id,
          response_to_node_id: model.part.nodeId
        });
      });

      it("Will allow and disallow edit with enabledFor", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
          enabledFor: [client.user.id + "a"]
        });
        model.generateMessage(conversation, function(m) {
          message = m;
          message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
        });
        spyOn(model, "_sendResponse");
        spyOn(model, "trigger");
        model.selectAnswer({id: "bb"});

        expect(model._sendResponse).not.toHaveBeenCalled();
        expect(model.trigger).not.toHaveBeenCalled();

        model.enabledFor = [client.user.id];

        model.selectAnswer({id: "bb"});

        expect(model._sendResponse).toHaveBeenCalled();
        expect(model.trigger).toHaveBeenCalled();
      });
    });

    describe("The _selectMultipleAnswer() method", function() {
      it("Will handle standard selection", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
          preselectedChoice: "cc",
          allowMultiselect: true
        });
        model.generateMessage(conversation, function(m) {
          message = m;
          message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
        });
        spyOn(model, "_sendResponse");
        spyOn(model, "trigger");

        expect(model.selectedAnswer).toBe('cc');
        model.selectAnswer({id: "bb"});
        expect(model.selectedAnswer).toBe("cc,bb");

        var responseMessage = model._sendResponse.calls.allArgs()[0][0];
        var responsePart = responseMessage.parts[0];
        var textPart = responseMessage.parts[1];

        expect(textPart.mimeType).toEqual('application/vnd.layer.text+json');
        expect(textPart.parentId).toEqual(responsePart.nodeId);
        expect(textPart.role).toEqual("message");
        expect(JSON.parse(textPart.body)).toEqual({
          text: 'Frodo the Dodo selected "b" for "hello"'
        });

        expect(responsePart.nodeId.length > 0).toBe(true);
        expect(responsePart.mimeType).toEqual('application/vnd.layer.response+json');
        expect(JSON.parse(responsePart.body)).toEqual({
          participant_data: {selection: "cc,bb"},
          response_to: message.id,
          response_to_node_id: model.part.nodeId
        });

        expect(model.trigger).toHaveBeenCalled();
      });

      it("Will handle standard deselection", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
          preselectedChoice: "bb,cc",
          allowMultiselect: true
        });
        model.generateMessage(conversation, function(m) {
          message = m;
          message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
        });
        spyOn(model, "_sendResponse");
        spyOn(model, "trigger");

        expect(model.selectedAnswer).toBe("bb,cc");
        model.selectAnswer({id: "bb"});
        expect(model.selectedAnswer).toBe("cc");

        var responseMessage = model._sendResponse.calls.allArgs()[0][0];
        var responsePart = responseMessage.parts[0];
        var textPart = responseMessage.parts[1];

        expect(textPart.mimeType).toEqual('application/vnd.layer.text+json');
        expect(textPart.parentId).toEqual(responsePart.nodeId);
        expect(textPart.role).toEqual("message");
        expect(JSON.parse(textPart.body)).toEqual({
          text: 'Frodo the Dodo deselected "b" for "hello"'
        });

        expect(responsePart.nodeId.length > 0).toBe(true);
        expect(responsePart.mimeType).toEqual('application/vnd.layer.response+json');
        expect(JSON.parse(responsePart.body)).toEqual({
          participant_data: {selection: "cc"},
          response_to: message.id,
          response_to_node_id: model.part.nodeId
        });

        expect(model.trigger).toHaveBeenCalled();
      });
    });

    it("Will handle responseName", function() {
      var model = new ChoiceModel({
        label: "hello",
        choices: [
          {text: "a", id: "aa"},
          {text: "b", id: "bb"},
          {text: "c", id: "cc"},
        ],
        preselectedChoice: "cc",
        allowMultiselect: true,
        responseName: "frodo"
      });
      model.generateMessage(conversation, function(m) {
        message = m;
        message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
      });
      spyOn(model, "_sendResponse");
      spyOn(model, "trigger");

      expect(model.selectedAnswer).toBe('cc');
      model.selectAnswer({id: "bb"});

      var responseMessage = model._sendResponse.calls.allArgs()[0][0];
      var responsePart = responseMessage.parts[0];

      expect(JSON.parse(responsePart.body)).toEqual({
        participant_data: {frodo: "cc,bb"},
        response_to: message.id,
        response_to_node_id: model.part.nodeId
      });
    });

    it("Will allow and disallow edit with enabledFor", function() {
      var model = new ChoiceModel({
        label: "hello",
        choices: [
          {text: "a", id: "aa"},
          {text: "b", id: "bb"},
          {text: "c", id: "cc"},
        ],
        allowMultiselect: true,
        enabledFor: [client.user.id + "a"]
      });
      model.generateMessage(conversation, function(m) {
        message = m;
        message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
      });
      spyOn(model, "_sendResponse");
      spyOn(model, "trigger");
      model.selectAnswer({id: "bb"});

      expect(model._sendResponse).not.toHaveBeenCalled();
      expect(model.trigger).not.toHaveBeenCalled();

      model.enabledFor = [client.user.id];

      model.selectAnswer({id: "bb"});

      expect(model._sendResponse).toHaveBeenCalled();
      expect(model.trigger).toHaveBeenCalled();
    });

    describe("Text and Tooltip state", function() {
      it("Should return the same text if no state settings", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", tooltip: "aaa", id: "aa"},
            {text: "b", tooltip: "bbb", id: "bb"},
            {text: "c", tooltip: "ccc", id: "cc"},
          ]
        });
        expect(model.getText(1)).toEqual("b");
        expect(model.getTooltip(1)).toEqual("bbb");

        model.selectedAnswer = "bb";
        expect(model.getText(1)).toEqual("b");
        expect(model.getTooltip(1)).toEqual("bbb");
      });

      it("Should apply selected state text", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", tooltip: "aaa", id: "aa"},
            {text: "b", tooltip: "bbb", id: "bb", states: {
              selected: {
                text: "B",
                tooltip: "BBB"
              }
            }},
            {text: "c", tooltip: "ccc", id: "cc"},
          ]
        });
        expect(model.getText(1)).toEqual("b");
        expect(model.getTooltip(1)).toEqual("bbb");

        model.selectedAnswer = "bb";
        expect(model.getText(1)).toEqual("B");
        expect(model.getTooltip(1)).toEqual("BBB");
      });

      it("Should apply default state text", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", tooltip: "aaa", id: "aa"},
            {text: "b", tooltip: "bbb", id: "bb", states: {
              default: {
                text: "B",
                tooltip: "BBB"
              }
            }},
            {text: "c", tooltip: "ccc", id: "cc"},
          ]
        });
        expect(model.getText(1)).toEqual("B");
        expect(model.getTooltip(1)).toEqual("BBB");

        model.selectedAnswer = "bb";
        expect(model.getText(1)).toEqual("b");
        expect(model.getTooltip(1)).toEqual("bbb");
      });
    });

    describe("Should send customResponseData", function() {
      it("Should send with singleSelect", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
          customResponseData: {
            hey: "ho",
            there: "goes"
          }
        });
        model.generateMessage(conversation, function(m) {
          message = m;
          message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
        });
        spyOn(model, "_sendResponse");
        spyOn(model, "trigger");

        model.selectAnswer({ id: "bb" });

        var responseMessage = model._sendResponse.calls.allArgs()[0][0];
        var responsePart = responseMessage.parts[0];

        expect(JSON.parse(responsePart.body)).toEqual({
          participant_data: {
            selection: "bb",
            hey: "ho",
            there: "goes"
          },
          response_to: message.id,
          response_to_node_id: model.part.nodeId
        });
      });
      it("Should send with multiSelect", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
          customResponseData: {
            hey: "ho",
            there: "goes"
          },
          allowMultiselect: true
        });
        model.generateMessage(conversation, function(m) {
          message = m;
          message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
        });
        spyOn(model, "_sendResponse");
        spyOn(model, "trigger");

        model.selectAnswer({ id: "bb" });

        var responseMessage = model._sendResponse.calls.allArgs()[0][0];
        var responsePart = responseMessage.parts[0];

        expect(JSON.parse(responsePart.body)).toEqual({
          participant_data: {
            selection: "bb",
            hey: "ho",
            there: "goes"
          },
          response_to: message.id,
          response_to_node_id: model.part.nodeId
        });
      });

      it("Should send with singleSelect and custom item data", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", id: "aa", customResponseData: {hey: "ho5", a: "aaa"}},
            {text: "b", id: "bb", customResponseData: {hey: "ho10", a: "bbb"}},
            {text: "c", id: "cc"},
          ],
          customResponseData: {
            hey: "ho",
            there: "goes"
          }
        });
        model.generateMessage(conversation, function(m) {
          message = m;
          message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
        });
        spyOn(model, "_sendResponse");
        spyOn(model, "trigger");

        model.selectAnswer({ id: "bb" });

        var responseMessage = model._sendResponse.calls.allArgs()[0][0];
        var responsePart = responseMessage.parts[0];

        expect(JSON.parse(responsePart.body)).toEqual({
          participant_data: {
            selection: "bb",
            hey: "ho10",
            there: "goes",
            a: "bbb"
          },
          response_to: message.id,
          response_to_node_id: model.part.nodeId
        });
      });

      it("Should send with deselected and custom item data", function() {
        var model = new ChoiceModel({
          label: "hello",
          allowDeselect: true,
          preselectedChoice: "bb",
          choices: [
            {text: "a", id: "aa", customResponseData: {hey: "ho5", a: "aaa"}},
            {text: "b", id: "bb", customResponseData: {hey: "ho10", a: "bbb"}},
            {text: "c", id: "cc"},
          ],
          customResponseData: {
            hey: "ho",
            there: "goes"
          }
        });
        model.generateMessage(conversation, function(m) {
          message = m;
          message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
        });
        spyOn(model, "_sendResponse");
        spyOn(model, "trigger");

        // Deselect
        model.selectAnswer({ id: "bb" });

        var responseMessage = model._sendResponse.calls.allArgs()[0][0];
        var responsePart = responseMessage.parts[0];

        expect(JSON.parse(responsePart.body)).toEqual({
          participant_data: {
            selection: "",
            hey: "ho",
            there: "goes"
          },
          response_to: message.id,
          response_to_node_id: model.part.nodeId
        });
      });

      it("Should send with multiSelect and custom item data", function() {
        var model = new ChoiceModel({
          label: "hello",
          allowMultiselect: true,
          choices: [
            {text: "a", id: "aa", customResponseData: {hey: "ho5", a: "aaa"}},
            {text: "b", id: "bb", customResponseData: {hey: "ho10", a: "bbb"}},
            {text: "c", id: "cc"},
          ],
          customResponseData: {
            hey: "ho",
            there: "goes"
          }
        });
        model.generateMessage(conversation, function(m) {
          message = m;
          message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
        });
        spyOn(model, "_sendResponse");
        spyOn(model, "trigger");

        model.selectAnswer({ id: "bb" });

        var responseMessage = model._sendResponse.calls.allArgs()[0][0];
        var responsePart = responseMessage.parts[0];

        expect(JSON.parse(responsePart.body)).toEqual({
          participant_data: {
            selection: "bb",
            hey: "ho10",
            there: "goes",
            a: "bbb"
          },
          response_to: message.id,
          response_to_node_id: model.part.nodeId
        });
      });

      it("Should send with deselected multiSelect and custom item data", function() {
        var model = new ChoiceModel({
          label: "hello",
          allowMultiselect: true,
          preselectedChoice: "bb",
          choices: [
            {text: "a", id: "aa", customResponseData: {hey: "ho5", a: "aaa"}},
            {text: "b", id: "bb", customResponseData: {hey: "ho10", a: "bbb"}},
            {text: "c", id: "cc"},
          ],
          customResponseData: {
            hey: "ho",
            there: "goes"
          }
        });
        model.generateMessage(conversation, function(m) {
          message = m;
          message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
        });
        spyOn(model, "_sendResponse");
        spyOn(model, "trigger");

        model.selectAnswer({ id: "bb" });

        var responseMessage = model._sendResponse.calls.allArgs()[0][0];
        var responsePart = responseMessage.parts[0];

        expect(JSON.parse(responsePart.body)).toEqual({
          participant_data: {
            selection: "",
            hey: "ho",
            there: "goes"
          },
          response_to: message.id,
          response_to_node_id: model.part.nodeId
        });
      });
    });

    describe("Event Tests", function() {
      it("Should use the gather-custom-response-data event", function() {
        var model = new ChoiceModel({
          label: "hello",
          allowMultiselect: true,
          choices: [
            {text: "a", id: "aa", customResponseData: {hey: "ho5", a: "aaa"}},
            {text: "b", id: "bb", customResponseData: {hey: "ho10", a: "bbb"}},
            {text: "c", id: "cc"},
          ],
          customResponseData: {
            hey: "ho",
            there: "goes"
          }
        });
        model.generateMessage(conversation, function(m) {
          message = m;
          message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
        });

        var called = false;
        model.once('gather-custom-response-data', function(evt) {
          called = true;

          // Posttest
          expect(evt).toEqual(jasmine.objectContaining({
            choice: jasmine.objectContaining({ id: 'bb' }),
            choiceCustomResponseData: {hey: "ho10", a: "bbb"},
            fullCustomResponseData:  {
              hey: "ho",
              there: "goes"
            },
            action: 'selected'
          }));
        });

        model.selectAnswer({ id: "bb" });
        expect(called).toBe(true);

        // Test 2:
        called = false;
        model.once('gather-custom-response-data', function(evt) {
          called = true;
          expect(evt).toEqual(jasmine.objectContaining({
            choice: jasmine.objectContaining({ id: 'bb' }),
            choiceCustomResponseData: {hey: "ho10", a: "bbb"},
            fullCustomResponseData:  {
              hey: "ho",
              there: "goes"
            },
            action: 'deselected'
          }));
        });
        model.selectAnswer({ id: "bb" });
        expect(called).toBe(true);
      });

      it("Should use the generate-text-message event", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "a", id: "aa"},
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
        });
        model.generateMessage(conversation, function(m) {
          message = m;
          message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
        });
        spyOn(model, "_sendResponse");
        var called = false;
        model.on('generate-text-message', function(evt) {
          called = true;
          expect(evt.data.text.length > 0).toBe(true);
          expect(evt.data.choice).toBe(model.choices[1]);
          expect(evt.data.action).toEqual('selected');

          evt.data.text = 'hey ho';
        });

        model.selectAnswer({id: "bb"});
        var responseMessage = model._sendResponse.calls.allArgs()[0][0];
        var textPart = responseMessage.parts[1];

        expect(textPart.mimeType).toEqual('application/vnd.layer.text+json');
        expect(JSON.parse(textPart.body)).toEqual({
          text: 'hey ho'
        });
      });
    });

    describe("The expandedType property", function() {
      it("Should return its own value or type if no value", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "c", id: "cc"},
          ],
          type: 'label',
          expandedType: 'standard'
        });
        expect(model.expandedType).toEqual('standard');
        model.expandedType = 'label';
        expect(model.expandedType).toEqual('label');
        model.expandedType = '';
        expect(model.expandedType).toEqual('label'); // returns type value

        var model2 = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "c", id: "cc"},
          ],
          type: 'label'
        });
        expect(model2.expandedType).toEqual('label'); // returns type value
      });
    });

    describe("The preselectedChoice property", function() {
      it("Should set the selectedAnswer property", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
          preselectedChoice: "cc"
        });
        expect(model.selectedAnswer).toEqual("cc");
      });

      it("Should ignore the preselectedChoice property if there is a response", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
          preselectedChoice: "cc",
          responseName: "hey"
        });
        model.generateMessage(conversation);
        model.responses = {
            participantData: {
            "layer:///identities/heyho": {
              "hey": "bb"
            }
          }
        };
        model._processNewResponses();
        expect(model.selectedAnswer).toEqual("bb");
      });

      it("Should ignore the preselectedChoice property if there is an empty response", function() {
        var model = new ChoiceModel({
          label: "hello",
          choices: [
            {text: "b", id: "bb"},
            {text: "c", id: "cc"},
          ],
          preselectedChoice: "cc",
          responseName: "hey"
        });
        model.generateMessage(conversation);
        model.responses = {
          participantData: {
            "layer:///identities/heyho": {
              "hey": ""
            }
          }
        };
        model._processNewResponses();
        expect(model.selectedAnswer).toEqual("");
      });
    });
  });


  describe("View Tests", function() {
    var el, message;
    beforeEach(function() {
      el = document.createElement('layer-message-viewer');
      testRoot.appendChild(el);
    });
    afterEach(function() {
      document.body.removeChild(testRoot);
      Layer.Core.Client.removeListenerForNewClient();
      if (el) el.onDestroy();
    });

    it("Should render 3 action buttons", function() {
      var model = new ChoiceModel({
        label: "hello",
        choices: [
          {text: "a", tooltip: "aaa", id: "aa"},
          {text: "b", tooltip: "bbb", id: "bb"},
          {text: "c", tooltip: "ccc", id: "cc"},
        ]
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      layer.Util.defer.flush();

      // Message Viewer: gets the layer-card-width-chat-bubble class
      expect(el.classList.contains('layer-card-width-flex-width')).toBe(true);

      // Message UI:
      expect(el.nodes.ui.nodes.label.innerHTML).toEqual("hello");
      expect(el.nodes.ui.nodes.choices.childNodes[0].tagName).toEqual('LAYER-ACTION-BUTTON');
      expect(el.nodes.ui.nodes.choices.childNodes[1].tagName).toEqual('LAYER-ACTION-BUTTON');
      expect(el.nodes.ui.nodes.choices.childNodes[2].tagName).toEqual('LAYER-ACTION-BUTTON');

      expect(el.nodes.ui.nodes.choices.childNodes[0].text).toEqual("a");
      expect(el.nodes.ui.nodes.choices.childNodes[1].text).toEqual("b");
      expect(el.nodes.ui.nodes.choices.childNodes[2].text).toEqual("c");

      expect(el.nodes.ui.nodes.choices.childNodes[0].tooltip).toEqual("aaa");
      expect(el.nodes.ui.nodes.choices.childNodes[1].tooltip).toEqual("bbb");
      expect(el.nodes.ui.nodes.choices.childNodes[2].tooltip).toEqual("ccc");

      expect(el.nodes.ui.nodes.choices.childNodes[0].event).toEqual("layer-choice-select");
      expect(el.nodes.ui.nodes.choices.childNodes[1].event).toEqual("layer-choice-select");
      expect(el.nodes.ui.nodes.choices.childNodes[2].event).toEqual("layer-choice-select");

      expect(el.nodes.ui.nodes.choices.childNodes[0].data).toEqual({ id: "aa" });
      expect(el.nodes.ui.nodes.choices.childNodes[1].data).toEqual({ id: "bb" });
      expect(el.nodes.ui.nodes.choices.childNodes[2].data).toEqual({ id: "cc" });
    });

    it("Selection of an action button should update model and UI state", function() {
      var model = new ChoiceModel({
        label: "hello",
        choices: [
          {text: "a", tooltip: "aaa", id: "aa"},
          {text: "b", tooltip: "bbb", id: "bb"},
          {text: "c", tooltip: "ccc", id: "cc"},
        ]
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      layer.Util.defer.flush();

      el.nodes.ui.nodes.choices.childNodes[1]._onClick({
        preventDefault: function() {},
        stopPropagation: function() {},
        target: {
          blur: function() {}
        }
      });

      expect(model.selectedAnswer).toEqual("bb");
      expect(el.nodes.ui.nodes.choices.childNodes[1].selected).toBe(true);
    });

    it("Should update text based on state", function() {
      var model = new ChoiceModel({
        label: "hello",
        choices: [
          {text: "a", tooltip: "aaa", id: "aa"},
          {text: "b", tooltip: "bbb", id: "bb", states: {
            selected: {
              text: "B",
              tooltip: "BBB"
            }
          }},
          {text: "c", tooltip: "ccc", id: "cc"},
        ]
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      layer.Util.defer.flush();

      expect(el.nodes.ui.nodes.choices.childNodes[1].text).toEqual("b");
      model.selectAnswer({id: "bb" });
      expect(el.nodes.ui.nodes.choices.childNodes[1].text).toEqual("B");
    });

    it("Should trigger an event based on the responseName", function() {
      var model = new ChoiceModel({
        label: "hello",
        choices: [
          {text: "a", tooltip: "aaa", id: "aa"},
          {text: "b", tooltip: "bbb", id: "bb"},
          {text: "c", tooltip: "ccc", id: "cc"},
        ],
        responseName: 'clickme'
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      var spy = jasmine.createSpy('clickme');
      el.addEventListener('clickme', spy);

      layer.Util.defer.flush();

      el.nodes.ui.nodes.choices.childNodes[1]._onClick({
        preventDefault: function() {},
        stopPropagation: function() {},
        target: {
          blur: function() {}
        }
      });

      expect(spy).toHaveBeenCalled();
      var details = spy.calls.argsFor(0)[0].detail;
      expect(details.model).toBe(model);
      expect(details.rootModel).toBe(model);
      expect(details.data).toBe(model);
    });
  });
});
