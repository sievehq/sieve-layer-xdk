// TODO: Apply this to a temporary list rather than an existing widget
describe("List Load Mixin", function() {

  var el, testRoot, client, conversation, query, user1;

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
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });

    if (layerUI.components['layer-conversation-view'] && !layerUI.components['layer-conversation-view'].classDef) layerUI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-message-list');
    testRoot.appendChild(el);
    testRoot.style.display = 'flex';
    testRoot.style.flexDirection = 'column';
    testRoot.style.height = '300px';
    query = client.createQuery({
      model: layer.Core.Query.Message,
      predicate: 'conversation.id = "' + conversation.id + '"'
    });
    query.isFiring = false;
    for (i = 0; i < 100; i++) {
      query.data.push(conversation.createMessage("m " + i).send());
    }

    user1 = new layer.Core.Identity({
      client: client,
      userId: 'SaurumanTheMildlyAged',
      displayName: 'Sauruman the Mildly Aged',
      id: 'layer:///identities/SaurumanTheMildlyAged',
      isFullIdentity: true
    });

    el.query = query;
    el.style.height = '300px';

    layer.Util.defer.flush();
    jasmine.clock().tick(500);
  });

  afterEach(function() {
    document.body.removeChild(testRoot);
    if (el) el.onDestroy();
    jasmine.clock().uninstall();
    layer.Core.Client.removeListenerForNewClient();
  });

  describe("The isDataLoading property", function() {
      it("Should initialize to hidden/false", function() {
        expect(el.isDataLoading).toBe(false);
        expect(el.nodes.loadIndicator.classList.contains('layer-loading-data')).toBe(false);
      });
      it("Should toggle the layer-loading-data class", function() {
        el.isDataLoading = true;
        expect(el.classList.contains('layer-loading-data')).toBe(true);

        el.isDataLoading = false;
        expect(el.classList.contains('layer-loading-data')).toBe(false);
      });
      it("Should reapply its isDataLoading value after onRerender", function() {
        el.isDataLoading = true;
        query.data = [];
        el.onRerender({type: "add", messages: []});
        expect(el.classList.contains('layer-loading-data')).toBe(true);
      });
    });

    describe("The dataLoadingNode property", function() {
      it("Should add/remove nodes", function() {
        var div = document.createElement("div");
        el.dataLoadingNode = div;
        expect(div.parentNode).toBe(el.nodes.loadIndicator);

        var div2 = document.createElement("div");
        el.dataLoadingNode = div2;

        expect(div.parentNode).toBe(null);
        expect(div2.parentNode).toBe(el.nodes.loadIndicator);
      });
    });
});