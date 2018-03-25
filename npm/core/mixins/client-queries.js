/**
 *
 * Adds Query handling to the Layer.Core.Client.
 *
 * @class Layer.Core.mixins.ClientQueries
 */
'use strict';

var _query = require('../queries/query');

var _query2 = _interopRequireDefault(_query);

var _identitiesQuery = require('../queries/identities-query');

var _identitiesQuery2 = _interopRequireDefault(_identitiesQuery);

var _conversationsQuery = require('../queries/conversations-query');

var _conversationsQuery2 = _interopRequireDefault(_conversationsQuery);

var _messagesQuery = require('../queries/messages-query');

var _messagesQuery2 = _interopRequireDefault(_messagesQuery);

var _layerError = require('../layer-error');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }



module.exports = {
  events: [],
  lifecycle: {
    constructor: function constructor(options) {
      this._models.queries = {};
    },
    cleanup: function cleanup() {
      var _this = this;

      Object.keys(this._models.queries || {}).forEach(function (id) {
        var query = _this._models.queries[id];
        if (query && !query.isDestroyed) {
          query.destroy();
        }
      });
      this._models.queries = null;
    },
    reset: function reset() {
      this._models.queries = {};
    }
  },
  methods: {
    /**
     * Retrieve the query by query id.
     *
     * Useful for finding a Query when you only have the ID
     *
     * @method getQuery
     * @param  {string} id              - layer:///queries/uuid
     * @return {Layer.Core.Query}
     */
    getQuery: function getQuery(id) {
      if (typeof id !== 'string') throw new Error(_layerError.ErrorDictionary.idParamRequired);
      return this._models.queries[id] || null;
    },


    /**
     * There are two options to create a new Layer.Core.Query instance.
     *
     * The direct way:
     *
     *     var query = client.createQuery({
     *         model: Layer.Core.Query.Message,
     *         predicate: 'conversation.id = '' + conv.id + ''',
     *         paginationWindow: 50
     *     });
     *
     * A Builder approach that allows for a simpler syntax:
     *
     *     var qBuilder = QueryBuilder
     *      .messages()
     *      .forConversation('layer:///conversations/ffffffff-ffff-ffff-ffff-ffffffffffff')
     *      .paginationWindow(100);
     *     var query = client.createQuery(qBuilder);
     *
     * @method createQuery
     * @param  {Layer.Core.QueryBuilder|Object} options - Either a Layer.Core.QueryBuilder instance, or parameters for the Layer.Core.Query constructor
     * @return {Layer.Core.Query}
     */
    createQuery: function createQuery(options) {
      var query = void 0;

      if (typeof options.build === 'function') {
        options = options.build();
      }
      switch (options.model) {
        case _query2.default.Identity:
          query = new _identitiesQuery2.default(options);
          break;
        case _query2.default.Conversation:
          query = new _conversationsQuery2.default(options);
          break;
        case _query2.default.Channel:
          query = this._createChannelsQuery(options);
          break;
        case _query2.default.Membership:
          query = this._createMembersQuery(options);
          break;
        case _query2.default.Message:
          query = new _messagesQuery2.default(options);
          break;
        case _query2.default.Announcement:
          query = this._createAnnouncementsQuery(options);
          break;

        default:
          query = new _query2.default(options);
      }
      this._addQuery(query);
      return query;
    },


    /**
     * Register the Layer.Core.Query.
     *
     * @method _addQuery
     * @private
     * @param  {Layer.Core.Query} query
     */
    _addQuery: function _addQuery(query) {
      this._models.queries[query.id] = query;
    },


    /**
     * Deregister the Layer.Core.Query.
     *
     * @method _removeQuery
     * @private
     * @param  {Layer.Core.Query} query [description]
     */
    _removeQuery: function _removeQuery(query) {
      var _this2 = this;

      if (query) {
        delete this._models.queries[query.id];
        if (!this._inCleanup) {
          var data = query.data.map(function (obj) {
            return _this2.getObject(obj.id);
          }).filter(function (obj) {
            return obj;
          });
          this._checkAndPurgeCache(data);
        }
        this.off(null, null, query);
      }
    }
  }
};

_namespace2.default.mixins.Client.push(module.exports);