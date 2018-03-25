/**
 * Metrics gathering component.
 *
 * 1. Should never broadcast any personally identifiable information
 * 2. Should never broadcast any values actually sent/received by users
 * 3. It can send how long any type of operation took to perform
 * 4. It can send how many times an operation was performed
 *
 * This is currently setup to run once per hour, sending hourly updates to the server.
 *
 * @class layer.TelemetryMonitor
 * @extends Layer.Core.Root
 * @private
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _settings = require('../settings');

var _namespace = require('./namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('./root');

var _root2 = _interopRequireDefault(_root);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _version = require('../version');

var _version2 = _interopRequireDefault(_version);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var TelemetryMonitor = function (_Root) {
  _inherits(TelemetryMonitor, _Root);

  /**
   * Creates a new Monitor.
   *
   * An Application is expected to only have one Monitor.
   *
   * @method constructor
   * @param {Object} options
   * @param {Boolean} [options.enabled=true]   Set to false to disable telemetry reporting
   * @param {Number} [options.reportingInterval=1000 * 3600]   Defaults to 1 hour, but can be set to other intervals
   */
  function TelemetryMonitor(options) {
    _classCallCheck(this, TelemetryMonitor);

    var _this = _possibleConstructorReturn(this, (TelemetryMonitor.__proto__ || Object.getPrototypeOf(TelemetryMonitor)).call(this, options));

    _this.state = {
      id: _this.id,
      records: []
    };
    _this.tempState = {};
    _this.storageKey = 'layer-telemetry-' + _settings.client.appId;

    if (!global.localStorage) {
      _this.enabled = false;
    } else {
      try {
        var oldState = localStorage[_this.storageKey];
        if (!oldState) {
          localStorage.setItem(_this.storageKey, JSON.stringify(_this.state));
        } else {
          _this.state = JSON.parse(oldState);
        }
      } catch (e) {
        _this.enabled = false;
      }
    }

    _settings.client.on('state-change', _this.trackEvent, _this);
    _utils.xhr.addConnectionListener(_this.trackRestPerformance.bind(_this));
    _this.setupReportingInterval();
    return _this;
  }

  /**
   * Given a `telemetryId` and an optional `id`, and a `started` or `ended` key,
   * track performance of the given telemetry statistic.
   *
   * @method trackEvent
   */


  _createClass(TelemetryMonitor, [{
    key: 'trackEvent',
    value: function trackEvent(evt) {
      if (!this.enabled) return;
      var eventId = evt.telemetryId + '-' + (evt.id || 'noid');

      if (evt.started) {
        this.tempState[eventId] = Date.now();
      } else if (evt.ended) {
        var started = this.tempState[eventId];
        if (started) {
          delete this.tempState[eventId];
          var duration = Date.now() - started;
          this.writePerformance(evt.telemetryId, duration);
        }
      }
    }

    /**
     * Clear out any requests that were never completed.
     *
     * Currently we only track an id and a start time, so we don't know much about these events.
     *
     * @method clearEvents
     */

  }, {
    key: 'clearEvents',
    value: function clearEvents() {
      var _this2 = this;

      var now = Date.now();
      Object.keys(this.tempState).forEach(function (key) {
        if (_this2.tempState[key] + _this2.reportingInterval < now) delete _this2.tempState[key];
      });
    }

    /**
     * Any xhr request that was called with a `telemetry` key contains metrics to be logged.
     *
     * The `telemetry` object should contain `name` and `duration` keys
     *
     * @method trackRestPerformance
     */

  }, {
    key: 'trackRestPerformance',
    value: function trackRestPerformance(evt) {
      if (this.enabled && evt.request.telemetry) {
        this.writePerformance(evt.request.telemetry.name, evt.duration);
      }
    }

    /**
     * When writing performance, there are three inputs used:
     *
     * 1. The name of the metric being tracked
     * 2. The duration it took for the operation
     * 3. The current time (this is not a function input, but is still a dependency)
     *
     * Results of writing performance are to increment count, and total time for the operation.
     *
     * @method writePerformance
     */

  }, {
    key: 'writePerformance',
    value: function writePerformance(name, timing) {
      var performance = this.getCurrentStateObject().performance;
      if (!performance[name]) {
        performance[name] = {
          count: 0,
          time: 0,
          max: 0
        };
      }
      performance[name].count++;
      performance[name].time += timing;
      if (timing > performance[name].max) performance[name].max = timing;
      this.writeState();
    }

    /**
     * When writing usage, we are simply incrementing the usage counter for the metric.
     *
     * @method writeUsage
     */

  }, {
    key: 'writeUsage',
    value: function writeUsage(name) {
      var usage = this.getCurrentStateObject().usage;
      if (!usage[name]) usage[name] = 0;
      usage[name]++;
      this.writeState();
    }

    /**
     * Grab some environmental data to attach to the report.
     *
     * note that environmental data may change from hour to hour,
     * so we regather this information for each record we send to the server.
     *
     * @method getEnvironment
     */

  }, {
    key: 'getEnvironment',
    value: function getEnvironment() {
      var environment = {
        platform: 'web',
        locale: (navigator.language || '').replace(/-/g, '_'), // should match the en_us format that mobile devices are using rather than the much nicer en-us
        layer_sdk_version: _version2.default,
        layer_ui_sdk_version: 'xdk',
        domain: location.hostname
      };

      // This event allows other libraries to add information to the environment object; specifically: Layer UI
      this.trigger('telemetry-environment', {
        environment: environment
      });
      return environment;
    }

    /**
     * Grab some device data to attach to the report.
     *
     * note that device data may change from hour to hour,
     * so we regather this information for each record we send to the server.
     *
     * @method getDevice
     */

  }, {
    key: 'getDevice',
    value: function getDevice() {
      return {
        user_agent: navigator.userAgent,
        screen: {
          width: typeof screen === 'undefined' ? 0 : screen.width,
          height: typeof screen === 'undefined' ? 0 : screen.height
        },
        window: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    }

    /**
     * Return the state object used to track performance for the current time slot
     *
     * @method getCurrentStateObject
     */

  }, {
    key: 'getCurrentStateObject',
    value: function getCurrentStateObject(doNotCreate) {
      var today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      var currentDate = new Date(today);

      var now = Date.now();

      // If the reporting interval is less than 24 hours, iterate until we find the current time slice within our day
      if (this.reportingInterval < 60 * 60 * 1000 * 24) {
        while (currentDate.getTime() < now) {
          currentDate.setMilliseconds(currentDate.getMilliseconds() + this.reportingInterval);
        }
      }

      var currentStart = currentDate.toISOString();
      var currentEndDate = new Date(currentDate);
      currentEndDate.setMilliseconds(currentEndDate.getMilliseconds() + this.reportingInterval);
      var todayObj = this.state.records.filter(function (set) {
        return set.period.start === currentStart;
      })[0];

      if (!todayObj && !doNotCreate) {
        todayObj = {
          period: {
            start: currentStart,
            end: currentEndDate.toISOString()
          },
          environment: this.getEnvironment(),
          device: this.getDevice(),
          usage: {},
          performance: {},
          errors: {}
        };
        this.state.records.push(todayObj);
      }

      return todayObj;
    }

    /**
     * Write state to localStorage.
     *
     * Writing the state is an expensive operation that should be done less often,
     * and containing more changes rather than done immediatley and repeated with each change.
     *
     * @method writeState
     */

  }, {
    key: 'writeState',
    value: function writeState() {
      var _this3 = this;

      if (this.enabled && !this._writeTimeoutId) {
        this._writeTimeoutId = setTimeout(function () {
          localStorage.setItem(_this3.storageKey, JSON.stringify(_this3.state));
          _this3._writeTimeoutId = 0;
        }, 1000);
      }
    }

    /**
     * Given a time slot's data, convert its data to what the server expects.
     *
     * @method convertRecord
     */

  }, {
    key: 'convertRecord',
    value: function convertRecord(record) {
      var result = {
        period: record.period,
        device: record.device,
        environment: record.environment,
        usage: record.usage,
        performance: {}
      };

      Object.keys(record.performance).forEach(function (performanceKey) {
        var item = record.performance[performanceKey];
        result.performance[performanceKey] = {
          max: Math.round(item.max),
          count: item.count,
          mean: Math.round(item.time / item.count) // convert to mean in miliseconds from total time in nanoseconds
        };
      });
      return result;
    }

    /**
     * Send data to the server; do not send any data from the current hour.
     *
     * Remove any data successfully sent from our records.
     *
     * @method sendData
     */

  }, {
    key: 'sendData',
    value: function sendData() {
      var _this4 = this;

      var doNotSendCurrentRecord = this.getCurrentStateObject(true);
      var records = this.state.records.filter(function (record) {
        return record !== doNotSendCurrentRecord;
      });
      if (records.length) {
        (0, _utils.xhr)({
          sync: false,
          method: 'POST',
          url: this.telemetryUrl,
          headers: {
            'content-type': 'application/json'
          },
          data: {
            id: _utils2.default.uuid(this.state.id),
            layer_app_id: _settings.client.appId,
            records: records.map(function (record) {
              return _this4.convertRecord(record);
            })
          }
        }, function (result) {
          if (result.success) {
            // Remove any records that were sent from our state
            _this4.state.records = _this4.state.records.filter(function (record) {
              return records.indexOf(record) === -1;
            });
            _this4.writeState();
          }
        });
      }
      this.clearEvents();
    }

    /**
     * Periodicalily call sendData to send updates to the server.
     *
     * @method setupReportingInterval
     */

  }, {
    key: 'setupReportingInterval',
    value: function setupReportingInterval() {
      if (this.enabled) {
        // Send any stale data
        this.sendData();
        this._intervalId = setInterval(this.sendData.bind(this), this.reportingInterval);
      }
    }

    /**
     * If the enabled property is set, automatically clear or start the interval.
     *
     * ```
     * telemetryMonitor.enabled = false;
     * ```
     *
     * The above code will stop the telemetryMonitor from sending data.
     *
     * @method __updateEnabled
     */

  }, {
    key: '__updateEnabled',
    value: function __updateEnabled() {
      if (this._intervalId) {
        clearInterval(this._intervalId);
        this._intervalId = 0;
      }
      if (this.enabled) this.setupReportingInterval();
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '[object ' + this.constructor.name + ']';
    }
  }]);

  return TelemetryMonitor;
}(_root2.default);

/**
 * The URL to `POST` telemetry data to.
 *
 * @property {String}
 */


TelemetryMonitor.prototype.telemetryUrl = 'https://telemetry.layer.com';

/**
 * ID for the `window.setInterval` operation
 *
 * @property {Number}
 */
TelemetryMonitor.prototype._intervalId = 0;

/**
 * The reporting interval controls how frequently the module tries to report on usage data.
 *
 * It also is used to determine how to segment data into time slices.
 *
 * Value should not excede 1 day.
 *
 * @property {Number} [reportingInterval=3,600,000]  Number of miliseconds between submitting usage reports; defaults to once per hour
 */
TelemetryMonitor.prototype.reportingInterval = 1000 * 60 * 60;

/**
 * To avoid performance issues, we only write changes asynchronously; this timeoutId tracks that this has been scheduled.
 *
 * @property {Number}
 */
TelemetryMonitor.prototype._writeTimeoutId = 0;

/**
 * Constructor sets this to be the key within localStorage for accessing the cached telemetry data.
 *
 * @property {String}
 */
TelemetryMonitor.prototype.storageKey = '';

/**
 * Current state object.
 *
 * Initialized with data from localStorage, and any changes to it are written
 * back to localStorage.
 *
 * Sending records causes them to be removed from the state.
 *
 * @property {Object}
 */
TelemetryMonitor.prototype.state = null;

/**
 * Cache of in-progress performance events.
 *
 * Each key has a value representing a timestamp.  Events are removed once they are completed.
 *
 * @property {Object}
 */
TelemetryMonitor.prototype.tempState = null;

/**
 * Telemetry defaults to enabled, but can be disabled by setting this to `false`
 *
 * @property {Boolean}
 */
TelemetryMonitor.prototype.enabled = true;

/**
 * The presence of this causes Layer.Core.Root to automatically generate an id if one isn't present.
 *
 * This id is written to localStorage so that it can persist across sessions.
 *
 * @static
 * @property {String}
 */
TelemetryMonitor.prefixUUID = 'layer:///telemetry/';

TelemetryMonitor._supportedEvents = _root2.default._supportedEvents.concat(['telemetry-environment']);

_root2.default.initClass.apply(TelemetryMonitor, [TelemetryMonitor, 'TelemetryMonitor', _namespace2.default]);
module.exports = TelemetryMonitor;