describe('layer-menu', function() {
  var el, testRoot, client;
  beforeEach(function() {
    client = new layer.Core.Client({
      appId: 'Fred'
    });
    client.user = new layer.Core.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true
    });
    client._clientAuthenticated();

    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-menu');
    testRoot.appendChild(el);
    el.enabled = true;
    layer.Util.defer.flush();
  });

  afterEach(function() {
    document.body.removeChild(testRoot);
    layer.Core.Client.removeListenerForNewClient();
  });
  it("Should have tests", function() {
    expect("Tests").toBe("written");
  });
});