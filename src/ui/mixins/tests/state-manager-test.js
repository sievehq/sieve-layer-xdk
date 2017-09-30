describe("State property", function() {
  var testRoot;

  beforeAll(function(done) {
    if (layerUI.components['layer-conversation-view'] && !layerUI.components['layer-conversation-view'].classDef) layerUI.init({layer: layer});
    setTimeout(done, 1000);
  });

  beforeEach(function() {
    jasmine.clock().install();
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
  });

  afterEach(function() {
    try {
      jasmine.clock().uninstall();
      document.body.removeChild(testRoot);
      layer.Core.Client.removeListenerForNewClient();
    } catch(e) {}
  });

  it("Should trigger onRenderState", function() {
    layerUI.registerComponent('state-test1', {
      methods: {
        onRenderState: jasmine.createSpy('spy')
      }
    });
    var el = document.createElement('state-test1');
    layer.Util.defer.flush();
    expect(el.onRenderState).not.toHaveBeenCalled();

    el.state = {hey: "ho"};
    expect(el.onRenderState).toHaveBeenCalledWith();
  });

  it("Should not call onRenderState if no state is set", function() {
    layerUI.registerComponent('state-test3', {
      methods: {
        onRenderState: jasmine.createSpy('spy')
      }
    });
    var elParent = document.createElement('layer-avatar');
    var el = document.createElement('state-test3');
    elParent.appendChild(el);
    testRoot.appendChild(elParent);
    layer.Util.defer.flush();
    expect(el.state).toEqual(null);
    expect(el.onRenderState).not.toHaveBeenCalled();
  });
});
