/**
 * @class Layer.Core
 */
const Core = {};

Core.Root = require('./root');
Core.Client = require('./client');
Core.ClientAuthenticator = require('./client-authenticator');
Core.Syncable = require('./models/syncable');
Core.Conversation = require('./models/conversation');
Core.Channel = require('./models/channel');
Core.Container = require('./models/container');
Core.Message = require('./models/message');
Core.Message.ConversationMessage = require('./models/conversation-message');
Core.Message.ChannelMessage = require('./models/channel-message');
Core.Announcement = require('./models/announcement');
Core.MessagePart = require('./models/message-part');
Core.Content = require('./models/content');
Core.MessageTypeModel = require('./models/message-type-model');
Core.Query = require('./queries/query');
Core.Query.ConversationQuery = require('./queries/conversations-query');
Core.Query.AnnouncementsQuery = require('./queries/announcements-query');
Core.Query.ChannelsQuery = require('./queries/channels-query');
Core.Query.IdentitiesQuery = require('./queries/identities-query');
Core.Query.MembersQuery = require('./queries/members-query');
Core.Query.MessagesQuery = require('./queries/messages-query');
Core.QueryBuilder = require('./queries/query-builder');
Core.Identity = require('./models/identity');
Core.Membership = require('./models/membership');
Core.LayerError = require('./layer-error');
Core.LayerEvent = require('./layer-event');
Core.SyncManager = require('./sync-manager');
Core.SyncEvent = require('./sync-event').SyncEvent;
Core.XHRSyncEvent = require('./sync-event').XHRSyncEvent;
Core.WebsocketSyncEvent = require('./sync-event').WebsocketSyncEvent;
Core.Websockets = {
  SocketManager: require('./websockets/socket-manager'),
  RequestManager: require('./websockets/request-manager'),
  ChangeManager: require('./websockets/change-manager'),
};
Core.OnlineStateManager = require('./online-state-manager');
Core.DbManager = require('./db-manager');
Core.TypingIndicators = require('./typing-indicators/typing-indicators');
Core.TypingIndicators.TypingListener = require('./typing-indicators/typing-listener');
Core.TypingIndicators.TypingPublisher = require('./typing-indicators/typing-publisher');

module.exports = Core;