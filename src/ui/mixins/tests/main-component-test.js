// TODO: Update this to apply to a test widget instead of an existing widget
describe("Main Component Mixin", function() {
  var el, testRoot, client, query;

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
      isFullIdentity: true
    });
    client._clientAuthenticated();

  if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-identity-list');
    testRoot.appendChild(el);
    query = client.createQuery({
      model: layer.Core.Query.Identity
    });
    query.isFiring = false;
    query.data = [client.user];
    for (i = 0; i < 100; i++) {
      query.data.push(
        new Layer.Core.Identity({
          client: client,
          userId: 'user' + i,
          id: 'layer:///identities/user' + i,
          displayName: 'User ' + i,
          isFullIdentity: true
        })
      );
    }

    el.query = query;
    CustomElements.takeRecords();
    layer.Util.defer.flush();
    jasmine.clock().tick(500);
    layer.Util.defer.flush();
  });

  afterEach(function() {
    try {
      jasmine.clock().uninstall();
      layerUI.settings.appId = null;
      document.body.removeChild(testRoot);
      Layer.Core.Client.removeListenerForNewClient();
      if (el) el.onDestroy();
    } catch(e) {}
  });

  describe("Common Properties", function() {
    it("Should setup the client from the appId property", function() {
      testRoot.innerHTML = '<layer-identity-list></layer-identity-list>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      var el = testRoot.firstChild;
      expect(el.client).toBe(null);
      el.appId = client.appId;
      expect(el.client).toBe(client);
    });

    it("Should setup the client from the app-id attribute", function() {
      testRoot.innerHTML = '<layer-identity-list app-id="' + client.appId + '"></layer-identity-list>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      var el = testRoot.firstChild;
      expect(el.client).toBe(client);
    });

    it("Should setup the client from the layerUI.appId property", function() {
      layerUI.settings.appId = client.appId;
      testRoot.innerHTML = '<layer-identity-list></layer-identity-list>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      var el = testRoot.firstChild;
      expect(el.client).toBe(client);
      layerUI.appId = null;
    });
  });

  describe("The onCreate() method", function() {
    beforeEach(function() {
      jasmine.clock().install();
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });
  });
});
