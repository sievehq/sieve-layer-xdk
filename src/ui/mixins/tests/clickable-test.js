describe("The Clickable Mixin", function() {
  beforeAll(function() {
    Layer.UI.registerComponent('clickable-mixin-test', {
      mixins: [Layer.UI.mixins.Clickable],
      methods: {
        onCreate: function() {
          this.addClickHandler('random', this, this.onClick.bind(this));
        },
        onClick: function() {
          this.trigger('test-click');
        }
      }
    });
  });

  var el, testRoot, client, called;

  beforeEach(function() {
    jasmine.clock().install();
    called = false;
    client = new Layer.Core.Client({
      appId: 'layer:///apps/staging/Fred'
    });
    client.user = new Layer.Core.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      displayName: 'Frodo the Dodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true
    });
    client._clientAuthenticated();

    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('clickable-mixin-test');
    testRoot.appendChild(el);

    CustomElements.takeRecords();
    layer.Util.defer.flush();
  });
  it("Should respond to click events", function() {
    el.addEventListener('test-click', function() { called = true });

    // Run
    el.click();

    // Posttest
    expect(called).toBe(true);
  });

  it("Should respond to tap events", function() {
    el.addEventListener('test-click', function() { called = true });

    // Run
    var e = new Event('tap');
    el.dispatchEvent(e);

    // Posttest
    expect(called).toBe(true);
  });

  it("Should remove click events", function() {
    el.removeClickHandler('random', el);
    el.addEventListener('test-click', function() { called = true });

    // Run
    el.click();

    // Posttest
    expect(called).toBe(false);
  });

  it("Should remove tap events", function() {
    el.removeClickHandler('random', el);
    el.addEventListener('test-click', function() { called = true });

    // Run
    var e = new Event('tap');
    el.dispatchEvent(e);

    // Posttest
    expect(called).toBe(false);
  });
});