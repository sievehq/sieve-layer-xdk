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

  it("Should set the accept attribute", function() {
    el.accept = "application/pdf";
    expect(el.nodes.input.getAttribute('accept')).toEqual("application/pdf");
  });

  it("Should set the multiple attribute", function() {
    expect(el.nodes.input.multiple).toEqual(false);
    el.multiple = true;
    expect(el.nodes.input.multiple).toEqual(true);
  });

  it("Should trigger layer-files-selected onChange", function() {
    var file = new Blob(["abcdef"], {type: "crap/plain"});
    el.nodes.input = {
      files: [file]
    }

    var eventSpy = jasmine.createSpy('eventListener');
    el.addEventListener('layer-files-selected', eventSpy);


    // Run
    el.onChange();

    // Posttest
    var args = eventSpy.calls.allArgs()[0];
    expect(args.length).toEqual(1);
    expect(args[0].detail).toEqual({ files: [file] });
  });

  it("Should stop processing after layer-files-selected evt.preventDefault", function() {
    var file = new Blob(["abcdef"], {type: "crap/plain"});
    el.nodes.input = {
      files: [file]
    }

    el.addEventListener('layer-files-selected', function(evt) {
      evt.preventDefault();
    });

    var eventSpy = jasmine.createSpy('eventListener');
    el.addEventListener('layer-models-generated', eventSpy);

    // Run
    el.onChange();

    // Posttest
    var args = eventSpy.calls.allArgs()[0];
    expect(args).toBe(undefined);
  });

  it("Should trigger layer-models-generated", function() {
    var file = new Blob(["abcdef"], {type: "crap/plain"});
    el.nodes.input = {
      files: [file]
    }

    var eventSpy = jasmine.createSpy('eventListener');
    el.addEventListener('layer-models-generated', eventSpy);
    var FileModel = Layer.Core.Client.getMessageTypeModelClass('FileModel');

    // Run
    el.onChange();

    // Posttest
    var args = eventSpy.calls.allArgs()[0];
    expect(args.length).toEqual(1);
    expect(args[0].detail.models[0].source).toBe(file);
    expect(args[0].detail).toEqual({ models: [jasmine.any(FileModel)] });
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