describe('layer-menu-button', function() {
  var el, testRoot, client;
  beforeEach(function() {
    client = new Layer.init({
      appId: 'Fred'
    });
    client.user = new Layer.Core.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true
    });
    client._clientAuthenticated();

    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-menu-button');
    testRoot.appendChild(el);
    el.enabled = true;
    Layer.Utils.defer.flush();
  });

  afterEach(function() {
    if (client) client.destroy();
    document.body.removeChild(testRoot);
    Layer.Core.Client.removeListenerForNewClient();
  });

  it("Should wire up the button to call onButtonClick", function() {
    var menus = document.querySelectorAll('layer-menu');
    for (var i = 0; i < menus.length; i++) menus[i].parentNode.removeChild(menus[i]);
    expect(document.querySelectorAll('layer-menu').length).toEqual(0);
    el.click();
    expect(document.querySelectorAll('layer-menu').length).toEqual(1);
  });

  it("Should apply menuWidth", function() {
    el.menuWidth = 345;
    el.click();
    expect(document.querySelector('layer-menu').style.minWidth).toEqual('345px');
  });

  it("Should apply the item property", function() {
    el.item = "Frodo";
    var calledWith;
    el.getMenuOptions = function(item) {
      calledWith = item;
    };
    el.click();
    expect(calledWith).toEqual("Frodo");
  });

  it("Should apply menu options to the menu", function() {
    var options = [];
    el.getMenuOptions = function() {return options;};
    el.click();
    expect(document.querySelector('layer-menu').items).toBe(options);
  });
});