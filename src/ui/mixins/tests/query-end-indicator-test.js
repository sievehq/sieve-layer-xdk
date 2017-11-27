// TODO: Apply this to a temporary list rather than an existing widget
describe("Query End Mixin", function() {

  var el, testRoot, client, conversation, query, user1;

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
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });

    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-message-list');
    testRoot.appendChild(el);
    testRoot.style.display = 'flex';
    testRoot.style.flexDirection = 'column';
    testRoot.style.height = '300px';
    query = client.createQuery({
      model: Layer.Core.Query.Message,
      predicate: 'conversation.id = "' + conversation.id + '"'
    });
    query.isFiring = false;
    for (i = 0; i < 100; i++) {
      query.data.push(conversation.createMessage("m " + i).send());
    }

    user1 = new Layer.Core.Identity({
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
    Layer.Core.Client.removeListenerForNewClient();
  });

  describe("The isEndOfResults property", function() {
      it("Should initialize to hidden/false", function() {
        expect(el.isEndOfResults).toBe(false);
        expect(el.nodes.endOfResultsNode.classList.contains('layer-end-of-results')).toBe(false);
      });
      it("Should toggle the layer-end-of-results class", function() {
        el.isEndOfResults = true;
        expect(el.classList.contains('layer-end-of-results')).toBe(true);

        el.isEndOfResults = false;
        expect(el.classList.contains('layer-end-of-results')).toBe(false);
      });
      it("Should reapply its isEndOfResults value after onRerender", function() {
        el.isEndOfResults = true;
        query.data = [];
        el.onRerender({type: "add", messages: []});
        expect(el.classList.contains('layer-end-of-results')).toBe(true);
      });
    });

    describe("The endOfResultsNode property", function() {
      it("Should add/remove nodes", function() {
        var div = document.createElement("div");
        el.endOfResultsNode = div;
        expect(div.parentNode).toBe(el.nodes.endOfResultsNode);

        var div2 = document.createElement("div");
        el.endOfResultsNode = div2;

        expect(div.parentNode).toBe(null);
        expect(div2.parentNode).toBe(el.nodes.endOfResultsNode);
      });
    });

   describe("The _renderPagedDataDone() method", function() {
    it("Should set isEndOfResults based on isDestroyed", function() {
      var fragment = document.createDocumentFragment();
      el.query.isDestroyed = true;
      el._renderPagedDataDone({}, fragment, {inRender: true});
      expect(el.isEndOfResults).toBe(false);
      el.query.isDestroyed = false;
    });

    it("Should set isEndOfResults based on pagedToEnd", function() {
      var fragment = document.createDocumentFragment();
      el.query.pagedToEnd = true;
      el._renderPagedDataDone({}, fragment, {inRender: true});
      expect(el.isEndOfResults).toBe(true);

      el.query.pagedToEnd = false;
      el._renderPagedDataDone({}, fragment, {inRender: true});
      expect(el.isEndOfResults).toBe(false);
    });
   });
});