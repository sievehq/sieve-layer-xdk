xdescribe("Text Plain Handler", function() {

  var client, message, textHandler, el, isWithinMessageItem;

  beforeEach(function() {
    jasmine.clock().install();

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
    var conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });
    message = conversation.createMessage({parts: [{mimeType: "text/plain", body: "howdy ho"}]});

    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({layer: layer});

    textHandler = layer.UI.handlers.filter(function(handler) {
      return handler.tagName === 'layer-message-text-plain';
    })[0];

    layer.UI.registerTextHandler({
      name: 'test1',
      order: 200,
      handler: function(textData, message, isMessageListItem) {
        textData.text += ", test1";
        textData.afterText.push("test1");
        isWithinMessageItem = isMessageListItem;
      }
    });

    layer.UI.registerTextHandler({
      name: 'test2',
      order: 100,
      handler: function(textData, message, isMessageListItem) {
        textData.text += ", test2";
        textData.afterText.push("test2");
      }
    });

    layer.UI.registerTextHandler({
      name: 'test3',
      handler: function(textData, message, isMessageListItem) {
        textData.text += ", test3";
        textData.afterText.push("test3");
      }
    });

    layer.UI.registerTextHandler({
      name: 'test4',
      order: 400,
      handler: function(textData, message, isMessageListItem) {
        textData.text += ", test4";
        textData.afterText.push("test4");
      }
    });

    layer.UI.registerTextHandler({
      name: 'test5',
      requiresEnable: true,
      order: 500,
      handler: function(textData, message, isMessageListItem) {
        textData.text += ", test5";
        textData.afterText.push("test5");
      }
    });

    el = document.createElement('layer-message-text-plain');
    el.parentComponent = document.createElement('layer-message-item-sent');

    layer.Util.defer.flush();
    jasmine.clock().tick(500);
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    el.onDestroy();
    client.destroy();
    layer.Core.Client.removeListenerForNewClient();
  });

  describe("The _setupOrderedHandlers() method", function() {
    it("Should order the handlers", function() {
      layer.UI.textHandlersOrdered = null;
      el._setupOrderedHandlers();
      var data = {text: "", afterText: []};
      layer.UI.textHandlersOrdered.forEach(function(handlerDef) {
        handlerDef.handler(data);
      });
      expect(data).toEqual({
        text: ", test2, test1, test4, test3",
        afterText: ["test2", "test1", "test4", "test3"]
      });
    });
  });



  describe("The onRender() method", function() {
    it("Should correctly escape html tags", function() {
      el.properties.message = message;
      message.parts[0].body = "<hey></ho>";
      el.onRender();
      expect(el.nodes.text.innerHTML).toMatch(/^&lt;hey&gt;&lt;\/ho&gt;/);
    });

    it("Should call each handler", function() {
      el.properties.message = message;
      message.parts[0].body = "heyho";
      el.onRender();
      expect(el.nodes.text.innerHTML).toMatch(/^heyho, test2, test1, test4, test3/);
    });

    it("Should carry modifications to the text property through each handler", function() {
      layer.UI.textHandlersOrdered = null;
      el._setupOrderedHandlers();
      layer.UI.textHandlersOrdered[2] = {handler: jasmine.createSpy('handler').and.callFake(layer.UI.textHandlersOrdered[2].handler)};

      el.message = message;
      expect(layer.UI.textHandlersOrdered[2].handler).toHaveBeenCalledWith(jasmine.objectContaining({
        text: message.parts[0].body + ", test2, test1, test4, test3"
      }), jasmine.any(layer.Message), true);
    });

    it("Should carry modifications to the afterText property through each handler", function() {
      layer.UI.textHandlersOrdered = null;
      el._setupOrderedHandlers();
      layer.UI.textHandlersOrdered[2] = {handler: jasmine.createSpy('handler').and.callFake(layer.UI.textHandlersOrdered[2].handler)};

      el.message = message;
      expect(layer.UI.textHandlersOrdered[2].handler).toHaveBeenCalledWith(jasmine.objectContaining({
        afterText: ["test2", "test1", "test4", "test3"]
      }), jasmine.any(layer.Message), true);
    });

    it("Should render the text", function() {
      el.properties.message = message;
      message.parts[0].body = "heyho";
      el.onRender();
      expect(el.nodes.text.innerHTML).toMatch(/^heyho, test2, test1, test4, test3/);
    });

    it("Should render the afterText", function() {
      el.properties.message = message;
      el.onRender();
      var afterTextNodes = el.querySelectorAllArray('.layer-message-text-plain-after-text');
      expect(afterTextNodes.length).toEqual(4);
      expect(afterTextNodes[0].innerHTML).toEqual("test2");
      expect(afterTextNodes[1].innerHTML).toEqual("test1");
      expect(afterTextNodes[2].innerHTML).toEqual("test4");
      expect(afterTextNodes[3].innerHTML).toEqual("test3");
    });

    it("Should apply the handlers name to the after-text css classes", function() {
      el.properties.message = message;
      el.onRender();
      var afterTextNodes = el.querySelectorAllArray('.layer-message-text-plain-after-text');
      expect(afterTextNodes.length).toEqual(4);
      expect(afterTextNodes[0].classList.contains("layer-message-text-plain-test2")).toBe(true);
      expect(afterTextNodes[1].classList.contains("layer-message-text-plain-test1")).toBe(true);
      expect(afterTextNodes[2].classList.contains("layer-message-text-plain-test4")).toBe(true);
      expect(afterTextNodes[3].classList.contains("layer-message-text-plain-test3")).toBe(true);
    });

    it("Should not apply text handlers if not within a MessageItem", function() {
      el.properties.message = message;
      el.parentComponent = {};
      el.onRender();
      var afterTextNodes = el.querySelectorAllArray('.layer-message-text-plain-after-text');
      expect(afterTextNodes.length).toEqual(0);
    });

    it("Should tell text handlers that it is not within a MessageItem", function() {
      el.properties.message = message;
      isWithinMessageItem = false;
      el.onRender();
      expect(isWithinMessageItem).toBe(true);

      el.parentComponent = {};
      isWithinMessageItem = false;
      el.onRender();
      expect(isWithinMessageItem).toBe(false);
    });
  });

  describe("Message Handler Tests", function() {
    it("Should call _onChange any time the message changes", function() {
      spyOn(el, "_onChange");
      el.message = message;
      message.trigger("messages:change");
      expect(el._onChange).toHaveBeenCalledWith(jasmine.any(layer.Core.LayerEvent));
    });

    it("Should call onRender if message is new", function() {
      el.message = message;
      spyOn(el, "onRender");
      spyOn(el, "onRerender");
      message.syncState = layer.Constants.SYNC_STATE.NEW;
      el._onChange();
      expect(el.onRender).toHaveBeenCalled();
      expect(el.onRerender).not.toHaveBeenCalled();
    });

    it("Should call onRerender if message is not new", function() {
      el.message = message;
      spyOn(el, "onRender");
      spyOn(el, "onRerender");
      message.syncState = layer.Constants.SYNC_STATE.SAVING;
      el._onChange();
      expect(el.onRender).not.toHaveBeenCalled();
      expect(el.onRerender).toHaveBeenCalled();
    });

    it("Should call onSent when the message is sent", function() {
      spyOn(el, "onSent");
      el.message = message;
      message.trigger("messages:sent");
      expect(el.onSent).toHaveBeenCalled();
    });
  });
});