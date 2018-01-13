describe('layer-loading-indicator', function() {
  var el;

  beforeAll(function(done) {
    if (Layer.UI.components['layer-conversation-view'] && !Layer.UI.components['layer-conversation-view'].classDef) Layer.UI.init({});
    setTimeout(done, 1000);
  });

  beforeEach(function() {
    if (Layer.UI.components['layer-conversation-view'] && !Layer.UI.components['layer-conversation-view'].classDef) Layer.UI.init({});
    el = document.createElement('layer-loading-indicator');
    Layer.Utils.defer.flush();
  });

  afterEach(function() {

  });
  it("Should be so dumb it doesn't need tests", function() {
    expect(el.properties).toEqual(jasmine.objectContaining({
      _internalState: jasmine.objectContaining({}),
    }));
  });
});
