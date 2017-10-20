describe("Unknown Handler", function() {

  var client, message, el;

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
    message = conversation.createMessage({parts: [{mimeType: "text/hat", body: "howdy ho"}]});

    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({layer: layer});

    el = document.createElement('layer-message-unknown');
    el._contentTag = 'layer-message-unknown';

    layer.Util.defer.flush();
    jasmine.clock().tick(500);
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    el.onDestroy();
    client.destroy();
    layer.Core.Client.removeListenerForNewClient();
  });

  it("Should select unknown", function() {
    var handler = layer.UI.getHandler(message);
    expect(handler.tagName).toEqual('layer-message-unknown');
  });

  it("Should render something relevant", function() {
    el.message = message;
    CustomElements.takeRecords();
    layer.Util.defer.flush();
    expect(el.innerHTML).toMatch(/has no renderer/);
  });
});