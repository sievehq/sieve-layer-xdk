describe('layer-action-button', function() {
  var el;

  beforeAll(function(done) {
    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});
    setTimeout(done, 1000);
  });

  beforeEach(function() {
    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});
    el = document.createElement('layer-action-button');
    layer.Util.defer.flush();
  });

  afterEach(function() {
    Layer.Core.Client.removeListenerForNewClient();
  });
  it("Should have tests", function() {
    expect(1).toEqual(0);
  });
});