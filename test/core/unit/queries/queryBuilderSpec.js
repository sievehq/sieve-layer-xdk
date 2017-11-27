/* eslint-disable */
describe("The QueryBuilder Classes", function() {

    var appId = "Fred's App";

    var client;

    beforeEach(function() {
        jasmine.clock().install();
        jasmine.Ajax.install();
        client = new Layer.Core.Client({
            appId: appId,
            url: "https://huh.com"
        });
        client.sessionToken = "sessionToken";
        client.userId = "Frodo";
    });

    afterEach(function() {
        client.destroy();
        jasmine.Ajax.uninstall();
        jasmine.clock().uninstall();
    });

    afterAll(function() {
        Layer.Core.Client.destroyAllClients();
    });

    describe("The fromQueryObject() method", function() {
        it("Should return a new MessageQuery", function() {
            var q = new Layer.Core.Query({
                client: client,
                model: "Message"
            });
            expect(Layer.Core.QueryBuilder.fromQueryObject(q).forConversation(responses.conversation1.id).build()).toEqual(jasmine.objectContaining({
                model: "Message",
                predicate: "conversation.id = '" + responses.conversation1.id + "'"
            }));
        });

        it("Should return a new ConversationQuery", function() {
            var q = new Layer.Core.Query({
                client: client,
                model: "Conversation"
            });
            expect(Layer.Core.QueryBuilder.fromQueryObject(q).build()).toEqual(jasmine.objectContaining({
                model: "Conversation"
            }));

        });

        it("Should return a null", function() {
            var q = new Layer.Core.Query({
                client: client,
                model: "Fred"
            });
            expect(Layer.Core.QueryBuilder.fromQueryObject(q)).toBe(null);
        });
    });


    describe("The MessagesQueryBuilder Class", function() {

        describe("The constructor() method", function() {
            it("Should not require parameters", function() {
                var builder = Layer.Core.QueryBuilder.messages();
                builder._conversationIdSet = true;
                expect(builder.build()).toEqual({
                    model: 'Message',
                    returnType: 'object',
                    dataType: 'object',
                    paginationWindow: Layer.Core.Query.prototype.paginationWindow
                });
            });

            it("Should initialize from a Query", function() {
                var query = new Layer.Core.Query({
                    client: client,
                    model: "Message",
                    dataType: "instance",
                    returnType: "object"
                });
                var builder = Layer.Core.QueryBuilder.fromQueryObject(query);
                builder._conversationIdSet = true;
                expect(builder.build()).toEqual({
                    model: 'Message',
                    returnType: 'object',
                    dataType: 'instance',
                    paginationWindow: Layer.Core.Query.prototype.paginationWindow
                });
            });
        });


        describe("The forConversation() method", function() {
            it("Should update the predicate if it has a value", function() {
                var builder = Layer.Core.QueryBuilder.messages().forConversation(responses.conversation1.id);
                expect(builder.build()).toEqual({
                    model: 'Message',
                    returnType: 'object',
                    dataType: 'object',
                    predicate: "conversation.id = '" + responses.conversation1.id + "'",
                    paginationWindow: Layer.Core.Query.prototype.paginationWindow
                });
            });

            it("Should clear the predicate if it has no value", function() {
                var builder = Layer.Core.QueryBuilder.messages().forConversation("");
                builder._conversationIdSet = true;
                expect(builder.build()).toEqual({
                    model: 'Message',
                    returnType: 'object',
                    dataType: 'object',
                    predicate: '',
                    paginationWindow: Layer.Core.Query.prototype.paginationWindow
                });
            });

            it("Should update the predicate to a channel", function() {
                var builder = Layer.Core.QueryBuilder.messages().forConversation(responses.channel1.id);
                expect(builder.build()).toEqual({
                    model: 'Message',
                    returnType: 'object',
                    dataType: 'object',
                    predicate: "channel.id = '" + responses.channel1.id + "'",
                    paginationWindow: Layer.Core.Query.prototype.paginationWindow
                });
            });
        });

        describe("The paginationWindow() method", function() {
            it("Should update the paginationWindow property", function() {
                var builder = Layer.Core.QueryBuilder.messages().paginationWindow(5);
                builder._conversationIdSet = true;
                expect(builder.build()).toEqual({
                    model: 'Message',
                    returnType: 'object',
                    dataType: 'object',
                    paginationWindow: 5
                });
            });
        });

        describe("The build() method", function() {
            it("Should not require a conversationId", function() {
                var builder = Layer.Core.QueryBuilder.messages();
                expect(builder.build()).toEqual({
                    model: 'Message',
                    returnType: 'object',
                    dataType: 'object',
                    paginationWindow: 100
                });
            });
        });
    });

    describe("The AnnouncementsQueryBuilder Class", function() {

        describe("The constructor() method", function() {
            it("Should not require parameters", function() {
                var builder = Layer.Core.QueryBuilder.announcements();
                expect(builder.build()).toEqual({
                    model: 'Announcement',
                    returnType: 'object',
                    dataType: 'object',
                    paginationWindow: Layer.Core.Query.prototype.paginationWindow
                });
            });

            it("Should initialize from a Query", function() {
                var query = new Layer.Core.Query({
                    client: client,
                    model: "Announcement",
                    dataType: "instance",
                    returnType: "object"
                });
                var builder = Layer.Core.QueryBuilder.fromQueryObject(query);
                expect(builder.build()).toEqual({
                    model: 'Announcement',
                    returnType: 'object',
                    dataType: 'instance',
                    paginationWindow: Layer.Core.Query.prototype.paginationWindow
                });
            });
        });

        describe("The paginationWindow() method", function() {
            it("Should update the paginationWindow property", function() {
                var builder = Layer.Core.QueryBuilder.announcements().paginationWindow(5);
                builder._conversationIdSet = true;
                expect(builder.build()).toEqual({
                    model: 'Announcement',
                    returnType: 'object',
                    dataType: 'object',
                    paginationWindow: 5
                });
            });
        });
    });

    describe("The IdentitiesQueryBuilder Class", function() {

        describe("The constructor() method", function() {
            it("Should not require parameters", function() {
                var builder = Layer.Core.QueryBuilder.identities();
                expect(builder.build()).toEqual({
                    model: 'Identity',
                    returnType: 'object',
                    dataType: 'object',
                    paginationWindow: Layer.Core.Query.prototype.paginationWindow
                });
            });

            it("Should initialize from a Query", function() {
                var query = new Layer.Core.Query({
                    client: client,
                    model: "Identity",
                    dataType: "instance",
                    returnType: "object"
                });
                var builder = Layer.Core.QueryBuilder.fromQueryObject(query);
                expect(builder.build()).toEqual({
                    model: 'Identity',
                    returnType: 'object',
                    dataType: 'instance',
                    paginationWindow: Layer.Core.Query.prototype.paginationWindow
                });
            });
        });

        describe("The paginationWindow() method", function() {
            it("Should update the paginationWindow property", function() {
                var builder = Layer.Core.QueryBuilder.identities().paginationWindow(5);
                builder._conversationIdSet = true;
                expect(builder.build()).toEqual({
                    model: 'Identity',
                    returnType: 'object',
                    dataType: 'object',
                    paginationWindow: 5
                });
            });
        });
    });

    describe("The ConversationsQueryBuilder Class", function() {
        describe("The constructor() method", function() {
            it("Should not require parameters", function() {
                var builder = Layer.Core.QueryBuilder.conversations();
                builder._conversationIdSet = true;
                expect(builder.build()).toEqual({
                    model: 'Conversation',
                    returnType: 'object',
                    dataType: 'object',
                    paginationWindow: Layer.Core.Query.prototype.paginationWindow,
                    sortBy: null
                });
            });

            it("Should initialize from a Query", function() {
                var query = new Layer.Core.Query({
                    client: client,
                    model: 'Conversation',
                    returnType: 'count',
                    dataType: 'instance'
                });
                var builder = Layer.Core.QueryBuilder.fromQueryObject(query);
                builder._conversationIdSet = true;
                expect(builder.build()).toEqual({
                    model: 'Conversation',
                    returnType: 'count',
                    dataType: 'instance',
                    paginationWindow: Layer.Core.Query.prototype.paginationWindow,
                    sortBy: null
                });
            });
        });

        describe("The paginationWindow() method", function() {
            it("Should update the paginationWindow property", function() {
                var builder = Layer.Core.QueryBuilder.conversations().paginationWindow(5);
                builder._conversationIdSet = true;
                expect(builder.build()).toEqual({
                    model: 'Conversation',
                    returnType: 'object',
                    dataType: 'object',
                    paginationWindow: 5,
                    sortBy: null
                });
            });
        });

        describe("The sortBy() method", function() {
            it("Should update the sortBy property to lastMessage.sentAt with DESC default", function() {
                var builder = Layer.Core.QueryBuilder.conversations().sortBy("lastMessage.sentAt");
                builder._conversationIdSet = true;
                expect(builder.build()).toEqual({
                    model: 'Conversation',
                    returnType: 'object',
                    dataType: 'object',
                    sortBy: [{'lastMessage.sentAt': 'desc'}],
                    paginationWindow: 100
                });
            });

            it("Should update the sortBy property to createdAt with explicit DESC", function() {
                var builder = Layer.Core.QueryBuilder.conversations().sortBy("createdAt", false);
                builder._conversationIdSet = true;
                expect(builder.build()).toEqual({
                    model: 'Conversation',
                    returnType: 'object',
                    dataType: 'object',
                    sortBy: [{'createdAt': 'desc'}],
                    paginationWindow: 100
                });
            });

            it("Should update the sortBy property to createdAt with ASC", function() {
                var builder = Layer.Core.QueryBuilder.conversations().sortBy("createdAt", true);
                builder._conversationIdSet = true;
                expect(builder.build()).toEqual({
                    model: 'Conversation',
                    returnType: 'object',
                    dataType: 'object',
                    sortBy: [{'createdAt': 'asc'}],
                    paginationWindow: 100
                });
            });
        });
    });


    describe("The ChannelsQueryBuilder Class", function() {
        describe("The constructor() method", function() {
            it("Should not require parameters", function() {
                var builder = Layer.Core.QueryBuilder.channels();
                expect(builder.build()).toEqual({
                    model: 'Channel',
                    returnType: 'object',
                    dataType: 'object',
                    paginationWindow: Layer.Core.Query.prototype.paginationWindow,
                    sortBy: null
                });
            });

            it("Should initialize from a Query", function() {
                var query = new Layer.Core.Query({
                    client: client,
                    model: 'Channel',
                    returnType: 'count',
                    dataType: 'instance'
                });
                var builder = Layer.Core.QueryBuilder.fromQueryObject(query);
                expect(builder.build()).toEqual({
                    model: 'Channel',
                    returnType: 'count',
                    dataType: 'instance',
                    paginationWindow: Layer.Core.Query.prototype.paginationWindow,
                    sortBy: null
                });
            });
        });

        describe("The paginationWindow() method", function() {
            it("Should update the paginationWindow property", function() {
                var builder = Layer.Core.QueryBuilder.channels().paginationWindow(5);
                builder._conversationIdSet = true;
                expect(builder.build()).toEqual({
                    model: 'Channel',
                    returnType: 'object',
                    dataType: 'object',
                    paginationWindow: 5,
                    sortBy: null
                });
            });
        });
    });

    describe("The MembersQueryBuilder Class", function() {
        describe("The constructor() method", function() {
            it("Should not require parameters", function() {
                var builder = Layer.Core.QueryBuilder.members();
                expect(builder.build()).toEqual({
                    model: Layer.Core.Query.Membership,
                    returnType: 'object',
                    dataType: 'object',
                    paginationWindow: Layer.Core.Query.prototype.paginationWindow,
                    sortBy: null
                });
            });

            it("Should initialize from a Query", function() {
                var query = new Layer.Core.Query({
                    client: client,
                    model: Layer.Core.Query.Membership,
                    returnType: 'count',
                    dataType: 'instance'
                });
                var builder = Layer.Core.QueryBuilder.fromQueryObject(query);
                expect(builder.build()).toEqual({
                    model: Layer.Core.Query.Membership,
                    returnType: 'count',
                    dataType: 'instance',
                    paginationWindow: Layer.Core.Query.prototype.paginationWindow,
                    sortBy: null
                });
            });
        });

        describe("The paginationWindow() method", function() {
            it("Should update the paginationWindow property", function() {
                var builder = Layer.Core.QueryBuilder.members().paginationWindow(5);
                builder._conversationIdSet = true;
                expect(builder.build()).toEqual({
                    model: Layer.Core.Query.Membership,
                    returnType: 'object',
                    dataType: 'object',
                    paginationWindow: 5,
                    sortBy: null
                });
            });
        });
    });
});
