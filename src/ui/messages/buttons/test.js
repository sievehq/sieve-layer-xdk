describe('Button Message Components', function() {
  var ButtonsModel, TextModel, ChoiceModel;
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

    ButtonsModel = Layer.Core.Client.getMessageTypeModelClass("ButtonsModel");
    TextModel = Layer.Core.Client.getMessageTypeModelClass("TextModel");
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
    it("Should create an appropriate Action Buttons Model", function() {
      var model = new ButtonsModel({
        buttons: [
          {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
          {"type": "action", "text": "Give Holy Grail", "event": "grant-grail", "tooltip": "Grail", data: {who: "Lunchalot"}}
        ]
      });

      expect(model.buttons).toEqual([
        {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
        {"type": "action", "text": "Give Holy Grail", "event": "grant-grail", "tooltip": "Grail", data: {who: "Lunchalot"}}
      ]);
      expect(model.choices).toEqual({});
      expect(model.contentModel).toBe(null);
    });

    it("Should create an appropriate Action Buttons Message", function() {
      var model = new ButtonsModel({
        buttons: [
          {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
          {"type": "action", "text": "Give Holy Grail", "event": "grant-grail", "tooltip": "Grail", data: {who: "Lunchalot"}}
        ]
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });

      expect(message.parts.length).toEqual(1);
      expect(message.parts[0].mimeType).toEqual('application/vnd.layer.buttons+json');
      expect(JSON.parse(message.parts[0].body)).toEqual({
        buttons: [
          {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
          {"type": "action", "text": "Give Holy Grail", "event": "grant-grail", "tooltip": "Grail", data: {who: "Lunchalot"}}
        ]
      });
    });



    it("Should instantiate a Basic Action Buttons Model from a Message", function() {
      var uuid1 = layer.Util.generateUUID();

      var m = conversation.createMessage({
        id: 'layer:///messages/' + uuid1,
        parts: [{
          id: 'layer:///messages/' + uuid1 + '/parts/' + layer.Util.generateUUID(),
          mime_type: ButtonsModel.MIMEType + '; role=root; node-id=a',
          body: JSON.stringify({
            buttons: [
              {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
              {"type": "action", "text": "Give Holy Grail", "event": "grant-grail", "tooltip": "Grail", data: {who: "Lunchalot"}}
            ]
          })
        }]
      });
      var model = new ButtonsModel({
        message: m,
        part: m.parts[0],
      });

      expect(model.buttons).toEqual([
        {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
        {"type": "action", "text": "Give Holy Grail", "event": "grant-grail", "tooltip": "Grail", data: {who: "Lunchalot"}}
      ]);
      expect(model.contentModel).toBe(null);
    });



    it("Should create an appropriate Action Buttons Message with Content", function() {
      var model = new ButtonsModel({
        buttons: [
          {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
          {"type": "action", "text": "Give Holy Grail", "event": "grant-grail", "tooltip": "Grail", data: {who: "Lunchalot"}}
        ],
        contentModel: new TextModel({text: "howdy"})
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });

      expect(message.parts.length).toEqual(2);
      expect(message.parts[0].mimeType).toEqual('application/vnd.layer.buttons+json');
      expect(JSON.parse(message.parts[0].body)).toEqual({
        buttons: [
          {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
          {"type": "action", "text": "Give Holy Grail", "event": "grant-grail", "tooltip": "Grail", data: {who: "Lunchalot"}}
        ]
      });
      expect(JSON.parse(message.parts[1].body)).toEqual({
        text: "howdy"
      });
      expect(message.parts[1].mimeType).toEqual('application/vnd.layer.text+json');
      expect(message.parts[1].parentId).toEqual(message.parts[0].nodeId);
      expect(message.parts[1].parentId.length > 0).toBe(true);
    });



    it("Should instantiate a Basic Action Buttons Model with Content from a Message", function() {
      var uuid1 = layer.Util.generateUUID();

      var m = conversation.createMessage({
        id: 'layer:///messages/' + uuid1,
        parts: [{
          id: 'layer:///messages/' + uuid1 + '/parts/' + layer.Util.generateUUID(),
          mime_type: ButtonsModel.MIMEType + '; role=root; node-id=a',
          body: JSON.stringify({
            buttons: [
              {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
              {"type": "action", "text": "Give Holy Grail", "event": "grant-grail", "tooltip": "Grail", data: {who: "Lunchalot"}}
            ]
          })
        }, {
          id: 'layer:///messages/' + uuid1 + '/parts/' + layer.Util.generateUUID(),
          mime_type: 'application/vnd.layer.text+json; role=content;parent-node-id=a',
          body: JSON.stringify({text: "howdy"})
        }]
      });
      var model = new ButtonsModel({
        message: m,
        part: m.parts[0],
      });

      expect(model.buttons).toEqual([
        {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
        {"type": "action", "text": "Give Holy Grail", "event": "grant-grail", "tooltip": "Grail", data: {who: "Lunchalot"}}
      ]);
      expect(model.contentModel).toEqual(jasmine.any(TextModel));
      expect(model.contentModel.text).toEqual("howdy");
    });

    it("Should create an Choice Buttons Message with special props", function() {
      var model = new ButtonsModel({
        buttons: [
          {
            "type": "choice",
            choices: [
              {"text": "Like", "id": "l", "tooltip": "like"},
              {"text": "Dislike", "id": "d", "tooltip": "dislike"}
            ],
            data: {
              responseName: "isliked",
              allowReselect: true,
              enabledFor: ["layer:///identities/a"]
            }
          },
          {
            "type": "choice",
            choices: [
              {"text": "Favorite", "id": "fav", "tooltip": "star"}
            ],
            data: {
              responseName: "isstarred",
              allowDeselect: true,
              customResponseData: {hey: "ho"}
            }
          },
          {
            "type": "choice",
            choices: [
              {"text": "Favorite2", "id": "fav", "tooltip": "star2"}
            ],
            data: {
              responseName: "issuperstarred",
              allowMultiselect: true,
              customResponseData: {hey: "ho"}
            }
          }
        ],
        contentModel: new TextModel({text: "howdy"})
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });

      var issuperstarred = model.choices.issuperstarred;
      expect(issuperstarred.allowMultiselect).toBe(true);
      expect(issuperstarred.customResponseData).toEqual({hey: "ho"});

      var isstarred = model.choices.isstarred;
      expect(isstarred.allowMultiselect).toBe(false);
      expect(isstarred.allowDeselect).toBe(true);
      expect(isstarred.customResponseData).toEqual({hey: "ho"});
      expect(isstarred.choices.length).toEqual(1);
      expect(isstarred.choices[0].id).toEqual("fav");

      var isliked = model.choices.isliked;
      expect(isliked.allowMultiselect).toBe(false);
      expect(isliked.allowDeselect).toBe(false);
      expect(isliked.allowReselect).toBe(true);
      expect(isliked.enabledFor).toEqual(["layer:///identities/a"]);
      expect(isliked.choices.map(function(choice) {return choice.id;})).toEqual(["l", "d"]);

      expect(issuperstarred).toEqual(jasmine.any(ChoiceModel));
      expect(isstarred).toEqual(jasmine.any(ChoiceModel));
      expect(isliked).toEqual(jasmine.any(ChoiceModel));
    });


    it("Should create an appropriate Choice Buttons Message with Content", function() {
      var model = new ButtonsModel({
        buttons: [
          {
            "type": "choice",
            choices: [
              {"text": "Like", "id": "l", "tooltip": "like"},
              {"text": "Dislike", "id": "d", "tooltip": "dislike"}
            ],
            data: {
              responseName: "isliked",
              allowReselect: true
            }
          },
          {
            "type": "choice",
            choices: [
              {"text": "Favorite", "id": "fav", "tooltip": "star"}
            ],
            data: {
              responseName: "isstarred",
              allowDeselect: true
            }
          }
        ],
        contentModel: new TextModel({text: "howdy"})
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });

      expect(message.parts.length).toEqual(2);
      expect(message.parts[0].mimeType).toEqual('application/vnd.layer.buttons+json');
      expect(JSON.parse(message.parts[0].body)).toEqual({
        buttons: [
          {
            "type": "choice",
            choices: [
              {"text": "Like", "id": "l", "tooltip": "like"},
              {"text": "Dislike", "id": "d", "tooltip": "dislike"}
            ],
            data: {
              responseName: "isliked",
              allowReselect: true
            }
          },
          {
            "type": "choice",
            choices: [
              {"text": "Favorite", "id": "fav", "tooltip": "star"}
            ],
            data: {
              responseName: "isstarred",
              allowDeselect: true
            }
          }
        ]
      });
      expect(JSON.parse(message.parts[1].body)).toEqual({
        text: "howdy"
      });
      expect(message.parts[1].mimeType).toEqual('application/vnd.layer.text+json');
      expect(message.parts[1].parentId).toEqual(message.parts[0].nodeId);
      expect(message.parts[1].parentId.length > 0).toBe(true);
    });



    it("Should instantiate a Basic Action Buttons Model with Content from a Message", function() {
      var uuid1 = layer.Util.generateUUID();

      var m = conversation.createMessage({
        id: 'layer:///messages/' + uuid1,
        parts: [{
          id: 'layer:///messages/' + uuid1 + '/parts/' + layer.Util.generateUUID(),
          mime_type: ButtonsModel.MIMEType + '; role=root; node-id=a',
          body: JSON.stringify({
            buttons: [
              {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
              {
                "type": "choice",
                choices: [
                  {"text": "Favorite", "id": "fav", "tooltip": "star"}
                ],
                data: {
                  responseName: "isstarred",
                  allowDeselect: true
                }
              }
            ]
          })
        }, {
          id: 'layer:///messages/' + uuid1 + '/parts/' + layer.Util.generateUUID(),
          mime_type: 'application/vnd.layer.text+json; role=content;parent-node-id=a',
          body: JSON.stringify({text: "howdy"})
        }]
      });
      var model = new ButtonsModel({
        message: m,
        part: m.parts[0],
      });

      expect(model.buttons).toEqual([
        {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
        {
          "type": "choice",
          choices: [
            {"text": "Favorite", "id": "fav", "tooltip": "star"}
          ],
          data: {
            responseName: "isstarred",
            allowDeselect: true
          }
        }
      ]);
      expect(model.contentModel).toEqual(jasmine.any(TextModel));
      expect(model.contentModel.text).toEqual("howdy");
      expect(model.choices.isstarred.allowDeselect).toBe(true);
      expect(model.choices.isstarred.allowMultiselect).toBe(false);
      expect(model.choices.isstarred.choices.length).toEqual(1);
      expect(model.choices.isstarred.choices[0].id).toEqual("fav");
    });


    it("Should have a suitable one line summary", function() {
      var model = new ButtonsModel({
        buttons: [
          {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
        ]
      });
      model.generateMessage(conversation);
      expect(model.getOneLineSummary()).toEqual("Buttons sent");

      model = new ButtonsModel({
        buttons: [
          {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
        ],
        contentModel: new TextModel({ text: "Howdy" })
      });
      model.generateMessage(conversation);
      expect(model.getOneLineSummary()).toEqual("Howdy");
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

    it("Should render 2 action buttons", function() {
      var model = new ButtonsModel({
        buttons: [
          {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
          {"type": "action", "text": "Give Holy Grail", "event": "grant-grail", "tooltip": "Grail", data: {who: "Lunchalot"}}
        ]
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      layer.Util.defer.flush();

      // Message Viewer: gets the layer-card-width-any-width class
      expect(el.classList.contains('layer-card-width-flex-width')).toBe(true);

      // Message UI:
      var buttons = el.nodes.ui.querySelectorAllArray('layer-action-button');
      buttons.forEach(function(b) {
        expect(b.parentNode).toBe(el.nodes.ui.nodes.buttons);
      });
      expect(buttons.length).toEqual(2);
      expect(el.nodes.ui.nodes.buttons.childNodes[0].text).toEqual("Kill Arthur");
      expect(el.nodes.ui.nodes.buttons.childNodes[1].text).toEqual("Give Holy Grail");

      expect(buttons[0].tooltip).toEqual("Kill");
      expect(buttons[1].tooltip).toEqual("Grail");

      expect(buttons[0].event).toEqual("kill-arthur");
      expect(buttons[1].event).toEqual("grant-grail");

      expect(buttons[0].data).toEqual({ who: "Arthur" });
      expect(buttons[1].data).toEqual({ who: "Lunchalot" });
    });

    it("Should generate message viewer for submodel", function() {
      var model = new ButtonsModel({
        buttons: [
          {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
          {"type": "action", "text": "Give Holy Grail", "event": "grant-grail", "tooltip": "Grail", data: {who: "Lunchalot"}}
        ],
        contentModel: new TextModel({
          text: "hello"
        })
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      layer.Util.defer.flush();

      expect(el.nodes.ui.nodes.content.firstChild.tagName).toEqual('LAYER-MESSAGE-VIEWER');
      expect(el.nodes.ui.nodes.content.firstChild.model.text).toEqual('hello');
      expect(el.nodes.ui.nodes.content.firstChild.model).toEqual(jasmine.any(TextModel));
    });

    it("Should allow submodel to handle the action", function() {
      var model = new ButtonsModel({
        buttons: [
          {"type": "action", "text": "Kill Arthur", "event": "kill-arthur", "tooltip": "Kill", data: {who: "Arthur"}},
          {"type": "action", "text": "Give Holy Grail", "event": "grant-grail", "tooltip": "Grail", data: {who: "Lunchalot"}}
        ],
        contentModel: new TextModel({
          text: "hello"
        })
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      layer.Util.defer.flush();

      var ui = el.nodes.ui;
      var buttons = ui.nodes.buttons;
      var messageViewer = ui.nodes.content.firstChild;
      var textUI = messageViewer.nodes.ui;
      spyOn(textUI, 'trigger');

      buttons.firstChild._onClick();

      expect(textUI.trigger).toHaveBeenCalledWith('kill-arthur',  {
        model: model.contentModel,
        rootModel: model,
        data: {who: "Arthur"},
      });
    });

    it("Selection of an action button should update model and UI state", function() {
      var model = new ButtonsModel({
        buttons: [
          {
            "type": "choice",
            choices: [
              {"text": "Favorite", "id": "fav", "tooltip": "star"}
            ],
            data: {
              responseName: "isstarred",
              allowDeselect: true
            }
          }
        ]
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;
      message.syncState = Layer.Constants.SYNC_STATE.SYNCED;

      layer.Util.defer.flush();

      var buttons = el.nodes.ui.nodes.buttons;

      expect(model.choices.isstarred.selectedAnswer).toEqual("");

      buttons.childNodes[0].childNodes[0].click();

      expect(model.choices.isstarred.selectedAnswer).toEqual("fav");
      expect(buttons.childNodes[0].childNodes[0].selected).toBe(true);
    });

    it("Should update text based on state", function() {
      var model = new ButtonsModel({
        buttons: [
          {
            "type": "choice",
            choices: [
              {
                "text": "Favorite", "id": "fav", "tooltip": "star",
                states: {
                  selected: {
                    text: "B",
                    tooltip: "BBB"
                  }
                }
              }
            ],
            data: {
              responseName: "isstarred",
              allowDeselect: true
            }
          }
        ]
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      layer.Util.defer.flush();

      var buttons = el.nodes.ui.nodes.buttons;
      expect(buttons.childNodes[0].childNodes[0].text).toEqual("Favorite");
      model.choices.isstarred.selectAnswer({id: "fav" });
      expect(buttons.childNodes[0].childNodes[0].text).toEqual("B");

      model.choices.isstarred.selectAnswer({id: "fav" });
      expect(buttons.childNodes[0].childNodes[0].text).toEqual("Favorite");
    });

    it("Should trigger an event based on the responseName", function() {
      var model = new ButtonsModel({
        buttons: [
          {
            "type": "choice",
            choices: [
              {
                "text": "Favorite", "id": "fav", "tooltip": "star",
                states: {
                  selected: {
                    text: "B",
                    tooltip: "BBB"
                  }
                }
              }
            ],
            data: {
              responseName: "isstarred",
              allowDeselect: true
            }
          }
        ],
        contentModel: new TextModel({text: "hey"})
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      var spy = jasmine.createSpy('clickme');
      el.addEventListener('isstarred', spy);

      layer.Util.defer.flush();

      var buttons = el.nodes.ui.nodes.buttons;

      buttons.childNodes[0].childNodes[0].click();


      expect(spy).toHaveBeenCalled();
      var details = spy.calls.argsFor(0)[0].detail;
      expect(details.model).toBe(model.contentModel); // model is TextModel
      expect(details.rootModel).toBe(model); // rootModel is ButtonModel
      expect(details.data).toBe(details.rootModel.choices.isstarred); // data is ChoiceModel
    });

    it("Selecting a Choice should send a Response Message", function() {
      var model = new ButtonsModel({
        buttons: [
          {
            "type": "choice",
            choices: [
              {
                "text": "Favorite", "id": "fav", "tooltip": "star",
                states: {
                  selected: {
                    text: "B",
                    tooltip: "BBB"
                  }
                }
              }
            ],
            data: {
              responseName: "isstarred",
              allowDeselect: true,
              customResponseData: {
                a: "b", c: "d"
              }
            }
          }
        ],
        contentModel: new TextModel({text: "hey"})
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      message.syncState = Layer.Constants.SYNC_STATE.SYNCED;

      layer.Util.defer.flush();


      spyOn(model.choices.isstarred, '_sendResponse');

      var buttons = el.nodes.ui.nodes.buttons;

      buttons.childNodes[0].childNodes[0].click();

      var responseMessage = model.choices.isstarred._sendResponse.calls.allArgs()[0][0];
      var responsePart = responseMessage.parts[0];
      var textPart = responseMessage.parts[1];

      expect(textPart.mimeType).toEqual('application/vnd.layer.text+json');
      expect(textPart.parentId).toEqual(responsePart.nodeId);
      expect(textPart.role).toEqual("message");
      expect(JSON.parse(textPart.body)).toEqual({
        text: 'Frodo the Dodo selected "Favorite"'
      });

      expect(responsePart.nodeId.length > 0).toBe(true);
      expect(responsePart.mimeType).toEqual('application/vnd.layer.response+json');
      expect(JSON.parse(responsePart.body)).toEqual({
        participant_data: {
          isstarred: "fav",
          a: "b",
          c: "d"
        },
        response_to: message.id,
        response_to_node_id: model.part.nodeId
      });
    });
  });
});
