describe('layer-age', function() {
  var el;

  beforeAll(function(done) {
    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});
    setTimeout(done, 1000);
  });

  beforeEach(function() {
    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});
    el = document.createElement('layer-age');
    layer.Util.defer.flush();
  });

  afterEach(function() {
    layer.Core.Client.removeListenerForNewClient();
  });

  it('Should accept a date parameter', function() {
    var d = new Date();
    el.date = d;
    expect(el.date).toEqual(d);
  });

  it('Should use todayFormat if today', function() {
    var d = new Date();
    spyOn(d, "toLocaleString").and.callThrough();
    el.todayFormat = {hour: 'numeric'};
    el.weekFormat = {minute: 'numeric'};
    el.defaultFormat = {month: 'numeric'};
    el.olderFormat = {year: 'numeric'};
    el.date = d;
    expect(d.toLocaleString).toHaveBeenCalledWith('lookup', el.todayFormat);
    expect(el.innerHTML).toEqual(d.toLocaleString('lookup', el.todayFormat));
  });

  it('Should use weekFormat if week', function() {
    var d = new Date();
    d.setDate(d.getDate() - 3);
    spyOn(d, "toLocaleString").and.callThrough();
    el.todayFormat = {hour: 'numeric'};
    el.weekFormat = {minute: 'numeric'};
    el.defaultFormat = {month: 'numeric'};
    el.olderFormat = {year: 'numeric'};
    el.date = d;
    expect(d.toLocaleString).toHaveBeenCalledWith('lookup', el.weekFormat);
    expect(el.innerHTML).toEqual(d.toLocaleString('lookup', el.weekFormat));
  });

  it('Should use olderFormat if not this year', function() {
    var d = new Date();
    d.setFullYear(d.getFullYear() - 3);
    spyOn(d, "toLocaleString").and.callThrough();
    el.todayFormat = {hour: 'numeric'};
    el.weekFormat = {minute: 'numeric'};
    el.defaultFormat = {month: 'numeric'};
    el.olderFormat = {year: 'numeric'};
    el.date = d;
    expect(d.toLocaleString).toHaveBeenCalledWith('lookup', el.olderFormat);
    expect(el.innerHTML).toEqual(d.toLocaleString('lookup', el.olderFormat));
  });

  it('Should use defaultFormat if this year; will fail stupid test if run first week of january', function() {
    var d = new Date();
    d.setDate(d.getDate() - 8);
    spyOn(d, "toLocaleString").and.callThrough();
    el.todayFormat = {hour: 'numeric'};
    el.weekFormat = {minute: 'numeric'};
    el.defaultFormat = {month: 'numeric'};
    el.olderFormat = {year: 'numeric'};
    el.date = d;
    expect(d.toLocaleString).toHaveBeenCalledWith('lookup', el.defaultFormat);
    expect(el.innerHTML).toEqual(d.toLocaleString('lookup', el.defaultFormat));
  });

  it('Should rerender to empty', function() {
    var d = new Date();
    el.date = d;
    el.date = null;
    expect(el.innerHTML).toEqual('');
  });

  it("Should use dateRenderer if provided", function() {
    var f = function() {return "Some Day";}
    el.dateRenderer = f;
    var d = new Date();
    el.date = d;
    expect(el.innerHTML).toEqual("Some Day");
  });
});