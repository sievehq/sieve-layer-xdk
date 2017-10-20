describe("List Selection Mixin", function() {

  var el, testRoot, client, query;

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
      isFullIdentity: true
    });
    client._clientAuthenticated();


    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-conversation-list');
    testRoot.appendChild(el);
    query = client.createQuery({
      model: layer.Core.Query.Conversation
    });
    query.isFiring = false;
    for (i = 0; i < 100; i++) {
      query.data.push(
        new layer.Conversation({
          client: client,
          participants: [client.user],
          id: 'layer:///conversations/c' + i,
          distinct: false,
          metadata: {conversationName: "C " + i}
        })
      );
    }
    el.query = query;
    layer.Util.defer.flush();
    jasmine.clock().tick(50);
    layer.Util.defer.flush();
    jasmine.clock().tick(50);

  });

  afterEach(function() {
    try {
      jasmine.clock().uninstall();
      document.body.removeChild(testRoot);
      layer.Core.Client.removeListenerForNewClient();
      if (el) el.onDestroy();
    } catch(e) {}
  });

  describe("The selectedId property", function() {
    it("Should set isSelected for the specified item", function() {
      expect(el.childNodes[5].isSelected).toBe(false);
      el.selectedId = el.childNodes[5].item.id;
      expect(el.childNodes[5].isSelected).toBe(true);
    });

    it("Should clear isSelected for the last selected item", function() {
      el.selectedId = el.childNodes[5].item.id;
      expect(el.childNodes[5].isSelected).toBe(true);
      expect(el.selectedId).toEqual(el.childNodes[5].item.id);
      el.selectedId = el.childNodes[6].item.id;
      expect(el.childNodes[5].isSelected).toBe(false);
    });

    it("Should set isSelected when generating items", function() {
      var query2 = new layer.Core.Query({
        client: client,
      });
      el.query = query2;
      expect(el.childNodes.length).toBe(1);
      el.selectedId = query.data[5].id;
      el.query = query;
      expect(el.childNodes[5].isSelected).toBe(true);
    });

    it("Should trigger change events", function() {
      var calledWith;
      document.addEventListener('layer-conversation-selected', function(evt) {calledWith = evt;});
      el.selectedId = el.childNodes[5].item.id;
      expect(el.childNodes[5].isSelected).toBe(true);
      expect(calledWith.detail).toEqual({
        item: el.childNodes[5].item
      });
    });

    it("Should be cancelable trigger", function() {
      var f = function(evt) {evt.preventDefault();};
      document.addEventListener('layer-conversation-selected', f);
      el.selectedId = el.childNodes[5].item.id;
      expect(el.childNodes[5].isSelected).toBe(false);
      expect(el.selectedId).not.toEqual(el.childNodes[5].item.id);
      document.removeEventListener('layer-conversation-selected', f);
    });
  });

  describe("User Selection Handling", function() {
    it("Should wire up _onClick and onClick", function() {
      spyOn(el, "onClick");
      el.click();
      expect(el.onClick).toHaveBeenCalled();
    });

    it("Should trigger a cancelable event", function() {
      el.addEventListener('layer-conversation-selected', function(evt) {
        evt.preventDefault();
        expect(evt.detail).toEqual({
          item: el.childNodes[5].item,
        });
      });
      el.childNodes[5].click();
      expect(el.childNodes[5].isSelected).toBe(false);
    });

    it("Should select the item if not canceled", function() {
      el.childNodes[5].click();
      expect(el.childNodes[5].isSelected).toBe(true);
    });

    it("Should call onClick", function() {
      spyOn(el, "onClick");
      el.click();
      expect(el.onClick).toHaveBeenCalledWith(jasmine.any(Event));
    });
  });
});
