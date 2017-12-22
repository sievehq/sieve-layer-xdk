describe("The Throttler Mixin", function() {
  beforeAll(function() {
    Layer.UI.registerComponent('throttler-test', {
      mixins: [Layer.UI.mixins.Throttler],
    });
  });

  var el, testRoot, client;

  beforeEach(function() {
    jasmine.clock().install();
    called = false;
    client = Layer.init({
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
    el = document.createElement('throttler-test');
    testRoot.appendChild(el);

    CustomElements.takeRecords();
    Layer.Util.defer.flush();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    document.body.removeChild(testRoot);
    Layer.Core.Client.removeListenerForNewClient();
    if (client) client.destroy();
  });
  it("Should call once within the timeout", function() {
    el._throttlerTimeout = 1000;
    var spy = jasmine.createSpy('callme');

    // Run
    el._throttler(spy);
    jasmine.clock().tick(100);
    el._throttler(spy);
    jasmine.clock().tick(100);
    el._throttler(spy);
    jasmine.clock().tick(100);
    el._throttler(spy);
    jasmine.clock().tick(100);
    el._throttler(spy);
    jasmine.clock().tick(1000);
    expect(spy.calls.count()).toEqual(1);
  });

  it("Should call once per timeout", function() {
    el._throttlerTimeout = 1000;
    var spy = jasmine.createSpy('callme');

    // Run
    el._throttler(spy);
    jasmine.clock().tick(1000);
    el._throttler(spy);
    jasmine.clock().tick(1000);
    el._throttler(spy);
    jasmine.clock().tick(1000);
    el._throttler(spy);
    jasmine.clock().tick(1000);
    el._throttler(spy);
    jasmine.clock().tick(1);
    el._throttler(spy);
    jasmine.clock().tick(1);
    el._throttler(spy);
    jasmine.clock().tick(1);
    el._throttler(spy);
    jasmine.clock().tick(1);
    el._throttler(spy);
    jasmine.clock().tick(1);
    expect(spy.calls.count()).toEqual(4);
  });
});