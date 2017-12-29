describe("Unknown Handler", function() {

  var client, message, el;

  beforeEach(function() {
    jasmine.clock().install();

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
    var conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });
    message = conversation.createMessage({parts: [{mimeType: "text/hat", body: "howdy ho"}]});

    el = document.createElement('layer-message-unknown');
    el._contentTag = 'layer-message-unknown';

    Layer.Util.defer.flush();
    jasmine.clock().tick(500);
  });

  afterEach(function() {
    if (client) client.destroy();
    jasmine.clock().uninstall();
    el.onDestroy();
    Layer.Core.Client.removeListenerForNewClient();
  });

  it("Should select unknown", function() {
    var handler = layer.UI.getHandler(message);
    expect(handler.tagName).toEqual('layer-message-unknown');
  });

  it("Should render something relevant", function() {
    el.message = message;
    CustomElements.takeRecords();
    Layer.Util.defer.flush();
    expect(el.innerHTML).toMatch(/has no renderer/);
  });
});