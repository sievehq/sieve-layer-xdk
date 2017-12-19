describe('layer-start-of-conversation', function() {
  var el, testRoot, client, conversation;

  beforeAll(function(done) {
    setTimeout(done, 1000);
  });

  beforeEach(function() {
    client = new Layer.Core.Client({
      appId: 'layer:///apps/staging/Fred'
    });
    client.user = new Layer.Core.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      displayName: 'Frodo the Dodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true,
      sessionOwner: true
    });

    client._clientAuthenticated();

    if (Layer.UI.components['layer-conversation-view'] && !Layer.UI.components['layer-conversation-view'].classDef) Layer.UI.init({});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-start-of-conversation');
    conversation = client.createConversation({participants: ["a"]});

    Layer.Util.defer.flush();
  });

  afterEach(function() {
    Layer.Core.Client.removeListenerForNewClient();
    document.body.removeChild(testRoot);
  });

  it('Should set the date from the conversation', function() {
    el.conversation = conversation;
    expect(el.nodes.startDate.date).toBe(conversation.createdAt);
  });

  it('Should use todayFormat if today', function() {
    spyOn(conversation.createdAt, "toLocaleString").and.callThrough();
    var d = new Date(conversation.createdAt);
    el.dateFormat = {
      todayFormat: {hour: 'numeric'},
      weekFormat: {minute: 'numeric'},
      defaultFormat: {month: 'numeric'},
      olderFormat: {year: 'numeric'}
    };
    el.conversation = conversation;
    expect(conversation.createdAt.toLocaleString).toHaveBeenCalledWith(navigator.language, {hour: 'numeric'});
    expect(el.nodes.startDate.innerHTML).toEqual(d.toLocaleString(navigator.language, {hour: 'numeric'}));
  });
});