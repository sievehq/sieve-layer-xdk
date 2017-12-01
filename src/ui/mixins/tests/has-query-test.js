describe("Has Query Mixin", function() {
  beforeAll(function() {
    layerUI.registerComponent('has-query-test', {
      mixins: [Layer.UI.mixins.HasQuery, Layer.UI.mixins.MainComponent],
      properties: {
        _queryModel: {
          value: Layer.Core.Query.Identity
        },
        sortBy: {
          order: 10,
          value: [{ 'ardvarks': 'desc' }]
        },
      },
    });
  });

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
    el = document.createElement('has-query-test');
    testRoot.appendChild(el);
    query = client.createQuery({
      model: Layer.Core.Query.Identity
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
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    client.destroy();
    document.body.removeChild(testRoot);
    Layer.Core.Client.removeListenerForNewClient();
  });


  describe("The client property", function() {
    it("Should setup the query if there is a queryId", function() {
      testRoot.innerHTML = '<has-query-test use-generated-query="false" query-id="' + query.id + '"></has-query-test>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      el = testRoot.firstChild;
      expect(el.query).toBe(null);
      el.client = client;
      expect(el.query).toBe(query);

      // Inverse test
      testRoot.innerHTML = '<has-query-test use-generated-query="false"></has-query-test>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      el = testRoot.firstChild;
      expect(el.query).toBe(null);
      el.client = client;
      expect(el.query).toBe(null);
    });


    it("Should call _setupGeneratedQuery once the client is set", function() {
        testRoot.innerHTML = '<has-query-test></has-query-test>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        layer.Util.defer.flush();
        spyOn(el, "_setupGeneratedQuery");
        el.client = client;
        expect(el._setupGeneratedQuery).toHaveBeenCalledWith();
      });

      it("Should not call _setupGeneratedQuery once the client is set if useGeneratedQuery is false", function() {
        testRoot.innerHTML = '<has-query-test use-generated-query="false"></has-query-test>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        layer.Util.defer.flush();
        spyOn(el, "_setupGeneratedQuery");
        el.client = client;
        expect(el.useGeneratedQuery).toBe(false);
        expect(el._setupGeneratedQuery).not.toHaveBeenCalledWith();
      });
  });

  describe("The query property", function() {
    it("Should disconnect from old query but not destroy it", function() {
      var query = client.createQuery({
        model: Layer.Core.Query.Conversation
      });
      var oldQuery = el.query;
      expect(oldQuery.isDestroyed).toBe(false);
      spyOn(oldQuery, "off");

      // Run
      el.query = query;

      // Posttest
      expect(oldQuery.off).toHaveBeenCalledWith(null, null, el);
      expect(oldQuery.isDestroyed).toBe(false);
    });

    it("Should destroy old query if generated and set generated to false", function() {
      var query = client.createQuery({
        model: Layer.Core.Query.Conversation
      });
      var oldQuery = el.query;
      expect(oldQuery.isDestroyed).toBe(false);
      el.hasGeneratedQuery = true;

      // Run
      el.query = query;

      // Posttest
      expect(oldQuery.isDestroyed).toBe(true);
    });

    it("Should call _updateQuery", function() {
      var query = client.createQuery({
        model: Layer.Core.Query.Conversation
      });
      spyOn(el, "_updateQuery");

      // Run
      el.query = query;

      // Posttest
      expect(el._updateQuery).toHaveBeenCalledWith();
    });

    it("Should reject invalid Query objects", function() {
      var query = {}
      spyOn(el, "_updateQuery");

      // Run
      el.query = query;

      // Posttest
      expect(el._updateQuery).not.toHaveBeenCalledWith();
    });
  });

  describe("The queryId property", function() {
    it("Should validate that its a Query ID", function() {
      el.queryId = "fred";
      expect(el.queryId).toEqual("");
    });

    it("Should set the query if there is a client", function() {
      expect(el.client).not.toBe(null);
      el.query = null;
      expect(el.query).toBe(null);
      el.queryId = query.id;
      expect(el.query).toBe(query);
    });

    it("Should not set the query if there is not a client", function() {
      el.client = null;
      el.query = null;
      expect(el.query).toBe(null);
      el.queryId = query.id;
      expect(el.query).toBe(null);
    });

    it("Should clear the query if there is not a Query ID", function() {
      expect(el.query).not.toBe(null);
      el.queryId = "fred";
      expect(el.query).toBe(null);
    });
  });

  describe("The _setupGeneratedQuery() method", function() {
      it("Should create a query if this._queryModel && !this.query && this.client", function() {
        // Main test
        testRoot.innerHTML = '<has-query-test app-id="' + client.appId + '"></has-query-test>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();
        var el = testRoot.firstChild;
        el._setupGeneratedQuery();
        expect(el.query).toEqual(jasmine.any(Layer.Core.Query));
        expect(el.query.model).toEqual(Layer.Core.Query.Identity);

        // Alt test 1
        testRoot.innerHTML = '<has-query-test app-id="' + client.appId + '"></has-query-test>';
        var el = testRoot.firstChild;
        el._queryModel = '';
        CustomElements.takeRecords();
        layer.Util.defer.flush();

        el._setupGeneratedQuery();
        expect(el.query).toBe(null);

        // Alt test 2
        var tmp = layerUI.appId;
        layerUI.appId = '';
        testRoot.innerHTML = '<has-query-test></has-query-test>';
        var el = testRoot.firstChild;
        CustomElements.takeRecords();
        layer.Util.defer.flush();

        el._setupGeneratedQuery();
        expect(el.query).toBe(null);

        // Restore
        layerUI.appId = tmp;

        // Alt test 3
        testRoot.innerHTML = '<has-query-test app-id="' + client.appId + '"></has-query-test>';
        var el = testRoot.firstChild;
        CustomElements.takeRecords();
        layer.Util.defer.flush();

        el.query = query;
        el._setupGeneratedQuery();
        expect(el.query).toBe(query);
      });

      it("Should set hasGeneratedQuery if the query was set", function() {
        // Main test
        testRoot.innerHTML = '<has-query-test use-generated-query="false" app-id="' + client.appId + '"></has-query-test>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();
        var el = testRoot.firstChild;
        el._setupGeneratedQuery();
        expect(el.hasGeneratedQuery).toBe(true);

        // Alt test 1; no _queryModel
        testRoot.innerHTML = '<has-query-test use-generated-query="false" app-id="' + client.appId + '"></has-query-test>';
        el = testRoot.firstChild;
        el._queryModel = '';
        CustomElements.takeRecords();
        layer.Util.defer.flush();
        el._setupGeneratedQuery();
        expect(el.hasGeneratedQuery).toBe(false);

        // Alt test 2, no appId
        var tmp = layerUI.appId;
        layerUI.appId = '';
        testRoot.innerHTML = '<has-query-test use-generated-query="false"></has-query-test>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();
        var el = testRoot.firstChild;
        el._setupGeneratedQuery();
        expect(el.hasGeneratedQuery).toBe(false);
        layerUI.appId = tmp;

        // Alt test 3, set a query
        testRoot.innerHTML = '<has-query-test use-generated-query="false" app-id="' + client.appId + '"></has-query-test>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();
        var el = testRoot.firstChild;
        el.query = query;
        el._setupGeneratedQuery();
        expect(el.hasGeneratedQuery).toBe(false);
      });

      it("Should respect any sortBy property", function() {
        testRoot.innerHTML = '<has-query-test use-generated-query="false" app-id="' + client.appId + '"></has-query-test>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();
        var el = testRoot.firstChild;
        el._setupGeneratedQuery();
        expect(el.query.sortBy).toEqual([{ 'ardvarks': 'desc' }]);
      });
    });

    describe("The _updateQuery() method", function() {
      it("Should update the client if its unset", function() {
        el.client = null;
        el.query = null;
        el.properties.query = query;
        el._updateQuery();
        expect(el.client).toBe(client);
      });

      it("Should call onRender", function() {
        spyOn(el, "onRender");
        el._updateQuery();
        expect(el.onRender).toHaveBeenCalled();
      });

      it("Should subscribe to changes and call onRerender on change", function() {
        spyOn(el, "onRerender");
        el._updateQuery();
        el.query.trigger("change");
        expect(el.onRerender).toHaveBeenCalled();
      });
    });

    describe("They queryFilter property", function() {
      it("Should prevent data from entering the query data list", function() {
        expect(1).toEqual(0);
      });
    });
});