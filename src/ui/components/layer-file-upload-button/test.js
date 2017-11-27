describe('layer-file-upload-button', function() {
  var el, testRoot;

  beforeAll(function(done) {
    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});
    setTimeout(done, 1000);
  });

  beforeEach(function() {
    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});
    testRoot = document.createElement('div');
    el = document.createElement('layer-file-upload-button');
    testRoot.appendChild(el);
    document.body.appendChild(testRoot);
    layer.Util.defer.flush();
  });

  afterEach(function() {
    Layer.Core.Client.removeListenerForNewClient();
  });

  it("Should setup a label pointing to a file input", function() {
    expect(el.nodes.label.getAttribute("for")).toEqual(el.nodes.input.id);
    expect(el.nodes.input.id.length > 0).toBe(true);
  });

  it("Should call layerUI.files.processAttachments onChange", function() {
    var spy = jasmine.createSpy('processAttachments');
    var tmp = layerUI.files.processAttachments;
    layerUI.files.processAttachments = spy;
    el.nodes.input = {
      files: []
    }

    // Run
    el.onChange();

    // Posttest
    expect(spy).toHaveBeenCalledWith([], jasmine.any(Function));

    // Cleanup
    layerUI.files.processAttachments = tmp;
  });

  it("Should set the accept attribute", function() {
    el.accept = "application/pdf";
    expect(el.nodes.input.getAttribute('accept')).toEqual("application/pdf");
  });

  it("Should trigger layer-file-selected onChange", function() {
    var part = new Layer.Core.MessagePart({body: "Frodo is a Dodo", mimeType: "text/plain"});
    var spy = jasmine.createSpy('processAttachments').and.callFake(function(a, callback) {
      callback([part]);
    });
    var tmp = layerUI.files.processAttachments;
    layerUI.files.processAttachments = spy;
    el.nodes.input = {
      files: []
    }

    var eventSpy = jasmine.createSpy('eventListener');
    document.body.addEventListener('layer-file-selected', eventSpy);

    // Run
    el.onChange();

    // Posttest
    var args = eventSpy.calls.allArgs()[0];
    expect(args.length).toEqual(1);
    expect(args[0].detail).toEqual({ parts: [part] });

    // Cleanup
    layerUI.files.processAttachments = tmp;
  });

  // This test causes IE to open a file dialog, and no more tests run after that.
  xit("Should forward clicks to the input", function() {
    var called = false;

    el.nodes.input.addEventListener('click', function() {
      called = true;
    });


    // Run
    el.nodes.label.click();
    expect(called).toBe(true);
  });
});