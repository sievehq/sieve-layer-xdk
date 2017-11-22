describe('layer-compose-button-panel', function() {
  var el, testRoot, client, conversation;

  beforeAll(function(done) {
    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});
    setTimeout(done, 1000);
  });

  afterEach(function() {
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
    el = document.createElement('layer-compose-button-panel');
    testRoot.appendChild(el);
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });
    layer.Util.defer.flush();
  });

  afterEach(function() {
    document.body.removeChild(testRoot);
  });

  describe('The buttons property', function() {
    it("Should call onRender", function() {
      spyOn(el, "onRender");
      el.buttons = [];
      expect(el.onRender).toHaveBeenCalledWith();
    });
  });

  describe("The onRender() method", function() {
    it("Should clear the panel if no buttons", function(){
      el.buttons = [];
      expect(el.innerHTML).toEqual('');
    });

    it("Should use add any provided nodes", function() {
      var n1 = document.createElement("div"),
        n2 = document.createElement("div");
      el.buttons = [n1, n2];
      expect(el.childNodes[0]).toBe(n1);
      expect(el.childNodes[1]).toBe(n2);
    });

    it("Should remove any nodes that are not used", function() {
      var n1 = document.createElement("div"),
        n2 = document.createElement("div");
      el.buttons = [n1, n2];
      el.buttons = [n2];
      expect(el.childNodes[0]).toBe(n2);
    });
  });
});