describe('layer-menu-button', function() {
  var el, testRoot, client;
  beforeEach(function() {
    client = new Layer.Core.Client({
      appId: 'Fred'
    });
    client.user = new Layer.Core.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true
    });
    client._clientAuthenticated();

    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-menu-button');
    testRoot.appendChild(el);
    el.enabled = true;
    layer.Util.defer.flush();
  });

  afterEach(function() {
    document.body.removeChild(testRoot);
    Layer.Core.Client.removeListenerForNewClient();
  });
  it("Should have tests", function() {
    expect("Tests").toBe("written");
  });
});