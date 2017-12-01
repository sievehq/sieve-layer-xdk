describe('layer-choice-button', function() {
  var el, testRoot, client;

  beforeAll(function(done) {
    setTimeout(done, 1000);
  });

  beforeEach(function() {
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
    el = document.createElement('layer-choice-button');
    testRoot.appendChild(el);
    layer.Util.defer.flush();
  });

  afterEach(function() {
    Layer.Core.Client.removeListenerForNewClient();
  });
  it("Should have tests", function() {
    expect(1).toEqual(0);
  });
});