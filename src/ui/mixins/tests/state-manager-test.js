describe("State property", function() {
  var testRoot;

  beforeAll(function(done) {
    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({layer: layer});
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
