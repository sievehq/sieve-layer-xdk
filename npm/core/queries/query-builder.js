/**
 * Query builder class generating queries for a set of messages.
 * Used in Creating and Updating Layer.Core.Query instances.
 *
 * Using the Query Builder, we should be able to instantiate a Query
 *
 *      var qBuilder = QueryBuilder
 *       .messages()
 *       .forConversation('layer:///conversations/ffffffff-ffff-ffff-ffff-ffffffffffff')
 *       .paginationWindow(100);
 *      var query = client.createQuery(qBuilder);
 *
 *
 * You can then create additional builders and update the query:
 *
 *      var qBuilder2 = QueryBuilder
 *       .messages()
 *       .forConversation('layer:///conversations/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
 *       .paginationWindow(200);
 *      query.update(qBuilder);
 *
 * @class Layer.Core.QueryBuilder.MessagesQuery
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _query = require('./query');

var _query2 = _interopRequireDefault(_query);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }


var MessagesQuery = function () {

  /**
   * Creates a new query builder for a set of messages.
   *
   * Standard use is without any arguments.
   *
   * @method constructor
   * @param  {Object} [query=null]
   */
  function MessagesQuery(query) {
    _classCallCheck(this, MessagesQuery);

    if (query) {
      this._query = {
        model: query.model,
        returnType: query.returnType,
        dataType: query.dataType,
        paginationWindow: query.paginationWindow
      };
    } else {
      this._query = {
        model: _query2.default.Message,
        returnType: 'object',
        dataType: 'object',
        paginationWindow: _query2.default.prototype.paginationWindow
      };
    }

    // TODO remove when messages can be fetched via query API rather than `GET /messages`
    this._conversationIdSet = false;
  }

  /**
   * Query for messages in this Conversation or Channel.
   *
   * @method forConversation
   * @param  {String} conversationId  Accepts a Conversation ID or Channel ID
   */


  _createClass(MessagesQuery, [{
    key: 'forConversation',
    value: function forConversation(conversationId) {
      if (conversationId.indexOf('layer:///channels/') === 0) {
        this._query.predicate = 'channel.id = \'' + conversationId + '\'';
        this._conversationIdSet = true;
      } else if (conversationId.indexOf('layer:///conversations/') === 0) {
        this._query.predicate = 'conversation.id = \'' + conversationId + '\'';
        this._conversationIdSet = true;
      } else {
        this._query.predicate = '';
        this._conversationIdSet = false;
      }
      return this;
    }

    /**
     * Sets the pagination window/number of messages to fetch from the local cache or server.
     *
     * Currently only positive integers are supported.
     *
     * @method paginationWindow
     * @param  {number} win
     */

  }, {
    key: 'paginationWindow',
    value: function paginationWindow(win) {
      this._query.paginationWindow = win;
      return this;
    }

    /**
     * Returns the built query object to send to the server.
     *
     * Called by Layer.Core.QueryBuilder. You should not need to call this.
     *
     * @method build
     */

  }, {
    key: 'build',
    value: function build() {
      return this._query;
    }
  }]);

  return MessagesQuery;
}();

/**
 * Query builder class generating queries for a set of Announcements.
 *
 * To get started:
 *
 *      var qBuilder = QueryBuilder
 *       .announcements()
 *       .paginationWindow(100);
 *      var query = client.createQuery(qBuilder);
 *
 * @class Layer.Core.QueryBuilder.AnnouncementsQuery
 * @extends Layer.Core.QueryBuilder.MessagesQuery
 */


var AnnouncementsQuery = function (_MessagesQuery) {
  _inherits(AnnouncementsQuery, _MessagesQuery);

  function AnnouncementsQuery(options) {
    _classCallCheck(this, AnnouncementsQuery);

    var _this = _possibleConstructorReturn(this, (AnnouncementsQuery.__proto__ || Object.getPrototypeOf(AnnouncementsQuery)).call(this, options));

    _this._query.model = _query2.default.Announcement;
    return _this;
  }

  _createClass(AnnouncementsQuery, [{
    key: 'build',
    value: function build() {
      return this._query;
    }
  }]);

  return AnnouncementsQuery;
}(MessagesQuery);

/**
 * Query builder class generating queries for a set of Conversations.
 *
 * Used in Creating and Updating Layer.Core.Query instances.
 *
 * To get started:
 *
 *      var qBuilder = QueryBuilder
 *       .conversations()
 *       .paginationWindow(100);
 *      var query = client.createQuery(qBuilder);
 *
 * You can then create additional builders and update the query:
 *
 *      var qBuilder2 = QueryBuilder
 *       .conversations()
 *       .paginationWindow(200);
 *      query.update(qBuilder);
 *
 * @class Layer.Core.QueryBuilder.ConversationsQuery
 */


var ConversationsQuery = function () {

  /**
   * Creates a new query builder for a set of conversations.
   *
   * Standard use is without any arguments.
   *
   * @method constructor
   * @param  {Object} [query=null]
   */
  function ConversationsQuery(query) {
    _classCallCheck(this, ConversationsQuery);

    if (query) {
      this._query = {
        model: query.model,
        returnType: query.returnType,
        dataType: query.dataType,
        paginationWindow: query.paginationWindow,
        sortBy: query.sortBy
      };
    } else {
      this._query = {
        model: _query2.default.Conversation,
        returnType: 'object',
        dataType: 'object',
        paginationWindow: _query2.default.prototype.paginationWindow,
        sortBy: null
      };
    }
  }

  /**
   * Sets the pagination window/number of messages to fetch from the local cache or server.
   *
   * Currently only positive integers are supported.
   *
   * @method paginationWindow
   * @param  {number} win
   * @return {Layer.Core.QueryBuilder} this
   */


  _createClass(ConversationsQuery, [{
    key: 'paginationWindow',
    value: function paginationWindow(win) {
      this._query.paginationWindow = win;
      return this;
    }

    /**
     * Sets the sorting options for the Conversation.
     *
     * Currently only supports descending order
     * Currently only supports fieldNames of "createdAt" and "lastMessage.sentAt"
     *
     * @method sortBy
     * @param  {string} fieldName  - field to sort by
     * @param  {boolean} asc - Is an ascending sort?
     * @return {Layer.Core.QueryBuilder} this
     */

  }, {
    key: 'sortBy',
    value: function sortBy(fieldName) {
      var asc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      this._query.sortBy = [_defineProperty({}, fieldName, asc ? 'asc' : 'desc')];
      return this;
    }

    /**
     * Returns the built query object to send to the server.
     *
     * Called by Layer.Core.QueryBuilder. You should not need to call this.
     *
     * @method build
     */

  }, {
    key: 'build',
    value: function build() {
      return this._query;
    }
  }]);

  return ConversationsQuery;
}();

/**
 * Query builder class generating queries for a set of Channels.
 *
 * Used in Creating and Updating Layer.Core.Query instances.
 *
 * To get started:
 *
 *      var qBuilder = QueryBuilder
 *       .channels()
 *       .paginationWindow(100);
 *      var query = client.createQuery(qBuilder);
 *
 * You can then create additional builders and update the query:
 *
 *      var qBuilder2 = QueryBuilder
 *       .conversations()
 *       .paginationWindow(200);
 *      query.update(qBuilder);
 *
 * @class Layer.Core.QueryBuilder.ChannelsQuery
 */


var ChannelsQuery = function () {

  /**
   * Creates a new query builder for a set of conversations.
   *
   * Standard use is without any arguments.
   *
   * @method constructor
   * @param  {Object} [query=null]
   */
  function ChannelsQuery(query) {
    _classCallCheck(this, ChannelsQuery);

    if (query) {
      this._query = {
        model: query.model,
        returnType: query.returnType,
        dataType: query.dataType,
        paginationWindow: query.paginationWindow,
        sortBy: null
      };
    } else {
      this._query = {
        model: _query2.default.Channel,
        returnType: 'object',
        dataType: 'object',
        paginationWindow: _query2.default.prototype.paginationWindow,
        sortBy: null
      };
    }
  }

  /**
   * Sets the pagination window/number of messages to fetch from the local cache or server.
   *
   * Currently only positive integers are supported.
   *
   * @method paginationWindow
   * @param  {number} win
   * @return {Layer.Core.QueryBuilder} this
   */


  _createClass(ChannelsQuery, [{
    key: 'paginationWindow',
    value: function paginationWindow(win) {
      this._query.paginationWindow = win;
      return this;
    }

    /**
     * Returns the built query object to send to the server.
     *
     * Called by Layer.Core.QueryBuilder. You should not need to call this.
     *
     * @method build
     */

  }, {
    key: 'build',
    value: function build() {
      return this._query;
    }
  }]);

  return ChannelsQuery;
}();

/**
 * Query builder class generating queries for getting members of a Channel.
 *
 * Used in Creating and Updating Layer.Core.Query instances.
 *
 * To get started:
 *
 *      var qBuilder = QueryBuilder
 *       .members()
 *       .forChannel(channelId)
 *       .paginationWindow(100);
 *      var query = client.createQuery(qBuilder);
 *
 * You can then create additional builders and update the query:
 *
 *      var qBuilder2 = QueryBuilder
 *       .members()
 *       .forChannel(channelId)
 *       .paginationWindow(200);
 *      query.update(qBuilder);
 *
 * @class Layer.Core.QueryBuilder.MembersQuery
 */


var MembersQuery = function () {

  /**
   * Creates a new query builder for a set of conversations.
   *
   * Standard use is without any arguments.
   *
   * @method constructor
   * @param  {Object} [query=null]
   */
  function MembersQuery(query) {
    _classCallCheck(this, MembersQuery);

    if (query) {
      this._query = {
        model: query.model,
        returnType: query.returnType,
        dataType: query.dataType,
        paginationWindow: query.paginationWindow,
        sortBy: null
      };
    } else {
      this._query = {
        model: _query2.default.Membership,
        returnType: 'object',
        dataType: 'object',
        paginationWindow: _query2.default.prototype.paginationWindow,
        sortBy: null
      };
    }
  }

  /**
   * Sets the pagination window/number of messages to fetch from the local cache or server.
   *
   * Currently only positive integers are supported.
   *
   * @method paginationWindow
   * @param  {number} win
   * @return {Layer.Core.QueryBuilder} this
   */


  _createClass(MembersQuery, [{
    key: 'paginationWindow',
    value: function paginationWindow(win) {
      this._query.paginationWindow = win;
      return this;
    }

    /**
     * Query for members in this Channel.
     *
     * @method forChannel
     * @param  {String} channelId
     */

  }, {
    key: 'forChannel',
    value: function forChannel(channelId) {
      if (channelId.indexOf('layer:///channels/') === 0) {
        this._query.predicate = 'channel.id = \'' + channelId + '\'';
      } else {
        this._query.predicate = '';
      }
      return this;
    }

    /**
     * Returns the built query object to send to the server.
     *
     * Called by Layer.Core.QueryBuilder. You should not need to call this.
     *
     * @method build
     */

  }, {
    key: 'build',
    value: function build() {
      return this._query;
    }
  }]);

  return MembersQuery;
}();

/**
 * Query builder class generating queries for a set of Identities followed by this user.
 *
 * Used in Creating and Updating Layer.Core.Query instances.
 *
 * To get started:
 *
 *      var qBuilder = QueryBuilder
 *       .identities()
 *       .paginationWindow(100);
 *      var query = client.createQuery(qBuilder);
 *
 * @class Layer.Core.QueryBuilder.IdentitiesQuery
 */


var IdentitiesQuery = function () {

  /**
   * Creates a new query builder for a set of conversations.
   *
   * Standard use is without any arguments.
   *
   * @method constructor
   * @param  {Object} [query=null]
   */
  function IdentitiesQuery(query) {
    _classCallCheck(this, IdentitiesQuery);

    if (query) {
      this._query = {
        model: query.model,
        returnType: query.returnType,
        dataType: query.dataType,
        paginationWindow: query.paginationWindow
      };
    } else {
      this._query = {
        model: _query2.default.Identity,
        returnType: 'object',
        dataType: 'object',
        paginationWindow: _query2.default.prototype.paginationWindow
      };
    }
  }

  /**
   * Sets the pagination window/number of messages to fetch from the local cache or server.
   *
   * Currently only positive integers are supported.
   *
   * @method paginationWindow
   * @param  {number} win
   * @return {Layer.Core.QueryBuilder} this
   */


  _createClass(IdentitiesQuery, [{
    key: 'paginationWindow',
    value: function paginationWindow(win) {
      this._query.paginationWindow = win;
      return this;
    }

    /**
     * Returns the built query object to send to the server.
     *
     * Called by Layer.Core.QueryBuilder. You should not need to call this.
     *
     * @method build
     */

  }, {
    key: 'build',
    value: function build() {
      return this._query;
    }
  }]);

  return IdentitiesQuery;
}();

/**
 * Query builder class. Used with Layer.Core.Query to specify what local/remote
 * data changes to subscribe to.  For examples, see Layer.Core.QueryBuilder.MessagesQuery
 * and Layer.Core.QueryBuilder.ConversationsQuery.  This static class is used to instantiate
 * MessagesQuery and ConversationsQuery Builder instances:
 *
 *      var conversationsQueryBuilder = QueryBuilder.conversations();
 *      var messagesQueryBuidler = QueryBuilder.messages();
 *
 * Should you use these instead of directly using the Layer.Core.Query class?
 * That is a matter of programming style and preference, there is no
 * correct answer.
 *
 * @class Layer.Core.QueryBuilder
 */


var QueryBuilder = {

  /**
   * Create a new Layer.Core.Core.MessagesQuery instance.
   *
   * @method messages
   * @static
   * @returns {Layer.Core.QueryBuilder.MessagesQuery}
   */
  messages: function messages() {
    return new MessagesQuery();
  },


  /**
   * Create a new Layer.Core.Core.AnnouncementsQuery instance.
   *
   * @method announcements
   * @static
   * @returns {Layer.Core.QueryBuilder.AnnouncementsQuery}
   */
  announcements: function announcements() {
    return new AnnouncementsQuery();
  },


  /**
   * Create a new Layer.Core.Core.ConversationsQuery instance.
   *
   * @method conversations
   * @static
   * @returns {Layer.Core.QueryBuilder.ConversationsQuery}
   */
  conversations: function conversations() {
    return new ConversationsQuery();
  },


  /**
   * Create a new Layer.Core.Core.ChannelsQuery instance.
   *
   * @method channels
   * @static
   * @returns {Layer.Core.QueryBuilder.ChannelsQuery}
   */
  channels: function channels() {
    return new ChannelsQuery();
  },


  /**
   * Create a new Layer.Core.MembersQuery instance.
   *
   * @method members
   * @static
   * @returns {Layer.Core.QueryBuilder.MembersQuery}
   */
  members: function members() {
    return new MembersQuery();
  },


  /**
   * Create a new Layer.Core.IdentitiesQuery instance.
   *
   * @method identities
   * @static
   * @returns {Layer.Core.QueryBuilder.IdentitiesQuery}
   */
  identities: function identities() {
    return new IdentitiesQuery();
  },


  /**
   * Takes the return value of QueryBuilder.prototype.build and creates a
   * new QueryBuilder.
   *
   * Used within Layer.Core.Query.prototype.toBuilder.
   *
   * @method fromQueryObject
   * @private
   * @param {Object} obj
   * @static
   */
  fromQueryObject: function fromQueryObject(obj) {
    switch (obj.model) {
      case _query2.default.Message:
        return new MessagesQuery(obj);
      case _query2.default.Announcement:
        return new AnnouncementsQuery(obj);
      case _query2.default.Conversation:
        return new ConversationsQuery(obj);
      case _query2.default.Channel:
        return new ChannelsQuery(obj);
      case _query2.default.Identity:
        return new IdentitiesQuery(obj);
      case _query2.default.Membership:
        return new MembersQuery(obj);
      default:
        return null;
    }
  }
};

module.exports = QueryBuilder;
_namespace2.default.QueryBuilder = QueryBuilder;