describe("List Item Selection Mixin", function() {

    var el, testRoot, client;
  beforeEach(function() {
    jasmine.clock().install();
    client = new Layer.Core.Client({
      appId: 'Fred'
    });
    client.user = new Layer.Core.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      id: 'layer:///identities/FrodoTheDodo',
      displayName: 'Frodo is a Dodo',
      isFullIdentity: true
    });
    client._clientAuthenticated();

    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-conversation-item');
    testRoot.appendChild(el);
    layer.Util.defer.flush();
    jasmine.clock().tick(1000);
    layer.Util.defer.flush();
    jasmine.clock().tick(10);
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    document.body.removeChild(testRoot);
    Layer.Core.Client.removeListenerForNewClient();
  });


  it("Should add and remove the layer-selected-item class", function() {
    expect(el.classList.contains('layer-selected-item')).toBe(false);
    el.isSelected = true;
    expect(el.classList.contains('layer-selected-item')).toBe(true);
    el.isSelected = false;
    expect(el.classList.contains('layer-selected-item')).toBe(false);
  });

  it("Should call onSelection", function() {
    spyOn(el, "onSelection");
    el.isSelected = true;
    expect(el.onSelection).toHaveBeenCalledWith(true);
    el.isSelected = false;
    expect(el.onSelection).toHaveBeenCalledWith(false);
  });
});
