describe('layer-action-button', function() {
  var el, testRoot;

  beforeAll(function(done) {
    if (Layer.UI.components['layer-conversation-view'] && !Layer.UI.components['layer-conversation-view'].classDef) Layer.UI.init({});
    setTimeout(done, 1000);
  });

  beforeEach(function() {
    if (Layer.UI.components['layer-conversation-view'] && !Layer.UI.components['layer-conversation-view'].classDef) Layer.UI.init({});
    el = document.createElement('layer-action-button');
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    testRoot.appendChild(el);
    Layer.Utils.defer.flush();
  });

  afterEach(function() {
    Layer.Core.Client.removeListenerForNewClient();
    document.body.removeChild(testRoot);
  })
  ;
  it("Should set the button text", function() {
    el.text = "hey ho";
    expect(el.nodes.button.innerHTML).toEqual("hey ho");
  });

  it("Should set the tooltip", function() {
    el.tooltip = "hey ho";
    expect(el.nodes.button.title).toEqual("hey ho");
  });

  it("Should set and use the event", function() {
    el.event = "kill-frodo-the-dodo";
    var spy = jasmine.createSpy('callback');
    el.addEventListener("kill-frodo-the-dodo", spy);
    el.click();
    expect(spy).toHaveBeenCalledWith(jasmine.any(Event));
  });

  it("Should set and use the data", function() {
    el.event = "kill-frodo-the-dodo";
    el.data = {howdy: "ho"}
    var eventData;
    el.addEventListener("kill-frodo-the-dodo", function(evt) {
      eventData = evt.detail;
    });
    el.click();
    expect(eventData).toEqual({howdy: "ho"});
  });

  it("Should get and set disabled state", function() {
    el.disabled = true;
    expect(el.nodes.button.disabled).toBe(true);
    el.disabled = false;
    expect(el.nodes.button.disabled).toBe(false);
  });
});
