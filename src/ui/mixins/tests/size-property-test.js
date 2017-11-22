describe("Size Property Mixin", function() {
  var called;
  beforeAll(function() {
    layerUI.registerComponent('size-property-test', {
      mixins: [layerUI.mixins.SizeProperty],
      methods: {
      }
    });
  });

  var el, testRoot, client;

  beforeEach(function() {
    jasmine.clock().install();
    called = false;
    client = new Layer.Core.Client({
      appId: 'layer:///apps/staging/Fred'
    });
    client.user = new Layer.Core.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      displayName: 'Frodo the Dodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true
    });
    client._clientAuthenticated();

    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('size-property-test');
    testRoot.appendChild(el);

    CustomElements.takeRecords();
    layer.Util.defer.flush();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    client.destroy();
    document.body.removeChild(testRoot);
    Layer.Core.Client.removeListenerForNewClient();
  });

  it("Should have tests", function() {
    expect(1).toBe(0);
  });
});
