describe('layer-send-button', function() {
  var el, testRoot;
  beforeEach(function() {
    if (Layer.UI.components['layer-conversation-view'] && !Layer.UI.components['layer-conversation-view'].classDef) Layer.UI.init({});
    testRoot = document.createElement('div');
    el = document.createElement('layer-send-button');
    testRoot.appendChild(el);
    document.body.appendChild(testRoot);
    Layer.Utils.defer.flush();
  });

  afterEach(function() {
    if (el) el.destroy();
  });

  function click(el) {
    if (Layer.Utils.isIOS) {
      var evt = new Event('touchstart', { bubbles: true });
      evt.touches = [{screenX: 400, screenY: 400}];
      el.dispatchEvent(evt);

      var evt = new Event('touchend', { bubbles: true });
      evt.touches = [{screenX: 400, screenY: 400}];
      el.dispatchEvent(evt);
    } else {
      el.click();
    }
  }

  it("Should use the text property", function() {
    el.text = "hey ho";
    expect(el.firstChild.innerHTML).toEqual("hey ho");
  });

  it("Should trigger layer-send-click onClick", function() {
    var eventSpy = jasmine.createSpy('eventListener');
    document.body.addEventListener('layer-send-click', eventSpy);

    // Run
    click(el);

    // Posttest
    expect(eventSpy).toHaveBeenCalledWith(jasmine.any(Event));

    // Cleanup
    document.body.removeEventListener('layer-send-click', eventSpy);
  });
});