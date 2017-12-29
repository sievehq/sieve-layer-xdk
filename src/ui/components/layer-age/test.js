describe('layer-age', function() {
  var el;

  beforeAll(function(done) {
    if (Layer.UI.components['layer-conversation-view'] && !Layer.UI.components['layer-conversation-view'].classDef) Layer.UI.init({});
    setTimeout(done, 1000);
  });

  beforeEach(function() {
    if (Layer.UI.components['layer-conversation-view'] && !Layer.UI.components['layer-conversation-view'].classDef) Layer.UI.init({});
    el = document.createElement('layer-age');
    layer.Util.defer.flush();
  });

  afterEach(function() {
    Layer.Core.Client.removeListenerForNewClient();
  });

  it('Should accept a date parameter', function() {
    var d = new Date();
    el.date = d;
    expect(el.date).toEqual(d);
  });

  it("Should accept an ageRenderer", function() {
    var f = jasmine.createSpy('age');
    el.ageRenderer = f;
    var d = new Date();
    el.date = d;
    expect(el.ageRenderer).toBe(f);
    el.onRender();
    expect(f).toHaveBeenCalledWith(d);
  });

  it('Should handle absense of value', function() {
    el.onRender();
    expect(el.innerHTML).toEqual("Never Used");
  });

  it('Should handle minutes ago', function() {
    var d = new Date();
    el.date = d;

    el.onRender();
    expect(el.innerHTML).toEqual("");

    d.setMinutes(d.getMinutes() - 1);
    el.onRender();
    expect(el.innerHTML).toEqual("1 min ago");

    d.setMinutes(d.getMinutes() - 1);
    el.onRender();
    expect(el.innerHTML).toEqual("2 mins ago");

    d.setMinutes(d.getMinutes() - 98);
    el.onRender();
    expect(el.innerHTML).toEqual("100 mins ago");

    d.setMinutes(d.getMinutes() - 20);
    el.onRender();
    expect(el.innerHTML).not.toEqual("120 mins ago");
  });

  it('Should handle hours ago', function() {
    var d = new Date();
    el.date = d;

    d.setMinutes(d.getMinutes() - 120);
    el.onRender();
    expect(el.innerHTML).toEqual("2 hours ago");

    d.setHours(d.getHours() - 10);
    el.onRender();
    expect(el.innerHTML).toEqual("12 hours ago");

    d.setHours(d.getHours() - 30);
    el.onRender();
    expect(el.innerHTML).toEqual("42 hours ago");

    d.setHours(d.getHours() - 10);
    el.onRender();
    expect(el.innerHTML).not.toEqual("52 hours ago");
  });

  it('Should handle days ago', function() {
    var d = new Date();
    el.date = d;

    d.setDate(d.getDate() - 2);
    el.onRender();
    expect(el.innerHTML).toEqual("2 days ago");

    d.setDate(d.getDate() - 10);
    el.onRender();
    expect(el.innerHTML).toEqual("12 days ago");

    d.setDate(d.getDate() - 30);
    el.onRender();
    expect(el.innerHTML).toEqual("42 days ago");

    d.setDate(d.getDate() - 30);
    el.onRender();
    expect(el.innerHTML).not.toEqual("72 days ago");
  });

  it('Should handle months ago', function() {
    var d = new Date();
    el.date = d;

    d.setMonth(d.getMonth() - 2);
    el.onRender();
    expect(el.innerHTML).toEqual("2 months ago");

    d.setMonth(d.getMonth() - 9);
    el.onRender();
    expect(el.innerHTML).toEqual("11 months ago");

    d.setMonth(d.getMonth() - 1);
    el.onRender();
    expect(el.innerHTML).not.toEqual("12 months ago");
  });
});