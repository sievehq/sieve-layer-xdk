describe('layer-conversation-last-message', function() {
  var el, testRoot, client, conversation, message;

  beforeAll(function(done) {
    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});
    setTimeout(done, 1000);
  });

  afterEach(function() {
    layer.Util.defer.reset();
    jasmine.clock().uninstall();
    Layer.Core.Client.removeListenerForNewClient();
  });

  beforeEach(function() {
    jasmine.clock().install();

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

    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-conversation-last-message');
    testRoot.appendChild(el);
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });
    message = conversation.createMessage("Hello Earthlings").send();
    layer.Util.defer.flush();
  });

  afterEach(function() {
    document.body.removeChild(testRoot);
  });

  describe('The item property', function() {
    it("Should call onRender", function() {
      spyOn(el, "onRender");
      el.item = conversation;
      expect(el.onRender).toHaveBeenCalledWith();
    });

    it("Should wire up the onRerender event", function() {
      spyOn(el, "onRerender");
      el.item = conversation;
      el.onRerender.calls.reset();
      conversation.trigger('conversations:change', {});
      expect(el.onRerender).toHaveBeenCalledWith(jasmine.any(Layer.Core.LayerEvent));
    });

    it("Should unwire up the onRerender event if prior Conversation", function() {
      spyOn(el, "onRerender");
      el.item = conversation;
      el.item = null;
      el.onRerender.calls.reset();
      conversation.trigger('conversations:change', {});
      expect(el.onRerender).not.toHaveBeenCalled();
    });
  });

  describe("The onRerender() method", function() {
    it("Should generate a layer-message-text-plain saying Hello Earthlings", function() {
      expect(el.querySelector('layer-message-text-plain')).toBe(null);
      el.item = conversation;
      expect(el.querySelector('layer-message-text-plain')).not.toBe(null);
    });

    it("Should remove the layer-message-text-plain if changing item to null", function(){
      el.item = conversation;
      el.item = null;
      expect(el.querySelector('layer-message-text-plain')).toBe(null);
    });

    it("Should use suitable Handler", function() {
      message = conversation.createMessage({
        parts: {
          body: 'blah',
          mimeType: 'image/png'
        }
      }).send();
      el.item = conversation;
      expect(el.querySelector('layer-message-text-plain')).toBe(null);
      expect(el.querySelector('layer-message-image')).not.toBe(null);
    });

    it("Should replace old Handler", function() {
      el.item = conversation;
      expect(el.querySelector('layer-message-text-plain')).not.toBe(null);
      expect(el.querySelector('layer-message-image')).toBe(null);
      message = conversation.createMessage({
        parts: {
          body: 'blah',
          mimeType: 'image/png'
        }
      }).send();
      jasmine.clock().tick(1);
      expect(el.querySelector('layer-message-text-plain')).toBe(null);
      expect(el.querySelector('layer-message-image')).not.toBe(null);
    });

    it("Should generate a handler if canFullyRenderLastMessage says it can", function() {
      el.canFullyRenderLastMessage = function() {return true;}
      el.item = conversation;
      expect(el.querySelector('layer-message-text-plain')).not.toBe(null);
    });

    it("Should generate a label if canFullyRenderLastMessage says it can not", function() {
      el.canFullyRenderLastMessage = function() {return false;}
      el.item = conversation;
      message = conversation.createMessage({
        parts: {
          body: 'blah',
          mimeType: 'image/png'
        }
      }).send();
      jasmine.clock().tick(1);

      expect(el.querySelector('layer-message-text-plain')).toBe(null);
      var label = el.querySelector('.layer-custom-mime-type');
      expect(label).not.toBe(null);
      expect(label.innerHTML).toMatch(/Image message/);
    });
  });
});