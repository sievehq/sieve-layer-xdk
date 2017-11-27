(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.layerUI = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Call this function to initialize all of the angular 1.x directives needed to handle the Layer UI for Web widgets.
 *
 * When passing scope values/function into widget properties, prefix the property with `ng-`;
 * for functions, replace `on-` with `ng-`.  If passing in a literal, do NOT prefix with `ng-`:
 *
 * ```
 *    <layer-notifier notify-in-foreground="toast"></layer-notifier>
 *    <layer-conversation-panel ng-query="myscopeProp.query"></layer-conversation-panel>
 *    <layer-conversations-list ng-conversation-selected="myscope.handleSelectionFunc"></layer-conversations-list>
 *    <layer-send-button></layer-send-button>
 *    <layer-file-upload-button></layer-file-upload-button>
 * ```
 *
 * Call this function to initialize angular 1.x Directives which will be part of the "layerUIControllers" controller:
 *
 * ```
 * layerUI.adapters.angular(angular); // Creates the layerUIControllers controller
 * angular.module('MyApp', ['layerUIControllers']);
 * ```
 *
 *   Now you can put `<layer-conversation-panel>` and other widgets into angular templates and expect them to work.
 *   Prefix ALL property names with `ng-` to insure that scope is evaluated prior to passing the value on to the webcomponent.
 *
 * @class layerUI.adapters.angular
 * @singleton
 * @param {Object} angular     Pass in the AngularJS library
 */
'use strict';

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }



function initAngular(angular) {

  // Define the layerUIController
  var controllers = angular.module('layerUIControllers', []);

  // Setup the properties for the given widget that is being generated
  function setupProps(scope, elem, attrs, props) {

    /*
     * For each property we are going to do the following:
     *
     * 1. See if there is an initial value
     * 2. Evaluate it against the scope via scope.$eval() so we have a resolved value
     * 3. $observe() for any changes in the property
     * 4. $watch() for any changes in the output of scope.$eval()
     *
     * One complicating factor here: while we do support passing in values such as `query` or `query-id`, these
     * values, if placed within an html template, will be passed directly on to a webcomponent BEFORE
     * this code triggers and corrects those values.  This can cause errors.
     *
     * Instead, if one passes `ng-query` or `ng-query-id` in via the html template, there is no `ng-query` property
     * to pass this value on to until the code below triggers.  The code below will map `ng-query` to `query` AFTER
     * its been evaluated.
     *
     * The above steps are applied once for `query-id`, and a second time for `ng-query-id` so that either one works, but `ng-`
     * works better.
     *
     * Best Practice therefore: Use `ng-` prefix on all properties passed via html template files.
     */
    props.forEach(function (prop) {
      var ngPropertyName = prop.propertyName.indexOf('on') === 0 ? 'ng' + prop.propertyName.substring(2) : 'ng' + prop.propertyName.substring(0, 1).toUpperCase() + prop.propertyName.substring(1);

      // Observe for changes to the attribute value and apply them to the property value
      attrs.$observe(prop.propertyName, function (value) {
        if (elem.properties) {
          elem[prop.propertyName] = value;
        } else {
          if (!elem.properties) elem.properties = {};
          elem.properties[prop.propertyName] = value;
        }
      });

      // Observe for changes to the attribute value prefixed with "ng-" and watch the scoped expression for changes
      // that need to be applied to the property value.
      attrs.$observe(ngPropertyName, function (expression) {
        scope.$watch(expression, function (value) {
          if (!elem.properties) elem.properties = {};
          if (elem.properties._internalState && !elem.properties._internalState.disableSetters) {
            elem[prop.propertyName] = value;
          } else {
            elem.properties[prop.propertyName] = value;
          }
        });
      });
    });
  }

  // Gather all UI Components flagged as Main Components; other components don't require special wrappers that allow properties
  // embedded in Angular's Templates to correctly handle values.
  Object.keys(_base2.default.components).filter(function (componentName) {
    var component = _base2.default.components[componentName];
    return component.properties.filter(function (prop) {
      return prop.propertyName === '_isMainComponent';
    }).length;
  }).forEach(function (componentName) {
    var component = _base2.default.components[componentName];

    // Get the camel case controller name
    var controllerName = componentName.replace(/-(.)/g, function (str, value) {
      return value.toUpperCase();
    });

    controllers.directive(controllerName, function () {
      return {
        retrict: 'E',
        link: function link(scope, elem, attrs) {
          var functionProps = component.properties;
          setupProps(scope, elem[0], attrs, functionProps);
        }
      };
    });
  });
}

module.exports = initAngular;
_base2.default.addAdapter('angular', initAngular);
},{"../base":4}],2:[function(require,module,exports){
/**
 * Call this function to initialize all of the Backbone Views needed to handle the Layer UI for Web widgets.
 *
 * Initialize this adapter using:
 *
 * ```javascript
 * var Backbone = require('backbone');
 * var LayerUIViews = layerUI.adapters.backbone(Backbone);
 * var conversationPanelView = new LayerUIViews.ConversationPanel(client, {conversationId: 'layer:///conversations/UUID'});
 * var conversationsListView = new LayerUIViews.ConversationsList(client);
 * var identitiesListView = new LayerUIViews.UserList(client);
 * var notifierView = new LayerUIViews.Notifier(client, {notifyInForeground: 'toast'});
 * var sendButton = new LayerUIViews.SendButton(client);
 * var fileUploadButton = new LayerUIViews.FileUploadButton(client);
 * ```
 *
 * Calling this will expose the following React Components:
 *
 * * ConversationPanelView: A wrapper around a layerUI.components.ConversationPanel
 * * ConversationsListView: A wrapper around a layerUI.components.ConversationsListPanel
 * * IdentitiesListView: A wrapper around a layerUI.components.IdentitiesListPanel
 * * NotifierView: A wrapper around a layerUI.components.misc.Notifier
 * * SendButton: An optional button that can be provided to ConversationPanelView's `composeButtons` property
 *   to add a simple Send button to the Composer
 * * FileUploadButton: An optional button that can be provided to ConversationPanelView's `composeButtons` property
 *   to add a simple Select and Send File button to the Composer
 *
 *
 * Any occurances of a layer widget in your html should be associated with these views:
 *
 * ```html
 * < !-- Associated with the NotifierView -->
 * < layer-notifier notify-in-foreground="toast"></layer-notifier>
 *
 * < !-- Associated with the ConversationView -->
 * < layer-conversation-panel conversation-id="layer:///conversations/UUID"></layer-conversation-panel>
 * ```
 *
 * @class layerUI.adapters.backbone
 * @singleton
 * @param {Object} backbone     Pass in the backbone library
 */
'use strict';

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


var libraryResult = void 0;
function initBackbone(backbone) {
  if (libraryResult) return libraryResult;
  libraryResult = {};

  // Gather all UI Components flagged as Main Components; other components don't require special wrappers for direct use by Apps.
  Object.keys(_base2.default.components).filter(function (componentName) {
    var component = _base2.default.components[componentName];
    return component.properties.filter(function (prop) {
      return prop.propertyName === '_isMainComponent';
    }).length;
  }).forEach(function (componentName) {
    var component = _base2.default.components[componentName];

    // Get the camel case Component name
    var className = (componentName.substring(0, 1).toUpperCase() + componentName.substring(1).replace(/-(.)/g, function (str, value) {
      return value.toUpperCase();
    })).replace(/^Layer/, '');

    // Define the Backbone View
    var view = libraryResult[className] = backbone.View.extend({
      el: componentName,
      initialize: function initialize(client, options) {
        var _this = this;

        this.client = client;
        Object.keys(options || {}).forEach(function (propertyName) {
          _this[propertyName] = options[propertyName];
        });
      }
    });

    // Define getters/setters so that the View acts as though it were the WebComponent it wraps
    component.properties.forEach(function (propertyDef) {
      Object.defineProperty(view.prototype, propertyDef.propertyName, {
        set: function set(value) {
          this.$el[0][propertyDef.propertyName] = value;
        },
        get: function get() {
          return this.$el[0][propertyDef.propertyName];
        }
      });
    });
  });
  return libraryResult;
}

module.exports = initBackbone;
_base2.default.addAdapter('backbone', initBackbone);
},{"../base":4}],3:[function(require,module,exports){
/**
 * Call this function to initialize all of the react components needed to handle the Layer UI for Web widgets.
 *
 * Before using this, please note that layerUI.init() must be called prior to calling layerUI.adapters.react().
 *
 * Initialize with:
 *
 * ```
 * import React from 'react';
 * import ReactDom from 'react-dom';
 * const { ConversationPanel, ConversationList, UserList, Notifier } = layerUI.adapters.react(React, ReactDom);
 * ```
 *
 * Calling this will expose the following React Components:
 *
 * * ConversationPanel: A wrapper around a layerUI.components.ConversationPanel
 * * ConversationsList: A wrapper around a layerUI.components.ConversationsListPanel
 * * IdentitiesList: A wrapper around a layerUI.components.IdentitiesListPanel
 * * Notifier: A wrapper around a layerUI.components.misc.Notifier
 * * SendButton: A wrapper around a layerUI.components.subcomponents.SendButton
 * * FileUploadButton: A wrapper around a layerUI.components.subcomponents.FileUploadButton
 *
 * You can then use:
 *
 * ```
 * render() {
 *    return <ConversationList
 *      composeButtons={SendButton, FileUploadButton}
 *      onConversationSelected={this.mySelectHandler}></ConversationList>
 * }
 * ```
 *
 * To insure that LayerUI.init() is called before layerUI.adapters.react(), and each is only called once, we
 * recommend puttings this code in its own module:
 *
 * ```
 * import React, { Component, PropTypes } from 'react';
 * import ReactDom from 'react-dom';
 * import Layer from 'layer-websdk';
 * import * as LayerUI from 'layer-ui-web';
 *
 * LayerUI.init({
 *   appId: 'layer:///apps/staging/my-app-id',
 *   layer: Layer
 * });
 * const LayerUIWidgets = LayerUI.adapters.react(React, ReactDom);
 * module.exports = LayerUIWidgets;
 * ```
 *
 * Now anywhere you need access to the LayerUIWidgets library can import this module and expect everything to
 * evaluate at the correct time, correct order, and only evaluate once.
 *
 * @class layerUI.adapters.react
 * @singleton
 * @param {Object} React - Pass in the reactJS library
 * @param {Object} ReactDom - Pass in the ReactDom library
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }


var libraryResult = void 0;
function initReact(React, ReactDom) {
  if (libraryResult) return libraryResult;
  libraryResult = {};

  // Gather all UI Components flagged as Main Components; other components don't require special React Components for direct use.
  Object.keys(_base2.default.components).filter(function (componentName) {
    var component = _base2.default.components[componentName];
    return component.properties.filter(function (prop) {
      return prop.propertyName === '_isMainComponent';
    }).length;
  }).forEach(function (componentName) {
    var component = _base2.default.components[componentName];

    // Get the camel case Component name
    var className = (componentName.substring(0, 1).toUpperCase() + componentName.substring(1).replace(/-(.)/g, function (str, value) {
      return value.toUpperCase();
    })).replace(/^Layer/, '');

    libraryResult[className] = function (_React$Component) {
      _inherits(_class, _React$Component);

      function _class() {
        _classCallCheck(this, _class);

        return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
      }

      _createClass(_class, [{
        key: 'componentDidMount',

        /**
         * On mounting, copy in all properties, and optionally setup a Query.
         *
         * Delay added to prevent Webcomponents property setters from being blown away in safari and firefox
         */
        value: function componentDidMount() {
          var _this2 = this;

          // Get the properties/attributes that match those used in this.props
          var props = component.properties.filter(function (property) {
            return _this2.props[property.propertyName] || _this2.props[property.attributeName];
          });

          // Set the webcomponent properties
          props.forEach(function (propDef) {
            var value = propDef.propertyName in _this2.props ? _this2.props[propDef.propertyName] : _this2.props[propDef.attributeName];
            if (propDef.type === HTMLElement && value) {
              value = _this2.handleReactDom(propDef, value);
            }
            _this2.node[propDef.propertyName] = value;
          });

          // Browsers running the polyfil may not yet have initialized the component at this point.
          // Force them to be initialized so that by the time the parent component's didComponentMount
          // is called, this will be an initialized widget.
          if (!this.node._onAfterCreate) {
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent('HTMLImportsLoaded', true, true, null);
            document.dispatchEvent(evt);
          }
          this.node._onAfterCreate();
        }

        /**
         * Copy all properties into the dom node, but never let React recreate this widget.
         */

      }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps) {
          var _this3 = this;

          // Get the properties/attributes that match those used in this.props
          var props = component.properties.filter(function (property) {
            return _this3.props[property.propertyName] || _this3.props[property.attributeName];
          });

          // Set the webcomponent properties if they have changed
          props.forEach(function (propDef) {
            var name = propDef.propertyName in _this3.props ? propDef.propertyName : propDef.attributeName;
            var value = nextProps[name];
            if (propDef.type === HTMLElement && value) {
              value = _this3.handleReactDom(propDef, value);
            }

            if (value !== _this3.props[name]) {
              _this3.node[propDef.propertyName] = value;
            }
          }, this);
          return false;
        }
      }, {
        key: 'handleReactDom',
        value: function handleReactDom(propDef, value) {
          if (!this.layerUIGeneratedNodes) this.layerUIGeneratedNodes = {};

          if (Array.isArray(value)) {
            var array = [];
            if (!this.layerUIGeneratedNodes[propDef.propertyName]) {
              this.layerUIGeneratedNodes[propDef.propertyName] = array;
            }
            array.length = value.length;
            value.forEach(function (item, index) {
              if (item.tagName) {
                array[index] = item;
              } else {
                var node = array[index] || document.createElement('div');
                ReactDom.render(typeof item === 'function' ? React.createElement(item) : item, node);
                array[index] = node;
              }
            });
          } else if (value.tagName === undefined) {
            if (!this.layerUIGeneratedNodes[propDef.propertyName]) {
              this.layerUIGeneratedNodes[propDef.propertyName] = document.createElement('div');
            }
            ReactDom.render(value, this.layerUIGeneratedNodes[propDef.propertyName]);
          }
          return this.layerUIGeneratedNodes[propDef.propertyName];
        }
      }, {
        key: 'render',
        value: function render() {
          var _this4 = this;

          return React.createElement(componentName, {
            ref: function ref(node) {
              _this4.node = node;
            },
            id: this.props.id
          });
        }
      }]);

      return _class;
    }(React.Component);
  });

  return libraryResult;
}

module.exports = initReact;
_base2.default.addAdapter('react', initReact);
},{"../base":4}],4:[function(require,module,exports){
/**
 * @class layerUI
 * @static
 *
 * The layerUI contains utilities for working with the layerUI components.
 *
 * The key method to know here is the `init()` method.  Any use of the library will need a call:
 *
 * ```
 * layerUI.init({
 *   appId: 'layer:///apps/staging/my-app-id'
 * });
 * ```
 *
 * Or
 *
 * layerUI.init({
 *   appId: 'layer:///apps/staging/my-app-id'
 * });
 * ```
 *
 * See layerUI.settings for more options to layerUI.init.
 *
 * One other property deserving special mention: layerUI.adapters.  Adapters help you to use these widgets within other UI frameworks.
 * It is not required to use an adapter, but it solves many inconsistencies in how these frameworks handle webcomponents built using this framework.
 *
 * While there are many other methods defined here, for new projects ignore everything except layerUI.settings, layerUI.init and layerUI.adapters.
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * NOTES TO MAINTAINER:
 *
 * * Avoid using `this`, rather use `layerUI` instead.  Otherwise usage such as:
 *   `import { registerMessage} from 'layer-ui-web'` will give developers a method that
 *   needs scope but won't have it.
 */
var layerUI = {};

/**
 * The settings object stores a hash of configurable properties to change widget Behaviors.
 *
 * The settings object is typically set using layerUI.init().
 *
 * Below are the available settings and their defintions.
 *
 * @property {Object} settings
 *
 * @property {String} [settings.appId]      The app ID to use for all webcomponents.
 *    Setting this is a short-hand for using the `app-id` property on each widget;
 *    you can leave out `app-id` if using this setting.
 *
 * @property {Number} [settings.messageGroupTimeSpan=30,0000]   Messages are grouped based on sender,
 *    as well as time between when Messages are sent
 *    How much time must pass before messages are no longer in the same group? Measured in miliseconds.
 *
 * @property {Boolean} [settings.disableTabAsWhiteSpace=false]   By default hitting TAB in the Composer adds space.
 *    Disable this for tab to go to next component.
 *
 * @property {Number} [settings.markReadDelay=2500]    Delay before marking a Message as read.
 *    This property configures the number of miliseconds to wait after a message becomes visible
 *    before its marked as read.  A value too small means it was visible but the user may not
 *    have actually had time to read it as it scrolls quickly past.
 *
 *    The above code will prevent the `layer-avatar` widget
 *    from being initialized, and allow you to provide your own definition for this html tag.  Your definition
 *    must be registered using the WebComponents `document.registerElement` call.  Call `registerElement` after loading layerUI
 *    because layerUI contains the WebComponents polyfills.
 *
 * @property {Object} [settings.defaultHandler]    The default message renderer for messages not matching any other handler
 * @property {String[]} [settings.textHandlers=['autolinker', 'emoji', 'images', 'newline', 'youtube']] Specify which text handlers you want
 *    Note that any custom handlers you add do not need to be in the settings, they can be called after calling `init()` using layerUI.registerTextHandler.
 * @property {Object} [settings.maxSizes]  The maximum width/height for image and video previews
 * @property {Object} [settings.verticalMessagePadding=0]  Message handlers that must hard code a height into their dom nodes can be
 *     hard to add borders and padding around.  Use this property to offset any hardcoded height by this number of pixels
 */

layerUI.settings = {
  appId: '',
  messageGroupTimeSpan: 1000 * 60 * 30,
  disableTabAsWhiteSpace: false,
  markReadDelay: 2500,
  defaultHandler: {
    tagName: 'layer-message-unknown'
  },
  textHandlers: ['autolinker', 'emoji', 'images', 'newline', 'youtube'],
  maxSizes: { width: 512, height: 512 },
  verticalMessagePadding: 0
};

/**
 * Array of message handlers.  See layerUI.registerMessageHandler.
 *
 * @property {Object[]} handlers
 * @private
 */
layerUI.handlers = [];

/**
 * Hash of Text Handlers.  See layerUI.registerTextHandler.
 *
 * @property {Object} handlers
 * @private
 */
layerUI.textHandlers = {};

/**
 * Hash of components defined using layerUI.components.Component.
 *
 * @property {Object} components
 * @private
 */
layerUI.components = {};

/**
 * Any utilities that need global access will be added here.
 *
 * Utils object has no built-in properties, but rather components in the utils
 * folder will register their utilities here to simplify access to CDN users.
 *
 * @property {Object} utils
 */
layerUI.utils = {};

/**
 * Utility for getting a node for use in List Item `customNodeAbove` and `customNodeBelow`
 *
 * ```
 * if (!listItem.customNodeAbove) {
 *    var node = layerUI.createItemSeparator();
 *    node.appendChild(newSeparatorContent);
 *    listItem.customNodeAbove = node;
 * }
 * ```
 * @method createItemSeparator
 * @returns HTMLElement
 */
layerUI.createItemSeparator = function () {
  var node = document.createElement('div');
  node.classList.add(layerUI.itemSeparatorParentClassName);
  return node;
};

/**
 * Class to use with layerUI.createItemSeparator() created ndoes
 *
 * @property {String} [itemSeparatorParentClassName=layer-list-item-separator-parent]
 */
layerUI.itemSeparatorParentClassName = 'layer-list-item-separator-parent';

/**
 * Adds a separator between list items.
 *
 * While one can directly assign a node to `listItem.customNodeAbove`, there may be many processes that run
 * and which consider adding content between two list items. To do this, there should be a parent container,
 * as well as the ability to find this content and remove it from that parent container.
 *
 * ```
 * layerUI.addListItemSeparator(messageListItem, 'You have read up to here', 'layer-item-separator-read-indicator', true);
 * ```
 *
 * Or
 *
 * ```
 * var node = document.createElement('div');
 * node.innerHTML = 'You have read up to here';
 * layerUI.addListItemSeparator(messageListItem, node, 'layer-item-separator-read-indicator', true);
 * ```
 *
 * Both of these calls will result in `messageListItem.customNodeAbove` looking like:
 *
 * ```
 * <div class='layer-list-item-separator-parent'>
 *     <div class='layer-item-separator-read-indicator'>
 *         You have read up to here
 *     </div>
 * </div>
 * ```
 *
 * @method addListItemSeparator
 * @param {layerUI.mixins.ListItem} listItem    The List Item that the separator is associated with
 * @param {String/HTMLElement} content          The content to put in the separator
 * @param {String} contentClass                 Create a div with this class to put the content into; this allows us to see
 *                                               if there is already a node of that class.
 * @param {Boolean} isAboveItem                 If true, `listItem.customNodeAbove` is used, else `listItem.customNodeBelow`
 */
layerUI.addListItemSeparator = function addListItemSeparator(listItemNode, content, contentClass, isAboveItem) {
  var nodeName = isAboveItem ? 'customNodeAbove' : 'customNodeBelow';
  var node = void 0;

  if (content) {
    node = document.createElement('div');
    node.classList.add(contentClass);
  }

  if (content) {
    if (typeof content === 'string') {
      node.innerHTML = content;
    } else {
      node.appendChild(content);
    }
  }

  // If there is already a layer-list-item-separator-parent, then we just need to make sure it has this content
  if (listItemNode[nodeName] && node) {
    // If it looks like the content already exists, replace it
    var existingContent = listItemNode[nodeName].querySelector('.' + contentClass);
    if (existingContent) {
      existingContent.parentNode.replaceChild(node, existingContent);
    } else {
      listItemNode[nodeName].appendChild(node);
    }
  } else if (!listItemNode[nodeName] && node) {
    // Create a parent node and then add this to it
    var parent = layerUI.createItemSeparator();
    parent.appendChild(node);
    listItemNode[nodeName] = parent;
  } else if (listItemNode[nodeName] && !node) {
    var _existingContent = listItemNode[nodeName].querySelector('.' + contentClass);
    if (_existingContent) {
      _existingContent.parentNode.removeChild(_existingContent);
    }
  }
};

/**
 * A library of adapters for working with various Javascript frameworks.
 *
 * The following adapters are provided built-in:
 *
 * * layerUI.adapters.react
 * * layerUI.adapters.angular (Angular 1.x; does not handle Angular 2.x)
 * * layerUI.adapters.backbone
 *
 * @property {Object} adapters
 */
var adapterError = 'You must call layerUI.init() before you can use an adapter';
layerUI.adapters = {
  angular: function angular() {
    throw new Error(adapterError);
  },
  backbone: function backbone() {
    throw new Error(adapterError);
  },
  react: function react() {
    throw new Error(adapterError);
  }
};

/**
 * Provide a handler for a message containing a specific set of mimeTypes.
 *
 * Your testFunction will return true if it handles the input message.
 * Handlers are evaluated in the order they are registered, so if you have
 * multiple handlers that handle a specific combination of parts, put the default
 * one first.  Handlers can be reordered by directly accessing and manipulating the layerUI.handlers array.
 *
 * ```
 * layerUI.registerMessageHandler({
 *     tagName: 'text-image-location-part',
 *     label: 'Map',
 *     handlesMessage: function(message, container) {
 *       return (message.parts.length === 3 && message.parts[0].mimeType.match(/image\/jpeg/ && message.parts[1].mimeType === 'text/plain' && message.parts[2].mimeType === 'location/json');
 *    }
 * });
 * ```
 *
 * This example will create a `<text-image-locaton-part />` dom node to process any message with 3 parts:
 * an image/jpeg, text/plain and location/json parts.  Note that its up to your application to define a webcomponent for `text-image-location-part`
 * which receives the Message using its `item` property.
 *
 * Note that you can use the `container` argument to prevent some types of content from rendering as a Last Message within a Conversation List,
 * or use it so some MessageLists render things differently from others.
 *
 * @method registerMessageHandler
 * @static
 * @param {Object} options
 * @param {Function} options.handlesMessage
 * @param {Layer.Core.Message} options.handlesMessage.message    Message to test and handle with our handler if it matches
 * @param {HTMLElement} options.handlesMessage.container     The container that this will be rendered within; typically identifies a specific
 *                                                          layerUI.MessageList or layerUI.ConversationItem.
 * @param {Boolean} options.handlesMessage.returns          Return true to signal that this handler accepts this Message.
 * @param {String} options.tagName                          Dom node to create if this handler accepts the Message.
 * @param {String} options.label                            Label to show when we can't render the whole message.
 *                                                          Typically identifies the type of content to the user.
 * @param {Number} [options.order=0]                        Some handlers may need to be tested before other handlers to control which one gets
 *                                                          selected; Defaults to order=0, this handler is first
 */
layerUI.registerMessageHandler = function registerMessageHandler(options) {
  if (!options.order) options.order = 0;
  var pushed = false;
  for (var i = 0; i < layerUI.handlers.length; i++) {
    if (options.order <= layerUI.handlers[i].order) {
      layerUI.handlers.splice(i, 0, options);
      pushed = true;
      break;
    }
  }
  if (!pushed) layerUI.handlers.push(options);
};

/**
 * Return the handler object needed to render this Message.
 *
 * This function calls the `handlesMessage` call for each handler registered via layerUI.registerMessageHandler and
 * returns the first handler that says it will handle this Message.
 *
 * @method getHandler
 * @static
 * @param {Layer.Core.Message} message
 * @param {HTMLElement} container     The container that this will be rendered within
 * @return {Object} handler     See layerUI.registerMessageHandler for the structure of a handler.
 */
layerUI.getHandler = function (message, container) {
  var handlers = layerUI.handlers.filter(function (handler) {
    return handler.handlesMessage(message, container);
  });
  return handlers[0] || layerUI.settings.defaultHandler;
};

/**
 * Provide a text processor for a `text/plain` message.
 *
 * There is a lot of preprocessing of text that may need to be done before rendering text:
 *
 * * Replacing `\n` with `<br/>`
 * * Turning emoticons symbols into images
 * * Replacing image URLs with image tags
 * * Adding HTML formatting around quoted text
 * * Replacing youtube links with youtube videos
 * * Make up your own...
 *
 * You can enable a predefined Text Handler with:
 *
 * ```
 * layerUI.registerTextHandler({
 *    name: 'emoji'
 * });
 * ```
 *
 * You can define your own handler (defaults to enabled) with:
 *
 * ```
 * layerUI.registerTextHandler({
 *    name: 'youtube',
 *    order: 200,
 *    handler: function(textData, message) {
 *       textData.text = textData.text.replace(/https:\/\/(www\.)?(youtu\.be|youtube\.com)\/(watch\?.*v=)?([a-zA-Z0-9\-]+)/g, function(ignore1, ignore2, ignore3, ignore4, videoId) {
 *       return '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>';
 *   });
 * });
 * ```
 *
 * You can append data after your message using `afterText`:
 *
 * ```
 * layerUI.registerTextHandler({
 *    name: 'youtube',
 *    order: 200,
 *    handler: function(textData, message) {
 *       var matches = textData.text.match(/https:\/\/(www\.)?(youtu\.be|youtube\.com)\/(watch\?.*v=)?([a-zA-Z0-9\-]+)/g);
 *       if (matches[3) {
 *           textData.afterText.push('<iframe width="560" height="315" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>');
 *       }
 *   });
 * });
 * ```
 *
 * @method registerTextHandler
 * @static
 * @param {Object} options
 * @param {String} options.name      A unique name to give your handler
 * @param {Number} options.order     A number used to sort your handler amongst other handlers as order
 *      of execution can matter for any text handler that modifies the text parsed by subsequent parsers.
 * @param {Function} options.handler
 * @param {Object} options.handler.textData
 * @param {String} options.handler.textData.text          Use this to read the current text value and write an update to it
 * @param {String[]} options.handler.textData.afterText   Append elements to this array to add stuff to be rendered below the text.
 *      Anything that goes into `afterText` should NOT be parsed by any text handler.
 * @param {Layer.Core.Message} options.handler.message         If your text processor needs access to the original message, this is it, but should be treated as a read-only object in this context.
 * @param {Boolean} [requiresEnable=false]                If provided, this registers the handler but won't use the handler
 *       without a separate call to opt in.  Opt in later using with `layerUI.registerTextHandler({name: handlerName})`
 *       and no handler function.  (For Internal use only)
 * @param {Boolean} options.handler.isMessageListItem     If rendering the results in a MessageList, returns true, else we may be rendering this in a Toast popup, Conversation List Last Message, or elsewhere.  Emojis you may want in all places, but `afterText` will be ignored if its not in a Message List

 */
layerUI.registerTextHandler = function registerTextHandler(options) {
  if (layerUI.textHandlers[options.name]) {
    if (options.handler) {
      Object.keys(options).forEach(function (optionKey) {
        layerUI.textHandlers[options.name][optionKey] = options[optionKey];
      });
    } else {
      layerUI.textHandlers[options.name].enabled = true;
    }
  } else {
    options.enabled = !options.handler || !options.requiresEnable;
    if (!('order' in options)) options.order = 100000;
    layerUI.textHandlers[options.name] = options;
  }
};

/**
 * Register your template for use by an existing Component.
 *
 * Assumes that the specified Component has already been defined using layerUI.components.Component.
 *
 * This can be used to associate a template with the Component, or to overwrite the default template
 * with your custom template.
 *
 * Consider this `avatar.html` file:
 *
 * ```
 *
 * <template>
 *    <style>....</style>
 *    <img></img>
 * </template>
 * < script >
 *    // Register the template in this *.html file to be the layer-avatar template.
 *    window.layerUI.registerTemplate('layer-avatar')
 * </script>
 *
 * ```
 *
 * The call to layerUI.registerTemplate will find the template tag in avatar.html, and associate it with `layer-avatar`.
 *
 * NOTE: the above code assumes that `layerUI` has been attached to `window`; accessing `layerUI` from a template file may otherwise pose challenges.
 *
 * One can also register a template that wasn't created in a standalone template file such as `avatar.html`:
 *
 * * One could create a template using `document.createElement('template')`
 * * One could create a template by putting `<template id='my-avatar'>` within your index.html
 *
 * For these cases, you would need to pass a pointer to that template into `registerTemplate`:
 *
 * ```
 * var template = document.createElement('template');
 * template.innerHTML = '<img></img>';
 * layerUI.registerTemplate('layer-avatar', template);
 *
 * // OR
 * layerUI.registerTemplate('layer-avatar', document.getElementById('my-avatar');
 * ```
 *
 * Note that any styles you write for your template will require the tag-name to be a part of your CSS rules.
 * For those familiar with Shadow Dom and how it simplifies your CSS, we are **not** using Shadow Dom; these CSS
 * rules can affect everything on your page.
 *
 * @method registerTemplate
 * @static
 * @param {String} className                The tag name for the widget your setting the template for; 'layer-avatar'
 * @param {HTMLTemplateElement} [template]  Template node to register.  If none provided, will check the ownerDocument for a template.
 */
layerUI.registerTemplate = function registerTemplate(className, template) {
  if (!template) template = document._currentScript.ownerDocument.querySelector('template');

  // Since we aren't doing shadowDOM, and we don't want to insert the template <style/> tag a thousand times
  // for repeated components, remove the style from the template, and instead cache the styles in
  var styleMatches = template.innerHTML.match(/<style>([\s\S]*?)<\/style>/);
  var styles = styleMatches && styleMatches[1];
  if (styles) {
    template.innerHTML = template.innerHTML.replace(/<style>[\s\S]*?<\/style>/, '');
  }

  // Write template and style as static properties of the Component.
  layerUI.components[className].template = template;
  layerUI.components[className].style = styles;
  template.setAttribute('layer-template-registered', 'true');
};

/**
 * Register this template by passing in a string representation of the template.
 *
 * This is comparable to layerUI.registerTemplate except that
 *
 * 1. Instead of taking as input an HTMLTemplateElement, it instead takes a string containing the HTML for the template.
 * 2. Styles should have been removed from the string before calling this; failure to do so will cause the style to be added to your document
 * once per instanceo of this element.  Having 100 of the same style blocks can be a nuisance.
 *
 * @method buildAndRegisterTemplate
 * @static
 * @protected
 * @param {String} className          The tag name for the widget your setting the template for; 'layer-avatar'
 * @param {String} templateStr        Template string to register.
 */
layerUI.buildAndRegisterTemplate = function buildTemplate(className, templateStr) {

  // Generate a template node
  var template = document.createElement('template');
  template.innerHTML = templateStr;

  // Write it as a static property of the Component
  layerUI.components[className].template = template;
  template.setAttribute('layer-template-registered', 'true');
};

/**
 * Add the style for the template by passing in a string representation of the CSS rules.
 *
 * You do NOT need to call this if using layerUI.registerTemplate.
 *
 * This is comparable to layerUI.registerTemplate except that It only handles styles, not the template itself.
 *
 * @method buildStyle
 * @static
 * @protected
 * @param {String} className           The tag name for the widget your setting the template for; 'layer-avatar'
 * @param {String} styleStr            Style string to associate with this component.  Specifically, expects the output of `Function.toString()`
 */
layerUI.buildStyle = function buildStyles(className, styleStr) {
  layerUI.components[className].style = styleStr;
};

/**
 * Turn a hyphenated name into a camel case name.
 *
 * @method camelCase
 * @static
 * @param {String} str  a-hyphenated-string
 * @returns {String} aCamelCasedString
 */
layerUI.camelCase = function (str) {
  return str.replace(/-(.)/g, function (match, value) {
    return value.toUpperCase();
  });
};

/**
 * Turn a camel case name into a hyphenated name
 *
 * @method hyphenate
 * @static
 * @param {String} aCamelCasedString
 * @returns {String} a-hyphenated-string
 */
var regexHyphenate = /([a-z])([A-Z])/g;
layerUI.hyphenate = function (str) {
  return str.replace(regexHyphenate, function (match, part1, part2) {
    return part1 + '-' + part2.toLowerCase();
  });
};

/**
 * Utility returns whether or not the window is in the background.
 *
 * @method isInBackground
 * @static
 * @returns {Boolean}
 */
layerUI.isInBackground = function () {
  return !document.hasFocus() || document.hidden;
};

/**
 * An adapter is a bit of JS Framework specific code for making this framework work with other UI Frameworks.
 *
 * See layerUI.adapters for examples.
 *
 * An adapter does not need to be registered via `addAdapter` to be used, but doing so makes it available to anyone using this framework.
 *
 * ```
 * layerUI.addAdapter('my-odd-js-framework', function() {....});
 * ```
 *
 * @method addAdapter
 * @static
 * @param {String} name      Name of the adapter. Namespaces it within layerUI.adapters
 * @param {Function} adapter The adapter to make available to apps
 */
layerUI.addAdapter = function (name, adapter) {
  layerUI.adapters[name] = adapter;
};

/**
 * Call init with any custom settings, and to register all components with the dom.
 *
 * Note that `init()` must be called prior to putting any webcomponents into a document.
 *
 * Note as well that if passing in your appId, you must have instantiated a Layer.Core.Client with that appId
 * prior to putting any webcomponents into your document.
 *
 * ```javascript
 * layerUI.init({
 *   appId: 'layer:///apps/staging/my-app-id'
 * });
 * ```
 *
 * See layerUI.settings for more options to layerUI.init.
 *
 * @method init
 * @static
 * @param {Object} settings     list any settings you want changed from their default values.
 * @param {Object} mixins       hash of component names with mixins to add to the component
 */
layerUI.init = function init(settings) {
  // No-op -- see layer-ui.js
};

/**
 * Layer UI for Web version string
 *
 * @type {String}
 */
layerUI.version = '1.0.6';

var clientVersions = _layerWebsdk2.default.Client.version.split('.').map(function (value) {
  return Number(value);
});
if (clientVersions[0] !== 3 && _layerWebsdk2.default.Client.version !== '3.1.1') {
  console.error('This version or Layer UI for Web requires Layer WebSDK version 3.1.1 or up');
}

/**
 * This method is shorthand for accessing layerUI.components.Component.registerComponent
 *
 * Note: This code is actually in components/component.js and is only attached to layerUI
 * if you require `layer-ui-web/index.js` or just `layer-ui-web`, else you have to directly
 * access it.
 *
 * @method registerComponent
 */

module.exports = layerUI;
},{"layer-websdk":66}],5:[function(require,module,exports){
/**
 * This is the base class for all UI classes in the Layer UI Framework.
 *
 * It works with the webcomponent API/polyfill to define components that:
 *
 * * Provides getters/setters/defaults for all defined properties
 * * Read the widget's attributes on being initialized, copying them into properties and triggering property setters
 * * Provides created and destroyed callbacks
 * * Provides onReady and onAttach hooks for custom Mixins
 * * Automate standard template-related tasks
 * * Automate standard event-related tasks
 *
 * Methods and properties defined here should only be needed by developers wishing to build new widgets or evolve existing widgets.
 * Note that widgets can be created using other frameworks based on the webcomponent polyfill and still work here.
 *
 * A new component is created using:
 *
 * ```
 * var componentDefinition = {
 *   events: ['event-one', 'event-two', 'event-three', 'event-four'],
 *   mixins: [mixinObj1, mixinObj2, mixinObj3],
 *   properties: {
 *      prop1: {
 *          set: function(value) {
 *              this.myRenderer();
 *          }
 *      },
 *      prop2: {
 *          get: function() {
 *              return this.scrollTop;
 *          }
 *      },
 *      prop3: {
 *          value: "Frodo is a Dodo"
 *      },
 *      prop4: {
 *          type: Function
 *      }
 *   },
 *   methods: {
 *     onCreate: function() {
 *        alert("The widget has been created");
 *     },
 *     myRenderer: function() {
 *        this.innerHTML = this.properties.prop1;
 *     }
 *   },
 *   listeners: {
 *     'layer-notification-click': function notificationClick(evt) {
 *          const message = evt.detail.item;
 *          const conversation = message.getConversation();
 *          if (conversation) this.selectedId = conversation.id;
 *       },
 *    }
 *   }
 * };
 * ```
 *
 * A component defined this way can be registered as follows:
 *
 * ```
 * var layerUI = require('layer-ui-web');
 * layerUI.registerComponent(tagName, componentDefinition);
 * ```
 *
 * ### Properties
 *
 * A property definition can be as simple as:
 *
 * ```
 * layerUI.registerComponent(tagName, {
 *    properties: {
 *       prop1: {}
 *    }
 * });
 * ```
 *
 * The above code declares `prop1` to be a property, sets up a setter that writes `widget.properties.prop1` any time `widget.prop1` is set,
 * and sets up a getter to read the value from `widget.properties.prop1`.  It also insures that at initialization time, if a `prop1` attribute
 * is found, it will be used as the `prop1` property.
 *
 * Property Definitions support the following keys:
 *
 * *  set: A setter function whose input is the new value.  Note that your setter function is called AFTER this.properties.propName
 *    has been set with the new value; your setter is for any side effects, rendering updates, or additional processing and NOT
 *    for writing the value itself.
 * *  get: A getter is needed if getting the property value from `this.properties.propName` is not getting the latest value.
 *    Perhaps you want to return `this.nodes.input.value` to get text typed in by a user.
 * *  value: If a `value` key is provided, then this will be the default value of your property, to be used if a value is
 *    not provided by the component creator.
 * *  type: Currently accepts `Boolean`, `Number`, `Function`.  Using a type makes the system
 *    more forgiving when processing strings.  This exists because attributes frequently arrive as strings due to the way HTML attributes work.
 *    For example:
 *    * if type is Boolean, and "false", "null", "undefined", "" and "0" are evaluated as `false`; all other values are `true`
 *    * Using this with functions will cause your function string to be evaled, but will lose your function scope and `this` pointer.
 *    * Using this with a number will turn "1234" into `1234`
 * *  noGetterFromSetter: Do **not** use the getter function from within the setter.  Used for special cases where
 *    you have a getter that calculates the values, but where your setter should just make do with the last known value
 *    when determining if the value has changed.
 *
 * Example
 *
 * ```
 *  isEnabled: {
 *    type: Boolean,
 *    value: true,
 *    set: function(inValue) {
 *       this.classList.toggle('widget-enabled', inValue);
 *    },
 *    get: function() {
 *       return this.classList.contains('widget-enabled');
 *    }
 * }
 * ```
 *
 * ### Events
 *
 * As part of your layerUI.components.Component.registerComponents call you can pass in an `events` array; this is an array of strings representing events to listen for,
 * and provide as property-based event listeners.
 *
 * Example:
 *
 * ```
 * layerUI.registerComponent(tagName, {
 *    events: ['layer-something-happening', 'layer-nothing-happening', 'your-custom-event']
 * });
 * ```
 *
 * The above component definition will result in:
 *
 * 1. The component will listen for the 3 events listed, regardless of whether this component triggered the event,
 *    or its child components triggered the event.
 * 2. The component will define the following properties: `onSomethingHappening`, `onNothingHappening` and `onYourCustomEvent`. These properties
 *    are defined for you, you do not need to do anything more than list the events in the events array.
 * 3. Your app can now use either event listeners or property callbacks as illustrated below:
 *
 * Event Listeners:
 *
 * ```
 * document.body.addEventListener('layer-something-happening', myFunc);
 * document.body.addEventListener('layer-nothing-happening', myFunc);
 * document.body.addEventListener('your-custom-event', myFunc);
 * ```
 *
 * Property callbacks:
 * ```
 * widget.onSomethingHappening = myFunc;
 * widget.onNothingHappening = myFunc;
 * widget.onYourCustomEvent = myFunc;
 * ```
 *
 * ### Methods
 *
 * You may provide any methods you want within the `methods` hash; be aware though that some methods names
 * are reserved for use by the framework, and some have specific life-cycle implications for the widget.
 *
 * #### Reserved
 *
 * The following method names are reserved:
 *
 * * `createdCallback`
 * * `attachedCallback`
 * * `detachedCallback`
 * * `attributeChangedCallback`
 *
 * ### Mixins
 *
 * Mixins can be added to a widget in two ways:
 *
 * * A Component may add a `mixins` array to its definition
 * * An Application, initializing the framework via `layerUI.init()` may pass in mixins into the `init` call.
 *
 * #### Using Mixins from the Component
 *
 * A component can include any number of Mixins by adding them to the `mixins` Array:
 *
 * ```
 * // Define a Mixin that can contains `properties`, `methods` and `events`:
 * var mixinObj = {
 *   properties: {
 *     prop2: {}
 *   },
 *   methods: {
 *     method2: function() {
 *       alert("I two Met Hed; he was a little nerdy");
 *     }
 *   }
 * });
 *
 * // Add mixinObj to our Component
 * var componentDefinition = {
 *   mixins: [mixinObj],
 *   properties: {
 *      prop1: {
 *          set: function(value) {
 *              this.myRenderer();
 *          }
 *      }
 *   },
 *   methods: {
 *     method1: function() {
 *       alert("I Met Hed; he was nice");
 *     }
 *   }
 * });
 *
 * // Create a Component with prop1, prop2, method1 and method2
 * registerComponent(tagName, componentDefinition);
 * ```
 *
 * An app can modify an existing component by adding custom mixins to it using `layerUI.init()`.  The `mixins` parameter
 * takes as keys, the tag-name for any widget you want to customize;
 * (e.g `layer-messages-item`, `layer-messages-list`, `layer-conversation-panel`, etc...)
 *
 * The following example adds a search bar to the Message List:
 *
 * ```
 * // Define a Mixin that can contains `properties`, `methods` and `events`:
 * var mixinObj = {
 *   properties: {
 *     prop2: {}
 *   },
 *   methods: {
 *     method2: function() {
 *       alert("I two Met Hed; he was a little nerdy");
 *     }
 * });
 *
 * layerUI.init({
 *   appId: 'my-app-id',
 *   mixins: {
 *     'layer-messages-item': mixinObj
 *   }
 * });
 * ```
 *
 * #### Mixin Behaviors
 *
 * Your mixin can be used to:
 *
 * * Add new Events to the widget's `events` array (presumably one of your new methods will call `this.trigger('my-event-name')`)
 * * Add new properties
 * * Add new methods
 * * Add new behaviors to existing properties
 * * Add new behaviors to existing methods
 * * Overwrite existing methods
 *
 * ##### Adding an Event
 *
 * ```
 * var mixinObj = {
 *   events: ['mycompany-button-click'],
 *   methods: {
 *     onCreate: function() {
 *       this.nodes.button = document.createElement('button');
 *       this.appendChild(this.nodes.button);
 *       this.nodes.button.addEventListener('click', this._onMyCompanyButtonClick.bind(this));
 *     },
 *     _onMyCompanyButtonClick: function(evt) {
 *       this.trigger('mycompany-button-click', { message: this.item.message });
 *     }
 *   }
 * });
 * ```
 *
 * When the user clicks on the `this.nodes.button`, it will trigger the `mycompany-button-click` event.  By listing
 * `mycompany-button-click` event in the `events` array, this will automatically add the `onMycompanyButtonClick` property
 * which you can set to your event handler (or you may just use `document.addEventListener('mycompany-button-click', callback)`).
 *
 * ##### Add new behaviors to existing properties
 *
 * If you are modifying a widget that has an existing property, and you want additional side effects to
 * trigger whenever that property is set, you can add your own `set` method to the property.
 * Other modifications to the property will be ignored (`value` and `get` from mixin will be ignored).
 *
 * ```
 * var mixinObj = {
 *   properties: {
 *     client: {
 *       set: function(client) {
 *         this.properties.user = client.user;
 *       }
 *     }
 *   }
 * };
 * ```
 *
 * The above mixin can be added to any widget;
 *
 * * If the widget already has a `client` property, both the widget's setter and your setter will be called; order of call is not predetermined.
 * * If the widget does *not* already have a `client`, your `client` setter will be called if/when the `client` is set.
 *
 * You can use the Mixin to add any method your widget needs.
 *
 * You can also use the Mixin to enhance methods already provided by your widget:
 *
 * ```
 * var mixinObj = {
 *   methods: {
 *     onCreate: function() {
 *         var div = document.createElement('div');
 *         this.appendChild(div);
 *       }
 *     }
 *   }
 * };
 * ```
 *
 * The above mixin can be added to any widget; the widget's `onCreate` method will be called, AND your `onCreate` method will be called, in no
 * particular order.  You an also use the following `mode` values to change ordering:
 *
 * * `layerUI.registerComponent.MODES.BEFORE`: Call your mixin's method before the widget's method
 * * `layerUI.registerComponent.MODES.AFTER`: Call your mixin's method after the widget's method
 * * `layerUI.registerComponent.MODES.OVERWRITE`: Call only your mixin's method, *not* the widget's method
 * * `layerUI.registerComponent.MODES.DEFAULT`: Call your mixin's method in no particular order with regards to the widget's methods
 *
 * ```
 * var mixinObj = {
 *   methods: {
 *     onCreate: {
 *       mode: layerUI.registerComponent.MODES.BEFORE,
 *       value: function() {
 *         var div = document.createElement('div');
 *         this.appendChild(div);
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * You can also define a `conditional` on your methods; if any `conditional` function returns `false`, then none of the `BEFORE`, `AFTER`, `DEFAULT` or `OVERWRITE` methods are called:
 *
 * ```
 * var mixinObj = {
 *   methods: {
 *     onRender: {
 *       conditional: function() {
 *         return Boolean(this.item);
 *       },
 *       mode: layerUI.registerComponent.MODES.BEFORE,
 *       value: function() {
 *         var div = document.createElement('div');
 *         this.appendChild(div);
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * For details on what methods to modify via mixins, see the Life Cycle methods
 *
 * #### Life Cycle Methods
 *
 * All widgets should execute the following life cycle methods:
 *

                                                                                                                                                                                                    1. `onCreate()`: Your widget has been created.
 * Uses for `onCreate`:
 * Setup event handlers
 * Add custom nodes and properties that do not depend upon property values
 * Setup local variables/state variables.
 * Widget State when `onCreate` is called:
 * If you have a template, it will have been loaded into your widget before `onCreate`, adding any neccessary child nodes
 * `this.nodes` will be setup and point to any nodes in your template that specify a `layer-id`.
 * If your widget was created with any attributes, they _may_ be available in `this.properties` but you should not depend upon them being set yet.
 * No property setters will have been called yet
 * Your widget will not have a `parentNode`
                                                                                                                                                                                                    1. Property Setters: Your property setters will be called with any attributes and/or properties that your widget was initialized with.
 * The following widget `<my-widget prop1='frodo' prop2='dodo'></my-widget>` will call your setter for `prop1`
                                                                                                                                                                                                         with `frodo`, and `prop2` with `dodo`
 * Default property values will be set; a property defined like this: `properties: { prop1: { value: 55, set: function(newValue) {alert('Set!');} } }` will cause the `prop1` setter will be called with `55`
 * Any properties set via `var element = document.createElement('widget'); element.prop1 = 'frodo';` will fire at this point as well.
 * If no attribute value is passed in and no default value is set the `prop1` setter will *not* be called, and the value will be `null`
                                                                                                                                                                                                    1. `onAfterCreate()`: Your widget has been initialized.
 * Uses for `onAfterCreate`:
 * Setup and DOM manipulation that depends upon property values (else it would go in `onCreate`)
 * One time DOM manipulation based on property values that never change.  Any DOM manipulation based on values that change
                                                                                                                                                                                                            would typically go in `onRender` which can be called repeatedly.
 * Widget state when `onAfterCreate` is called:
 * `onCreate` has been called
 * Property setters have all fired
 * `onRender` has **not**  been called
                                                                                                                                                                                                    1. `onRender()`: DOM manipulation based on current property values.
 * Uses for `onRender`:
 * Typically called after a property value changes that would force the widget to rerender.  Note that for very specific and simple DOM changes,
                                                                                                                                                                                                            the property setter may directly update the DOM rather than call `onRender`.
 * Unlike `onAfterCreate`, `onRender` may be called multiple times
 * Note that this is called immediately after `onAfterCreate`,
 * Note that calls to `onRender` from your property setters will beo ignored until `onAfterCreate` has been called.
 * Widget state when `onRender` is called:
 * The first call will be before `onAttach`; subsequent calls may happen before or after this widget has a `parentNode`
 * `onCreate`, all property setters, and `onAfterCreate` have been called.
                                                                                                                                                                                                    1. `onRerender()`: Widgets that render a Layer Web SDK Object listen for changes to the object and call `onRerender` to update rendering
                                                                                                                                                                                                       of things that can change within those objects.  Unlike `onRender` which would let you render an entirely new Message or Conversation,
                                                                                                                                                                                                       `onRerender` would handle changes within the existing Message or Conversation.  `onRerender` is also used when listening for events
                                                                                                                                                                                                       rather than changes to properties.
                                                                                                                                                                                                    1. `onAttach()`: Your widget has been added to a document.
 * Uses for `onAttach`:
 * Your widget needs to know its `parentNode` to modify its rendering.
 * Your widget needs some sizing information to modify its rendering.
 * Widget state when `onAttach` is called:
 * `onRender` will always be called before `onAttach`.
 * `parentNode` should now have a value.
 * Removing this widget from the DOM and then reinserting it _may_ refire this call.  It will Not refire `onRender`.
                                                                                                                                                                                                    1. `onDetach()`: Your widget has been removed from the html document.
                                                                                                                                                                                                    1. `onDestroy()`: Your widget was has been flagged as destroyed.  This happens if it was removed from the HTML Document, and remained out of
                                                                                                                                                                                                       the document for more than a few moments. Use this function to unsubscribe from any custom event listeners you setup for your widget.
 *
 * #### Templates
 *
 * There are a number of ways that a template can be registered to your component.
 *
 * _Define a full Template while registering Component_:
 *
 * ```
 * var template = document.querySelector('template');
 * layerUI.registerComponent('my-widget', {
 *     template: template
 * });
 * ```
 *
 * _Define a template string while registering Component_:
 *
 * Note that unless the `<template/>` node, the template string is assumed to be DOM nodes only, and no `<style/>` blocks.
 * If using a template string, you may separately provide a style string:
 *
 * ```
 * layerUI.registerComponent('my-widget', {
 *     template: '<div><button />Click me</div>',
 *     styles: 'my-widget {display: block}'
 * });
 * ```
 *
 * _Define a template after defining your component_:
 *
 * ```
 * layerUI.registerComponent('my-widget', {
 * });
 *
 * layerUI.registerTemplate('my-widget', document.querySelector('template'));
 * ```
 *
 * _Define a template string after defining your component_:
 *
 * ```
 * layerUI.registerComponent('my-widget', {
 * });
 *
 * layerUI.buildAndRegisterTemplate('my-widget', '<div><button />Click me</div>');
 * ```
 *
 * @class layerUI.components.Component
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _stateManager = require('../mixins/state-manager');

var _stateManager2 = _interopRequireDefault(_stateManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Register a component using the specified HTML tagName.
 *
 * Note that you may define your components and styles any way you like, you do not need to conform your
 * component structure to the expected input of this function.  This function Does however provide
 * many simplifying capabilities including
 *
 *  * Auto-generation of setters/getters removing unneccessary boilerplate
 *  * Automatic mapping of hyphen-cased properties to camel-case attributes used within your component
 *  * Automatic applying of any property values passed in before your setters could trigger; gaurentees setters trigger after initialization
 *  * Automatic detection and copying of attribute values into properties
 *  * Utilities for managing templates and styles that are seen within `layerUI` all depend upon this structure.
 *
 * @method registerComponent
 * @static
 * @param {String} tagName    Tag name that is being defined (`layer-avatar`)
 * @param {Object} classDef    Definition of your class
 * @param {Object} classDef.properties    Definition of your class properties
 * @param {Object} classDef.methods    Definition of your class methods
 * @param {String[]} classDef.events    Array of events to listen for and repackage as event handler properties
 * @param {Mixed} template     A `<template />` node or a template string such as `<div><button /></div>`
 * @param {String} style       A String with CSS styles for this widget
 */


/*
 * Setup the Real structure needed for the `methods` object, not a hash of functions,
 * but a hash of functions with a `mode` parameter
 */
function setupMethods(classDef, methodsIn) {
  var methods = classDef.methods;
  Object.keys(methodsIn).forEach(function (methodName) {
    if (!methods[methodName]) methods[methodName] = {};
    var methodDef = methods[methodName];
    var methodInDef = methodsIn[methodName];
    if (!methodDef.methodsBefore) {
      methodDef.methodsBefore = [];
      methodDef.methodsAfter = [];
      methodDef.methodsMiddle = [];
      methodDef.conditional = [];
    }
    if (typeof methodInDef === 'function') {
      methodDef.methodsMiddle.push(methodsIn[methodName]);
    } else if (methodInDef.mode === registerComponent.MODES.BEFORE) {
      methodDef.methodsBefore.push(methodsIn[methodName].value);
    } else if (methodInDef.mode === registerComponent.MODES.AFTER) {
      methodDef.methodsAfter.push(methodsIn[methodName].value);
    } else if (methodInDef.mode === registerComponent.MODES.OVERWRITE) {
      methodDef.lock = methodInDef.value;
    } else if (methodInDef.mode === registerComponent.MODES.DEFAULT) {
      methodDef.methodsMiddle.push(methodsIn[methodName].value);
    }
    if (methodInDef.conditional) methodDef.conditional.push(methodInDef.conditional);
  });
}

/*
 * Provides a basic mixin mechanism.
 *
 * Provide an array of objects with a `properties` key and a `methods` key,
 * and all property defintions and method defintions will be copied into your classDef UNLESS your classDef
 * has provided its own definition.
 * If your mixin provides a created() method, it will be called after the classDef created() method is called;
 * this will be called for any number of mixins.
 *
 * If your mixin provides a property that is also defined by your component,
 *
 * @method setupMixin
 * @param {Object} classDef
 * @private
 */
function setupMixin(classDef, mixin) {
  var propNames = Object.keys(mixin.properties || {});

  // Copy all properties from the mixin into the class definition,
  // unless they are already defined.
  propNames.forEach(function (name) {
    if (!classDef['__' + name]) classDef['__' + name] = [];
    classDef['__' + name].push(mixin.properties[name]);

    // Make sure that this becomes a part of the properties definition of the class if the prop
    // isn't already defined.  used by the props array.
    if (!classDef.properties[name]) {
      classDef.properties[name] = mixin.properties[name];
    } else {
      if (mixin.properties[name].order !== undefined && classDef.properties[name].order === undefined) {
        classDef.properties[name].order = mixin.properties[name].order;
      }
      if (mixin.properties[name].value !== undefined && classDef.properties[name].value === undefined) {
        classDef.properties[name].value = mixin.properties[name].value;
      }
      if (mixin.properties[name].propagateToChildren !== undefined && classDef.properties[name].propagateToChildren === undefined) {
        classDef.properties[name].propagateToChildren = mixin.properties[name].propagateToChildren;
      }
    }
  });

  setupMethods(classDef, mixin.methods || {});
}

/*
 * Merge all mixin function definitions into a single function call.
 *
 * @method finalizeMixinMerge
 * @param {Object} classDef
 * @private
 */
function finalizeMixinMerge(classDef) {
  var propNames = Object.keys(classDef.properties || {});
  propNames.forEach(function (name) {
    if (classDef['__' + name]) {

      // NOTE: Modes are currently applied to properties, but we do not yet support OVERWRITE mode.
      var setters = _layerWebsdk2.default.Util.sortBy(classDef['__' + name].filter(function (def) {
        return def.set;
      }), function (setter) {
        switch (setter.mode) {
          case registerComponent.MODES.BEFORE:
            return 1;
          case registerComponent.MODES.AFTER:
            return 3;
          default:
            return 2;
        }
      });
      classDef['__set_' + name] = setters.map(function (setter) {
        return setter.set;
      });
    }
  });

  var methodNames = Object.keys(classDef.methods || {});

  methodNames.forEach(function (methodName) {
    var methodDef = classDef.methods[methodName];
    var methodList = [].concat(_toConsumableArray(methodDef.methodsBefore), _toConsumableArray(methodDef.methodsMiddle), _toConsumableArray(methodDef.methodsAfter));
    if (methodDef.lock) methodList = [methodDef.lock];
    if (methodList.length === 1 && !methodDef.conditional.length) {
      classDef.methods[methodName] = methodList[0];
    } else {
      classDef['__method_' + methodName] = methodList;
      classDef.methods[methodName] = getMethod(classDef, methodDef.conditional, classDef['__method_' + methodName]);
    }
  });
}

function getMethod(classDef, conditionals, methods) {
  return function runMethod() {
    var _this = this;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var result = void 0;
    for (var i = 0; i < conditionals.length; i++) {
      if (!conditionals[i].apply(this, args)) return;
    }

    methods.forEach(function (method) {
      var resultTmp = method.apply(_this, args);
      if (resultTmp !== undefined) result = resultTmp;
    });
    return result;
  };
}

/*
 * Add all mixin events in, and then call setupEvents on each event
 */
function setupEvents(classDef) {
  classDef.mixins.filter(function (mixin) {
    return mixin.events;
  }).forEach(function (mixin) {
    classDef.events = classDef.events.concat(mixin.events);
  });
  classDef.events.forEach(function (eventName) {
    return setupEvent(classDef, eventName);
  });
}

/*
 * For each event defined in the `events` property, setup an `onXXX` property.
 *
 * The `onXXX` property works by:
 *
 * 1. Doing nothing unless the app sets this event property to a Function
 * 2. Listening for the specified event via addEventListener
 * 3. Calling any provided function with the event provided by addEventListener
 * 4. Call removeEventListener should this property ever change
 *
 * @method setupEvent
 * @private
 * @param {Object} classDef
 * @param {String} eventName
 */
function setupEvent(classDef, eventName) {
  var camelEventName = _base2.default.camelCase(eventName.replace(/^layer-/, ''));
  var callbackName = 'on' + camelEventName.charAt(0).toUpperCase() + camelEventName.substring(1);
  if (!classDef.properties[callbackName]) {
    classDef.properties[callbackName] = {
      type: Function,
      set: function set(value) {
        if (this.properties['old-' + eventName]) {
          this.removeEventListener(eventName, this.properties['old-' + eventName]);
          this.properties['old-' + eventName] = null;
        }
        if (value) {
          this.addEventListener(eventName, value);
          this.properties['old-' + eventName] = value;
        }
      }
    };
  }
}

/*
 * Get an array of property descriptions.
 *
 * @method
 * @private
 * @param {Object} classDef
 */
function getPropArray(classDef) {
  // Translate the property names into definitions with property/attribute names
  return Object.keys(classDef.properties).map(function (propertyName) {
    return {
      propertyName: propertyName,
      attributeName: _base2.default.hyphenate(propertyName),
      type: classDef.properties[propertyName].type,
      order: classDef.properties[propertyName].order,
      noGetterFromSetter: classDef.properties[propertyName].noGetterFromSetter,
      propagateToChildren: classDef.properties[propertyName].propagateToChildren
    };
  }).sort(function (a, b) {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    } else if (a.order !== undefined) {
      return -1;
    } else if (b.order !== undefined) {
      return 1;
    } else {
      return 0;
    }
  });
}

/*
 * Cast a property value to its specified type
 */
function castProperty(type, value) {
  // Some special handling is needed for some properties as they may be delivered
  // as strings HTML delivers attributes as strings.
  switch (type) {
    // Translate strings into booleans
    case Boolean:
      if (['false', '0', 'null', 'undefined'].indexOf(value) !== -1) {
        return false;
      } else {
        return Boolean(value);
      }

    case Number:
      return Number(value);

    // Translate strings into functions
    case Function:
      return typeof value === 'string' ? eval('(' + value + ')') : value;
  }
  return value;
}

/*
 * Define a single property based on a single property from the Component's `properties` definition.
 *
 * Will setup the properties getter, setter, default value, and type.
 *
 * @method setupProperty
 * @private
 * @param {Object} classDef   The class definition object
 * @param {Object} prop       A property definition as generated by getPropArray
 * @param {Object} propertyDefHash  A hash of all property definitions for use in reflection
 */
function setupProperty(classDef, prop, propertyDefHash) {
  var newDef = {};
  var name = prop.propertyName;
  var propDef = classDef.properties[name];

  // Copy our property definition into our hash of definitions
  // which will be associated with this class for reflection purposes
  propertyDefHash[name] = propDef;

  // If a getter is provided, use it. else provide a getter that returns this.properties[name].
  // However, if the call comes before we have a properties object, this is an initialization phase
  // where we should not yet have properties so return undefined.

  // NOTE: Do not use arrow functions; that will change the "this" pointer.
  newDef.get = function getter() {
    if (this.properties._internalState.disableGetters) {
      return this.properties[name];
    } else {
      return propDef.get ? propDef.get.apply(this) : this.properties[name];
    }
  };

  // The property setter will set this.properties[name] and then if there is a custom setter, it will be invoked.
  // This means that the setter does NOT need to write to this.properties, but can handle side effects, transformations, etc...
  newDef.set = function propertySetter(value) {
    var _this2 = this;

    if (_base2.default.debug) console.log('Set property ' + this.tagName + '.' + name + ' to ', value);

    if (propDef.type) value = castProperty(propDef.type, value);

    var oldValue = prop.noGetterFromSetter ? this.properties[name] : this[name];
    if (oldValue !== value || this.properties._internalState.inPropInit.indexOf(name) !== -1) {

      // can't call setters with this on because the setters will set other properties which should not
      // trigger further setters if there was no actual change
      var initIndex = this.properties._internalState.inPropInit.indexOf(name);
      var wasInit = initIndex !== -1;
      if (wasInit) this.properties._internalState.inPropInit.splice(initIndex, 1);

      this.properties[name] = value;
      if (classDef['__set_' + name] && !this.properties._internalState.disableSetters) {
        classDef['__set_' + name].forEach(function (setter) {
          return setter.call(_this2, value, wasInit ? null : oldValue);
        });
      }

      if (propDef.propagateToChildren) {
        Object.keys(this.nodes).forEach(function (nodeName) {
          _this2.nodes[nodeName][name] = value;
        });
        if (this._isList) {
          var childNodes = this.childNodes;
          var i = void 0;
          for (i = 0; i < childNodes.length; i++) {
            if (childNodes[i]._isListItem) childNodes[i][name] = value;
          }
        }
      }
    }
  };

  // Write the property def to our class that will be passed into document.registerElement(tagName, classDef)
  classDef[name] = newDef;
}

var registerAllCalled = false;
function registerComponent(tagName, classDef) {
  if (!_base2.default.components[tagName]) _base2.default.components[tagName] = {};
  _base2.default.components[tagName].def = classDef;

  if (classDef.template) {
    _base2.default.components[tagName].template = classDef.template;
    delete classDef.template;
  }

  if (classDef.style) {
    _base2.default.components[tagName].style = classDef.style;
    delete classDef.style;
  }

  if (registerAllCalled) _registerComponent(tagName);
}

// Docs in layer-ui.js
function unregisterComponent(tagName) {
  delete _base2.default.components[tagName];
}

// Docs in layer-ui.js
function registerAll() {
  registerAllCalled = true;
  Object.keys(_base2.default.components).filter(function (tagName) {
    return typeof _base2.default.components[tagName] !== 'function';
  }).forEach(function (tagName) {
    return _registerComponent(tagName);
  });
}

function _registerComponent(tagName) {
  var classDef = _base2.default.components[tagName].def;
  var template = _base2.default.components[tagName].template;


  if (template) {
    if (typeof template === 'string') {
      _base2.default.buildAndRegisterTemplate(tagName, template);
    } else if (template.getAttribute('layer-template-registered') !== 'true') {
      _base2.default.registerTemplate(tagName, template);
    }
  }

  // Insure property exists
  if (!classDef.properties) classDef.properties = {};
  if (!classDef.methods) classDef.methods = {};
  if (!classDef.events) classDef.events = [];
  if (!classDef.mixins) classDef.mixins = [];
  classDef.mixins.push(_stateManager2.default);

  // Add in custom mixins specified via layerUI.settings
  if (_base2.default.settings.mixins[tagName]) {
    classDef.mixins = classDef.mixins.concat(_base2.default.settings.mixins[tagName]);
  }

  // Setup all events specified in the `events` property.  This adds properties,
  // so must precede setupMixins
  setupEvents(classDef);

  // Replace all methods with "merge" parameters
  var methods = classDef.methods;
  classDef.methods = {};
  setupMethods(classDef, standardClassMethods);
  setupMethods(classDef, methods);

  // Propare the classDef's properties to merge with Mixin properties
  var properties = classDef.properties;
  classDef.properties = {};
  setupMixin(classDef, { properties: properties });
  setupMixin(classDef, { properties: standardClassProperties });

  // Some mixins may have mixins of their own; add them to the list;
  // every newly added item must also be processed, so insure loop touches on new items as well
  for (var i = 0; i < classDef.mixins.length; i++) {
    var mixins = classDef.mixins[i].mixins;
    if (mixins) {
      mixins.forEach(function (submixin) {
        if (classDef.mixins.indexOf(submixin) === -1) classDef.mixins.push(submixin);
      });
    }
  }

  classDef.properties._listeners = {
    value: Object.keys(classDef.listeners || {})
  };

  classDef.mixins.forEach(function (mixin) {
    return setupMixin(classDef, mixin);
  });
  finalizeMixinMerge(classDef);

  // For each property in the methods hash, setup the setter/getter
  var propertyDefHash = {};
  var props = getPropArray(classDef);

  // Add the property to our object, with suitable getters and setters
  props.forEach(function (prop) {
    return setupProperty(classDef, prop, propertyDefHash);
  });

  // Cleanup; we no longer need this properties object; it can be accessed via propertyDefHash
  delete classDef.properties;

  // For every method, add the expected structure to the function
  Object.keys(classDef.methods).forEach(function (name) {
    classDef[name] = {
      value: classDef.methods[name],
      writable: true
    };
  });
  delete classDef.methods;

  // This veresion of listeners does not blend listeners from multiple mixins
  Object.keys(classDef.listeners || {}).forEach(function (name) {
    classDef['__listener-' + name] = {
      value: classDef.listeners[name],
      writable: true
    };
  });
  delete classDef.listeners;

  /**
   * createdCallback is part of the Webcomponent lifecycle and drives this framework's lifecycle.
   *
   * It is called after the widget has been created.  We use this to initialize properties, nodes,
   * templates, wait for more properties, call property setters, call `onAfterCreate`, etc.
   *
   * @method createdCallback
   * @private
   */
  classDef.createdCallback = {
    value: function createdCallback() {
      var _this3 = this;

      if (!_base2.default.components[tagName]) return;

      this._initializeProperties();
      this.nodes = {};

      // If a template has been assigned for this class, append it to this node, and parse for layer-ids
      // Note that in the event of a node.cloneNode() properties are not copied, but attributes are.
      // Also, in the event of a cloneNode, the template in full is copied, and should not be reimported.
      // layer-has-template allows us to insure we don't import a template if one is provided via cloneNode.
      var templateNode = this.getTemplate();
      if (templateNode) {
        if (!this.getAttribute('layer-has-template')) {
          var clone = document.importNode(templateNode.content, true);
          this.appendChild(clone);
          this.setAttribute('layer-has-template', 'true');
        }
        this.setupDomNodes();
      }

      // Call the Compoent's created method which sets up DOM nodes,
      // event handlers, etc...
      this.onCreate();

      // Call the Component's onAfterCreate method which can handle any setup
      // that requires all properties to be set, dom nodes initialized, etc...
      _layerWebsdk2.default.Util.defer(function () {
        return _this3._onAfterCreate();
      });
    }
  };

  classDef._setupListeners = {
    value: function _setupListeners() {
      var _this4 = this;

      this._listeners.forEach(function (eventName) {
        document.body.addEventListener(eventName, _this4._handleListenerEvent.bind(_this4, '__listener-' + eventName));
      });
    }
  };

  classDef._handleListenerEvent = {
    value: function _handleListenerEvent(methodName, evt) {
      if (this.properties.listenTo.indexOf(evt.target.id) !== -1) {
        this[methodName].apply(this, [evt]);
      }
    }
  };

  classDef._onAfterCreate = {
    value: function _onAfterCreate() {
      var _this5 = this;

      // Happens during unit tests
      if (this.properties._internalState.onDestroyCalled) return;

      // Allow Adapters to call _onAfterCreate... and then insure its not run a second time
      if (this.properties._internalState.onAfterCreateCalled) return;
      this.properties._internalState.disableSetters = false;
      this.properties._internalState.disableGetters = false;
      this.properties._internalState.inPropInit = _base2.default.components[tagName].properties.map(function (propDef) {
        return propDef.propertyName;
      });

      props.forEach(function (prop) {
        var value = _this5.properties[prop.propertyName];
        // UNIT TEST: This line is primarily to keep unit tests from throwing errors
        if (value instanceof _layerWebsdk2.default.Root && value.isDestroyed) return;
        if (value !== undefined && value !== null) {
          // Force the setter to trigger; this will force the value to be converted to the correct type,
          // and call all setters
          _this5[prop.propertyName] = value;

          if (prop.propagateToChildren) {
            Object.keys(_this5.nodes).forEach(function (nodeName) {
              return _this5.nodes[nodeName][prop.propertyName] = value;
            });
          }
        }

        // If there is no value, but the parent component has the same property name, presume it to also be
        // propagateToChildren, and copy its value; useful for allowing list-items to automatically grab
        // all parent propagateToChildren properties.
        else if (prop.propagateToChildren && _this5.parentComponent) {
            var parentValue = _this5.parentComponent.properties[prop.propertyName];
            if (parentValue) _this5[prop.propertyName] = parentValue;
          }
      });
      this.properties._internalState.inPropInit = [];

      // Warning: these listeners may miss events triggered while initializing properties
      // only way around this is to add another Layer.Util.defer() to our lifecycle
      this._setupListeners();

      this.onAfterCreate();
    }
  };

  /**
   * A hash of DOM nodes that are important to this widget.
   *
   * Any dom node in a template file that has a `layer-id` will be written to this hash.
   *
   * Example:
   *
   * ```
   * <template>
   *   <a layer-id='link'><img layer-id='image' /></a>
   * </template
   * ```
   *
   * The above template will result in a `nodes` value of:
   *
   * ```
   * {
   *     link: anchorObject,
   *     image: imageObject
   * }
   * ```
   *
   * And then allow me to have code such as:
   *
   * ```
   * render: function() {
   *    this.nodes.image.src = this.properties.url;
   * }
   * ```
   *
   * @property {Object} nodes
   */

  /**
   * attachedCallback is part of the Webcomponent lifecycle and drives this framework's lifecycle.
   *
   * This calls `onAttach`.
   * @method
   * @private
   */
  classDef.attachedCallback = {
    value: function onAttach() {
      this.onAttach();
    }
  };

  /**
   * Initialize the properties object.
   *
   * This Fixes a bug in webcomponents polyfil that clobbers property getter/setter.
   *
   * The webcomponent polyfil copies in properties before the property getter/setter is applied to the object.
   * As a result, we might have a property of `this.appId` that is NOT accessed via `this.properties.appId`.
   * Further, the getter and setter functions will not invoke as long as this value is perceived as the definition
   * for this Object. So we delete the property `appId` from the object so that the getter/setter up the prototype chain can
   * once again function.
   *
   * @method _initializeProperties
   * @private
   * @param {Object} prop   A property def whose value should be stashed
   */
  classDef._initializeProperties = {
    value: function _initializeProperties() {
      var _this6 = this;

      /**
       * Values for all properties of this widget.
       *
       * All properties are stored in `this.properties`; any property defined in the class definition's `properties` hash
       * are read and written here.
       *
       * Properties may have already been setup by a UI Framework adapter for caching properties passed from the app; if properties
       * exists, they may still need to be setup.
       *
       * @property {Object} properties
       * @protected
       */
      if (this.properties && this.properties._internalState) return;
      if (!this.properties) this.properties = {};

      this.properties._internalState = {
        onCreateCalled: false,
        onAfterCreateCalled: false,
        onRenderCalled: false,
        onAttachCalled: false,
        onDetachCalled: false,
        disableSetters: true,
        disableGetters: true,
        inPropInit: []
      };

      // props.forEach((prop) => {
      //   const value = this[prop.propertyName];
      //   if (value !== undefined) {
      //     this.properties[prop.propertyName] = castProperty(prop.type, value);
      //     delete this[prop.propertyName];
      //   }
      //   this._copyInAttribute(prop);
      // });

      props.forEach(function (prop) {
        return _this6._copyInAttribute(prop);
      });
    }
  };

  /**
   * Handle some messy post-create copying of attribute values over to property
   * values where property setters can fire.
   *
   * @method _copyInAttribute
   * @private
   * @param {Object} prop   A property def object as defined by getPropArray
   */
  classDef._copyInAttribute = {
    value: function _copyInAttribute(prop) {

      var finalValue = null;
      var value = this.getAttribute(prop.attributeName);

      // Firefox seems to need this alternative to getAttribute().
      // TODO: Verify this and determine if it uses the getter here.
      if (value === null && this[prop.attributeName] !== undefined) {
        value = this[prop.attributeName];
      }

      if (value !== null) {
        finalValue = value;
      } else if (this[prop.propertyName] !== undefined) {
        // this only happens in firefox; somehow the property rather than the attribute is set, but
        // the setter is never called; so properties isn't correctly setup
        // TODO: Verify this -- also redundant with initialize properties
        finalValue = this[prop.propertyName];
        delete this[prop.propertyName];
      } else if ('value' in propertyDefHash[prop.propertyName]) {
        finalValue = propertyDefHash[prop.propertyName].value;

        // Don't treat a default value of [] as a static value shared among all instances
        if (Array.isArray(finalValue)) finalValue = finalValue.concat([]);
      }

      this.properties[prop.propertyName] = prop.type ? castProperty(prop.type, finalValue) : finalValue;
    }
  };

  /**
   * detachedCallback is part of the Webcomponent lifecycle and drives this framework's lifecycle.
   *
   * By default, removing this widget from the dom will cause it to be destroyed.
   *
   * Using the `layer-widget-destroyed` event, you may override this behavior using `evt.preventDefault()`:
   *
   * ```
   * document.body.addEventListener('layer-widget-destroyed', function(evt) {
   *    if (evt.target === nodeToNotDestroy) {
   *      evt.preventDefault();
   *    }
   * });
   * ```
   *
   * @event layer-widget-destroyed
   */
  classDef.detachedCallback = {
    value: function detachedCallback() {
      var _this7 = this;

      this.onDetach();

      // Wait 10 seconds after its been removed, then check to see if its still removed from the dom before doing cleanup and destroy.
      setTimeout(function () {
        if (!document.body.contains(_this7) && !document.head.contains(_this7) && _this7.trigger('layer-widget-destroyed')) {
          _this7.onDestroy();
        }
      }, 10000);
    }
  };

  /**
   * Any time a widget's attribute has changed, copy that change over to the properties where it can trigger the property setter.
   *
   * @method attributeChangedCallback
   * @private
   * @param {String} name      Attribute name
   * @param {Mixed} oldValue   Original value of the attribute
   * @param {Mixed} newValue   Newly assigned value of the attribute
   */
  classDef.attributeChangedCallback = {
    value: function attributeChangedCallback(name, oldValue, newValue) {
      if (_base2.default.debug) console.log('Attribute Change on ' + this.tagName + '.' + name + ' from ' + oldValue + ' to ', newValue);
      this[_base2.default.camelCase(name)] = newValue;
    }
  };

  // Register the component with our components hash as well as with the document.
  // WARNING: Calling this in some browsers may cause immediate registeration of the component prior
  // to reaching the next line of code; putting code after this line may be problematic.
  _base2.default.components[tagName].classDef = document.registerElement(tagName, {
    prototype: Object.create(HTMLElement.prototype, classDef)
  });

  /**
   * Identifies the properties exposed by this component.
   *
   * Used by adapters.  Each element of the array consists of:
   *
   * ```
   * {
   *    propertyName: 'onReadThisDoc',
   *    attributeName: 'on-read-this-doc',
   *    type: Boolean
   * }
   * ```
   *
   * @type {Object[]}
   * @static
   */
  _base2.default.components[tagName].properties = props;
};

/**
   * A `<template />` dom node
   *
   * These templates are used during Component initializations.
   *
   * @type {HTMLTemplateElement}
   * @private
   * @static
   */

/**
 * Stylesheet string.
 *
 * A stylesheet string can be added to the document via `styleNode.innerHTML = value` assignment.
 *
 * @type {String}
 * @private
 * @static
 */

/**
 * Mixin modes determines how a new method being added to a class will be executed with respect to any other methods.
 *
 * * BEFORE: Run your method before other methods of the same name
 * * AFTER: Run your method after other methods of the same name
 * * OVERWRITE: Run only your method, no other methods of the same name
 * * DEFAULT: Run your method in normal ordering.
 *
 * @static
 * @property {Object} MODES
 * @property {String} MODES.BEFORE
 * @property {String} MODES.AFTER
 * @property {String} MODES.OVERWRITE
 * @property {String} MODES.DEFAULT
 */
registerComponent.MODES = {
  BEFORE: 'BEFORE',
  AFTER: 'AFTER',
  OVERWRITE: 'OVERWRITE',
  DEFAULT: 'DEFAULT'
};

var standardClassProperties = {
  _layerEventSubscriptions: {
    value: []
  },
  parentComponent: {},
  mainComponent: {
    get: function get() {
      if (this.properties._isMainComponent) return this;
      if (!this.properties.mainComponent) {
        this.properties.mainComponent = this.properties.parentComponent.mainComponent;
      }
      return this.properties.mainComponent;
    }
  },
  client: {
    propagateToChildren: true
  },
  listenTo: {
    value: [],
    set: function set(value) {
      if (typeof value === 'string') this.properties.listenTo = value.split(/\s*,\s*/);
    }
  }
};

var standardClassMethods = {
  /**
   * The setupDomNodes method looks at all child nodes of this node that have layer-id properties and indexes them in the `nodes` property.
   *
   * Typically, this node has child nodes loaded via its template, and ready by the time your `created` method is called.
   *
   * This call is made on your behalf prior to calling `created`, but if using templates after `created` is called,
   * you may need to call this directly.
   *
   * @method setupDomNodes
   * @protected
   */
  setupDomNodes: function setupDomNodes() {
    var _this8 = this;

    this.nodes = {};

    this._findNodesWithin(this, function (node, isComponent) {
      var layerId = node.getAttribute && node.getAttribute('layer-id');
      if (layerId) _this8.nodes[layerId] = node;

      if (isComponent) {
        if (!node.properties) node.properties = {};
        node.properties.parentComponent = _this8;
      }
    });
  },

  /**
   * Iterate over all child nodes generated by the template; skip all subcomponent's child nodes.
   *
   * @method _findNodesWithin
   * @private
   * @param {HTMLElement} node    Node whose subtree should be called with the callback
   * @param {Function} callback   Function to call on each node in the tree
   * @param {HTMLElement} callback.node   Node that the callback is called on
   * @param {Boolean} isComponent         Is the node a Component from this framework
   */
  _findNodesWithin: function _findNodesWithin(node, callback) {
    var children = node.childNodes;
    for (var i = 0; i < children.length; i++) {
      var innerNode = children[i];

      var isLUIComponent = Boolean(innerNode instanceof HTMLElement && _base2.default.components[innerNode.tagName.toLowerCase()]);
      callback(innerNode, isLUIComponent);

      // If its not a custom webcomponent with children that it manages and owns, iterate on it
      if (!isLUIComponent) {
        this._findNodesWithin(innerNode, callback);
      }
    }
  },

  /**
   * Return the default template or the named template for this Component.
   *
   * Get the default template:
   *
   * ```
   * var template = widget.getTemplate();
   * ```
   *
   * Typical components should not need to call this; this will be called automatically prior to calling the Component's `created` method.
   * Some components wanting to reset dom to initial state may use this method explicitly:
   *
   * ```
   * var template = this.getTemplate();
   * var clone = document.importNode(template.content, true);
   * this.appendChild(clone);
   * this.setupDomNodes();
   * ```
   *
   * @method getTemplate
   * @protected
   * @returns {HTMLTemplateElement}
   */
  getTemplate: function getTemplate() {
    var tagName = this.tagName.toLocaleLowerCase();

    if (_base2.default.components[tagName].style) {
      var styleNode = document.createElement('style');
      styleNode.id = 'style-' + this.tagName.toLowerCase();
      styleNode.innerHTML = _base2.default.components[tagName].style;
      document.getElementsByTagName('head')[0].appendChild(styleNode);
      _base2.default.components[tagName].style = ''; // insure it doesn't get added to head a second time
    }
    return _base2.default.components[tagName].template;
  },

  /**
   * Triggers a dom level event which bubbles up the dom.
   *
   * Call with an event name and a `detail` object:
   *
   * ```
   * this.trigger('something-happened', {
   *   someSortOf: 'value'
   * });
   * ```
   *
   * The `someSortOf` key, and any other keys you pass into that object can be accessed via `evt.detail.someSortOf` or `evt.detail.xxxx`:
   *
   * ```
   * // Listen for the something-happened event which because it bubbles up the dom,
   * // can be listened for from any parent node
   * document.body.addEventListener('something-happened', function(evt) {
   *   console.log(evt.detail.someSortOf);
   * });
   * ```
   *
   * layerUI.components.Component.events can be used to generate properties to go with your events, allowing
   * the following widget property to be used:
   *
   * ```
   * this.onSomethingHappened = function(detail) {
   *   console.log(detail.someSortOf);
   * });
   * ```
   *
   * @method trigger
   * @protected
   * @param {String} eventName
   * @param {Object} detail
   * @returns {Boolean} True if process should continue with its actions, false if application has canceled
   *                    the default action using `evt.preventDefault()` (perhaps an event listener wanted to handle the action itself)
   */
  trigger: function trigger(eventName, details) {
    var evt = new CustomEvent(eventName, {
      detail: details,
      bubbles: true,
      cancelable: true
    });
    this.dispatchEvent(evt);
    return !evt.defaultPrevented;
  },

  /**
   * Return array of matching elements as an Array.
   *
   * This basically just calls this.querySelectorAll and then returns a proper Array rather than a NodeList.
   *
   * @method querySelectorAllArray
   * @protected
   * @param {String} XPath selector
   * @returns {HTMLElement[]}
   */
  querySelectorAllArray: function querySelectorAllArray(selector) {
    return Array.prototype.slice.call(this.querySelectorAll(selector));
  },

  /**
   * MIXIN HOOK: Each time a Component is initialized, its onCreate methods will be called.
   *
   * This is called before any properties have been set; use this for initialization that does not
   * depend upon properties, including creating dom nodes, event handlers and initial values for state variables.
   *
   * @method onCreate
   */
  onCreate: {
    mode: registerComponent.MODES.AFTER,
    value: function onCreate() {
      this.properties._internalState.onCreateCalled = true;
    }
  },

  /**
   * MIXIN HOOK: Each time a Component is initialized, its onAfterCreate methods will be called.
   *
   * While one could use layerUI.Components.Component.onCreate, this handler allows you to wait for all
   * properties to be set before your intialization code is run.
   *
   * @method onAfterCreate
   */
  onAfterCreate: {
    mode: registerComponent.MODES.AFTER,
    value: function onAfterCreate() {
      this.properties._internalState.onAfterCreateCalled = true;
      this.onRender();
      this.properties._internalState.onRenderCalled = true;
      if (this.properties._callOnAttachAfterCreate) {
        this.properties._callOnAttachAfterCreate = false;
        this.onAttach();
      }
    }
  },

  /**
   * MIXIN HOOK: Called when rendering the widget.
   *
   * @method onRender
   */
  onRender: {
    conditional: function onCanRender() {
      return this.properties._internalState.onAfterCreateCalled;
    }
  },

  /**
   * MIXIN HOOK: Called after any Query events cause the list
   * to have rerendered.
   *
   * @method onRerender
   */
  onRerender: {
    conditional: function onCanRerender() {
      return this.properties._internalState.onAfterCreateCalled;
    }
  },

  /**
   * MIXIN HOOK: Each time a Component is inserted into a Document, its onAttach methods will be called.
   *
   * Note that prior to this, `parentNode` might have been `null`; at this point,
   * you should be able to see all information about its parent nodes.  Some rendering
   * may need to wait for this.
   *
   * @method onAttach
   */
  onAttach: {
    conditional: function onAttachConditional() {
      if (!this.properties._internalState.onAfterCreateCalled) {
        this.properties._callOnAttachAfterCreate = true;
        return false;
      } else {
        return true;
      }
    },
    mode: registerComponent.MODES.AFTER,
    value: function onAttach() {
      this.properties._internalState.onAttachCalled = true;
    }
  },

  /**
   * MIXIN HOOK: Each time a Component is removed from document.body, its onDetach methods will be called.
   *
   * Note that the `layer-widget-destroyed` event will still trigger even if you provide this, so be aware of
   * what that event will do and that your widget may be destroyed a few seconds after this function is called.
   *
   * @method onDetach
   */
  onDetach: {
    mode: registerComponent.MODES.AFTER,
    value: function onDetach() {
      if (this.properties.mainComponent && !this.properties.mainComponent.contains(this)) {
        this.properties.mainComponent = null;
      }

      if (this.properties.parentComponent && !this.properties.parentComponent.contains(this)) {
        this.properties.parentComponent = null;
      }
      this.properties._internalState.onDetachCalled = true;
    }
  },

  /**
   * MIXIN HOOK: Add a `onDestroy` method to your component which will be called when your component has been removed fromt the DOM.
   *
   * Use this instead of the WebComponents `detachedCallback` as some
   * boilerplate code needs to be run (this code will shut off all event listeners the widget has setup).
   *
   * Your `onDestroy` callback will run after the node has been removed from the document
   * for at least 10 seconds.  See the `layer-widget-destroyed` event to prevent the widget from being destroyed after removing
   * it from the document.
   *
   * @method onDestroy
   * @private
   */
  onDestroy: function onDestroy() {
    var _this9 = this;

    this.properties._internalState.onDestroyCalled = true;
    this.properties._internalState.disableSetters = true;
    this.properties._layerEventSubscriptions.forEach(function (subscribedObject) {
      return subscribedObject.off(null, null, _this9);
    });
    this.properties._layerEventSubscriptions = [];
    this.classList.add('layer-node-destroyed');
  }
};

function registerMessageComponent(tagName, componentDefinition) {
  var handlesMessage = componentDefinition.methods.handlesMessage;
  var label = componentDefinition.properties.label.value;
  var order = componentDefinition.properties.order;
  registerComponent(tagName, componentDefinition);
  _base2.default.registerMessageHandler({
    handlesMessage: handlesMessage,
    tagName: tagName,
    label: label,
    order: order
  });
}

module.exports = {
  registerComponent: registerComponent,
  registerMessageComponent: registerMessageComponent,
  registerAll: registerAll,
  unregisterComponent: unregisterComponent
};
},{"../base":4,"../mixins/state-manager":54,"layer-websdk":66}],6:[function(require,module,exports){
/**
 * The Layer Channel Item widget renders a single Channel, typically for use representing a
 * channel within a list of channels.
 *
 * This is designed to go inside of the layerUI.components.ConversationsListPanel.List widget, and be a
 * concise enough summary that it can be scrolled through along
 * with hundreds of other Conversations Item widgets.
 *
 * Future Work:
 *
 * * Badges for unread messages (currently just adds a css class so styling can change if there are any unread messages)
 *
 * @class layerUI.components.ConversationsListPanel.Item.Channel
 * @experimental
 * @extends layerUI.components.Component
 */
'use strict';

var _component = require('../../../components/component');

var _listItem = require('../../../mixins/list-item');

var _listItem2 = _interopRequireDefault(_listItem);

var _listItemSelection = require('../../../mixins/list-item-selection');

var _listItemSelection2 = _interopRequireDefault(_listItemSelection);

require('../../subcomponents/layer-delete/layer-delete');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-channel-item', {
  mixins: [_listItem2.default, _listItemSelection2.default],
  properties: {

    // Every List Item has an item property, here it represents the Conversation to render
    item: {
      set: function set(newConversation, oldConversation) {
        if (newConversation) this.onRerender();
      }
    },

    /**
     * Enable deletion of this Conversation.
     *
     * This property is currently assumed to be settable at creation time only,
     * and does not rerender if changed.
     *
     * This property does nothing if you remove the `delete` node from the template.
     *
     * @property {Boolean} [deleteConversationEnabled=false]
     */
    deleteConversationEnabled: {
      type: Boolean,
      set: function set(value) {
        if (this.nodes.delete) this.nodes.delete.enabled = value;
      }
    }
  },
  methods: {
    onRender: function onRender() {
      this.onRerender();
    },
    onRerender: function onRerender() {
      if (this.item) this.nodes.title.innerHTML = this.item.name;
    },


    /**
     * Run a filter on this item; not match => hidden; match => shown.
     *
     * @method _runFilter
     * @param {String|Regex|Function} filter
     */
    _runFilter: function _runFilter(filter) {
      var channel = this.properties.item;
      var match = void 0;
      if (!filter) {
        match = true;
      } else if (typeof filter === 'function') {
        match = filter(channel);
      } else if (filter instanceof RegExp) {
        match = filter.test(channel.name);
      } else {
        filter = filter.toLowerCase();
        match = channel.name.toLowerCase().indexOf(filter) !== -1;
      }
      this.classList[match ? 'remove' : 'add']('layer-item-filtered');
    }
  }
});

(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-channel-item", "<div class='layer-list-item' layer-id='innerNode'><div class='layer-channel-item-content'><div layer-id='title' class='layer-channel-title'></div></div><layer-delete layer-id='delete'></layer-delete></div>", "");
  layerUI.buildStyle("layer-channel-item", "layer-channel-item {\ndisplay: flex;\nflex-direction: column;\n}\nlayer-channel-item .layer-list-item {\ndisplay: flex;\nflex-direction: row;\nalign-items: center;\n}\nlayer-channel-item  .layer-list-item .layer-channel-item-content {\nflex-grow: 1;\nwidth: 100px; \n}\nlayer-channel-item.layer-item-filtered .layer-list-item {\ndisplay: none;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5,"../../../mixins/list-item":47,"../../../mixins/list-item-selection":46,"../../subcomponents/layer-delete/layer-delete":25}],7:[function(require,module,exports){
/**
 * The Layer Conversation Item widget renders a single Conversation, typically for use representing a
 * conversation within a list of conversations.
 *
 * This is designed to go inside of the layerUI.components.ConversationsListPanel.List widget, and be a
 * concise enough summary that it can be scrolled through along
 * with hundreds of other Conversations Item widgets.
 *
 * Future Work:
 *
 * * Badges for unread messages (currently just adds a css class so styling can change if there are any unread messages)
 *
 * @class layerUI.components.ConversationsListPanel.Item.Conversation
 * @extends layerUI.components.Component
 */
'use strict';

var _component = require('../../../components/component');

var _listItem = require('../../../mixins/list-item');

var _listItem2 = _interopRequireDefault(_listItem);

var _listItemSelection = require('../../../mixins/list-item-selection');

var _listItemSelection2 = _interopRequireDefault(_listItemSelection);

require('../../subcomponents/layer-conversation-last-message/layer-conversation-last-message');

require('../../subcomponents/layer-delete/layer-delete');

require('../../subcomponents/layer-avatar/layer-avatar');

require('../../subcomponents/layer-conversation-title/layer-conversation-title');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-conversation-item', {
  mixins: [_listItem2.default, _listItemSelection2.default],
  properties: {

    // Every List Item has an item property, here it represents the Conversation to render
    item: {
      set: function set(newConversation, oldConversation) {
        if (this.nodes.lastMessage) {
          this.nodes.lastMessage.canFullyRenderLastMessage = this.canFullyRenderLastMessage;
        }
      }
    },

    /**
     * Enable deletion of this Conversation.
     *
     * This property is currently assumed to be settable at creation time only,
     * and does not rerender if changed.
     *
     * This property does nothing if you remove the `delete` node from the template.
     *
     * @property {Boolean} [deleteConversationEnabled=false]
     */
    deleteConversationEnabled: {
      type: Boolean,
      set: function set(value) {
        if (this.nodes.delete) this.nodes.delete.enabled = value;
      }
    },

    /**
     * Provide a function to determine if the last message is rendered in the Conversation List.
     *
     * By default, only text/plain last-messages are fully rendered in the Conversation List.
     *
     * All other messages are rendered using the `label` passed in with their layerUI.registerMessageHandler call.
     *
     * ```javascript
     * listItem.canFullyRenderLastMessage = function(message) {
     *     return true; // Render the current Messages
     * }
     * ```
     *
     * @property {Function} [canFullyRenderLastMessage=null]
     */
    canFullyRenderLastMessage: {}
  },
  methods: {
    onRender: function onRender() {
      this.onRerender();
    },
    onRerender: function onRerender() {
      var users = this.item.participants.filter(function (user) {
        return !user.sessionOwner;
      });
      var isRead = !this.item.lastMessage || this.item.lastMessage.isRead;

      this.nodes.avatar.users = users;
      this.classList[isRead ? 'remove' : 'add']('layer-conversation-unread-messages');
    },


    /**
     * Run a filter on this item; not match => hidden; match => shown.
     *
     * @method _runFilter
     * @param {String|Regex|Function} filter
     */
    _runFilter: function _runFilter(filter) {
      var conversation = this.properties.item;
      var match = void 0;
      if (!filter) {
        match = true;
      } else if (typeof filter === 'function') {
        match = filter(conversation);
      } else {
        var values = [];
        if (conversation.metadata.conversationName) values.push(conversation.metadata.conversationName);
        conversation.participants.forEach(function (identity) {
          values.push(identity.displayName);
          values.push(identity.firstName);
          values.push(identity.lastName);
          values.push(identity.emailAddress);
        });
        if (filter instanceof RegExp) {
          match = values.filter(function (value) {
            return filter.test(value);
          }).length;
        } else {
          filter = filter.toLowerCase();
          match = values.filter(function (value) {
            if (value) {
              return value.toLowerCase().indexOf(filter) !== -1;
            } else {
              return false;
            }
          }).length;
        }
      }
      this.classList[match ? 'remove' : 'add']('layer-item-filtered');
    }
  }
});


(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-conversation-item", "<div class='layer-list-item' layer-id='innerNode'><layer-avatar layer-id='avatar'></layer-avatar><div class='layer-conversation-item-content'><layer-conversation-title layer-id='title'></layer-conversation-title><layer-conversation-last-message layer-id='lastMessage'></layer-conversation-last-message></div><layer-delete layer-id='delete'></layer-delete></div>", "");
  layerUI.buildStyle("layer-conversation-item", "layer-conversation-item {\ndisplay: flex;\nflex-direction: column;\n}\nlayer-conversation-item .layer-list-item {\ndisplay: flex;\nflex-direction: row;\nalign-items: center;\n}\nlayer-conversation-item .layer-list-item layer-avatar {\nmargin-right: 15px;\n}\nlayer-conversation-item  .layer-list-item .layer-conversation-item-content {\nflex-grow: 1;\nwidth: 100px; \n}\nlayer-conversation-item.layer-item-filtered .layer-list-item {\ndisplay: none;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5,"../../../mixins/list-item":47,"../../../mixins/list-item-selection":46,"../../subcomponents/layer-avatar/layer-avatar":19,"../../subcomponents/layer-conversation-last-message/layer-conversation-last-message":22,"../../subcomponents/layer-conversation-title/layer-conversation-title":23,"../../subcomponents/layer-delete/layer-delete":25}],8:[function(require,module,exports){
/**
 * The Layer Conversation List widget renders a scrollable, pagable list of Conversations.
 *
 * This Component can be added to your project directly in the HTML file:
 *
 * ```
 * <layer-conversations-list></layer-conversations-list>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var conversation = document.createElement('layer-conversations-list');
 * ```
 *
 * And then its properties can be set as:
 *
 * ```javascript
 * var list = document.querySelector('layer-conversations-list');
 * list.onConversationSelected = function(evt) {
 *    alert(evt.detail.item.id + ' has been selected');
 * }
 * ```
 *
 * ## Common Properties
 *
 * The most common property of this widget is layerUI.components.ConversationsListPanel.onConversationSelected, as typical use
 * of this widget is to prompt the user to select a Conversation, and use that selection elsewhere.
 *
 * Note that you can also listen for `layer-conversation-selected` to achieve the same result:
 *
 * ```
 * document.body.addEventListener('layer-conversation-selected', function(evt) {
 *    alert(evt.detail.item.id + ' has been selected');
 * });
 * ```
 *
 * You may also sometimes want to set which Conversation to mark as selected:
 *
 * ```javascript
 * conversationList.selectedConversationId = myConversation.id;
 * ```
 *
 * @class layerUI.components.ConversationsListPanel.List
 * @extends layerUI.components.Component
 * @mixin layerUI.mixins.List
 * @mixin layerUI.mixins.MainComponent
 * @mixin layerUI.mixins.ListSelection
 * @mixin layerUI.mixins.ListLoadIndicator
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

var _component = require('../../../components/component');

var _list = require('../../../mixins/list');

var _list2 = _interopRequireDefault(_list);

var _listLoadIndicator = require('../../../mixins/list-load-indicator');

var _listLoadIndicator2 = _interopRequireDefault(_listLoadIndicator);

var _listSelection = require('../../../mixins/list-selection');

var _listSelection2 = _interopRequireDefault(_listSelection);

var _mainComponent = require('../../../mixins/main-component');

var _mainComponent2 = _interopRequireDefault(_mainComponent);

require('../layer-conversation-item/layer-conversation-item');

require('../layer-channel-item/layer-channel-item');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-conversations-list', {
  mixins: [_list2.default, _listSelection2.default, _mainComponent2.default, _listLoadIndicator2.default],

  /**
   * Configure a custom action when a Conversation is selected;
   *
   * Use `evt.preventDefault()` to prevent default handling from occuring.
   *
   * ```javascript
   *    document.body.addEventListener('layer-conversation-selected', function(evt) {
   *      var conversation = evt.detail.item;
   *
   *      // To prevent the UI from proceding to select this conversation:
   *      evt.preventDefault();
   *    });
   * ```
   *
   * OR
   *
   * ```javascript
   *    converationList.onConversationSelected = function(evt) {
   *      var conversation = evt.detail.item;
   *
   *      // To prevent the UI from proceding to select this conversation:
   *      evt.preventDefault();
   *    });
   * ```
   *
   * @property {Function} onConversationSelected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Conversation} evt.detail.item   The selected Conversation
   * @param {Event} evt.detail.originalEvent               The click event that selected the Conversation
   */

  /**
   * See layerUI.components.ConversationsListPanel.onConversationSelected.
   *
   * @event layer-conversation-selected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Conversation} evt.detail.item   The selected Conversation
   * @param {Event} evt.detail.originalEvent               The click event that selected the Conversation
   */

  /**
   * The user has clicked to delete a conversation.
   *
   * ```javascript
   *    conversationListNode.onConversationDeleted = function(evt) {
   *      var conversation = evt.detail.item;
   *
   *      // To prevent the UI from proceding to delete this conversation (perhaps you want
   *      // to leave the Conversation instead of delete it):
   *      evt.preventDefault();
   *      conversation.leave();
   *    };
   * ```
   *
   *  OR
   *
   * ```javascript
   *    document.body.addEventListener('layer-conversation-deleted', function(evt) {
   *      var conversation = evt.detail.item;
   *
   *      // To prevent the UI from proceding to delete this conversation (perhaps you want
   *      // to leave the Conversation instead of delete it):
   *      evt.preventDefault();
   *      conversation.leave();
   *    });
   * ```
   *
   * @property {Function} onConversationDeleted
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Conversation} evt.detail.item
   */

  /**
   * See layerUI.components.ConversationsListPanel.List.onConversationDeleted.
   *
   * @event layer-conversation-deleted
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Conversation} evt.detail.item
   */

  events: ['layer-conversation-selected', 'layer-conversation-deleted'],
  properties: {

    /**
     * Get/Set the selected Conversation by ID.
     *
     * ```javascript
     * conversationList.selectedConversationId = myConversation.id;
     * ```
     *
     * Or if using a templating engine:
     *
     * ```html
     * <layer-conversations-list selected-conversation-id={{selectedConversation.id}}></layer-conversations-list>
     * ```
     *
     * The above code will set the selected Conversation and render the conversation as selected.
     *
     * @property {String} [selectedConversationId='']
     * @deprecated see layerUI.components.ConversationsListPanel.ListSelection.selectedId
     */
    selectedConversationId: {
      set: function set(value) {
        this.selectedId = value;
      },
      get: function get() {
        return this.selectedId;
      }
    },

    /**
     * Function allows for control over which Conversations can be deleted and which can not.
     *
     * Return true means enabled, false is disabled.
     *
     *  ```javascript
     * conversationPanel.deleteConversationEnabled = function(conversation) {
     *     return conversation.metadata.category !== 'adminStuff';
     * });
     * ```
     *
     * If delete is enabled, the layerUI.components.misc.Delete.enabled property is changed, causing
     * the `layer-delete-enabled` css class to be added/removed on that widget.
     *
     * @property {Function} [deleteConversationEnabled=null]
     * @property {Layer.Core.Conversation} deleteConversationEnabled.conversation
     * @property {Boolean} deleteConversationEnabled.return
     */
    deleteConversationEnabled: {
      type: Function
    },

    /**
     * The model to generate a Query for if a Query is not provided.
     *
     * @readonly
     * @private
     * @property {String} [_queryModel=layer.Query.Conversation]
     */
    _queryModel: {
      value: _layerWebsdk2.default.Query.Conversation
    },

    /**
     * Sort by takes as value `lastMessage` or `createdAt`; for initialization only.
     *
     * This will not resort your list after initialization; use `list.query.update()` for that.
     *
     * @property {String} [sortBy=lastMessage]
     */
    sortBy: {
      order: -1, // needs to fire before appId and client are set
      value: 'lastMessage',
      set: function set(value) {
        switch (value) {
          case 'lastMessage':
            this.properties.sortBy = [{ 'lastMessage.sentAt': 'desc' }];
            break;
          default:
            this.properties.sortBy = [{ 'createdAt': 'desc' }];
        }
      }
    },

    /**
     * The event name to trigger on selecting a Conversation.
     *
     * @readonly
     * @private
     * @property {String} [_selectedItemEventName=layer-conversation-selected]
     */
    _selectedItemEventName: {
      value: 'layer-conversation-selected'
    },

    /**
     * Provide a function to determine if the last message is rendered in the Conversation List.
     *
     * By default, only text/plain last-messages are rendered in the Conversation List.
     *
     * ```javascript
     * list.canFullyRenderLastMessage = function(message) {
     *     return message.parts[0].mimeType === 'text/mountain' ||
     *            message.parts[0].mimeType === 'text/plain';
     * }
     * ```
     *
     * If you enable rendering of images for example, you would be enabling the handler that renders image messages
     * in the Message List to render that same image in the Conversation List.
     *
     * If you prevent rendering of a Message, it will instead render the `label` attribute for that message handler;
     * see layerUI.registerMessageHandler for more info on the `label`.
     *
     * TODO: Should test to see what handler is returned rather than testing the mimeType
     *
     * @property {Function} canFullyRenderLastMessage
     */
    canFullyRenderLastMessage: {
      type: Function,
      value: function value(message) {
        return message.parts[0].mimeType === 'text/plain';
      }
    }
  },
  methods: {
    /**
     * Generate a `layer-conversation-item` widget.
     *
     * @method _generateItem
     * @private
     * @param {Layer.Core.Conversation} conversation
     */
    _generateItem: function _generateItem(conversation) {
      var isChannel = conversation instanceof _layerWebsdk2.default.Channel;
      var conversationWidget = document.createElement('layer-' + (isChannel ? 'channel' : 'conversation') + '-item');
      conversationWidget.id = this._getItemId(conversation.id);
      conversationWidget.deleteConversationEnabled = typeof this.deleteConversationEnabled === 'function' ? this.deleteConversationEnabled(conversation) : true;
      conversationWidget.canFullyRenderLastMessage = this.canFullyRenderLastMessage;
      conversationWidget.item = conversation;
      if (this.filter) conversationWidget._runFilter(this.filter);
      return conversationWidget;
    }
  },
  listeners: {
    'layer-notification-click': function notificationClick(evt) {
      var message = evt.detail.item;
      var conversation = message.getConversation();
      if (conversation) this.selectedId = conversation.id;
    }
  }
});

(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-conversations-list", "<div class='layer-load-indicator' layer-id='loadIndicator'>Loading conversations...</div>", "");
  layerUI.buildStyle("layer-conversations-list", "layer-conversations-list {\noverflow-y: auto;\ndisplay: block;\n}\nlayer-conversations-list .layer-load-indicator {\ntext-align: center;\nborder-top: solid 1px #ccc;\nfont-style: italic;\ndisplay: none;\n}\nlayer-conversations-list.layer-loading-data .layer-load-indicator {\ndisplay: block;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5,"../../../mixins/list":50,"../../../mixins/list-load-indicator":48,"../../../mixins/list-selection":49,"../../../mixins/main-component":51,"../layer-channel-item/layer-channel-item":6,"../layer-conversation-item/layer-conversation-item":7,"layer-websdk":66}],9:[function(require,module,exports){
/**
 * The Layer User List renders a pagable list of layer.Identity objects, and allows the user to select people to talk with.
 *
 * This is typically used for creating/updating Conversation participant lists.
 *
 * This Component can be added to your project directly in the HTML file:
 *
 * ```
 * <layer-identities-list></layer-identities-list>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var identitylist = document.createElement('layer-identities-list');
 * ```
 *
 * And then its properties can be set as:
 *
 * ```javascript
 * var identityList = document.querySelector('layer-identities-list');
 * identityList.selectedIdentities = [identity3, identity6];
 * identityList.onIdentitySelected = identityList.onIdentityDeselected = function(evt) {
 *    log("The new selected users are: ", identityList.selectedIdentities);
 * }
 * ```
 *
 * ## Events
 *
 * Events listed here come from either this component, or its subcomponents.
 *
 * * {@link layerUI.components.IdentitiesListPanel.List#layer-identity-deselected layer-identity-deselected}: User has clicked to unselect an Identity
 * * {@link layerUI.components.IdentitiesListPanel.List#layer-identity-selected layer-identity-selected}: User has clicked to select an Identity
 *
 * @class layerUI.components.IdentitiesListPanel.List
 * @extends layerUI.components.Component
 * @mixin layerUI.mixins.List
 * @mixin layerUI.mixins.MainComponent
 * @mixin layerUI.mixins.ListLoadIndicator
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

var _component = require('../../../components/component');

var _list = require('../../../mixins/list');

var _list2 = _interopRequireDefault(_list);

var _mainComponent = require('../../../mixins/main-component');

var _mainComponent2 = _interopRequireDefault(_mainComponent);

var _hasQuery = require('../../../mixins/has-query');

var _hasQuery2 = _interopRequireDefault(_hasQuery);

var _listLoadIndicator = require('../../../mixins/list-load-indicator');

var _listLoadIndicator2 = _interopRequireDefault(_listLoadIndicator);

require('../layer-identity-item/layer-identity-item');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-identities-list', {
  mixins: [_list2.default, _mainComponent2.default, _hasQuery2.default, _listLoadIndicator2.default],

  /**
   * The user has clicked to select an Identity in the Identities List.
   *
   * ```javascript
   *    identityList.onIdentitySelected = function(evt) {
   *      var identityAdded = evt.detail.item;
   *      var selectedIdentities = evt.target.selectedIdentities;
   *
   *      // To prevent the UI from proceding to add the identity to the selectedIdentities:
   *      // Note that identityAdded is not yet in selectedIdentities so that you may prevent it from being added.
   *      evt.preventDefault();
   *    };
   * ```
   *
   *  OR
   *
   * ```javascript
   *    document.body.addEventListener('layer-identity-selected', function(evt) {
   *      var identityAdded = evt.detail.item;
   *      var selectedIdentities = evt.target.selectedIdentities;
   *
   *      // To prevent the UI from proceding to add the identity to the selectedIdentities:
   *      // Note that identityAdded is not yet in selectedIdentities so that you may prevent it from being added.
   *      evt.preventDefault();
   *    });
   * ```
   *
   * @event layer-identity-selected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Identity} evt.detail.item
   */
  /**
   * A identity selection change has occurred
   *
   * See the {@link layerUI.components.IdentitiesListPanel.List#layer-identity-selected layer-identity-selected} event for more detail.
   *
   * @property {Function} onIdentitySelected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Identity} evt.detail.item
   */

  /**
   * The user has clicked to deselect a identity in the identities list.
   *
   *    identityList.onIdentityDeselected = function(evt) {
   *      var identityRemoved = evt.detail.item;
   *      var selectedIdentities = evt.target.selectedIdentities;
   *
   *      // To prevent the UI from proceding to add the identity to the selectedIdentities:
   *      // Note that identityRemoved is still in selectedIdentities so that you may prevent it from being removed.
   *      evt.preventDefault();
   *    };
   *
   *  OR
   *
   *    document.body.addEventListener('layer-identity-deselected', function(evt) {
   *      var identityRemoved = evt.detail.item;
   *      var selectedIdentities = evt.target.selectedIdentities;
   *
   *      // To prevent the UI from proceding to add the identity to the selectedIdentities:
   *      // Note that identityRemoved is still in selectedIdentities so that you may prevent it from being removed.
   *      evt.preventDefault();
   *    });
   *
   * @event layer-identity-deselected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Identity} evt.detail.item
   */
  /**
   * A identity selection change has occurred
   *
   * See the {@link layerUI.components.IdentitiesListPanel.List#layer-identity-deselected layer-identity-deselected} event for more detail.
   *
   * @property {Function} onIdentityDeselected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Identity} evt.detail.item
   */

  events: ['layer-identity-selected', 'layer-identity-deselected'],
  properties: {

    /**
     * Array of layer.Identity objects representing the identities who should be rendered as Selected.
     *
     * This property can be used both get and set the selected identities; however, if setting you should not be manipulating
     * the existing array, but rather setting a new array:
     *
     * Do NOT do this:
     *
     * ```javascript
     * list.selectedIdentities.push(identity1); // DO NOT DO THIS
     * ```
     *
     * Instead, Please do this:
     *
     * ```javascript
     * var newList = list.selectedIdentities.concat([]);
     * newList.push(identity1);
     * list.selectedIdentities = newList;
     * ```
     *
     * You can clear the list with
     *
     * ```javascript
     * list.selectedIdentities = [];
     * ```
     *
     * @property {layer.Identity[]} [selectedIdentities=[]]
     */
    selectedIdentities: {
      set: function set(value) {
        var _this = this;

        if (!value) value = [];
        if (!Array.isArray(value)) return;
        if (!value) value = [];
        this.properties.selectedIdentities = value.map(function (identity) {
          if (!(identity instanceof _layerWebsdk2.default.Identity)) return _this.properties.client.getIdentity(identity.id);
          return identity;
        });
        this._renderSelection();
      }
    },

    /**
     * The model to generate a Query for if a Query is not provided.
     *
     * @readonly
     * @private
     * @property {String} [_queryModel=layer.Query.Identity]
     */
    _queryModel: {
      value: _layerWebsdk2.default.Query.Identity
    }
  },
  methods: {

    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate: function onCreate() {
      if (!this.id) this.id = _layerWebsdk2.default.Util.generateUUID();
      this.properties.selectedIdentities = [];

      this.addEventListener('layer-identity-item-selected', this._handleIdentitySelect.bind(this));
      this.addEventListener('layer-identity-item-deselected', this._handleIdentityDeselect.bind(this));
    },


    /**
     * Handle a user Selection event triggered by a layerUI.components.IdentitiesListPanel.Item.
     *
     * Adds the Identity to the selectedIdentities array.
     *
     * @method _handleIdentitySelect
     * @private
     * @param {Event} evt
     */
    _handleIdentitySelect: function _handleIdentitySelect(evt) {
      evt.stopPropagation();
      var identity = evt.detail.item;
      var index = this.selectedIdentities.indexOf(identity);

      // If the item is not in our selectedIdentities array, add it
      if (index === -1) {
        // If app calls prevent default, then don't add the identity to our selectedIdentities list, just call preventDefault on the original event.
        if (this.trigger('layer-identity-selected', { item: identity })) {
          this.selectedIdentities.push(identity);
        } else {
          evt.preventDefault();
        }
      }
    },


    /**
     * Handle a user Deselection event triggered by a layerUI.components.IdentitiesListPanel.Item
     *
     * Removes the identity from the selectedIdentities array.
     *
     * @method _handleIdentityDeselect
     * @private
     * @param {Event} evt
     */
    _handleIdentityDeselect: function _handleIdentityDeselect(evt) {
      evt.stopPropagation();
      var identity = evt.detail.item;
      var index = this.selectedIdentities.indexOf(identity);

      // If the item is in our selectedIdentities array, remove it
      if (index !== -1) {
        // If app calls prevent default, then don't remove the identity, just call preventDefault on the original event.
        if (this.trigger('layer-identity-deselected', { item: identity })) {
          this.selectedIdentities.splice(index, 1);
        } else {
          evt.preventDefault();
        }
      }
    },


    /**
     * Append a layerUI.components.IdentitiesListPanel.Item to the Document Fragment
     *
     * @method _generateItem
     * @param {layer.Identity} identity
     * @private
     */
    _generateItem: function _generateItem(identity) {
      var identityWidget = document.createElement('layer-identity-item');
      identityWidget.item = identity;
      identityWidget.id = this._getItemId(identity.id);
      identityWidget.selected = this.selectedIdentities.indexOf(identity) !== -1;
      identityWidget._runFilter(this.filter);
      return identityWidget;
    },


    /**
     * Call this on any Query change events.
     *
     * This updates the selectedIdentities after doing standard query update
     *
     * @method onRerender
     * @private
     * @param {Event} evt
     */
    onRerender: function onRerender() {
      var evt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      switch (evt.type) {
        // If its a remove event, find the user and remove its widget.
        case 'remove':
          {
            var removalIndex = this.selectedIdentities.indexOf(evt.target);
            if (removalIndex !== -1) this.selectedIdentities.splice(removalIndex, 1);
            break;
          }

        // If its a reset event, all data is gone, rerender everything.
        case 'reset':
          this.selectedIdentities = [];
          break;
      }
    },


    /**
     * Update the selected property of all Identity Items based on the selectedIdentities property.
     *
     * @method _renderSelection
     * @private
     */
    _renderSelection: function _renderSelection() {
      var _this2 = this;

      var selectedNodes = this.querySelectorAllArray('.layer-identity-item-selected').map(function (node) {
        return node.parentNode;
      });
      var selectedIds = this.selectedIdentities.map(function (identity) {
        return '#' + _this2._getItemId(identity.id);
      });
      var nodesToSelect = this.selectedIdentities.length ? this.querySelectorAllArray(selectedIds.join(', ')) : [];
      selectedNodes.forEach(function (node) {
        if (nodesToSelect.indexOf(node) === -1) node.selected = false;
      });
      nodesToSelect.forEach(function (node) {
        if (selectedNodes.indexOf(node) === -1) node.selected = true;
      });
    }
  }
});


(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-identities-list", "<div class='layer-load-indicator' layer-id='loadIndicator'>Loading users...</div>", "");
  layerUI.buildStyle("layer-identities-list", "layer-identities-list {\noverflow-y: auto;\ndisplay: block;\n}\nlayer-identities-list .layer-load-indicator {\ntext-align: center;\nborder-top: solid 1px #ccc;\nfont-style: italic;\ndisplay: none;\n}\nlayer-identities-list.layer-loading-data .layer-load-indicator {\ndisplay: block;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5,"../../../mixins/has-query":45,"../../../mixins/list":50,"../../../mixins/list-load-indicator":48,"../../../mixins/main-component":51,"../layer-identity-item/layer-identity-item":10,"layer-websdk":66}],10:[function(require,module,exports){
/**
 * The Layer User Item represents a single user within a User List.
 *
 * This widget could be used to represent a User elsewhere, in places where a `<layer-avatar />` is insufficient.
 *
 * This widget includes a checkbox for selection.
 *
 * @class layerUI.components.IdentitiesListPanel.Item
 * @mixin layerUI.mixins.ListItem
 * @extends layerUI.components.Component
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

var _component = require('../../../components/component');

var _listItem = require('../../../mixins/list-item');

var _listItem2 = _interopRequireDefault(_listItem);

require('../../subcomponents/layer-avatar/layer-avatar');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-identity-item', {
  mixins: [_listItem2.default],
  properties: {

    /**
     * Is this user item currently selected?
     *
     * Setting this to true will set the checkbox to checked, and add a
     * `layer-identity-item-selected` css class.
     *
     * @property {Boolean} [selected=false]
     */
    selected: {
      type: Boolean,
      noGetterFromSetter: true,
      set: function set(value) {
        if (this.nodes.checkbox) this.nodes.checkbox.checked = value;
        this.innerNode.classList[value ? 'add' : 'remove']('layer-identity-item-selected');
      },
      get: function get() {
        return this.nodes.checkbox ? this.nodes.checkbox.checked : Boolean(this.properties.selected);
      }
    }
  },
  methods: {
    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate: function onCreate() {
      if (!this.id) this.id = _layerWebsdk2.default.Util.generateUUID();
      this.nodes.checkbox.addEventListener('click', this.onClick.bind(this));
      this.nodes.checkbox.id = this.id + '-checkbox';
      this.nodes.title.setAttribute('for', this.nodes.checkbox.id);
    },


    /**
     * If the checkbox state changes, make sure that the class is updated.
     *
     * If the custom event is canceled, roll back the change.
     *
     * @method onClick
     * @param {Event} evt
     * @private
     */
    onClick: function onClick(evt) {
      evt.stopPropagation();
      var checked = this.selected;
      var identity = this.item;

      // Trigger the event and see if evt.preventDefault() was called
      var customEventResult = this.trigger('layer-identity-item-' + (checked ? 'selected' : 'deselected'), { item: identity });

      if (customEventResult) {
        this.selected = !this.properties.selected;
      } else {
        evt.preventDefault();
      }
      this.onSelection(evt);
    },


    /**
     * MIXIN HOOK: Each time a an item's selection state changes, this will be called.
     *
     * @method onSelection
     */
    onSelection: function onSelection(evt) {
      // No-op
    },


    /**
     * Render/rerender the user, showing the avatar and user's name.
     *
     * @method _render
     * @private
     */
    onRender: function onRender() {
      this.onRerender();
    },


    /**
     * Update the rendering of the avatar/username
     *
     * @method _render
     * @private
     */
    onRerender: function onRerender() {
      this.nodes.avatar.users = [this.item];
      this.nodes.title.innerHTML = this.item.displayName;
      this.toggleClass('layer-identity-item-empty', !this.item.displayName);
    },


    /**
     * Run a filter on this item, and hide it if it doesn't match the filter.
     *
     * @method _runFilter
     * @param {String|Regex|Function} filter
     */
    _runFilter: function _runFilter(filter) {
      var identity = this.properties.item;
      var match = false;
      if (!filter) {
        match = true;
      } else if (filter instanceof RegExp) {
        match = filter.test(identity.displayName) || filter.test(identity.firstName) || filter.test(identity.lastName) || filter.test(identity.emailAddress);
      } else if (typeof filter === 'function') {
        match = filter(identity);
      } else {
        filter = filter.toLowerCase();
        match = identity.displayName.toLowerCase().indexOf(filter) !== -1 || identity.firstName.toLowerCase().indexOf(filter) !== -1 || identity.lastName.toLowerCase().indexOf(filter) !== -1 || identity.emailAddress.toLowerCase().indexOf(filter) !== -1;
      }
      this.classList[match ? 'remove' : 'add']('layer-item-filtered');
    }
  }
});

(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-identity-item", "<div class='layer-list-item'><layer-avatar layer-id='avatar'></layer-avatar><label class='layer-identity-name' layer-id='title'></label><input type='checkbox' layer-id='checkbox'></input></div>", "");
  layerUI.buildStyle("layer-identity-item", "layer-identity-item {\ndisplay: flex;\nflex-direction: column;\n}\nlayer-identity-item .layer-list-item {\ndisplay: flex;\nflex-direction: row;\nalign-items: center;\n}\nlayer-identity-item .layer-list-item layer-avatar {\nmargin-right: 20px;\n}\nlayer-identity-item .layer-list-item label {\nflex-grow: 1;\nwidth: 100px; \n}\nlayer-identity-item.layer-item-filtered .layer-list-item {\ndisplay: none;\n}\nlayer-identity-item.layer-identity-item-empty {\ndisplay: none;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5,"../../../mixins/list-item":47,"../../subcomponents/layer-avatar/layer-avatar":19,"layer-websdk":66}],11:[function(require,module,exports){
/**
 * The Layer Conversation Panel includes a Message List, Typing Indicator Panel, and a Compose bar.
 *
 * Note that its up to the developer to tell this panel what its showing by setting the `conversationId` property.
 * This property affects what messages are rendered, what typing indicators are sent and rendered, and what Conversations messages are
 * sent to when your user types into the compose bar.
 *
 * Changing the `conversationId` is as simple as:
 *
 * ```javascript
 *  function selectConversation(conversation) {
 *    conversationPanel.conversationId = conversation.id;
 *  }
 * ```
 *
 * or if using a templating engine, something like this would also work for setting the `conversationId`:
 *
 * ```
 * <layer-conversation-panel conversation-id={selectedConversationId}></layer-conversation-panel>
 * ```
 *
 * This Component can be added to your project directly in the HTML file:
 *
 * ```
 * <layer-conversation-panel></layer-conversation-panel>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var conversation = document.createElement('layer-conversation-panel');
 * ```
 *
 * ## Key Properties
 *
 * * layerUI.components.ConversationPanel.conversationId (attribute-name: `conversation-id`): Set what conversation is being viewed
 * * layerUI.components.ConversationPanel.queryId (attribute-name: `query-id`): If your app already has a layer.Query, you can provide it to this widget to render and page through its Messages.  If you don't have a layer.Query instance, this widget will generate one for you.
 *
 * NOTE: If you provide your own Query, you must update its predicate when changing Conversations.
 *
 * ## Events
 *
 * Events listed here come from either this component, or its subcomponents.
 *
 * * {@link layerUI.components.subcomponents.Composer#layer-send-message layer-send-message}: User has requested their Message be sent
 * * {@link layerUI.components.subcomponents.Delete#layer-message-deleted layer-message-deleted}: User has requested a Message be deleted
 * * {@link layerUI.components.subcomponents.TypingIndicator#layer-typing-indicator-change layer-typing-indicator-change}: Someone in the Conversation has started/stopped typing
 *
 * @class layerUI.components.ConversationPanel
 * @extends layerUI.components.Component
 * @mixin layerUI.mixins.MainComponent
 * @mixin layerUI.mixins.HasQuery
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

var _component = require('../../components/component');

var _mainComponent = require('../../mixins/main-component');

var _mainComponent2 = _interopRequireDefault(_mainComponent);

var _hasQuery = require('../../mixins/has-query');

var _hasQuery2 = _interopRequireDefault(_hasQuery);

var _focusOnKeydown = require('../../mixins/focus-on-keydown');

var _focusOnKeydown2 = _interopRequireDefault(_focusOnKeydown);

require('../messages-list-panel/layer-messages-list/layer-messages-list');

require('../subcomponents/layer-composer/layer-composer');

require('../subcomponents/layer-typing-indicator/layer-typing-indicator');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-conversation-panel', {
  mixins: [_mainComponent2.default, _hasQuery2.default, _focusOnKeydown2.default],

  /**
   * This event is triggered before any Message is sent.
   *
   * You can use this event to provide your own logic for sending the Message.
   *
   * ```javascript
   * conversationPanel.onSendMessage = function(evt) {
   *   evt.preventDefault();
   *   var message = evt.detail.item;
   *   myAsyncLookup(function(result) {
   *     var part = new Layer.Core.MessagePart({
   *       mimeType: 'application/json',
   *       body: result
   *     });
   *     message.addPart(part);
   *     message.send();
   *   });
   * };
   * ```
   *
   * @property {Function} onSendMessage
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Message} evt.detail.item
   */

  /**
   * This event is triggered before any Message is sent.
   *
   * You can use this event to provide your own logic for sending the Message.
   *
   * ```javascript
   * document.body.addEventListener('layer-send-message', function(evt) {
   *   evt.preventDefault();
   *   var message = evt.detail.item;
   *   myAsyncLookup(function(result) {
   *     var part = new Layer.Core.MessagePart({
   *       mimeType: 'application/json',
   *       body: result
   *     });
   *     message.addPart(part);
   *     message.send();
   *   });
   * });
   * ```
   *
   * @event layer-send-message
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Message} evt.detail.item
   * @param {Object} evt.detail.notification
   */

  /**
   * This event is triggered before the Message is deleted.
   *
   * You can use this event to provide your own logic for deleting the Message, or preventing it from being deleted.
   *
   * ```javascript
   * conversationPanel.onMessageDeleted = function(evt) {
   *   evt.preventDefault();
   *   var message = evt.detail.item;
   *   message.delete(layer.Constants.DELETION_MODES.MY_DEVICES);
   * };
   * ```
   *
   * @property {Function} onMessageDeleted
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Message} evt.detail.item
   */

  /**
   * This event is triggered before the Message is deleted.
   *
   * You can use this event to provide your own logic for deleting the Message, or preventing it from being deleted.
   *
   * ```javascript
   * document.body.addEventListener('layer-message-deleted', function(evt) {
   *   evt.preventDefault();
   *   var message = evt.detail.item;
   *   message.delete(layer.Constants.DELETION_MODES.MY_DEVICES);
   * });
   * ```
   *
   * @event layer-message-deleted
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Message} evt.detail.item
   */

  /**
   * Custom handler to use for rendering typing indicators.
   *
   * By calling `evt.preventDefault()` on the event you can provide your own custom typing indicator text to this widget:
   *
   * ```javascript
   * conversationPanel.onTypingIndicator = function(evt) {
   *    evt.preventDefault();
   *    var widget = evt.target;
   *    var typingUsers = evt.detail.typing;
   *    var pausedUsers = evt.detail.paused;
   *    var text = '';
   *    if (typingUsers.length) text = typingUsers.length + ' users are typing';
   *    if (pausedUsers.length && typingUsers.length) text += ' and ';
   *    if (pausedUsers.length) text += pausedUsers.length + ' users have paused typing';
   *    widget.value = text;
   * };
   * ```
   *
   * Note that as long as you have called `evt.preventDefault()` you can also just directly manipulate child domNodes of `evt.detail.widget`
   * if a plain textual message doesn't suffice.
   *
   * @property {Function} onTypingIndicatorChange
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Identity[]} evt.detail.typing
   * @param {layer.Identity[]} evt.detail.paused
   */

  /**
   * Custom handler to use for rendering typing indicators.
   *
   * By calling `evt.preventDefault()` on the event you can provide your own custom typing indicator text to this widget:
   *
   * ```javascript
   * document.body.addEventListener('layer-typing-indicator-change', function(evt) {
   *    evt.preventDefault();
   *    var widget = evt.target;
   *    var typingUsers = evt.detail.typing;
   *    var pausedUsers = evt.detail.paused;
   *    var text = '';
   *    if (typingUsers.length) text = typingUsers.length + ' users are typing';
   *    if (pausedUsers.length && typingUsers.length) text += ' and ';
   *    if (pausedUsers.length) text += pausedUsers.length + ' users have paused typing';
   *    widget.value = text;
   * });
   * ```
   *
   * Note that as long as you have called `evt.preventDefault()` you can also just directly manipulate child domNodes of `evt.detail.widget`
   * if a plain textual message doesn't suffice.
   *
   * @event layer-typing-indicator-change
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Identity[]} evt.detail.typing
   * @param {layer.Identity[]} evt.detail.paused
   */

  /**
   * This event is triggered whenever the composer value changes.
   *
   * This is not a cancelable event.
   *
   * ```javascript
   * conversationPanel.onComposerChangeValue = function(evt) {
   *   this.setState({composerValue: evt.detail.value});
   * }
   * ```
   *
   * @property {Function} onComposerChangeValue
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {String} evt.detail.value
   * @param {String} evt.detail.oldValue
   */
  events: ['layer-message-deleted', 'layer-send-message', 'layer-typing-indicator-change', 'layer-composer-change-value'],

  properties: {

    // Documented in mixins/has-query.js
    query: {
      set: function set(value) {
        this.nodes.list.query = value;
      }
    },

    /**
     * ID of the Conversation being shown by this panel.
     *
     * This Conversation ID specifies what conversation to render and interact with.
     * This property needs to be changed any time you change to view a different Conversation.
     *
     * Alternative: See layerUI.components.LayerConversation.conversation property.  Strings however are easier to stick
     * into html template files.
     *
     * ```
     * function selectConversation(selectedConversation) {
     *   // These two lines are equivalent:
     *   widget.conversation = selectedConversation;
     *   widget.conversationId = selectedConversation.id;
     * }
     * ```
     *
     * @property {String} [conversationId='']
     */
    conversationId: {
      set: function set(value) {
        var _this = this;

        if (value && value.indexOf('layer:///conversations') !== 0 && value.indexOf('layer:///channels') !== 0) this.properties.conversationId = '';
        if (this.client) {
          if (this.conversationId) {
            if (this.client.isReady && !this.client.isDestroyed) {
              this.conversation = this.client.getObject(this.conversationId, true);
            } else {
              this.client.once('ready', function () {
                if (_this.conversationId) _this.conversation = _this.client.getObject(_this.conversationId, true);
              });
            }
          } else {
            this.conversation = null;
          }
        }
      }
    },

    /**
     * If you have an initial conversation id, but what this property to be otherwise ignored.
     *
     * When to use this? You have set your Conversation Panel to `listen-to` your Conversation List,
     * but you still want to be able to set an initial conversation.  Any changes to this property
     * will be ignored.
     *
     * @property {String} initialConversationId
     */
    initialConversationId: {
      set: function set(value) {
        if (!this.properties._internalState.onAfterCreateCalled) {
          this.conversationId = value;
        }
      }
    },

    /**
     * The Conversation being shown by this panel.
     *
     * This Conversation ID specifies what conversation to render and interact with.
     * This property needs to be changed any time you change to view a different Conversation.
     *
     * Alternative: See layerUI.components.LayerConversation.conversationId property for an easier property to use
     * within html templates.
     *
     * ```
     * function selectConversation(selectedConversation) {
     *   // These two lines are equivalent:
     *   widget.conversationId = selectedConversation.id;
     *   widget.conversation = selectedConversation;
     * }
     * ```
     *
     * @property {Layer.Core.Container}
     */
    conversation: {
      set: function set(value) {
        if (value && !(value instanceof _layerWebsdk2.default.Conversation || value instanceof _layerWebsdk2.default.Channel)) this.properties.conversation = null;
        if (this.client) this._setupConversation();
      }
    },

    // Docs in mixins/has-query.js; new behavior here is that any change to hasGeneratedQuery means
    // that now THIS component is responsible for managing the query predicate; call _setupConversation to see that done.
    hasGeneratedQuery: {
      set: function set(value) {
        if (value && this.conversationId && this.client) this._setupConversation();
      },

      type: Boolean
    },

    /**
     * Refocus on the Conversation Panel any time the Conversation ID changes.
     *
     * So, the user clicked on a Conversation in a Conversation List, and focus is no longer on this widget?
     * Automatically refocus on it.
     *
     * Possible values:
     *
     * * always
     * * desktop-only
     * * never
     *
     * Note that the definition we'd like to have for desktop-only is any device that automatically opens
     * an on-screen keyboard.  There are no good techniques for that.  But if we detect your on an Android device
     * we're going to assume it uses an on-screen keyboard.
     *
     * @property {String} [autoFocusConversation=desktop-only]
     */
    autoFocusConversation: {
      value: 'desktop-only'
    },

    // Docs in mixins/main-component.js
    client: {
      set: function set(value) {
        if (value) {
          if (!this.conversation && this.conversationId) this.conversation = value.getObject(this.conversationId, true);
          if (this.conversation) this._setupConversation();
        }
      }
    },

    /**
     * Function allows for additional dom nodes to be generated and inserted before/after messages
     *
     * ```
     * conversationPanel.onRenderListItem = function(widget, messages) {
     *   var message = widget.item;
     *   if (message.sentAt.toDateString() !== messages[index - 1].sentAt.toDateString()) {
     *     widget.customNodeAbove = document.createElement('hr');
     *     widget.customNodeBelow = document.createElement('hr');
     *   }
     *  });
     * ```
     *
     * @property {Function} onRenderListItem
     * @property {layerUI.components.MessagesListPanel.Item} onRenderListItem.widget
     *    One row of the list
     * @property {Layer.Core.Message[]} onRenderListItem.items
     *    full set of messages in the list
     * @property {Number} onRenderListItem.index
     *    index of the message in the items array
     * @property {Boolean} onRenderListItem.isTopItemNew
     *    If the top item is index 0, and its newly added rather than just affected by changes
     *    around it, this is often useful to know.
     */
    onRenderListItem: {
      type: Function,
      set: function set(value) {
        this.nodes.list.onRenderListItem = value;
      },
      get: function get() {
        return this.nodes.list.onRenderListItem;
      }
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not rerender the list.
     *
     * ```javascript
     * conversationPanel.dateRenderer = function(date) {
     *    return date.toISOString();
     * };
     * ```
     *
     * @property {Function} [dateRenderer=null]
     */
    dateRenderer: {
      type: Function,
      set: function set(value) {
        this.nodes.list.dateRenderer = value;
      }
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not rerender the list.
     *
     * ```javascript
     * conversationPanel.messageStatusRenderer = function(message) {
     *    return message.readStatus === layer.Constants.RECIPIENT_STATE.ALL ? 'read' : 'processing...';
     * };
     * ```
     *
     * See Layer.Core.Message for more information on the properties available to determine a message's status.
     *
     * @property {Function} [messageStatusRenderer=null]
     */
    messageStatusRenderer: {
      type: Function,
      set: function set(value) {
        this.nodes.list.messageStatusRenderer = value;
      }
    },

    /**
     * A dom node to render when there are no messages in the list.
     *
     * Could just be a message "Empty Conversation".  Or you can add interactive widgets.
     *
     * ```
     * var div = document.createElement('div');
     * div.innerHTML = 'Empty Conversation';
     * widget.emptyMessageListNode = div;
     * ```
     *
     * @property {HTMLElement} [emptyMessageListNode=null]
     */
    emptyMessageListNode: {
      type: HTMLElement,
      set: function set(value) {
        this.nodes.list.emptyNode = value;
      },
      get: function get(value) {
        return this.nodes.list.emptyNode;
      }
    },

    /**
     * A dom node to render when there are no more messages in the Message List.
     *
     * Could just be a message "Top of Conversation".
     *
     * ```
     * var div = document.createElement('div');
     * div.innerHTML = 'Top of Conversation';
     * widget.endOfMessagesNode = div;
     * ```
     *
     * Note that this node is *not* rendered when the list has no messages; see
     * emptyMessageListNode instead.
     *
     * Note that using the default template, this widget may be wrapped in a div with CSS class `layer-header-toggle`,
     * you should insure that they height of this toggle does not change when your custom node is shown.  Set the
     * style height to be at least as tall as your custom node.
     *
     * @property {HTMLElement} [emptyMessageListNode=null]
     */
    endOfMessagesNode: {
      type: HTMLElement,
      set: function set(value) {
        this.nodes.list.endOfResultsNode = value;
      },
      get: function get(value) {
        return this.nodes.list.endOfResultsNode;
      }
    },

    /**
     * Deletion of this Message is enabled.
     *
     * ```
     * widget.getMessageDeleteEnabled = function(message) {
     *    return message.sender.sessionOwner;
     * }
     * ```
     *
     * @property {Function}
     */
    getMessageDeleteEnabled: {
      type: Function,
      value: function value(message) {
        return message.sender.sessionOwner;
      },
      set: function set(value) {
        this.nodes.list.getMessageDeleteEnabled = value;
      }
    },

    /**
     * An array of buttons (dom nodes) to be added to the Compose bar, right side.
     *
     * ```
     * widget.composeButtons = [
     *     document.createElement('button'),
     *     document.createElement('button')
     * ];
     * ```
     *
     * @property {HTMLElement[]} [composeButtons=[]]
     */
    composeButtons: {
      type: HTMLElement,
      set: function set(value) {
        this.nodes.composer.buttons = value;
      }
    },

    /**
     * An array of buttons (dom nodes) to be added to the Compose bar, left side.
     *
     * ```
     * widget.composeButtonsLeft = [
     *     document.createElement('button'),
     *     document.createElement('button')
     * ];
     * ```
     *
     * @property {HTMLElement[]} [composeButtonsLeft=[]]
     */
    composeButtonsLeft: {
      type: HTMLElement,
      set: function set(value) {
        this.nodes.composer.buttonsLeft = value;
      }
    },

    /**
     * Use this to get/set the text in the Compose bar.
     *
     * ```
     * widget.composeText = 'This text will appear in the editor within the compose bar';
     * var message = conversation.createMessage(widget.composeText);
     * ```
     *
     * @property {String} [composeText='']
     */
    composeText: {
      get: function get() {
        return this.nodes.composer.value;
      },
      set: function set(value) {
        this.nodes.composer.value = value;
      }
    },

    /**
     * Use this to get/set the text in the Compose bar.
     *
     * ```
     * widget.composePlaceholder = 'Enter a message. Or dont. It really doesnt matter.';
     * ```
     *
     * @property {String} [composePlaceholder='']
     */
    composePlaceholder: {
      get: function get() {
        return this.nodes.composer.placeholder;
      },
      set: function set(value) {
        this.nodes.composer.placeholder = value;
      }
    },

    /**
     * Disable the widget to disable read receipts and other behaviors that may occur while the widget is hidden.
     *
     * ```
     * widget.disable = true;
     * ```
     *
     * @property {Boolean}
     */
    disable: {
      type: Boolean,
      set: function set(value) {
        this.nodes.list.disable = value;
      }
    },

    /**
     * The model to generate a Query for if a Query is not provided.
     *
     * @readonly
     * @private
     * @property {String} [_queryModel=layer.Query.Message]
     */
    _queryModel: {
      value: _layerWebsdk2.default.Query.Message
    }
  },
  methods: {
    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate: function onCreate() {},


    /**
     * When a key is pressed and text is not focused, focus on the composer
     *
     * @method onKeyDown
     */
    onKeyDown: function onKeyDown() {
      this.focusText();
    },


    /**
     * Place focus on the text editor in the Compose bar.
     *
     * ```
     * widget.focusText();
     * ```
     *
     * @method
     */
    focusText: function focusText() {
      this.nodes.composer.focus();
    },


    /**
     * Send the Message that the user has typed in... or that you have specified.
     *
     * ```
     * widget.composeText = "Hello world";
     * widget.send(); // send the current text in the textarea
     * ```
     *
     * ```
     * widget.send(parts); // send custom message parts but NOT the text in the textarea
     * ```
     *
     * @method
     * @param {Layer.Core.MessagePart[]} optionalParts
     */
    send: function send(optionalParts) {
      var _nodes$composer;

      var args = optionalParts ? [optionalParts] : [];
      (_nodes$composer = this.nodes.composer).send.apply(_nodes$composer, args);
    },


    /**
     * Given a Conversation ID and a Client, setup the Composer and Typing Indicator
     *
     * @method _setupConversation
     * @private
     */
    _setupConversation: function _setupConversation() {
      var conversation = this.properties.conversation;

      // Client not ready yet? retry once authenticated.
      if (this.client && !this.client.isReady) {
        this.client.once('ready', this._setupConversation.bind(this));
        return;
      } else if (!this.client) {
        return;
      }

      this.nodes.composer.conversation = conversation;
      this.nodes.typingIndicators.conversation = conversation;
      if (this.hasGeneratedQuery) {
        if (conversation instanceof _layerWebsdk2.default.Conversation) {
          this.query.update({
            predicate: 'conversation.id = "' + conversation.id + '"'
          });
        } else if (conversation instanceof _layerWebsdk2.default.Channel) {
          this.query.update({
            predicate: 'channel.id = "' + conversation.id + '"'
          });
        } else {
          this.query.update({
            predicate: ''
          });
        }
      }
      if (this.shouldAutoFocusConversation(navigator)) this.focusText();
    },
    shouldAutoFocusConversation: function shouldAutoFocusConversation(_ref) {
      var _ref$userAgent = _ref.userAgent,
          userAgent = _ref$userAgent === undefined ? '' : _ref$userAgent,
          maxTouchPoints = _ref.maxTouchPoints;

      switch (this.autoFocusConversation) {
        case 'always':
          return true;
        case 'desktop-only':
          if (maxTouchPoints !== undefined && maxTouchPoints > 0) return false;
          return !userAgent.match(/(mobile|android|phone)/i);
        case 'never':
          return false;
      }
    }
  },
  listeners: {
    'layer-conversation-selected': function conversationSelected(evt) {
      this.conversation = evt.detail.item;
    },
    'layer-notification-click': function notificationClick(evt) {
      var message = evt.detail.item;
      var conversation = message.getConversation();
      if (conversation !== this.conversation) this.conversation = conversation;
    },
    'layer-message-notification': function messageNotification(evt) {
      // If the notification is not background, and we have toast notifications enabled, and message isn't in the selected conversation,
      // to a toast notify
      if (!evt.detail.isBackground && evt.detail.item.conversationId === this.conversation.id && evt.target.notifyInForeground === 'toast') {
        evt.preventDefault();
      }
    }
  }
});

(function () {
  var layerUI = require('../../base');
  layerUI.buildAndRegisterTemplate("layer-conversation-panel", "<layer-messages-list layer-id='list'></layer-messages-list><layer-typing-indicator layer-id='typingIndicators'></layer-typing-indicator><layer-composer layer-id='composer'></layer-composer>", "");
  layerUI.buildStyle("layer-conversation-panel", "layer-conversation-panel {\ndisplay: flex;\nflex-direction: column;\noutline: none; \n}\nlayer-messages-list {\nflex-grow: 1;\nheight: 100px;\n}\nlayer-composer {\nborder-top: 1px solid #dedede;\nmin-height: 30px;\n}", "");
})();
},{"../../base":4,"../../components/component":5,"../../mixins/focus-on-keydown":44,"../../mixins/has-query":45,"../../mixins/main-component":51,"../messages-list-panel/layer-messages-list/layer-messages-list":18,"../subcomponents/layer-composer/layer-composer":21,"../subcomponents/layer-typing-indicator/layer-typing-indicator":30,"layer-websdk":66}],12:[function(require,module,exports){
/**
 * The Layer Notifier widget can show Desktop Notifications when your app is in the background,
 * and Toast notifications when your app is in the foreground.
 *
 * You can customize the toast styling and layout by providing a custom Template.
 *
 * Add this to your page as:
 *
 * ```
 * <layer-notifier notify-in-foreground="toast" icon-url="https://myco.com/myimage.png"></layer-notifier>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var notifier = document.createElement('layer-notifier');
 * notifier.notifyInForeground = 'toast';
 * notifier.iconUrl = 'https://myco.com/myimage.png';
 * ```
 *
 * Note that you typically would not want to have a notification if your app is in the foreground,
 * and the new message is already visible to the user.  However,
 * this widget does not know what conversation is currently visible, so its up to you to manage this.
 *
 * Provide a layerUI.components.misc.Notifier.onMessageNotification handler to perform tests to see
 * if notifications are required, and then call `evt.preventDefault()` to prevent the notification from showing.
 *
 * @class layerUI.components.Notifier
 * @extends layerUI.components.Component
 */
'use strict';

var _notifyjs = require('notifyjs');

var _notifyjs2 = _interopRequireDefault(_notifyjs);

var _base = require('../../base');

var _component = require('../../components/component');

var _mainComponent = require('../../mixins/main-component');

var _mainComponent2 = _interopRequireDefault(_mainComponent);

require('../subcomponents/layer-avatar/layer-avatar');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Notify = _notifyjs2.default;

if ('default' in Notify) Notify = Notify.default; // Annoying difference between webpack and browserify...

(0, _component.registerComponent)('layer-notifier', {
  mixins: [_mainComponent2.default],

  /**
   * Before showing any notification, this event will be triggered.
   *
   * Call `evt.preventDefault()`
   * to prevent the notification from being rendered.  Not calling `preventDefault()` allows the notification to occur.
   * This lets you customize behaviors on a per-notification basis.
   *
   * ```
   * document.body.addEventListener('layer-message-notification', function(evt) {
   *   if (evt.detail.item.conversationId === myOpenConversationId) {
   *     evt.preventDefault();
   *   }
   * }
   * ```
   *
   * @event layer-message-notification
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Message} evt.detail.item     The Message that has triggered this notification
   * @param {Boolean} evt.detail.isBackground   Is the app running in the background
   * @param {String} evt.detail.type            What type of notification has been configured for this event ("desktop" or "toast")
   */
  /**
   * Before showing any notification, this event will be triggered.
   *
   * Call `evt.preventDefault()`
   * to prevent the notification from being rendered.  Not calling `preventDefault()` allows the notification to occur.
   * This lets you customize behaviors on a per-notification basis.
   *
   * ```
   * notifier.onMessageNotification = function(evt) {
   *   if (evt.detail.item.conversationId === myOpenConversationId && !evt.detail.isBackground) {
   *     evt.preventDefault();
   *   }
   * }
   * ```
   *
   * @property {Function} onMessageNotification
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Message} evt.detail.item     The Message that has triggered this notification
   * @param {Boolean} evt.detail.isBackground   Is the app running in the background
   * @param {String} evt.detail.type            What type of notification has been configured for this event ("desktop" or "toast")
   */

  /**
   * Use this event to handle the user clicking on the notification.
   *
   * ```
   * document.body.addEventListener('layer-notification-click', function(evt) {
   *   if (evt.detail.item.conversationId !== myOpenConversationId && !evt.detail.isBackground) {
   *     // Open the Conversation:
   *     document.querySelector('layer-conversation').conversationId = evt.detail.item.conversationId;
   *   }
   * });
   * ```
   *
   * @event layer-notification-click
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Message} evt.detail.item   The Message that has triggered this notification
   */

  /**
   * Use this event to handle the user clicking on the notification.
   *
   * ```
   * notifier.onNotificationClick = function(evt) {
   *   if (evt.detail.item.conversationId !== myOpenConversationId) {
   *     // Open the Conversation:
   *     document.querySelector('layer-conversation').conversationId = evt.detail.item.conversationId;
   *   }
   * };
   * ```
   *
   * @property {Function} onNotificationClick
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Message} evt.detail.item   The Message that has triggered this notification
   */

  events: ['layer-message-notification', 'layer-notification-click'],
  properties: {

    // Docs in mixins/main-component.js
    client: {
      set: function set(value) {
        value.on('messages:notify', this._notify.bind(this));
      }
    },

    /**
     * When your app is in the background, how should it show notifications of new Messages.
     *
     * Possible values:
     *
     * * desktop: Use desktop notifications when app is in the background
     * * toast: Use in-page toast notifications when app is in the background
     * * none or "": No notifications
     *
     * ```
     * <layer-notifier notify-in-background="none"></layer-notifier>
     * ```
     *
     * @property {String} [notifyInBackground=desktop]
     */
    notifyInBackground: {
      value: 'desktop',
      set: function set(value) {
        if (value === 'desktop' && window.Notification) {
          Notify.requestPermission(this._onPermissionGranted.bind(this));
        }
      }
    },

    /**
     * When your app is in the foreground, how should it show notifications of new Messages.
     *
     * Possible values:
     *
     * * desktop: Use desktop notifications when app is in the foreground
     * * toast: Use in-page toast notifications when app is in the foreground
     * * none or "": No notifications
     *
     * * ```
     * <layer-notifier notify-in-foreground="toast"></layer-notifier>
     * ```
     *
     * @property {String} [notifyInForeground=none]
     */
    notifyInForeground: {
      value: 'none',
      set: function set(value) {
        if (value === 'desktop' && window.Notification) {
          Notify.requestPermission(this._onPermissionGranted.bind(this));
        }
      }
    },

    /**
     * Modify the window titlebar to notify users of new messages
     *
     * NOTE: Rather than always show this indicator whenever there are unread messages, we only show
     * this indicator if the most recently received message is unread.  Further, this will not show
     * after reloading the app; its assumed that the user who reloads your app has seen what they want
     * to see, and that the purpose of this indicator is to flag new stuff that should bring them back to your window.
     *
     * See layerUI.components.Notifier.notifyCharacterForTitlebar for more controls.
     *
     * @property {String} notifyInTitleBar
     */
    notifyInTitlebar: {
      type: Boolean,
      value: true
    },

    /**
     * Set a character or string to prefix your window titlebar with when there are unread messages.
     *
     * This property is used if layerUI.components.Notifier.notifyInTitlebar is enabled.
     *
     * @property {String} notifyCharacterForTitlebar
     */
    notifyCharacterForTitlebar: {
      value: '⬤'
    },

    /**
     * Set to true to force the notifier to show the unread badge in the titlebar, or set to false to force it to remove this.
     *
     * Use this at runtime to modify the badging behavior, use layerUI.components.Notifier.notifyInTitlebar to enable/disable
     * badging.  Treat this as state rather than setting.
     *
     * If you want to just set the badge until the message is marked as read, use layerUI.components.Notifier.flagTitlebarForMessage
     *
     * @property {Boolean} flagTitlebar
     */
    flagTitlebar: {
      type: Boolean,
      value: false,
      set: function set(value) {
        if (value) {
          if (document.title.indexOf(this.notifyCharacterForTitlebar) !== 0) {
            document.title = this.notifyCharacterForTitlebar + ' ' + document.title;
          }
        } else if (document.title.indexOf(this.notifyCharacterForTitlebar) === 0) {
          document.title = document.title.substring(this.notifyCharacterForTitlebar.length + 1);
        }
      }
    },

    /**
     * Tells the notifier to put a badge in the titlebar for the specified message if its unread, and clear it once read.
     *
     * @property {Layer.Core.Message} flagTitlebarForMessage
     */
    flagTitlebarForMessage: {
      set: function set(message, oldMessage) {
        if (oldMessage) oldMessage.off(null, this._handleTitlebarMessageChange, this);
        if (!message || message.isRead) {
          this.flagTitlebar = false;
        } else {
          this.flagTitlebar = true;
          message.on('messages:change destroy', this._handleTitlebarMessageChange, this);
        }
      }
    },

    /**
     * If the user hasn't granted priveledges to use desktop notifications, they won't be shown.
     *
     * This is a state property set by this component if/when the user/browser has approved the necessary permissions.
     *
     * @property {Boolean} [userEnabledDesktopNotifications=false]
     * @readonly
     */
    userEnabledDesktopNotifications: {
      value: false
    },

    /**
     * To provide a custom icon to render within notifications, put the URL here.
     *
     * Leave this blank to use the sender's `avatarUrl` as the notification icon.
     *
     * * ```
     * <layer-notifier icon-url="https://myco.co/logo.png"></layer-notifier>
     * ```
     *
     * @property {String} [iconUrl=]
     */
    iconUrl: {
      value: ''
    },

    /**
     * Number of seconds the notification will stay before its automatically dismissed.
     *
     * * ```
     * <layer-notifier timeout-seconds="60"></layer-notifier>
     * ```
     *
     * @property {Number} [timeoutSeconds=30]
     */
    timeoutSeconds: {
      type: Number,
      value: 30
    },

    /**
     * Timeout ID for clearing the toast notification
     *
     * @private
     * @property {Number} [_toastTimeout=0]
     */
    _toastTimeout: {
      value: 0
    }
  },
  methods: {

    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate: function onCreate() {
      this.addEventListener('click', this.onClickToast.bind(this));
      this.addEventListener('transitionend', this._afterTransition.bind(this), true);
    },


    /**
     * After finishing an animation, trigger this callback which removes the animation classes.
     *
     * @method _afterTransition
     * @private
     */
    _afterTransition: function _afterTransition() {
      this.classList.remove('layer-notifier-toast-fade');
    },


    /**
     * Callback indicating that the user has granted permissions for desktop notifications.
     *
     * @method _onPermissionGranted
     * @private
     */
    _onPermissionGranted: function _onPermissionGranted() {
      this.properties.userEnabledDesktopNotifications = true;
    },


    /**
     * Notify the user of a new messages.
     *
     * Determines if foreground or background notifications are being used,
     * and what type of notification is preferred for that state.
     *
     * Triggers an event so the app can confirm/block the notification.
     *
     * @method _notify
     * @param {layer.LayerEvent} evt
     * @private
     */
    _notify: function _notify(evt) {
      var isBackground = (0, _base.isInBackground)();
      var type = isBackground ? this.notifyInBackground : this.notifyInForeground;
      var message = evt.message;

      // Note: desktopNotify does a message.off() call that deletes all event handlers associated with this widget;
      // so make sure it gets called AFTER titlebarNotify which has a more precise off() call
      // TODO: Fix this.
      if (this.notifyInTitlebar && isBackground) {
        this.flagTitlebarForMessage = message;
      }

      if (type && type !== 'none') {
        if (this.trigger('layer-message-notification', { item: message, type: type, isBackground: isBackground })) {
          if (type === 'desktop' && this.properties.userEnabledDesktopNotifications) {
            this.desktopNotify(evt.message);
          } else if (type === 'toast') {
            this.toastNotify(evt.message);
          }
        }
      }
    },


    /**
     * Whenever the flagTitlebarForMessage message changes, check if its now read.
     *
     * @method _handleTitlebarMessageChange
     * @private
     */
    _handleTitlebarMessageChange: function _handleTitlebarMessageChange(evt) {
      var message = this.flagTitlebarForMessage;
      if (message && (message.isRead || evt.eventName === 'destroy')) {
        this.flagTitlebar = false;
        this.flagTitlebarForMessage = null;
      }
    },


    /**
     * Show a desktop notification for this message.
     *
     * @method desktopNotify
     * @param {Layer.Core.Message} message
     */
    desktopNotify: function desktopNotify(message) {
      var _this = this;

      try {
        var text = message.getText();
        if (this.properties.desktopNotify) this.closeDesktopNotify();

        this.properties.desktopMessage = message;
        this.properties.desktopNotify = new Notify('Message from ' + message.sender.displayName, {
          icon: this.iconUrl || message.sender.avatarUrl,
          timeout: this.timeoutSeconds,
          body: text || 'New file received',
          tag: message.conversationId || 'announcement',
          closeOnClick: true,
          notifyClick: function notifyClick() {
            window.focus();
            _this.trigger('layer-notification-click', { item: message });
            _this.onDesktopClick(message);
          }
        });
        this.properties.desktopNotify.show();

        message.on('messages:change destroy', function (evt) {
          if (message.isRead || evt.eventName === 'destroy') {
            _this.closeDesktopNotify();
          }
        }, this);
      } catch (e) {
        // do nothing
      }
    },


    /**
     * Close the desktop notification.
     *
     * @method closeDesktopNotify
     */
    closeDesktopNotify: function closeDesktopNotify() {
      if (this.properties.desktopNotify) {
        this.properties.desktopNotify.close();
        this.properties.desktopMessage.off(null, null, this);
        this.properties.desktopMessage = this.properties.desktopNotify = null;
      }
    },


    /**
     * MIXIN HOOK: User has clicked on a desktop notification.
     *
     * @method
     * @param {Layer.Core.Message} message
     */
    onDesktopClick: function onDesktopClick(message) {
      // No-op
    },


    /**
     * Show a toast notification for this message.
     *
     * @method toastNotify
     * @param {Layer.Core.Message} message
     */
    toastNotify: function toastNotify(message) {
      var _this2 = this;

      var placeholder = this.querySelector('.layer-message-item-placeholder');
      var handler = (0, _base.getHandler)(message, this);

      if (handler) {
        if (placeholder) this.nodes.container.removeChild(placeholder);
        this.nodes.avatar.users = [message.sender];
        this.nodes.title.innerHTML = message.sender.displayName;

        if (this.properties._toastTimeout) clearTimeout(this.properties._toastTimeout);
        this.classList.add(handler.tagName);

        var messageHandler = document.createElement(handler.tagName);
        messageHandler.parentComponent = this;
        messageHandler.message = message;

        messageHandler.classList.add('layer-message-item-placeholder');
        this.nodes.container.appendChild(messageHandler);
        this.classList.add('layer-notifier-toast-fade');
        this.classList.add('layer-notifier-toast');
        this.properties._toastTimeout = setTimeout(this.closeToast.bind(this), this.timeoutSeconds * 1000);

        this.properties.toastMessage = message;
        message.on('messages:change destroy', function (evt) {
          if (message.isRead || evt.eventName === 'destroy') {
            _this2.closeToast();
          }
        }, this);
      }
    },


    /**
     * Close the toast notification.
     *
     * @method closeToast
     */
    closeToast: function closeToast() {
      this.classList.add('layer-notifier-toast-fade');
      this.classList.remove('layer-notifier-toast');

      clearTimeout(this.properties._toastTimeout);
      this.properties._toastTimeout = 0;
      if (this.properties.toastMessage) this.properties.toastMessage.off(null, null, this);
      this.properties.toastMessage = null;
    },


    /**
     * MIXIN HOOK: The user has clicked on the toast dialog.
     *
     * @method onClickToast
     * @private
     * @param {Event} evt
     */
    onClickToast: function onClickToast(evt) {
      if (this.properties.toastMessage) {
        evt.preventDefault();
        evt.stopPropagation();
        this.trigger('layer-notification-click', { item: this.properties.toastMessage });
        this.closeToast();
      }
    }
  }
});

(function () {
  var layerUI = require('../../base');
  layerUI.buildAndRegisterTemplate("layer-notifier", "<layer-avatar layer-id='avatar'></layer-avatar><div class='layer-message-item-main' layer-id='container'><div class='layer-notifier-title' layer-id='title'></div><div class='layer-message-item-placeholder'></div></div>", "");
  layerUI.buildStyle("layer-notifier", "layer-notifier {\nposition: fixed;\nz-index: 1000;\nright: 10px;\ntop: -10000px;\nmax-width: 40%;\nmax-height: 250px;\ndisplay: flex;\nopacity: 0;\ntransition: opacity 500ms;\n}\nlayer-notifier.layer-notifier-toast-fade {\ntop: 10px;\n}\nlayer-notifier.layer-notifier-toast {\ntop: 10px;\nflex-direction: row;\nopacity: 1;\ntransition: opacity 1s;\n}\nlayer-notifier .layer-message-item-main {\ndisplay: flex;\nflex-direction: column;\nflex-grow: 1;\n}\nlayer-notifier layer-message-text-plain {\noverflow: hidden;\nmax-height: 200px;\n}", "");
})();
},{"../../base":4,"../../components/component":5,"../../mixins/main-component":51,"../subcomponents/layer-avatar/layer-avatar":19,"notifyjs":67}],13:[function(require,module,exports){
/**
 * The Layer Membership Item represents a single user within a Membership List.
 *
 *
 * @class layerUI.components.MembershipListPanel.Item
 * @experimental
 * @mixin layerUI.mixins.ListItem
 * @extends layerUI.components.Component
 */
'use strict';

var _listItem = require('../../../mixins/list-item');

var _listItem2 = _interopRequireDefault(_listItem);

var _listItemSelection = require('../../../mixins/list-item-selection');

var _listItemSelection2 = _interopRequireDefault(_listItemSelection);

var _component = require('../../component');

require('../../subcomponents/layer-avatar/layer-avatar');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-membership-item', {
  mixins: [_listItem2.default, _listItemSelection2.default],
  properties: {
    item: {
      set: function set(member) {
        if (member) member.identity.on('identities:change', this.onRerender.bind(this));
      }
    }
  },
  methods: {
    /**
     * Render/rerender the user, showing the avatar and user's name.
     *
     * @method onRender
     * @private
     */
    onRender: function onRender() {
      this.nodes.avatar.users = [this.item.identity];
      this.onRerender();
    },


    /**
     * Render/rerender changes to the Identity object or Membership object.
     *
     * @method onRerender
     * @private
     */
    onRerender: function onRerender() {
      this.nodes.title.innerHTML = this.item.identity.displayName || 'User ID ' + this.item.identity.userId;
    },


    /**
     * Run a filter on this item, and hide it if it doesn't match the filter.
     *
     * @method _runFilter
     * @param {String|Regex|Function} filter
     */
    _runFilter: function _runFilter(filter) {
      var identity = this.properties.item.identity;
      var match = false;
      if (!filter) {
        match = true;
      } else if (filter instanceof RegExp) {
        match = filter.test(identity.displayName) || filter.test(identity.firstName) || filter.test(identity.lastName) || filter.test(identity.emailAddress);
      } else if (typeof filter === 'function') {
        match = filter(identity);
      } else {
        filter = filter.toLowerCase();
        match = identity.displayName.toLowerCase().indexOf(filter) !== -1 || identity.firstName.toLowerCase().indexOf(filter) !== -1 || identity.lastName.toLowerCase().indexOf(filter) !== -1 || identity.emailAddress.toLowerCase().indexOf(filter) !== -1;
      }
      this.classList[match ? 'remove' : 'add']('layer-item-filtered');
    }
  }
});

(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-membership-item", "<div class='layer-list-item'><layer-avatar layer-id='avatar'></layer-avatar><label class='layer-membership-name' layer-id='title'></label></div>", "");
  layerUI.buildStyle("layer-membership-item", "layer-membership-item {\ndisplay: flex;\nflex-direction: column;\n}\nlayer-membership-item .layer-list-item {\ndisplay: flex;\nflex-direction: row;\nalign-items: center;\n}\nlayer-membership-item .layer-list-item layer-avatar {\nmargin-right: 20px;\n}\nlayer-membership-item .layer-list-item label {\nflex-grow: 1;\nwidth: 100px; \n}\nlayer-membership-item.layer-item-filtered .layer-list-item {\ndisplay: none;\n}\nlayer-membership-item.layer-membership-item-empty {\ndisplay: none;\n}", "");
})();
},{"../../../base":4,"../../../mixins/list-item":47,"../../../mixins/list-item-selection":46,"../../component":5,"../../subcomponents/layer-avatar/layer-avatar":19}],14:[function(require,module,exports){
/**
 * The Layer Membership List renders a pagable list of Layer.Core.Membership objects, and allows the user to
 * see who else is in the Channel with them.
 *
 * This Component can be added to your project directly in the HTML file:
 *
 * ```
 * <layer-membership-list></layer-membership-list>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var membersList = document.createElement('layer-membership-list');
 * ```
 *
 * @class layerUI.components.MembershipListPanel.List
 * @experimental This feature is incomplete, and available as Preview only.
 * @extends layerUI.components.Component
 * @mixin layerUI.mixins.List
 * @mixin layerUI.mixins.MainComponent
 * @mixin layerUI.mixins.ListSelection
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

var _component = require('../../component');

var _list = require('../../../mixins/list');

var _list2 = _interopRequireDefault(_list);

var _mainComponent = require('../../../mixins/main-component');

var _mainComponent2 = _interopRequireDefault(_mainComponent);

var _listSelection = require('../../../mixins/list-selection');

var _listSelection2 = _interopRequireDefault(_listSelection);

require('../layer-membership-item/layer-membership-item');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-membership-list', {
  mixins: [_list2.default, _listSelection2.default, _mainComponent2.default],

  /**
   * The user has clicked to select an Member in the Membership List.
   *
   * ```javascript
   *    membersList.onMembershipSelected = function(evt) {
   *      var memberSelected = evt.detail.item;
   *
   *      // To prevent the UI from proceding to add the member to the selectedIdentities:
   *      // Note that memberAdded is not yet in selectedIdentities so that you may prevent it from being added.
   *      evt.preventDefault();
   *    };
   * ```
   *
   *  OR
   *
   * ```javascript
   *    document.body.addEventListener('layer-membership-selected', function(evt) {
   *      var memberSelected = evt.detail.item;
   *
   *      // To prevent the UI from proceding to add the member to the selectedIdentities:
   *      // Note that memberAdded is not yet in selectedIdentities so that you may prevent it from being added.
   *      evt.preventDefault();
   *    });
   * ```
   *
   * @event layer-membership-selected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Membership} evt.detail.item
   */
  /**
   * A membership selection change has occurred
   *
   * See the {@link layerUI.components.MembershipListPanel.List#layer-membership-selected layer-membership-selected} event for more detail.
   *
   * @property {Function} onMembershipSelected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Membership} evt.detail.item
   */

  events: ['layer-membership-selected'],
  properties: {
    /**
     * ID of the Channel whose membership is being shown by this panel.
     *
     * This property may need to be changed any time you change to view a different Channel.
     *
     * Alternative: See layerUI.components.MembershipListPanel.List.channel property.  Strings however are easier to stick
     * into html template files.
     *
     * ```
     * function selectChannel(selectedChannel) {
     *   // These two lines are equivalent:
     *   widget.channel = selectedChannel;
     *   widget.channelId = selectedChannel.id;
     * }
     * ```
     *
     * @property {String} [channelId='']
     */
    channelId: {
      set: function set(value) {
        var _this = this;

        if (value && value.indexOf('layer:///channels') !== 0 && value.indexOf('layer:///channels') !== 0) this.properties.channelId = '';
        if (this.client && this.channelId) {
          if (this.client.isReady && !this.client.isDestroyed) {
            this.channel = this.client.getObject(this.channelId, true);
          } else {
            this.client.once('ready', function () {
              if (_this.channelId) _this.channel = _this.client.getObject(_this.channelId, true);
            });
          }
        }
      }
    },

    /**
     * The Channel whose Membership is being shown by this panel.
     *
     * This property may need to be changed any time you change to view a different channel.
     *
     * Alternative: See layerUI.components.MembershipListPanel.List.channelId property for an easier property to use
     * within html templates.
     *
     * ```
     * function selectchannel(selectedChannel) {
     *   // These two lines are equivalent:
     *   widget.channelId = selectedChannel.id;
     *   widget.channel = selectedChannel;
     * }
     * ```
     *
     * @property {Layer.Core.Channel}
     */
    channel: {
      set: function set(value) {
        if (value && !(value instanceof _layerWebsdk2.default.Channel)) value = this.properties.channel = null;
        if (this.query) {
          this.query.update({
            predicate: value ? 'channel.id = "' + value.id + '"' : ''
          });
        }
      }
    },

    /**
     * The model to generate a Query for if a Query is not provided.
     *
     * @readonly
     * @private
     * @property {String} [_queryModel=layer.Query.Membership]
     */
    _queryModel: {
      value: _layerWebsdk2.default.Query.Membership
    },

    /**
     * The event name to trigger on selecting a Member.
     *
     * @readonly
     * @private
     * @property {String} [_selectedItemEventName=layer-membership-selected]
     */
    _selectedItemEventName: {
      value: 'layer-membership-selected'
    }
  },
  methods: {

    /**
     * Append a layerUI.components.IdentitiesListPanel.Item to the Document Fragment
     *
     * @method _generateItem
     * @param {Layer.Core.Membership} membership
     * @private
     */
    _generateItem: function _generateItem(membership) {
      var membershipWidget = document.createElement('layer-membership-item');
      membershipWidget.item = membership;
      membershipWidget.id = this._getItemId(membership.id);
      membershipWidget._runFilter(this.filter);
      return membershipWidget;
    }
  }
});

(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-membership-list", "<div class='layer-load-indicator' layer-id='loadIndicator'>Loading users...</div>", "");
  layerUI.buildStyle("layer-membership-list", "layer-membership-list {\noverflow-y: auto;\ndisplay: block;\n}\nlayer-membership-list .layer-load-indicator {\ntext-align: center;\nborder-top: solid 1px #ccc;\nfont-style: italic;\ndisplay: none;\n}\nlayer-membership-list.layer-loading-data .layer-load-indicator {\ndisplay: block;\n}", "");
})();
},{"../../../base":4,"../../../mixins/list":50,"../../../mixins/list-selection":49,"../../../mixins/main-component":51,"../../component":5,"../layer-membership-item/layer-membership-item":13,"layer-websdk":66}],15:[function(require,module,exports){
/**
 * The Layer Message Item widget renders a single Message synopsis.
 *
 * This is designed to go inside of the layerUI.MessageList widget.  This widget renders the framework of information that goes around a Message,
 * but leaves it up to custom handlers to render the contents and assorted MIME Types of the messages.
 *
 * This Component has two named templates:
 *
 * * `layer-message-item-sent`: Rendering for Messages sent by the owner of this Session
 * * `layer-message-item-received`: Rendering for Messages sent by other users
 *
 * ## CSS Classes
 *
 * * When sending a message, if using `presend()` the message item will have the CSS class `layer-message-preview` until its sent
 * * The tagName used to render the content within the message item will be used as a class name of the parent item.
 *   If using a `<layer-message-text-plain />` widget within the item, the item itself will receive the `layer-message-text-plain` CSS class
 * * `layer-unread-message` will be applied to any message that the user has received but which hasn't been marked as read
 * * `layer-message-status-read-by-all`: All receipients of your user's message have read the message
 * * `layer-message-status-read-by-some`: Some receipients of your user's message have read the message
 * * `layer-message-status-read-by-none`: No receipients of your user's message have read the message
 * * `layer-message-status-delivered-to-all`: All receipients of your user's message have received the message on their device
 * * `layer-message-status-delivered-to-some`: Some receipients of your user's message have received the message on their device
 * * `layer-message-status-delivered-to-none`: No receipients of your user's message have received the message on their device
 * * `layer-message-status-pending`: The Message is trying to reach the server and has not yet completed sending
 * * `layer-list-item-last`: The message is the last in a series of messages from the same sender and within the same block of time
 * * `layer-list-item-first`: The message is the first in a series of messages from the same sender and within the same block of time
 *
 * ## Advanced Customization
 *
 * The simple way to customize the widget is to modify its template.
 * For more advanced customizations where the Message Item widget needs new properties, methods and capabilities, you have two options:
 *
 * 1. Define a custom `<layer-message-item/>` widget; this works but your now entirely responsible for all of its
 *    behaviors, and can not easily integrate fixes and enhancements added to this repo. This is discussed in more
 *    detail at [docs.layer.com](https://docs.layer.com).
 * 2. Enhance the provided widget with Mixins.  Below illustrates an example of a mixin.
 *
 * A Custom Mixin can be used to add Properties and Methods to this class.
 * Any method of this class can be enhanced using a Custom Mixin, however the following methods are recommended
 * as sufficient for most solutions:
 *
 * * layerUI.components.MessagesListPanel.List.onCreate: Your widget has just been created; it has a DOM node, it has child
 *   nodes, *it has no properties*, nor does not yet have a `parentNode`.
 *   Provide an `onCreate` if there is any DOM manipulation you want to do any initialization.  (DOM Manipulation here should NOT depend
 *   upon property values).
 * * layerUI.components.MessagesListPanel.List.onAttach: Your widget now has a `parentNode`.  This is solely for initialization
 *   code that depends upon looking at the `parentNode`, and is not commonly used.
 * * layerUI.components.MessagesListPanel.List.onRender: Your Message Item widget has just been rendered for the first time.
 *   Your widget should have an `item` at this point and any property-based dom manipulation can be done at this time.
 *
 * The following example adds a search bar to the Message List
 * ```
 * layerUI.init({
 *   appId: 'my-app-id',
 *   mixins: {
 *     'layer-messages-item': {
 *       properties: {
 *         selected: {
 *           value: false,
 *           set: function(value) {
 *             if (this.nodes.checkbox) this.nodes.checkbox.checked = value;
 *           },
 *           get: function() {
 *             return this.nodes.checkbox ? this.nodes.checkbox.checked : this.properties.selected;
 *           }
 *         }
 *       },
 *       methods: {
 *         onCreate: function() {
 *           this.nodes.checkbox = document.createElement('input');
 *           this.nodes.checkbox.type = 'checkbox';
 *           this.nodes.checkbox.classList.add('custom-checkbox');
 *           this.nodes.checkbox.addEventListener('click', this._handleCustomCheckboxEvent.bind(this));
 *           this.appendChild(this.nodes.checkbox);
 *         },
 *
 *         // When the widget has been rendered is a good time to do any property based dom manipulation
 *         onRender: function() {
 *          this.nodes.checkbox.checked = this.selected;
 *         },
 *
 *         // Search is run whenver the user changes the search text, app changes the search text,
 *         // or new messages arrive that need to be searched
 *         _handleCustomCheckboxEvent(evt) {
 *           this.trigger('custom-message-checkbox-change', {
 *             isChecked: this.selected,
 *             item: this.item
 *           });
 *         }
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * @class layerUI.components.MessagesListPanel.Item
 * @mixins layerUI.mixins.ListItem
 * @extends layerUI.components.Component
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  properties: {

    /**
     * Rather than sort out `instanceof` operations, you can use `isMessageListItem` to test to see if a widget represents a Message Item.
     *
     * A Message Item only shows up in a MessageList; other places where Messages are rendered (layer-notifier, layer-conversation-last-message, etc...) are
     * NOT Message Items, and may need to keep its content more compact.
     */
    isMessageListItem: {
      value: true
    },

    // Every List Item has an item property, here it represents the Conversation to render
    item: {},

    /**
     * Deletion of this Message is enabled.
     *
     * ```
     * widget.getDeleteEnabled = function(message) {
     *    return message.sender.sessionOwner;
     * }
     * ```
     *
     * @property {Function}
     */
    getDeleteEnabled: {
      type: Function
    },

    /**
     * HTML Tag to generate for the current content
     *
     * @private
     * @property {String}
     */
    _contentTag: {
      set: function set(newTag, oldTag) {
        if (oldTag) this.removeClass(oldTag);
        if (newTag) this.addClass(newTag);
      }
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * messageItem.dateRenderer = function(date) {
     *    return date.toISOString();
     * };
     * ```
     *
     * @property {Function}
     */
    dateRenderer: {},

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * messageItem.messageStatusRenderer = function(message) {
     *    return message.readStatus === layer.Constants.RECIPIENT_STATE.ALL ? 'read' : 'processing...';
     * };
     * ```
     *
     * @property {Function}
     */
    messageStatusRenderer: {}
  },
  methods: {
    onRender: function onRender() {
      try {

        // Setup the layer-sender-name
        if (this.nodes.sender) {
          this.nodes.sender.innerHTML = this.item.sender.displayName;
        }

        if (this.nodes.avatar) {
          this.nodes.avatar.users = [this.item.sender];
        }

        // Setup the layer-date
        if (this.nodes.date) {
          if (this.dateRenderer) this.nodes.date.dateRenderer = this.dateRenderer;
          this.nodes.date.date = this.item.sentAt;
        }

        // Setup the layer-message-status
        if (this.nodes.status && this.messageStatusRenderer) this.nodes.status.messageStatusRenderer = this.messageStatusRenderer;

        // Setup the layer-delete
        if (this.nodes.delete) {
          this.nodes.delete.enabled = this.getDeleteEnabled ? this.getDeleteEnabled(this.properties.item) : true;
        }

        // Generate the renderer for this Message's MessageParts.
        this._applyContentTag();

        // Render all mutable data
        this.onRerender();
      } catch (err) {
        console.error('layer-message-item.render(): ', err);
      }
    },

    onRerender: function onRerender() {
      var readStatus = this.properties.item.readStatus;
      var deliveryStatus = this.properties.item.deliveryStatus;
      var statusPrefix = 'layer-message-status';
      this.toggleClass('layer-unread-message', !this.properties.item.isRead);
      this.toggleClass(statusPrefix + '-read-by-all', readStatus === _layerWebsdk2.default.Constants.RECIPIENT_STATE.ALL);
      this.toggleClass(statusPrefix + '-read-by-some', readStatus === _layerWebsdk2.default.Constants.RECIPIENT_STATE.SOME);
      this.toggleClass(statusPrefix + '-read-by-none', readStatus === _layerWebsdk2.default.Constants.RECIPIENT_STATE.NONE);

      this.toggleClass(statusPrefix + '-delivered-to-all', deliveryStatus === _layerWebsdk2.default.Constants.RECIPIENT_STATE.ALL);
      this.toggleClass(statusPrefix + '-delivered-to-some', deliveryStatus === _layerWebsdk2.default.Constants.RECIPIENT_STATE.SOME);
      this.toggleClass(statusPrefix + '-delivered-to-none', deliveryStatus === _layerWebsdk2.default.Constants.RECIPIENT_STATE.NONE);

      this.toggleClass(statusPrefix + '-pending', this.properties.item.isSaving());
      this.toggleClass('layer-message-preview', this.properties.item.isNew());
    },


    /**
     * The parent component sets the _contentTag property, and now its time to use it.
     *
     * Use that tagName to create a DOM Node to render the MessageParts.
     *
     * @method
     * @private
     */
    _applyContentTag: function _applyContentTag() {
      var _this = this;

      var messageHandler = document.createElement(this._contentTag);
      messageHandler.parentComponent = this;
      messageHandler.message = this.item;
      this.nodes.messageHandler = messageHandler;

      this.nodes.content.appendChild(messageHandler);
      _layerWebsdk2.default.Util.defer(function () {
        if (messageHandler.style.height) {
          _this.nodes.content.style.height = messageHandler.style.height;
        }
      });
    }
  }
};
},{"layer-websdk":66}],16:[function(require,module,exports){
'use strict';

var _component = require('../../../components/component');

var _listItem = require('../../../mixins/list-item');

var _listItem2 = _interopRequireDefault(_listItem);

var _layerMessageItemMixin = require('../layer-message-item-mixin');

var _layerMessageItemMixin2 = _interopRequireDefault(_layerMessageItemMixin);

require('../../subcomponents/layer-avatar/layer-avatar');

require('../../subcomponents/layer-date/layer-date');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-message-item-received', {
  mixins: [_listItem2.default, _layerMessageItemMixin2.default]
});

(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-message-item-received", "<div class='layer-list-item' layer-id='innerNode'><div class='layer-message-body-and-avatar'><layer-avatar layer-id='avatar' show-presence='false'></layer-avatar><div class='layer-message-item-main'><div class='layer-message-item-content' layer-id='content'></div></div></div><div class='layer-sender-info'><div class='layer-sender-name' layer-id='sender'></div><layer-date layer-id='date'></layer-date></div></div>", "");
  layerUI.buildStyle("layer-message-item-received", "layer-message-item-received {\ndisplay: flex;\nflex-direction: column;\nalign-content: stretch;\n}\nlayer-message-item-received .layer-list-item {\ndisplay: flex;\nflex-direction: column;\nalign-content: stretch;\n}\nlayer-message-item-received .layer-message-body-and-avatar {\ndisplay: flex;\nflex-direction: row;\nalign-items: flex-end;\n}\nlayer-message-item-received  .layer-message-item-main {\nflex-grow: 1;\noverflow: hidden;\n}\nlayer-message-item-received .layer-message-item-main .layer-message-item-content {\nmax-width: 90%;\n}\nlayer-message-item-received layer-message-text-plain {\ndisplay: block;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5,"../../../mixins/list-item":47,"../../subcomponents/layer-avatar/layer-avatar":19,"../../subcomponents/layer-date/layer-date":24,"../layer-message-item-mixin":15}],17:[function(require,module,exports){
'use strict';

var _component = require('../../../components/component');

var _listItem = require('../../../mixins/list-item');

var _listItem2 = _interopRequireDefault(_listItem);

var _layerMessageItemMixin = require('../layer-message-item-mixin');

var _layerMessageItemMixin2 = _interopRequireDefault(_layerMessageItemMixin);

require('../../subcomponents/layer-avatar/layer-avatar');

require('../../subcomponents/layer-delete/layer-delete');

require('../../subcomponents/layer-date/layer-date');

require('../../subcomponents/layer-message-status/layer-message-status');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-message-item-sent', {
  mixins: [_listItem2.default, _layerMessageItemMixin2.default]
});

(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-message-item-sent", "<div class='layer-list-item' layer-id='innerNode'><div class='layer-message-body-and-avatar' layer-id='messageRow'><div class='layer-message-item-main'><div class='layer-message-item-content' layer-id='content'></div></div><div class='layer-avatar-delete-panel'><layer-avatar layer-id='avatar' show-presence='false'></layer-avatar><layer-delete layer-id='delete'></layer-delete></div></div><div class='layer-sender-info layer-sender-details'><div class='layer-sender-name' layer-id='sender'></div><layer-message-status layer-id='status'></layer-message-status><layer-date layer-id='date'></layer-date></div></div>", "");
  layerUI.buildStyle("layer-message-item-sent", "layer-message-item-sent {\ndisplay: flex;\nflex-direction: column;\nalign-content: stretch;\n}\nlayer-message-item-sent img.emoji {\nmargin: 0 .05em 0 .1em;\nvertical-align: -0.1em;\n}\nlayer-message-item-sent .layer-list-item {\ndisplay: flex;\nflex-direction: column;\nalign-items: stretch;\n}\nlayer-message-item-sent .layer-message-body-and-avatar {\ndisplay: flex;\nflex-direction: row;\nalign-items: flex-end;\nflex-grow: 1;\n}\nlayer-message-item-sent .layer-message-item-main {\ntext-align: right;\nflex-grow: 1;\noverflow: hidden;\n}\nlayer-message-item-sent .layer-message-item-main .layer-message-item-content {\ndisplay: inline-block;\ntext-align: right;\nmax-width: 90%;\n}\nlayer-message-item-sent layer-message-text-plain {\ndisplay: block;\n}\nlayer-message-item-sent .layer-avatar-delete-panel {\ndisplay: flex;\nflex-direction: row;\nalign-items: center;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5,"../../../mixins/list-item":47,"../../subcomponents/layer-avatar/layer-avatar":19,"../../subcomponents/layer-date/layer-date":24,"../../subcomponents/layer-delete/layer-delete":25,"../../subcomponents/layer-message-status/layer-message-status":27,"../layer-message-item-mixin":15}],18:[function(require,module,exports){
/**
 * The Layer Message List widget renders a scrollable, pagable list of layerUI.components.MessagesListPanel.Item widgets.
 *
 * This is designed to go inside of the layerUI.Conversation widget.
 *
 * This Component has two named templates:
 *
 * * `layer-message-item-sent`: Rendering for Messages sent by the owner of this Session
 * * `layer-message-item-received`: Rendering for Messages sent by other users
 *
 * Messages are organized into sets where a set starts with the first message from a given user, and ends when either
 * a different user sends a Message, or a long enough pause occurs.  Each Message will have firstInSeries/lastInSeries properties,
 * and these need to be maintained as new Messages are loaded, deleted, etc...
 *
 * ## Advanced Customization
 *
 * To enhance the Message List widget with new properties, methods and capabilities, you have two options:
 *
 * 1. Define a custom `<layer-message-list/>` widget; this works but your now entirely responsible for all of its
 *    behaviors, and can not easily integrate fixes and enhancements added to this repo. Defining components is discussed in
 *    layerUI.components.Component.
 * 2. Enhance the provided widget with Mixins.  Details of Mixins are described in layerUI.components.Component.
 *    Below illustrates an example of a mixin for modifying this widget.
 *
 *
 * The following example adds a search bar to the Message List
 *
 * ```
 * layerUI.init({
 *   appId: 'my-app-id',
 *   layer: window.layer,
 *   mixins: {
 *     'layer-messages-list': {
 *       properties: {
 *         searchText: {
 *           value: '',
 *           set: function(value) {
 *             this.nodes.searchBar.value = value;
 *             this._runSearch();
 *           },
 *           get: function() {
 *             return this.nodes.searchBar.value;
 *           }
 *         }
 *       },
 *       methods: {
 *         // When the widget is created, setup/initialize our custom behaviors
 *         onCreate: function() {
 *           this.nodes.searchBar = document.createElement('input');
 *           this.nodes.searchBar.classList.add('custom-search-bar');
 *           this.nodes.searchBar.addEventListener('change', this._runSearch.bind(this));
 *           this.insertBefore(this.nodes.searchBar, this.firstChild);
 *         },
 *
 *
 *         // Whenver any messages are added/removed/changed, rerun our search
 *         onRerender: function() {
 *           if (this.searchText) this._runSearch();
 *         },
 *
 *         // Search is run whenver the user changes the search text, app changes the search text,
 *         // or new messages arrive that need to be searched
 *         _runSearch() {
 *           var searchText = this.searchText;
 *           Array.prototype.slice.call(this.childNodes).forEach(function(messageItem) {
 *             if (messageItem._isListItem) {
 *               var message = messageItem.item;
 *               if (message.parts[0].body.indexOf(searchText) === -1) {
 *                 messageItem.classList.remove('search-matches');
 *               } else {
 *                 messageItem.classList.add('search-matches');
 *               }
 *             }
 *           });
 *         }
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * @class layerUI.components.MessagesListPanel.List
 * @extends layerUI.components.Component
 *
 * @mixin layerUI.mixins.EmptyList
 * @mixin layerUI.mixins.List
 * @mixin layerUI.mixins.ListLoadIndicator
 * @mixin layerUI.mixins.QueryEndIndicator
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

var _base = require('../../../base');

var _base2 = _interopRequireDefault(_base);

var _component = require('../../../components/component');

var _list = require('../../../mixins/list');

var _list2 = _interopRequireDefault(_list);

var _hasQuery = require('../../../mixins/has-query');

var _hasQuery2 = _interopRequireDefault(_hasQuery);

var _emptyList = require('../../../mixins/empty-list');

var _emptyList2 = _interopRequireDefault(_emptyList);

var _listLoadIndicator = require('../../../mixins/list-load-indicator');

var _listLoadIndicator2 = _interopRequireDefault(_listLoadIndicator);

var _queryEndIndicator = require('../../../mixins/query-end-indicator');

var _queryEndIndicator2 = _interopRequireDefault(_queryEndIndicator);

require('../layer-message-item-sent/layer-message-item-sent');

require('../layer-message-item-received/layer-message-item-received');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mandatory delay between loading one page and the next.  If user is scrolling too fast, they'll have to wait at least (2) seconds.

var PAGING_DELAY = 2000;

(0, _component.registerComponent)('layer-messages-list', {
  mixins: [_list2.default, _hasQuery2.default, _emptyList2.default, _listLoadIndicator2.default, _queryEndIndicator2.default],
  properties: {

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * messageListPanel.dateRenderer = function(message) {
     *    var date = message.sentAt;
     *    return date.toISOString();
     * };
     * ```
     *
     * @property {Function} [dateRenderer=null]
     */
    dateRenderer: {},

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * messageList.messageStatusRenderer = function(message) {
     *    return message.readStatus === layer.Constants.RECIPIENT_STATE.ALL ? 'read' : 'processing...';
     * };
     * ```
     *
     * @property {Function} [messageStatusRenderer=null]
     */
    messageStatusRenderer: {},

    /**
     * Deletion of this Message is enabled.
     *
     * ```
     * widget.getMessageDeleteEnabled = function(message) {
     *    return message.sender.sessionOwner;
     * }
     * ```
     *
     * @property {Function}
     */
    getMessageDeleteEnabled: {},

    /**
     * Disable read receipts and other behaviors; typically used when the widget has been hidden from view.
     *
     * ```
     * widget.disable = true;
     * ```
     *
     * @property {Boolean}
     */
    disable: {
      set: function set(value) {
        if (!value) {
          this.properties.stuckToBottom = true;
          this.scrollTo(this.scrollHeight - this.clientHeight);
          this._checkVisibility();
        }
      }
    },

    /**
     * If the user scrolls within this many screen-fulls of the top of the list, page the Query.
     *
     * If value is 0, will page once the user reaches the top.  If the value is 0.5, will page once the user
     * reaches a `scrollTop` of 1/2 `clientHeight`.
     *
     * @property {Number} [screenFullsBeforePaging=2.0]
     */
    screenFullsBeforePaging: {
      value: 2.0
    }
  },
  methods: {

    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate: function onCreate() {
      if (!this.id) this.id = _layerWebsdk2.default.Util.generateUUID();

      // Init some local props
      this.properties.lastPagedAt = 0;
      this.properties.isSelfScrolling = false;
      this.properties.stuckToBottom = true;
      this.properties._checkVisibilityBound = this._checkVisibility.bind(this);

      window.addEventListener('focus', this.properties._checkVisibilityBound);
    },


    /**
     * Cleanup all pointers to self created by registering event handlers.
     *
     * @method onDestroy
     * @private
     */
    onDestroy: function onDestroy() {
      window.removeEventListener('focus', this.properties._checkVisibilityBound);
    },


    /**
     * Tests to see if we should load a new page of data.
     *
     * 1. Tests scrollTop to see if we are close enough to the top
     * 2. Tests if we are already loading that page of data
     *
     * @method _shouldPage
     * @return {Boolean}
     * @private
     */
    _shouldPage: function _shouldPage() {
      var pagingHeight = Math.max(this.clientHeight, 300) * this.screenFullsBeforePaging;
      return this.scrollTop <= pagingHeight && this.scrollHeight > this.clientHeight + 1 && !this.isDataLoading;
    },


    /**
     * Handler is called whenever the list is scrolled.
     *
     * Scrolling is caused by user activity, OR by setting the `scrollTop`.
     * Typically, we want to stay `stuckToButton` so that any time new Messages arrive,
     * we scroll to the bottom to see them.  Any user scrolling however may disable that behavior.
     *
     * @method _handleScroll
     * @private
     */
    _handleScroll: {
      mode: _component.registerComponent.MODES.OVERWRITE,
      value: function value() {
        var _this = this;

        if (this.properties.isSelfScrolling) return;

        // If the user has scrolled within screenFullsBeforePaging of the top of the page... and if the page has enough contents to actually
        // be scrollable, page the Messages.
        if (this._shouldPage() && !this.properties.delayedPagingTimeout) {
          if (this.properties.lastPagedAt + PAGING_DELAY < Date.now()) {
            if (!this.query.isFiring) {
              this.query.update({ paginationWindow: this.query.paginationWindow + 50 });
              this.isDataLoading = this.properties.query.isFiring;
            }
          } else if (!this.properties.delayedPagingTimeout) {
            // User is scrolling kind of fast, lets slow things down a little
            this.properties.delayedPagingTimeout = setTimeout(function () {
              _this.query.update({ paginationWindow: _this.query.paginationWindow + 50 });
              _this.isDataLoading = _this.properties.query.isFiring;
              _this.properties.delayedPagingTimeout = 0;
            }, 500);
          }
        }

        // If we have scrolled to the bottom, set stuckToBottom to true, else false.
        var stuckToBottom = this.scrollHeight - 10 <= this.clientHeight + this.scrollTop;
        if (stuckToBottom !== this.properties.stuckToBottom) {
          this.properties.stuckToBottom = stuckToBottom;
        }

        // Trigger checks on visibility to update read state
        this._checkVisibility();
      }
    },

    /**
     * Scroll the list to the specified Y position in pixels.
     *
     * Will call _checkVisibility() when done.
     *
     * ```
     * widget.scrollTo(500);
     * ```
     *
     * @method scrollTo
     * @param {Number} position
     */
    scrollTo: {
      mode: _component.registerComponent.MODES.OVERWRITE,
      value: function value(position, callback) {
        var _this2 = this;

        if (position === this.scrollTop) return;
        this.properties.isSelfScrolling = true;
        this.scrollTop = position;
        setTimeout(function () {
          _this2.properties.isSelfScrolling = false;
          _this2._checkVisibility();
          if (callback) callback();
        }, 200);
      }
    },

    /**
     * Scrolls the list to the specified Y position.
     *
     * Will call _checkVisibility() when done.
     *
     * ```
     * widget.animatedScrollTo(500);
     * ```
     *
     * @method animatedScrollTo
     * @param {Number} [animateSpeed=200]   Number of miliseconds of animated scrolling; 0 for no animation
     * @param {Function} [animateCallback] Function to call when animation completes
     */
    animatedScrollTo: {
      mode: _component.registerComponent.MODES.OVERWRITE,
      value: function value(position) {
        var _this3 = this;

        var animateSpeed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;
        var animateCallback = arguments[2];

        if (position === this.scrollTop) return;
        this.properties.isSelfScrolling = true;
        if (this.properties.cancelAnimatedScroll) this.properties.cancelAnimatedScroll();
        var cancelAnim = this.properties.cancelAnimatedScroll = _base2.default.animatedScrollTo(this, position, animateSpeed, function () {
          clearTimeout(cancelFallbackTimeoutId);

          // Wait for any onScroll events to trigger before we clear isSelfScrolling and procede
          setTimeout(function () {
            if (cancelAnim !== _this3.properties.cancelAnimatedScroll) return;
            _this3.properties.cancelAnimatedScroll = null;

            _this3.properties.isSelfScrolling = false;
            _this3._checkVisibility();
            if (animateCallback) animateCallback();
          }, 100);
        });

        // Some environments are failing to process the animated scroll some of the time.
        // Add a fallback to force the issue should the scroll fail to have occurred
        var cancelFallbackTimeoutId = setTimeout(function () {
          if (_this3.properties.cancelAnimatedScroll) _this3.properties.cancelAnimatedScroll();
          _this3.properties.cancelAnimatedScroll = null;
          _this3.scrollTo(position, animateCallback);
        }, animateSpeed + 20);
      }
    },

    /**
     * Check which Messages are fully visible, and mark them as Read.
     *
     * TODO PERFORMANCE: Should be able to skip to the visible items and near-visible items without iterating over entire list
     *
     * NOTE: Only mark messages as read if the document has focus.  Just being visible but not in focus does not give us
     * sufficient cause to assume the user has read it.
     *
     * TODO: At some point we may need to customize whether document.hasFocus() is required; in particular, this could cause problems for anyone
     * running in an iFrame.  Is top.document.hasFocus() a suitable solution, or are there scenarios where top might not even be accessable due to
     * being a different domain?
     *
     * @method
     * @private
     */
    _checkVisibility: function _checkVisibility() {
      var _this4 = this;

      if (_base2.default.isInBackground() || this.disable) return;

      // The top that we can see is marked by how far we have scrolled.
      var visibleTop = this.scrollTop;

      // The bottom that we can see is marked by how far we have scrolled plus the height of the panel.
      var visibleBottom = this.scrollTop + this.clientHeight;
      var children = Array.prototype.slice.call(this.childNodes);
      children.forEach(function (child) {
        var childOffset = child.offsetTop - _this4.offsetTop;
        if (childOffset >= visibleTop && childOffset + child.clientHeight <= visibleBottom) {
          if (child.properties && child.properties.item && !child.properties.item.isRead) {
            // TODO: Use a scheduler rather than many setTimeout calls
            setTimeout(function () {
              return _this4._markAsRead(child);
            }, _base2.default.settings.markReadDelay);
          }
        }
      }, this);
    },


    /**
     * Mark a the Message associated with this item as read.
     *
     * This method validates that the Message flagged as ready to be read by `_checkVisibility()` is
     * in fact still fully visible after the delay.
     *
     * @method _markAsRead
     * @private
     * @param {layerUI.components.MessagesListPanel.Item} child
     */
    _markAsRead: function _markAsRead(child) {
      if (_base2.default.isInBackground() || this.disable) return;

      var visibleTop = this.scrollTop;
      var visibleBottom = this.scrollTop + this.clientHeight;
      var childOffset = child.offsetTop - this.offsetTop;
      if (childOffset >= visibleTop && childOffset + child.clientHeight <= visibleBottom) {
        child.properties.item.isRead = true;
      }
    },


    /**
     * Append a Message to the document fragment, updating the previous messages' lastInSeries property as needed.
     *
     * @method _generateItem
     * @private
     */
    _generateItem: function _generateItem(message) {
      var handler = _base2.default.getHandler(message, this);
      if (handler) {
        var messageWidget = document.createElement(message.sender.sessionOwner ? 'layer-message-item-sent' : 'layer-message-item-received');
        messageWidget.id = this._getItemId(message.id);
        messageWidget.dateRenderer = this.dateRenderer;
        messageWidget.messageStatusRenderer = this.messageStatusRenderer;
        messageWidget.getDeleteEnabled = this.getMessageDeleteEnabled;
        messageWidget._contentTag = handler.tagName;
        messageWidget.item = message;
        return messageWidget;
      } else {
        return null;
      }
    },


    /**
     * Are the two Messages in the same Group?
     *
     * See LayerUI.settings.messageGroupTimeSpan to adjust the definition of Same Group.
     *
     * @method _inSameGroup
     * @private
     * @param {Layer.Core.Message} m1
     * @param {Layer.Core.Message} m2
     */
    _inSameGroup: function _inSameGroup(m1, m2) {
      if (!m1 || !m2) return false;
      var diff = Math.abs(m1.sentAt.getTime() - m2.sentAt.getTime());
      return m1.sender === m2.sender && diff < _base2.default.settings.messageGroupTimeSpan;
    },


    /**
     * Whenever new message items are added to the list, we need to assign lastInSeries and firstInSeries values to them,
     * as well as update those values in nearby message items.
     *
     * @method _processAffectedWidgetsCustom
     * @private
     * @param {layerUI.components.MessagesListPanel.Item[]} widgets
     */
    _processAffectedWidgetsCustom: function _processAffectedWidgetsCustom(widgets, firstIndex, isTopItemNew) {
      if (widgets.length === 0) return;
      if (isTopItemNew) widgets[0].firstInSeries = true;
      for (var i = 1; i < widgets.length; i++) {
        var sameGroup = this._inSameGroup(widgets[i - 1].item, widgets[i].item);
        widgets[i].firstInSeries = !sameGroup;
        widgets[i - 1].lastInSeries = !sameGroup;
      }
      if (!widgets[widgets.length - 1].nextSibling) widgets[widgets.length - 1].lastInSeries = true;
    },


    _renderResetData: {
      mode: _component.registerComponent.MODES.AFTER,
      value: function _renderResetData(evt) {
        this.properties.stuckToBottom = true;
        this.properties.lastPagedAt = 0;
        this.properties.isSelfScrolling = false;
      }
    },

    _renderWithoutRemovedData: {
      mode: _component.registerComponent.MODES.OVERWRITE,
      value: function value(evt) {
        this.properties.listData = [].concat(this.properties.query.data).reverse();

        var messageWidget = this.querySelector('#' + this._getItemId(evt.target.id));
        if (messageWidget) this.removeChild(messageWidget);

        var removeIndex = this.properties.listData.length - evt.index; // Inverted for reverse order
        var affectedItems = this.properties.listData.slice(Math.max(0, removeIndex - 3), removeIndex + 3);
        this._gatherAndProcessAffectedItems(affectedItems, false);
      }
    },

    _renderInsertedData: {
      mode: _component.registerComponent.MODES.OVERWRITE,
      value: function value(evt) {
        var _this5 = this;

        if (this.properties.appendingMore) {
          if (!this.properties.insertEvents) this.properties.insertEvents = [];
          this.properties.insertEvents.push(evt);
          return;
        }
        var oldListData = this.properties.listData;
        this.properties.listData = [].concat(this.properties.query.data).reverse();

        var insertIndex = oldListData.length - evt.index; // Inverted for reverse order
        var isTopItemNew = insertIndex === 0;

        var affectedItems = this.properties.listData.slice(Math.max(0, insertIndex - 3), insertIndex + 4);
        var fragment = this._generateFragment([evt.target]);
        if (insertIndex < oldListData.length) {
          var insertBeforeNode = affectedItems.length > 1 ? this.querySelector('#' + this._getItemId(oldListData[insertIndex].id)) : null;
          this.insertBefore(fragment, insertBeforeNode);
        } else {
          this.appendChild(fragment);
        }
        this._gatherAndProcessAffectedItems(affectedItems, isTopItemNew);
        this._updateLastMessageSent();
        if (this.properties.stuckToBottom) {
          setTimeout(function () {
            return _this5.animatedScrollTo(_this5.scrollHeight - _this5.clientHeight);
          }, 0);
        } else {
          this._checkVisibility();
        }
        if (!evt.inRender) this.onRerender();
      }
    },

    /**
     * The last message sent by the session owner should show some pending/read-by/etc... status.
     *
     * Other messages may also do this, but adding the `layer-last-message-sent` css class makes it easy
     * to conditionally show status only for the last sent message.
     *
     * TODO: Review if a CSS :last-child could isolate last message sent from last message received, and be used for easily styling this.
     *
     * @method _updateLastMessageSent
     * @private
     */
    _updateLastMessageSent: function _updateLastMessageSent() {
      for (var i = this.properties.listData.length - 1; i >= 0; i--) {
        if (this.properties.listData[i].sender.sessionOwner) {
          var item = this.querySelector('#' + this._getItemId(this.properties.listData[i].id));
          if (item && !item.classList.contains('layer-last-message-sent')) {
            this.querySelectorAllArray('.layer-last-message-sent').forEach(function (node) {
              node.classList.remove('layer-last-message-sent');
            });
            item.classList.add('layer-last-message-sent');
          }
          break;
        }
      }
    },


    /**
     * Identify the message-item that is fully visible and at the top of the viewport.
     *
     * We use this before paging in new data so that we know which message should still
     * be at the top after we insert new messages at the top, and must compensate our `scrollTop`
     * accordingly.
     *
     * @method _findFirstVisibleItem
     * @private
     */
    _findFirstVisibleItem: function _findFirstVisibleItem() {
      var visibleTop = this.scrollTop;
      var visibleBottom = this.scrollTop + this.clientHeight;
      var children = Array.prototype.slice.call(this.childNodes);
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var childOffset = child.offsetTop - this.offsetTop;
        if (childOffset >= visibleTop && childOffset + child.clientHeight <= visibleBottom) {
          if (child.properties && child.properties.item) {
            return child;
          }
        }
      }
      return null;
    },


    /**
     * Render a new page of data received from the Query.
     *
     * @method _renderPagedData
     * @private
     */
    _renderPagedData: {
      mode: _component.registerComponent.MODES.OVERWRITE,
      value: function value(evt) {
        if (evt.data.length === 0) {
          this.isDataLoading = this.properties.query.isFiring;
          return;
        }

        // Set this so that if the user is clinging to the scrollbar forcing it to stay at the top,
        // we know we just paged and won't page again.
        this.properties.lastPagedAt = Date.now();

        // Get both the query data and the event data
        var oldListData = this.properties.listData;
        this.properties.listData = [].concat(this.properties.query.data).reverse();
        var newData = [].concat(evt.data).reverse();

        // Get the affected items
        var affectedItems = [].concat(newData);
        var fragment = void 0;
        if (oldListData.length) affectedItems = affectedItems.concat(oldListData.slice(0, 3));

        // Append only a few items at a time, with pauses to keep browser running smoothly.
        // Don't append anything to the document until its all generated
        // TODO: This sucks.  For 100 items, it takes 5 iterates of 20ms each, so it adds 100ms lag to render,
        // and the only good news is that this 100ms lag results in performance of the rest of the browser not degrading.
        var appendMore = function appendMore() {
          var _this6 = this;

          if (!this.query || this.query.isDestroyed) return;
          this.properties.appendingMore = true;
          var processItems = newData.splice(0, 20).filter(function (item) {
            return !item.isDestroyed;
          });
          fragment = this._generateFragment(processItems, fragment);
          if (newData.length) {
            setTimeout(function () {
              return appendMore.call(_this6);
            }, 20);
          } else {
            this.properties.appendingMore = false;
            _layerWebsdk2.default.Util.defer(function () {
              return _this6._renderPagedDataDone(affectedItems, fragment, evt);
            });
          }
        }.bind(this);
        appendMore();
      }
    },

    /**
     * After we have rendered the newly paged in messages, some post processing is needed.
     *
     * 1. Call processAffectedWidgets
     * 2. Scroll to maintain an appropriate position
     * 3. Insert the document fragment into our widget
     * 4. Check visibility on newly rendered items
     *
     * @method _renderPagedDataDone
     * @private
     */
    _renderPagedDataDone: function _renderPagedDataDone(affectedItems, fragment, evt) {
      var _this7 = this;

      // Find the nodes of all affected items in both the document and the fragment,
      // and call processAffectedWidgets on them
      if (affectedItems.length) {
        var affectedWidgetsQuery = '#' + affectedItems.map(function (message) {
          return _this7._getItemId(message.id);
        }).join(', #');
        var affectedWidgets = this.querySelectorAllArray(affectedWidgetsQuery);
        if (fragment) {
          var fragmentWidgets = Array.prototype.slice.call(fragment.querySelectorAll(affectedWidgetsQuery));
          affectedWidgets = fragmentWidgets.concat(affectedWidgets);
        }
        try {
          // When paging new data, top item should always be new
          this._processAffectedWidgets(affectedWidgets, true);
        } catch (e) {
          console.error(e);
        }
      }

      var firstVisibleItem = this._findFirstVisibleItem();
      var initialOffset = firstVisibleItem ? firstVisibleItem.offsetTop - this.offsetTop - this.scrollTop : 0;

      // Now that DOM manipulation is completed,
      // we can add the document fragments to the page
      var nextItem = this.nodes.listHeader.nextSibling;
      this.insertBefore(fragment, nextItem);

      // TODO PERFORMANCE: We should not need to do this as we page UP; very wasteful
      this._updateLastMessageSent();

      this.isDataLoading = this.properties.query.isFiring;
      this._checkVisibility();
      if (!evt.inRender) this.onRerender();

      if (this.properties.insertEvents) this.properties.insertEvents.forEach(function (anEvt) {
        return _this7._renderInsertedData(anEvt);
      });
      delete this.properties.insertEvents;

      _layerWebsdk2.default.Util.defer(function () {
        if (_this7.properties.stuckToBottom) {
          _this7.scrollTo(_this7.scrollHeight - _this7.clientHeight);
        } else if (firstVisibleItem && evt.type === 'data' && evt.data.length !== 0) {
          _this7.scrollTo(firstVisibleItem.offsetTop - _this7.offsetTop - initialOffset);
        }
      });
    }
  }
});

(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-messages-list", "<div class='layer-list-header' layer-id='listHeader'><div class='layer-empty-list' layer-id='emptyNode'></div><div class='layer-header-toggle'><div class='layer-end-of-results-indicator' layer-id='endOfResultsNode'>This is the beginning of your conversation</div><div class='layer-load-indicator' layer-id='loadIndicator'>Loading messages...</div></div></div>", "");
  layerUI.buildStyle("layer-messages-list", "layer-messages-list {\ndisplay: block;\nflex-grow: 1;\nheight: 100px; \npadding-bottom: 15px;\noverflow-y: scroll; \n-webkit-overflow-scrolling: touch;\n}\nlayer-messages-list .layer-header-toggle {\nmin-height: 20px;\nmargin-bottom: 2px;\n}\nlayer-messages-list .layer-load-indicator, layer-messages-list .layer-end-of-results-indicator {\ntext-align: center;\ndisplay: none;\n}\nlayer-messages-list.layer-loading-data .layer-load-indicator,\nlayer-messages-list.layer-end-of-results .layer-end-of-results-indicator {\ndisplay: block;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5,"../../../mixins/empty-list":43,"../../../mixins/has-query":45,"../../../mixins/list":50,"../../../mixins/list-load-indicator":48,"../../../mixins/query-end-indicator":53,"../layer-message-item-received/layer-message-item-received":16,"../layer-message-item-sent/layer-message-item-sent":17,"layer-websdk":66}],19:[function(require,module,exports){
/**
 * The Layer Avatar widget renders an icon representing a user or users.
 *
 * This widget appears within
 *
 * * layerUI.components.MessagesListPanel.Item: Represents the sender of a Message
 * * layerUI.components.ConversationsListPanel.Item.Conversation: Represents the participants of a Conversation
 * * layerUI.components.IdentitiesListPanel.Item: Represents a user in a User List
 *
 * Rendering is done using data from the `layer.Identity` object for each user, using the layer.Identity.avatarUrl if available to
 * add an image, or first initials from layer.Identity.firstName, layer.Identity.lastName if no avatarUrl is available.
 * layer.Identity.displayName is used as a fallback.
 *
 * The simplest way to customize this widget is to replace it with your own implementation of the `<layer-avatar />` tag.
 *
 * ```javascript
 * layerUI.registerComponent('layer-avatar', {
 *    properties: {
 *      users: {
 *        set: function(value) {
 *           this.render();
 *        }
 *      }
 *    },
 *    methods: {
 *      render: function() {
 *        this.innerHTML = 'All Hail ' + this.properties.users[0].displayName;
 *      }
 *    }
 * });
 *
 * // Call init after custom components are defined
 * layerUI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * Note that the main parameter is a `users` array, not a single user:
 *
 * * When used in a Messages List or Identities List, there will be only one user in the list
 * * When used in a Conversations List, there may be multiple users who are participants of the Conversation.
 *
 * @class layerUI.components.subcomponents.Avatar
 * @extends layerUI.components.Component
 */
'use strict';

var _component = require('../../../components/component');

require('../layer-presence/layer-presence');


(0, _component.registerComponent)('layer-avatar', {
  properties: {

    /**
     * Array of users to be represented by this Avatar.
     *
     * Typically this only has one user represented with a layer.Identity.
     *
     * @property {layer.Identity[]} [users=[]}
     */
    users: {
      set: function set(newValue, oldValue) {
        if (oldValue && newValue && newValue.length === oldValue.length) {
          var matches = newValue.filter(function (identity) {
            return oldValue.indexOf(identity) !== -1;
          });
          if (matches !== newValue.length) return;
        }
        if (!newValue) newValue = [];
        if (!Array.isArray(newValue)) newValue = [newValue];
        // classList.toggle doesn't work right in IE 11
        this.classList[newValue.length ? 'add' : 'remove']('layer-has-user');
        this.onRender();
      }
    },

    showPresence: {
      value: true,
      type: Boolean
    }
  },
  methods: {
    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate: function onCreate() {
      this.properties.users = [];
    },


    /**
     * Render the users represented by this widget.
     *
     * @method
     * @private
     */
    onRender: function onRender() {
      // Clear the innerHTML if we have rendered something before
      if (this.users.length) {
        this.innerHTML = '';
      }

      // Render each user
      this.users.forEach(this._renderUser.bind(this));

      // Add the "cluster" css if rendering multiple users
      // No classList.toggle due to poor IE11 support
      this.classList[this.users.length > 1 ? 'add' : 'remove']('layer-avatar-cluster');
      if (this.users.length === 1 && this.showPresence && this.users[0].getClient().isPresenceEnabled) {
        this.nodes.presence = document.createElement('layer-presence');
        this.nodes.presence.item = this.users[0];
        this.appendChild(this.nodes.presence);
      }
    },


    /**
     * Render each individual user.
     *
     * @method
     * @private
     */
    _renderUser: function _renderUser(user) {
      if (user.avatarUrl) {
        var img = document.createElement('img');
        img.onerror = function () {
          img.style.display = 'none';
        };
        img.src = user.avatarUrl;
        this.appendChild(img);
      } else {
        var span = document.createElement('span');

        // Use first and last name if provided
        if (user.firstName && user.lastName) {
          span.innerHTML = user.firstName.substring(0, 1).toUpperCase() + user.lastName.substring(0, 1).toUpperCase();
        }

        // Use displayName to try and find a first and last name
        else if (user.displayName.indexOf(' ') !== -1) {
            span.innerHTML = user.displayName.substr(0, 1).toUpperCase() + user.displayName.substr(user.displayName.indexOf(' ') + 1, 1).toUpperCase();
          }

          // If all else fails, use the first two letters
          else {
              span.innerHTML = user.displayName.substring(0, 2).toUpperCase();
            }
        this.appendChild(span);
      }
    }
  }
});

(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-avatar", "", "");
  layerUI.buildStyle("layer-avatar", "layer-avatar {\ndisplay: block;\n}\nlayer-avatar layer-presence {\nposition: absolute;\nbottom: 0px;\nright: 0px;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5,"../layer-presence/layer-presence":28}],20:[function(require,module,exports){
/**
 * Provides a Button Panel for adding custom actions to the layerUI.Composer panel.
 *
 * You can populate this button panel using the layerUI.components.ConversationPanel.composeButtons property.
 *
 * Alternatively, you can replace this by defining a custom `layer-compose-button-panel` to make the resulting component entirely yours:
 *
 * ```
 * document.registerElement('layer-compose-button-panel', {
 *   prototype: Object.create(HTMLElement.prototype, {
 *     createdCallback: {
 *       value: function() {
 *         this.innerHTML = "<button>Click me!</button>";
 *       }
 *     }
 *   })
 * });
 *
 * // Call init after custom components are defined
 * layerUI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * @class layerUI.components.subcomponents.ComposeButtonPanel
 * @extends layerUI.components.Component
 */
'use strict';

var _component = require('../../../components/component');

(0, _component.registerComponent)('layer-compose-button-panel', {
  properties: {
    /**
     * Custom buttons to put in the panel.
     *
     * @property {HTMLElement[]} [buttons=[]]
     */
    buttons: {
      value: [],
      set: function set(value) {
        this.classList[value && value.length ? 'remove' : 'add']('is-empty');
        this.onRender();
      }
    }
  },
  methods: {
    /**
     * Render any custom buttons provided via the `buttons` property.
     *
     * @method
     * @private
     */
    onRender: function onRender() {
      this.innerHTML = '';
      if (this.buttons.length) {
        var fragment = document.createDocumentFragment();
        this.buttons.forEach(function (button) {
          return fragment.appendChild(button);
        });
        this.appendChild(fragment);
      }
    }
  }
});


(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-compose-button-panel", "", "");
  layerUI.buildStyle("layer-compose-button-panel", "layer-compose-button-panel.is-empty {\ndisplay: none;\n}\nlayer-compose-button-panel {\ndisplay: flex;\nflex-direction: row;\nalign-items: stretch;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5}],21:[function(require,module,exports){
/**
 * The Layer Composer widget provides the textarea for layerUI.components.ConversationPanel.
 *
 * It provides a self-resizing text area that resizes to the size of the entered text, and sends typing indicators as the user types.
 *
 * Special behaviors to know about:
 *
 * * CSS Class `layer-composer-one-line-of-text`: If there is only a single line's worth of text, then this CSS class is applied to
 *   help center the text
 * * Event `layer-file-selected`: This widget listens for this event, and if it receives it, uses that event to retrieve a file to send in
 *   the Conversation.  Event comes from layerUI.components.subcomponents.FileUploadButton or from your custom widgets.
 * * Keyboard Handling: ENTER: Sends message unless its accompanied by a modifier key.  TAB: Enters a \t character unless you
 *   set `layerUI.settings.disableTabAsWhiteSpace` to true
 *
 * @class layerUI.components.subcomponents.Composer
 * @extends layerUI.components.Component
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

var _base = require('../../../base');

var _base2 = _interopRequireDefault(_base);

var _component = require('../../../components/component');

require('../layer-compose-button-panel/layer-compose-button-panel');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


var ENTER = 13;
var TAB = 9;

(0, _component.registerComponent)('layer-composer', {
  properties: {

    /**
     * Specify which Conversation we are sending messages and typing indicators to.
     *
     * @property {Layer.Core.Conversation} [conversation=null]
     */
    conversation: {
      set: function set(value) {
        if (value) this.client = value.getClient();
        this._setTypingListenerConversation();
      }
    },

    /**
     * The Client are we using to communicate.
     *
     * @property {Layer.Core.Client} [client=null]
     */
    client: {
      set: function set(value) {
        if (!this.nodes.input) console.error('NO INPUT FOR COMPOSER');
        if (value) {
          this.properties.typingListener = this.properties.client.createTypingListener(this.nodes.input);
          this._setTypingListenerConversation();
        }
      }
    },

    /**
     * Custom buttons to put in the panel, on the right side.
     *
     * @property {HTMLElement[]} [buttons=[]]
     */
    buttons: {
      set: function set(value) {
        this.nodes.buttonPanel.buttons = value;
      }
    },

    /**
     * Custom buttons to put in the panel, on the left side.
     *
     * @property {HTMLElement[]} [buttonsLeft=[]]
     */
    buttonsLeft: {
      set: function set(value) {
        this.nodes.buttonPanelLeft.buttons = value;
      }
    },

    /**
     * The text shown in the editor; this is the editor's value.
     *
     * @property {String} [value='']
     */
    value: {
      set: function set(value) {
        var oldValue = this.nodes.input.value;
        this.nodes.input.value = value;
        this.onRender();
        this._triggerChange(value, oldValue);
      },
      get: function get() {
        return this.nodes.input.value;
      }
    },
    /**
     * The text shown in the editor; this is the editor's placeholder.
     *
     * @property {String} [placeholder='']
     */
    placeholder: {
      set: function set(value) {
        this.nodes.input.placeholder = value;
        this.onRender();
      },
      get: function get() {
        return this.nodes.input.placeholder;
      }
    }
  },
  methods: {
    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate: function onCreate() {
      this.classList.add('layer-composer-one-line-of-text');
      this.properties.buttons = [];

      // Setting this in the template causes errors in IE 11.
      this.nodes.input.placeholder = 'Enter a message';
      this.nodes.input.addEventListener('keydown', this._onKeyDown.bind(this));
      this.nodes.input.addEventListener('input', this._onInput.bind(this));

      // Event handlers
      this.addEventListener('layer-file-selected', this._handleAttachments.bind(this));
      this.addEventListener('layer-send-click', this.send.bind(this, null));
    },


    /**
     * Whenever the value changes, trigger a `layer-composer-change-value` event.
     *
     * @method
     * @private
     * @param {String} value      The current value
     * @param {String} oldValue   The prior value
     */
    _triggerChange: function _triggerChange(value, oldValue) {
      if (value === oldValue) return;
      this.properties.value = value;

      /**
       * This event is triggered whenever the composer value changes.
       *
       * This is not a cancelable event.
       *
       * ```javascript
       * document.body.addEventListener('layer-composer-change-value', function(evt) {
       *   this.setState({composerValue: evt.detail.value});
       * }
       * ```
       *
       * @event layer-composer-change-value
       * @param {Event} evt
       * @param {Object} evt.detail
       * @param {String} evt.detail.value
       * @param {String} evt.detail.oldValue
       */
      this.trigger('layer-composer-change-value', { value: value, oldValue: oldValue });
    },


    /**
     * Focus on the textarea so keyboard actions enter text into it.
     *
     * @method
     */
    focus: function focus() {
      this.nodes.input.focus();
    },


    /**
     * Update the Typing Listener's `conversation` property so that it reports typing activity
     * to the correct Conversation.
     *
     * @method
     * @private
     */
    _setTypingListenerConversation: function _setTypingListenerConversation() {
      this.properties.typingListener.setConversation(this.conversation);
    },


    /**
     * Send the Message that the user has typed in.
     *
     * This is called automatically when the user hits `ENTER`.
     *
     * This can also be called directly:
     *
     * ```
     * widget.send(); // send the current text in the textarea
     * ```
     *
     * ```
     * widget.send(parts); // send custom message parts but NOT the text in the textarea
     * ```
     *
     * @method
     * @param {Layer.Core.MessagePart[]} optionalParts
     */
    send: function send(optionalParts) {

      var parts = [];
      if (optionalParts) {
        parts = optionalParts;
      } else if (this.nodes.input.value) {
        parts.push(new _layerWebsdk2.default.MessagePart({
          type: 'text/plain',
          body: this.nodes.input.value
        }));
        this.nodes.input.value = '';
        this._onInput();
      }

      if (parts.length === 0) return;

      var message = this.conversation ? this.conversation.createMessage({ parts: parts }) : null;

      /**
       * This event is triggered before any Message is sent; used to control notifications and override sending.
       *
       * You can use this event to control the notifications by modifying the `evt.detail.notification` object.
       * Note that you should modify the object but not try to replace the object.
       *
       * ```javascript
       * document.body.addEventListener('layer-send-message', function(evt) {
       *   var message = evt.detail.item;
       *   var notification = evt.detail.notification;
       *   notification.title = 'You have a new Message from ' + message.sender.displayName;
       *   notification.sound = 'sneeze.aiff';
       *   if (message.parts[0].mimeType === 'text/plain') {
       *     notification.text = evt.detail.item.parts[0].body;
       *   } else {
       *     notification.text = 'You have received a file';
       *   }
       * }
       * ```
       *
       * You can also use this event to provide your own logic for sending the Message.
       *
       * ```javascript
       * document.body.addEventListener('layer-send-message', function(evt) {
       *   var message = evt.detail.item;
       *   evt.preventDefault();
       *   myAsyncLookup(function(result) {
       *     var part = new Layer.Core.MessagePart({
       *       mimeType: 'application/json',
       *       body: result
       *     });
       *     message.addPart(part);
       *     message.send();
       *   });
       * });
       * ```
       *
       * @event layer-send-message
       * @param {Event} evt
       * @param {Object} evt.detail
       * @param {Layer.Core.MessagePart[]} evt.detail.parts   The array of message parts that will be sent
       * @param {Layer.Core.Message} evt.detail.item          The message that was created from the parts; null if no Conversation property is set
       * @param {Layer.Core.Conversation} evt.detail.conversation  The conversation that the message was created on; may be null if no conversation has been set.
       * @param {Object} evt.detail.notification
       * @param {String} evt.detail.notification.text
       * @param {String} evt.detail.notification.title
       * @param {String} evt.detail.notification.sound
       */
      var textPart = parts.filter(function (part) {
        return part.mimeType === 'text/plain';
      })[0];
      var notification = {
        text: textPart ? textPart.body : 'File received',
        title: 'New Message from ' + this.client.user.displayName
      };

      if (this.trigger('layer-send-message', {
        parts: parts,
        notification: notification,
        item: message,
        conversation: this.conversation
      })) {
        if (!this.conversation) {
          console.error('Unable to send message without a conversationId');
        } else if (this.conversation instanceof _layerWebsdk2.default.Channel) {
          this.onSend(message);
          message.send();
        } else {
          this.onSend(message, notification);
          message.send(notification);
        }
      }
    },


    /**
     * MIXIN HOOK: Called just before sending a message.
     *
     * @method
     * @param {Layer.Core.Message} message
     * @param {Object} notification   See Layer.Core.Message.send for details on the notification object
     */
    onSend: function onSend(message, notification) {
      // No-op
    },


    /**
     * On ENTER call `send()`; on TAB enter some spacing rather than leaving the text area.
     *
     * @method
     * @private
     */
    _onKeyDown: function _onKeyDown(event) {
      if (event.keyCode === ENTER) {
        if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          this.send();
        } else {
          event.target.value += '\n';
          this._onInput(event);
        }
      } else if (!_base2.default.settings.disableTabAsWhiteSpace && event.keyCode === TAB && !event.shiftKey) {
        event.preventDefault();
        event.target.value += '\t  ';
        this._onInput(event);
      }
    },
    _onInput: function _onInput(event) {
      this.onRender();
      this._triggerChange(this.nodes.input.value, this.properties.value);
    },


    /**
     * On any change in value, recalculate our height and lineHeight to fit the input text.
     *
     * @method
     * @private
     */
    onRender: function onRender() {
      var _this = this;

      setTimeout(function () {
        _this.nodes.resizer.innerHTML = _this.nodes.input.value.replace(/\n/g, '<br/>') || '&nbsp;';
        _this.nodes.lineHeighter.innerHTML = _this.nodes.input.value.replace(/\n/g, '<br/>') || '&nbsp;';
        var willBeOneLine = !_this.nodes.input.value.match(/\n/) && _this.nodes.resizer.clientHeight - _this.nodes.lineHeighter.clientHeight < 10;

        // Prevent scrollbar flickering in and then out
        if (willBeOneLine) {
          _this.nodes.input.style.overflow = 'hidden';
          setTimeout(function () {
            _this.nodes.input.style.overflow = '';
          }, 1);
        }

        // Note that classList.toggle doesn't work right in IE11
        _this.classList[willBeOneLine ? 'add' : 'remove']('layer-composer-one-line-of-text');
      }, 10);
    },


    /**
     * If a file event was detected, send some attachments.
     *
     * @method
     * @private
     */
    _handleAttachments: function _handleAttachments(evt) {
      this.send(evt.detail.parts);
    }
  }
});

(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-composer", "<layer-compose-button-panel layer-id='buttonPanelLeft' class='layer-button-panel-left'></layer-compose-button-panel><div class='layer-compose-edit-panel' layer-id='editPanel'><div class='hidden-resizer' layer-id='resizer'>&nbsp;&nbsp;</div><div class='hidden-lineheighter' layer-id='lineHeighter'>&nbsp;</div><textarea rows=\"1\" layer-id='input'></textarea></div><layer-compose-button-panel layer-id='buttonPanel' class='layer-button-panel-right'></layer-compose-button-panel>", "");
  layerUI.buildStyle("layer-composer", "layer-composer {\ndisplay: flex;\nflex-direction: row;\n}\nlayer-composer .layer-compose-edit-panel {\nposition: relative;\nflex-grow: 1;\nwidth: 100px; \npadding: 1px 0px;\n}\nlayer-composer textarea, layer-composer .hidden-resizer, layer-composer .hidden-lineheighter {\nline-height: 1.2em;\nmin-height: 20px;\noverflow :hidden;\nborder-width: 0px;\nfont-size: 1em;\npadding: 4px 8px;\nbox-sizing: border-box;\nfont-family: \"Open Sans\", \"Helvetica Neue\", Helvetica, Arial, \"Lucida Grande\", sans-serif;\nmargin: 0px;\n}\nlayer-composer textarea {\nresize: none;\noutline: none;\ncolor: rgba(0,0,0,0.87);\nposition: absolute;\nz-index: 2;\ntop: 0px;\nleft: 0px;\nwidth: 100%;\nheight: 100%;\noverflow-y: auto;\nwhite-space: pre-wrap;\nword-wrap: break-word;\n}\nlayer-composer.layer-composer-one-line-of-text textarea {\noverflow-y: hidden;\n}\nlayer-composer .hidden-resizer {\nopacity: 0.1;\nwhite-space: pre-wrap;\nword-wrap: break-word;\nmax-height: 250px;\n}\nlayer-composer .layer-compose-edit-panel .hidden-lineheighter {\ntop: 0px;\nopacity: 0.1;\nwhite-space: nowrap;\nposition: absolute;\nright: 10000px;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5,"../layer-compose-button-panel/layer-compose-button-panel":20,"layer-websdk":66}],22:[function(require,module,exports){
/**
 * The Layer widget renders a Last Message for a Layer.Core.Conversation.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own Conversation Last Message rendering:
 *
 * ```
 * layerUI.registerComponent('layer-conversation-last-message', {
 *   properties: {
 *      item: {}
 *   },
 *   methods: {
 *     created: function() {
 *       this.innerHTML = this.item.lastMessage.parts[0].body;
 *     }
 *   }
 * });
 *
 * // Call init after custom components are defined
 * layerUI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * @class layerUI.components.subcomponents.ConversationLastMessage
 * @extends layerUI.components.Component
 */
'use strict';

var _base = require('../../../base');

var _base2 = _interopRequireDefault(_base);

var _component = require('../../../components/component');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-conversation-last-message', {
  properties: {

    /**
     * The Layer.Core.Message to be rendered
     *
     * @property {Layer.Core.Message} [item=null]
     */
    item: {
      set: function set(newValue, oldValue) {
        if (oldValue) oldValue.off(null, null, this);
        if (newValue) newValue.on('conversations:change', this.onRerender, this);
        this.onRender();
      }
    },

    /**
     * Provide a function to determine if the last message is rendered in the Conversation List.
     *
     * By default, only text/plain last-messages are rendered in the Conversation List.  A Message that is NOT rendered
     * is instead rendered using the MessageHandler's label: `(ICON) Image Message`
     *
     * ```javascript
     * listItem.canFullyRenderLastMessage = function(message) {
     *     return true; // Render all Last Messages
     * }
     * ```
     *
     * @property {Function} [canFullyRenderLastMessage=null]
     */
    canFullyRenderLastMessage: {}
  },
  methods: {

    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate: function onCreate() {},
    onRender: function onRender() {
      this.onRerender();
    },


    /**
     * Rerender this widget whenever the Layer.Core.Conversation has a change event reporting on a
     * new `lastMessage` property.
     *
     * Lookup a handler for the Message, and if one is found, see if `canFullyRenderLastMessage` allows it to be rendered.
     * If its allowed, append the Renderer as a child of this node; else set innerHTML to match the Handler's label.
     *
     * @method
     * @private
     * @param {Event} evt
     */
    onRerender: function onRerender(evt) {
      if (!evt || evt.hasProperty('lastMessage')) {
        var conversation = this.item;
        var message = conversation ? conversation.lastMessage : null;
        if (this.firstChild && this.firstChild.onDestroy) this.firstChild.onDestroy();
        this.innerHTML = '';
        if (message) {
          var handler = _base2.default.getHandler(message, this);
          if (handler) {
            this.classList.add(handler.tagName);
            // Create the element specified by the handler and add it as a childNode.
            if (!this.canFullyRenderLastMessage || this.canFullyRenderLastMessage(message)) {
              var messageHandler = document.createElement(handler.tagName);
              messageHandler.parentComponent = this;
              messageHandler.message = message;
              this.appendChild(messageHandler);
            } else if (handler.label) {
              this.innerHTML = '<div class="layer-custom-mime-type">' + handler.label + '</div>';
            }
          }
        }
      }
    }
  }
});

(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-conversation-last-message", "", "");
  layerUI.buildStyle("layer-conversation-last-message", "layer-conversation-last-message, .layer-custom-mime-type {\ndisplay: block;\nwhite-space: nowrap;\ntext-overflow: ellipsis;\noverflow: hidden;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5}],23:[function(require,module,exports){
/**
 * The Layer widget renders a title for a Layer.Core.Conversation.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own Conversation titles:
 *
 * ```
 * layerUI.registerComponent('layer-conversation-title', {
 *    properties: {
 *      item: {
 *        set: function(value) {
 *           this.innerHTML = this.item.metadata.myCustomTitle;
 *        }
 *      }
 *    }
 * });
 *
 * // Call init after custom components are defined
 * layerUI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * @class layerUI.components.subcomponents.ConversationTitle
 * @extends layerUI.components.Component
 */
'use strict';

var _component = require('../../../components/component');

(0, _component.registerComponent)('layer-conversation-title', {
  properties: {

    /**
     * The Layer.Core.Conversation to be rendered.
     *
     * @property {Layer.Core.Conversation} [item=null]
     */
    item: {
      set: function set(newConversation, oldConversation) {
        if (oldConversation) oldConversation.off(null, null, this);
        if (newConversation) newConversation.on('conversations:change', this.onRerender, this);
        this.onRender();
      }
    }
  },
  methods: {

    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate: function onCreate() {},
    onRender: function onRender() {
      this.onRerender();
    },


    /**
     * Rerender the widget any time a new conversation is assigned or that conversation has a relevant change event.
     *
     * @method
     * @private
     * @param {Event} evt
     */
    onRerender: function onRerender(evt) {
      if (!evt || evt.hasProperty('metadata') || evt.hasProperty('participants')) {
        var conversation = this.item;

        // If no conversation, empty the widget
        if (!conversation) {
          this.innerHTML = '';
        } else {
          var title = conversation.metadata.conversationName || conversation.metadata.title;
          if (!title) {
            var userNames = conversation.participants.filter(function (user) {
              return !user.sessionOwner;
            }) // don't show the user their own name
            .filter(function (user) {
              return user.displayName;
            }) // don't show users who lack a name
            .map(function (user) {
              return user.displayName;
            }); // replace identity object with the name

            if (userNames.length) {
              title = userNames.join(', ').replace(/, ([^,]*)$/, ' and $1');
            } else {
              title = 'No Title';
            }
          }
          if (title !== this.innerHTML) this.innerHTML = title;
        }
      }
    }
  }
});


(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-conversation-title", "", "");
  layerUI.buildStyle("layer-conversation-title", "layer-conversation-title {\ndisplay: block;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5}],24:[function(require,module,exports){
/**
 * The Layer Date widget renders a date.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own date formatting.  Note that most customization of date rendering can be accomplished instead
 * using layerUI.components.ConversationPanel.dateRenderer.
 *
 * ```
 * layerUI.registerComponent('layer-date', {
 *    properties: {
 *      date: {
 *        set: function(value) {
 *           // Render a random date value that is related to but not exactly the provided value
 *           var newDate = new Date(value);
 *           newDate.setHours(newDate.getHours() + Math.random() * 10);
 *           this.innerHTML = newDate.toISOString();
 *        }
 *      }
 *    }
 * });
 *
 * // Call init after custom components are defined
 * layerUI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * @class layerUI.components.subcomponents.Date
 * @extends layerUI.components.Component
 */
'use strict';

var _component = require('../../../components/component');

(0, _component.registerComponent)('layer-date', {
  properties: {

    /**
     * Date to be rendered
     *
     * @property {Date} [date=null]
     */
    date: {
      set: function set(value) {
        if (value) {
          if (this.dateRenderer) {
            this.value = this.dateRenderer(value);
          } else {
            var dateStr = value.toLocaleDateString();
            var timeStr = value.toLocaleTimeString();
            this.value = new Date().toLocaleDateString() === dateStr ? timeStr : dateStr + ' ' + timeStr;
          }
        } else {
          this.value = '';
        }
      }
    },

    /**
     * The actual rendered string.
     *
     * @property {String} [value='']
     */
    value: {
      set: function set(value) {
        this.innerHTML = value;
      }
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * dateItem.dateRenderer = function(date) {
     *    return date.toISOString();
     * };
     * ```
     *
     * @property {Function} [dateRender=null]
     */
    dateRenderer: {}
  }
});


(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-date", "", "");
  layerUI.buildStyle("layer-date", "layer-date {\ndisplay: block;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5}],25:[function(require,module,exports){
/**
 * The Layer Delete widget renders a deletion button.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own deletion capability.
 *
 * Note that the `item` property can refer to any type of data that can be deleted, including Layer.Core.Message and Layer.Core.Conversation.
 *
 * ```
 * layerUI.registerComponent('layer-delete', {
 *    properties: {
 *      item: {}
 *    },
 *    methods: {
 *      onCreate: function() {
 *        this.addEventListener('click', this.onDeleteClick, this);
 *      },
 *      onDeleteClick: function() {
 *         alert('I'm sorry Dave, I can't do that');
 *      }
 *    }
 * });
 *
 * // Call init after custom components are defined
 * layerUI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * @class layerUI.components.subcomponents.Delete
 * @extends layerUI.components.Component
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

var _component = require('../../../components/component');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-delete', {
  properties: {

    /**
     * Item to be deleted.
     *
     * @property {Layer.Core.Root} [item=null]
     */
    item: {},

    /**
     * Is deletion enabled for this item?
     *
     * @property {Boolean} [enabled=false]
     */
    enabled: {
      type: Boolean,
      set: function set(value) {
        // Note that IE11 doesn't propetly support classList.toggle()
        this.classList[value ? 'add' : 'remove']('layer-delete-enabled');
      }
    }
  },
  methods: {

    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate: function onCreate() {
      this.addEventListener('click', this.onDeleteClick, this);
    },


    /**
     * MIXIN HOOK: Called when the delete button is clicked..
     *
     * Triggers `layer-message-deleted` or `layer-conversation-deleted` allowing deletion to be handled elsewhere.
     *
     * @method
     * @param {Event} evt
     */
    onDeleteClick: function onDeleteClick(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      if (this.enabled) {
        if (this.item instanceof _layerWebsdk2.default.Message) {
          /**
           * A request has been made through the UI to delete a Message.
           *
           * This event can be canceled to prevent the default deletion behavior:
           *
           * ```javascript
           * document.body.addEventListener('layer-message-deleted', function(evt) {
           *    evt.preventDefault();
           *    var message = evt.item;
           *    message.delete(layer.Constants.DELETION_MODE.MY_DEVICES);
           * });
           * ```
           *
           * @event layer-message-deleted
           */
          if (this.trigger('layer-message-deleted', { item: this.item })) {
            if (window.confirm('Are you sure you want to delete this message?')) {
              this.item.delete(_layerWebsdk2.default.Constants.DELETION_MODE.ALL);
            }
          }
        }

        /**
         * A request has been made through the UI to delete a Conversation.
         *
         * This event can be canceled to prevent the default deletion behavior:
         *
         * ```javascript
         * document.body.addEventListener('layer-conversation-deleted', function(evt) {
         *    evt.preventDefault();
         *    var conversation = evt.item;
         *    conversation.delete(layer.Constants.DELETION_MODE.MY_DEVICES);
         * });
         * ```
         *
         * @event layer-conversation-deleted
         */
        else if (this.trigger('layer-conversation-deleted', { item: this.item })) {
            if (window.confirm('Are you sure you want to delete this conversation?')) {
              this.item.delete(_layerWebsdk2.default.Constants.DELETION_MODE.ALL);
            }
          }
      }
    }
  }
});

(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-delete", "&#x2715;", "");
  layerUI.buildStyle("layer-delete", "layer-delete {\ndisplay: none;\n}\nlayer-delete.layer-delete-enabled {\ndisplay: inline;\nwidth: 12px;\nheight: 12px;\nfont-size: 12px;\npadding: 4px 4px 6px 4px;\nmargin-right: 5px;\nborder: solid 1px transparent;\ncursor: default;\ntext-align: center;\ncursor: pointer;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5,"layer-websdk":66}],26:[function(require,module,exports){
/**
 * The Layer file upload button widget allows users to select a File to send.
 *
 * Its assumed that this button will be used within the layerUI.components.subcomponents.ComposeButtonPanel:
 *
 * ```
 * myConversationPanel.composeButtons = [
 *    document.createElement('layer-file-upload-button')
 * ];
 * ```
 *
 * If using it elsewhere, note that it triggers a `layer-file-selected` event that you would listen for to do your own processing.
 * If using it in the ComposeButtonPanel, this event will be received by the Composer and will not propagate any further:
 *
 * ```
 * document.body.addEventListener('layer-file-selected', function(evt) {
 *    var messageParts = evt.custom.parts;
 *    conversation.createMessage({ parts: messageParts }).send();
 * }
 * ```
 *
 * @class layerUI.components.subcomponents.FileUploadButton
 * @extends layerUI.components.Component
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

var _base = require('../../../base');

var _base2 = _interopRequireDefault(_base);

var _mainComponent = require('../../../mixins/main-component');

var _mainComponent2 = _interopRequireDefault(_mainComponent);

var _component = require('../../../components/component');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-file-upload-button', {
  mixins: [_mainComponent2.default],
  properties: {
    /**
     * Set the `accept` attribute of the file upload widget.
     *
     * For more info, see https://www.w3schools.com/tags/att_input_accept.asp
     *
     * Possible value: `image/*,video/*`
     *
     * @property {String} [accept=*\/*]
     */
    accept: {
      set: function set(newValue) {
        this.nodes.input.accept = newValue;
      }
    }
  },
  methods: {

    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate: function onCreate() {
      var _this = this;

      this.nodes.input.id = _layerWebsdk2.default.Util.generateUUID();
      this.nodes.label.setAttribute('for', this.nodes.input.id);
      this.nodes.input.addEventListener('change', this.onChange.bind(this));

      // This causes test to fail by causing the click event to fire twice.
      // but without this, the click event is not received at all.
      this.addEventListener('click', function (evt) {
        if (evt.target !== _this.nodes.input) _this.nodes.input.click();
      });
    },


    /**
     * MIXIN HOOK: When the file input's value has changed, gather the data and trigger an event.
     *
     * If adding a mixin here to change behaviors on selecting a file, you can use `this.nodes.input.files` to access
     * the selected files.
     *
     * @method
     */
    onChange: function onChange() {
      var _this2 = this;

      var files = this.nodes.input.files;

      /* istanbul ignore next */
      var inputParts = Array.prototype.map.call(files, function (file) {
        return new _layerWebsdk2.default.MessagePart(file);
      });

      /**
       * This widget triggers a `layer-file-selected` event when the user selects files.
       * This event is captured and stopped from propagating by the layerUI.components.subcomponents.Composer.
       * If using it outside of the composer, this event can be used to receive the MessageParts generated
       * for the selected files.
       *
       * @event layer-file-selected
       * @param {Object} evt
       * @param {Object} evt.detail
       * @[aram {Layer.Core.MessagePart[]} evt.detail.parts
       */
      _base2.default.files.processAttachments(inputParts, function (parts) {
        _this2.trigger('layer-file-selected', { parts: parts });
      });
    }
  }
});

(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-file-upload-button", "<label layer-id='label'>+</label><input layer-id='input' type='file'></input>", "");
  layerUI.buildStyle("layer-file-upload-button", "layer-file-upload-button {\ncursor: pointer;\ndisplay: flex;\nflex-direction: column;\njustify-content: center;\n}\nlayer-file-upload-button input {\nwidth: 0.1px;\nheight: 0.1px;\nopacity: 0;\noverflow: hidden;\nposition: absolute;\nz-index: -1;\n}\nlayer-file-upload-button label {\ndisplay: block;\npointer-events: none;\ntext-align: center;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5,"../../../mixins/main-component":51,"layer-websdk":66}],27:[function(require,module,exports){
/**
 * The Layer Message Status widget renders a Message's sent/delivered/read status.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own date formatting.  Note that most customization of message status rendering can be accomplished instead
 * using layerUI.components.ConversationPanel.messageStatusRenderer.
 *
 * ```
 * layerUI.registerComponent('layer-message-status', {
 *    properties: {
 *      message: {
 *        set: function(value) {
 *          if (newMessage) newMessage.on('messages:change', this.onRerender, this);
 *          this.onRerender();
 *        }
 *      }
 *    },
 *    methods: {
 *      onRerender: function() {
 *          var message = this.properties.message;
 *          this.innerHTML = 'Nobody wants to read your message';
 *      }
 *    }
 * });
 *
 * // Call init after custom components are defined
 * layerUI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * @class layerUI.components.subcomponents.MessageStatus
 * @extends layerUI.components.Component
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

var _component = require('../../../components/component');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-message-status', {
  properties: {

    /**
     * Message whose status is to be rendered
     *
     * @property {Layer.Core.Message} [message=null]
     */
    item: {
      set: function set(newMessage, oldMessage) {
        if (oldMessage) oldMessage.off(null, null, this);
        if (newMessage) newMessage.on('messages:change', this.onRerender, this);
        this.onRender();
      }
    },

    /**
     * Provide property to override the function used to render a message status for each Message Item.
     *
     * Note that changing this will not trigger a rerender; this should be set during initialization.
     *
     * ```javascript
     * statusItem.messageStatusRenderer = function(message) {
     *    return message.readStatus === layer.Constants.RECIPIENT_STATE.ALL ? 'read' : 'processing...';
     * };
     * ```
     *
     * @property {Function} [messageStatusRenderer=null]
     */
    messageStatusRenderer: {}
  },
  methods: {

    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate: function onCreate() {},
    onRender: function onRender() {
      this.onRerender();
    },


    /**
     * There are many ways to render the status of a Message.
     *
     * See layerUI.components.ConversationPanel.messageStatusRenderer to customize this.
     *
     * @method
     * @private
     * @param {Event} evt
     */
    onRerender: function onRerender(evt) {
      if (this.item && (!evt || evt.hasProperty('recipientStatus') || evt.hasProperty('syncState'))) {
        var message = this.item;
        if (this.messageStatusRenderer) {
          this.innerHTML = this.messageStatusRenderer(message);
        } else {
          var text = '';
          if (message.isNew()) {
            text = '';
          } else if (message.isSaving() || message.isNew()) {
            text = 'pending';
          } else if (message instanceof _layerWebsdk2.default.Message.ChannelMessage || message.deliveryStatus === _layerWebsdk2.default.Constants.RECIPIENT_STATE.NONE) {
            text = 'sent';
          } else if (message.readStatus === _layerWebsdk2.default.Constants.RECIPIENT_STATE.NONE) {
            text = 'delivered';
          } else if (message.readStatus === _layerWebsdk2.default.Constants.RECIPIENT_STATE.ALL) {
            text = 'read';
          } else {
            var sessionOwnerId = message.getClient().user.id;
            var status = message.recipientStatus;
            var count = Object.keys(status).filter(function (identityId) {
              return identityId !== sessionOwnerId && status[identityId] === _layerWebsdk2.default.Constants.RECEIPT_STATE.READ;
            }).length;
            text = 'read by ' + count + ' participants';
          }
          this.innerHTML = text;
        }
      }
    }
  }
});

(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-message-status", "", "");
  layerUI.buildStyle("layer-message-status", "layer-message-status {\ndisplay: inline;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5,"layer-websdk":66}],28:[function(require,module,exports){
/**
 * The Layer Presence widget renders an icon representing a user's status of Available, Away, Busy or Offline.
 *
 * If using it outsdie of the Avatar widget, make sure you set `layerPresenceWidget.item = identity`.  Most common usage is:
 *
 * ```
 * document.getElementById('mypresencewidget').item = client.user;
 * ```
 *
 * The simplest way to customize this widget is to replace it with your own implementation of the `<layer-avatar />` tag.
 *
 * ```javascript
 * layerUI.registerComponent('layer-presence', {
 *    properties: {
 *      user: {
 *        set: function(value) {
 *           this.onRender();
 *           if (value) value.on('identity:changes', this.onRerender, this);
 *        }
 *      }
 *    },
 *    methods: {
 *      onRender: function() {
 *        this.onRerender();
 *      },
 *      onRerender: function() {
 *        this.className = 'my-presence-' + this.user.status;
 *      },
 *    }
 * });
 *
 * // Call init after custom components are defined
 * layerUI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * @class layerUI.components.subcomponents.Presence
 * @extends layerUI.components.Component
 * @mixin layerUI.mixins.MainComponent
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

var _component = require('../../../components/component');

var _mainComponent = require('../../../mixins/main-component');

var _mainComponent2 = _interopRequireDefault(_mainComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-presence', {
  mixins: [_mainComponent2.default],

  /**
   * The user has clicked on the `<layer-presence />` widget
   *
   * @event layer-presence-click
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Identity} evt.detail.item - The user rendered by this Presence Widget
   */

  /**
   * The user has clicked on the `<layer-presence />` widget
   *
   * @property {Function} onPresenceClick
   * @param {Event} onPresenceClick.evt
   * @param {Object} onPresenceClick.evt.detail
   * @param {layer.Identity} onPresenceClick.evt.detail.item - The user rendered by this Presence Widget
   */
  events: ['layer-presence-click'],
  properties: {

    /**
     * User whose status is represented here
     *
     * Typically this only has one user represented with a layer.Identity.
     *
     * @property {layer.Identity}
     */
    item: {
      set: function set(value) {
        if (value && !(value instanceof _layerWebsdk2.default.Identity)) {
          var client = _layerWebsdk2.default.Client.getClient(value.clientId);
          if (client) {
            value = this.properties.item = client.getIdentity(value.id);
          } else {
            value = this.properties.item = null;
          }
        }
        if (value) value.on('identities:change', this.onRerender, this);
        this.onRender();
      }
    }
  },
  methods: {
    onCreate: function onCreate() {
      this.addEventListener('click', this.onClick.bind(this));
    },


    /**
     * Render new user.
     *
     * @method
     */
    onRender: function onRender() {
      this.onRerender();
    },


    /**
     * Render's changes in user status
     *
     * @method
     */
    onRerender: function onRerender(user) {
      this.className = 'layer-presence-' + (this.item ? this.item.status : 'unknown');
    },


    /**
     * The user clicked on this widget.
     *
     * Typically, you wouldn't respond to these, but if the user clicked on their OWN presence,
     * you may prompt them to change their status
     *
     * @method
     * @param {Event} evt
     */
    onClick: function onClick(evt) {
      evt.preventDefault();
      this.trigger('layer-presence-click', { item: this.item });
    }
  }
});


(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-presence", "", "");
  layerUI.buildStyle("layer-presence", "layer-presence {\ndisplay: inline-block;\nborder-radius: 30px;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5,"../../../mixins/main-component":51,"layer-websdk":66}],29:[function(require,module,exports){
/**
 * The Layer Send button widget provides an alternative to hitting a keyboard `ENTER` key for sending a message.
 *
 * Its assumed that this button will be used within the layerUI.components.subcomponents.ComposeButtonPanel.
 * If using it elsewhere, note that it triggers a `layer-send-click` event that you would listen for to do your own processing.
 * If using it in the ComposeButtonPanel, this event will be received and handled by the Composer and will not propagate any further.
 *
 * ```
 * document.body.addEventListener('layer-send-click', function(evt) {
 *    var messageParts = evt.custom.parts;
 *    conversation.createMessage({ parts: messageParts }).send();
 * }
 * ```
 *
 * A send button is added to a project as follows:
 *
 * ```
 * myConversationPanel.composeButtons = [
 *    document.createElement('layer-send-button')
 * ];
 * ```
 *
 * @class layerUI.components.subcomponents.SendButton
 * @extends layerUI.components.Component
 */
'use strict';

var _component = require('../../../components/component');

var _mainComponent = require('../../../mixins/main-component');

var _mainComponent2 = _interopRequireDefault(_mainComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-send-button', {
  mixins: [_mainComponent2.default],
  properties: {
    text: {
      value: 'SEND',
      set: function set(value) {
        this.firstChild.innerHTML = value;
      }
    }
  },
  methods: {
    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate: function onCreate() {
      this.addEventListener('click', this.onClick.bind(this));
    },


    /**
     * MIXIN HOOK: Called whenever the button is clicked.
     *
     * @method
     * @param {Event} evt
     */
    onClick: function onClick(evt) {
      this.trigger('layer-send-click');
    }
  }
});

(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-send-button", "<div></div>", "");
  layerUI.buildStyle("layer-send-button", "layer-send-button {\ncursor: pointer;\ndisplay: flex;\nflex-direction: row;\nalign-items: center;\n}\nlayer-send-button div {\ntext-align: center;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5,"../../../mixins/main-component":51}],30:[function(require,module,exports){
/**
 * The Layer Typing Indicator widget renders a short description of who is currently typing into the current Conversation.
 *
 * This is designed to go inside of the layerUI.Conversation widget.
 *
 * The simplest way to customize the behavior of this widget is using the `layer-typing-indicator-change` event.
 *
 * TODO: Provide a layerUI.components.ConversationPanel.typingIndicatorRenderer property
 *
 * @class layerUI.components.subcomponents.TypingIndicator
 * @extends layerUI.components.Component
 */
'use strict';

var _component = require('../../../components/component');

(0, _component.registerComponent)('layer-typing-indicator', {
  properties: {
    /**
     * The Conversation whose typing indicator activity we are reporting on.
     *
     * @property {Layer.Core.Conversation} [conversation=null]
     */
    conversation: {
      set: function set(value) {
        if (value) {
          this.client = value.getClient();
          var state = this.client.getTypingState(value);
          this.onRerender({
            conversationId: value.id,
            typing: state.typing,
            paused: state.paused
          });
        } else {
          this.value = '';
        }
      }
    },

    /**
     * The Client we are connected with; we need it to receive typing indicator events from the WebSDK.
     *
     * This property is typically set indirectly by setting the layerUI.TypingIndicator.conversation.
     *
     * @property {Layer.Core.Client} [client=null]
     */
    client: {
      set: function set(newClient, oldClient) {
        if (oldClient) oldClient.off(null, null, this);
        if (newClient) newClient.on('typing-indicator-change', this.onRerender, this);
      }
    },

    /**
     * The value property is the text/html being rendered.
     *
     * @property {String} [value=""]
     */
    value: {
      set: function set(text) {
        this.nodes.panel.innerHTML = text || '';
        // classList.toggle doesn't work right in IE11
        this.classList[text ? 'add' : 'remove']('layer-typing-occuring');
      }
    }
  },
  methods: {

    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate: function onCreate() {},
    onRender: function onRender() {
      if (this.conversation && this.conversation.id) {
        var data = this.client.getTypingState(this.conversation.id);
        data.conversationId = this.conversation.id;
        this.onRerender(data);
      }
    },


    /**
     * Whenever there is a typing indicator event, rerender our UI
     *
     * @method onRerender
     * @param {layer.LayerEvent} evt
     */
    onRerender: function onRerender(evt) {
      // We receive typing indicator events for ALL Conversations; ignore them if they don't apply to the current Conversation
      if (this.conversation && evt.conversationId === this.conversation.id) {

        // Trigger an event so that the application can decide if it wants to handle the event itself.
        var customEvtResult = this.trigger('layer-typing-indicator-change', {
          typing: evt.typing,
          paused: evt.paused,
          widget: this
        });

        // If the app lets us handle the event, set the value of this widget to something appropriate
        if (customEvtResult) {
          var names = evt.typing.map(function (user) {
            return user.displayName;
          });
          switch (names.length) {
            case 0:
              this.value = '';
              break;
            case 1:
              this.value = names.join(', ') + ' is typing';
              break;
            default:
              this.value = names.join(', ').replace(/, ([^,]*)$/, ' and $1') + ' are typing';
          }
        }
      }
    }
  }
});

/**
 * Custom handler to use for rendering typing indicators.
 *
 * By calling `evt.preventDefault()` on the event you can provide your own custom typing indicator text to this widget:
 *
 * ```javascript
 * document.body.addEventListener('layer-typing-indicator-change', function(evt) {
 *    evt.preventDefault();
 *    var widget = evt.target;
 *    var typingUsers = evt.detail.typing;
 *    var pausedUsers = evt.detail.paused;
 *    var text = '';
 *    if (typingUsers.length) text = typingUsers.length + ' users are typing';
 *    if (pausedUsers.length && typingUsers.length) text += ' and ';
 *    if (pausedUsers.length) text += pausedUsers.length + ' users have paused typing';
 *    widget.value = text;
 * });
 * ```
 *
 * Note that as long as you have called `evt.preventDefault()` you can also just directly manipulate child domNodes of `evt.detail.widget`
 * if a plain textual message doesn't suffice.
 *
 * @event layer-typing-indicator-change
 * @param {Event} evt
 * @param {Object} evt.detail
 * @param {layer.Identity[]} evt.detail.typing
 * @param {layer.Identity[]} evt.detail.paused
 */


(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-typing-indicator", "<span class='layer-typing-message' layer-id='panel'></span>", "");
  layerUI.buildStyle("layer-typing-indicator", "layer-typing-indicator {\ndisplay: block;\n}\nlayer-typing-indicator span {\ndisplay: none;\n}\nlayer-typing-indicator.layer-typing-occuring span {\ndisplay: inline;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5}],31:[function(require,module,exports){
/**
 * The Layer Image MessageHandler renders a single MessagePart image, or an Atlas 3-message-part Image.
 *
 * One of the challenges in rendering images is that browser `<img />` tags do not follow EXIF data
 * for orientation, which results in sideways and upside down photos.  Furthermore, CSS rotation of the dom,
 * results in offsets and margins that vary based on the exact dimensions of the image, resulting
 * in some very ugly code to get anything remotely consistent.  This Component uses `blueimp-load-image`
 * to write the image to a Canvas, parse its EXIF data and orient it appropriately.
 *
 * As with all Message Handling, Message Height should be fixed at rendering time, and should not change asynchrnously
 * except in response to a user action.  Otherwise scroll positions get mucked and users get lost.
 * As a result, image heights should be fixed before any asynchronously loaded image has loaded.
 *
 * @class layerUI.handlers.message.Image
 * @extends layerUI.components.Component
 */
'use strict';

var _loadImage = require('blueimp-load-image/js/load-image');

var _loadImage2 = _interopRequireDefault(_loadImage);

require('blueimp-load-image/js/load-image-orientation');

require('blueimp-load-image/js/load-image-meta');

require('blueimp-load-image/js/load-image-exif');

var _base = require('../../../base');

var _component = require('../../../components/component');

var _sizing = require('../../../utils/sizing');

var _sizing2 = _interopRequireDefault(_sizing);

var _messageHandler = require('../../../mixins/message-handler');

var _messageHandler2 = _interopRequireDefault(_messageHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerMessageComponent)('layer-message-image', {
  mixins: [_messageHandler2.default],
  properties: {
    label: {
      // TODO: Remove font awsome css classes!
      value: '<i class="fa fa-file-image-o layer-image-message-icon" aria-hidden="true"></i> Image message'
    },

    /**
     * The Message property provides the MessageParts we are going to render.
     *
     * @property {Layer.Core.Message} [message=null]
     */
    message: {
      set: function set(value) {

        // Extract our image, preview and metadata message parts
        this.properties.image = value.parts.filter(function (part) {
          return ['image/png', 'image/gif', 'image/jpeg'].indexOf(part.mimeType) !== -1;
        })[0];
        this.properties.preview = value.parts.filter(function (part) {
          return part.mimeType === 'image/jpeg+preview';
        })[0];
        var meta = value.parts.filter(function (part) {
          return part.mimeType === 'application/json+imageSize';
        })[0];
        if (meta) this.properties.meta = JSON.parse(meta.body);

        // If there is a preview and it doesn't have a body, fetch the preview body so we can pass it into the ImageManager.
        if (this.properties.preview && this.properties.image) {
          if (!this.properties.preview.body) {
            this.properties.preview.fetchContent();
            this.properties.preview.on('content-loaded', this.onRender, this);
          }
          // TODO: remove body test once all websdk changes are merged and url is gaurenteed to have a value if body has a value
          // If image does not have a url, call fetchStream to get an updated url
          if (!this.properties.image.url && !this.properties.image.body) this.properties.image.fetchStream();
        }

        // If there is no preview, only an image, we're going to pass it into the ImageManager so fetch its body
        else if (!this.properties.image.body) {
            this.properties.image.fetchContent();
            this.properties.image.on('content-loaded', this.onRender, this);
          }
      }
    }
  },
  methods: {
    handlesMessage: function handlesMessage(message) {
      // Get the Image Parts
      var imageParts = message.parts.filter(function (part) {
        return ['image/png', 'image/gif', 'image/jpeg'].indexOf(part.mimeType) !== -1;
      }).length;

      // Get the Preview Parts
      var previewParts = message.parts.filter(function (part) {
        return part.mimeType === 'image/jpeg+preview';
      }).length;

      // Get the Metadata Parts
      var metaParts = message.parts.filter(function (part) {
        return part.mimeType === 'application/json+imageSize';
      }).length;

      // We handle 1 part images or 3 part images.
      return message.parts.length === 1 && imageParts || message.parts.length === 3 && imageParts === 1 && previewParts === 1 && metaParts === 1;
    },


    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate: function onCreate() {
      this.addEventListener('click', this._handleClick.bind(this));
    },


    /**
     * If the user clicks the image, and we have a full image part with a url, open it.
     *
     * @method
     * @private
     * @param {Event} evt
     */
    _handleClick: function _handleClick(evt) {
      // Don't open images clicked within the Conversations List
      /* istanbul ignore next */
      if (this.parentNode.tagName !== 'LAYER-CONVERSATION-LAST-MESSAGE') {
        evt.preventDefault();
        if (this.properties.image && this.properties.image.url) window.open(this.properties.image.url);
      }
    },


    /**
     * Render the Message.
     *
     * Primarily, this method determines whether to call _renderCanvas on the preview or the image.
     *
     * @method
     * @private
     */
    onRender: function onRender() {
      var maxSizes = _base.settings.maxSizes;
      // TODO: Need to be able to customize this height, as well as the conditions (parentContainers) under which different sizes are applied.
      if (this.parentComponent && this.parentComponent.tagName === 'LAYER-NOTIFIER') maxSizes = { height: 140, width: maxSizes.width };
      this.properties.sizes = (0, _sizing2.default)(this.properties.meta, { width: maxSizes.width, height: maxSizes.height });
      this.style.height = _base.settings.verticalMessagePadding + this.properties.sizes.height + 'px';
      if (this.properties.preview && this.properties.preview.body) {
        this._renderCanvas(this.properties.preview.body);
      } else if (this.properties.image && this.properties.image.body) {
        this._renderCanvas(this.properties.image.body);
      }
    },


    /**
     * Parse the EXIF data, determine the orientation and then generate a Canvas with a correctly oriented Image.
     *
     * Canvas is added as a child node.
     *
     * @method
     * @private
     * @param {Blob} blob
     */
    _renderCanvas: function _renderCanvas(blob) {
      var _this = this;

      // Read the EXIF data
      _loadImage2.default.parseMetaData(blob, function (data) {
        var options = {
          canvas: true
        };

        if (data.imageHead && data.exif) {
          options.orientation = data.exif[0x0112] || 1;
        }
        options.maxWidth = options.minWidth = _this.properties.sizes.width;
        options.maxHeight = options.minHeight = _this.properties.sizes.height;

        // Write the image to a canvas with the specified orientation
        (0, _loadImage2.default)(blob, function (canvas) {
          while (_this.firstChild) {
            _this.removeChild(_this.firstChild);
          }if (canvas instanceof HTMLElement) {
            _this.appendChild(canvas);
          } else {
            console.error(canvas);
          }
        }, options);
      });
    }
  }
});

/*
 * Handle any Message that contains an IMage + Preview + Metadata or is just an Image
 */
// layerUI.registerMessageHandler({
//   tagName: 'layer-message-image',
//   label: '<i class="fa fa-file-image-o" aria-hidden="true"></i> Image message',
//   handlesMessage(message, container) {
//     // Get the Image Parts
//     const imageParts = message.parts.filter(part =>
//       ['image/png', 'image/gif', 'image/jpeg'].indexOf(part.mimeType) !== -1).length;

//     // Get the Preview Parts
//     const previewParts = message.parts.filter(part =>
//       part.mimeType === 'image/jpeg+preview').length;

//     // Get the Metadata Parts
//     const metaParts = message.parts.filter(part =>
//       part.mimeType === 'application/json+imageSize').length;

//     // We handle 1 part images or 3 part images.
//     return (message.parts.length === 1 && imageParts ||
//       message.parts.length === 3 && imageParts === 1 && previewParts === 1 && metaParts === 1);
//   },
// });


(function () {
  var layerUI = require('../../../base');
  layerUI.buildAndRegisterTemplate("layer-message-image", "", "");
  layerUI.buildStyle("layer-message-image", "layer-message-image {\ndisplay: flex;\nflex-direction: column;\nalign-items: center;\n}\nlayer-message-image canvas {\nwidth: 100%;\n}", "");
})();
},{"../../../base":4,"../../../components/component":5,"../../../mixins/message-handler":52,"../../../utils/sizing":58,"blueimp-load-image/js/load-image":65,"blueimp-load-image/js/load-image-exif":61,"blueimp-load-image/js/load-image-meta":62,"blueimp-load-image/js/load-image-orientation":63}],32:[function(require,module,exports){
/**
 * The Layer Plain Text MessageHandler renders a single text/plain message part.
 *
 * See layerUI.registerTextHandler for details on adding new text processing capabilities.
 *
 * @class layerUI.handlers.message.TextPlain
 * @extends layerUI.components.Component
 */
'use strict';

var _component = require('../../components/component');

var _messageHandler = require('../../mixins/message-handler');

var _messageHandler2 = _interopRequireDefault(_messageHandler);

var _base = require('../../base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerMessageComponent)('layer-message-text-plain', {
  // Note: This template is for use within a MessageItem in a MessageList, else its blown away by the message text
  // which if burried so deeply in the dom, becomes problematic to render inline with other elements such as `conversation.lastMessage` to the right of
  // conversation name.  Use of this template in a Message Item allows us to have afterText nodes that contain additional content
  // but which is not inside of the text bubble
  template: '<div class="layer-message-text" layer-id="text"></div>',
  mixins: [_messageHandler2.default],
  properties: {
    label: {
      label: 'Text'
    },
    html: {
      set: function set(html) {
        if (this.parentComponent.isMessageListItem) {
          this.nodes.text.innerHTML = html;
        } else {
          this.innerHTML = html;
        }
      }
    }
  },
  methods: {
    /**
     * This component can render any message that starts with text/plain message part
     *
     * @method
     */
    handlesMessage: function handlesMessage(message, container) {
      return message.parts[0].mimeType === 'text/plain';
    },


    /**
     * Replaces any html tags with escaped html tags so that the recipient
     * sees tags rather than rendered html.
     *
     * @method
     * @private
     */
    _fixHtml: function _fixHtml(body) {
      body = body.replace(/</g, '&lt;');
      body = body.replace(/>/g, '&gt;');
      return body;
    },


    /**
     * Format the text and render it.
     *
     * Iterates over all Text Handlers allowing each to modify the `text` property, as well as to append values to `afterText`
     *
     * Renders the results after all TextHandlers have run.
     *
     * @method
     */
    onRender: function onRender() {
      var _this = this;

      if (!_base2.default.textHandlersOrdered) this._setupOrderedHandlers();

      var text = this.message.parts[0].body;
      var textData = {
        text: this._fixHtml(text),
        afterText: [],
        afterClasses: []
      };

      // Iterate over each handler, calling each handler.
      // Perform a cheap trick until we can update our API so that
      // css classes can be associated with each item.
      // This is a cheap trick because a TextHandler could arbitrarily edit the `afterText` array,
      // removing previously added elements.  And this code would then break.
      _base2.default.textHandlersOrdered.forEach(function (handlerDef) {
        var afterText = textData.afterText.concat([]);
        handlerDef.handler(textData, _this.message, Boolean(_this.parentComponent && _this.parentComponent.isMessageListItem));
        var last = textData.afterText[textData.afterText.length - 1];
        if (afterText.indexOf(last) === -1) {
          textData.afterClasses[textData.afterText.length - 1] = 'layer-message-text-plain-' + handlerDef.name;
        }
      });
      this.html = textData.text;

      if (textData.afterText.length && this.parentComponent && this.parentComponent.isMessageListItem) {
        textData.afterText.forEach(function (textItem, i) {
          var div = document.createElement('div');
          div.classList.add('layer-message-text-plain-after-text');
          div.classList.add(textData.afterClasses[i]);
          div.innerHTML = textItem;
          if (div.firstChild.properties) div.firstChild.properties.parentComponent = _this;
          _this.appendChild(div);
        });
      }
    },


    /**
     * Order the Text handlers if they haven't previously been sorted.
     *
     * This is run as a method, but is treated more like a run-once static method.
     *
     * @method
     * @private
     */
    _setupOrderedHandlers: function _setupOrderedHandlers() {
      _base2.default.textHandlersOrdered = Object.keys(_base2.default.textHandlers).filter(function (handlerName) {
        return _base2.default.textHandlers[handlerName].enabled;
      }).map(function (handlerName) {
        return _base2.default.textHandlers[handlerName];
      }).sort(function (a, b) {
        if (a.order > b.order) return 1;
        if (b.order > a.order) return -1;
        return 0;
      });
    },


    /**
     * Rerender any message that was rendered as a preview and is now no longer a preview.
     *
     * @method onSent
     */
    onSent: function onSent() {
      this.onRender();
    }
  }
});
},{"../../base":4,"../../components/component":5,"../../mixins/message-handler":52}],33:[function(require,module,exports){
/**
 * The Unknown MessageHandler renders unhandled content with a placeholder politely
 * suggesting that a developer should probably handle it.
 *
 * @class layerUI.handlers.message.Unknown
 * @extends layerUI.components.Component
 */
'use strict';

var _component = require('../../components/component');

var _messageHandler = require('../../mixins/message-handler');

var _messageHandler2 = _interopRequireDefault(_messageHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-message-unknown', {
  mixins: [_messageHandler2.default],
  methods: {
    /**
     * Render a message that is both polite and mildly annoying.
     *
     * @method
     * @private
     */
    onRender: function onRender() {
      var mimeTypes = this.message.parts.map(function (part) {
        return part.mimeType;
      }).join(', ');
      this.innerHTML = 'Message with mimeTypes ' + mimeTypes + ' has been received but has no renderer';
    }
  }
});

// Do not register this handler
},{"../../components/component":5,"../../mixins/message-handler":52}],34:[function(require,module,exports){
/**
 * The Layer Video MessageHandler renders a single MessagePart Video, or an Atlas 3-message-part Video.
 *
 * As with all Message Handling, Message Height should be fixed at rendering time, and should not change asynchrnously
 * except in response to a user action.  Otherwise scroll positions get mucked and users get lost.
 * As a result, video heights should be fixed before any asynchronously loaded video or preview has loaded.
 *
 * @class layerUI.handlers.message.Video
 * @extends layerUI.components.Component
 */
'use strict';

var _component = require('../../components/component');

var _sizing = require('../../utils/sizing');

var _sizing2 = _interopRequireDefault(_sizing);

var _base = require('../../base');

var _messageHandler = require('../../mixins/message-handler');

var _messageHandler2 = _interopRequireDefault(_messageHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerMessageComponent)('layer-message-video', {
  mixins: [_messageHandler2.default],
  template: '<video layer-id="video"></video>',
  properties: {
    label: {
      value: '<i class="fa fa-file-video-o layer-video-message-icon" aria-hidden="true"></i> Video message'
    },

    /**
     * The Message property provides the MessageParts we are going to render.
     *
     * @property {Layer.Core.Message} [message=null]
     */
    message: {
      set: function set(value) {

        // Extract our video, preview and metadata message parts
        this.properties.video = value.parts.filter(function (part) {
          return part.mimeType === 'video/mp4';
        })[0];
        this.properties.preview = value.parts.filter(function (part) {
          return part.mimeType === 'image/jpeg+preview';
        })[0];
        var meta = value.parts.filter(function (part) {
          return part.mimeType === 'application/json+imageSize';
        })[0];
        if (meta) this.properties.meta = JSON.parse(meta.body);

        this.properties.sizes = (0, _sizing2.default)(this.properties.meta, {
          width: _base.settings.maxSizes.width,
          height: _base.settings.maxSizes.height
        });

        if (!this.properties.video.url) this.properties.video.fetchStream();
        this.properties.video.on('url-loaded', this.onRender, this);

        if (this.properties.preview) {
          if (!this.properties.preview.url) this.properties.preview.fetchStream();
          this.properties.preview.on('url-loaded', this.onRender, this);
        }
      }
    }
  },
  methods: {
    handlesMessage: function handlesMessage(message, container) {
      var videoParts = message.parts.filter(function (part) {
        return part.mimeType === 'video/mp4';
      }).length;
      var previewParts = message.parts.filter(function (part) {
        return part.mimeType === 'image/jpeg+preview';
      }).length;
      var metaParts = message.parts.filter(function (part) {
        return part.mimeType === 'application/json+imageSize';
      }).length;
      return message.parts.length === 1 && videoParts || message.parts.length === 3 && videoParts === 1 && previewParts === 1 && metaParts === 1;
    },


    /**
     * Render the Message.
     *
     * Primarily, this method determines whether to call renderCanvas on the preview or the image.
     *
     * @method
     * @private
     */
    onRender: function onRender() {
      this.nodes.video.width = this.properties.sizes.width;
      this.nodes.video.height = this.properties.sizes.height;
      this.nodes.video.src = this.properties.video.url;
      if (this.properties.preview) {
        this.nodes.video.poster = this.properties.preview.url;
      }
      this.nodes.video.controls = true;
    }
  }
});
},{"../../base":4,"../../components/component":5,"../../mixins/message-handler":52,"../../utils/sizing":58}],35:[function(require,module,exports){
/**
 * The Layer Image TextHandler replaces all image URLs with image tags
 *
 * @class layerUI.handlers.text.Autolinker
 */
'use strict';

var _autolinker = require('autolinker');

var _autolinker2 = _interopRequireDefault(_autolinker);

var _base = require('../../base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var autolinker = new _autolinker2.default({
  truncate: {
    length: 40,
    location: 'middle'
  },
  className: 'layer-parsed-url'
});

_base2.default.registerTextHandler({
  name: 'autolinker',
  order: 400,
  requiresEnable: true,
  handler: function handler(textData) {
    textData.text = autolinker.link(textData.text);
  }
});
},{"../../base":4,"autolinker":60}],36:[function(require,module,exports){
/**
 * The Layer Code Block TextHandler replaces all \`\`\` with code blocks, and all \` with inline code blocks.
 *
 * @class layerUI.handlers.text.CodeBlocks
 */
'use strict';

var _base = require('../../base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_base2.default.registerTextHandler({
  name: 'code-blocks',
  order: 500,
  requiresEnable: true,
  handler: function handler(textData) {
    var text = textData.text.replace(/```[\s\S]*?```/g, function (block) {
      return '<pre class="code_block">' + block.substring(3, block.length - 3) + '</pre>';
    });

    // note .* means single line; [\s\S]* means multiline
    text = text.replace(/`.*?`/g, function (block) {
      return '<code>' + block.substring(1, block.length - 1) + '</code>';
    });
    textData.text = text;
  }
});
},{"../../base":4}],37:[function(require,module,exports){
/**
 * The Layer Emoji TextHandler replaces all :smile: and :-) with emoji images
 *
 * @class layerUI.handlers.text.Emoji
 */
'use strict';

var _twemoji = require('twemoji');

var _twemoji2 = _interopRequireDefault(_twemoji);

var _setEmoji = require('remarkable-emoji/setEmoji');

var _setEmoji2 = _interopRequireDefault(_setEmoji);

var _base = require('../../base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_base2.default.registerTextHandler({
  base: location.protocol + '://twemoji.maxcdn.com/',
  name: 'emoji',
  order: 300,
  requiresEnable: true,
  handler: function handler(textData) {
    // Bug in RemarkableParser requires extra spacing around html tags to keep them away from the emoticon.
    var text = textData.text.replace(/<br\/>/g, ' <br/> ');

    // Parse it
    var parsed = (0, _setEmoji2.default)(text);

    // See if its an all-emoji line by replacing all emojis with empty strings
    // and seeing if there's anything left when we're done.
    var allEmojiLine = !_twemoji2.default.replace(parsed, function () {
      return '';
    }).match(/\S/);

    // Render the emoji images
    text = _twemoji2.default.parse((0, _setEmoji2.default)(text), {
      size: allEmojiLine ? '36x36' : '16x16',
      className: allEmojiLine ? 'emoji emoji-line' : 'emoji'
    });

    // Undo the extra spacing we added above
    text = text.replace(/ <br\/> /g, '<br/>');
    textData.text = text;
  }
});
},{"../../base":4,"remarkable-emoji/setEmoji":69,"twemoji":70}],38:[function(require,module,exports){
/**
 * The Layer Image TextHandler replaces all image URLs with image tags
 *
 * @class layerUI.handlers.text.Images
 */
'use strict';

var _base = require('../../base');

var _base2 = _interopRequireDefault(_base);

var _isUrl = require('../../utils/is-url');

var _isUrl2 = _interopRequireDefault(_isUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


_base2.default.registerTextHandler({
  name: 'images',
  order: 100,
  requiresEnable: true,
  handler: function handler(textData) {
    var matches = textData.text.match((0, _isUrl2.default)(['png', 'jpg', 'jpeg', 'gif']));
    if (matches) {
      matches.forEach(function (match) {
        return textData.afterText.push('<img class="layer-parsed-image" src="' + match + '"></img>');
      });
    }
  }
});
},{"../../base":4,"../../utils/is-url":57}],39:[function(require,module,exports){
/**
 * The Layer Newline TextHandler replaces all newline characters with <br/> tags.
 *
 * Any newline character that appears within a code block should
 * NOT be replaced with a <br/> tag as the code block will render that as a visible
 * <br/> rather than go to the next line.
 *
 * @class layerUI.handlers.text.NewLine
 */
'use strict';

var _base = require('../../base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_base2.default.registerTextHandler({
  name: 'newline',
  order: 600,
  requiresEnable: true,
  handler: function handler(textData) {
    var body = textData.text;
    var codeBlockIndices = [];
    var codeBlocks = [];
    var lastIndex = 0;
    while (lastIndex !== -1) {
      lastIndex = body.indexOf('```', lastIndex);
      if (lastIndex !== -1) {
        codeBlockIndices.push(lastIndex);
        lastIndex += 3;
      }
    }

    for (var i = 1; i < codeBlockIndices.length; i++) {
      codeBlocks.push([codeBlockIndices[i - 1], codeBlockIndices[i]]);
    }

    function isInCodeBlock(index) {
      return Boolean(codeBlocks.filter(function (block) {
        return index > block[0] && index < block[1];
      }).length);
    }

    body = body.replace(/\n/g, function (text, index) {
      if (isInCodeBlock(index)) {
        return text;
      } else {
        return '<br/>';
      }
    });
    textData.text = body;
  }
});
},{"../../base":4}],40:[function(require,module,exports){
/**
 * The Layer Youtube URL TextHandler replaces all youtube-like URLs with a video player.
 *
 * @class layerUI.handlers.text.Youtube
 */
'use strict';

var _base = require('../../base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_base2.default.registerTextHandler({
  name: 'youtube',
  order: 200,
  requiresEnable: true,
  handler: function handler(textData) {
    var matches = textData.text.match(/https:\/\/(www\.)?(youtu\.be|youtube\.com)\/(watch\?.*?v=)?([a-zA-Z0-9-]+)/g);
    if (matches) {
      matches.forEach(function (match) {
        var videoId = void 0;
        var shortUrlMatches = match.match(/https:\/\/youtu\.be\/(.*)$/);
        if (shortUrlMatches) videoId = shortUrlMatches[1];
        if (!videoId) {
          var urlMatches = match.match(/https:\/\/www\.youtube\.com\/watch\?v=(.*)$/);
          if (urlMatches) videoId = urlMatches[1];
        }
        if (videoId) {
          textData.afterText.push('<iframe width="560" height="315" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>');
        }
      });
    }
  }
});
},{"../../base":4}],41:[function(require,module,exports){
(function (global){
'use strict';

/*
 * This file is used to create a browserified build with the following properties:
 *
 * * Initializes webcomponent-light polyfil
 * * Hooks up all methods/properties in the layerUI namespace
 * * Initializes and registers all widgets of this library
 *
 * Note that you may create your own build that includes:
 *
 * * webcomponent polyfil
 * * Hooks up all methods/properties in the layerUI namespace
 * * Pick and choose modules from the lib folder to include
 *
 * NOTE: JSDuck is picking up on LayerUI and defining it to be a class
 * which we don't want; do not let JSDuck parse this file.
 */
'use strict';

/*
 * This file is used to create a browserified build with the following properties:
 *
 * * Initializes webcomponent-light polyfil
 * * Hooks up all methods/properties in the layerUI namespace
 * * Initializes and registers all widgets of this library
 *
 * Note that you may create your own build that includes:
 *
 * * webcomponent polyfil
 * * Hooks up all methods/properties in the layerUI namespace
 * * Pick and choose modules from the lib folder to include
 *
 * NOTE: JSDuck is picking up on LayerUI and defining it to be a class
 * which we don't want; do not let JSDuck parse this file.
 */

var LayerUI = require('./layer-ui');

// Load Adapters
require('./adapters/angular');
require('./adapters/backbone');
require('./adapters/react');

// Load Main Components
require('./components/conversation-list-panel/layer-conversations-list/layer-conversations-list');
require('./components/identities-list-panel/layer-identities-list/layer-identities-list');
require('./components/membership-list-panel/layer-membership-list/layer-membership-list');
require('./components/layer-conversation-panel/layer-conversation-panel');
require('./components/layer-notifier/layer-notifier');

// Load standard utilities
require('./components/subcomponents/layer-file-upload-button/layer-file-upload-button');
require('./components/subcomponents/layer-send-button/layer-send-button');
require('./handlers/message/layer-message-text-plain');
require('./handlers/message/layer-message-image/layer-message-image');
require('./handlers/message/layer-message-video');
require('./handlers/text/autolinker');
require('./handlers/text/code-blocks');
require('./handlers/text/emoji');
require('./handlers/text/images');
require('./handlers/text/newline');
require('./handlers/text/youtube');
require('./utils/date-separator');

LayerUI.files = require('./utils/files');
LayerUI.animatedScrollTo = require('animated-scrollto');

LayerUI.mixins = {
  MessageHandler: require('./mixins/message-handler'),
  HasQuery: require('./mixins/has-query'),
  MainComponent: require('./mixins/main-component'),
  List: require('./mixins/list'),
  ListItem: require('./mixins/list-item'),
  ListSelection: require('./mixins/list-selection'),
  ListItemSelection: require('./mixins/list-item-selection'),
  FocusOnKeydown: require('./mixins/focus-on-keydown')
};

// If we don't expose global.layerUI then custom templates can not load and call window.layerUI.registerTemplate()
module.exports = global.layerUI = LayerUI;

var LayerUI = require('./layer-ui');

// Load Adapters
require('./adapters/angular');
require('./adapters/backbone');
require('./adapters/react');

// Load Main Components
require('./components/conversation-list-panel/layer-conversations-list/layer-conversations-list');
require('./components/identities-list-panel/layer-identities-list/layer-identities-list');
require('./components/membership-list-panel/layer-membership-list/layer-membership-list');
require('./components/layer-conversation-panel/layer-conversation-panel');
require('./components/layer-notifier/layer-notifier');

// Load standard utilities
require('./components/subcomponents/layer-file-upload-button/layer-file-upload-button');
require('./components/subcomponents/layer-send-button/layer-send-button');
require('./handlers/message/layer-message-text-plain');
require('./handlers/message/layer-message-image/layer-message-image');
require('./handlers/message/layer-message-video');
require('./handlers/text/autolinker');
require('./handlers/text/code-blocks');
require('./handlers/text/emoji');
require('./handlers/text/images');
require('./handlers/text/newline');
require('./handlers/text/youtube');
require('./utils/date-separator');

LayerUI.files = require('./utils/files');
LayerUI.animatedScrollTo = require('animated-scrollto');

LayerUI.mixins = {
  MessageHandler: require('./mixins/message-handler'),
  HasQuery: require('./mixins/has-query'),
  MainComponent: require('./mixins/main-component'),
  List: require('./mixins/list'),
  ListItem: require('./mixins/list-item'),
  ListSelection: require('./mixins/list-selection'),
  ListItemSelection: require('./mixins/list-item-selection'),
  FocusOnKeydown: require('./mixins/focus-on-keydown')
};

// If we don't expose global.layerUI then custom templates can not load and call window.layerUI.registerTemplate()
module.exports = global.layerUI = LayerUI;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./adapters/angular":1,"./adapters/backbone":2,"./adapters/react":3,"./components/conversation-list-panel/layer-conversations-list/layer-conversations-list":8,"./components/identities-list-panel/layer-identities-list/layer-identities-list":9,"./components/layer-conversation-panel/layer-conversation-panel":11,"./components/layer-notifier/layer-notifier":12,"./components/membership-list-panel/layer-membership-list/layer-membership-list":14,"./components/subcomponents/layer-file-upload-button/layer-file-upload-button":26,"./components/subcomponents/layer-send-button/layer-send-button":29,"./handlers/message/layer-message-image/layer-message-image":31,"./handlers/message/layer-message-text-plain":32,"./handlers/message/layer-message-video":34,"./handlers/text/autolinker":35,"./handlers/text/code-blocks":36,"./handlers/text/emoji":37,"./handlers/text/images":38,"./handlers/text/newline":39,"./handlers/text/youtube":40,"./layer-ui":42,"./mixins/focus-on-keydown":44,"./mixins/has-query":45,"./mixins/list":50,"./mixins/list-item":47,"./mixins/list-item-selection":46,"./mixins/list-selection":49,"./mixins/main-component":51,"./mixins/message-handler":52,"./utils/date-separator":55,"./utils/files":56,"animated-scrollto":59}],42:[function(require,module,exports){
'use strict';

require('webcomponents.js/webcomponents-lite');

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _component = require('./components/component');

require('./handlers/message/layer-message-unknown');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Import this if you want just a basic setup without any built-in widgets.
 *
 * Import index.js instead of you want a standard setup with standard widgets installed.
 */
'use strict';

require('webcomponents.js/webcomponents-lite');

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _component = require('./components/component');

require('./handlers/message/layer-message-unknown');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Import this if you want just a basic setup without any built-in widgets.
 *
 * Import index.js instead of you want a standard setup with standard widgets installed.
 */

_base2.default.registerComponent = _component.registerComponent;
_base2.default.registerMessageComponent = _component.registerMessageComponent;

/**
 * Unregister a component.  Must be called before layerUI.init().
 *
 * Use this call to prevent a component from being registered with the document.
 * Currently this works only on components that have been already called with `layerUI.registerComponent`
 * but which have not yet been completed via a call to `layerUI.init()`.
 *
 * This is not typically needed, but allows you to defer creation of a widget, and then at some point later in your application lifecycle
 * define a replacement for that widget. You can not redefine an html tag that is registered with the document... but this prevents it from
 * being registered yet.
 */
_base2.default.unregisterComponent = _component.unregisterComponent;

_base2.default.init = function init() {
  var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  Object.keys(settings).forEach(function (name) {
    _base2.default.settings[name] = settings[name];
  });

  if (!_base2.default.settings.mixins) _base2.default.settings.mixins = [];

  // Register all widgets
  (0, _component.registerAll)();

  // Enable the text handlers
  _base2.default.settings.textHandlers.forEach(function (handlerName) {
    _base2.default.registerTextHandler({ name: handlerName });
  });
};

module.exports = _base2.default;

_base2.default.registerComponent = _component.registerComponent;
_base2.default.registerMessageComponent = _component.registerMessageComponent;

/**
 * Unregister a component.  Must be called before layerUI.init().
 *
 * Use this call to prevent a component from being registered with the document.
 * Currently this works only on components that have been already called with `layerUI.registerComponent`
 * but which have not yet been completed via a call to `layerUI.init()`.
 *
 * This is not typically needed, but allows you to defer creation of a widget, and then at some point later in your application lifecycle
 * define a replacement for that widget. You can not redefine an html tag that is registered with the document... but this prevents it from
 * being registered yet.
 */
_base2.default.unregisterComponent = _component.unregisterComponent;

_base2.default.init = function init() {
  var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  Object.keys(settings).forEach(function (name) {
    _base2.default.settings[name] = settings[name];
  });

  if (!_base2.default.settings.mixins) _base2.default.settings.mixins = [];

  // Register all widgets
  (0, _component.registerAll)();

  // Enable the text handlers
  _base2.default.settings.textHandlers.forEach(function (handlerName) {
    _base2.default.registerTextHandler({ name: handlerName });
  });
};

module.exports = _base2.default;
},{"./base":4,"./components/component":5,"./handlers/message/layer-message-unknown":33,"webcomponents.js/webcomponents-lite":71}],43:[function(require,module,exports){
/**
 * A helper mixin for Lists that render alternate text in the event that the list is Empty.
 *
 * @class layerUI.mixins.EmptyList
 */
'use strict';


module.exports = {
  properties: {
    /**
     * If the query has no data and is not loading data, this should be true.
     *
     * @property {Boolean} [isEmptyList=false]
     * @readonly
     */
    isEmptyList: {
      value: false,
      set: function set(value) {
        this.nodes.emptyNode.style.display = value ? '' : 'none';
      }
    },

    /**
     * A dom node to render when there are no messages in the list.
     *
     * Could just be a message "Empty Conversation".  Or you can add interactive widgets.
     *
     * @property {HTMLElement} [emptyNode=null]
     */
    emptyNode: {
      set: function set(value) {
        this.nodes.emptyNode.innerHTML = '';
        if (value) this.nodes.emptyNode.appendChild(value);
      }
    }
  },
  methods: {
    onRender: function onRender() {
      this.nodes.emptyNode.style.display = this.isEmptyList ? '' : 'none';
      if (this.emptyNode) this.nodes.emptyNode.appendChild(this.emptyNode);
    },


    /**
     * Call this on any Query change events.
     *
     * @method onRerender
     * @private
     * @param {Event} evt
     */
    onRerender: function onRerender() {
      var evt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (this.query.isDestroyed) {
        this.isEmptyList = false;
      } else {
        this.isEmptyList = evt.type !== 'reset' && this.query.data.length === 0;
      }
    }
  }
};
},{}],44:[function(require,module,exports){
/**
 * A helper mixin for any widget that wants to refocus when keyboard input is received.
 *
 * Any class using this mixin must provide an `onKeyDown` method.
 *
 * @class layerUI.mixins.FocusOnKeydown
 */
'use strict';


module.exports = {
  methods: {
    onCreate: function onCreate() {
      this.addEventListener('keydown', this._onKeyDown.bind(this));

      // Typically the defaultIndex is -1, but IE11 uses 0.
      // We must be focusable to receive keyboard input
      /* istanbul ignore next */
      var defaultIndex = document.head ? document.head.tabIndex : null;
      if (this.tabIndex === '' || this.tabIndex === -1 || this.tabIndex === defaultIndex) {
        this.tabIndex = -1;
      }
    },


    /**
     * Focus on compose bar if key is pressed within this panel.
     *
     * Unless the focus is on an input or textarea, in which case, let the user type.
     *
     * @method _onKeyDown
     * @param {Event} evt
     * @private
     */
    _onKeyDown: function _onKeyDown(evt) {
      var keyCode = evt.keyCode;
      var metaKey = evt.metaKey;
      var ctrlKey = evt.ctrlKey;
      if (metaKey || ctrlKey) return;

      /* istanbul ignore next */
      if (keyCode >= 65 && keyCode <= 90 || // a-z
      keyCode >= 48 && keyCode <= 57 || // 0-9
      keyCode >= 97 && keyCode <= 111 || // NUMPAD
      keyCode >= 186 && keyCode <= 191 || // Puncuation
      [32, 219, 220, 222].indexOf(keyCode) !== -1) {
        // Punctuation
        if (['INPUT', 'TEXTAREA'].indexOf(document.activeElement.tagName) === -1) {
          this.onKeyDown();
        }
      }
    }
  }
};
},{}],45:[function(require,module,exports){
/**
 * A Mixin for main components that can receive or generate a Query
 *
 * @class layerUI.mixins.HasQuery
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


module.exports = {
  properties: {

    /**
     * The Client is needed in order for the list to get a Query from a queryId
     *
     * @property {Layer.Core.Client} [client=null]
     */
    client: {
      set: function set(value) {
        if (value) {
          if (this.queryId) {
            this.query = value.getQuery(this.queryId);
          }
          if (this.properties._isMainComponent && this.useGeneratedQuery) {
            this._setupGeneratedQuery();
          }
        }
      }
    },

    /**
     * The ID for the layer.Query providing the items to render.
     *
     * Note that you can directly set the `query` property as well.
     *
     * Leaving this and the query properties empty will cause a layer.Query to be generated for you.
     *
     * @property {String} [queryId='']
     */
    queryId: {
      set: function set(value) {
        if (value && value.indexOf('layer:///') !== 0) this.properties.queryId = '';
        if (this.client) {
          this.query = this.queryId ? this.client.getQuery(this.queryId) : null;
        }
      }
    },

    /**
     * A layer.Query provides the items to render.
     *
     * Suggested practices:
     *
     * * If your not using this query elsewhere in your app, let this widget generate its own Query
     * * If setting this from an html template, use layerUI.mixins.List.queryId instead.
     *
     * @property {layer.Query} [query=null]
     */
    query: {
      set: function set(newValue, oldValue) {
        if (oldValue) oldValue.off(null, null, this);
        if (newValue instanceof _layerWebsdk2.default.Query) {
          this._updateQuery();
        } else {
          this.properties.query = null;
        }

        // If there is an oldQuery that we didn't generate, its up to the app to destroy it when it is done.
        if (this.properties._isMainComponent && this.hasGeneratedQuery) {
          this.hasGeneratedQuery = false;
          oldValue.destroy();
        }
      }
    },

    /**
     * The Query was generated internally, not passed in as an attribute or property.
     *
     * @property {Boolean} [hasGeneratedQuery=false]
     * @readonly
     */
    hasGeneratedQuery: {
      value: false,
      type: Boolean
    },

    /**
     * Does this widget generate its own query or should that behavior be prevented?
     *
     * If your providing your own Query, its a good practice to insure that a Query is NOT generated by the widget
     * as that Query will promptly fire, and consume your user's bandwidth.
     *
     * @property {Boolean } [useGeneratedQuery=true]
     */
    useGeneratedQuery: {
      value: true,
      type: Boolean
    },

    /**
     * How many items to page in each time we page the Query.
     *
     * @property {Number} [pageSize=50]
     */
    pageSize: {
      value: 50
    }
  },
  methods: {

    /**
     * A Component typically expects a Query as an input... or it needs to create its own.
     *
     * This method tests to see if it expects or has a Query, and creates one if needed.
     *
     * @method
     * @private
     */
    _setupGeneratedQuery: function _setupGeneratedQuery() {
      // Warning: Do not call the query getter via `this.query` as it may cause an infinite loop
      if (this._queryModel && !this.properties.query && this.client && !this.client.isDestroyed) {
        this.query = this.client.createQuery({
          model: this._queryModel,
          dataType: _layerWebsdk2.default.Query.InstanceDataType,
          paginationWindow: this.pageSize || 50,
          sortBy: this.sortBy
        });
        this.hasGeneratedQuery = true;
      }
    },


    /**
     * Any time we get a new Query assigned, wire it up.
     *
     * @method _updateQuery
     * @private
     */
    _updateQuery: function _updateQuery() {
      this.client = this.query.client;
      this.onRender();
      this.query.on('change', this.onRerender, this);
    }
  }
};
},{"layer-websdk":66}],46:[function(require,module,exports){
/**
 * A List Item Mixin that add an `isSelected` property to a List.
 *
 * Also listens for `click` events to update the `selectedId` property,
 * and triggers a selection events.
 *
 * @class layerUI.mixins.ListSelection
 */
'use strict';



module.exports = {
  properties: {
    isSelected: {
      type: Boolean,
      set: function set(value) {
        this.toggleClass('layer-selected-item', value);
        this.onSelection(value);
      }
    }
  },
  methods: {
    /**
     * MIXIN HOOK: Each time a an item's selection state changes, this will be called.
     *
     * @method onSelection
     * @param {Boolean} isSelected
     */
    onSelection: function onSelection(isSelected) {
      // No-op
    }
  }
};
},{}],47:[function(require,module,exports){
/**
 * A List Item Mixin that provides common properties, shortcuts and code.
 *
 * This Mixin requires a template that provides a `layer-list-item` class
 *
 * @class layerUI.mixins.ListItem
 */
'use strict';



module.exports = {
  properties: {
    /**
     * Is this component a List Item
     *
     * @private
     * @readonly
     * @property {Boolean} [_isListItem=true]
     */
    _isListItem: {
      value: true
    },

    /**
     * A custom DOM node added by your application; this is not the prior List Item.
     *
     * You can set this to a DOM Node or html string
     *
     * @property {HTMLElement | String} [customNodeAbove=null]
     */
    customNodeAbove: {
      set: function set(node) {
        if (this.properties._customNodeAbove) this.removeChild(this.properties._customNodeAbove);
        if (node && typeof node === 'string') {
          var tmp = node;
          node = document.createElement('div');
          node.innerHTML = tmp;
          this.properties.customNodeAbove = node;
        }
        if (node) {
          this.insertBefore(node, this.querySelector('.layer-list-item'));
        } else {
          this.properties.customNodeAbove = null;
        }
        this.properties._customNodeAbove = node;
      }
    },

    /**
     * A custom DOM node added by your application; this is not the prior List Item.
     *
     * You can set this to a DOM Node or html string
     *
     * @property {HTMLElement | String} [customNodeBelow=null]
     */
    customNodeBelow: {
      set: function set(node) {
        if (this.properties._customNodeBelow) this.removeChild(this.properties._customNodeBelow);
        if (node && typeof node === 'string') {
          var tmp = node;
          node = document.createElement('div');
          node.innerHTML = tmp;
          this.properties.customNodeBelow = node;
        }
        if (node) {
          this.appendChild(node);
        } else {
          this.properties.customNodeBelow = null;
        }
        this.properties._customNodeBelow = node;
      }
    },

    /**
     * Shortcut to the `.layer-list-item` node
     *
     * @property {HTMLElement} [innerNode=null]
     * @private
     */
    innerNode: {},

    /**
     * Sets whether this widget is the first in a series of layerUI.MessageItem set.
     *
     * @property {Boolean} [firstInSeries=false]
     */
    firstInSeries: {
      type: Boolean,
      value: false,
      set: function set(value) {
        this.toggleClass('layer-list-item-first', value);
      }
    },

    /**
     * Sets whether this widget is the last in a series of layerUI.MessageItem set.
     *
     * @property {Boolean} [lastInSeries=false]
     */
    lastInSeries: {
      type: Boolean,
      value: false,
      set: function set(value) {
        this.toggleClass('layer-list-item-last', value);
      }
    },

    /**
     * The item of data in a list of data that this List Item will render.
     *
     * @property {Layer.Core.Root} [item=null]
     */
    item: {
      set: function set(newItem, oldItem) {
        var _this = this;

        // Disconnect from any previous Message we were rendering; not currently used.
        if (oldItem) oldItem.off(null, null, this);

        // Any changes to the Message should trigger a rerender
        if (newItem) newItem.on(newItem.constructor.eventPrefix + ':change', this.onRerender, this);
        Object.keys(this.nodes).forEach(function (nodeName) {
          _this.nodes[nodeName].item = newItem;
        });
        this.onRender();
      }
    }
  },
  methods: {
    onCreate: function onCreate() {
      this.innerNode = this.querySelector('.layer-list-item');
    },


    onRender: {
      conditional: function onCanRender() {
        return Boolean(this.item);
      }
    },

    /**
     * Adds the CSS class to this list item's outer node.
     *
     * @method addClass
     * @param {String} className
     */
    addClass: function addClass(className) {
      this.classList.add(className);
    },


    /**
     * Removes the CSS class from this list item's outer node.
     *
     * @method removeClass
     * @param {String} className
     */
    removeClass: function removeClass(className) {
      this.classList.remove(className);
    },


    /**
     * Toggles the CSS class of this list item's outer node.
     *
     * @method toggleClass
     * @param {String} className
     * @param {Boolean} [add=true]
     */
    toggleClass: function toggleClass(className) {
      var add = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      this.classList[add ? 'add' : 'remove'](className);
    }
  }
};
},{}],48:[function(require,module,exports){
/**
 * A helper mixin for Lists that want an indicator to render when paging through data, that data is currently loading.
 *
 * This is not a necessary feature, but is nicer than just reaching the end of the list and waiting.
 *
 *
 * This mixin requires "layer-id=loadIndicator" to exist in the template for any component using this mixin.
 *
 * @class layerUI.mixins.ListLoadIndicator
 */
'use strict';


module.exports = {
  properties: {
    isDataLoading: {
      set: function set(value) {
        this.classList[value ? 'add' : 'remove']('layer-loading-data');
      }
    },

    /**
     * A dom node to render when data is loading for the list.
     *
     * Could just be a message "Messages Loading...".  Or you can add interactive widgets.
     * Note that using the default template, this widget may be wrapped in a div with CSS class `layer-header-toggle`,
     * you should insure that they height of this toggle does not change when your custom node is shown.  Set the
     * style height to be at least as tall as your custom node.
     *
     * @property {HTMLElement} [dataLoadingNode=null]
     */
    dataLoadingNode: {
      set: function set(value) {
        this.nodes.loadIndicator.innerHTML = '';
        if (value) this.nodes.loadIndicator.appendChild(value);
      }
    }
  },
  methods: {
    onRender: function onRender() {
      if (this.dataLoadingNode) this.nodes.loadIndicator.appendChild(this.dataLoadingNode);
    }
  }
};
},{}],49:[function(require,module,exports){
/**
 * A List Mixin that add a `selectedId` property to a List.
 *
 * Also listens for `click` events to update the `selectedId` property,
 * and triggers selection events.
 *
 * @class layerUI.mixins.ListSelection
 */
'use strict';


module.exports = {
  properties: {
    /**
     * Get/Set the selected Conversation by ID.
     *
     * ```javascript
     * list.selectedId = myConversation.id;
     * ```
     *
     * Or if using a templating engine:
     *
     * ```html
     * <layer-conversations-list selected-id={{selectedConversation.id}}></layer-conversations-list>
     * ```
     *
     * The above code will set the selected Conversation and render the conversation as selected.
     * Note that setting the selectedId triggers a selection event; if `evt.preventDefault()` is called,
     * this property change will be prevented.
     *
     * @property {String} [selectedId='']
     */
    selectedId: {
      set: function set(newId, oldId) {
        var newItem = this.client.getObject(newId);
        if ((newItem || oldId) && !this.trigger(this._selectedItemEventName, { item: newItem })) {
          this.properties.selectedId = oldId;
        } else {
          if (oldId) {
            var node = this.querySelector('#' + this._getItemId(oldId));
            if (node) node.isSelected = false;
          }

          if (newId) {
            var _node = this.querySelector('#' + this._getItemId(newId));
            if (_node) _node.isSelected = true;
          }
        }
      }
    }
  },
  methods: {
    onCreate: function onCreate() {
      this.addEventListener('click', this._onClick.bind(this));
    },
    onAfterCreate: function onAfterCreate() {
      if (!this.properties._selectedItemEventName) this.properties._selectedItemEventName = 'layer-item-selected';
    },


    /**
     * User has selected something in the Conversation List that didn't handle that click event.
     *
     * Find the Conversation Item selected and generate a `layer-conversation-selected` event.
     * Click events do NOT bubble up; they must either be handled by the layerUI.components.ConversationsListPanel.Item.Conversation or
     * they are treated as a selection event.
     *
     * Listening to `layer-conversation-selected` you will still receive the original click event
     * in case you wish to process that futher; see `originalEvent` below.
     *
     * Calling `evt.preventDefault()` will prevent selection from occuring.
     *
     * @method _onClick
     * @private
     * @param {Event} evt
     */
    _onClick: function _onClick(evt) {
      var target = evt.target;
      while (target && target !== this && !target._isListItem) {
        target = target.parentNode;
      }

      if (target.item && target._isListItem) {
        evt.preventDefault();
        evt.stopPropagation();
        this.selectedId = target.item.id;
      }
      this.onClick(evt);
    },


    /**
     * MIXIN HOOK: Each time a Conversation is Clicked, you can hook into that by providing an onClick method.
     *
     * Note that prior to this call, `evt.preventDefault()` and `evt.stopPropagation()` were already called.
     *
     * @method onClick
     * @param {Event} evt
     */
    onClick: function onClick(evt) {
      // No-op
    },


    /*
     * Any time an item is generated, see if it needs to be set as selected.
     */
    onGenerateListItem: function onGenerateListItem(widget) {
      if (widget.item.id === this.selectedId) widget.isSelected = true;
    }
  }
};
},{}],50:[function(require,module,exports){
/**
 * A List Mixin that provides common list patterns
 *
 * @class layerUI.mixins.List
 * @mixin layerUI.mixins.HasQuery
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

var _base = require('../base');

var _component = require('../components/component');

var _hasQuery = require('./has-query');

var _hasQuery2 = _interopRequireDefault(_hasQuery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


module.exports = {
  mixins: [_hasQuery2.default],
  properties: {
    /**
     * Lists have some special behaviors; its useful to be able to test if a component is in fact a list.
     *
     * @property {Boolean} [_isList=true]
     * @private
     * @readonly
     */
    _isList: {
      value: true
    },

    /**
     * Set/get state related to whether the Query data is loading data from the server.
     *
     * This is managed by the app, and is updated any time the layer.Query changes state.
     *
     * You could set this as well if you need to indicate some activity outside of the layer.Query:
     *
     * ```
     * widget.isDataLoading = true;
     * ```
     *
     * @property {Boolean} [isDataLoading=false]
     */
    isDataLoading: {},

    /**
     * Any time we are about to render an object, call any provided onRenderListItem function to see if there
     * are nodes to be inserted before/after the User Item.
     *
     * ```javascript
     * userList.onRenderListItem = function(widget, dataArray, index, isTopItemNew) {
     *     var conversation = widget.item;
     *     var priorConversation = dataArray[index - 1];
     *     if (index > 0 && conversation.metadata.category !== priorConversation.metadata.category) {
     *        widget.customNodeAbove = '<div class="my-separator">' + widget.user.metadata.category + '</div>';
     *     }
     * });
     * ```
     *
     * Typical actions on receiving a widget is to set its customNodeAbove and/or customNodeBelow to either a DOM node or an HTML String.
     *
     * @property {Function} [onRenderListItem=null]      Function to call on each rendered item.
     * @property {Layer.Core.Root} onRenderListItem.widget    Current user/message/conversation/list-item widget that has been created from the Query.
     * @property {Layer.Core.Root[]} onRenderListItem.items   Full set of users/messages/conversations have been/will be rendered
     * @property {Number} onRenderListItem.index         Index of the user/message/conversation in the items array
     * @property {Boolean} onRenderListItem.isTopItemNew If the top item is index 0, and its newly added rather than just affected by changes
     *           around it, this is often useful to know.
     */
    onRenderListItem: {
      type: Function
    },

    /**
     * How many items to page in each time we page the Query.
     *
     * @property {Number} [pageSize=50]
     */
    pageSize: {
      value: 50
    },

    /**
     * A throttler is used to prevent excessive scroll events.
     *
     * This timeout indicates how frequently scroll events are allowed to fire in miliseconds.
     * This value should not need to be tinkered with.
     *
     * @property {Number} [throttlerTimeout=66]
     */
    throttlerTimeout: {
      value: 66
    },

    state: {
      set: function set(newState) {
        Array.prototype.slice.call(this.childNodes).forEach(function (node) {
          node.state = newState;
        });
      }
    },

    /**
     * String, Regular Expression or Function for filtering Conversations.
     *
     * Defaults to filtering by comparing input against things like Conversation.metadata.conversationName, or Identity.displayName, etc.
     * Provide your own Function to change this behavior
     *
     * @property {String|RegEx|Function} [filter='']
     */
    filter: {
      set: function set(value) {
        this._runFilter();
      }
    }
  },
  methods: {
    onCreate: function onCreate() {
      if (!this.id) this.id = _layerWebsdk2.default.Util.generateUUID();
      this.properties.listData = [];
      this.addEventListener('scroll', this._onScroll.bind(this));
      this.onRender();
    },


    /**
     * The _onScroll method throttles calls to the handleScroll method.
     *
     * @method _onScroll
     * @param {Event} evt
     * @private
     */
    _onScroll: function _onScroll(evt) {
      if (this.properties.isSelfScrolling) {
        evt.preventDefault();
      } else {
        this._throttler(this._handleScroll.bind(this));
      }
    },


    /**
     * Simple throttler to avoid too many events while scrolling.
     *
     * Not at this time safe for handling multiple types of events at the same time.
     *
     * @method _throttler
     * @private
     */
    _throttler: function _throttler(callback) {
      var _this = this;

      if (!this.properties.throttleTimeout) {
        this.properties.throttleTimeout = setTimeout(function () {
          _this.properties.throttleTimeout = null;
          callback();
        }, this.throttlerTimeout);
      }
    },


    /**
     * Any time we get a new Query assigned, wire it up.
     *
     * @method _updateQuery
     * @private
     */
    _updateQuery: function _updateQuery() {
      this.query.on('change:property', this._runFilter, this);
    },


    /**
     * If the user scrolls to the bottom of the list, page the Query.
     *
     * @method _handleScroll
     * @private
     */
    _handleScroll: function _handleScroll() {
      if (this.scrollTop >= this.scrollHeight - this.clientHeight - 20 && this.scrollTop > 0) {
        this.query.update({ paginationWindow: this.query.paginationWindow + this.pageSize });
        this.isDataLoading = this.properties.query.isFiring;
      }
    },


    /**
     * Scroll the list to the specified Y position.
     *
     * @method scrollTo
     * @param {Number} position
     */
    scrollTo: function scrollTo(position) {
      if (position === this.scrollTop) return;
      this.scrollTop = position;
    },


    /**
     * Animated scroll to the specified Y position.
     *
     * @method animatedScrollTo
     * @param {Number} position
     * @param {Number} [animateSpeed=200]   Number of miliseconds of animated scrolling; 0 for no animation
     * @param {Function} [animateCallback] Function to call when animation completes
     */
    animatedScrollTo: function animatedScrollTo(position) {
      var _this2 = this;

      var animateSpeed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;
      var animateCallback = arguments[2];

      if (this.properties.cancelAnimatedScroll) this.properties.cancelAnimatedScroll();

      var cancel = this.properties.cancelAnimatedScroll = (0, _base.animatedScrollTo)(this, position, animateSpeed, function () {
        if (cancel !== _this2.properties.cancelAnimatedScroll) return;
        _this2.properties.cancelAnimatedScroll = null;
        if (animateCallback) animateCallback();
      });
    },


    /**
     * Scroll to the specified item.
     *
     * Item is assumed to be a Layer.Core.Message, Layer.Core.Conversation, or whatever the core
     * data set is that is in your list.  Note that this does not load the item from the server;
     * scrolling to an item not in the list will return `false`.
     *
     * @method scrollToItem
     * @param {Layer.Core.Root} item
     * @param {Number} [animateSpeed=0]   Number of miliseconds of animated scrolling; 0 for no animation
     * @param {Function} [animateCallback] Function to call when animation completes
     * @return {Boolean}                  Returns true if operation was successful,
     *                                    returns false if the item was not found in the list.
     */
    scrollToItem: function scrollToItem(item) {
      var animateSpeed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var animateCallback = arguments[2];

      var widget = document.getElementById(this._getItemId(item.id));
      if (!widget) return false;

      var position = widget.offsetTop - this.offsetTop;
      if (!animateSpeed) {
        this.scrollTop = position;
      } else {
        this.animatedScrollTo(position, animateSpeed, animateCallback);
      }

      return true;
    },
    onRender: function onRender() {
      var _this3 = this;

      // Reset the query to initial state by cloning the template
      Array.prototype.slice.call(this.childNodes).forEach(function (node) {
        if (node._isListItem) _this3.removeChild(node);
      });

      // Render any data in the query
      if (this.query && this.query.size) {
        this.onRerender({ type: 'data', data: this.query.data, inRender: true });
      }
    },


    onRerender: {
      mode: _component.registerComponent.MODES.BEFORE,
      value: function value() {
        var evt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (this.query.isDestroyed) {
          this._renderResetData(evt);
        } else {
          this._processQueryEvt(evt);
        }
      }
    },

    /**
     * Generate a document fragment with all the newly added Users.
     *
     * @method _generateFragment
     * @private
     */
    _generateFragment: function _generateFragment(data, fragment) {
      var _this4 = this;

      if (!fragment) fragment = document.createDocumentFragment();
      data.forEach(function (item, index) {
        _this4._generateFragmentItem(item, fragment);
      }, this);
      return fragment;
    },


    /**
     * Generate a unique but consistent DOM ID for each layerUI.mixins.ListItem.
     *
     * @method _getItemId
     * @param {String} itemId
     * @private
     */
    _getItemId: function _getItemId(itemId) {
      return 'list-item-' + this.id + '-' + itemId.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-');
    },


    /**
     * Generate an list-item for one query result.
     *
     * @method _generateFragmentItem
     * @private
     */
    _generateFragmentItem: function _generateFragmentItem(item, fragment) {
      var itemInstance = item instanceof _layerWebsdk2.default.Root ? item : this.client.getObject(item.id);
      if (itemInstance) {
        var widget = this._generateItem(itemInstance);
        widget.parentComponent = this;
        widget.setAttribute('layer-item-id', item.id.replace(/^layer:\/\/\//, '').replace(/\//g, '_'));
        if (widget) {
          this.onGenerateListItem(widget);
          fragment.appendChild(widget);
        }
      }
    },


    /**
     * MIXIN HOOK: Each time a List Item is generated, call this so that listeners can use this.
     *
     * This is intended for Mixins to hook into; apps wanting to do processing on rendered
     * items should use `onRenderListItem`.
     *
     * @method
     * @param {layerUI.mixins.ListItem} widget
     */
    onGenerateListItem: function onGenerateListItem(widget) {
      // No-op
    },


    /**
     * Find the widgets associated with each affected item and feed it to processAffectedWidgets.
     *
     * @method _gatherAndProcessAffectedItems
     * @private
     */
    _gatherAndProcessAffectedItems: function _gatherAndProcessAffectedItems(affectedItems, isTopItemNew) {
      var _this5 = this;

      if (affectedItems.length) {
        var itemIds = affectedItems.map(function (item) {
          return _this5._getItemId(item.id);
        });
        var affectedWidgets = this.querySelectorAllArray('#' + itemIds.join(', #'));
        this._processAffectedWidgets(affectedWidgets, isTopItemNew);
      }
    },


    /**
     * For all newly added items, as well as items near them,
     * call onRenderListItem and _processAffectedWidgetsCustom to udpate
     * any rendering state needed.
     *
     * widgets are assumed to be sequential within the list.
     *
     * @method _processAffectedWidgets
     * @private
     */
    _processAffectedWidgets: function _processAffectedWidgets(widgets, isTopItemNew) {
      var _this6 = this;

      // Get the index of our first widget within listData
      var firstIndex = void 0;
      for (var i = 0; i < this.properties.listData.length; i++) {
        if (widgets.length && widgets[0].item.id === this.properties.listData[i].id) {
          firstIndex = i;
          break;
        }
      }

      // Do our internal processing of these widgets
      this._processAffectedWidgetsCustom(widgets, firstIndex, isTopItemNew);

      // Allow external processing of the widgets
      widgets.forEach(function (widget, index) {
        if (_this6.properties.onRenderListItem) {
          try {
            _this6.properties.onRenderListItem(widget, _this6.properties.listData, firstIndex + index, isTopItemNew);
          } catch (err) {
            console.error('Error in onRenderListItem for ' + widget.item.id + '; ' + err);
          }
        }
      }, this);
    },


    /**
     * Lists should override this to provide custom behaviors on newly added/affected items.
     *
     * @method _processAffectedWidgetsCustom
     * @private
     * @param {layerUI.mixins.ListItem} widgets
     * @param {Number} firstIndex - Index in the listData array of the first item in the widgets array
     * @param {Boolean} isTopItemNew - If the top item is index 0 and its a new item rather than an "affected" item, this is true.
     */
    _processAffectedWidgetsCustom: function _processAffectedWidgetsCustom(widgets, firstIndex, isTopItemNew) {},


    /**
     * Call this on any Query change events.
     *
     * TODO: This should work on the MessageList which is in Reverse Order
     *
     * @method _processQueryEvt
     * @private
     * @param {Event} evt
     */
    _processQueryEvt: function _processQueryEvt(evt) {
      switch (evt.type) {
        case 'data':
          this._renderPagedData(evt);
          break;
        case 'insert':
          this._renderInsertedData(evt);
          break;
        case 'remove':
          this._renderWithoutRemovedData(evt);
          break;
        case 'reset':
          this._renderResetData(evt);
          break;
        case 'move':
          this._renderMovedData(evt);
      }
    },


    /**
     * The query has been reset of all data, perhaps its now got a new predicate.
     *
     * Clear all data and list state
     *
     * @method _renderResetData
     * @private
     */
    _renderResetData: function _renderResetData(evt) {
      this.properties.listData = [];
      this.scrollTo(0);
      this.onRender();
    },


    /**
     * The query results have had an element move from one position to another.
     *
     * We need to update our list to reflect that change.
     *
     * @method _renderMovedData
     * @private
     */
    _renderMovedData: function _renderMovedData(evt) {
      var oldIndex = evt.fromIndex;
      var newIndex = evt.toIndex;
      var moveNode = this.childNodes[oldIndex];
      this.removeChild(moveNode);
      this.insertBefore(moveNode, this.childNodes[newIndex]);
      if (!evt.inRender) this.onRerender();
    },


    /**
     * Data has been removed from the query; remove that data from our UI.
     *
     * Calls _gatherAndProcessAffectedItems on 3 items prior and 3 items after the removed item.
     *
     * @method _renderWithoutRemovedData
     * @private
     */
    _renderWithoutRemovedData: function _renderWithoutRemovedData(evt) {
      this.properties.listData = [].concat(this.properties.query.data);
      var removeIndex = evt.index;
      var affectedItems = this.properties.listData.slice(Math.max(0, removeIndex - 3), removeIndex + 3);
      var listItem = this.querySelector('#' + this._getItemId(evt.target.id));
      if (listItem) this.removeChild(listItem);

      this._gatherAndProcessAffectedItems(affectedItems, false);
    },


    /**
     * Data has been inserted into the results; insert it into our UI list.
     *
     * @method _renderInsertedData
     * @private
     */
    _renderInsertedData: function _renderInsertedData(evt) {
      this.properties.listData = [].concat(this.properties.query.data);
      var insertIndex = evt.index;
      var affectedItems = this.properties.listData.slice(Math.max(0, insertIndex - 3), insertIndex + 4);
      var fragment = this._generateFragment([evt.target]);
      this.insertBefore(fragment, this.childNodes[insertIndex]);
      this._gatherAndProcessAffectedItems(affectedItems, insertIndex === 0);
    },


    /**
     * A new page of data has been loaded by the query; insert it into our results.
     *
     * @method _renderPagedData
     * @private
     */
    _renderPagedData: function _renderPagedData(evt) {
      var affectedItems = this.properties.listData.slice(this.properties.listData.length - 3, this.properties.listData.length).concat(evt.data);
      this.properties.listData = [].concat(this.properties.query.data);
      var fragment = this._generateFragment(evt.data);

      this.insertBefore(fragment, this.nodes.loadIndicator);

      // isTopItemNew is true if there wasn't any prior data... data length == event length
      this._gatherAndProcessAffectedItems(affectedItems, evt.data.length === this.properties.query.data.length);
      this.isDataLoading = this.properties.query.isFiring;
      if (!evt.inRender) this.onRerender();
    },


    /**
     * Run the filter on all Identity Items.
     *
     * @method _runFilter
     * @private
     */
    _runFilter: function _runFilter() {
      if (!this.filter) {
        this.querySelectorAllArray('.layer-item-filtered').forEach(function (item) {
          return item.removeClass('layer-item-filtered');
        });
      } else {
        for (var i = 0; i < this.childNodes.length; i++) {
          var listItem = this.childNodes[i];
          if (listItem.item instanceof _layerWebsdk2.default.Root) {
            listItem._runFilter(this.filter);
          }
        }
      }
    }
  }
};
},{"../base":4,"../components/component":5,"./has-query":45,"layer-websdk":66}],51:[function(require,module,exports){
/**
 * A Mixin for main components (not needed for subcomponents) that provides common properties, shortcuts and code.
 *
 * @class layerUI.mixins.MainComponent
 */
'use strict';

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

var _base = require('../base');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


module.exports = {
  properties: {
    /**
     * Is this component a Main Component (high level for use by third party apps).
     *
     * Used by adapters to find components to adapt.
     * @private
     * @readonly
     * @property {Boolean} [_isMainComponent=true]
     */
    _isMainComponent: {
      value: true
    },

    /**
     * An App ID can be provided as a property; this allows the app to find its Client.
     *
     * App IDs are typically provided via:
     *
     * ```
     * layerUI.init(({ appId: myAppId })
     * ```
     *
     * The only time one would use this property
     * is if building an app that used multiple App IDs.
     *
     * @property {String} [appId=""]
     */
    appId: {
      order: 1,
      set: function set(value) {
        var _this = this;

        if (value && value.indexOf('layer:///') === 0) {
          var client = _layerWebsdk2.default.Client.getClient(value);
          if (client) {
            this.client = client;
          } else if (_layerWebsdk2.default.Client.addListenerForNewClient) {
            // Wait for the next client with this appId to be registered and then assign it.
            _layerWebsdk2.default.Client.addListenerForNewClient(function (newClient) {
              return _this.client = newClient;
            }, value);
          } else {
            throw new Error('You must create a Layer.Core.Client with your appId before creating this component. Or upgrade to Layer WebSDK 3.2.2 or above.');
          }
        }
      }
    },

    /**
     * The Layer.Core.Client can be passed in via the `client` property or the `appId` property.
     *
     * App IDs are typically provided via:
     *
     * ```
     * layerUI.init(({ appId: myAppId })
     * ```
     *
     * The only time one would use this property
     * is if building an app that used multiple Clients.
     *
     * @property {Layer.Core.Client} [client=null]
     */
    client: {
      order: 2,
      set: function set(value) {
        var _this2 = this;

        if (value) {
          if (value.telemetryMonitor) {
            value.telemetryMonitor.on('telemetry-environment', function (evt) {
              evt.environment.layer_ui_sdk_version = _base.version;
            });
          }
          value.on('destroy', function (evt) {
            if (evt.target === value) _this2.properties.client = null;
          }, this);
        }
      }
    }
  },
  methods: {
    onCreate: function onCreate() {
      if (_base.settings.appId) this.appId = _base.settings.appId;
      var useSafariCss = navigator.vendor && navigator.vendor.indexOf('Apple') > -1;
      if (useSafariCss) this.classList.add('safari');
    }
  }
};
},{"../base":4,"layer-websdk":66}],52:[function(require,module,exports){
/**
 * A Message Handler Mixin that provides common properties and behaviors for implementing a Card.
 *
 * ```
 * import MessageHandler from 'layer-ui-web/lib/mixins/message-handler';
 * layerUI.registerComponent('sample-message-handler', {
 *     mixins: [MessageHandler],
 *     methods: {
 *         onCreate() {
 *            // If using a template, your dom nodes will already be setup,
 *            // and you can wire up UI event handlers here.
 *            // Do any DOM creation/manipulation that does not depend upon the message here.
 *         },
 *
 *         onSent() {
 *           // If you are rendering messages before they are sent, and need special processing of them once they ARE sent,
 *           // put your special processing in here
 *         },
 *
 *         // Your onRender method is called once the message property is set.
 *         onRender() {
 *            // DOM Manipulation Here
 *         },
 *
 *         // Your onRerender method is called by onRender, and called any time the Message
 *         // changes; all dynamic rendering goes in onRerender.
 *         onRerender() {
 *             // DOM Manipulation Here
 *         }
 *     }
 * });
 *
 * // If a template is needed, register a template for your component using a String;
 * // Note that layer-id will allow you to access these nodes directly as this.nodes.description
 * // or this.nodes.checkox
 * layerUI.buildAndRegisterTemplate('sample-message-handler', '<label layer-id="label">Approve Purchase</label>' +
 *    '<input type="checkbox" layer-id="checkbox" /><div layer-id="description"></div>');
 *
 * // OR Register a template for your component using a <template /> DOM node:
 * layerUI.registerTemplate('sample-message-handler', myTemplateNode);
 * ```
 *
 * If you need to add side effects to setting the `message` property, you can add a message setter; it will be
 * called before the MessageHandlerMixin's message setter:
 *
 * ```
 * layerUI.registerComponent('sample-message-handler', {
 *   mixins: [MessageHandler],
 *   properties: {
 *     message: {
 *       setter: function(value) {
 *         this.properties.data = value.parts[0].body;
 *       }
 *     }
 *   },
 *   methods: {
 *     onRender: function() {
 *       this.innerHTML = this.properties.data;
 *     }
 *   }
 * });
 * ```
 *
 * @class layerUI.mixins.MessageHandler
 */
'use strict';

var _component = require('../components/component');

module.exports = {
  properties: {
    /**
     * The Layer.Core.Message to be rendered.
     *
     * @property {Layer.Core.Message} message
     */
    message: {
      mode: _component.registerComponent.MODES.AFTER,
      set: function set() {
        this.onRender();
        this.message.on('messages:change', this._onChange, this);
        if (this.message.isNew()) this.message.once('messages:sent', this.onSent, this);
      }
    }
  },
  methods: {

    /**
     * Your onRender method is called once the message property is set.
     *
     * Any call to onRender will also call onRerender
     * which may handle some more dynamic rendering.
     *
     * @method onRender
     */
    onRender: {
      conditional: function onCanRender() {
        return Boolean(this.message && !this.message.isDestroyed);
      },
      mode: _component.registerComponent.MODES.AFTER,
      value: function onRender() {
        this.onRerender();
      }
    },

    /**
     * Your onRerender method handles any dynamic rendering.
     *
     * It should be called when:
     *
     * * Your Layer.Core.Message is first rendered
     * * Your Layer.Core.Message triggers any `messages:change` events
     * * Any outside events that influence rendering occur (though this is in your control)
     *
     * @method onRerender
     */
    onRerender: function onRerender() {},


    /**
     * Whenever the message changes, call onRerender().
     *
     * Unless of course, the message is new, and unsent, and we're actually
     * rendering a Message Preview, in which case call onRender.
     *
     * Rationale: When the message is new, anything/everything can change, requiring a full rerendering.
     * Once sent, only specific things can change, such as read receipts.
     *
     * @method _onChange
     * @private
     */
    _onChange: function _onChange() {
      if (this.message.isNew()) {
        this.onRender();
      } else {
        this.onRerender();
      }
    },


    /**
     * Your onSent method will be called if you rendered the message prior to sending it.
     *
     * Use this if there is any change to your message that need to be made after its been sent.
     *
     * @method onSent
     */
    onSent: function onSent() {}
  }
};
},{"../components/component":5}],53:[function(require,module,exports){
/**
 * A helper mixin for Lists that want an indicator to render when paging through data, that there is no more data to page in.
 *
 * This is not a necessary feature, but is nicer than just failing to show a "Loading messages" message and assuming that they can
 * take a hint.
 *
 * Note that `isEndOfResults` is always `false` if a query has no results.
 *
 * This mixin requires "layer-id=endOfResultsNode" to exist in the template for any component using this mixin.
 *
 * @class layerUI.mixins.QueryEndIndicator
 */
'use strict';


module.exports = {
  properties: {
    /**
     * If the query has no more data to load but is not empty, this should be true.
     *
     * @property {Boolean} [isEndOfResults=false]
     * @readonly
     */
    isEndOfResults: {
      value: false,
      set: function set(value) {
        this.classList[value && !this.isEmptyList ? 'add' : 'remove']('layer-end-of-results');
      }
    },

    /**
     * A dom node to render when there are no messages in the list.
     *
     * Could just be a message "Empty Conversation".  Or you can add interactive widgets.
     * Note that using the default template, this widget may be wrapped in a div with CSS class `layer-header-toggle`,
     * you should insure that they height of this toggle does not change when your custom node is shown.  Set the
     * style height to be at least as tall as your custom node.
     *
     * @property {HTMLElement} [endOfResultsNode=null]
     */
    endOfResultsNode: {
      set: function set(value) {
        this.nodes.endOfResultsNode.innerHTML = '';
        if (value) this.nodes.endOfResultsNode.appendChild(value);
      }
    }
  },
  methods: {
    onRender: function onRender() {
      if (this.endOfResultsNode) this.nodes.endOfResultsNode.appendChild(this.endOfResultsNode);
    },


    /**
     * Call this after rendering any query-paged data.
     *
     * @method _renderPagedDataDone
     * @private
     * @param {Event} evt
     */
    _renderPagedDataDone: function _renderPagedDataDone() {
      var evt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (this.query.isDestroyed) {
        this.isEndOfResults = false;
      } else {
        this.isEndOfResults = this.query.pagedToEnd;
      }
    }
  }
};
},{}],54:[function(require,module,exports){
/**
 * A helper mixin for Lists that render alternate text in the event that the list is Empty.
 *
 * @class layerUI.mixins.StateManager
 */
"use strict";


module.exports = {
  properties: {
    /**
     * This state property enables your application to  expose application state to the widget.
     *
     * A flux app for example, might pass its state and actions into this property in order
     * to make it available to all widgets of the DOM subtree.
     *
     * ```
     * widget.state = {
     *   reduxState: {
     *      a: this.props.a,
     *      b: this.props.b
     *   },
     *   reduxActions: {
     *      action1: this.props.actions.action1,
     *      action2: this.props.actions.action2
     *   }
     * };
     * ```
     *
     * Which can then be accessed from within any widget using:
     *
     * ```
     * this.state.reduxActions.action1();
     * ```
     *
     * Note that state properties are propagated during the `onAfterCreate` event, and as such, may not yet be set in `onCreate`
     * nor in `onAfterCreate`.  Subcomponents may not see the state until after the first `onRender` call.
     *
     * TODO: Prevent subcomponent `onRender` from calling without `state`; must handle case where `state` property is unused.
     *
     * @property {Object} state
     */
    state: {
      propagateToChildren: true,
      set: function set(newState) {
        if (this.onRenderState) this.onRenderState();
      }
    }
    /**
     * MIXIN HOOK: onRenderState is called whenever a new state object is assigned.
     *
     * This is for use sharing a state object across your entire app,
     * or an entire set of LUI components.
     *
     * @method onRenderState
     */
  }
};
},{}],55:[function(require,module,exports){
/**
 * Use this module to put a date separator between Messages from different dates in your Messages List.
 *
 * ```
 * conversationPanel.onRenderListItem = layerUI.utils.dateSeparator;
 * ```
 *
 * Or if you have multiple `onRenderListItem` handlers:
 *
 * ```
 * conversationPanel.onRenderListItem = function(widget, messages, index, isTopItem) {
 *     layerUI.utils.dateSeparator(widget, messages, index);
 *     handler2(widget, messages, index, isTopItem);
 *     handler3(widget, messages, index, isTopItem);
 * }
 * ```
 *
 * Date separators come as `<div class='layer-list-item-separator-date'><span>DATE</span></div>`
 *
 * @class layerUI.utils.DateSeparator
 */
'use strict';

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dateClassName = 'layer-list-item-separator-date';


module.exports = _base.utils.dateSeparator = function (widget, messages, index) {
  if (index > messages.length) return;
  var message = widget.item;
  var needsBoundary = index === 0 || message.sentAt.toDateString() !== messages[index - 1].sentAt.toDateString();

  if (needsBoundary) {
    var options = { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit' };
    var dateStr = messages[index].sentAt.toLocaleDateString(undefined, options);
    _base2.default.addListItemSeparator(widget, '<span>' + dateStr + '</span>', dateClassName, true);
  } else {
    _base2.default.addListItemSeparator(widget, '', dateClassName, true);
  }
};
},{"../base":4}],56:[function(require,module,exports){
/**
 * This is a utility class which you can use to watch for user dragging and dropping
 * files from their file system into your app as part of a "Send Attached Message" action.
 *
 * ```
 * var dropWatcher = new layerUI.files.DragAndDropFileWatcher({
 *   node: dropBoxNode,
 *   callback: sendAttachment,
 *   allowDocumentDrop: false
 * });
 * function sendAttachment(messageParts) {
 *    currentConversation.createMessage({ parts: messageParts }).send();
 * }
 *
 * // If you finish with this component, call destroy to unsubscribe from all events and remove all pointers
 * dropWatcher.destroy();
 * ```
 *
 * @class layerUI.utils.files.DragAndDropFileWatcher
 * @param {Object} options
 * @param {HTMLElement|String} options.node - The dom node (or dom node ID) to watch for files/file-drag events
 * @param {Function} options.callback - The function to call when a file is dropped
 * @param {Layer.Core.MessagePart[]} options.callback.parts - The MessageParts representing the dropped files, which you can modify and send.
 * @param {Boolean} [options.allowDocumentDrop=false] - By default, this utility adds an event handler to prevent the browser from navigating away from your
 *         app to view a file dropped in some other part of your app. If you need to handle this event yourself, set this to true.
 */
'use strict';

var _loadImage = require('blueimp-load-image/js/load-image');

var _loadImage2 = _interopRequireDefault(_loadImage);

require('blueimp-load-image/js/load-image-orientation');

require('blueimp-load-image/js/load-image-meta');

require('blueimp-load-image/js/load-image-exif');

var _layerWebsdk = require('layer-websdk');

var _layerWebsdk2 = _interopRequireDefault(_layerWebsdk);

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _sizing = require('./sizing');

var _sizing2 = _interopRequireDefault(_sizing);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Files = {};
module.exports = Files;

window.loadImage = _loadImage2.default;


Files.DragAndDropFileWatcher = function DragAndDropFileWatcher(options) {
  this.node = typeof options.node === 'string' ? document.getElementById(options.node) : options.node;
  this.callback = options.callback;
  this.allowDocumentDrop = Boolean(options.allowDocumentDrop);

  this.onDragOverBound = this.onDragOver.bind(this);
  this.onDragEndBound = this.onDragEnd.bind(this);
  this.onFileDropBound = this.onFileDrop.bind(this);
  this.ignoreDropBound = this.ignoreDrop.bind(this);

  // Tells the browser that we *can* drop on this target
  this.node.addEventListener('dragover', this.onDragOverBound, false);
  this.node.addEventListener('dragenter', this.onDragOverBound, false);

  this.node.addEventListener('dragend', this.onDragEndBound, false);
  this.node.addEventListener('dragleave', this.onDragEndBound, false);

  this.node.addEventListener('drop', this.onFileDropBound, false);

  if (!this.allowDocumentDrop) {
    document.addEventListener('drop', this.ignoreDropBound, false);
    document.addEventListener('dragenter', this.ignoreDropBound, false);
    document.addEventListener('dragover', this.ignoreDropBound, false);
  }
};

/**
 * Destroy this component, in particular, remove any handling of any events.
 *
 * @method
 */
Files.DragAndDropFileWatcher.prototype.destroy = function destroy() {
  this.node.removeEventListener('dragover', this.onDragOverBound, false);
  this.node.removeEventListener('dragenter', this.onDragOverBound, false);

  this.node.removeEventListener('dragend', this.onDragEndBound, false);
  this.node.removeEventListener('dragleave', this.onDragEndBound, false);

  this.node.removeEventListener('drop', this.onFileDropBound, false);

  if (!this.allowDocumentDrop) {
    document.removeEventListener('drop', this.ignoreDropBound, false);
    document.removeEventListener('dragenter', this.ignoreDropBound, false);
    document.removeEventListener('dragover', this.ignoreDropBound, false);
  }
  delete this.node;
  delete this.callback;
};

/**
 * Whatever it is that the browser wants to do by default with this file,
 * prevent it.  Why? Well, one of the more annoying thing it may do
 * is navigate away from your app to show this file.
 *
 * @method
 * @private
 */
Files.DragAndDropFileWatcher.prototype.ignoreDrop = function ignoreDrop(evt) {
  if (evt.preventDefault) {
    evt.preventDefault();
    evt.stopPropagation();
  }
  return false;
};

/**
 * On hovering with a file, add a css class
 *
 * @method
 * @private
 */
Files.DragAndDropFileWatcher.prototype.onDragOver = function onDragOver(evt) {
  this.node.classList.add('layer-file-drag-and-drop-hover');
  evt.preventDefault();
  return false;
};

/**
 * On un-hovering with a file, remove a css class
 *
 * @method
 * @private
 */
Files.DragAndDropFileWatcher.prototype.onDragEnd = function onDragEnd(evt) {
  this.node.classList.remove('layer-file-drag-and-drop-hover');
};

/**
 * On file drop, generate an array of Message Parts and pass it on to app.
 *
 * @method
 * @private
 */
Files.DragAndDropFileWatcher.prototype.onFileDrop = function onFileDrop(evt) {
  this.onDragEnd();

  // stops the browser from redirecting off to the image.
  if (evt.preventDefault) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  var dt = evt.dataTransfer;
  var parts = Array.prototype.map.call(dt.files, function (file) {
    return new _layerWebsdk2.default.MessagePart(file);
  });

  Files.processAttachments(parts, this.callback);
  return false;
};

/**
 * Adds data to your message.
 *
 * Given an array of Message Parts, determines if it needs to generate image or video
 * previews and metadata message parts before calling your callback.
 *
 * @method processAttachments
 * @param {Layer.Core.MessagePart[]} parts    Input MessagParts, presumably an array of one element
 * @param {Function} callback            Callback on completion; may be called synchronously
 * @param {Layer.Core.MessagePart[]} callback.parts  The MessageParts to send in your Message
 */
Files.processAttachments = function processAttachments(parts, callback) {
  // TODO: Need a way to register additional handlers; currently relies on the callback for additional handling.
  parts.forEach(function (part) {
    if (['image/gif', 'image/png', 'image/jpeg'].indexOf(part.mimeType) !== -1) {
      Files.generateImageMessageParts(part, callback);
    } else if (part.mimeType === 'video/mp4') {
      Files.generateVideoMessageParts(part, callback);
    } else if (callback) {
      callback([part]);
    }
  });
};

Files.generateImageMessageParts = function generateImageMessageParts(part, callback) {
  // First part is the original image; the rest of the code is for generating the other 2 parts of the 3 part Image
  var parts = [part];
  var orientation = 0;

  // STEP 1: Determine the correct orientation for the image
  _loadImage2.default.parseMetaData(part.body, onParseMetadata);

  function onParseMetadata(data) {
    var options = {
      canvas: true
    };

    if (data.imageHead && data.exif) {
      orientation = options.orientation = data.exif[0x0112] || orientation;
    }

    // STEP 2: Write the image to a canvas with the specified orientation
    (0, _loadImage2.default)(part.body, onWriteImage, options);
  }

  function onWriteImage(srcCanvas) {
    // STEP 3: Scale the image down to Preview Size
    var originalSize = {
      width: srcCanvas.width,
      height: srcCanvas.height
    };

    var size = (0, _sizing2.default)(originalSize, _base2.default.settings.maxSizes);
    var canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    var context = canvas.getContext('2d');

    // context.scale(size.width, size.height);
    context.fillStyle = context.strokeStyle = 'white';
    context.fillRect(0, 0, size.width, size.height);
    context.drawImage(srcCanvas, 0, 0, size.width, size.height);

    // STEP 4: Turn the canvas into a jpeg image for our Preview Image
    var binStr = atob(canvas.toDataURL('image/jpeg').split(',')[1]);
    var len = binStr.length;
    var arr = new Uint8Array(len);

    for (var i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }
    var blob = new Blob([arr], { type: 'image/jpeg' });

    // STEP 5: Create our Preview Message Part
    parts.push(new _layerWebsdk2.default.MessagePart({
      body: blob,
      mimeType: 'image/jpeg+preview'
    }));

    // STEP 6: Create the Metadata Message Part
    parts.push(new _layerWebsdk2.default.MessagePart({
      mimeType: 'application/json+imageSize',
      body: JSON.stringify({
        orientation: orientation,
        width: originalSize.width,
        height: originalSize.height,
        previewWidth: canvas.width,
        previewHeight: canvas.height
      })
    }));
    callback(parts);
  }
};

Files.generateVideoMessageParts = function generateVideoMessageParts(part, callback) {
  var parts = [part];
  var video = document.createElement('video');

  video.addEventListener('loadedmetadata', function () {
    var originalSize = {
      width: video.videoWidth,
      height: video.videoHeight
    };

    var size = (0, _sizing2.default)(originalSize, _base2.default.settings.maxSizes);

    var canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    var context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    var binStr = atob(canvas.toDataURL('image/jpeg').split(',')[1]);
    var len = binStr.length;
    var arr = new Uint8Array(len);

    for (var i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }

    parts.push(new _layerWebsdk2.default.MessagePart({
      body: new Blob([arr], { type: 'image/jpeg' }),
      mimeType: 'image/jpeg+preview'
    }));

    parts.push(new _layerWebsdk2.default.MessagePart({
      mimeType: 'application/json+imageSize',
      body: '{"orientation":0, "width":' + originalSize.width + ', "height":' + originalSize.height + '}'
    }));

    if (callback) callback(parts);
  });

  video.src = URL.createObjectURL(part.body);
};
},{"../base":4,"./sizing":58,"blueimp-load-image/js/load-image":65,"blueimp-load-image/js/load-image-exif":61,"blueimp-load-image/js/load-image-meta":62,"blueimp-load-image/js/load-image-orientation":63,"layer-websdk":66}],57:[function(require,module,exports){
'use strict';

/*
 * isURL returns a Regular Expression that can be used to test if a string is a URL ending in any of the specified extensions.
 *
 * @class layerUI.utils.isURL
 * @singleton
 */

module.exports = function isURL(extensions) {
  var resource = '?';

  /* istanbul ignore else */
  if (extensions) resource = '.(' + extensions.join('|') + ')';

  // Taken from https://gist.github.com/dperini/729294
  return new RegExp(
  // protocol identifier
  '(?:(?:https?|ftp)://)' +
  // user:pass authentication
  '(?:\\S+(?::\\S*)?@)?' + '(?:' +
  // IP address exclusion
  // private & local networks
  '(?!(?:10|127)(?:\\.\\d{1,3}){3})' + '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' + '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
  // IP address dotted notation octets
  // excludes loopback network 0.0.0.0
  // excludes reserved space >= 224.0.0.0
  // excludes network & broacast addresses
  // (first & last IP address of each class)
  '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' + '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' + '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' + '|' +
  // host name
  '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
  // domain name
  '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
  // TLD identifier
  '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' +
  // TLD may end with dot
  '\\.?' + ')' +
  // port number
  '(?::\\d{2,5})?' +
  // resource path
  '(?:[/?#]\\S*)' + resource, 'igm');
};
},{}],58:[function(require,module,exports){
"use strict";

// NOTE: dimensions must contains width and height properties.
module.exports = function (dimensions, maxSizes) {

  if (!dimensions) return maxSizes;

  var size = {
    width: dimensions.previewWidth || dimensions.width,
    height: dimensions.previewHeight || dimensions.height
  };

  // Scale dimensions down to our maximum sizes if needed
  if (size.width > maxSizes.width) {
    var width = size.width;
    size.width = maxSizes.width;
    size.height = size.height * maxSizes.width / width;
  }
  if (size.height > maxSizes.height) {
    var height = size.height;
    size.height = maxSizes.height;
    size.width = size.width * maxSizes.height / height;
  }

  // Return scaled sizes
  return {
    width: Math.round(size.width),
    height: Math.round(size.height)
  };
};
},{}],59:[function(require,module,exports){
(function (window) {
    var requestAnimFrame = (function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(callback){window.setTimeout(callback,1000/60);};})();

    var easeInOutQuad = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    };

    var animatedScrollTo = function (element, to, duration, callback) {
        var start = element.scrollTop,
        change = to - start,
        animationStart = +new Date();
        var animating = true;
        var lastpos = null;

        var animateScroll = function() {
            if (!animating) {
                return;
            }
            requestAnimFrame(animateScroll);
            var now = +new Date();
            var val = Math.floor(easeInOutQuad(now - animationStart, start, change, duration));
            if (lastpos) {
                if (lastpos === element.scrollTop) {
                    lastpos = val;
                    element.scrollTop = val;
                } else {
                    animating = false;
                }
            } else {
                lastpos = val;
                element.scrollTop = val;
            }
            if (now > animationStart + duration) {
                element.scrollTop = to;
                animating = false;
                if (callback) { callback(); }
            }
        };
        requestAnimFrame(animateScroll);
        return function cancel() {
            animating = false;
        };
    };

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = animatedScrollTo;
    } else {
        window.animatedScrollTo = animatedScrollTo;
    }
})(window);

},{}],60:[function(require,module,exports){
/*!
 * Autolinker.js
 * 1.4.4
 *
 * Copyright(c) 2017 Gregory Jacobs <greg@greg-jacobs.com>
 * MIT License
 *
 * https://github.com/gregjacobs/Autolinker.js
 */
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Autolinker = factory();
  }
}(this, function() {
/**
 * @class Autolinker
 * @extends Object
 *
 * Utility class used to process a given string of text, and wrap the matches in
 * the appropriate anchor (&lt;a&gt;) tags to turn them into links.
 *
 * Any of the configuration options may be provided in an Object (map) provided
 * to the Autolinker constructor, which will configure how the {@link #link link()}
 * method will process the links.
 *
 * For example:
 *
 *     var autolinker = new Autolinker( {
 *         newWindow : false,
 *         truncate  : 30
 *     } );
 *
 *     var html = autolinker.link( "Joe went to www.yahoo.com" );
 *     // produces: 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>'
 *
 *
 * The {@link #static-link static link()} method may also be used to inline
 * options into a single call, which may be more convenient for one-off uses.
 * For example:
 *
 *     var html = Autolinker.link( "Joe went to www.yahoo.com", {
 *         newWindow : false,
 *         truncate  : 30
 *     } );
 *     // produces: 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>'
 *
 *
 * ## Custom Replacements of Links
 *
 * If the configuration options do not provide enough flexibility, a {@link #replaceFn}
 * may be provided to fully customize the output of Autolinker. This function is
 * called once for each URL/Email/Phone#/Hashtag/Mention (Twitter, Instagram)
 * match that is encountered.
 *
 * For example:
 *
 *     var input = "...";  // string with URLs, Email Addresses, Phone #s, Hashtags, and Mentions (Twitter, Instagram)
 *
 *     var linkedText = Autolinker.link( input, {
 *         replaceFn : function( match ) {
 *             console.log( "href = ", match.getAnchorHref() );
 *             console.log( "text = ", match.getAnchorText() );
 *
 *             switch( match.getType() ) {
 *                 case 'url' :
 *                     console.log( "url: ", match.getUrl() );
 *
 *                     if( match.getUrl().indexOf( 'mysite.com' ) === -1 ) {
 *                         var tag = match.buildTag();  // returns an `Autolinker.HtmlTag` instance, which provides mutator methods for easy changes
 *                         tag.setAttr( 'rel', 'nofollow' );
 *                         tag.addClass( 'external-link' );
 *
 *                         return tag;
 *
 *                     } else {
 *                         return true;  // let Autolinker perform its normal anchor tag replacement
 *                     }
 *
 *                 case 'email' :
 *                     var email = match.getEmail();
 *                     console.log( "email: ", email );
 *
 *                     if( email === "my@own.address" ) {
 *                         return false;  // don't auto-link this particular email address; leave as-is
 *                     } else {
 *                         return;  // no return value will have Autolinker perform its normal anchor tag replacement (same as returning `true`)
 *                     }
 *
 *                 case 'phone' :
 *                     var phoneNumber = match.getPhoneNumber();
 *                     console.log( phoneNumber );
 *
 *                     return '<a href="http://newplace.to.link.phone.numbers.to/">' + phoneNumber + '</a>';
 *
 *                 case 'hashtag' :
 *                     var hashtag = match.getHashtag();
 *                     console.log( hashtag );
 *
 *                     return '<a href="http://newplace.to.link.hashtag.handles.to/">' + hashtag + '</a>';
 *
 *                 case 'mention' :
 *                     var mention = match.getMention();
 *                     console.log( mention );
 *
 *                     return '<a href="http://newplace.to.link.mention.to/">' + mention + '</a>';
 *             }
 *         }
 *     } );
 *
 *
 * The function may return the following values:
 *
 * - `true` (Boolean): Allow Autolinker to replace the match as it normally
 *   would.
 * - `false` (Boolean): Do not replace the current match at all - leave as-is.
 * - Any String: If a string is returned from the function, the string will be
 *   used directly as the replacement HTML for the match.
 * - An {@link Autolinker.HtmlTag} instance, which can be used to build/modify
 *   an HTML tag before writing out its HTML text.
 *
 * @constructor
 * @param {Object} [cfg] The configuration options for the Autolinker instance,
 *   specified in an Object (map).
 */
var Autolinker = function( cfg ) {
	cfg = cfg || {};

	this.version = Autolinker.version;

	this.urls = this.normalizeUrlsCfg( cfg.urls );
	this.email = typeof cfg.email === 'boolean' ? cfg.email : true;
	this.phone = typeof cfg.phone === 'boolean' ? cfg.phone : true;
	this.hashtag = cfg.hashtag || false;
	this.mention = cfg.mention || false;
	this.newWindow = typeof cfg.newWindow === 'boolean' ? cfg.newWindow : true;
	this.stripPrefix = this.normalizeStripPrefixCfg( cfg.stripPrefix );
	this.stripTrailingSlash = typeof cfg.stripTrailingSlash === 'boolean' ? cfg.stripTrailingSlash : true;

	// Validate the value of the `mention` cfg
	var mention = this.mention;
	if( mention !== false && mention !== 'twitter' && mention !== 'instagram' ) {
		throw new Error( "invalid `mention` cfg - see docs" );
	}

	// Validate the value of the `hashtag` cfg
	var hashtag = this.hashtag;
	if( hashtag !== false && hashtag !== 'twitter' && hashtag !== 'facebook' && hashtag !== 'instagram' ) {
		throw new Error( "invalid `hashtag` cfg - see docs" );
	}

	this.truncate = this.normalizeTruncateCfg( cfg.truncate );
	this.className = cfg.className || '';
	this.replaceFn = cfg.replaceFn || null;
	this.context = cfg.context || this;

	this.htmlParser = null;
	this.matchers = null;
	this.tagBuilder = null;
};



/**
 * Automatically links URLs, Email addresses, Phone Numbers, Twitter handles,
 * Hashtags, and Mentions found in the given chunk of HTML. Does not link URLs
 * found within HTML tags.
 *
 * For instance, if given the text: `You should go to http://www.yahoo.com`,
 * then the result will be `You should go to &lt;a href="http://www.yahoo.com"&gt;http://www.yahoo.com&lt;/a&gt;`
 *
 * Example:
 *
 *     var linkedText = Autolinker.link( "Go to google.com", { newWindow: false } );
 *     // Produces: "Go to <a href="http://google.com">google.com</a>"
 *
 * @static
 * @param {String} textOrHtml The HTML or text to find matches within (depending
 *   on if the {@link #urls}, {@link #email}, {@link #phone}, {@link #mention},
 *   {@link #hashtag}, and {@link #mention} options are enabled).
 * @param {Object} [options] Any of the configuration options for the Autolinker
 *   class, specified in an Object (map). See the class description for an
 *   example call.
 * @return {String} The HTML text, with matches automatically linked.
 */
Autolinker.link = function( textOrHtml, options ) {
	var autolinker = new Autolinker( options );
	return autolinker.link( textOrHtml );
};



/**
 * Parses the input `textOrHtml` looking for URLs, email addresses, phone
 * numbers, username handles, and hashtags (depending on the configuration
 * of the Autolinker instance), and returns an array of {@link Autolinker.match.Match}
 * objects describing those matches (without making any replacements).
 *
 * Note that if parsing multiple pieces of text, it is slightly more efficient
 * to create an Autolinker instance, and use the instance-level {@link #parse}
 * method.
 *
 * Example:
 *
 *     var matches = Autolinker.parse( "Hello google.com, I am asdf@asdf.com", {
 *         urls: true,
 *         email: true
 *     } );
 *
 *     console.log( matches.length );           // 2
 *     console.log( matches[ 0 ].getType() );   // 'url'
 *     console.log( matches[ 0 ].getUrl() );    // 'google.com'
 *     console.log( matches[ 1 ].getType() );   // 'email'
 *     console.log( matches[ 1 ].getEmail() );  // 'asdf@asdf.com'
 *
 * @static
 * @param {String} textOrHtml The HTML or text to find matches within
 *   (depending on if the {@link #urls}, {@link #email}, {@link #phone},
 *   {@link #hashtag}, and {@link #mention} options are enabled).
 * @param {Object} [options] Any of the configuration options for the Autolinker
 *   class, specified in an Object (map). See the class description for an
 *   example call.
 * @return {Autolinker.match.Match[]} The array of Matches found in the
 *   given input `textOrHtml`.
 */
Autolinker.parse = function( textOrHtml, options ) {
	var autolinker = new Autolinker( options );
	return autolinker.parse( textOrHtml );
};


/**
 * @static
 * @property {String} version (readonly)
 *
 * The Autolinker version number in the form major.minor.patch
 *
 * Ex: 0.25.1
 */
Autolinker.version = '1.4.4';


Autolinker.prototype = {
	constructor : Autolinker,  // fix constructor property

	/**
	 * @cfg {Boolean/Object} [urls]
	 *
	 * `true` if URLs should be automatically linked, `false` if they should not
	 * be. Defaults to `true`.
	 *
	 * Examples:
	 *
	 *     urls: true
	 *
	 *     // or
	 *
	 *     urls: {
	 *         schemeMatches : true,
	 *         wwwMatches    : true,
	 *         tldMatches    : true
	 *     }
	 *
	 * As shown above, this option also accepts an Object form with 3 properties
	 * to allow for more customization of what exactly gets linked. All default
	 * to `true`:
	 *
	 * @cfg {Boolean} [urls.schemeMatches] `true` to match URLs found prefixed
	 *   with a scheme, i.e. `http://google.com`, or `other+scheme://google.com`,
	 *   `false` to prevent these types of matches.
	 * @cfg {Boolean} [urls.wwwMatches] `true` to match urls found prefixed with
	 *   `'www.'`, i.e. `www.google.com`. `false` to prevent these types of
	 *   matches. Note that if the URL had a prefixed scheme, and
	 *   `schemeMatches` is true, it will still be linked.
	 * @cfg {Boolean} [urls.tldMatches] `true` to match URLs with known top
	 *   level domains (.com, .net, etc.) that are not prefixed with a scheme or
	 *   `'www.'`. This option attempts to match anything that looks like a URL
	 *   in the given text. Ex: `google.com`, `asdf.org/?page=1`, etc. `false`
	 *   to prevent these types of matches.
	 */

	/**
	 * @cfg {Boolean} [email=true]
	 *
	 * `true` if email addresses should be automatically linked, `false` if they
	 * should not be.
	 */

	/**
	 * @cfg {Boolean} [phone=true]
	 *
	 * `true` if Phone numbers ("(555)555-5555") should be automatically linked,
	 * `false` if they should not be.
	 */

	/**
	 * @cfg {Boolean/String} [hashtag=false]
	 *
	 * A string for the service name to have hashtags (ex: "#myHashtag")
	 * auto-linked to. The currently-supported values are:
	 *
	 * - 'twitter'
	 * - 'facebook'
	 * - 'instagram'
	 *
	 * Pass `false` to skip auto-linking of hashtags.
	 */

	/**
	 * @cfg {String/Boolean} [mention=false]
	 *
	 * A string for the service name to have mentions (ex: "@myuser")
	 * auto-linked to. The currently supported values are:
	 *
	 * - 'twitter'
	 * - 'instagram'
	 *
	 * Defaults to `false` to skip auto-linking of mentions.
	 */

	/**
	 * @cfg {Boolean} [newWindow=true]
	 *
	 * `true` if the links should open in a new window, `false` otherwise.
	 */

	/**
	 * @cfg {Boolean/Object} [stripPrefix]
	 *
	 * `true` if 'http://' (or 'https://') and/or the 'www.' should be stripped
	 * from the beginning of URL links' text, `false` otherwise. Defaults to
	 * `true`.
	 *
	 * Examples:
	 *
	 *     stripPrefix: true
	 *
	 *     // or
	 *
	 *     stripPrefix: {
	 *         scheme : true,
	 *         www    : true
	 *     }
	 *
	 * As shown above, this option also accepts an Object form with 2 properties
	 * to allow for more customization of what exactly is prevented from being
	 * displayed. Both default to `true`:
	 *
	 * @cfg {Boolean} [stripPrefix.scheme] `true` to prevent the scheme part of
	 *   a URL match from being displayed to the user. Example:
	 *   `'http://google.com'` will be displayed as `'google.com'`. `false` to
	 *   not strip the scheme. NOTE: Only an `'http://'` or `'https://'` scheme
	 *   will be removed, so as not to remove a potentially dangerous scheme
	 *   (such as `'file://'` or `'javascript:'`)
	 * @cfg {Boolean} [stripPrefix.www] www (Boolean): `true` to prevent the
	 *   `'www.'` part of a URL match from being displayed to the user. Ex:
	 *   `'www.google.com'` will be displayed as `'google.com'`. `false` to not
	 *   strip the `'www'`.
	 */

	/**
	 * @cfg {Boolean} [stripTrailingSlash=true]
	 *
	 * `true` to remove the trailing slash from URL matches, `false` to keep
	 *  the trailing slash.
	 *
	 *  Example when `true`: `http://google.com/` will be displayed as
	 *  `http://google.com`.
	 */

	/**
	 * @cfg {Number/Object} [truncate=0]
	 *
	 * ## Number Form
	 *
	 * A number for how many characters matched text should be truncated to
	 * inside the text of a link. If the matched text is over this number of
	 * characters, it will be truncated to this length by adding a two period
	 * ellipsis ('..') to the end of the string.
	 *
	 * For example: A url like 'http://www.yahoo.com/some/long/path/to/a/file'
	 * truncated to 25 characters might look something like this:
	 * 'yahoo.com/some/long/pat..'
	 *
	 * Example Usage:
	 *
	 *     truncate: 25
	 *
	 *
	 *  Defaults to `0` for "no truncation."
	 *
	 *
	 * ## Object Form
	 *
	 * An Object may also be provided with two properties: `length` (Number) and
	 * `location` (String). `location` may be one of the following: 'end'
	 * (default), 'middle', or 'smart'.
	 *
	 * Example Usage:
	 *
	 *     truncate: { length: 25, location: 'middle' }
	 *
	 * @cfg {Number} [truncate.length=0] How many characters to allow before
	 *   truncation will occur. Defaults to `0` for "no truncation."
	 * @cfg {"end"/"middle"/"smart"} [truncate.location="end"]
	 *
	 * - 'end' (default): will truncate up to the number of characters, and then
	 *   add an ellipsis at the end. Ex: 'yahoo.com/some/long/pat..'
	 * - 'middle': will truncate and add the ellipsis in the middle. Ex:
	 *   'yahoo.com/s..th/to/a/file'
	 * - 'smart': for URLs where the algorithm attempts to strip out unnecessary
	 *   parts first (such as the 'www.', then URL scheme, hash, etc.),
	 *   attempting to make the URL human-readable before looking for a good
	 *   point to insert the ellipsis if it is still too long. Ex:
	 *   'yahoo.com/some..to/a/file'. For more details, see
	 *   {@link Autolinker.truncate.TruncateSmart}.
	 */

	/**
	 * @cfg {String} className
	 *
	 * A CSS class name to add to the generated links. This class will be added
	 * to all links, as well as this class plus match suffixes for styling
	 * url/email/phone/hashtag/mention links differently.
	 *
	 * For example, if this config is provided as "myLink", then:
	 *
	 * - URL links will have the CSS classes: "myLink myLink-url"
	 * - Email links will have the CSS classes: "myLink myLink-email", and
	 * - Phone links will have the CSS classes: "myLink myLink-phone"
	 * - Hashtag links will have the CSS classes: "myLink myLink-hashtag"
	 * - Mention links will have the CSS classes: "myLink myLink-mention myLink-[type]"
	 *   where [type] is either "instagram" or "twitter"
	 */

	/**
	 * @cfg {Function} replaceFn
	 *
	 * A function to individually process each match found in the input string.
	 *
	 * See the class's description for usage.
	 *
	 * The `replaceFn` can be called with a different context object (`this`
	 * reference) using the {@link #context} cfg.
	 *
	 * This function is called with the following parameter:
	 *
	 * @cfg {Autolinker.match.Match} replaceFn.match The Match instance which
	 *   can be used to retrieve information about the match that the `replaceFn`
	 *   is currently processing. See {@link Autolinker.match.Match} subclasses
	 *   for details.
	 */

	/**
	 * @cfg {Object} context
	 *
	 * The context object (`this` reference) to call the `replaceFn` with.
	 *
	 * Defaults to this Autolinker instance.
	 */


	/**
	 * @property {String} version (readonly)
	 *
	 * The Autolinker version number in the form major.minor.patch
	 *
	 * Ex: 0.25.1
	 */

	/**
	 * @private
	 * @property {Autolinker.htmlParser.HtmlParser} htmlParser
	 *
	 * The HtmlParser instance used to skip over HTML tags, while finding text
	 * nodes to process. This is lazily instantiated in the {@link #getHtmlParser}
	 * method.
	 */

	/**
	 * @private
	 * @property {Autolinker.matcher.Matcher[]} matchers
	 *
	 * The {@link Autolinker.matcher.Matcher} instances for this Autolinker
	 * instance.
	 *
	 * This is lazily created in {@link #getMatchers}.
	 */

	/**
	 * @private
	 * @property {Autolinker.AnchorTagBuilder} tagBuilder
	 *
	 * The AnchorTagBuilder instance used to build match replacement anchor tags.
	 * Note: this is lazily instantiated in the {@link #getTagBuilder} method.
	 */


	/**
	 * Normalizes the {@link #urls} config into an Object with 3 properties:
	 * `schemeMatches`, `wwwMatches`, and `tldMatches`, all Booleans.
	 *
	 * See {@link #urls} config for details.
	 *
	 * @private
	 * @param {Boolean/Object} urls
	 * @return {Object}
	 */
	normalizeUrlsCfg : function( urls ) {
		if( urls == null ) urls = true;  // default to `true`

		if( typeof urls === 'boolean' ) {
			return { schemeMatches: urls, wwwMatches: urls, tldMatches: urls };

		} else {  // object form
			return {
				schemeMatches : typeof urls.schemeMatches === 'boolean' ? urls.schemeMatches : true,
				wwwMatches    : typeof urls.wwwMatches === 'boolean'    ? urls.wwwMatches    : true,
				tldMatches    : typeof urls.tldMatches === 'boolean'    ? urls.tldMatches    : true
			};
		}
	},


	/**
	 * Normalizes the {@link #stripPrefix} config into an Object with 2
	 * properties: `scheme`, and `www` - both Booleans.
	 *
	 * See {@link #stripPrefix} config for details.
	 *
	 * @private
	 * @param {Boolean/Object} stripPrefix
	 * @return {Object}
	 */
	normalizeStripPrefixCfg : function( stripPrefix ) {
		if( stripPrefix == null ) stripPrefix = true;  // default to `true`

		if( typeof stripPrefix === 'boolean' ) {
			return { scheme: stripPrefix, www: stripPrefix };

		} else {  // object form
			return {
				scheme : typeof stripPrefix.scheme === 'boolean' ? stripPrefix.scheme : true,
				www    : typeof stripPrefix.www === 'boolean'    ? stripPrefix.www    : true
			};
		}
	},


	/**
	 * Normalizes the {@link #truncate} config into an Object with 2 properties:
	 * `length` (Number), and `location` (String).
	 *
	 * See {@link #truncate} config for details.
	 *
	 * @private
	 * @param {Number/Object} truncate
	 * @return {Object}
	 */
	normalizeTruncateCfg : function( truncate ) {
		if( typeof truncate === 'number' ) {
			return { length: truncate, location: 'end' };

		} else {  // object, or undefined/null
			return Autolinker.Util.defaults( truncate || {}, {
				length   : Number.POSITIVE_INFINITY,
				location : 'end'
			} );
		}
	},


	/**
	 * Parses the input `textOrHtml` looking for URLs, email addresses, phone
	 * numbers, username handles, and hashtags (depending on the configuration
	 * of the Autolinker instance), and returns an array of {@link Autolinker.match.Match}
	 * objects describing those matches (without making any replacements).
	 *
	 * This method is used by the {@link #link} method, but can also be used to
	 * simply do parsing of the input in order to discover what kinds of links
	 * there are and how many.
	 *
	 * Example usage:
	 *
	 *     var autolinker = new Autolinker( {
	 *         urls: true,
	 *         email: true
	 *     } );
	 *
	 *     var matches = autolinker.parse( "Hello google.com, I am asdf@asdf.com" );
	 *
	 *     console.log( matches.length );           // 2
	 *     console.log( matches[ 0 ].getType() );   // 'url'
	 *     console.log( matches[ 0 ].getUrl() );    // 'google.com'
	 *     console.log( matches[ 1 ].getType() );   // 'email'
	 *     console.log( matches[ 1 ].getEmail() );  // 'asdf@asdf.com'
	 *
	 * @param {String} textOrHtml The HTML or text to find matches within
	 *   (depending on if the {@link #urls}, {@link #email}, {@link #phone},
	 *   {@link #hashtag}, and {@link #mention} options are enabled).
	 * @return {Autolinker.match.Match[]} The array of Matches found in the
	 *   given input `textOrHtml`.
	 */
	parse : function( textOrHtml ) {
		var htmlParser = this.getHtmlParser(),
		    htmlNodes = htmlParser.parse( textOrHtml ),
		    anchorTagStackCount = 0,  // used to only process text around anchor tags, and any inner text/html they may have;
		    matches = [];

		// Find all matches within the `textOrHtml` (but not matches that are
		// already nested within <a> tags)
		for( var i = 0, len = htmlNodes.length; i < len; i++ ) {
			var node = htmlNodes[ i ],
			    nodeType = node.getType();

			if( nodeType === 'element' && node.getTagName() === 'a' ) {  // Process HTML anchor element nodes in the input `textOrHtml` to find out when we're within an <a> tag
				if( !node.isClosing() ) {  // it's the start <a> tag
					anchorTagStackCount++;
				} else {  // it's the end </a> tag
					anchorTagStackCount = Math.max( anchorTagStackCount - 1, 0 );  // attempt to handle extraneous </a> tags by making sure the stack count never goes below 0
				}

			} else if( nodeType === 'text' && anchorTagStackCount === 0 ) {  // Process text nodes that are not within an <a> tag
				var textNodeMatches = this.parseText( node.getText(), node.getOffset() );

				matches.push.apply( matches, textNodeMatches );
			}
		}


		// After we have found all matches, remove subsequent matches that
		// overlap with a previous match. This can happen for instance with URLs,
		// where the url 'google.com/#link' would match '#link' as a hashtag.
		matches = this.compactMatches( matches );

		// And finally, remove matches for match types that have been turned
		// off. We needed to have all match types turned on initially so that
		// things like hashtags could be filtered out if they were really just
		// part of a URL match (for instance, as a named anchor).
		matches = this.removeUnwantedMatches( matches );

		return matches;
	},


	/**
	 * After we have found all matches, we need to remove subsequent matches
	 * that overlap with a previous match. This can happen for instance with
	 * URLs, where the url 'google.com/#link' would match '#link' as a hashtag.
	 *
	 * @private
	 * @param {Autolinker.match.Match[]} matches
	 * @return {Autolinker.match.Match[]}
	 */
	compactMatches : function( matches ) {
		// First, the matches need to be sorted in order of offset
		matches.sort( function( a, b ) { return a.getOffset() - b.getOffset(); } );

		for( var i = 0; i < matches.length - 1; i++ ) {
			var match = matches[ i ],
					offset = match.getOffset(),
					matchedTextLength = match.getMatchedText().length,
			    endIdx = offset + matchedTextLength;

			if( i + 1 < matches.length ) {
				// Remove subsequent matches that equal offset with current match
				if( matches[ i + 1 ].getOffset() === offset ) {
					var removeIdx = matches[ i + 1 ].getMatchedText().length > matchedTextLength ? i : i + 1;
					matches.splice( removeIdx, 1 );
					continue;
				}

				// Remove subsequent matches that overlap with the current match
				if( matches[ i + 1 ].getOffset() <= endIdx ) {
					matches.splice( i + 1, 1 );
				}
			}
		}

		return matches;
	},


	/**
	 * Removes matches for matchers that were turned off in the options. For
	 * example, if {@link #hashtag hashtags} were not to be matched, we'll
	 * remove them from the `matches` array here.
	 *
	 * @private
	 * @param {Autolinker.match.Match[]} matches The array of matches to remove
	 *   the unwanted matches from. Note: this array is mutated for the
	 *   removals.
	 * @return {Autolinker.match.Match[]} The mutated input `matches` array.
	 */
	removeUnwantedMatches : function( matches ) {
		var remove = Autolinker.Util.remove;

		if( !this.hashtag ) remove( matches, function( match ) { return match.getType() === 'hashtag'; } );
		if( !this.email )   remove( matches, function( match ) { return match.getType() === 'email'; } );
		if( !this.phone )   remove( matches, function( match ) { return match.getType() === 'phone'; } );
		if( !this.mention ) remove( matches, function( match ) { return match.getType() === 'mention'; } );
		if( !this.urls.schemeMatches ) {
			remove( matches, function( m ) { return m.getType() === 'url' && m.getUrlMatchType() === 'scheme'; } );
		}
		if( !this.urls.wwwMatches ) {
			remove( matches, function( m ) { return m.getType() === 'url' && m.getUrlMatchType() === 'www'; } );
		}
		if( !this.urls.tldMatches ) {
			remove( matches, function( m ) { return m.getType() === 'url' && m.getUrlMatchType() === 'tld'; } );
		}

		return matches;
	},


	/**
	 * Parses the input `text` looking for URLs, email addresses, phone
	 * numbers, username handles, and hashtags (depending on the configuration
	 * of the Autolinker instance), and returns an array of {@link Autolinker.match.Match}
	 * objects describing those matches.
	 *
	 * This method processes a **non-HTML string**, and is used to parse and
	 * match within the text nodes of an HTML string. This method is used
	 * internally by {@link #parse}.
	 *
	 * @private
	 * @param {String} text The text to find matches within (depending on if the
	 *   {@link #urls}, {@link #email}, {@link #phone},
	 *   {@link #hashtag}, and {@link #mention} options are enabled). This must be a non-HTML string.
	 * @param {Number} [offset=0] The offset of the text node within the
	 *   original string. This is used when parsing with the {@link #parse}
	 *   method to generate correct offsets within the {@link Autolinker.match.Match}
	 *   instances, but may be omitted if calling this method publicly.
	 * @return {Autolinker.match.Match[]} The array of Matches found in the
	 *   given input `text`.
	 */
	parseText : function( text, offset ) {
		offset = offset || 0;
		var matchers = this.getMatchers(),
		    matches = [];

		for( var i = 0, numMatchers = matchers.length; i < numMatchers; i++ ) {
			var textMatches = matchers[ i ].parseMatches( text );

			// Correct the offset of each of the matches. They are originally
			// the offset of the match within the provided text node, but we
			// need to correct them to be relative to the original HTML input
			// string (i.e. the one provided to #parse).
			for( var j = 0, numTextMatches = textMatches.length; j < numTextMatches; j++ ) {
				textMatches[ j ].setOffset( offset + textMatches[ j ].getOffset() );
			}

			matches.push.apply( matches, textMatches );
		}
		return matches;
	},


	/**
	 * Automatically links URLs, Email addresses, Phone numbers, Hashtags,
	 * and Mentions (Twitter, Instagram) found in the given chunk of HTML. Does not link
	 * URLs found within HTML tags.
	 *
	 * For instance, if given the text: `You should go to http://www.yahoo.com`,
	 * then the result will be `You should go to
	 * &lt;a href="http://www.yahoo.com"&gt;http://www.yahoo.com&lt;/a&gt;`
	 *
	 * This method finds the text around any HTML elements in the input
	 * `textOrHtml`, which will be the text that is processed. Any original HTML
	 * elements will be left as-is, as well as the text that is already wrapped
	 * in anchor (&lt;a&gt;) tags.
	 *
	 * @param {String} textOrHtml The HTML or text to autolink matches within
	 *   (depending on if the {@link #urls}, {@link #email}, {@link #phone}, {@link #hashtag}, and {@link #mention} options are enabled).
	 * @return {String} The HTML, with matches automatically linked.
	 */
	link : function( textOrHtml ) {
		if( !textOrHtml ) { return ""; }  // handle `null` and `undefined`

		var matches = this.parse( textOrHtml ),
			newHtml = [],
			lastIndex = 0;

		for( var i = 0, len = matches.length; i < len; i++ ) {
			var match = matches[ i ];

			newHtml.push( textOrHtml.substring( lastIndex, match.getOffset() ) );
			newHtml.push( this.createMatchReturnVal( match ) );

			lastIndex = match.getOffset() + match.getMatchedText().length;
		}
		newHtml.push( textOrHtml.substring( lastIndex ) );  // handle the text after the last match

		return newHtml.join( '' );
	},


	/**
	 * Creates the return string value for a given match in the input string.
	 *
	 * This method handles the {@link #replaceFn}, if one was provided.
	 *
	 * @private
	 * @param {Autolinker.match.Match} match The Match object that represents
	 *   the match.
	 * @return {String} The string that the `match` should be replaced with.
	 *   This is usually the anchor tag string, but may be the `matchStr` itself
	 *   if the match is not to be replaced.
	 */
	createMatchReturnVal : function( match ) {
		// Handle a custom `replaceFn` being provided
		var replaceFnResult;
		if( this.replaceFn ) {
			replaceFnResult = this.replaceFn.call( this.context, match );  // Autolinker instance is the context
		}

		if( typeof replaceFnResult === 'string' ) {
			return replaceFnResult;  // `replaceFn` returned a string, use that

		} else if( replaceFnResult === false ) {
			return match.getMatchedText();  // no replacement for the match

		} else if( replaceFnResult instanceof Autolinker.HtmlTag ) {
			return replaceFnResult.toAnchorString();

		} else {  // replaceFnResult === true, or no/unknown return value from function
			// Perform Autolinker's default anchor tag generation
			var anchorTag = match.buildTag();  // returns an Autolinker.HtmlTag instance

			return anchorTag.toAnchorString();
		}
	},


	/**
	 * Lazily instantiates and returns the {@link #htmlParser} instance for this
	 * Autolinker instance.
	 *
	 * @protected
	 * @return {Autolinker.htmlParser.HtmlParser}
	 */
	getHtmlParser : function() {
		var htmlParser = this.htmlParser;

		if( !htmlParser ) {
			htmlParser = this.htmlParser = new Autolinker.htmlParser.HtmlParser();
		}

		return htmlParser;
	},


	/**
	 * Lazily instantiates and returns the {@link Autolinker.matcher.Matcher}
	 * instances for this Autolinker instance.
	 *
	 * @protected
	 * @return {Autolinker.matcher.Matcher[]}
	 */
	getMatchers : function() {
		if( !this.matchers ) {
			var matchersNs = Autolinker.matcher,
			    tagBuilder = this.getTagBuilder();

			var matchers = [
				new matchersNs.Hashtag( { tagBuilder: tagBuilder, serviceName: this.hashtag } ),
				new matchersNs.Email( { tagBuilder: tagBuilder } ),
				new matchersNs.Phone( { tagBuilder: tagBuilder } ),
				new matchersNs.Mention( { tagBuilder: tagBuilder, serviceName: this.mention } ),
				new matchersNs.Url( { tagBuilder: tagBuilder, stripPrefix: this.stripPrefix, stripTrailingSlash: this.stripTrailingSlash } )
			];

			return ( this.matchers = matchers );

		} else {
			return this.matchers;
		}
	},


	/**
	 * Returns the {@link #tagBuilder} instance for this Autolinker instance, lazily instantiating it
	 * if it does not yet exist.
	 *
	 * This method may be used in a {@link #replaceFn} to generate the {@link Autolinker.HtmlTag HtmlTag} instance that
	 * Autolinker would normally generate, and then allow for modifications before returning it. For example:
	 *
	 *     var html = Autolinker.link( "Test google.com", {
	 *         replaceFn : function( match ) {
	 *             var tag = match.buildTag();  // returns an {@link Autolinker.HtmlTag} instance
	 *             tag.setAttr( 'rel', 'nofollow' );
	 *
	 *             return tag;
	 *         }
	 *     } );
	 *
	 *     // generated html:
	 *     //   Test <a href="http://google.com" target="_blank" rel="nofollow">google.com</a>
	 *
	 * @return {Autolinker.AnchorTagBuilder}
	 */
	getTagBuilder : function() {
		var tagBuilder = this.tagBuilder;

		if( !tagBuilder ) {
			tagBuilder = this.tagBuilder = new Autolinker.AnchorTagBuilder( {
				newWindow   : this.newWindow,
				truncate    : this.truncate,
				className   : this.className
			} );
		}

		return tagBuilder;
	}

};


// Autolinker Namespaces

Autolinker.match = {};
Autolinker.matcher = {};
Autolinker.htmlParser = {};
Autolinker.truncate = {};

/*global Autolinker */
/*jshint eqnull:true, boss:true */
/**
 * @class Autolinker.Util
 * @singleton
 *
 * A few utility methods for Autolinker.
 */
Autolinker.Util = {

	/**
	 * @property {Function} abstractMethod
	 *
	 * A function object which represents an abstract method.
	 */
	abstractMethod : function() { throw "abstract"; },


	/**
	 * @private
	 * @property {RegExp} trimRegex
	 *
	 * The regular expression used to trim the leading and trailing whitespace
	 * from a string.
	 */
	trimRegex : /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,


	/**
	 * Assigns (shallow copies) the properties of `src` onto `dest`.
	 *
	 * @param {Object} dest The destination object.
	 * @param {Object} src The source object.
	 * @return {Object} The destination object (`dest`)
	 */
	assign : function( dest, src ) {
		for( var prop in src ) {
			if( src.hasOwnProperty( prop ) ) {
				dest[ prop ] = src[ prop ];
			}
		}

		return dest;
	},


	/**
	 * Assigns (shallow copies) the properties of `src` onto `dest`, if the
	 * corresponding property on `dest` === `undefined`.
	 *
	 * @param {Object} dest The destination object.
	 * @param {Object} src The source object.
	 * @return {Object} The destination object (`dest`)
	 */
	defaults : function( dest, src ) {
		for( var prop in src ) {
			if( src.hasOwnProperty( prop ) && dest[ prop ] === undefined ) {
				dest[ prop ] = src[ prop ];
			}
		}

		return dest;
	},


	/**
	 * Extends `superclass` to create a new subclass, adding the `protoProps` to the new subclass's prototype.
	 *
	 * @param {Function} superclass The constructor function for the superclass.
	 * @param {Object} protoProps The methods/properties to add to the subclass's prototype. This may contain the
	 *   special property `constructor`, which will be used as the new subclass's constructor function.
	 * @return {Function} The new subclass function.
	 */
	extend : function( superclass, protoProps ) {
		var superclassProto = superclass.prototype;

		var F = function() {};
		F.prototype = superclassProto;

		var subclass;
		if( protoProps.hasOwnProperty( 'constructor' ) ) {
			subclass = protoProps.constructor;
		} else {
			subclass = function() { superclassProto.constructor.apply( this, arguments ); };
		}

		var subclassProto = subclass.prototype = new F();  // set up prototype chain
		subclassProto.constructor = subclass;  // fix constructor property
		subclassProto.superclass = superclassProto;

		delete protoProps.constructor;  // don't re-assign constructor property to the prototype, since a new function may have been created (`subclass`), which is now already there
		Autolinker.Util.assign( subclassProto, protoProps );

		return subclass;
	},


	/**
	 * Truncates the `str` at `len - ellipsisChars.length`, and adds the `ellipsisChars` to the
	 * end of the string (by default, two periods: '..'). If the `str` length does not exceed
	 * `len`, the string will be returned unchanged.
	 *
	 * @param {String} str The string to truncate and add an ellipsis to.
	 * @param {Number} truncateLen The length to truncate the string at.
	 * @param {String} [ellipsisChars=...] The ellipsis character(s) to add to the end of `str`
	 *   when truncated. Defaults to '...'
	 */
	ellipsis : function( str, truncateLen, ellipsisChars ) {
		var ellipsisLength;

		if( str.length > truncateLen ) {
			if(ellipsisChars == null) {
			  ellipsisChars = '&hellip;';
			  ellipsisLength = 3;
			} else {
			  ellipsisLength = ellipsisChars.length;
			}

			str = str.substring( 0, truncateLen - ellipsisLength ) + ellipsisChars;
		}
		return str;
	},


	/**
	 * Supports `Array.prototype.indexOf()` functionality for old IE (IE8 and below).
	 *
	 * @param {Array} arr The array to find an element of.
	 * @param {*} element The element to find in the array, and return the index of.
	 * @return {Number} The index of the `element`, or -1 if it was not found.
	 */
	indexOf : function( arr, element ) {
		if( Array.prototype.indexOf ) {
			return arr.indexOf( element );

		} else {
			for( var i = 0, len = arr.length; i < len; i++ ) {
				if( arr[ i ] === element ) return i;
			}
			return -1;
		}
	},


	/**
	 * Removes array elements based on a filtering function. Mutates the input
	 * array.
	 *
	 * Using this instead of the ES5 Array.prototype.filter() function, to allow
	 * Autolinker compatibility with IE8, and also to prevent creating many new
	 * arrays in memory for filtering.
	 *
	 * @param {Array} arr The array to remove elements from. This array is
	 *   mutated.
	 * @param {Function} fn A function which should return `true` to
	 *   remove an element.
	 * @return {Array} The mutated input `arr`.
	 */
	remove : function( arr, fn ) {
		for( var i = arr.length - 1; i >= 0; i-- ) {
			if( fn( arr[ i ] ) === true ) {
				arr.splice( i, 1 );
			}
		}
	},


	/**
	 * Performs the functionality of what modern browsers do when `String.prototype.split()` is called
	 * with a regular expression that contains capturing parenthesis.
	 *
	 * For example:
	 *
	 *     // Modern browsers:
	 *     "a,b,c".split( /(,)/ );  // --> [ 'a', ',', 'b', ',', 'c' ]
	 *
	 *     // Old IE (including IE8):
	 *     "a,b,c".split( /(,)/ );  // --> [ 'a', 'b', 'c' ]
	 *
	 * This method emulates the functionality of modern browsers for the old IE case.
	 *
	 * @param {String} str The string to split.
	 * @param {RegExp} splitRegex The regular expression to split the input `str` on. The splitting
	 *   character(s) will be spliced into the array, as in the "modern browsers" example in the
	 *   description of this method.
	 *   Note #1: the supplied regular expression **must** have the 'g' flag specified.
	 *   Note #2: for simplicity's sake, the regular expression does not need
	 *   to contain capturing parenthesis - it will be assumed that any match has them.
	 * @return {String[]} The split array of strings, with the splitting character(s) included.
	 */
	splitAndCapture : function( str, splitRegex ) {
		if( !splitRegex.global ) throw new Error( "`splitRegex` must have the 'g' flag set" );

		var result = [],
		    lastIdx = 0,
		    match;

		while( match = splitRegex.exec( str ) ) {
			result.push( str.substring( lastIdx, match.index ) );
			result.push( match[ 0 ] );  // push the splitting char(s)

			lastIdx = match.index + match[ 0 ].length;
		}
		result.push( str.substring( lastIdx ) );

		return result;
	},


	/**
	 * Trims the leading and trailing whitespace from a string.
	 *
	 * @param {String} str The string to trim.
	 * @return {String}
	 */
	trim : function( str ) {
		return str.replace( this.trimRegex, '' );
	}

};

/*global Autolinker */
/*jshint boss:true */
/**
 * @class Autolinker.HtmlTag
 * @extends Object
 *
 * Represents an HTML tag, which can be used to easily build/modify HTML tags programmatically.
 *
 * Autolinker uses this abstraction to create HTML tags, and then write them out as strings. You may also use
 * this class in your code, especially within a {@link Autolinker#replaceFn replaceFn}.
 *
 * ## Examples
 *
 * Example instantiation:
 *
 *     var tag = new Autolinker.HtmlTag( {
 *         tagName : 'a',
 *         attrs   : { 'href': 'http://google.com', 'class': 'external-link' },
 *         innerHtml : 'Google'
 *     } );
 *
 *     tag.toAnchorString();  // <a href="http://google.com" class="external-link">Google</a>
 *
 *     // Individual accessor methods
 *     tag.getTagName();                 // 'a'
 *     tag.getAttr( 'href' );            // 'http://google.com'
 *     tag.hasClass( 'external-link' );  // true
 *
 *
 * Using mutator methods (which may be used in combination with instantiation config properties):
 *
 *     var tag = new Autolinker.HtmlTag();
 *     tag.setTagName( 'a' );
 *     tag.setAttr( 'href', 'http://google.com' );
 *     tag.addClass( 'external-link' );
 *     tag.setInnerHtml( 'Google' );
 *
 *     tag.getTagName();                 // 'a'
 *     tag.getAttr( 'href' );            // 'http://google.com'
 *     tag.hasClass( 'external-link' );  // true
 *
 *     tag.toAnchorString();  // <a href="http://google.com" class="external-link">Google</a>
 *
 *
 * ## Example use within a {@link Autolinker#replaceFn replaceFn}
 *
 *     var html = Autolinker.link( "Test google.com", {
 *         replaceFn : function( match ) {
 *             var tag = match.buildTag();  // returns an {@link Autolinker.HtmlTag} instance, configured with the Match's href and anchor text
 *             tag.setAttr( 'rel', 'nofollow' );
 *
 *             return tag;
 *         }
 *     } );
 *
 *     // generated html:
 *     //   Test <a href="http://google.com" target="_blank" rel="nofollow">google.com</a>
 *
 *
 * ## Example use with a new tag for the replacement
 *
 *     var html = Autolinker.link( "Test google.com", {
 *         replaceFn : function( match ) {
 *             var tag = new Autolinker.HtmlTag( {
 *                 tagName : 'button',
 *                 attrs   : { 'title': 'Load URL: ' + match.getAnchorHref() },
 *                 innerHtml : 'Load URL: ' + match.getAnchorText()
 *             } );
 *
 *             return tag;
 *         }
 *     } );
 *
 *     // generated html:
 *     //   Test <button title="Load URL: http://google.com">Load URL: google.com</button>
 */
Autolinker.HtmlTag = Autolinker.Util.extend( Object, {

	/**
	 * @cfg {String} tagName
	 *
	 * The tag name. Ex: 'a', 'button', etc.
	 *
	 * Not required at instantiation time, but should be set using {@link #setTagName} before {@link #toAnchorString}
	 * is executed.
	 */

	/**
	 * @cfg {Object.<String, String>} attrs
	 *
	 * An key/value Object (map) of attributes to create the tag with. The keys are the attribute names, and the
	 * values are the attribute values.
	 */

	/**
	 * @cfg {String} innerHtml
	 *
	 * The inner HTML for the tag.
	 *
	 * Note the camel case name on `innerHtml`. Acronyms are camelCased in this utility (such as not to run into the acronym
	 * naming inconsistency that the DOM developers created with `XMLHttpRequest`). You may alternatively use {@link #innerHTML}
	 * if you prefer, but this one is recommended.
	 */

	/**
	 * @cfg {String} innerHTML
	 *
	 * Alias of {@link #innerHtml}, accepted for consistency with the browser DOM api, but prefer the camelCased version
	 * for acronym names.
	 */


	/**
	 * @protected
	 * @property {RegExp} whitespaceRegex
	 *
	 * Regular expression used to match whitespace in a string of CSS classes.
	 */
	whitespaceRegex : /\s+/,


	/**
	 * @constructor
	 * @param {Object} [cfg] The configuration properties for this class, in an Object (map)
	 */
	constructor : function( cfg ) {
		Autolinker.Util.assign( this, cfg );

		this.innerHtml = this.innerHtml || this.innerHTML;  // accept either the camelCased form or the fully capitalized acronym
	},


	/**
	 * Sets the tag name that will be used to generate the tag with.
	 *
	 * @param {String} tagName
	 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
	 */
	setTagName : function( tagName ) {
		this.tagName = tagName;
		return this;
	},


	/**
	 * Retrieves the tag name.
	 *
	 * @return {String}
	 */
	getTagName : function() {
		return this.tagName || "";
	},


	/**
	 * Sets an attribute on the HtmlTag.
	 *
	 * @param {String} attrName The attribute name to set.
	 * @param {String} attrValue The attribute value to set.
	 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
	 */
	setAttr : function( attrName, attrValue ) {
		var tagAttrs = this.getAttrs();
		tagAttrs[ attrName ] = attrValue;

		return this;
	},


	/**
	 * Retrieves an attribute from the HtmlTag. If the attribute does not exist, returns `undefined`.
	 *
	 * @param {String} attrName The attribute name to retrieve.
	 * @return {String} The attribute's value, or `undefined` if it does not exist on the HtmlTag.
	 */
	getAttr : function( attrName ) {
		return this.getAttrs()[ attrName ];
	},


	/**
	 * Sets one or more attributes on the HtmlTag.
	 *
	 * @param {Object.<String, String>} attrs A key/value Object (map) of the attributes to set.
	 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
	 */
	setAttrs : function( attrs ) {
		var tagAttrs = this.getAttrs();
		Autolinker.Util.assign( tagAttrs, attrs );

		return this;
	},


	/**
	 * Retrieves the attributes Object (map) for the HtmlTag.
	 *
	 * @return {Object.<String, String>} A key/value object of the attributes for the HtmlTag.
	 */
	getAttrs : function() {
		return this.attrs || ( this.attrs = {} );
	},


	/**
	 * Sets the provided `cssClass`, overwriting any current CSS classes on the HtmlTag.
	 *
	 * @param {String} cssClass One or more space-separated CSS classes to set (overwrite).
	 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
	 */
	setClass : function( cssClass ) {
		return this.setAttr( 'class', cssClass );
	},


	/**
	 * Convenience method to add one or more CSS classes to the HtmlTag. Will not add duplicate CSS classes.
	 *
	 * @param {String} cssClass One or more space-separated CSS classes to add.
	 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
	 */
	addClass : function( cssClass ) {
		var classAttr = this.getClass(),
		    whitespaceRegex = this.whitespaceRegex,
		    indexOf = Autolinker.Util.indexOf,  // to support IE8 and below
		    classes = ( !classAttr ) ? [] : classAttr.split( whitespaceRegex ),
		    newClasses = cssClass.split( whitespaceRegex ),
		    newClass;

		while( newClass = newClasses.shift() ) {
			if( indexOf( classes, newClass ) === -1 ) {
				classes.push( newClass );
			}
		}

		this.getAttrs()[ 'class' ] = classes.join( " " );
		return this;
	},


	/**
	 * Convenience method to remove one or more CSS classes from the HtmlTag.
	 *
	 * @param {String} cssClass One or more space-separated CSS classes to remove.
	 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
	 */
	removeClass : function( cssClass ) {
		var classAttr = this.getClass(),
		    whitespaceRegex = this.whitespaceRegex,
		    indexOf = Autolinker.Util.indexOf,  // to support IE8 and below
		    classes = ( !classAttr ) ? [] : classAttr.split( whitespaceRegex ),
		    removeClasses = cssClass.split( whitespaceRegex ),
		    removeClass;

		while( classes.length && ( removeClass = removeClasses.shift() ) ) {
			var idx = indexOf( classes, removeClass );
			if( idx !== -1 ) {
				classes.splice( idx, 1 );
			}
		}

		this.getAttrs()[ 'class' ] = classes.join( " " );
		return this;
	},


	/**
	 * Convenience method to retrieve the CSS class(es) for the HtmlTag, which will each be separated by spaces when
	 * there are multiple.
	 *
	 * @return {String}
	 */
	getClass : function() {
		return this.getAttrs()[ 'class' ] || "";
	},


	/**
	 * Convenience method to check if the tag has a CSS class or not.
	 *
	 * @param {String} cssClass The CSS class to check for.
	 * @return {Boolean} `true` if the HtmlTag has the CSS class, `false` otherwise.
	 */
	hasClass : function( cssClass ) {
		return ( ' ' + this.getClass() + ' ' ).indexOf( ' ' + cssClass + ' ' ) !== -1;
	},


	/**
	 * Sets the inner HTML for the tag.
	 *
	 * @param {String} html The inner HTML to set.
	 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
	 */
	setInnerHtml : function( html ) {
		this.innerHtml = html;

		return this;
	},


	/**
	 * Retrieves the inner HTML for the tag.
	 *
	 * @return {String}
	 */
	getInnerHtml : function() {
		return this.innerHtml || "";
	},


	/**
	 * Override of superclass method used to generate the HTML string for the tag.
	 *
	 * @return {String}
	 */
	toAnchorString : function() {
		var tagName = this.getTagName(),
		    attrsStr = this.buildAttrsStr();

		attrsStr = ( attrsStr ) ? ' ' + attrsStr : '';  // prepend a space if there are actually attributes

		return [ '<', tagName, attrsStr, '>', this.getInnerHtml(), '</', tagName, '>' ].join( "" );
	},


	/**
	 * Support method for {@link #toAnchorString}, returns the string space-separated key="value" pairs, used to populate
	 * the stringified HtmlTag.
	 *
	 * @protected
	 * @return {String} Example return: `attr1="value1" attr2="value2"`
	 */
	buildAttrsStr : function() {
		if( !this.attrs ) return "";  // no `attrs` Object (map) has been set, return empty string

		var attrs = this.getAttrs(),
		    attrsArr = [];

		for( var prop in attrs ) {
			if( attrs.hasOwnProperty( prop ) ) {
				attrsArr.push( prop + '="' + attrs[ prop ] + '"' );
			}
		}
		return attrsArr.join( " " );
	}

} );

/*global Autolinker */
/**
 * @class Autolinker.RegexLib
 * @singleton
 *
 * Builds and stores a library of the common regular expressions used by the
 * Autolinker utility.
 *
 * Other regular expressions may exist ad-hoc, but these are generally the
 * regular expressions that are shared between source files.
 */
Autolinker.RegexLib = (function() {

	/**
	 * The string form of a regular expression that would match all of the
	 * alphabetic ("letter") chars in the unicode character set when placed in a
	 * RegExp character class (`[]`). This includes all international alphabetic
	 * characters.
	 *
	 * These would be the characters matched by unicode regex engines `\p{L}`
	 * escape ("all letters").
	 *
	 * Taken from the XRegExp library: http://xregexp.com/
	 * Specifically: http://xregexp.com/v/3.0.0/unicode-categories.js
	 *
	 * @private
	 * @type {String}
	 */
	var alphaCharsStr = 'A-Za-z\\xAA\\xB5\\xBA\\xC0-\\xD6\\xD8-\\xF6\\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC';

	/**
	 * The string form of a regular expression that would match all of the
	 * decimal number chars in the unicode character set when placed in a RegExp
	 * character class (`[]`).
	 *
	 * These would be the characters matched by unicode regex engines `\p{Nd}`
	 * escape ("all decimal numbers")
	 *
	 * Taken from the XRegExp library: http://xregexp.com/
	 * Specifically: http://xregexp.com/v/3.0.0/unicode-categories.js
	 *
	 * @private
	 * @type {String}
	 */
	var decimalNumbersStr = '0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19';


	// See documentation below
	var alphaNumericCharsStr = alphaCharsStr + decimalNumbersStr;

	// Simplified IP regular expression
	var ipRegex = new RegExp( '(?:[' + decimalNumbersStr + ']{1,3}\\.){3}[' + decimalNumbersStr + ']{1,3}' );

	// Protected domain label which do not allow "-" character on the beginning and the end of a single label
	var domainLabelStr = '[' + alphaNumericCharsStr + '](?:[' + alphaNumericCharsStr + '\\-]*[' + alphaNumericCharsStr + '])?';

	// See documentation below
	var domainNameRegex = new RegExp( '(?:(?:(?:' + domainLabelStr + '\\.)*(?:' + domainLabelStr + '))|(?:' + ipRegex.source + '))' );

	return {

		/**
		 * The string form of a regular expression that would match all of the
		 * letters and decimal number chars in the unicode character set when placed
		 * in a RegExp character class (`[]`).
		 *
		 * These would be the characters matched by unicode regex engines `[\p{L}\p{Nd}]`
		 * escape ("all letters and decimal numbers")
		 *
		 * @property {String} alphaNumericCharsStr
		 */
		alphaNumericCharsStr : alphaNumericCharsStr,

		/**
		 * The string form of a regular expression that would match all of the
		 * letters and in the unicode character set when placed
		 * in a RegExp character class (`[]`).
		 *
		 * These would be the characters matched by unicode regex engines `[\p{L}]`
		 * escape ("all letters")
		 *
		 * @property {String} alphaCharsStr
		 */
		alphaCharsStr : alphaCharsStr,

		/**
		 * A regular expression to match domain names of a URL or email address.
		 * Ex: 'google', 'yahoo', 'some-other-company', etc.
		 *
		 * @property {RegExp} domainNameRegex
		 */
		domainNameRegex : domainNameRegex,

	};


}() );

/*global Autolinker */
/*jshint sub:true */
/**
 * @protected
 * @class Autolinker.AnchorTagBuilder
 * @extends Object
 *
 * Builds anchor (&lt;a&gt;) tags for the Autolinker utility when a match is
 * found.
 *
 * Normally this class is instantiated, configured, and used internally by an
 * {@link Autolinker} instance, but may actually be used indirectly in a
 * {@link Autolinker#replaceFn replaceFn} to create {@link Autolinker.HtmlTag HtmlTag}
 * instances which may be modified before returning from the
 * {@link Autolinker#replaceFn replaceFn}. For example:
 *
 *     var html = Autolinker.link( "Test google.com", {
 *         replaceFn : function( match ) {
 *             var tag = match.buildTag();  // returns an {@link Autolinker.HtmlTag} instance
 *             tag.setAttr( 'rel', 'nofollow' );
 *
 *             return tag;
 *         }
 *     } );
 *
 *     // generated html:
 *     //   Test <a href="http://google.com" target="_blank" rel="nofollow">google.com</a>
 */
Autolinker.AnchorTagBuilder = Autolinker.Util.extend( Object, {

	/**
	 * @cfg {Boolean} newWindow
	 * @inheritdoc Autolinker#newWindow
	 */

	/**
	 * @cfg {Object} truncate
	 * @inheritdoc Autolinker#truncate
	 */

	/**
	 * @cfg {String} className
	 * @inheritdoc Autolinker#className
	 */


	/**
	 * @constructor
	 * @param {Object} [cfg] The configuration options for the AnchorTagBuilder instance, specified in an Object (map).
	 */
	constructor : function( cfg ) {
		cfg = cfg || {};

		this.newWindow = cfg.newWindow;
		this.truncate = cfg.truncate;
		this.className = cfg.className;
	},


	/**
	 * Generates the actual anchor (&lt;a&gt;) tag to use in place of the
	 * matched text, via its `match` object.
	 *
	 * @param {Autolinker.match.Match} match The Match instance to generate an
	 *   anchor tag from.
	 * @return {Autolinker.HtmlTag} The HtmlTag instance for the anchor tag.
	 */
	build : function( match ) {
		return new Autolinker.HtmlTag( {
			tagName   : 'a',
			attrs     : this.createAttrs( match ),
			innerHtml : this.processAnchorText( match.getAnchorText() )
		} );
	},


	/**
	 * Creates the Object (map) of the HTML attributes for the anchor (&lt;a&gt;)
	 *   tag being generated.
	 *
	 * @protected
	 * @param {Autolinker.match.Match} match The Match instance to generate an
	 *   anchor tag from.
	 * @return {Object} A key/value Object (map) of the anchor tag's attributes.
	 */
	createAttrs : function( match ) {
		var attrs = {
			'href' : match.getAnchorHref()  // we'll always have the `href` attribute
		};

		var cssClass = this.createCssClass( match );
		if( cssClass ) {
			attrs[ 'class' ] = cssClass;
		}
		if( this.newWindow ) {
			attrs[ 'target' ] = "_blank";
			attrs[ 'rel' ] = "noopener noreferrer";
		}

		if( this.truncate ) {
			if( this.truncate.length && this.truncate.length < match.getAnchorText().length ) {
				attrs[ 'title' ] = match.getAnchorHref();
			}
		}

		return attrs;
	},


	/**
	 * Creates the CSS class that will be used for a given anchor tag, based on
	 * the `matchType` and the {@link #className} config.
	 *
	 * Example returns:
	 *
	 * - ""                                      // no {@link #className}
	 * - "myLink myLink-url"                     // url match
	 * - "myLink myLink-email"                   // email match
	 * - "myLink myLink-phone"                   // phone match
	 * - "myLink myLink-hashtag"                 // hashtag match
	 * - "myLink myLink-mention myLink-twitter"  // mention match with Twitter service
	 *
	 * @private
	 * @param {Autolinker.match.Match} match The Match instance to generate an
	 *   anchor tag from.
	 * @return {String} The CSS class string for the link. Example return:
	 *   "myLink myLink-url". If no {@link #className} was configured, returns
	 *   an empty string.
	 */
	createCssClass : function( match ) {
		var className = this.className;

		if( !className ) {
			return "";

		} else {
			var returnClasses = [ className ],
				cssClassSuffixes = match.getCssClassSuffixes();

			for( var i = 0, len = cssClassSuffixes.length; i < len; i++ ) {
				returnClasses.push( className + '-' + cssClassSuffixes[ i ] );
			}
			return returnClasses.join( ' ' );
		}
	},


	/**
	 * Processes the `anchorText` by truncating the text according to the
	 * {@link #truncate} config.
	 *
	 * @private
	 * @param {String} anchorText The anchor tag's text (i.e. what will be
	 *   displayed).
	 * @return {String} The processed `anchorText`.
	 */
	processAnchorText : function( anchorText ) {
		anchorText = this.doTruncate( anchorText );

		return anchorText;
	},


	/**
	 * Performs the truncation of the `anchorText` based on the {@link #truncate}
	 * option. If the `anchorText` is longer than the length specified by the
	 * {@link #truncate} option, the truncation is performed based on the
	 * `location` property. See {@link #truncate} for details.
	 *
	 * @private
	 * @param {String} anchorText The anchor tag's text (i.e. what will be
	 *   displayed).
	 * @return {String} The truncated anchor text.
	 */
	doTruncate : function( anchorText ) {
		var truncate = this.truncate;
		if( !truncate || !truncate.length ) return anchorText;

		var truncateLength = truncate.length,
			truncateLocation = truncate.location;

		if( truncateLocation === 'smart' ) {
			return Autolinker.truncate.TruncateSmart( anchorText, truncateLength );

		} else if( truncateLocation === 'middle' ) {
			return Autolinker.truncate.TruncateMiddle( anchorText, truncateLength );

		} else {
			return Autolinker.truncate.TruncateEnd( anchorText, truncateLength );
		}
	}

} );

/*global Autolinker */
/**
 * @class Autolinker.htmlParser.HtmlParser
 * @extends Object
 *
 * An HTML parser implementation which simply walks an HTML string and returns an array of
 * {@link Autolinker.htmlParser.HtmlNode HtmlNodes} that represent the basic HTML structure of the input string.
 *
 * Autolinker uses this to only link URLs/emails/mentions within text nodes, effectively ignoring / "walking
 * around" HTML tags.
 */
Autolinker.htmlParser.HtmlParser = Autolinker.Util.extend( Object, {

	/**
	 * @private
	 * @property {RegExp} htmlRegex
	 *
	 * The regular expression used to pull out HTML tags from a string. Handles namespaced HTML tags and
	 * attribute names, as specified by http://www.w3.org/TR/html-markup/syntax.html.
	 *
	 * Capturing groups:
	 *
	 * 1. The "!DOCTYPE" tag name, if a tag is a &lt;!DOCTYPE&gt; tag.
	 * 2. If it is an end tag, this group will have the '/'.
	 * 3. If it is a comment tag, this group will hold the comment text (i.e.
	 *    the text inside the `&lt;!--` and `--&gt;`.
	 * 4. The tag name for a tag without attributes (other than the &lt;!DOCTYPE&gt; tag)
	 * 5. The tag name for a tag with attributes (other than the &lt;!DOCTYPE&gt; tag)
	 */
	htmlRegex : (function() {
		var commentTagRegex = /!--([\s\S]+?)--/,
		    tagNameRegex = /[0-9a-zA-Z][0-9a-zA-Z:]*/,
		    attrNameRegex = /[^\s"'>\/=\x00-\x1F\x7F]+/,   // the unicode range accounts for excluding control chars, and the delete char
		    attrValueRegex = /(?:"[^"]*?"|'[^']*?'|[^'"=<>`\s]+)/, // double quoted, single quoted, or unquoted attribute values
		    nameEqualsValueRegex = attrNameRegex.source + '(?:\\s*=\\s*' + attrValueRegex.source + ')?';  // optional '=[value]'

		return new RegExp( [
			// for <!DOCTYPE> tag. Ex: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">)
			'(?:',
				'<(!DOCTYPE)',  // *** Capturing Group 1 - If it's a doctype tag

					// Zero or more attributes following the tag name
					'(?:',
						'\\s+',  // one or more whitespace chars before an attribute

						// Either:
						// A. attr="value", or
						// B. "value" alone (To cover example doctype tag: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">)
						'(?:', nameEqualsValueRegex, '|', attrValueRegex.source + ')',
					')*',
				'>',
			')',

			'|',

			// All other HTML tags (i.e. tags that are not <!DOCTYPE>)
			'(?:',
				'<(/)?',  // Beginning of a tag or comment. Either '<' for a start tag, or '</' for an end tag.
				          // *** Capturing Group 2: The slash or an empty string. Slash ('/') for end tag, empty string for start or self-closing tag.

					'(?:',
						commentTagRegex.source,  // *** Capturing Group 3 - A Comment Tag's Text

						'|',

						// Handle tag without attributes.
						// Doing this separately from a tag that has attributes
						// to fix a regex time complexity issue seen with the
						// example in https://github.com/gregjacobs/Autolinker.js/issues/172
						'(?:',
							// *** Capturing Group 4 - The tag name for a tag without attributes
							'(' + tagNameRegex.source + ')',

							'\\s*/?',  // any trailing spaces and optional '/' before the closing '>'
						')',

						'|',

						// Handle tag with attributes
						// Doing this separately from a tag with no attributes
						// to fix a regex time complexity issue seen with the
						// example in https://github.com/gregjacobs/Autolinker.js/issues/172
						'(?:',
							// *** Capturing Group 5 - The tag name for a tag with attributes
							'(' + tagNameRegex.source + ')',

							'\\s+',  // must have at least one space after the tag name to prevent ReDoS issue (issue #172)

							// Zero or more attributes following the tag name
							'(?:',
								'(?:\\s+|\\b)',        // any number of whitespace chars before an attribute. NOTE: Using \s* here throws Chrome into an infinite loop for some reason, so using \s+|\b instead
								nameEqualsValueRegex,  // attr="value" (with optional ="value" part)
							')*',

							'\\s*/?',  // any trailing spaces and optional '/' before the closing '>'
						')',
					')',
				'>',
			')'
		].join( "" ), 'gi' );
	} )(),

	/**
	 * @private
	 * @property {RegExp} htmlCharacterEntitiesRegex
	 *
	 * The regular expression that matches common HTML character entities.
	 *
	 * Ignoring &amp; as it could be part of a query string -- handling it separately.
	 */
	htmlCharacterEntitiesRegex: /(&nbsp;|&#160;|&lt;|&#60;|&gt;|&#62;|&quot;|&#34;|&#39;)/gi,


	/**
	 * Parses an HTML string and returns a simple array of {@link Autolinker.htmlParser.HtmlNode HtmlNodes}
	 * to represent the HTML structure of the input string.
	 *
	 * @param {String} html The HTML to parse.
	 * @return {Autolinker.htmlParser.HtmlNode[]}
	 */
	parse : function( html ) {
		var htmlRegex = this.htmlRegex,
		    currentResult,
		    lastIndex = 0,
		    textAndEntityNodes,
		    nodes = [];  // will be the result of the method

		while( ( currentResult = htmlRegex.exec( html ) ) !== null ) {
			var tagText = currentResult[ 0 ],
			    commentText = currentResult[ 3 ], // if we've matched a comment
			    tagName = currentResult[ 1 ] || currentResult[ 4 ] || currentResult[ 5 ],  // The <!DOCTYPE> tag (ex: "!DOCTYPE"), or another tag (ex: "a" or "img")
			    isClosingTag = !!currentResult[ 2 ],
			    offset = currentResult.index,
			    inBetweenTagsText = html.substring( lastIndex, offset );

			// Push TextNodes and EntityNodes for any text found between tags
			if( inBetweenTagsText ) {
				textAndEntityNodes = this.parseTextAndEntityNodes( lastIndex, inBetweenTagsText );
				nodes.push.apply( nodes, textAndEntityNodes );
			}

			// Push the CommentNode or ElementNode
			if( commentText ) {
				nodes.push( this.createCommentNode( offset, tagText, commentText ) );
			} else {
				nodes.push( this.createElementNode( offset, tagText, tagName, isClosingTag ) );
			}

			lastIndex = offset + tagText.length;
		}

		// Process any remaining text after the last HTML element. Will process all of the text if there were no HTML elements.
		if( lastIndex < html.length ) {
			var text = html.substring( lastIndex );

			// Push TextNodes and EntityNodes for any text found between tags
			if( text ) {
				textAndEntityNodes = this.parseTextAndEntityNodes( lastIndex, text );

				// Note: the following 3 lines were previously:
				//   nodes.push.apply( nodes, textAndEntityNodes );
				// but this was causing a "Maximum Call Stack Size Exceeded"
				// error on inputs with a large number of html entities.
				textAndEntityNodes.forEach( function( node ) {
					nodes.push( node );
				} );
			}
		}

		return nodes;
	},


	/**
	 * Parses text and HTML entity nodes from a given string. The input string
	 * should not have any HTML tags (elements) within it.
	 *
	 * @private
	 * @param {Number} offset The offset of the text node match within the
	 *   original HTML string.
	 * @param {String} text The string of text to parse. This is from an HTML
	 *   text node.
	 * @return {Autolinker.htmlParser.HtmlNode[]} An array of HtmlNodes to
	 *   represent the {@link Autolinker.htmlParser.TextNode TextNodes} and
	 *   {@link Autolinker.htmlParser.EntityNode EntityNodes} found.
	 */
	parseTextAndEntityNodes : function( offset, text ) {
		var nodes = [],
		    textAndEntityTokens = Autolinker.Util.splitAndCapture( text, this.htmlCharacterEntitiesRegex );  // split at HTML entities, but include the HTML entities in the results array

		// Every even numbered token is a TextNode, and every odd numbered token is an EntityNode
		// For example: an input `text` of "Test &quot;this&quot; today" would turn into the
		//   `textAndEntityTokens`: [ 'Test ', '&quot;', 'this', '&quot;', ' today' ]
		for( var i = 0, len = textAndEntityTokens.length; i < len; i += 2 ) {
			var textToken = textAndEntityTokens[ i ],
			    entityToken = textAndEntityTokens[ i + 1 ];

			if( textToken ) {
				nodes.push( this.createTextNode( offset, textToken ) );
				offset += textToken.length;
			}
			if( entityToken ) {
				nodes.push( this.createEntityNode( offset, entityToken ) );
				offset += entityToken.length;
			}
		}
		return nodes;
	},


	/**
	 * Factory method to create an {@link Autolinker.htmlParser.CommentNode CommentNode}.
	 *
	 * @private
	 * @param {Number} offset The offset of the match within the original HTML
	 *   string.
	 * @param {String} tagText The full text of the tag (comment) that was
	 *   matched, including its &lt;!-- and --&gt;.
	 * @param {String} commentText The full text of the comment that was matched.
	 */
	createCommentNode : function( offset, tagText, commentText ) {
		return new Autolinker.htmlParser.CommentNode( {
			offset : offset,
			text   : tagText,
			comment: Autolinker.Util.trim( commentText )
		} );
	},


	/**
	 * Factory method to create an {@link Autolinker.htmlParser.ElementNode ElementNode}.
	 *
	 * @private
	 * @param {Number} offset The offset of the match within the original HTML
	 *   string.
	 * @param {String} tagText The full text of the tag (element) that was
	 *   matched, including its attributes.
	 * @param {String} tagName The name of the tag. Ex: An &lt;img&gt; tag would
	 *   be passed to this method as "img".
	 * @param {Boolean} isClosingTag `true` if it's a closing tag, false
	 *   otherwise.
	 * @return {Autolinker.htmlParser.ElementNode}
	 */
	createElementNode : function( offset, tagText, tagName, isClosingTag ) {
		return new Autolinker.htmlParser.ElementNode( {
			offset  : offset,
			text    : tagText,
			tagName : tagName.toLowerCase(),
			closing : isClosingTag
		} );
	},


	/**
	 * Factory method to create a {@link Autolinker.htmlParser.EntityNode EntityNode}.
	 *
	 * @private
	 * @param {Number} offset The offset of the match within the original HTML
	 *   string.
	 * @param {String} text The text that was matched for the HTML entity (such
	 *   as '&amp;nbsp;').
	 * @return {Autolinker.htmlParser.EntityNode}
	 */
	createEntityNode : function( offset, text ) {
		return new Autolinker.htmlParser.EntityNode( { offset: offset, text: text } );
	},


	/**
	 * Factory method to create a {@link Autolinker.htmlParser.TextNode TextNode}.
	 *
	 * @private
	 * @param {Number} offset The offset of the match within the original HTML
	 *   string.
	 * @param {String} text The text that was matched.
	 * @return {Autolinker.htmlParser.TextNode}
	 */
	createTextNode : function( offset, text ) {
		return new Autolinker.htmlParser.TextNode( { offset: offset, text: text } );
	}

} );

/*global Autolinker */
/**
 * @abstract
 * @class Autolinker.htmlParser.HtmlNode
 *
 * Represents an HTML node found in an input string. An HTML node is one of the
 * following:
 *
 * 1. An {@link Autolinker.htmlParser.ElementNode ElementNode}, which represents
 *    HTML tags.
 * 2. A {@link Autolinker.htmlParser.CommentNode CommentNode}, which represents
 *    HTML comments.
 * 3. A {@link Autolinker.htmlParser.TextNode TextNode}, which represents text
 *    outside or within HTML tags.
 * 4. A {@link Autolinker.htmlParser.EntityNode EntityNode}, which represents
 *    one of the known HTML entities that Autolinker looks for. This includes
 *    common ones such as &amp;quot; and &amp;nbsp;
 */
Autolinker.htmlParser.HtmlNode = Autolinker.Util.extend( Object, {

	/**
	 * @cfg {Number} offset (required)
	 *
	 * The offset of the HTML node in the original text that was parsed.
	 */
	offset : undefined,

	/**
	 * @cfg {String} text (required)
	 *
	 * The text that was matched for the HtmlNode.
	 *
	 * - In the case of an {@link Autolinker.htmlParser.ElementNode ElementNode},
	 *   this will be the tag's text.
	 * - In the case of an {@link Autolinker.htmlParser.CommentNode CommentNode},
	 *   this will be the comment's text.
	 * - In the case of a {@link Autolinker.htmlParser.TextNode TextNode}, this
	 *   will be the text itself.
	 * - In the case of a {@link Autolinker.htmlParser.EntityNode EntityNode},
	 *   this will be the text of the HTML entity.
	 */
	text : undefined,


	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match instance,
	 * specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.Util.assign( this, cfg );

		if( this.offset == null ) throw new Error( '`offset` cfg required' );
		if( this.text == null ) throw new Error( '`text` cfg required' );
	},


	/**
	 * Returns a string name for the type of node that this class represents.
	 *
	 * @abstract
	 * @return {String}
	 */
	getType : Autolinker.Util.abstractMethod,


	/**
	 * Retrieves the {@link #offset} of the HtmlNode. This is the offset of the
	 * HTML node in the original string that was parsed.
	 *
	 * @return {Number}
	 */
	getOffset : function() {
		return this.offset;
	},


	/**
	 * Retrieves the {@link #text} for the HtmlNode.
	 *
	 * @return {String}
	 */
	getText : function() {
		return this.text;
	}

} );
/*global Autolinker */
/**
 * @class Autolinker.htmlParser.CommentNode
 * @extends Autolinker.htmlParser.HtmlNode
 *
 * Represents an HTML comment node that has been parsed by the
 * {@link Autolinker.htmlParser.HtmlParser}.
 *
 * See this class's superclass ({@link Autolinker.htmlParser.HtmlNode}) for more
 * details.
 */
Autolinker.htmlParser.CommentNode = Autolinker.Util.extend( Autolinker.htmlParser.HtmlNode, {

	/**
	 * @cfg {String} comment (required)
	 *
	 * The text inside the comment tag. This text is stripped of any leading or
	 * trailing whitespace.
	 */
	comment : '',


	/**
	 * Returns a string name for the type of node that this class represents.
	 *
	 * @return {String}
	 */
	getType : function() {
		return 'comment';
	},


	/**
	 * Returns the comment inside the comment tag.
	 *
	 * @return {String}
	 */
	getComment : function() {
		return this.comment;
	}

} );
/*global Autolinker */
/**
 * @class Autolinker.htmlParser.ElementNode
 * @extends Autolinker.htmlParser.HtmlNode
 *
 * Represents an HTML element node that has been parsed by the {@link Autolinker.htmlParser.HtmlParser}.
 *
 * See this class's superclass ({@link Autolinker.htmlParser.HtmlNode}) for more
 * details.
 */
Autolinker.htmlParser.ElementNode = Autolinker.Util.extend( Autolinker.htmlParser.HtmlNode, {

	/**
	 * @cfg {String} tagName (required)
	 *
	 * The name of the tag that was matched.
	 */
	tagName : '',

	/**
	 * @cfg {Boolean} closing (required)
	 *
	 * `true` if the element (tag) is a closing tag, `false` if its an opening
	 * tag.
	 */
	closing : false,


	/**
	 * Returns a string name for the type of node that this class represents.
	 *
	 * @return {String}
	 */
	getType : function() {
		return 'element';
	},


	/**
	 * Returns the HTML element's (tag's) name. Ex: for an &lt;img&gt; tag,
	 * returns "img".
	 *
	 * @return {String}
	 */
	getTagName : function() {
		return this.tagName;
	},


	/**
	 * Determines if the HTML element (tag) is a closing tag. Ex: &lt;div&gt;
	 * returns `false`, while &lt;/div&gt; returns `true`.
	 *
	 * @return {Boolean}
	 */
	isClosing : function() {
		return this.closing;
	}

} );
/*global Autolinker */
/**
 * @class Autolinker.htmlParser.EntityNode
 * @extends Autolinker.htmlParser.HtmlNode
 *
 * Represents a known HTML entity node that has been parsed by the {@link Autolinker.htmlParser.HtmlParser}.
 * Ex: '&amp;nbsp;', or '&amp#160;' (which will be retrievable from the {@link #getText}
 * method.
 *
 * Note that this class will only be returned from the HtmlParser for the set of
 * checked HTML entity nodes  defined by the {@link Autolinker.htmlParser.HtmlParser#htmlCharacterEntitiesRegex}.
 *
 * See this class's superclass ({@link Autolinker.htmlParser.HtmlNode}) for more
 * details.
 */
Autolinker.htmlParser.EntityNode = Autolinker.Util.extend( Autolinker.htmlParser.HtmlNode, {

	/**
	 * Returns a string name for the type of node that this class represents.
	 *
	 * @return {String}
	 */
	getType : function() {
		return 'entity';
	}

} );
/*global Autolinker */
/**
 * @class Autolinker.htmlParser.TextNode
 * @extends Autolinker.htmlParser.HtmlNode
 *
 * Represents a text node that has been parsed by the {@link Autolinker.htmlParser.HtmlParser}.
 *
 * See this class's superclass ({@link Autolinker.htmlParser.HtmlNode}) for more
 * details.
 */
Autolinker.htmlParser.TextNode = Autolinker.Util.extend( Autolinker.htmlParser.HtmlNode, {

	/**
	 * Returns a string name for the type of node that this class represents.
	 *
	 * @return {String}
	 */
	getType : function() {
		return 'text';
	}

} );
/*global Autolinker */
/**
 * @abstract
 * @class Autolinker.match.Match
 *
 * Represents a match found in an input string which should be Autolinked. A Match object is what is provided in a
 * {@link Autolinker#replaceFn replaceFn}, and may be used to query for details about the match.
 *
 * For example:
 *
 *     var input = "...";  // string with URLs, Email Addresses, and Mentions (Twitter, Instagram)
 *
 *     var linkedText = Autolinker.link( input, {
 *         replaceFn : function( match ) {
 *             console.log( "href = ", match.getAnchorHref() );
 *             console.log( "text = ", match.getAnchorText() );
 *
 *             switch( match.getType() ) {
 *                 case 'url' :
 *                     console.log( "url: ", match.getUrl() );
 *
 *                 case 'email' :
 *                     console.log( "email: ", match.getEmail() );
 *
 *                 case 'mention' :
 *                     console.log( "mention: ", match.getMention() );
 *             }
 *         }
 *     } );
 *
 * See the {@link Autolinker} class for more details on using the {@link Autolinker#replaceFn replaceFn}.
 */
Autolinker.match.Match = Autolinker.Util.extend( Object, {

	/**
	 * @cfg {Autolinker.AnchorTagBuilder} tagBuilder (required)
	 *
	 * Reference to the AnchorTagBuilder instance to use to generate an anchor
	 * tag for the Match.
	 */

	/**
	 * @cfg {String} matchedText (required)
	 *
	 * The original text that was matched by the {@link Autolinker.matcher.Matcher}.
	 */

	/**
	 * @cfg {Number} offset (required)
	 *
	 * The offset of where the match was made in the input string.
	 */


	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match
	 *   instance, specified in an Object (map).
	 */
	constructor : function( cfg ) {
		if( cfg.tagBuilder == null ) throw new Error( '`tagBuilder` cfg required' );
		if( cfg.matchedText == null ) throw new Error( '`matchedText` cfg required' );
		if( cfg.offset == null ) throw new Error( '`offset` cfg required' );

		this.tagBuilder = cfg.tagBuilder;
		this.matchedText = cfg.matchedText;
		this.offset = cfg.offset;
	},


	/**
	 * Returns a string name for the type of match that this class represents.
	 *
	 * @abstract
	 * @return {String}
	 */
	getType : Autolinker.Util.abstractMethod,


	/**
	 * Returns the original text that was matched.
	 *
	 * @return {String}
	 */
	getMatchedText : function() {
		return this.matchedText;
	},


	/**
	 * Sets the {@link #offset} of where the match was made in the input string.
	 *
	 * A {@link Autolinker.matcher.Matcher} will be fed only HTML text nodes,
	 * and will therefore set an original offset that is relative to the HTML
	 * text node itself. However, we want this offset to be relative to the full
	 * HTML input string, and thus if using {@link Autolinker#parse} (rather
	 * than calling a {@link Autolinker.matcher.Matcher} directly), then this
	 * offset is corrected after the Matcher itself has done its job.
	 *
	 * @param {Number} offset
	 */
	setOffset : function( offset ) {
		this.offset = offset;
	},


	/**
	 * Returns the offset of where the match was made in the input string. This
	 * is the 0-based index of the match.
	 *
	 * @return {Number}
	 */
	getOffset : function() {
		return this.offset;
	},


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @abstract
	 * @return {String}
	 */
	getAnchorHref : Autolinker.Util.abstractMethod,


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @abstract
	 * @return {String}
	 */
	getAnchorText : Autolinker.Util.abstractMethod,


	/**
	 * Returns the CSS class suffix(es) for this match.
	 *
	 * A CSS class suffix is appended to the {@link Autolinker#className} in
	 * the {@link Autolinker.AnchorTagBuilder} when a match is translated into
	 * an anchor tag.
	 *
	 * For example, if {@link Autolinker#className} was configured as 'myLink',
	 * and this method returns `[ 'url' ]`, the final class name of the element
	 * will become: 'myLink myLink-url'.
	 *
	 * The match may provide multiple CSS class suffixes to be appended to the
	 * {@link Autolinker#className} in order to facilitate better styling
	 * options for different match criteria. See {@link Autolinker.match.Mention}
	 * for an example.
	 *
	 * By default, this method returns a single array with the match's
	 * {@link #getType type} name, but may be overridden by subclasses.
	 *
	 * @return {String[]}
	 */
	getCssClassSuffixes : function() {
		return [ this.getType() ];
	},


	/**
	 * Builds and returns an {@link Autolinker.HtmlTag} instance based on the
	 * Match.
	 *
	 * This can be used to easily generate anchor tags from matches, and either
	 * return their HTML string, or modify them before doing so.
	 *
	 * Example Usage:
	 *
	 *     var tag = match.buildTag();
	 *     tag.addClass( 'cordova-link' );
	 *     tag.setAttr( 'target', '_system' );
	 *
	 *     tag.toAnchorString();  // <a href="http://google.com" class="cordova-link" target="_system">Google</a>
	 */
	buildTag : function() {
		return this.tagBuilder.build( this );
	}

} );

/*global Autolinker */
/**
 * @class Autolinker.match.Email
 * @extends Autolinker.match.Match
 *
 * Represents a Email match found in an input string which should be Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more details.
 */
Autolinker.match.Email = Autolinker.Util.extend( Autolinker.match.Match, {

	/**
	 * @cfg {String} email (required)
	 *
	 * The email address that was matched.
	 */


	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match
	 *   instance, specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.match.Match.prototype.constructor.call( this, cfg );

		if( !cfg.email ) throw new Error( '`email` cfg required' );

		this.email = cfg.email;
	},


	/**
	 * Returns a string name for the type of match that this class represents.
	 *
	 * @return {String}
	 */
	getType : function() {
		return 'email';
	},


	/**
	 * Returns the email address that was matched.
	 *
	 * @return {String}
	 */
	getEmail : function() {
		return this.email;
	},


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorHref : function() {
		return 'mailto:' + this.email;
	},


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorText : function() {
		return this.email;
	}

} );
/*global Autolinker */
/**
 * @class Autolinker.match.Hashtag
 * @extends Autolinker.match.Match
 *
 * Represents a Hashtag match found in an input string which should be
 * Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more
 * details.
 */
Autolinker.match.Hashtag = Autolinker.Util.extend( Autolinker.match.Match, {

	/**
	 * @cfg {String} serviceName
	 *
	 * The service to point hashtag matches to. See {@link Autolinker#hashtag}
	 * for available values.
	 */

	/**
	 * @cfg {String} hashtag (required)
	 *
	 * The Hashtag that was matched, without the '#'.
	 */


	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match
	 *   instance, specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.match.Match.prototype.constructor.call( this, cfg );

		// TODO: if( !serviceName ) throw new Error( '`serviceName` cfg required' );
		if( !cfg.hashtag ) throw new Error( '`hashtag` cfg required' );

		this.serviceName = cfg.serviceName;
		this.hashtag = cfg.hashtag;
	},


	/**
	 * Returns the type of match that this class represents.
	 *
	 * @return {String}
	 */
	getType : function() {
		return 'hashtag';
	},


	/**
	 * Returns the configured {@link #serviceName} to point the Hashtag to.
	 * Ex: 'facebook', 'twitter'.
	 *
	 * @return {String}
	 */
	getServiceName : function() {
		return this.serviceName;
	},


	/**
	 * Returns the matched hashtag, without the '#' character.
	 *
	 * @return {String}
	 */
	getHashtag : function() {
		return this.hashtag;
	},


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorHref : function() {
		var serviceName = this.serviceName,
		    hashtag = this.hashtag;

		switch( serviceName ) {
			case 'twitter' :
				return 'https://twitter.com/hashtag/' + hashtag;
			case 'facebook' :
				return 'https://www.facebook.com/hashtag/' + hashtag;
			case 'instagram' :
				return 'https://instagram.com/explore/tags/' + hashtag;

			default :  // Shouldn't happen because Autolinker's constructor should block any invalid values, but just in case.
				throw new Error( 'Unknown service name to point hashtag to: ', serviceName );
		}
	},


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorText : function() {
		return '#' + this.hashtag;
	}

} );

/*global Autolinker */
/**
 * @class Autolinker.match.Phone
 * @extends Autolinker.match.Match
 *
 * Represents a Phone number match found in an input string which should be
 * Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more
 * details.
 */
Autolinker.match.Phone = Autolinker.Util.extend( Autolinker.match.Match, {

	/**
	 * @protected
	 * @property {String} number (required)
	 *
	 * The phone number that was matched, without any delimiter characters.
	 *
	 * Note: This is a string to allow for prefixed 0's.
	 */

	/**
	 * @protected
	 * @property  {Boolean} plusSign (required)
	 *
	 * `true` if the matched phone number started with a '+' sign. We'll include
	 * it in the `tel:` URL if so, as this is needed for international numbers.
	 *
	 * Ex: '+1 (123) 456 7879'
	 */


	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match
	 *   instance, specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.match.Match.prototype.constructor.call( this, cfg );

		if( !cfg.number ) throw new Error( '`number` cfg required' );
		if( cfg.plusSign == null ) throw new Error( '`plusSign` cfg required' );

		this.number = cfg.number;
		this.plusSign = cfg.plusSign;
	},


	/**
	 * Returns a string name for the type of match that this class represents.
	 *
	 * @return {String}
	 */
	getType : function() {
		return 'phone';
	},


	/**
	 * Returns the phone number that was matched as a string, without any
	 * delimiter characters.
	 *
	 * Note: This is a string to allow for prefixed 0's.
	 *
	 * @return {String}
	 */
	getNumber: function() {
		return this.number;
	},


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorHref : function() {
		return 'tel:' + ( this.plusSign ? '+' : '' ) + this.number;
	},


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorText : function() {
		return this.matchedText;
	}

} );

/*global Autolinker */
/**
 * @class Autolinker.match.Mention
 * @extends Autolinker.match.Match
 *
 * Represents a Mention match found in an input string which should be Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more details.
 */
Autolinker.match.Mention = Autolinker.Util.extend( Autolinker.match.Match, {

	/**
	 * @cfg {String} serviceName
	 *
	 * The service to point mention matches to. See {@link Autolinker#mention}
	 * for available values.
	 */

	/**
	 * @cfg {String} mention (required)
	 *
	 * The Mention that was matched, without the '@' character.
	 */


	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match
	 *   instance, specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.match.Match.prototype.constructor.call( this, cfg );

		if( !cfg.serviceName ) throw new Error( '`serviceName` cfg required' );
		if( !cfg.mention ) throw new Error( '`mention` cfg required' );

		this.mention = cfg.mention;
		this.serviceName = cfg.serviceName;
	},


	/**
	 * Returns the type of match that this class represents.
	 *
	 * @return {String}
	 */
	getType : function() {
		return 'mention';
	},


	/**
	 * Returns the mention, without the '@' character.
	 *
	 * @return {String}
	 */
	getMention : function() {
		return this.mention;
	},


	/**
	 * Returns the configured {@link #serviceName} to point the mention to.
	 * Ex: 'instagram', 'twitter'.
	 *
	 * @return {String}
	 */
	getServiceName : function() {
		return this.serviceName;
	},


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorHref : function() {
		switch( this.serviceName ) {
			case 'twitter' :
				return 'https://twitter.com/' + this.mention;
			case 'instagram' :
				return 'https://instagram.com/' + this.mention;

			default :  // Shouldn't happen because Autolinker's constructor should block any invalid values, but just in case.
				throw new Error( 'Unknown service name to point mention to: ', this.serviceName );
		}
	},


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorText : function() {
		return '@' + this.mention;
	},


	/**
	 * Returns the CSS class suffixes that should be used on a tag built with
	 * the match. See {@link Autolinker.match.Match#getCssClassSuffixes} for
	 * details.
	 *
	 * @return {String[]}
	 */
	getCssClassSuffixes : function() {
		var cssClassSuffixes = Autolinker.match.Match.prototype.getCssClassSuffixes.call( this ),
		    serviceName = this.getServiceName();

		if( serviceName ) {
			cssClassSuffixes.push( serviceName );
		}
		return cssClassSuffixes;
	}

} );

/*global Autolinker */
/**
 * @class Autolinker.match.Url
 * @extends Autolinker.match.Match
 *
 * Represents a Url match found in an input string which should be Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more details.
 */
Autolinker.match.Url = Autolinker.Util.extend( Autolinker.match.Match, {

	/**
	 * @cfg {String} url (required)
	 *
	 * The url that was matched.
	 */

	/**
	 * @cfg {"scheme"/"www"/"tld"} urlMatchType (required)
	 *
	 * The type of URL match that this class represents. This helps to determine
	 * if the match was made in the original text with a prefixed scheme (ex:
	 * 'http://www.google.com'), a prefixed 'www' (ex: 'www.google.com'), or
	 * was matched by a known top-level domain (ex: 'google.com').
	 */

	/**
	 * @cfg {Boolean} protocolUrlMatch (required)
	 *
	 * `true` if the URL is a match which already has a protocol (i.e.
	 * 'http://'), `false` if the match was from a 'www' or known TLD match.
	 */

	/**
	 * @cfg {Boolean} protocolRelativeMatch (required)
	 *
	 * `true` if the URL is a protocol-relative match. A protocol-relative match
	 * is a URL that starts with '//', and will be either http:// or https://
	 * based on the protocol that the site is loaded under.
	 */

	/**
	 * @cfg {Object} stripPrefix (required)
	 *
	 * The Object form of {@link Autolinker#cfg-stripPrefix}.
	 */

	/**
	 * @cfg {Boolean} stripTrailingSlash (required)
	 * @inheritdoc Autolinker#cfg-stripTrailingSlash
	 */


	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match
	 *   instance, specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.match.Match.prototype.constructor.call( this, cfg );

		if( cfg.urlMatchType !== 'scheme' && cfg.urlMatchType !== 'www' && cfg.urlMatchType !== 'tld' ) throw new Error( '`urlMatchType` cfg must be one of: "scheme", "www", or "tld"' );
		if( !cfg.url ) throw new Error( '`url` cfg required' );
		if( cfg.protocolUrlMatch == null ) throw new Error( '`protocolUrlMatch` cfg required' );
		if( cfg.protocolRelativeMatch == null ) throw new Error( '`protocolRelativeMatch` cfg required' );
		if( cfg.stripPrefix == null ) throw new Error( '`stripPrefix` cfg required' );
		if( cfg.stripTrailingSlash == null ) throw new Error( '`stripTrailingSlash` cfg required' );

		this.urlMatchType = cfg.urlMatchType;
		this.url = cfg.url;
		this.protocolUrlMatch = cfg.protocolUrlMatch;
		this.protocolRelativeMatch = cfg.protocolRelativeMatch;
		this.stripPrefix = cfg.stripPrefix;
		this.stripTrailingSlash = cfg.stripTrailingSlash;
	},


	/**
	 * @private
	 * @property {RegExp} schemePrefixRegex
	 *
	 * A regular expression used to remove the 'http://' or 'https://' from
	 * URLs.
	 */
	schemePrefixRegex: /^(https?:\/\/)?/i,

	/**
	 * @private
	 * @property {RegExp} wwwPrefixRegex
	 *
	 * A regular expression used to remove the 'www.' from URLs.
	 */
	wwwPrefixRegex: /^(https?:\/\/)?(www\.)?/i,

	/**
	 * @private
	 * @property {RegExp} protocolRelativeRegex
	 *
	 * The regular expression used to remove the protocol-relative '//' from the {@link #url} string, for purposes
	 * of {@link #getAnchorText}. A protocol-relative URL is, for example, "//yahoo.com"
	 */
	protocolRelativeRegex : /^\/\//,

	/**
	 * @private
	 * @property {Boolean} protocolPrepended
	 *
	 * Will be set to `true` if the 'http://' protocol has been prepended to the {@link #url} (because the
	 * {@link #url} did not have a protocol)
	 */
	protocolPrepended : false,


	/**
	 * Returns a string name for the type of match that this class represents.
	 *
	 * @return {String}
	 */
	getType : function() {
		return 'url';
	},


	/**
	 * Returns a string name for the type of URL match that this class
	 * represents.
	 *
	 * This helps to determine if the match was made in the original text with a
	 * prefixed scheme (ex: 'http://www.google.com'), a prefixed 'www' (ex:
	 * 'www.google.com'), or was matched by a known top-level domain (ex:
	 * 'google.com').
	 *
	 * @return {"scheme"/"www"/"tld"}
	 */
	getUrlMatchType : function() {
		return this.urlMatchType;
	},


	/**
	 * Returns the url that was matched, assuming the protocol to be 'http://' if the original
	 * match was missing a protocol.
	 *
	 * @return {String}
	 */
	getUrl : function() {
		var url = this.url;

		// if the url string doesn't begin with a protocol, assume 'http://'
		if( !this.protocolRelativeMatch && !this.protocolUrlMatch && !this.protocolPrepended ) {
			url = this.url = 'http://' + url;

			this.protocolPrepended = true;
		}

		return url;
	},


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorHref : function() {
		var url = this.getUrl();

		return url.replace( /&amp;/g, '&' );  // any &amp;'s in the URL should be converted back to '&' if they were displayed as &amp; in the source html
	},


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorText : function() {
		var anchorText = this.getMatchedText();

		if( this.protocolRelativeMatch ) {
			// Strip off any protocol-relative '//' from the anchor text
			anchorText = this.stripProtocolRelativePrefix( anchorText );
		}
		if( this.stripPrefix.scheme ) {
			anchorText = this.stripSchemePrefix( anchorText );
		}
		if( this.stripPrefix.www ) {
			anchorText = this.stripWwwPrefix( anchorText );
		}
		if( this.stripTrailingSlash ) {
			anchorText = this.removeTrailingSlash( anchorText );  // remove trailing slash, if there is one
		}

		return anchorText;
	},


	// ---------------------------------------

	// Utility Functionality

	/**
	 * Strips the scheme prefix (such as "http://" or "https://") from the given
	 * `url`.
	 *
	 * @private
	 * @param {String} url The text of the anchor that is being generated, for
	 *   which to strip off the url scheme.
	 * @return {String} The `url`, with the scheme stripped.
	 */
	stripSchemePrefix : function( url ) {
		return url.replace( this.schemePrefixRegex, '' );
	},


	/**
	 * Strips the 'www' prefix from the given `url`.
	 *
	 * @private
	 * @param {String} url The text of the anchor that is being generated, for
	 *   which to strip off the 'www' if it exists.
	 * @return {String} The `url`, with the 'www' stripped.
	 */
	stripWwwPrefix : function( url ) {
		return url.replace( this.wwwPrefixRegex, '$1' );  // leave any scheme ($1), it one exists
	},


	/**
	 * Strips any protocol-relative '//' from the anchor text.
	 *
	 * @private
	 * @param {String} text The text of the anchor that is being generated, for which to strip off the
	 *   protocol-relative prefix (such as stripping off "//")
	 * @return {String} The `anchorText`, with the protocol-relative prefix stripped.
	 */
	stripProtocolRelativePrefix : function( text ) {
		return text.replace( this.protocolRelativeRegex, '' );
	},


	/**
	 * Removes any trailing slash from the given `anchorText`, in preparation for the text to be displayed.
	 *
	 * @private
	 * @param {String} anchorText The text of the anchor that is being generated, for which to remove any trailing
	 *   slash ('/') that may exist.
	 * @return {String} The `anchorText`, with the trailing slash removed.
	 */
	removeTrailingSlash : function( anchorText ) {
		if( anchorText.charAt( anchorText.length - 1 ) === '/' ) {
			anchorText = anchorText.slice( 0, -1 );
		}
		return anchorText;
	}

} );
// NOTE: THIS IS A GENERATED FILE
// To update with the latest TLD list, run `gulp update-tld-list`

/*global Autolinker */
Autolinker.tldRegex = /(?:xn--vermgensberatung-pwb|xn--vermgensberater-ctb|xn--clchc0ea0b2g2a9gcd|xn--w4r85el8fhu5dnra|northwesternmutual|travelersinsurance|vermögensberatung|xn--3oq18vl8pn36a|xn--5su34j936bgsg|xn--bck1b9a5dre4c|xn--mgbai9azgqp6j|xn--mgberp4a5d4ar|xn--xkc2dl3a5ee0h|vermögensberater|xn--fzys8d69uvgm|xn--mgba7c0bbn0a|xn--xkc2al3hye2a|americanexpress|kerryproperties|sandvikcoromant|xn--i1b6b1a6a2e|xn--kcrx77d1x4a|xn--lgbbat1ad8j|xn--mgba3a4f16a|xn--mgbc0a9azcg|xn--nqv7fs00ema|afamilycompany|americanfamily|bananarepublic|cancerresearch|cookingchannel|kerrylogistics|weatherchannel|xn--54b7fta0cc|xn--6qq986b3xl|xn--80aqecdr1a|xn--b4w605ferd|xn--fiq228c5hs|xn--jlq61u9w7b|xn--mgba3a3ejt|xn--mgbaam7a8h|xn--mgbayh7gpa|xn--mgbb9fbpob|xn--mgbbh1a71e|xn--mgbca7dzdo|xn--mgbi4ecexp|xn--mgbx4cd0ab|international|lifeinsurance|orientexpress|spreadbetting|travelchannel|wolterskluwer|xn--eckvdtc9d|xn--fpcrj9c3d|xn--fzc2c9e2c|xn--tiq49xqyj|xn--yfro4i67o|xn--ygbi2ammx|construction|lplfinancial|pamperedchef|scholarships|versicherung|xn--3e0b707e|xn--80adxhks|xn--80asehdb|xn--8y0a063a|xn--gckr3f0f|xn--mgb9awbf|xn--mgbab2bd|xn--mgbpl2fh|xn--mgbt3dhd|xn--mk1bu44c|xn--ngbc5azd|xn--ngbe9e0a|xn--ogbpf8fl|xn--qcka1pmc|accountants|barclaycard|blackfriday|blockbuster|bridgestone|calvinklein|contractors|creditunion|engineering|enterprises|foodnetwork|investments|kerryhotels|lamborghini|motorcycles|olayangroup|photography|playstation|productions|progressive|redumbrella|rightathome|williamhill|xn--11b4c3d|xn--1ck2e1b|xn--1qqw23a|xn--3bst00m|xn--3ds443g|xn--42c2d9a|xn--45brj9c|xn--55qw42g|xn--6frz82g|xn--80ao21a|xn--9krt00a|xn--cck2b3b|xn--czr694b|xn--d1acj3b|xn--efvy88h|xn--estv75g|xn--fct429k|xn--fjq720a|xn--flw351e|xn--g2xx48c|xn--gecrj9c|xn--gk3at1e|xn--h2brj9c|xn--hxt814e|xn--imr513n|xn--j6w193g|xn--jvr189m|xn--kprw13d|xn--kpry57d|xn--kpu716f|xn--mgbtx2b|xn--mix891f|xn--nyqy26a|xn--pbt977c|xn--pgbs0dh|xn--q9jyb4c|xn--rhqv96g|xn--rovu88b|xn--s9brj9c|xn--ses554g|xn--t60b56a|xn--vuq861b|xn--w4rs40l|xn--xhq521b|xn--zfr164b|சிங்கப்பூர்|accountant|apartments|associates|basketball|bnpparibas|boehringer|capitalone|consulting|creditcard|cuisinella|eurovision|extraspace|foundation|healthcare|immobilien|industries|management|mitsubishi|nationwide|newholland|nextdirect|onyourside|properties|protection|prudential|realestate|republican|restaurant|schaeffler|swiftcover|tatamotors|technology|telefonica|university|vistaprint|vlaanderen|volkswagen|xn--30rr7y|xn--3pxu8k|xn--45q11c|xn--4gbrim|xn--55qx5d|xn--5tzm5g|xn--80aswg|xn--90a3ac|xn--9dbq2a|xn--9et52u|xn--c2br7g|xn--cg4bki|xn--czrs0t|xn--czru2d|xn--fiq64b|xn--fiqs8s|xn--fiqz9s|xn--io0a7i|xn--kput3i|xn--mxtq1m|xn--o3cw4h|xn--pssy2u|xn--unup4y|xn--wgbh1c|xn--wgbl6a|xn--y9a3aq|accenture|alfaromeo|allfinanz|amsterdam|analytics|aquarelle|barcelona|bloomberg|christmas|community|directory|education|equipment|fairwinds|financial|firestone|fresenius|frontdoor|fujixerox|furniture|goldpoint|goodhands|hisamitsu|homedepot|homegoods|homesense|honeywell|institute|insurance|kuokgroup|ladbrokes|lancaster|landrover|lifestyle|marketing|marshalls|mcdonalds|melbourne|microsoft|montblanc|panasonic|passagens|pramerica|richardli|scjohnson|shangrila|solutions|statebank|statefarm|stockholm|travelers|vacations|xn--90ais|xn--c1avg|xn--d1alf|xn--e1a4c|xn--fhbei|xn--j1aef|xn--j1amh|xn--l1acc|xn--nqv7f|xn--p1acf|xn--tckwe|xn--vhquv|yodobashi|abudhabi|airforce|allstate|attorney|barclays|barefoot|bargains|baseball|boutique|bradesco|broadway|brussels|budapest|builders|business|capetown|catering|catholic|chrysler|cipriani|cityeats|cleaning|clinique|clothing|commbank|computer|delivery|deloitte|democrat|diamonds|discount|discover|download|engineer|ericsson|esurance|everbank|exchange|feedback|fidelity|firmdale|football|frontier|goodyear|grainger|graphics|guardian|hdfcbank|helsinki|holdings|hospital|infiniti|ipiranga|istanbul|jpmorgan|lighting|lundbeck|marriott|maserati|mckinsey|memorial|mortgage|movistar|observer|partners|pharmacy|pictures|plumbing|property|redstone|reliance|saarland|samsclub|security|services|shopping|showtime|softbank|software|stcgroup|supplies|symantec|telecity|training|uconnect|vanguard|ventures|verisign|woodside|xn--90ae|xn--node|xn--p1ai|xn--qxam|yokohama|السعودية|abogado|academy|agakhan|alibaba|android|athleta|auction|audible|auspost|avianca|banamex|bauhaus|bentley|bestbuy|booking|brother|bugatti|capital|caravan|careers|cartier|channel|chintai|citadel|clubmed|college|cologne|comcast|company|compare|contact|cooking|corsica|country|coupons|courses|cricket|cruises|dentist|digital|domains|exposed|express|farmers|fashion|ferrari|ferrero|finance|fishing|fitness|flights|florist|flowers|forsale|frogans|fujitsu|gallery|genting|godaddy|guitars|hamburg|hangout|hitachi|holiday|hosting|hoteles|hotmail|hyundai|iselect|ismaili|jewelry|juniper|kitchen|komatsu|lacaixa|lancome|lanxess|lasalle|latrobe|leclerc|liaison|limited|lincoln|markets|metlife|monster|netbank|netflix|network|neustar|okinawa|oldnavy|organic|origins|panerai|philips|pioneer|politie|realtor|recipes|rentals|reviews|rexroth|samsung|sandvik|schmidt|schwarz|science|shiksha|shriram|singles|spiegel|staples|starhub|statoil|storage|support|surgery|systems|temasek|theater|theatre|tickets|tiffany|toshiba|trading|walmart|wanggou|watches|weather|website|wedding|whoswho|windows|winners|xfinity|yamaxun|youtube|zuerich|католик|الجزائر|العليان|پاکستان|كاثوليك|موبايلي|இந்தியா|abarth|abbott|abbvie|active|africa|agency|airbus|airtel|alipay|alsace|alstom|anquan|aramco|author|bayern|beauty|berlin|bharti|blanco|bostik|boston|broker|camera|career|caseih|casino|center|chanel|chrome|church|circle|claims|clinic|coffee|comsec|condos|coupon|credit|cruise|dating|datsun|dealer|degree|dental|design|direct|doctor|dunlop|dupont|durban|emerck|energy|estate|events|expert|family|flickr|futbol|gallup|garden|george|giving|global|google|gratis|health|hermes|hiphop|hockey|hughes|imamat|insure|intuit|jaguar|joburg|juegos|kaufen|kinder|kindle|kosher|lancia|latino|lawyer|lefrak|living|locker|london|luxury|madrid|maison|makeup|market|mattel|mobile|mobily|monash|mormon|moscow|museum|mutual|nagoya|natura|nissan|nissay|norton|nowruz|office|olayan|online|oracle|orange|otsuka|pfizer|photos|physio|piaget|pictet|quebec|racing|realty|reisen|repair|report|review|rocher|rogers|ryukyu|safety|sakura|sanofi|school|schule|secure|select|shouji|soccer|social|stream|studio|supply|suzuki|swatch|sydney|taipei|taobao|target|tattoo|tennis|tienda|tjmaxx|tkmaxx|toyota|travel|unicom|viajes|viking|villas|virgin|vision|voting|voyage|vuelos|walter|warman|webcam|xihuan|xperia|yachts|yandex|zappos|москва|онлайн|ابوظبي|ارامكو|الاردن|المغرب|امارات|فلسطين|مليسيا|இலங்கை|ファッション|actor|adult|aetna|amfam|amica|apple|archi|audio|autos|azure|baidu|beats|bible|bingo|black|boats|boots|bosch|build|canon|cards|chase|cheap|chloe|cisco|citic|click|cloud|coach|codes|crown|cymru|dabur|dance|deals|delta|dodge|drive|dubai|earth|edeka|email|epost|epson|faith|fedex|final|forex|forum|gallo|games|gifts|gives|glade|glass|globo|gmail|green|gripe|group|gucci|guide|homes|honda|horse|house|hyatt|ikano|intel|irish|iveco|jetzt|koeln|kyoto|lamer|lease|legal|lexus|lilly|linde|lipsy|lixil|loans|locus|lotte|lotto|lupin|macys|mango|media|miami|money|mopar|movie|nadex|nexus|nikon|ninja|nokia|nowtv|omega|osaka|paris|parts|party|phone|photo|pizza|place|poker|praxi|press|prime|promo|quest|radio|rehab|reise|ricoh|rocks|rodeo|salon|sener|seven|sharp|shell|shoes|skype|sling|smart|smile|solar|space|stada|store|study|style|sucks|swiss|tatar|tires|tirol|tmall|today|tokyo|tools|toray|total|tours|trade|trust|tunes|tushu|ubank|vegas|video|vista|vodka|volvo|wales|watch|weber|weibo|works|world|xerox|yahoo|zippo|ایران|بازار|بھارت|سودان|سورية|همراه|संगठन|বাংলা|భారత్|嘉里大酒店|aarp|able|adac|aero|aigo|akdn|ally|amex|army|arpa|arte|asda|asia|audi|auto|baby|band|bank|bbva|beer|best|bike|bing|blog|blue|bofa|bond|book|buzz|cafe|call|camp|care|cars|casa|case|cash|cbre|cern|chat|citi|city|club|cool|coop|cyou|data|date|dclk|deal|dell|desi|diet|dish|docs|doha|duck|duns|dvag|erni|fage|fail|fans|farm|fast|fiat|fido|film|fire|fish|flir|food|ford|free|fund|game|gbiz|gent|ggee|gift|gmbh|gold|golf|goog|guge|guru|hair|haus|hdfc|help|here|hgtv|host|hsbc|icbc|ieee|imdb|immo|info|itau|java|jeep|jobs|jprs|kddi|kiwi|kpmg|kred|land|lego|lgbt|lidl|life|like|limo|link|live|loan|loft|love|ltda|luxe|maif|meet|meme|menu|mini|mint|mobi|moda|moto|mtpc|name|navy|news|next|nico|nike|ollo|open|page|pars|pccw|pics|ping|pink|play|plus|pohl|porn|post|prod|prof|qpon|raid|read|reit|rent|rest|rich|rmit|room|rsvp|ruhr|safe|sale|sapo|sarl|save|saxo|scor|scot|seat|seek|sexy|shaw|shia|shop|show|silk|sina|site|skin|sncf|sohu|song|sony|spot|star|surf|talk|taxi|team|tech|teva|tiaa|tips|town|toys|tube|vana|visa|viva|vivo|vote|voto|wang|weir|wien|wiki|wine|work|xbox|yoga|zara|zero|zone|дети|сайт|بيتك|تونس|شبكة|عراق|عمان|موقع|भारत|ভারত|ਭਾਰਤ|ભારત|ලංකා|グーグル|クラウド|ポイント|大众汽车|组织机构|電訊盈科|香格里拉|aaa|abb|abc|aco|ads|aeg|afl|aig|anz|aol|app|art|aws|axa|bar|bbc|bbt|bcg|bcn|bet|bid|bio|biz|bms|bmw|bnl|bom|boo|bot|box|buy|bzh|cab|cal|cam|car|cat|cba|cbn|cbs|ceb|ceo|cfa|cfd|com|crs|csc|dad|day|dds|dev|dhl|diy|dnp|dog|dot|dtv|dvr|eat|eco|edu|esq|eus|fan|fit|fly|foo|fox|frl|ftr|fun|fyi|gal|gap|gdn|gea|gle|gmo|gmx|goo|gop|got|gov|hbo|hiv|hkt|hot|how|htc|ibm|ice|icu|ifm|ing|ink|int|ist|itv|iwc|jcb|jcp|jio|jlc|jll|jmp|jnj|jot|joy|kfh|kia|kim|kpn|krd|lat|law|lds|lol|lpl|ltd|man|mba|mcd|med|men|meo|mil|mit|mlb|mls|mma|moe|moi|mom|mov|msd|mtn|mtr|nab|nba|nec|net|new|nfl|ngo|nhk|now|nra|nrw|ntt|nyc|obi|off|one|ong|onl|ooo|org|ott|ovh|pay|pet|pid|pin|pnc|pro|pru|pub|pwc|qvc|red|ren|ril|rio|rip|run|rwe|sap|sas|sbi|sbs|sca|scb|ses|sew|sex|sfr|ski|sky|soy|srl|srt|stc|tab|tax|tci|tdk|tel|thd|tjx|top|trv|tui|tvs|ubs|uno|uol|ups|vet|vig|vin|vip|wed|win|wme|wow|wtc|wtf|xin|xxx|xyz|you|yun|zip|бел|ком|қаз|мкд|мон|орг|рус|срб|укр|հայ|קום|قطر|كوم|مصر|कॉम|नेट|คอม|ไทย|ストア|セール|みんな|中文网|天主教|我爱你|新加坡|淡马锡|诺基亚|飞利浦|ac|ad|ae|af|ag|ai|al|am|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw|ελ|бг|ею|рф|გე|닷넷|닷컴|삼성|한국|コム|世界|中信|中国|中國|企业|佛山|信息|健康|八卦|公司|公益|台湾|台灣|商城|商店|商标|嘉里|在线|大拿|娱乐|家電|工行|广东|微博|慈善|手机|手表|政务|政府|新闻|时尚|書籍|机构|游戏|澳門|点看|珠宝|移动|网址|网店|网站|网络|联通|谷歌|购物|通販|集团|食品|餐厅|香港)/;

/*global Autolinker */
/**
 * @abstract
 * @class Autolinker.matcher.Matcher
 *
 * An abstract class and interface for individual matchers to find matches in
 * an input string with linkified versions of them.
 *
 * Note that Matchers do not take HTML into account - they must be fed the text
 * nodes of any HTML string, which is handled by {@link Autolinker#parse}.
 */
Autolinker.matcher.Matcher = Autolinker.Util.extend( Object, {

	/**
	 * @cfg {Autolinker.AnchorTagBuilder} tagBuilder (required)
	 *
	 * Reference to the AnchorTagBuilder instance to use to generate HTML tags
	 * for {@link Autolinker.match.Match Matches}.
	 */


	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Matcher
	 *   instance, specified in an Object (map).
	 */
	constructor : function( cfg ) {
		if( !cfg.tagBuilder ) throw new Error( '`tagBuilder` cfg required' );

		this.tagBuilder = cfg.tagBuilder;
	},


	/**
	 * Parses the input `text` and returns the array of {@link Autolinker.match.Match Matches}
	 * for the matcher.
	 *
	 * @abstract
	 * @param {String} text The text to scan and replace matches in.
	 * @return {Autolinker.match.Match[]}
	 */
	parseMatches : Autolinker.Util.abstractMethod

} );
/*global Autolinker */
/**
 * @class Autolinker.matcher.Email
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find email matches in an input string.
 *
 * See this class's superclass ({@link Autolinker.matcher.Matcher}) for more details.
 */
Autolinker.matcher.Email = Autolinker.Util.extend( Autolinker.matcher.Matcher, {

	/**
	 * The regular expression to match email addresses. Example match:
	 *
	 *     person@place.com
	 *
	 * @private
	 * @property {RegExp} matcherRegex
	 */
	matcherRegex : (function() {
		var alphaNumericChars = Autolinker.RegexLib.alphaNumericCharsStr,
			specialCharacters = '!#$%&\'*+\\-\\/=?^_`{|}~',
			restrictedSpecialCharacters = '\\s"(),:;<>@\\[\\]',
			validCharacters = alphaNumericChars + specialCharacters,
			validRestrictedCharacters = validCharacters + restrictedSpecialCharacters,
		    emailRegex = new RegExp( '(?:(?:[' + validCharacters + '](?![^@]*\\.\\.)(?:[' + validCharacters + '.]*[' + validCharacters + '])?)|(?:\\"[' + validRestrictedCharacters + '.]+\\"))@'),
			domainNameRegex = Autolinker.RegexLib.domainNameRegex,
			tldRegex = Autolinker.tldRegex;  // match our known top level domains (TLDs)

		return new RegExp( [
			emailRegex.source,
			domainNameRegex.source,
			'\\.', tldRegex.source   // '.com', '.net', etc
		].join( "" ), 'gi' );
	} )(),


	/**
	 * @inheritdoc
	 */
	parseMatches : function( text ) {
		var matcherRegex = this.matcherRegex,
		    tagBuilder = this.tagBuilder,
		    matches = [],
		    match;

		while( ( match = matcherRegex.exec( text ) ) !== null ) {
			var matchedText = match[ 0 ];

			matches.push( new Autolinker.match.Email( {
				tagBuilder  : tagBuilder,
				matchedText : matchedText,
				offset      : match.index,
				email       : matchedText
			} ) );
		}

		return matches;
	}

} );

/*global Autolinker */
/**
 * @class Autolinker.matcher.Hashtag
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find Hashtag matches in an input string.
 */
Autolinker.matcher.Hashtag = Autolinker.Util.extend( Autolinker.matcher.Matcher, {

	/**
	 * @cfg {String} serviceName
	 *
	 * The service to point hashtag matches to. See {@link Autolinker#hashtag}
	 * for available values.
	 */


	/**
	 * The regular expression to match Hashtags. Example match:
	 *
	 *     #asdf
	 *
	 * @private
	 * @property {RegExp} matcherRegex
	 */
	matcherRegex : new RegExp( '#[_' + Autolinker.RegexLib.alphaNumericCharsStr + ']{1,139}', 'g' ),

	/**
	 * The regular expression to use to check the character before a username match to
	 * make sure we didn't accidentally match an email address.
	 *
	 * For example, the string "asdf@asdf.com" should not match "@asdf" as a username.
	 *
	 * @private
	 * @property {RegExp} nonWordCharRegex
	 */
	nonWordCharRegex : new RegExp( '[^' + Autolinker.RegexLib.alphaNumericCharsStr + ']' ),


	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match instance,
	 *   specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.matcher.Matcher.prototype.constructor.call( this, cfg );

		this.serviceName = cfg.serviceName;
	},


	/**
	 * @inheritdoc
	 */
	parseMatches : function( text ) {
		var matcherRegex = this.matcherRegex,
		    nonWordCharRegex = this.nonWordCharRegex,
		    serviceName = this.serviceName,
		    tagBuilder = this.tagBuilder,
		    matches = [],
		    match;

		while( ( match = matcherRegex.exec( text ) ) !== null ) {
			var offset = match.index,
			    prevChar = text.charAt( offset - 1 );

			// If we found the match at the beginning of the string, or we found the match
			// and there is a whitespace char in front of it (meaning it is not a '#' char
			// in the middle of a word), then it is a hashtag match.
			if( offset === 0 || nonWordCharRegex.test( prevChar ) ) {
				var matchedText = match[ 0 ],
				    hashtag = match[ 0 ].slice( 1 );  // strip off the '#' character at the beginning

				matches.push( new Autolinker.match.Hashtag( {
					tagBuilder  : tagBuilder,
					matchedText : matchedText,
					offset      : offset,
					serviceName : serviceName,
					hashtag     : hashtag
				} ) );
			}
		}

		return matches;
	}

} );
/*global Autolinker */
/**
 * @class Autolinker.matcher.Phone
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find Phone number matches in an input string.
 *
 * See this class's superclass ({@link Autolinker.matcher.Matcher}) for more
 * details.
 */
Autolinker.matcher.Phone = Autolinker.Util.extend( Autolinker.matcher.Matcher, {

	/**
	 * The regular expression to match Phone numbers. Example match:
	 *
	 *     (123) 456-7890
	 *
	 * This regular expression has the following capturing groups:
	 *
	 * 1. The prefixed '+' sign, if there is one.
	 *
	 * @private
	 * @property {RegExp} matcherRegex
	 */
    matcherRegex : /(?:(\+)?\d{1,3}[-\040.]?)?\(?\d{3}\)?[-\040.]?\d{3}[-\040.]?\d{4}([,;]*[0-9]+#?)*/g,

    // ex: (123) 456-7890, 123 456 7890, 123-456-7890, +18004441234,,;,10226420346#,
    // +1 (800) 444 1234, 10226420346#, 1-800-444-1234,1022,64,20346#

	/**
	 * @inheritdoc
	 */
	parseMatches: function(text) {
		var matcherRegex = this.matcherRegex,
			tagBuilder = this.tagBuilder,
			matches = [],
			match;

		while ((match = matcherRegex.exec(text)) !== null) {
			// Remove non-numeric values from phone number string
			var matchedText = match[0],
				cleanNumber = matchedText.replace(/[^0-9,;#]/g, ''), // strip out non-digit characters exclude comma semicolon and #
				plusSign = !!match[1]; // match[ 1 ] is the prefixed plus sign, if there is one
			if (this.testMatch(match[2]) && this.testMatch(matchedText)) {
    			matches.push(new Autolinker.match.Phone({
    				tagBuilder: tagBuilder,
    				matchedText: matchedText,
    				offset: match.index,
    				number: cleanNumber,
    				plusSign: plusSign
    			}));
            }
		}

		return matches;
	},

	testMatch: function(text) {
		return /\D/.test(text);
	}

} );

/*global Autolinker */
/**
 * @class Autolinker.matcher.Mention
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find/replace username matches in an input string.
 */
Autolinker.matcher.Mention = Autolinker.Util.extend( Autolinker.matcher.Matcher, {

	/**
	 * Hash of regular expression to match username handles. Example match:
	 *
	 *     @asdf
	 *
	 * @private
	 * @property {Object} matcherRegexes
	 */
	matcherRegexes : {
		"twitter": new RegExp( '@[_' + Autolinker.RegexLib.alphaNumericCharsStr + ']{1,20}', 'g' ),
		"instagram": new RegExp( '@[_.' + Autolinker.RegexLib.alphaNumericCharsStr + ']{1,50}', 'g' )
	},

	/**
	 * The regular expression to use to check the character before a username match to
	 * make sure we didn't accidentally match an email address.
	 *
	 * For example, the string "asdf@asdf.com" should not match "@asdf" as a username.
	 *
	 * @private
	 * @property {RegExp} nonWordCharRegex
	 */
	nonWordCharRegex : new RegExp( '[^' + Autolinker.RegexLib.alphaNumericCharsStr + ']' ),


	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match instance,
	 *   specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.matcher.Matcher.prototype.constructor.call( this, cfg );

		this.serviceName = cfg.serviceName;
	},


	/**
	 * @inheritdoc
	 */
	parseMatches : function( text ) {
		var matcherRegex = this.matcherRegexes[this.serviceName],
		    nonWordCharRegex = this.nonWordCharRegex,
		    serviceName = this.serviceName,
		    tagBuilder = this.tagBuilder,
		    matches = [],
		    match;

		if (!matcherRegex) {
			return matches;
		}

		while( ( match = matcherRegex.exec( text ) ) !== null ) {
			var offset = match.index,
			    prevChar = text.charAt( offset - 1 );

			// If we found the match at the beginning of the string, or we found the match
			// and there is a whitespace char in front of it (meaning it is not an email
			// address), then it is a username match.
			if( offset === 0 || nonWordCharRegex.test( prevChar ) ) {
				var matchedText = match[ 0 ].replace(/\.+$/g, ''), // strip off trailing .
				    mention = matchedText.slice( 1 );  // strip off the '@' character at the beginning

				matches.push( new Autolinker.match.Mention( {
					tagBuilder    : tagBuilder,
					matchedText   : matchedText,
					offset        : offset,
					serviceName   : serviceName,
					mention       : mention
				} ) );
			}
		}

		return matches;
	}

} );

/*global Autolinker */
/**
 * @class Autolinker.matcher.Url
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find URL matches in an input string.
 *
 * See this class's superclass ({@link Autolinker.matcher.Matcher}) for more details.
 */
Autolinker.matcher.Url = Autolinker.Util.extend( Autolinker.matcher.Matcher, {

	/**
	 * @cfg {Object} stripPrefix (required)
	 *
	 * The Object form of {@link Autolinker#cfg-stripPrefix}.
	 */

	/**
	 * @cfg {Boolean} stripTrailingSlash (required)
	 * @inheritdoc Autolinker#stripTrailingSlash
	 */


	/**
	 * @private
	 * @property {RegExp} matcherRegex
	 *
	 * The regular expression to match URLs with an optional scheme, port
	 * number, path, query string, and hash anchor.
	 *
	 * Example matches:
	 *
	 *     http://google.com
	 *     www.google.com
	 *     google.com/path/to/file?q1=1&q2=2#myAnchor
	 *
	 *
	 * This regular expression will have the following capturing groups:
	 *
	 * 1.  Group that matches a scheme-prefixed URL (i.e. 'http://google.com').
	 *     This is used to match scheme URLs with just a single word, such as
	 *     'http://localhost', where we won't double check that the domain name
	 *     has at least one dot ('.') in it.
	 * 2.  Group that matches a 'www.' prefixed URL. This is only matched if the
	 *     'www.' text was not prefixed by a scheme (i.e.: not prefixed by
	 *     'http://', 'ftp:', etc.)
	 * 3.  A protocol-relative ('//') match for the case of a 'www.' prefixed
	 *     URL. Will be an empty string if it is not a protocol-relative match.
	 *     We need to know the character before the '//' in order to determine
	 *     if it is a valid match or the // was in a string we don't want to
	 *     auto-link.
	 * 4.  Group that matches a known TLD (top level domain), when a scheme
	 *     or 'www.'-prefixed domain is not matched.
	 * 5.  A protocol-relative ('//') match for the case of a known TLD prefixed
	 *     URL. Will be an empty string if it is not a protocol-relative match.
	 *     See #3 for more info.
	 */
	matcherRegex : (function() {
		var schemeRegex = /(?:[A-Za-z][-.+A-Za-z0-9]*:(?![A-Za-z][-.+A-Za-z0-9]*:\/\/)(?!\d+\/?)(?:\/\/)?)/,  // match protocol, allow in format "http://" or "mailto:". However, do not match the first part of something like 'link:http://www.google.com' (i.e. don't match "link:"). Also, make sure we don't interpret 'google.com:8000' as if 'google.com' was a protocol here (i.e. ignore a trailing port number in this regex)
		    wwwRegex = /(?:www\.)/,                  // starting with 'www.'
		    domainNameRegex = Autolinker.RegexLib.domainNameRegex,
		    tldRegex = Autolinker.tldRegex,  // match our known top level domains (TLDs)
		    alphaNumericCharsStr = Autolinker.RegexLib.alphaNumericCharsStr,

		    // Allow optional path, query string, and hash anchor, not ending in the following characters: "?!:,.;"
		    // http://blog.codinghorror.com/the-problem-with-urls/
		    urlSuffixRegex = new RegExp( '[/?#](?:[' + alphaNumericCharsStr + '\\-+&@#/%=~_()|\'$*\\[\\]?!:,.;\u2713]*[' + alphaNumericCharsStr + '\\-+&@#/%=~_()|\'$*\\[\\]\u2713])?' );

		return new RegExp( [
			'(?:', // parens to cover match for scheme (optional), and domain
				'(',  // *** Capturing group $1, for a scheme-prefixed url (ex: http://google.com)
					schemeRegex.source,
					domainNameRegex.source,
				')',

				'|',

				'(',  // *** Capturing group $2, for a 'www.' prefixed url (ex: www.google.com)
					'(//)?',  // *** Capturing group $3 for an optional protocol-relative URL. Must be at the beginning of the string or start with a non-word character (handled later)
					wwwRegex.source,
					domainNameRegex.source,
				')',

				'|',

				'(',  // *** Capturing group $4, for known a TLD url (ex: google.com)
					'(//)?',  // *** Capturing group $5 for an optional protocol-relative URL. Must be at the beginning of the string or start with a non-word character (handled later)
					domainNameRegex.source + '\\.',
					tldRegex.source,
					'(?![-' + alphaNumericCharsStr + '])', // TLD not followed by a letter, behaves like unicode-aware \b
				')',
			')',

			'(?::[0-9]+)?', // port

			'(?:' + urlSuffixRegex.source + ')?'  // match for path, query string, and/or hash anchor - optional
		].join( "" ), 'gi' );
	} )(),


	/**
	 * A regular expression to use to check the character before a protocol-relative
	 * URL match. We don't want to match a protocol-relative URL if it is part
	 * of another word.
	 *
	 * For example, we want to match something like "Go to: //google.com",
	 * but we don't want to match something like "abc//google.com"
	 *
	 * This regular expression is used to test the character before the '//'.
	 *
	 * @private
	 * @type {RegExp} wordCharRegExp
	 */
	wordCharRegExp : new RegExp( '[' + Autolinker.RegexLib.alphaNumericCharsStr + ']' ),


	/**
	 * The regular expression to match opening parenthesis in a URL match.
	 *
	 * This is to determine if we have unbalanced parenthesis in the URL, and to
	 * drop the final parenthesis that was matched if so.
	 *
	 * Ex: The text "(check out: wikipedia.com/something_(disambiguation))"
	 * should only autolink the inner "wikipedia.com/something_(disambiguation)"
	 * part, so if we find that we have unbalanced parenthesis, we will drop the
	 * last one for the match.
	 *
	 * @private
	 * @property {RegExp}
	 */
	openParensRe : /\(/g,

	/**
	 * The regular expression to match closing parenthesis in a URL match. See
	 * {@link #openParensRe} for more information.
	 *
	 * @private
	 * @property {RegExp}
	 */
	closeParensRe : /\)/g,


	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match instance,
	 *   specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.matcher.Matcher.prototype.constructor.call( this, cfg );

		if( cfg.stripPrefix == null ) throw new Error( '`stripPrefix` cfg required' );
		if( cfg.stripTrailingSlash == null ) throw new Error( '`stripTrailingSlash` cfg required' );

		this.stripPrefix = cfg.stripPrefix;
		this.stripTrailingSlash = cfg.stripTrailingSlash;
	},


	/**
	 * @inheritdoc
	 */
	parseMatches : function( text ) {
		var matcherRegex = this.matcherRegex,
		    stripPrefix = this.stripPrefix,
		    stripTrailingSlash = this.stripTrailingSlash,
		    tagBuilder = this.tagBuilder,
		    matches = [],
		    match;

		while( ( match = matcherRegex.exec( text ) ) !== null ) {
			var matchStr = match[ 0 ],
			    schemeUrlMatch = match[ 1 ],
			    wwwUrlMatch = match[ 2 ],
			    wwwProtocolRelativeMatch = match[ 3 ],
			    //tldUrlMatch = match[ 4 ],  -- not needed at the moment
			    tldProtocolRelativeMatch = match[ 5 ],
			    offset = match.index,
			    protocolRelativeMatch = wwwProtocolRelativeMatch || tldProtocolRelativeMatch,
				prevChar = text.charAt( offset - 1 );

			if( !Autolinker.matcher.UrlMatchValidator.isValid( matchStr, schemeUrlMatch ) ) {
				continue;
			}

			// If the match is preceded by an '@' character, then it is either
			// an email address or a username. Skip these types of matches.
			if( offset > 0 && prevChar === '@' ) {
				continue;
			}

			// If it's a protocol-relative '//' match, but the character before the '//'
			// was a word character (i.e. a letter/number), then we found the '//' in the
			// middle of another word (such as "asdf//asdf.com"). In this case, skip the
			// match.
			if( offset > 0 && protocolRelativeMatch && this.wordCharRegExp.test( prevChar ) ) {
				continue;
			}

			if( /\?$/.test(matchStr) ) {
				matchStr = matchStr.substr(0, matchStr.length-1);
			}

			// Handle a closing parenthesis at the end of the match, and exclude
			// it if there is not a matching open parenthesis in the match
			// itself.
			if( this.matchHasUnbalancedClosingParen( matchStr ) ) {
				matchStr = matchStr.substr( 0, matchStr.length - 1 );  // remove the trailing ")"
			} else {
				// Handle an invalid character after the TLD
				var pos = this.matchHasInvalidCharAfterTld( matchStr, schemeUrlMatch );
				if( pos > -1 ) {
					matchStr = matchStr.substr( 0, pos ); // remove the trailing invalid chars
				}
			}

			var urlMatchType = schemeUrlMatch ? 'scheme' : ( wwwUrlMatch ? 'www' : 'tld' ),
			    protocolUrlMatch = !!schemeUrlMatch;

			matches.push( new Autolinker.match.Url( {
				tagBuilder            : tagBuilder,
				matchedText           : matchStr,
				offset                : offset,
				urlMatchType          : urlMatchType,
				url                   : matchStr,
				protocolUrlMatch      : protocolUrlMatch,
				protocolRelativeMatch : !!protocolRelativeMatch,
				stripPrefix           : stripPrefix,
				stripTrailingSlash    : stripTrailingSlash
			} ) );
		}

		return matches;
	},


	/**
	 * Determines if a match found has an unmatched closing parenthesis. If so,
	 * this parenthesis will be removed from the match itself, and appended
	 * after the generated anchor tag.
	 *
	 * A match may have an extra closing parenthesis at the end of the match
	 * because the regular expression must include parenthesis for URLs such as
	 * "wikipedia.com/something_(disambiguation)", which should be auto-linked.
	 *
	 * However, an extra parenthesis *will* be included when the URL itself is
	 * wrapped in parenthesis, such as in the case of "(wikipedia.com/something_(disambiguation))".
	 * In this case, the last closing parenthesis should *not* be part of the
	 * URL itself, and this method will return `true`.
	 *
	 * @private
	 * @param {String} matchStr The full match string from the {@link #matcherRegex}.
	 * @return {Boolean} `true` if there is an unbalanced closing parenthesis at
	 *   the end of the `matchStr`, `false` otherwise.
	 */
	matchHasUnbalancedClosingParen : function( matchStr ) {
		var lastChar = matchStr.charAt( matchStr.length - 1 );

		if( lastChar === ')' ) {
			var openParensMatch = matchStr.match( this.openParensRe ),
			    closeParensMatch = matchStr.match( this.closeParensRe ),
			    numOpenParens = ( openParensMatch && openParensMatch.length ) || 0,
			    numCloseParens = ( closeParensMatch && closeParensMatch.length ) || 0;

			if( numOpenParens < numCloseParens ) {
				return true;
			}
		}

		return false;
	},


	/**
	 * Determine if there's an invalid character after the TLD in a URL. Valid
	 * characters after TLD are ':/?#'. Exclude scheme matched URLs from this
	 * check.
	 *
	 * @private
	 * @param {String} urlMatch The matched URL, if there was one. Will be an
	 *   empty string if the match is not a URL match.
	 * @param {String} schemeUrlMatch The match URL string for a scheme
	 *   match. Ex: 'http://yahoo.com'. This is used to match something like
	 *   'http://localhost', where we won't double check that the domain name
	 *   has at least one '.' in it.
	 * @return {Number} the position where the invalid character was found. If
	 *   no such character was found, returns -1
	 */
	matchHasInvalidCharAfterTld : function( urlMatch, schemeUrlMatch ) {
		if( !urlMatch ) {
			return -1;
		}

		var offset = 0;
		if ( schemeUrlMatch ) {
			offset = urlMatch.indexOf(':');
			urlMatch = urlMatch.slice(offset);
		}

		var alphaNumeric = Autolinker.RegexLib.alphaNumericCharsStr;

		var re = new RegExp("^((.?\/\/)?[-." + alphaNumeric + "]*[-" + alphaNumeric + "]\\.[-" + alphaNumeric + "]+)");
		var res = re.exec( urlMatch );
		if ( res === null ) {
			return -1;
		}

		offset += res[1].length;
		urlMatch = urlMatch.slice(res[1].length);
		if (/^[^-.A-Za-z0-9:\/?#]/.test(urlMatch)) {
			return offset;
		}

		return -1;
	}

} );

/*global Autolinker */
/*jshint scripturl:true */
/**
 * @private
 * @class Autolinker.matcher.UrlMatchValidator
 * @singleton
 *
 * Used by Autolinker to filter out false URL positives from the
 * {@link Autolinker.matcher.Url UrlMatcher}.
 *
 * Due to the limitations of regular expressions (including the missing feature
 * of look-behinds in JS regular expressions), we cannot always determine the
 * validity of a given match. This class applies a bit of additional logic to
 * filter out any false positives that have been matched by the
 * {@link Autolinker.matcher.Url UrlMatcher}.
 */
Autolinker.matcher.UrlMatchValidator = {

	/**
	 * Regex to test for a full protocol, with the two trailing slashes. Ex: 'http://'
	 *
	 * @private
	 * @property {RegExp} hasFullProtocolRegex
	 */
	hasFullProtocolRegex : /^[A-Za-z][-.+A-Za-z0-9]*:\/\//,

	/**
	 * Regex to find the URI scheme, such as 'mailto:'.
	 *
	 * This is used to filter out 'javascript:' and 'vbscript:' schemes.
	 *
	 * @private
	 * @property {RegExp} uriSchemeRegex
	 */
	uriSchemeRegex : /^[A-Za-z][-.+A-Za-z0-9]*:/,

	/**
	 * Regex to determine if at least one word char exists after the protocol (i.e. after the ':')
	 *
	 * @private
	 * @property {RegExp} hasWordCharAfterProtocolRegex
	 */
	hasWordCharAfterProtocolRegex : new RegExp(":[^\\s]*?[" + Autolinker.RegexLib.alphaCharsStr + "]"),

	/**
	 * Regex to determine if the string is a valid IP address
	 *
	 * @private
	 * @property {RegExp} ipRegex
	 */
	ipRegex: /[0-9][0-9]?[0-9]?\.[0-9][0-9]?[0-9]?\.[0-9][0-9]?[0-9]?\.[0-9][0-9]?[0-9]?(:[0-9]*)?\/?$/,

	/**
	 * Determines if a given URL match found by the {@link Autolinker.matcher.Url UrlMatcher}
	 * is valid. Will return `false` for:
	 *
	 * 1) URL matches which do not have at least have one period ('.') in the
	 *    domain name (effectively skipping over matches like "abc:def").
	 *    However, URL matches with a protocol will be allowed (ex: 'http://localhost')
	 * 2) URL matches which do not have at least one word character in the
	 *    domain name (effectively skipping over matches like "git:1.0").
	 * 3) A protocol-relative url match (a URL beginning with '//') whose
	 *    previous character is a word character (effectively skipping over
	 *    strings like "abc//google.com")
	 *
	 * Otherwise, returns `true`.
	 *
	 * @param {String} urlMatch The matched URL, if there was one. Will be an
	 *   empty string if the match is not a URL match.
	 * @param {String} protocolUrlMatch The match URL string for a protocol
	 *   match. Ex: 'http://yahoo.com'. This is used to match something like
	 *   'http://localhost', where we won't double check that the domain name
	 *   has at least one '.' in it.
	 * @return {Boolean} `true` if the match given is valid and should be
	 *   processed, or `false` if the match is invalid and/or should just not be
	 *   processed.
	 */
	isValid : function( urlMatch, protocolUrlMatch ) {
		if(
			( protocolUrlMatch && !this.isValidUriScheme( protocolUrlMatch ) ) ||
			this.urlMatchDoesNotHaveProtocolOrDot( urlMatch, protocolUrlMatch ) ||    // At least one period ('.') must exist in the URL match for us to consider it an actual URL, *unless* it was a full protocol match (like 'http://localhost')
			(this.urlMatchDoesNotHaveAtLeastOneWordChar( urlMatch, protocolUrlMatch ) && // At least one letter character must exist in the domain name after a protocol match. Ex: skip over something like "git:1.0"
			   !this.isValidIpAddress( urlMatch )) || // Except if it's an IP address
			this.containsMultipleDots( urlMatch )
		) {
			return false;
		}

		return true;
	},


	isValidIpAddress : function ( uriSchemeMatch ) {
		var newRegex = new RegExp(this.hasFullProtocolRegex.source + this.ipRegex.source);
		var uriScheme = uriSchemeMatch.match( newRegex );

		return uriScheme !== null;
	},

	containsMultipleDots : function ( urlMatch ) {
		return urlMatch.indexOf("..") > -1;
	},

	/**
	 * Determines if the URI scheme is a valid scheme to be autolinked. Returns
	 * `false` if the scheme is 'javascript:' or 'vbscript:'
	 *
	 * @private
	 * @param {String} uriSchemeMatch The match URL string for a full URI scheme
	 *   match. Ex: 'http://yahoo.com' or 'mailto:a@a.com'.
	 * @return {Boolean} `true` if the scheme is a valid one, `false` otherwise.
	 */
	isValidUriScheme : function( uriSchemeMatch ) {
		var uriScheme = uriSchemeMatch.match( this.uriSchemeRegex )[ 0 ].toLowerCase();

		return ( uriScheme !== 'javascript:' && uriScheme !== 'vbscript:' );
	},


	/**
	 * Determines if a URL match does not have either:
	 *
	 * a) a full protocol (i.e. 'http://'), or
	 * b) at least one dot ('.') in the domain name (for a non-full-protocol
	 *    match).
	 *
	 * Either situation is considered an invalid URL (ex: 'git:d' does not have
	 * either the '://' part, or at least one dot in the domain name. If the
	 * match was 'git:abc.com', we would consider this valid.)
	 *
	 * @private
	 * @param {String} urlMatch The matched URL, if there was one. Will be an
	 *   empty string if the match is not a URL match.
	 * @param {String} protocolUrlMatch The match URL string for a protocol
	 *   match. Ex: 'http://yahoo.com'. This is used to match something like
	 *   'http://localhost', where we won't double check that the domain name
	 *   has at least one '.' in it.
	 * @return {Boolean} `true` if the URL match does not have a full protocol,
	 *   or at least one dot ('.') in a non-full-protocol match.
	 */
	urlMatchDoesNotHaveProtocolOrDot : function( urlMatch, protocolUrlMatch ) {
		return ( !!urlMatch && ( !protocolUrlMatch || !this.hasFullProtocolRegex.test( protocolUrlMatch ) ) && urlMatch.indexOf( '.' ) === -1 );
	},


	/**
	 * Determines if a URL match does not have at least one word character after
	 * the protocol (i.e. in the domain name).
	 *
	 * At least one letter character must exist in the domain name after a
	 * protocol match. Ex: skip over something like "git:1.0"
	 *
	 * @private
	 * @param {String} urlMatch The matched URL, if there was one. Will be an
	 *   empty string if the match is not a URL match.
	 * @param {String} protocolUrlMatch The match URL string for a protocol
	 *   match. Ex: 'http://yahoo.com'. This is used to know whether or not we
	 *   have a protocol in the URL string, in order to check for a word
	 *   character after the protocol separator (':').
	 * @return {Boolean} `true` if the URL match does not have at least one word
	 *   character in it after the protocol, `false` otherwise.
	 */
	urlMatchDoesNotHaveAtLeastOneWordChar : function( urlMatch, protocolUrlMatch ) {
		if( urlMatch && protocolUrlMatch ) {
			return !this.hasWordCharAfterProtocolRegex.test( urlMatch );
		} else {
			return false;
		}
	}

};

/*global Autolinker */
/**
 * A truncation feature where the ellipsis will be placed at the end of the URL.
 *
 * @param {String} anchorText
 * @param {Number} truncateLen The maximum length of the truncated output URL string.
 * @param {String} ellipsisChars The characters to place within the url, e.g. "..".
 * @return {String} The truncated URL.
 */
Autolinker.truncate.TruncateEnd = function(anchorText, truncateLen, ellipsisChars){
	return Autolinker.Util.ellipsis( anchorText, truncateLen, ellipsisChars );
};

/*global Autolinker */
/**
 * Date: 2015-10-05
 * Author: Kasper Søfren <soefritz@gmail.com> (https://github.com/kafoso)
 *
 * A truncation feature, where the ellipsis will be placed in the dead-center of the URL.
 *
 * @param {String} url             A URL.
 * @param {Number} truncateLen     The maximum length of the truncated output URL string.
 * @param {String} ellipsisChars   The characters to place within the url, e.g. "..".
 * @return {String} The truncated URL.
 */
Autolinker.truncate.TruncateMiddle = function(url, truncateLen, ellipsisChars){
  if (url.length <= truncateLen) {
    return url;
  }

  var ellipsisLengthBeforeParsing;
  var ellipsisLength;

  if(ellipsisChars == null) {
    ellipsisChars = '&hellip;';
    ellipsisLengthBeforeParsing = 8;
    ellipsisLength = 3;
  } else {
    ellipsisLengthBeforeParsing = ellipsisChars.length;
    ellipsisLength = ellipsisChars.length;
  }

  var availableLength = truncateLen - ellipsisLength;
  var end = "";
  if (availableLength > 0) {
    end = url.substr((-1)*Math.floor(availableLength/2));
  }
  return (url.substr(0, Math.ceil(availableLength/2)) + ellipsisChars + end).substr(0, availableLength + ellipsisLengthBeforeParsing);
};

/*global Autolinker */
/**
 * Date: 2015-10-05
 * Author: Kasper Søfren <soefritz@gmail.com> (https://github.com/kafoso)
 *
 * A truncation feature, where the ellipsis will be placed at a section within
 * the URL making it still somewhat human readable.
 *
 * @param {String} url						 A URL.
 * @param {Number} truncateLen		 The maximum length of the truncated output URL string.
 * @param {String} ellipsisChars	 The characters to place within the url, e.g. "...".
 * @return {String} The truncated URL.
 */
Autolinker.truncate.TruncateSmart = function(url, truncateLen, ellipsisChars){

	var ellipsisLengthBeforeParsing;
	var ellipsisLength;

	if(ellipsisChars == null) {
		ellipsisChars = '&hellip;';
		ellipsisLength = 3;
		ellipsisLengthBeforeParsing = 8;
	} else {
		ellipsisLength = ellipsisChars.length;
		ellipsisLengthBeforeParsing = ellipsisChars.length;
	}

	var parse_url = function(url){ // Functionality inspired by PHP function of same name
		var urlObj = {};
		var urlSub = url;
		var match = urlSub.match(/^([a-z]+):\/\//i);
		if (match) {
			urlObj.scheme = match[1];
			urlSub = urlSub.substr(match[0].length);
		}
		match = urlSub.match(/^(.*?)(?=(\?|#|\/|$))/i);
		if (match) {
			urlObj.host = match[1];
			urlSub = urlSub.substr(match[0].length);
		}
		match = urlSub.match(/^\/(.*?)(?=(\?|#|$))/i);
		if (match) {
			urlObj.path = match[1];
			urlSub = urlSub.substr(match[0].length);
		}
		match = urlSub.match(/^\?(.*?)(?=(#|$))/i);
		if (match) {
			urlObj.query = match[1];
			urlSub = urlSub.substr(match[0].length);
		}
		match = urlSub.match(/^#(.*?)$/i);
		if (match) {
			urlObj.fragment = match[1];
			//urlSub = urlSub.substr(match[0].length);  -- not used. Uncomment if adding another block.
		}
		return urlObj;
	};

	var buildUrl = function(urlObj){
		var url = "";
		if (urlObj.scheme && urlObj.host) {
			url += urlObj.scheme + "://";
		}
		if (urlObj.host) {
			url += urlObj.host;
		}
		if (urlObj.path) {
			url += "/" + urlObj.path;
		}
		if (urlObj.query) {
			url += "?" + urlObj.query;
		}
		if (urlObj.fragment) {
			url += "#" + urlObj.fragment;
		}
		return url;
	};

	var buildSegment = function(segment, remainingAvailableLength){
		var remainingAvailableLengthHalf = remainingAvailableLength/ 2,
				startOffset = Math.ceil(remainingAvailableLengthHalf),
				endOffset = (-1)*Math.floor(remainingAvailableLengthHalf),
				end = "";
		if (endOffset < 0) {
			end = segment.substr(endOffset);
		}
		return segment.substr(0, startOffset) + ellipsisChars + end;
	};
	if (url.length <= truncateLen) {
		return url;
	}
	var availableLength = truncateLen - ellipsisLength;
	var urlObj = parse_url(url);
	// Clean up the URL
	if (urlObj.query) {
		var matchQuery = urlObj.query.match(/^(.*?)(?=(\?|\#))(.*?)$/i);
		if (matchQuery) {
			// Malformed URL; two or more "?". Removed any content behind the 2nd.
			urlObj.query = urlObj.query.substr(0, matchQuery[1].length);
			url = buildUrl(urlObj);
		}
	}
	if (url.length <= truncateLen) {
		return url;
	}
	if (urlObj.host) {
		urlObj.host = urlObj.host.replace(/^www\./, "");
		url = buildUrl(urlObj);
	}
	if (url.length <= truncateLen) {
		return url;
	}
	// Process and build the URL
	var str = "";
	if (urlObj.host) {
		str += urlObj.host;
	}
	if (str.length >= availableLength) {
		if (urlObj.host.length == truncateLen) {
			return (urlObj.host.substr(0, (truncateLen - ellipsisLength)) + ellipsisChars).substr(0, availableLength + ellipsisLengthBeforeParsing);
		}
		return buildSegment(str, availableLength).substr(0, availableLength + ellipsisLengthBeforeParsing);
	}
	var pathAndQuery = "";
	if (urlObj.path) {
		pathAndQuery += "/" + urlObj.path;
	}
	if (urlObj.query) {
		pathAndQuery += "?" + urlObj.query;
	}
	if (pathAndQuery) {
		if ((str+pathAndQuery).length >= availableLength) {
			if ((str+pathAndQuery).length == truncateLen) {
				return (str + pathAndQuery).substr(0, truncateLen);
			}
			var remainingAvailableLength = availableLength - str.length;
			return (str + buildSegment(pathAndQuery, remainingAvailableLength)).substr(0, availableLength + ellipsisLengthBeforeParsing);
		} else {
			str += pathAndQuery;
		}
	}
	if (urlObj.fragment) {
		var fragment = "#"+urlObj.fragment;
		if ((str+fragment).length >= availableLength) {
			if ((str+fragment).length == truncateLen) {
				return (str + fragment).substr(0, truncateLen);
			}
			var remainingAvailableLength2 = availableLength - str.length;
			return (str + buildSegment(fragment, remainingAvailableLength2)).substr(0, availableLength + ellipsisLengthBeforeParsing);
		} else {
			str += fragment;
		}
	}
	if (urlObj.scheme && urlObj.host) {
		var scheme = urlObj.scheme + "://";
		if ((str+scheme).length < availableLength) {
			return (scheme + str).substr(0, truncateLen);
		}
	}
	if (str.length <= truncateLen) {
		return str;
	}
	var end = "";
	if (availableLength > 0) {
		end = str.substr((-1)*Math.floor(availableLength/2));
	}
	return (str.substr(0, Math.ceil(availableLength/2)) + ellipsisChars + end).substr(0, availableLength + ellipsisLengthBeforeParsing);
};

return Autolinker;
}));

},{}],61:[function(require,module,exports){
/*
 * JavaScript Load Image Exif Parser
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

/* global define */

;(function (factory) {
  'use strict'
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define(['./load-image', './load-image-meta'], factory)
  } else if (typeof module === 'object' && module.exports) {
    factory(require('./load-image'), require('./load-image-meta'))
  } else {
    // Browser globals:
    factory(window.loadImage)
  }
})(function (loadImage) {
  'use strict'

  loadImage.ExifMap = function () {
    return this
  }

  loadImage.ExifMap.prototype.map = {
    Orientation: 0x0112
  }

  loadImage.ExifMap.prototype.get = function (id) {
    return this[id] || this[this.map[id]]
  }

  loadImage.getExifThumbnail = function (dataView, offset, length) {
    var hexData, i, b
    if (!length || offset + length > dataView.byteLength) {
      console.log('Invalid Exif data: Invalid thumbnail data.')
      return
    }
    hexData = []
    for (i = 0; i < length; i += 1) {
      b = dataView.getUint8(offset + i)
      hexData.push((b < 16 ? '0' : '') + b.toString(16))
    }
    return 'data:image/jpeg,%' + hexData.join('%')
  }

  loadImage.exifTagTypes = {
    // byte, 8-bit unsigned int:
    1: {
      getValue: function (dataView, dataOffset) {
        return dataView.getUint8(dataOffset)
      },
      size: 1
    },
    // ascii, 8-bit byte:
    2: {
      getValue: function (dataView, dataOffset) {
        return String.fromCharCode(dataView.getUint8(dataOffset))
      },
      size: 1,
      ascii: true
    },
    // short, 16 bit int:
    3: {
      getValue: function (dataView, dataOffset, littleEndian) {
        return dataView.getUint16(dataOffset, littleEndian)
      },
      size: 2
    },
    // long, 32 bit int:
    4: {
      getValue: function (dataView, dataOffset, littleEndian) {
        return dataView.getUint32(dataOffset, littleEndian)
      },
      size: 4
    },
    // rational = two long values, first is numerator, second is denominator:
    5: {
      getValue: function (dataView, dataOffset, littleEndian) {
        return (
          dataView.getUint32(dataOffset, littleEndian) /
          dataView.getUint32(dataOffset + 4, littleEndian)
        )
      },
      size: 8
    },
    // slong, 32 bit signed int:
    9: {
      getValue: function (dataView, dataOffset, littleEndian) {
        return dataView.getInt32(dataOffset, littleEndian)
      },
      size: 4
    },
    // srational, two slongs, first is numerator, second is denominator:
    10: {
      getValue: function (dataView, dataOffset, littleEndian) {
        return (
          dataView.getInt32(dataOffset, littleEndian) /
          dataView.getInt32(dataOffset + 4, littleEndian)
        )
      },
      size: 8
    }
  }
  // undefined, 8-bit byte, value depending on field:
  loadImage.exifTagTypes[7] = loadImage.exifTagTypes[1]

  loadImage.getExifValue = function (
    dataView,
    tiffOffset,
    offset,
    type,
    length,
    littleEndian
  ) {
    var tagType = loadImage.exifTagTypes[type]
    var tagSize
    var dataOffset
    var values
    var i
    var str
    var c
    if (!tagType) {
      console.log('Invalid Exif data: Invalid tag type.')
      return
    }
    tagSize = tagType.size * length
    // Determine if the value is contained in the dataOffset bytes,
    // or if the value at the dataOffset is a pointer to the actual data:
    dataOffset =
      tagSize > 4
        ? tiffOffset + dataView.getUint32(offset + 8, littleEndian)
        : offset + 8
    if (dataOffset + tagSize > dataView.byteLength) {
      console.log('Invalid Exif data: Invalid data offset.')
      return
    }
    if (length === 1) {
      return tagType.getValue(dataView, dataOffset, littleEndian)
    }
    values = []
    for (i = 0; i < length; i += 1) {
      values[i] = tagType.getValue(
        dataView,
        dataOffset + i * tagType.size,
        littleEndian
      )
    }
    if (tagType.ascii) {
      str = ''
      // Concatenate the chars:
      for (i = 0; i < values.length; i += 1) {
        c = values[i]
        // Ignore the terminating NULL byte(s):
        if (c === '\u0000') {
          break
        }
        str += c
      }
      return str
    }
    return values
  }

  loadImage.parseExifTag = function (
    dataView,
    tiffOffset,
    offset,
    littleEndian,
    data
  ) {
    var tag = dataView.getUint16(offset, littleEndian)
    data.exif[tag] = loadImage.getExifValue(
      dataView,
      tiffOffset,
      offset,
      dataView.getUint16(offset + 2, littleEndian), // tag type
      dataView.getUint32(offset + 4, littleEndian), // tag length
      littleEndian
    )
  }

  loadImage.parseExifTags = function (
    dataView,
    tiffOffset,
    dirOffset,
    littleEndian,
    data
  ) {
    var tagsNumber, dirEndOffset, i
    if (dirOffset + 6 > dataView.byteLength) {
      console.log('Invalid Exif data: Invalid directory offset.')
      return
    }
    tagsNumber = dataView.getUint16(dirOffset, littleEndian)
    dirEndOffset = dirOffset + 2 + 12 * tagsNumber
    if (dirEndOffset + 4 > dataView.byteLength) {
      console.log('Invalid Exif data: Invalid directory size.')
      return
    }
    for (i = 0; i < tagsNumber; i += 1) {
      this.parseExifTag(
        dataView,
        tiffOffset,
        dirOffset + 2 + 12 * i, // tag offset
        littleEndian,
        data
      )
    }
    // Return the offset to the next directory:
    return dataView.getUint32(dirEndOffset, littleEndian)
  }

  loadImage.parseExifData = function (dataView, offset, length, data, options) {
    if (options.disableExif) {
      return
    }
    var tiffOffset = offset + 10
    var littleEndian
    var dirOffset
    var thumbnailData
    // Check for the ASCII code for "Exif" (0x45786966):
    if (dataView.getUint32(offset + 4) !== 0x45786966) {
      // No Exif data, might be XMP data instead
      return
    }
    if (tiffOffset + 8 > dataView.byteLength) {
      console.log('Invalid Exif data: Invalid segment size.')
      return
    }
    // Check for the two null bytes:
    if (dataView.getUint16(offset + 8) !== 0x0000) {
      console.log('Invalid Exif data: Missing byte alignment offset.')
      return
    }
    // Check the byte alignment:
    switch (dataView.getUint16(tiffOffset)) {
      case 0x4949:
        littleEndian = true
        break
      case 0x4d4d:
        littleEndian = false
        break
      default:
        console.log('Invalid Exif data: Invalid byte alignment marker.')
        return
    }
    // Check for the TIFF tag marker (0x002A):
    if (dataView.getUint16(tiffOffset + 2, littleEndian) !== 0x002a) {
      console.log('Invalid Exif data: Missing TIFF marker.')
      return
    }
    // Retrieve the directory offset bytes, usually 0x00000008 or 8 decimal:
    dirOffset = dataView.getUint32(tiffOffset + 4, littleEndian)
    // Create the exif object to store the tags:
    data.exif = new loadImage.ExifMap()
    // Parse the tags of the main image directory and retrieve the
    // offset to the next directory, usually the thumbnail directory:
    dirOffset = loadImage.parseExifTags(
      dataView,
      tiffOffset,
      tiffOffset + dirOffset,
      littleEndian,
      data
    )
    if (dirOffset && !options.disableExifThumbnail) {
      thumbnailData = { exif: {} }
      dirOffset = loadImage.parseExifTags(
        dataView,
        tiffOffset,
        tiffOffset + dirOffset,
        littleEndian,
        thumbnailData
      )
      // Check for JPEG Thumbnail offset:
      if (thumbnailData.exif[0x0201]) {
        data.exif.Thumbnail = loadImage.getExifThumbnail(
          dataView,
          tiffOffset + thumbnailData.exif[0x0201],
          thumbnailData.exif[0x0202] // Thumbnail data length
        )
      }
    }
    // Check for Exif Sub IFD Pointer:
    if (data.exif[0x8769] && !options.disableExifSub) {
      loadImage.parseExifTags(
        dataView,
        tiffOffset,
        tiffOffset + data.exif[0x8769], // directory offset
        littleEndian,
        data
      )
    }
    // Check for GPS Info IFD Pointer:
    if (data.exif[0x8825] && !options.disableExifGps) {
      loadImage.parseExifTags(
        dataView,
        tiffOffset,
        tiffOffset + data.exif[0x8825], // directory offset
        littleEndian,
        data
      )
    }
  }

  // Registers the Exif parser for the APP1 JPEG meta data segment:
  loadImage.metaDataParsers.jpeg[0xffe1].push(loadImage.parseExifData)

  // Adds the following properties to the parseMetaData callback data:
  // * exif: The exif tags, parsed by the parseExifData method

  // Adds the following options to the parseMetaData method:
  // * disableExif: Disables Exif parsing.
  // * disableExifThumbnail: Disables parsing of the Exif Thumbnail.
  // * disableExifSub: Disables parsing of the Exif Sub IFD.
  // * disableExifGps: Disables parsing of the Exif GPS Info IFD.
})

},{"./load-image":65,"./load-image-meta":62}],62:[function(require,module,exports){
/*
 * JavaScript Load Image Meta
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Image meta data handling implementation
 * based on the help and contribution of
 * Achim Stöhr.
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

/* global define, Blob */

;(function (factory) {
  'use strict'
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define(['./load-image'], factory)
  } else if (typeof module === 'object' && module.exports) {
    factory(require('./load-image'))
  } else {
    // Browser globals:
    factory(window.loadImage)
  }
})(function (loadImage) {
  'use strict'

  var hasblobSlice =
    typeof Blob !== 'undefined' &&
    (Blob.prototype.slice ||
      Blob.prototype.webkitSlice ||
      Blob.prototype.mozSlice)

  loadImage.blobSlice =
    hasblobSlice &&
    function () {
      var slice = this.slice || this.webkitSlice || this.mozSlice
      return slice.apply(this, arguments)
    }

  loadImage.metaDataParsers = {
    jpeg: {
      0xffe1: [] // APP1 marker
    }
  }

  // Parses image meta data and calls the callback with an object argument
  // with the following properties:
  // * imageHead: The complete image head as ArrayBuffer (Uint8Array for IE10)
  // The options arguments accepts an object and supports the following properties:
  // * maxMetaDataSize: Defines the maximum number of bytes to parse.
  // * disableImageHead: Disables creating the imageHead property.
  loadImage.parseMetaData = function (file, callback, options, data) {
    options = options || {}
    data = data || {}
    var that = this
    // 256 KiB should contain all EXIF/ICC/IPTC segments:
    var maxMetaDataSize = options.maxMetaDataSize || 262144
    var noMetaData = !(
      typeof DataView !== 'undefined' &&
      file &&
      file.size >= 12 &&
      file.type === 'image/jpeg' &&
      loadImage.blobSlice
    )
    if (
      noMetaData ||
      !loadImage.readFile(
        loadImage.blobSlice.call(file, 0, maxMetaDataSize),
        function (e) {
          if (e.target.error) {
            // FileReader error
            console.log(e.target.error)
            callback(data)
            return
          }
          // Note on endianness:
          // Since the marker and length bytes in JPEG files are always
          // stored in big endian order, we can leave the endian parameter
          // of the DataView methods undefined, defaulting to big endian.
          var buffer = e.target.result
          var dataView = new DataView(buffer)
          var offset = 2
          var maxOffset = dataView.byteLength - 4
          var headLength = offset
          var markerBytes
          var markerLength
          var parsers
          var i
          // Check for the JPEG marker (0xffd8):
          if (dataView.getUint16(0) === 0xffd8) {
            while (offset < maxOffset) {
              markerBytes = dataView.getUint16(offset)
              // Search for APPn (0xffeN) and COM (0xfffe) markers,
              // which contain application-specific meta-data like
              // Exif, ICC and IPTC data and text comments:
              if (
                (markerBytes >= 0xffe0 && markerBytes <= 0xffef) ||
                markerBytes === 0xfffe
              ) {
                // The marker bytes (2) are always followed by
                // the length bytes (2), indicating the length of the
                // marker segment, which includes the length bytes,
                // but not the marker bytes, so we add 2:
                markerLength = dataView.getUint16(offset + 2) + 2
                if (offset + markerLength > dataView.byteLength) {
                  console.log('Invalid meta data: Invalid segment size.')
                  break
                }
                parsers = loadImage.metaDataParsers.jpeg[markerBytes]
                if (parsers) {
                  for (i = 0; i < parsers.length; i += 1) {
                    parsers[i].call(
                      that,
                      dataView,
                      offset,
                      markerLength,
                      data,
                      options
                    )
                  }
                }
                offset += markerLength
                headLength = offset
              } else {
                // Not an APPn or COM marker, probably safe to
                // assume that this is the end of the meta data
                break
              }
            }
            // Meta length must be longer than JPEG marker (2)
            // plus APPn marker (2), followed by length bytes (2):
            if (!options.disableImageHead && headLength > 6) {
              if (buffer.slice) {
                data.imageHead = buffer.slice(0, headLength)
              } else {
                // Workaround for IE10, which does not yet
                // support ArrayBuffer.slice:
                data.imageHead = new Uint8Array(buffer).subarray(0, headLength)
              }
            }
          } else {
            console.log('Invalid JPEG file: Missing JPEG marker.')
          }
          callback(data)
        },
        'readAsArrayBuffer'
      )
    ) {
      callback(data)
    }
  }

  // Determines if meta data should be loaded automatically:
  loadImage.hasMetaOption = function (options) {
    return options && options.meta
  }

  var originalTransform = loadImage.transform
  loadImage.transform = function (img, options, callback, file, data) {
    if (loadImage.hasMetaOption(options)) {
      loadImage.parseMetaData(
        file,
        function (data) {
          originalTransform.call(loadImage, img, options, callback, file, data)
        },
        options,
        data
      )
    } else {
      originalTransform.apply(loadImage, arguments)
    }
  }
})

},{"./load-image":65}],63:[function(require,module,exports){
/*
 * JavaScript Load Image Orientation
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

/* global define */

;(function (factory) {
  'use strict'
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define(['./load-image', './load-image-scale', './load-image-meta'], factory)
  } else if (typeof module === 'object' && module.exports) {
    factory(
      require('./load-image'),
      require('./load-image-scale'),
      require('./load-image-meta')
    )
  } else {
    // Browser globals:
    factory(window.loadImage)
  }
})(function (loadImage) {
  'use strict'

  var originalHasCanvasOption = loadImage.hasCanvasOption
  var originalHasMetaOption = loadImage.hasMetaOption
  var originalTransformCoordinates = loadImage.transformCoordinates
  var originalGetTransformedOptions = loadImage.getTransformedOptions

  // Determines if the target image should be a canvas element:
  loadImage.hasCanvasOption = function (options) {
    return (
      !!options.orientation || originalHasCanvasOption.call(loadImage, options)
    )
  }

  // Determines if meta data should be loaded automatically:
  loadImage.hasMetaOption = function (options) {
    return (
      (options && options.orientation === true) ||
      originalHasMetaOption.call(loadImage, options)
    )
  }

  // Transform image orientation based on
  // the given EXIF orientation option:
  loadImage.transformCoordinates = function (canvas, options) {
    originalTransformCoordinates.call(loadImage, canvas, options)
    var ctx = canvas.getContext('2d')
    var width = canvas.width
    var height = canvas.height
    var styleWidth = canvas.style.width
    var styleHeight = canvas.style.height
    var orientation = options.orientation
    if (!orientation || orientation > 8) {
      return
    }
    if (orientation > 4) {
      canvas.width = height
      canvas.height = width
      canvas.style.width = styleHeight
      canvas.style.height = styleWidth
    }
    switch (orientation) {
      case 2:
        // horizontal flip
        ctx.translate(width, 0)
        ctx.scale(-1, 1)
        break
      case 3:
        // 180° rotate left
        ctx.translate(width, height)
        ctx.rotate(Math.PI)
        break
      case 4:
        // vertical flip
        ctx.translate(0, height)
        ctx.scale(1, -1)
        break
      case 5:
        // vertical flip + 90 rotate right
        ctx.rotate(0.5 * Math.PI)
        ctx.scale(1, -1)
        break
      case 6:
        // 90° rotate right
        ctx.rotate(0.5 * Math.PI)
        ctx.translate(0, -height)
        break
      case 7:
        // horizontal flip + 90 rotate right
        ctx.rotate(0.5 * Math.PI)
        ctx.translate(width, -height)
        ctx.scale(-1, 1)
        break
      case 8:
        // 90° rotate left
        ctx.rotate(-0.5 * Math.PI)
        ctx.translate(-width, 0)
        break
    }
  }

  // Transforms coordinate and dimension options
  // based on the given orientation option:
  loadImage.getTransformedOptions = function (img, opts, data) {
    var options = originalGetTransformedOptions.call(loadImage, img, opts)
    var orientation = options.orientation
    var newOptions
    var i
    if (orientation === true && data && data.exif) {
      orientation = data.exif.get('Orientation')
    }
    if (!orientation || orientation > 8 || orientation === 1) {
      return options
    }
    newOptions = {}
    for (i in options) {
      if (options.hasOwnProperty(i)) {
        newOptions[i] = options[i]
      }
    }
    newOptions.orientation = orientation
    switch (orientation) {
      case 2:
        // horizontal flip
        newOptions.left = options.right
        newOptions.right = options.left
        break
      case 3:
        // 180° rotate left
        newOptions.left = options.right
        newOptions.top = options.bottom
        newOptions.right = options.left
        newOptions.bottom = options.top
        break
      case 4:
        // vertical flip
        newOptions.top = options.bottom
        newOptions.bottom = options.top
        break
      case 5:
        // vertical flip + 90 rotate right
        newOptions.left = options.top
        newOptions.top = options.left
        newOptions.right = options.bottom
        newOptions.bottom = options.right
        break
      case 6:
        // 90° rotate right
        newOptions.left = options.top
        newOptions.top = options.right
        newOptions.right = options.bottom
        newOptions.bottom = options.left
        break
      case 7:
        // horizontal flip + 90 rotate right
        newOptions.left = options.bottom
        newOptions.top = options.right
        newOptions.right = options.top
        newOptions.bottom = options.left
        break
      case 8:
        // 90° rotate left
        newOptions.left = options.bottom
        newOptions.top = options.left
        newOptions.right = options.top
        newOptions.bottom = options.right
        break
    }
    if (newOptions.orientation > 4) {
      newOptions.maxWidth = options.maxHeight
      newOptions.maxHeight = options.maxWidth
      newOptions.minWidth = options.minHeight
      newOptions.minHeight = options.minWidth
      newOptions.sourceWidth = options.sourceHeight
      newOptions.sourceHeight = options.sourceWidth
    }
    return newOptions
  }
})

},{"./load-image":65,"./load-image-meta":62,"./load-image-scale":64}],64:[function(require,module,exports){
/*
 * JavaScript Load Image Scaling
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

/* global define */

;(function (factory) {
  'use strict'
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define(['./load-image'], factory)
  } else if (typeof module === 'object' && module.exports) {
    factory(require('./load-image'))
  } else {
    // Browser globals:
    factory(window.loadImage)
  }
})(function (loadImage) {
  'use strict'

  var originalTransform = loadImage.transform

  loadImage.transform = function (img, options, callback, file, data) {
    originalTransform.call(
      loadImage,
      loadImage.scale(img, options, data),
      options,
      callback,
      file,
      data
    )
  }

  // Transform image coordinates, allows to override e.g.
  // the canvas orientation based on the orientation option,
  // gets canvas, options passed as arguments:
  loadImage.transformCoordinates = function () {}

  // Returns transformed options, allows to override e.g.
  // maxWidth, maxHeight and crop options based on the aspectRatio.
  // gets img, options passed as arguments:
  loadImage.getTransformedOptions = function (img, options) {
    var aspectRatio = options.aspectRatio
    var newOptions
    var i
    var width
    var height
    if (!aspectRatio) {
      return options
    }
    newOptions = {}
    for (i in options) {
      if (options.hasOwnProperty(i)) {
        newOptions[i] = options[i]
      }
    }
    newOptions.crop = true
    width = img.naturalWidth || img.width
    height = img.naturalHeight || img.height
    if (width / height > aspectRatio) {
      newOptions.maxWidth = height * aspectRatio
      newOptions.maxHeight = height
    } else {
      newOptions.maxWidth = width
      newOptions.maxHeight = width / aspectRatio
    }
    return newOptions
  }

  // Canvas render method, allows to implement a different rendering algorithm:
  loadImage.renderImageToCanvas = function (
    canvas,
    img,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    destX,
    destY,
    destWidth,
    destHeight
  ) {
    canvas
      .getContext('2d')
      .drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        destX,
        destY,
        destWidth,
        destHeight
      )
    return canvas
  }

  // Determines if the target image should be a canvas element:
  loadImage.hasCanvasOption = function (options) {
    return options.canvas || options.crop || !!options.aspectRatio
  }

  // Scales and/or crops the given image (img or canvas HTML element)
  // using the given options.
  // Returns a canvas object if the browser supports canvas
  // and the hasCanvasOption method returns true or a canvas
  // object is passed as image, else the scaled image:
  loadImage.scale = function (img, options, data) {
    options = options || {}
    var canvas = document.createElement('canvas')
    var useCanvas =
      img.getContext ||
      (loadImage.hasCanvasOption(options) && canvas.getContext)
    var width = img.naturalWidth || img.width
    var height = img.naturalHeight || img.height
    var destWidth = width
    var destHeight = height
    var maxWidth
    var maxHeight
    var minWidth
    var minHeight
    var sourceWidth
    var sourceHeight
    var sourceX
    var sourceY
    var pixelRatio
    var downsamplingRatio
    var tmp
    function scaleUp () {
      var scale = Math.max(
        (minWidth || destWidth) / destWidth,
        (minHeight || destHeight) / destHeight
      )
      if (scale > 1) {
        destWidth *= scale
        destHeight *= scale
      }
    }
    function scaleDown () {
      var scale = Math.min(
        (maxWidth || destWidth) / destWidth,
        (maxHeight || destHeight) / destHeight
      )
      if (scale < 1) {
        destWidth *= scale
        destHeight *= scale
      }
    }
    if (useCanvas) {
      options = loadImage.getTransformedOptions(img, options, data)
      sourceX = options.left || 0
      sourceY = options.top || 0
      if (options.sourceWidth) {
        sourceWidth = options.sourceWidth
        if (options.right !== undefined && options.left === undefined) {
          sourceX = width - sourceWidth - options.right
        }
      } else {
        sourceWidth = width - sourceX - (options.right || 0)
      }
      if (options.sourceHeight) {
        sourceHeight = options.sourceHeight
        if (options.bottom !== undefined && options.top === undefined) {
          sourceY = height - sourceHeight - options.bottom
        }
      } else {
        sourceHeight = height - sourceY - (options.bottom || 0)
      }
      destWidth = sourceWidth
      destHeight = sourceHeight
    }
    maxWidth = options.maxWidth
    maxHeight = options.maxHeight
    minWidth = options.minWidth
    minHeight = options.minHeight
    if (useCanvas && maxWidth && maxHeight && options.crop) {
      destWidth = maxWidth
      destHeight = maxHeight
      tmp = sourceWidth / sourceHeight - maxWidth / maxHeight
      if (tmp < 0) {
        sourceHeight = maxHeight * sourceWidth / maxWidth
        if (options.top === undefined && options.bottom === undefined) {
          sourceY = (height - sourceHeight) / 2
        }
      } else if (tmp > 0) {
        sourceWidth = maxWidth * sourceHeight / maxHeight
        if (options.left === undefined && options.right === undefined) {
          sourceX = (width - sourceWidth) / 2
        }
      }
    } else {
      if (options.contain || options.cover) {
        minWidth = maxWidth = maxWidth || minWidth
        minHeight = maxHeight = maxHeight || minHeight
      }
      if (options.cover) {
        scaleDown()
        scaleUp()
      } else {
        scaleUp()
        scaleDown()
      }
    }
    if (useCanvas) {
      pixelRatio = options.pixelRatio
      if (pixelRatio > 1) {
        canvas.style.width = destWidth + 'px'
        canvas.style.height = destHeight + 'px'
        destWidth *= pixelRatio
        destHeight *= pixelRatio
        canvas.getContext('2d').scale(pixelRatio, pixelRatio)
      }
      downsamplingRatio = options.downsamplingRatio
      if (
        downsamplingRatio > 0 &&
        downsamplingRatio < 1 &&
        destWidth < sourceWidth &&
        destHeight < sourceHeight
      ) {
        while (sourceWidth * downsamplingRatio > destWidth) {
          canvas.width = sourceWidth * downsamplingRatio
          canvas.height = sourceHeight * downsamplingRatio
          loadImage.renderImageToCanvas(
            canvas,
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            canvas.width,
            canvas.height
          )
          sourceX = 0
          sourceY = 0
          sourceWidth = canvas.width
          sourceHeight = canvas.height
          img = document.createElement('canvas')
          img.width = sourceWidth
          img.height = sourceHeight
          loadImage.renderImageToCanvas(
            img,
            canvas,
            0,
            0,
            sourceWidth,
            sourceHeight,
            0,
            0,
            sourceWidth,
            sourceHeight
          )
        }
      }
      canvas.width = destWidth
      canvas.height = destHeight
      loadImage.transformCoordinates(canvas, options)
      return loadImage.renderImageToCanvas(
        canvas,
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        destWidth,
        destHeight
      )
    }
    img.width = destWidth
    img.height = destHeight
    return img
  }
})

},{"./load-image":65}],65:[function(require,module,exports){
/*
 * JavaScript Load Image
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

/* global define, URL, webkitURL, FileReader */

;(function ($) {
  'use strict'

  // Loads an image for a given File object.
  // Invokes the callback with an img or optional canvas
  // element (if supported by the browser) as parameter:
  function loadImage (file, callback, options) {
    var img = document.createElement('img')
    var url
    img.onerror = function (event) {
      return loadImage.onerror(img, event, file, callback, options)
    }
    img.onload = function (event) {
      return loadImage.onload(img, event, file, callback, options)
    }
    if (typeof file === 'string') {
      loadImage.fetchBlob(
        file,
        function (blob) {
          if (blob) {
            file = blob
            url = loadImage.createObjectURL(file)
          } else {
            url = file
            if (options && options.crossOrigin) {
              img.crossOrigin = options.crossOrigin
            }
          }
          img.src = url
        },
        options
      )
      return img
    } else if (
      loadImage.isInstanceOf('Blob', file) ||
      // Files are also Blob instances, but some browsers
      // (Firefox 3.6) support the File API but not Blobs:
      loadImage.isInstanceOf('File', file)
    ) {
      url = img._objectURL = loadImage.createObjectURL(file)
      if (url) {
        img.src = url
        return img
      }
      return loadImage.readFile(file, function (e) {
        var target = e.target
        if (target && target.result) {
          img.src = target.result
        } else if (callback) {
          callback(e)
        }
      })
    }
  }
  // The check for URL.revokeObjectURL fixes an issue with Opera 12,
  // which provides URL.createObjectURL but doesn't properly implement it:
  var urlAPI =
    ($.createObjectURL && $) ||
    ($.URL && URL.revokeObjectURL && URL) ||
    ($.webkitURL && webkitURL)

  function revokeHelper (img, options) {
    if (img._objectURL && !(options && options.noRevoke)) {
      loadImage.revokeObjectURL(img._objectURL)
      delete img._objectURL
    }
  }

  // If the callback given to this function returns a blob, it is used as image
  // source instead of the original url and overrides the file argument used in
  // the onload and onerror event callbacks:
  loadImage.fetchBlob = function (url, callback, options) {
    callback()
  }

  loadImage.isInstanceOf = function (type, obj) {
    // Cross-frame instanceof check
    return Object.prototype.toString.call(obj) === '[object ' + type + ']'
  }

  loadImage.transform = function (img, options, callback, file, data) {
    callback(img, data)
  }

  loadImage.onerror = function (img, event, file, callback, options) {
    revokeHelper(img, options)
    if (callback) {
      callback.call(img, event)
    }
  }

  loadImage.onload = function (img, event, file, callback, options) {
    revokeHelper(img, options)
    if (callback) {
      loadImage.transform(img, options, callback, file, {})
    }
  }

  loadImage.createObjectURL = function (file) {
    return urlAPI ? urlAPI.createObjectURL(file) : false
  }

  loadImage.revokeObjectURL = function (url) {
    return urlAPI ? urlAPI.revokeObjectURL(url) : false
  }

  // Loads a given File object via FileReader interface,
  // invokes the callback with the event object (load or error).
  // The result can be read via event.target.result:
  loadImage.readFile = function (file, callback, method) {
    if ($.FileReader) {
      var fileReader = new FileReader()
      fileReader.onload = fileReader.onerror = callback
      method = method || 'readAsDataURL'
      if (fileReader[method]) {
        fileReader[method](file)
        return fileReader
      }
    }
    return false
  }

  if (typeof define === 'function' && define.amd) {
    define(function () {
      return loadImage
    })
  } else if (typeof module === 'object' && module.exports) {
    module.exports = loadImage
  } else {
    $.loadImage = loadImage
  }
})((typeof window !== 'undefined' && window) || this)

},{}],66:[function(require,module,exports){
(function (global){
module.exports = global.layer;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],67:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.Notify = global.Notify || {})));
}(this, function (exports) { 'use strict';

  var _objectWithoutProperties = (function (obj, keys) {
    var target = {};

    for (var i in obj) {
      if (keys.indexOf(i) >= 0) continue;
      if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
      target[i] = obj[i];
    }

    return target;
  })

  /*
   * Author: Alex Gibson
   * https://github.com/alexgibson/notify.js
   * License: MIT license
   */

  var N = window.Notification;

  function isFunction(item) {
      return typeof item === 'function';
  }

  function Notify(title) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];


      if (typeof title !== 'string') {
          throw new Error('Notify(): first arg (title) must be a string.');
      }

      if (typeof options !== 'object') {
          throw new Error('Notify(): second arg (options) must be an object.');
      }

      var _options$notifyShow = options.notifyShow;
      var
      // Notify options
      notifyShow = _options$notifyShow === undefined ? null : _options$notifyShow;
      var _options$notifyClose = options.notifyClose;
      var notifyClose = _options$notifyClose === undefined ? null : _options$notifyClose;
      var _options$notifyClick = options.notifyClick;
      var notifyClick = _options$notifyClick === undefined ? null : _options$notifyClick;
      var _options$notifyError = options.notifyError;
      var notifyError = _options$notifyError === undefined ? null : _options$notifyError;
      var _options$closeOnClick = options.closeOnClick;
      var closeOnClick = _options$closeOnClick === undefined ? false : _options$closeOnClick;
      var _options$timeout = options.timeout;
      var timeout = _options$timeout === undefined ? null : _options$timeout;

      var rest = _objectWithoutProperties(options, ['notifyShow', 'notifyClose', 'notifyClick', 'notifyError', 'closeOnClick', 'timeout']);

      this.title = title;
      this.options = rest;
      this.permission = null;
      this.closeOnClick = closeOnClick;
      this.timeout = timeout;

      //callback when notification is displayed
      if (isFunction(notifyShow)) {
          this.onShowCallback = notifyShow;
      }

      //callback when notification is closed
      if (isFunction(notifyClose)) {
          this.onCloseCallback = notifyClose;
      }

      //callback when notification is clicked
      if (isFunction(notifyClick)) {
          this.onClickCallback = notifyClick;
      }

      //callback when notification throws error
      if (isFunction(notifyError)) {
          this.onErrorCallback = notifyError;
      }
  }

  // returns true if the browser supports Web Notifications
  // https://developers.google.com/web/updates/2015/05/Notifying-you-of-notificiation-changes
  // @param {perm} for test purposes only
  Notify.isSupported = function (perm) {
      if (!N || !N.requestPermission) {
          return false;
      }

      if (perm === 'granted' || N.permission === 'granted') {
          throw new Error('You must only call this before calling Notification.requestPermission(), otherwise this feature detect would trigger an actual notification!');
      }

      try {
          new N('');
      } catch (e) {
          if (e.name === 'TypeError') {
              return false;
          }
      }
      return true;
  };

  // true if the permission is not granted
  Notify.needsPermission = N && N.permission && N.permission === 'granted' ? false : true;

  // asks the user for permission to display notifications.  Then calls the callback functions is supplied.
  Notify.requestPermission = function (onPermissionGrantedCallback, onPermissionDeniedCallback) {
      N.requestPermission(function (perm) {
          switch (perm) {
              case 'granted':
                  Notify.needsPermission = false;
                  if (isFunction(onPermissionGrantedCallback)) {
                      onPermissionGrantedCallback();
                  }
                  break;
              case 'denied':
                  Notify.needsPermission = true;
                  if (isFunction(onPermissionDeniedCallback)) {
                      onPermissionDeniedCallback();
                  }
                  break;
          }
      });
  };

  Notify.prototype.show = function () {
      this.myNotify = new N(this.title, this.options);

      if (!this.options.requireInteraction && this.timeout && !isNaN(this.timeout)) {
          setTimeout(this.close.bind(this), this.timeout * 1000);
      }

      this.myNotify.addEventListener('show', this, false);
      this.myNotify.addEventListener('error', this, false);
      this.myNotify.addEventListener('close', this, false);
      this.myNotify.addEventListener('click', this, false);
  };

  Notify.prototype.onShowNotification = function (e) {
      if (this.onShowCallback) {
          this.onShowCallback(e);
      }
  };

  Notify.prototype.onCloseNotification = function (e) {
      if (this.onCloseCallback) {
          this.onCloseCallback(e);
      }
      this.destroy();
  };

  Notify.prototype.onClickNotification = function (e) {
      if (this.onClickCallback) {
          this.onClickCallback(e);
      }

      if (this.closeOnClick) {
          this.close();
      }
  };

  Notify.prototype.onErrorNotification = function (e) {
      if (this.onErrorCallback) {
          this.onErrorCallback(e);
      }
      this.destroy();
  };

  Notify.prototype.destroy = function () {
      this.myNotify.removeEventListener('show', this, false);
      this.myNotify.removeEventListener('error', this, false);
      this.myNotify.removeEventListener('close', this, false);
      this.myNotify.removeEventListener('click', this, false);
  };

  Notify.prototype.close = function () {
      this.myNotify.close();
  };

  Notify.prototype.handleEvent = function (e) {
      switch (e.type) {
          case 'show':
              this.onShowNotification(e);
              break;
          case 'close':
              this.onCloseNotification(e);
              break;
          case 'click':
              this.onClickNotification(e);
              break;
          case 'error':
              this.onErrorNotification(e);
              break;
      }
  };

  exports['default'] = Notify;

}));
},{}],68:[function(require,module,exports){
/* jshint node:true */

module.exports = {
    ":alarm_clock:": "\u23F0",
    ":anchor:": "\u2693",
    ":aquarius:": "\u2652",
    ":aries:": "\u2648",
    ":arrow_backward:": "\u25C0",
    ":arrow_double_down:": "\u23EC",
    ":arrow_double_up:": "\u23EB",
    ":arrow_down:": "\u2B07",
    ":arrow_forward:": "\u25B6",
    ":arrow_heading_down:": "\u2935",
    ":arrow_heading_up:": "\u2934",
    ":arrow_left:": "\u2B05",
    ":arrow_lower_left:": "\u2199",
    ":arrow_lower_right:": "\u2198",
    ":arrow_right:": "\u27A1",
    ":arrow_right_hook:": "\u21AA",
    ":arrow_up:": "\u2B06",
    ":arrow_up_down:": "\u2195",
    ":arrow_upper_left:": "\u2196",
    ":arrow_upper_right:": "\u2197",
    ":ballot_box_with_check:": "\u2611",
    ":bangbang:": "\u203C",
    ":cancer:": "\u264B",
    ":baseball:": "\u26BE",
    ":black_large_square:": "\u2B1B",
    ":black_medium_small_square:": "\u25FE",
    ":black_medium_square:": "\u25FC",
    ":black_nib:": "\u2712",
    ":black_small_square:": "\u25AA",
    ":black_circle:": "\u26AB",
    ":boat:": "\u26F5",
    ":capricorn:": "\u2651",
    ":church:": "\u26EA",
    ":cloud:": "\u2601",
    ":clubs:": "\u2663",
    ":coffee:": "\u2615",
    ":congratulations:": "\u3297",
    ":copyright:": "\u00A9",
    ":curly_loop:": "\u27B0",
    ":eight_pointed_black_star:": "\u2734",
    ":eight_spoked_asterisk:": "\u2733",
    ":diamonds:": "\u2666",
    ":email:": "\u2709",
    ":envelope:": "\u2709",
    ":exclamation:": "\u2757",
    ":fast_forward:": "\u23E9",
    ":fist:": "\u270A",
    ":fountain:": "\u26F2",
    ":fuelpump:": "\u26FD",
    ":gemini:": "\u264A",
    ":golf:": "\u26F3",
    ":grey_exclamation:": "\u2755",
    ":grey_question:": "\u2754",
    ":hand:": "\u270B",
    ":heart:": "\u2764",
    ":hearts:": "\u2665",
    ":heavy_check_mark:": "\u2714",
    ":heavy_division_sign:": "\u2797",
    ":heavy_exclamation_mark:": "\u2757",
    ":heavy_minus_sign:": "\u2796",
    ":heavy_multiplication_x:": "\u2716",
    ":heavy_plus_sign:": "\u2795",
    ":hotsprings:": "\u2668",
    ":hourglass:": "\u231B",
    ":hourglass_flowing_sand:": "\u23F3",
    ":information_source:": "\u2139",
    ":interrobang:": "\u2049",
    ":left_right_arrow:": "\u2194",
    ":leftwards_arrow_with_hook:": "\u21A9",
    ":leo:": "\u264C",
    ":libra:": "\u264E",
    ":loop:": "\u27BF",
    ":m:": "\u24C2",
    ":negative_squared_cross_mark:": "\u274E",
    ":no_entry:": "\u26D4",
    ":o:": "\u2B55",
    ":ophiuchus:": "\u26CE",
    ":part_alternation_mark:": "\u303D",
    ":partly_sunny:": "\u26C5",
    ":pencil2:": "\u270F",
    ":phone:": "\u260E",
    ":pisces:": "\u2653",
    ":point_up:": "\u261D",
    ":question:": "\u2753",
    ":raised_hand:": "\u270B",
    ":recycle:": "\u267B",
    ":registered:": "\u00AE",
    ":relaxed:": "\u263A",
    ":rewind:": "\u23EA",
    ":sagittarius:": "\u2650",
    ":sailboat:": "\u26F5",
    ":scissors:": "\u2702",
    ":scorpius:": "\u264F",
    ":secret:": "\u3299",
    ":snowflake:": "\u2744",
    ":snowman:": "\u26C4",
    ":soccer:": "\u26BD",
    ":spades:": "\u2660",
    ":sparkle:": "\u2747",
    ":sparkles:": "\u2728",
    ":star:": "\u2B50",
    ":sunny:": "\u2600",
    ":taurus:": "\u2649",
    ":telephone:": "\u260E",
    ":tent:": "\u26FA",
    ":tm:": "\u2122",
    ":umbrella:": "\u2614",
    ":v:": "\u270C",
    ":virgo:": "\u264D",
    ":warning:": "\u26A0",
    ":watch:": "\u231A",
    ":wavy_dash:": "\u3030",
    ":wheelchair:": "\u267F",
    ":white_check_mark:": "\u2705",
    ":white_circle:": "\u26AA",
    ":white_large_square:": "\u2B1C",
    ":white_medium_small_square:": "\u25FD",
    ":white_medium_square:": "\u25FB",
    ":white_small_square:": "\u25AB",
    ":x:": "\u274C",
    ":zap:": "\u26A1",
    ":airplane:": "\u2708",
    ":+1:": "👍",
    ":-1:": "👎",
    ":100:": "💯",
    ":1234:": "🔢",
    ":8ball:": "🎱",
    ":a:": "🅰",
    ":ab:": "🆎",
    ":abc:": "🔤",
    ":abcd:": "🔡",
    ":accept:": "🉑",
    ":aerial_tramway:": "🚡",
    ":alien:": "👽",
    ":ambulance:": "🚑",
    ":angel:": "👼",
    ":anger:": "💢",
    ":angry:": "😠",
    ":-||": "😠",
    ":@": "😠",
    ">:(": "😠",
    ":anguished:": "😧",
    ":ant:": "🐜",
    ":apple:": "🍎",
    ":arrow_down_small:": "🔽",
    ":arrow_up_small:": "🔼",
    ":arrows_clockwise:": "🔃",
    ":arrows_counterclockwise:": "🔄",
    ":art:": "🎨",
    ":articulated_lorry:": "🚛",
    ":astonished:": "😲",
    ":athletic_shoe:": "👟",
    ":atm:": "🏧",
    ":b:": "🅱",
    ":baby:": "👶",
    ":baby_bottle:": "🍼",
    ":baby_chick:": "🐤",
    ":baby_symbol:": "🚼",
    ":back:": "🔙",
    ":baggage_claim:": "🛄",
    ":balloon:": "🎈",
    ":bamboo:": "🎍",
    ":banana:": "🍌",
    ":bank:": "🏦",
    ":bar_chart:": "📊",
    ":barber:": "💈",
    ":basketball:": "🏀",
    ":bath:": "🛀",
    ":bathtub:": "🛁",
    ":battery:": "🔋",
    ":bear:": "🐻",
    ":bee:": "🐝",
    ":beer:": "🍺",
    ":beers:": "🍻",
    ":beetle:": "🐞",
    ":beginner:": "🔰",
    ":bell:": "🔔",
    ":bento:": "🍱",
    ":bicyclist:": "🚴",
    ":bike:": "🚲",
    ":bikini:": "👙",
    ":bird:": "🐦",
    ":birthday:": "🎂",
    ":black_joker:": "🃏",
    ":black_square_button:": "🔲",
    ":blossom:": "🌼",
    ":blowfish:": "🐡",
    ":blue_book:": "📘",
    ":blue_car:": "🚙",
    ":blue_heart:": "💙",
    ":blush:": "😊",
    ":$": "😊",
    ":boar:": "🐗",
    ":bomb:": "💣",
    ":book:": "📖",
    ":bookmark:": "🔖",
    ":bookmark_tabs:": "📑",
    ":books:": "📚",
    ":boom:": "💥",
    ":boot:": "👢",
    ":bouquet:": "💐",
    ":bow:": "🙇",
    ":bowling:": "🎳",
    ":boy:": "👦",
    ":bread:": "🍞",
    ":bride_with_veil:": "👰",
    ":bridge_at_night:": "🌉",
    ":briefcase:": "💼",
    ":broken_heart:": "💔",
    ":bug:": "🐛",
    ":bulb:": "💡",
    ":bullettrain_front:": "🚅",
    ":bullettrain_side:": "🚄",
    ":bus:": "🚌",
    ":busstop:": "🚏",
    ":bust_in_silhouette:": "👤",
    ":busts_in_silhouette:": "👥",
    ":cactus:": "🌵",
    ":cake:": "🍰",
    ":calendar:": "📆",
    ":calling:": "📲",
    ":camel:": "🐫",
    ":camera:": "📷",
    ":candy:": "🍬",
    ":capital_abcd:": "🔠",
    ":car:": "🚗",
    ":card_index:": "📇",
    ":carousel_horse:": "🎠",
    ":cat:": "🐱",
    ":cat2:": "🐈",
    ":cd:": "💿",
    ":chart:": "💹",
    ":chart_with_downwards_trend:": "📉",
    ":chart_with_upwards_trend:": "📈",
    ":checkered_flag:": "🏁",
    ":cherries:": "🍒",
    ":cherry_blossom:": "🌸",
    ":chestnut:": "🌰",
    ":chicken:": "🐔",
    ":children_crossing:": "🚸",
    ":chocolate_bar:": "🍫",
    ":christmas_tree:": "🎄",
    ":cinema:": "🎦",
    ":circus_tent:": "🎪",
    ":city_sunrise:": "🌇",
    ":city_sunset:": "🌆",
    ":cl:": "🆑",
    ":clap:": "👏",
    ":clapper:": "🎬",
    ":clipboard:": "📋",
    ":clock1:": "🕐",
    ":clock10:": "🕙",
    ":clock1030:": "🕥",
    ":clock11:": "🕚",
    ":clock1130:": "🕦",
    ":clock12:": "🕛",
    ":clock1230:": "🕧",
    ":clock130:": "🕜",
    ":clock2:": "🕑",
    ":clock230:": "🕝",
    ":clock3:": "🕒",
    ":clock330:": "🕞",
    ":clock4:": "🕓",
    ":clock430:": "🕟",
    ":clock5:": "🕔",
    ":clock530:": "🕠",
    ":clock6:": "🕕",
    ":clock630:": "🕡",
    ":clock7:": "🕖",
    ":clock730:": "🕢",
    ":clock8:": "🕗",
    ":clock830:": "🕣",
    ":clock9:": "🕘",
    ":clock930:": "🕤",
    ":closed_book:": "📕",
    ":closed_lock_with_key:": "🔐",
    ":closed_umbrella:": "🌂",
    ":cocktail:": "🍸",
    ":cold_sweat:": "😰",
    ":collision:": "💥",
    ":computer:": "💻",
    ":confetti_ball:": "🎊",
    ":confounded:": "😖",
    ":confused:": "😕",
    "%-)": "😕",
    "%)": "😕",
    ":construction:": "🚧",
    ":construction_worker:": "👷",
    ":convenience_store:": "🏪",
    ":cookie:": "🍪",
    ":cool:": "🆒",
    ":cop:": "👮",
    ":corn:": "🌽",
    ":couple:": "👫",
    ":couple_with_heart:": "💑",
    ":couplekiss:": "💏",
    ":cow:": "🐮",
    ":cow2:": "🐄",
    ":credit_card:": "💳",
    ":crocodile:": "🐊",
    ":crossed_flags:": "🎌",
    ":crown:": "👑",
    ":cry:": "😢",
    ":'(": "😢",
    ":-'(": "😢",
    ":crying_cat_face:": "😿",
    ":crystal_ball:": "🔮",
    ":cupid:": "💘",
    ":currency_exchange:": "💱",
    ":curry:": "🍛",
    ":custard:": "🍮",
    ":customs:": "🛃",
    ":cyclone:": "🌀",
    ":dancer:": "💃",
    ":dancers:": "👯",
    ":dango:": "🍡",
    ":dart:": "🎯",
    ":dash:": "💨",
    ":date:": "📅",
    ":deciduous_tree:": "🌳",
    ":department_store:": "🏬",
    ":diamond_shape_with_a_dot_inside:": "💠",
    ":disappointed:": "😞",
    ":disappointed_relieved:": "😥",
    ":dizzy:": "💫",
    ":dizzy_face:": "😵",
    ":do_not_litter:": "🚯",
    ":dog:": "🐶",
    ":dog2:": "🐕",
    ":dollar:": "💵",
    ":dolls:": "🎎",
    ":dolphin:": "🐬",
    ":door:": "🚪",
    ":doughnut:": "🍩",
    ":dragon:": "🐉",
    ":dragon_face:": "🐲",
    ":dress:": "👗",
    ":dromedary_camel:": "🐪",
    ":droplet:": "💧",
    ":dvd:": "📀",
    ":e-mail:": "📧",
    ":ear:": "👂",
    ":ear_of_rice:": "🌾",
    ":earth_africa:": "🌍",
    ":earth_americas:": "🌎",
    ":earth_asia:": "🌏",
    ":egg:": "🍳",
    ":eggplant:": "🍆",
    ":electric_plug:": "🔌",
    ":elephant:": "🐘",
    ":end:": "🔚",
    ":envelope_with_arrow:": "📩",
    ":euro:": "💶",
    ":european_castle:": "🏰",
    ":european_post_office:": "🏤",
    ":evergreen_tree:": "🌲",
    ":expressionless:": "😑",
    ":eyeglasses:": "👓",
    ":eyes:": "👀",
    ":facepunch:": "👊",
    ":factory:": "🏭",
    ":fallen_leaf:": "🍂",
    ":family:": "👪",
    ":fax:": "📠",
    ":fearful:": "😨",
    ":feet:": "🐾",
    ":ferris_wheel:": "🎡",
    ":file_folder:": "📁",
    ":fire:": "🔥",
    ":fire_engine:": "🚒",
    ":fireworks:": "🎆",
    ":first_quarter_moon:": "🌓",
    ":first_quarter_moon_with_face:": "🌛",
    ":fish:": "🐟",
    ":fish_cake:": "🍥",
    ":fishing_pole_and_fish:": "🎣",
    ":flags:": "🎏",
    ":flashlight:": "🔦",
    ":floppy_disk:": "💾",
    ":flower_playing_cards:": "🎴",
    ":flushed:": "😳",
    ":foggy:": "🌁",
    ":football:": "🏈",
    ":footprints:": "👣",
    ":fork_and_knife:": "🍴",
    ":four_leaf_clover:": "🍀",
    ":free:": "🆓",
    ":fried_shrimp:": "🍤",
    ":fries:": "🍟",
    ":frog:": "🐸",
    ":frowning:": "😦",
    ":(": "😦",
    ":-(": "😦",
    ":-[": "😦",
    ":[": "😦",
    ":full_moon:": "🌕",
    ":full_moon_with_face:": "🌝",
    ":game_die:": "🎲",
    ":gem:": "💎",
    ":ghost:": "👻",
    ":gift:": "🎁",
    ":gift_heart:": "💝",
    ":girl:": "👧",
    ":globe_with_meridians:": "🌐",
    ":goat:": "🐐",
    ":grapes:": "🍇",
    ":green_apple:": "🍏",
    ":green_book:": "📗",
    ":green_heart:": "💚",
    ":grimacing:": "😬",
    ":grin:": "😁",
    "xD": "😁",
    "x-D": "😁",
    "XD": "😁",
    "X-D": "😁",
    ":grinning:": "😀",
    ":guardsman:": "💂",
    ":guitar:": "🎸",
    ":gun:": "🔫",
    ":haircut:": "💇",
    ":hamburger:": "🍔",
    ":hammer:": "🔨",
    ":hamster:": "🐹",
    ":handbag:": "👜",
    ":hankey:": "💩",
    ":hatched_chick:": "🐥",
    ":hatching_chick:": "🐣",
    ":headphones:": "🎧",
    ":hear_no_evil:": "🙉",
    ":heart_decoration:": "💟",
    ":heart_eyes:": "😍",
    ":heart_eyes_cat:": "😻",
    ":heartbeat:": "💓",
    ":heartpulse:": "💗",
    ":heavy_dollar_sign:": "💲",
    ":helicopter:": "🚁",
    ":herb:": "🌿",
    ":hibiscus:": "🌺",
    ":high_brightness:": "🔆",
    ":high_heel:": "👠",
    ":hocho:": "🔪",
    ":honey_pot:": "🍯",
    ":honeybee:": "🐝",
    ":horse:": "🐴",
    ":horse_racing:": "🏇",
    ":hospital:": "🏥",
    ":hotel:": "🏨",
    ":house:": "🏠",
    ":house_with_garden:": "🏡",
    ":hushed:": "😯",
    ":ice_cream:": "🍨",
    ":icecream:": "🍦",
    ":id:": "🆔",
    ":ideograph_advantage:": "🉐",
    ":imp:": "👿",
    ":inbox_tray:": "📥",
    ":incoming_envelope:": "📨",
    ":information_desk_person:": "💁",
    ":innocent:": "😇",
    ":halo:": "😇",
    "0:-)": "😇",
    "0:)": "😇",
    "0:3": "😇",
    "0:-3": "😇",
    ":iphone:": "📱",
    ":izakaya_lantern:": "🏮",
    ":jack_o_lantern:": "🎃",
    ":japan:": "🗾",
    ":japanese_castle:": "🏯",
    ":japanese_goblin:": "👺",
    ":japanese_ogre:": "👹",
    ":jeans:": "👖",
    ":joy:": "😂",
    ":joy_cat:": "😹",
    ":key:": "🔑",
    ":keycap_ten:": "🔟",
    ":kimono:": "👘",
    ":kiss:": "💋",
    ":kissing:": "😗",
    ":*": "😗",
    ":^*": "😗",
    ":kissing_cat:": "😽",
    ":kissing_closed_eyes:": "😚",
    ":kissing_heart:": "😘",
    ":kissing_smiling_eyes:": "😙",
    ":koala:": "🐨",
    ":koko:": "🈁",
    ":large_blue_circle:": "🔵",
    ":large_blue_diamond:": "🔷",
    ":large_orange_diamond:": "🔶",
    ":last_quarter_moon:": "🌗",
    ":last_quarter_moon_with_face:": "🌜",
    ":laughing:": "😆",
    ":laugh:": "😆",
    ":-D": "😆",
    ":D": "😆",
    ":leaves:": "🍃",
    ":ledger:": "📒",
    ":left_luggage:": "🛅",
    ":lemon:": "🍋",
    ":leopard:": "🐆",
    ":light_rail:": "🚈",
    ":link:": "🔗",
    ":lips:": "👄",
    ":lipstick:": "💄",
    ":lock:": "🔒",
    ":lock_with_ink_pen:": "🔏",
    ":lollipop:": "🍭",
    ":loudspeaker:": "📢",
    ":love_hotel:": "🏩",
    ":love_letter:": "💌",
    ":low_brightness:": "🔅",
    ":mag:": "🔍",
    ":mag_right:": "🔎",
    ":mahjong:": "🀄",
    ":mailbox:": "📫",
    ":mailbox_closed:": "📪",
    ":mailbox_with_mail:": "📬",
    ":mailbox_with_no_mail:": "📭",
    ":man:": "👨",
    ":man_with_gua_pi_mao:": "👲",
    ":man_with_turban:": "👳",
    ":mans_shoe:": "👞",
    ":maple_leaf:": "🍁",
    ":mask:": "😷",
    ":massage:": "💆",
    ":meat_on_bone:": "🍖",
    ":mega:": "📣",
    ":melon:": "🍈",
    ":memo:": "📝",
    ":mens:": "🚹",
    ":metro:": "🚇",
    ":microphone:": "🎤",
    ":microscope:": "🔬",
    ":milky_way:": "🌌",
    ":minibus:": "🚐",
    ":minidisc:": "💽",
    ":mobile_phone_off:": "📴",
    ":money_with_wings:": "💸",
    ":moneybag:": "💰",
    ":monkey:": "🐒",
    ":monkey_face:": "🐵",
    ":monorail:": "🚝",
    ":moon:": "🌙",
    ":mortar_board:": "🎓",
    ":mount_fuji:": "🗻",
    ":mountain_bicyclist:": "🚵",
    ":mountain_cableway:": "🚠",
    ":mountain_railway:": "🚞",
    ":mouse:": "🐭",
    ":mouse2:": "🐁",
    ":movie_camera:": "🎥",
    ":moyai:": "🗿",
    ":muscle:": "💪",
    ":mushroom:": "🍄",
    ":musical_keyboard:": "🎹",
    ":musical_note:": "🎵",
    ":musical_score:": "🎼",
    ":mute:": "🔇",
    ":nail_care:": "💅",
    ":name_badge:": "📛",
    ":necktie:": "👔",
    ":neutral_face:": "😐",
    ":|": "😐",
    ":-|": "😐",
    ":new:": "🆕",
    ":new_moon:": "🌑",
    ":new_moon_with_face:": "🌚",
    ":newspaper:": "📰",
    ":ng:": "🆖",
    ":no_bell:": "🔕",
    ":no_bicycles:": "🚳",
    ":no_entry_sign:": "🚫",
    ":no_good:": "🙅",
    ":no_mobile_phones:": "📵",
    ":no_mouth:": "😶",
    ":no_pedestrians:": "🚷",
    ":no_smoking:": "🚭",
    ":non-potable_water:": "🚱",
    ":nose:": "👃",
    ":notebook:": "📓",
    ":notebook_with_decorative_cover:": "📔",
    ":notes:": "🎶",
    ":nut_and_bolt:": "🔩",
    ":o2:": "🅾",
    ":ocean:": "🌊",
    ":octopus:": "🐙",
    ":oden:": "🍢",
    ":office:": "🏢",
    ":ok:": "🆗",
    ":ok_hand:": "👌",
    ":ok_woman:": "🙆",
    ":older_man:": "👴",
    ":older_woman:": "👵",
    ":on:": "🔛",
    ":oncoming_automobile:": "🚘",
    ":oncoming_bus:": "🚍",
    ":oncoming_police_car:": "🚔",
    ":oncoming_taxi:": "🚖",
    ":open_book:": "📖",
    ":open_file_folder:": "📂",
    ":open_hands:": "👐",
    ":open_mouth:": "😮",
    ":O": "😮",
    ":-O": "😮",
    ":-o": "😮",
    ":o": "😮",
    ":orange_book:": "📙",
    ":outbox_tray:": "📤",
    ":ox:": "🐂",
    ":package:": "📦",
    ":page_facing_up:": "📄",
    ":page_with_curl:": "📃",
    ":pager:": "📟",
    ":palm_tree:": "🌴",
    ":panda_face:": "🐼",
    ":paperclip:": "📎",
    ":parking:": "🅿",
    ":passport_control:": "🛂",
    ":paw_prints:": "🐾",
    ":peach:": "🍑",
    ":pear:": "🍐",
    ":pencil:": "📝",
    ":penguin:": "🐧",
    ":pensive:": "😔",
    ":performing_arts:": "🎭",
    ":persevere:": "😣",
    ":person_frowning:": "🙍",
    ":person_with_blond_hair:": "👱",
    ":person_with_pouting_face:": "🙎",
    ":pig:": "🐷",
    ":pig2:": "🐖",
    ":pig_nose:": "🐽",
    ":pill:": "💊",
    ":pineapple:": "🍍",
    ":pizza:": "🍕",
    ":point_down:": "👇",
    ":point_left:": "👈",
    ":point_right:": "👉",
    ":point_up_2:": "👆",
    ":police_car:": "🚓",
    ":poodle:": "🐩",
    ":poop:": "💩",
    ":post_office:": "🏣",
    ":postal_horn:": "📯",
    ":postbox:": "📮",
    ":potable_water:": "🚰",
    ":pouch:": "👝",
    ":poultry_leg:": "🍗",
    ":pound:": "💷",
    ":pouting_cat:": "😾",
    ":pray:": "🙏",
    ":princess:": "👸",
    ":punch:": "👊",
    ":purple_heart:": "💜",
    ":purse:": "👛",
    ":pushpin:": "📌",
    ":put_litter_in_its_place:": "🚮",
    ":rabbit:": "🐰",
    ":rabbit2:": "🐇",
    ":racehorse:": "🐎",
    ":radio:": "📻",
    ":radio_button:": "🔘",
    ":rage:": "😡",
    ":railway_car:": "🚃",
    ":rainbow:": "🌈",
    ":raised_hands:": "🙌",
    ":raising_hand:": "🙋",
    ":ram:": "🐏",
    ":ramen:": "🍜",
    ":rat:": "🐀",
    ":red_car:": "🚗",
    ":red_circle:": "🔴",
    ":relieved:": "😌",
    ":repeat:": "🔁",
    ":repeat_one:": "🔂",
    ":restroom:": "🚻",
    ":revolving_hearts:": "💞",
    ":ribbon:": "🎀",
    ":rice:": "🍚",
    ":rice_ball:": "🍙",
    ":rice_cracker:": "🍘",
    ":rice_scene:": "🎑",
    ":ring:": "💍",
    ":rocket:": "🚀",
    ":roller_coaster:": "🎢",
    ":rooster:": "🐓",
    ":rose:": "🌹",
    ":rotating_light:": "🚨",
    ":round_pushpin:": "📍",
    ":rowboat:": "🚣",
    ":rugby_football:": "🏉",
    ":runner:": "🏃",
    ":running:": "🏃",
    ":running_shirt_with_sash:": "🎽",
    ":sa:": "🈂",
    ":sake:": "🍶",
    ":sandal:": "👡",
    ":santa:": "🎅",
    ":satellite:": "📡",
    ":satisfied:": "😆",
    ":saxophone:": "🎷",
    ":school:": "🏫",
    ":school_satchel:": "🎒",
    ":scream:": "😱",
    ":scream_cat:": "🙀",
    ":scroll:": "📜",
    ":seat:": "💺",
    ":see_no_evil:": "🙈",
    ":seedling:": "🌱",
    ":shaved_ice:": "🍧",
    ":sheep:": "🐑",
    ":shell:": "🐚",
    ":ship:": "🚢",
    ":shirt:": "👕",
    ":shit:": "💩",
    ":shoe:": "👞",
    ":shower:": "🚿",
    ":signal_strength:": "📶",
    ":six_pointed_star:": "🔯",
    ":ski:": "🎿",
    ":skull:": "💀",
    ":sleeping:": "😴",
    ":sleepy:": "😪",
    ":slot_machine:": "🎰",
    ":small_blue_diamond:": "🔹",
    ":small_orange_diamond:": "🔸",
    ":small_red_triangle:": "🔺",
    ":small_red_triangle_down:": "🔻",
    ":smile:": "😄",
    ":))": "😄",
    ":-))": "😄",
    ":smile_cat:": "😸",
    ":smiley:": "😃",
    ":-)": "😃",
    ":)": "😃",
    ":]": "😃",
    ":o)": "😃",
    ":smiley_cat:": "😺",
    ":smiling_imp:": "😈",
    "}:-)": "😈",
    "3:-)": "😈",
    "}:)": "😈",
    "3:)": "😈",
    ":smirk:": "😏",
    ":smirk_cat:": "😼",
    ":smoking:": "🚬",
    ":snail:": "🐌",
    ":snake:": "🐍",
    ":snowboarder:": "🏂",
    ":sob:": "😭",
    ":soon:": "🔜",
    ":sos:": "🆘",
    ":sound:": "🔉",
    ":space_invader:": "👾",
    ":spaghetti:": "🍝",
    ":sparkler:": "🎇",
    ":sparkling_heart:": "💖",
    ":speak_no_evil:": "🙊",
    ":speaker:": "🔊",
    ":speech_balloon:": "💬",
    ":speedboat:": "🚤",
    ":star2:": "🌟",
    ":stars:": "🌃",
    ":station:": "🚉",
    ":statue_of_liberty:": "🗽",
    ":steam_locomotive:": "🚂",
    ":stew:": "🍲",
    ":straight_ruler:": "📏",
    ":strawberry:": "🍓",
    ":stuck_out_tongue:": "😛",
    ":P": "😛",
    ":-P": "😛",
    ":-p": "😛",
    ":p": "😛",
    ":stuck_out_tongue_closed_eyes:": "😝",
    "XP": "😝",
    "X-P": "😝",
    "xP": "😝",
    "x-P": "😝",
    "Xp": "😝",
    "X-p": "😝",
    ":stuck_out_tongue_winking_eye:": "😜",
    ":sun_with_face:": "🌞",
    ":sunflower:": "🌻",
    ":sunglasses:": "😎",
    "8-)": "😎",
    "8)": "😎",
    ":sunrise:": "🌅",
    ":sunrise_over_mountains:": "🌄",
    ":surfer:": "🏄",
    ":sushi:": "🍣",
    ":suspension_railway:": "🚟",
    ":sweat:": "😓",
    ":sweat_drops:": "💦",
    ":sweat_smile:": "😅",
    ":sweet_potato:": "🍠",
    ":swimmer:": "🏊",
    ":symbols:": "🔣",
    ":syringe:": "💉",
    ":tada:": "🎉",
    ":tanabata_tree:": "🎋",
    ":tangerine:": "🍊",
    ":taxi:": "🚕",
    ":tea:": "🍵",
    ":telephone_receiver:": "📞",
    ":telescope:": "🔭",
    ":tennis:": "🎾",
    ":thought_balloon:": "💭",
    ":thumbsdown:": "👎",
    ":thumbsup:": "👍",
    ":ticket:": "🎫",
    ":tiger:": "🐯",
    ":tiger2:": "🐅",
    ":tired_face:": "😫",
    ":toilet:": "🚽",
    ":tokyo_tower:": "🗼",
    ":tomato:": "🍅",
    ":tongue:": "👅",
    ":top:": "🔝",
    ":tophat:": "🎩",
    ":tractor:": "🚜",
    ":traffic_light:": "🚥",
    ":train:": "🚃",
    ":train2:": "🚆",
    ":tram:": "🚊",
    ":triangular_flag_on_post:": "🚩",
    ":triangular_ruler:": "📐",
    ":trident:": "🔱",
    ":triumph:": "😤",
    ":trolleybus:": "🚎",
    ":trophy:": "🏆",
    ":tropical_drink:": "🍹",
    ":tropical_fish:": "🐠",
    ":truck:": "🚚",
    ":trumpet:": "🎺",
    ":tshirt:": "👕",
    ":tulip:": "🌷",
    ":turtle:": "🐢",
    ":tv:": "📺",
    ":twisted_rightwards_arrows:": "🔀",
    ":two_hearts:": "💕",
    ":two_men_holding_hands:": "👬",
    ":two_women_holding_hands:": "👭",
    ":u5272:": "🈹",
    ":u5408:": "🈴",
    ":u55b6:": "🈺",
    ":u6307:": "🈯",
    ":u6708:": "🈷",
    ":u6709:": "🈶",
    ":u6e80:": "🈵",
    ":u7121:": "🈚",
    ":u7533:": "🈸",
    ":u7981:": "🈲",
    ":u7a7a:": "🈳",
    ":unamused:": "😒",
    ":\\": "😒",
    ":-\\": "😒",
    ":-/": "😒",
    ":/": "😒",
    ":underage:": "🔞",
    ":unlock:": "🔓",
    ":up:": "🆙",
    ":vertical_traffic_light:": "🚦",
    ":vhs:": "📼",
    ":vibration_mode:": "📳",
    ":video_camera:": "📹",
    ":video_game:": "🎮",
    ":violin:": "🎻",
    ":volcano:": "🌋",
    ":vs:": "🆚",
    ":walking:": "🚶",
    ":waning_crescent_moon:": "🌘",
    ":waning_gibbous_moon:": "🌖",
    ":water_buffalo:": "🐃",
    ":watermelon:": "🍉",
    ":wave:": "👋",
    ":waxing_crescent_moon:": "🌒",
    ":waxing_gibbous_moon:": "🌔",
    ":wc:": "🚾",
    ":weary:": "😩",
    ":wedding:": "💒",
    ":whale:": "🐳",
    ":whale2:": "🐋",
    ":white_flower:": "💮",
    ":white_square_button:": "🔳",
    ":wind_chime:": "🎐",
    ":wine_glass:": "🍷",
    ":wink:": "😉",
    ";)": "😉",
    ";-)": "😉",
    ":wolf:": "🐺",
    ":woman:": "👩",
    ":womans_clothes:": "👚",
    ":womans_hat:": "👒",
    ":womens:": "🚺",
    ":worried:": "😟",
    ":wrench:": "🔧",
    ":yellow_heart:": "💛",
    ":yen:": "💴",
    ":yum:": "😋",
    ":zzz:": "💤"
};
},{}],69:[function(require,module,exports){
/* jshint node:true */
var emojiMap = require('./emoji-map.js');

module.exports = function (text) {
    if (typeof text !== "string") {
        return;
    }
    var emoji;
    var words = text.split(/[,. ]+/);
    words.forEach(function (word) {
        if (emojiMap.hasOwnProperty(word)) {
            emoji = emojiMap[word];
            text = text.replace(word, emoji);
        }
    });
    return text;
};
},{"./emoji-map.js":68}],70:[function(require,module,exports){
(function (global){
var location = global.location || {};
/*jslint indent: 2, browser: true, bitwise: true, plusplus: true */
var twemoji = (function (
  /*! Copyright Twitter Inc. and other contributors. Licensed under MIT *//*
    https://github.com/twitter/twemoji/blob/gh-pages/LICENSE
  */

  // WARNING:   this file is generated automatically via
  //            `node twemoji-generator.js`
  //            please update its `createTwemoji` function
  //            at the bottom of the same file instead.

) {
  'use strict';

  /*jshint maxparams:4 */

  var
    // the exported module object
    twemoji = {


    /////////////////////////
    //      properties     //
    /////////////////////////

      // default assets url, by default will be Twitter Inc. CDN
      base: (location.protocol === 'https:' ? 'https:' : 'http:') +
            '//twemoji.maxcdn.com/',

      // default assets file extensions, by default '.png'
      ext: '.png',

      // default assets/folder size, by default "36x36"
      // available via Twitter CDN: 16, 36, 72
      size: '36x36',

      // default class name, by default 'emoji'
      className: 'emoji',

      // basic utilities / helpers to convert code points
      // to JavaScript surrogates and vice versa
      convert: {

        /**
         * Given an HEX codepoint, returns UTF16 surrogate pairs.
         *
         * @param   string  generic codepoint, i.e. '1F4A9'
         * @return  string  codepoint transformed into utf16 surrogates pair,
         *          i.e. \uD83D\uDCA9
         *
         * @example
         *  twemoji.convert.fromCodePoint('1f1e8');
         *  // "\ud83c\udde8"
         *
         *  '1f1e8-1f1f3'.split('-').map(twemoji.convert.fromCodePoint).join('')
         *  // "\ud83c\udde8\ud83c\uddf3"
         */
        fromCodePoint: fromCodePoint,

        /**
         * Given UTF16 surrogate pairs, returns the equivalent HEX codepoint.
         *
         * @param   string  generic utf16 surrogates pair, i.e. \uD83D\uDCA9
         * @param   string  optional separator for double code points, default='-'
         * @return  string  utf16 transformed into codepoint, i.e. '1F4A9'
         *
         * @example
         *  twemoji.convert.toCodePoint('\ud83c\udde8\ud83c\uddf3');
         *  // "1f1e8-1f1f3"
         *
         *  twemoji.convert.toCodePoint('\ud83c\udde8\ud83c\uddf3', '~');
         *  // "1f1e8~1f1f3"
         */
        toCodePoint: toCodePoint
      },


    /////////////////////////
    //       methods       //
    /////////////////////////

      /**
       * User first: used to remove missing images
       * preserving the original text intent when
       * a fallback for network problems is desired.
       * Automatically added to Image nodes via DOM
       * It could be recycled for string operations via:
       *  $('img.emoji').on('error', twemoji.onerror)
       */
      onerror: function onerror() {
        if (this.parentNode) {
          this.parentNode.replaceChild(createText(this.alt), this);
        }
      },

      /**
       * Main method/logic to generate either <img> tags or HTMLImage nodes.
       *  "emojify" a generic text or DOM Element.
       *
       * @overloads
       *
       * String replacement for `innerHTML` or server side operations
       *  twemoji.parse(string);
       *  twemoji.parse(string, Function);
       *  twemoji.parse(string, Object);
       *
       * HTMLElement tree parsing for safer operations over existing DOM
       *  twemoji.parse(HTMLElement);
       *  twemoji.parse(HTMLElement, Function);
       *  twemoji.parse(HTMLElement, Object);
       *
       * @param   string|HTMLElement  the source to parse and enrich with emoji.
       *
       *          string              replace emoji matches with <img> tags.
       *                              Mainly used to inject emoji via `innerHTML`
       *                              It does **not** parse the string or validate it,
       *                              it simply replaces found emoji with a tag.
       *                              NOTE: be sure this won't affect security.
       *
       *          HTMLElement         walk through the DOM tree and find emoji
       *                              that are inside **text node only** (nodeType === 3)
       *                              Mainly used to put emoji in already generated DOM
       *                              without compromising surrounding nodes and
       *                              **avoiding** the usage of `innerHTML`.
       *                              NOTE: Using DOM elements instead of strings should
       *                              improve security without compromising too much
       *                              performance compared with a less safe `innerHTML`.
       *
       * @param   Function|Object  [optional]
       *                              either the callback that will be invoked or an object
       *                              with all properties to use per each found emoji.
       *
       *          Function            if specified, this will be invoked per each emoji
       *                              that has been found through the RegExp except
       *                              those follwed by the invariant \uFE0E ("as text").
       *                              Once invoked, parameters will be:
       *
       *                                codePoint:string  the lower case HEX code point
       *                                                  i.e. "1f4a9"
       *
       *                                options:Object    all info for this parsing operation
       *
       *                                variant:char      the optional \uFE0F ("as image")
       *                                                  variant, in case this info
       *                                                  is anyhow meaningful.
       *                                                  By default this is ignored.
       *
       *                              If such callback will return a falsy value instead
       *                              of a valid `src` to use for the image, nothing will
       *                              actually change for that specific emoji.
       *
       *
       *          Object              if specified, an object containing the following properties
       *
       *            callback   Function  the callback to invoke per each found emoji.
       *            base       string    the base url, by default twemoji.base
       *            ext        string    the image extension, by default twemoji.ext
       *            size       string    the assets size, by default twemoji.size
       *
       * @example
       *
       *  twemoji.parse("I \u2764\uFE0F emoji!");
       *  // I <img class="emoji" draggable="false" alt="❤️" src="/assets/2764.gif"> emoji!
       *
       *
       *  twemoji.parse("I \u2764\uFE0F emoji!", function(icon, options, variant) {
       *    return '/assets/' + icon + '.gif';
       *  });
       *  // I <img class="emoji" draggable="false" alt="❤️" src="/assets/2764.gif"> emoji!
       *
       *
       * twemoji.parse("I \u2764\uFE0F emoji!", {
       *   size: 72,
       *   callback: function(icon, options, variant) {
       *     return '/assets/' + options.size + '/' + icon + options.ext;
       *   }
       * });
       *  // I <img class="emoji" draggable="false" alt="❤️" src="/assets/72x72/2764.png"> emoji!
       *
       */
      parse: parse,

      /**
       * Given a string, invokes the callback argument
       *  per each emoji found in such string.
       * This is the most raw version used by
       *  the .parse(string) method itself.
       *
       * @param   string    generic string to parse
       * @param   Function  a generic callback that will be
       *                    invoked to replace the content.
       *                    This calback wil receive standard
       *                    String.prototype.replace(str, callback)
       *                    arguments such:
       *  callback(
       *    match,  // the emoji match
       *    icon,   // the emoji text (same as text)
       *    variant // either '\uFE0E' or '\uFE0F', if present
       *  );
       *
       *                    and others commonly received via replace.
       *
       *  NOTE: When the variant \uFE0E is found, remember this is an explicit intent
       *  from the user: the emoji should **not** be replaced with an image.
       *  In \uFE0F case one, it's the opposite, it should be graphic.
       *  This utility convetion is that only \uFE0E are not translated into images.
       */
      replace: replace,

      /**
       * Simplify string tests against emoji.
       *
       * @param   string  some text that might contain emoji
       * @return  boolean true if any emoji was found, false otherwise.
       *
       * @example
       *
       *  if (twemoji.test(someContent)) {
       *    console.log("emoji All The Things!");
       *  }
       */
      test: test
    },

    // used to escape HTML special chars in attributes
    escaper = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    },

    // RegExp based on emoji's official Unicode standards
    // http://www.unicode.org/Public/UNIDATA/EmojiSources.txt
    re = /((?:\ud83c\udde8\ud83c\uddf3|\ud83c\uddfa\ud83c\uddf8|\ud83c\uddf7\ud83c\uddfa|\ud83c\uddf0\ud83c\uddf7|\ud83c\uddef\ud83c\uddf5|\ud83c\uddee\ud83c\uddf9|\ud83c\uddec\ud83c\udde7|\ud83c\uddeb\ud83c\uddf7|\ud83c\uddea\ud83c\uddf8|\ud83c\udde9\ud83c\uddea|\u0039\ufe0f?\u20e3|\u0038\ufe0f?\u20e3|\u0037\ufe0f?\u20e3|\u0036\ufe0f?\u20e3|\u0035\ufe0f?\u20e3|\u0034\ufe0f?\u20e3|\u0033\ufe0f?\u20e3|\u0032\ufe0f?\u20e3|\u0031\ufe0f?\u20e3|\u0030\ufe0f?\u20e3|\u0023\ufe0f?\u20e3|\ud83d\udeb3|\ud83d\udeb1|\ud83d\udeb0|\ud83d\udeaf|\ud83d\udeae|\ud83d\udea6|\ud83d\udea3|\ud83d\udea1|\ud83d\udea0|\ud83d\ude9f|\ud83d\ude9e|\ud83d\ude9d|\ud83d\ude9c|\ud83d\ude9b|\ud83d\ude98|\ud83d\ude96|\ud83d\ude94|\ud83d\ude90|\ud83d\ude8e|\ud83d\ude8d|\ud83d\ude8b|\ud83d\ude8a|\ud83d\ude88|\ud83d\ude86|\ud83d\ude82|\ud83d\ude81|\ud83d\ude36|\ud83d\ude34|\ud83d\ude2f|\ud83d\ude2e|\ud83d\ude2c|\ud83d\ude27|\ud83d\ude26|\ud83d\ude1f|\ud83d\ude1b|\ud83d\ude19|\ud83d\ude17|\ud83d\ude15|\ud83d\ude11|\ud83d\ude10|\ud83d\ude0e|\ud83d\ude08|\ud83d\ude07|\ud83d\ude00|\ud83d\udd67|\ud83d\udd66|\ud83d\udd65|\ud83d\udd64|\ud83d\udd63|\ud83d\udd62|\ud83d\udd61|\ud83d\udd60|\ud83d\udd5f|\ud83d\udd5e|\ud83d\udd5d|\ud83d\udd5c|\ud83d\udd2d|\ud83d\udd2c|\ud83d\udd15|\ud83d\udd09|\ud83d\udd08|\ud83d\udd07|\ud83d\udd06|\ud83d\udd05|\ud83d\udd04|\ud83d\udd02|\ud83d\udd01|\ud83d\udd00|\ud83d\udcf5|\ud83d\udcef|\ud83d\udced|\ud83d\udcec|\ud83d\udcb7|\ud83d\udcb6|\ud83d\udcad|\ud83d\udc6d|\ud83d\udc6c|\ud83d\udc65|\ud83d\udc2a|\ud83d\udc16|\ud83d\udc15|\ud83d\udc13|\ud83d\udc10|\ud83d\udc0f|\ud83d\udc0b|\ud83d\udc0a|\ud83d\udc09|\ud83d\udc08|\ud83d\udc07|\ud83d\udc06|\ud83d\udc05|\ud83d\udc04|\ud83d\udc03|\ud83d\udc02|\ud83d\udc01|\ud83d\udc00|\ud83c\udfe4|\ud83c\udfc9|\ud83c\udfc7|\ud83c\udf7c|\ud83c\udf50|\ud83c\udf4b|\ud83c\udf33|\ud83c\udf32|\ud83c\udf1e|\ud83c\udf1d|\ud83c\udf1c|\ud83c\udf1a|\ud83c\udf18|\ud83c\udccf|\ud83c\udd70|\ud83c\udd71|\ud83c\udd7e|\ud83c\udd8e|\ud83c\udd91|\ud83c\udd92|\ud83c\udd93|\ud83c\udd94|\ud83c\udd95|\ud83c\udd96|\ud83c\udd97|\ud83c\udd98|\ud83c\udd99|\ud83c\udd9a|\ud83d\udc77|\ud83d\udec5|\ud83d\udec4|\ud83d\udec3|\ud83d\udec2|\ud83d\udec1|\ud83d\udebf|\ud83d\udeb8|\ud83d\udeb7|\ud83d\udeb5|\ud83c\ude01|\ud83c\ude02|\ud83c\ude32|\ud83c\ude33|\ud83c\ude34|\ud83c\ude35|\ud83c\ude36|\ud83c\ude37|\ud83c\ude38|\ud83c\ude39|\ud83c\ude3a|\ud83c\ude50|\ud83c\ude51|\ud83c\udf00|\ud83c\udf01|\ud83c\udf02|\ud83c\udf03|\ud83c\udf04|\ud83c\udf05|\ud83c\udf06|\ud83c\udf07|\ud83c\udf08|\ud83c\udf09|\ud83c\udf0a|\ud83c\udf0b|\ud83c\udf0c|\ud83c\udf0f|\ud83c\udf11|\ud83c\udf13|\ud83c\udf14|\ud83c\udf15|\ud83c\udf19|\ud83c\udf1b|\ud83c\udf1f|\ud83c\udf20|\ud83c\udf30|\ud83c\udf31|\ud83c\udf34|\ud83c\udf35|\ud83c\udf37|\ud83c\udf38|\ud83c\udf39|\ud83c\udf3a|\ud83c\udf3b|\ud83c\udf3c|\ud83c\udf3d|\ud83c\udf3e|\ud83c\udf3f|\ud83c\udf40|\ud83c\udf41|\ud83c\udf42|\ud83c\udf43|\ud83c\udf44|\ud83c\udf45|\ud83c\udf46|\ud83c\udf47|\ud83c\udf48|\ud83c\udf49|\ud83c\udf4a|\ud83c\udf4c|\ud83c\udf4d|\ud83c\udf4e|\ud83c\udf4f|\ud83c\udf51|\ud83c\udf52|\ud83c\udf53|\ud83c\udf54|\ud83c\udf55|\ud83c\udf56|\ud83c\udf57|\ud83c\udf58|\ud83c\udf59|\ud83c\udf5a|\ud83c\udf5b|\ud83c\udf5c|\ud83c\udf5d|\ud83c\udf5e|\ud83c\udf5f|\ud83c\udf60|\ud83c\udf61|\ud83c\udf62|\ud83c\udf63|\ud83c\udf64|\ud83c\udf65|\ud83c\udf66|\ud83c\udf67|\ud83c\udf68|\ud83c\udf69|\ud83c\udf6a|\ud83c\udf6b|\ud83c\udf6c|\ud83c\udf6d|\ud83c\udf6e|\ud83c\udf6f|\ud83c\udf70|\ud83c\udf71|\ud83c\udf72|\ud83c\udf73|\ud83c\udf74|\ud83c\udf75|\ud83c\udf76|\ud83c\udf77|\ud83c\udf78|\ud83c\udf79|\ud83c\udf7a|\ud83c\udf7b|\ud83c\udf80|\ud83c\udf81|\ud83c\udf82|\ud83c\udf83|\ud83c\udf84|\ud83c\udf85|\ud83c\udf86|\ud83c\udf87|\ud83c\udf88|\ud83c\udf89|\ud83c\udf8a|\ud83c\udf8b|\ud83c\udf8c|\ud83c\udf8d|\ud83c\udf8e|\ud83c\udf8f|\ud83c\udf90|\ud83c\udf91|\ud83c\udf92|\ud83c\udf93|\ud83c\udfa0|\ud83c\udfa1|\ud83c\udfa2|\ud83c\udfa3|\ud83c\udfa4|\ud83c\udfa5|\ud83c\udfa6|\ud83c\udfa7|\ud83c\udfa8|\ud83c\udfa9|\ud83c\udfaa|\ud83c\udfab|\ud83c\udfac|\ud83c\udfad|\ud83c\udfae|\ud83c\udfaf|\ud83c\udfb0|\ud83c\udfb1|\ud83c\udfb2|\ud83c\udfb3|\ud83c\udfb4|\ud83c\udfb5|\ud83c\udfb6|\ud83c\udfb7|\ud83c\udfb8|\ud83c\udfb9|\ud83c\udfba|\ud83c\udfbb|\ud83c\udfbc|\ud83c\udfbd|\ud83c\udfbe|\ud83c\udfbf|\ud83c\udfc0|\ud83c\udfc1|\ud83c\udfc2|\ud83c\udfc3|\ud83c\udfc4|\ud83c\udfc6|\ud83c\udfc8|\ud83c\udfca|\ud83c\udfe0|\ud83c\udfe1|\ud83c\udfe2|\ud83c\udfe3|\ud83c\udfe5|\ud83c\udfe6|\ud83c\udfe7|\ud83c\udfe8|\ud83c\udfe9|\ud83c\udfea|\ud83c\udfeb|\ud83c\udfec|\ud83c\udfed|\ud83c\udfee|\ud83c\udfef|\ud83c\udff0|\ud83d\udc0c|\ud83d\udc0d|\ud83d\udc0e|\ud83d\udc11|\ud83d\udc12|\ud83d\udc14|\ud83d\udc17|\ud83d\udc18|\ud83d\udc19|\ud83d\udc1a|\ud83d\udc1b|\ud83d\udc1c|\ud83d\udc1d|\ud83d\udc1e|\ud83d\udc1f|\ud83d\udc20|\ud83d\udc21|\ud83d\udc22|\ud83d\udc23|\ud83d\udc24|\ud83d\udc25|\ud83d\udc26|\ud83d\udc27|\ud83d\udc28|\ud83d\udc29|\ud83d\udc2b|\ud83d\udc2c|\ud83d\udc2d|\ud83d\udc2e|\ud83d\udc2f|\ud83d\udc30|\ud83d\udc31|\ud83d\udc32|\ud83d\udc33|\ud83d\udc34|\ud83d\udc35|\ud83d\udc36|\ud83d\udc37|\ud83d\udc38|\ud83d\udc39|\ud83d\udc3a|\ud83d\udc3b|\ud83d\udc3c|\ud83d\udc3d|\ud83d\udc3e|\ud83d\udc40|\ud83d\udc42|\ud83d\udc43|\ud83d\udc44|\ud83d\udc45|\ud83d\udc46|\ud83d\udc47|\ud83d\udc48|\ud83d\udc49|\ud83d\udc4a|\ud83d\udc4b|\ud83d\udc4c|\ud83d\udc4d|\ud83d\udc4e|\ud83d\udc4f|\ud83d\udc50|\ud83d\udc51|\ud83d\udc52|\ud83d\udc53|\ud83d\udc54|\ud83d\udc55|\ud83d\udc56|\ud83d\udc57|\ud83d\udc58|\ud83d\udc59|\ud83d\udc5a|\ud83d\udc5b|\ud83d\udc5c|\ud83d\udc5d|\ud83d\udc5e|\ud83d\udc5f|\ud83d\udc60|\ud83d\udc61|\ud83d\udc62|\ud83d\udc63|\ud83d\udc64|\ud83d\udc66|\ud83d\udc67|\ud83d\udc68|\ud83d\udc69|\ud83d\udc6a|\ud83d\udc6b|\ud83d\udc6e|\ud83d\udc6f|\ud83d\udc70|\ud83d\udc71|\ud83d\udc72|\ud83d\udc73|\ud83d\udc74|\ud83d\udc75|\ud83d\udc76|\ud83d\udeb4|\ud83d\udc78|\ud83d\udc79|\ud83d\udc7a|\ud83d\udc7b|\ud83d\udc7c|\ud83d\udc7d|\ud83d\udc7e|\ud83d\udc7f|\ud83d\udc80|\ud83d\udc81|\ud83d\udc82|\ud83d\udc83|\ud83d\udc84|\ud83d\udc85|\ud83d\udc86|\ud83d\udc87|\ud83d\udc88|\ud83d\udc89|\ud83d\udc8a|\ud83d\udc8b|\ud83d\udc8c|\ud83d\udc8d|\ud83d\udc8e|\ud83d\udc8f|\ud83d\udc90|\ud83d\udc91|\ud83d\udc92|\ud83d\udc93|\ud83d\udc94|\ud83d\udc95|\ud83d\udc96|\ud83d\udc97|\ud83d\udc98|\ud83d\udc99|\ud83d\udc9a|\ud83d\udc9b|\ud83d\udc9c|\ud83d\udc9d|\ud83d\udc9e|\ud83d\udc9f|\ud83d\udca0|\ud83d\udca1|\ud83d\udca2|\ud83d\udca3|\ud83d\udca4|\ud83d\udca5|\ud83d\udca6|\ud83d\udca7|\ud83d\udca8|\ud83d\udca9|\ud83d\udcaa|\ud83d\udcab|\ud83d\udcac|\ud83d\udcae|\ud83d\udcaf|\ud83d\udcb0|\ud83d\udcb1|\ud83d\udcb2|\ud83d\udcb3|\ud83d\udcb4|\ud83d\udcb5|\ud83d\udcb8|\ud83d\udcb9|\ud83d\udcba|\ud83d\udcbb|\ud83d\udcbc|\ud83d\udcbd|\ud83d\udcbe|\ud83d\udcbf|\ud83d\udcc0|\ud83d\udcc1|\ud83d\udcc2|\ud83d\udcc3|\ud83d\udcc4|\ud83d\udcc5|\ud83d\udcc6|\ud83d\udcc7|\ud83d\udcc8|\ud83d\udcc9|\ud83d\udcca|\ud83d\udccb|\ud83d\udccc|\ud83d\udccd|\ud83d\udcce|\ud83d\udccf|\ud83d\udcd0|\ud83d\udcd1|\ud83d\udcd2|\ud83d\udcd3|\ud83d\udcd4|\ud83d\udcd5|\ud83d\udcd6|\ud83d\udcd7|\ud83d\udcd8|\ud83d\udcd9|\ud83d\udcda|\ud83d\udcdb|\ud83d\udcdc|\ud83d\udcdd|\ud83d\udcde|\ud83d\udcdf|\ud83d\udce0|\ud83d\udce1|\ud83d\udce2|\ud83d\udce3|\ud83d\udce4|\ud83d\udce5|\ud83d\udce6|\ud83d\udce7|\ud83d\udce8|\ud83d\udce9|\ud83d\udcea|\ud83d\udceb|\ud83d\udcee|\ud83d\udcf0|\ud83d\udcf1|\ud83d\udcf2|\ud83d\udcf3|\ud83d\udcf4|\ud83d\udcf6|\ud83d\udcf7|\ud83d\udcf9|\ud83d\udcfa|\ud83d\udcfb|\ud83d\udcfc|\ud83d\udd03|\ud83d\udd0a|\ud83d\udd0b|\ud83d\udd0c|\ud83d\udd0d|\ud83d\udd0e|\ud83d\udd0f|\ud83d\udd10|\ud83d\udd11|\ud83d\udd12|\ud83d\udd13|\ud83d\udd14|\ud83d\udd16|\ud83d\udd17|\ud83d\udd18|\ud83d\udd19|\ud83d\udd1a|\ud83d\udd1b|\ud83d\udd1c|\ud83d\udd1d|\ud83d\udd1e|\ud83d\udd1f|\ud83d\udd20|\ud83d\udd21|\ud83d\udd22|\ud83d\udd23|\ud83d\udd24|\ud83d\udd25|\ud83d\udd26|\ud83d\udd27|\ud83d\udd28|\ud83d\udd29|\ud83d\udd2a|\ud83d\udd2b|\ud83d\udd2e|\ud83d\udd2f|\ud83d\udd30|\ud83d\udd31|\ud83d\udd32|\ud83d\udd33|\ud83d\udd34|\ud83d\udd35|\ud83d\udd36|\ud83d\udd37|\ud83d\udd38|\ud83d\udd39|\ud83d\udd3a|\ud83d\udd3b|\ud83d\udd3c|\ud83d\udd3d|\ud83d\udd50|\ud83d\udd51|\ud83d\udd52|\ud83d\udd53|\ud83d\udd54|\ud83d\udd55|\ud83d\udd56|\ud83d\udd57|\ud83d\udd58|\ud83d\udd59|\ud83d\udd5a|\ud83d\udd5b|\ud83d\uddfb|\ud83d\uddfc|\ud83d\uddfd|\ud83d\uddfe|\ud83d\uddff|\ud83d\ude01|\ud83d\ude02|\ud83d\ude03|\ud83d\ude04|\ud83d\ude05|\ud83d\ude06|\ud83d\ude09|\ud83d\ude0a|\ud83d\ude0b|\ud83d\ude0c|\ud83d\ude0d|\ud83d\ude0f|\ud83d\ude12|\ud83d\ude13|\ud83d\ude14|\ud83d\ude16|\ud83d\ude18|\ud83d\ude1a|\ud83d\ude1c|\ud83d\ude1d|\ud83d\ude1e|\ud83d\ude20|\ud83d\ude21|\ud83d\ude22|\ud83d\ude23|\ud83d\ude24|\ud83d\ude25|\ud83d\ude28|\ud83d\ude29|\ud83d\ude2a|\ud83d\ude2b|\ud83d\ude2d|\ud83d\ude30|\ud83d\ude31|\ud83d\ude32|\ud83d\ude33|\ud83d\ude35|\ud83d\ude37|\ud83d\ude38|\ud83d\ude39|\ud83d\ude3a|\ud83d\ude3b|\ud83d\ude3c|\ud83d\ude3d|\ud83d\ude3e|\ud83d\ude3f|\ud83d\ude40|\ud83d\ude45|\ud83d\ude46|\ud83d\ude47|\ud83d\ude48|\ud83d\ude49|\ud83d\ude4a|\ud83d\ude4b|\ud83d\ude4c|\ud83d\ude4d|\ud83d\ude4e|\ud83d\ude4f|\ud83d\ude80|\ud83d\ude83|\ud83d\ude84|\ud83d\ude85|\ud83d\ude87|\ud83d\ude89|\ud83d\ude8c|\ud83d\ude8f|\ud83d\ude91|\ud83d\ude92|\ud83d\ude93|\ud83d\ude95|\ud83d\ude97|\ud83d\ude99|\ud83d\ude9a|\ud83d\udea2|\ud83d\udea4|\ud83d\udea5|\ud83d\udea7|\ud83d\udea8|\ud83d\udea9|\ud83d\udeaa|\ud83d\udeab|\ud83d\udeac|\ud83d\udead|\ud83d\udeb2|\ud83d\udeb6|\ud83d\udeb9|\ud83d\udeba|\ud83d\udebb|\ud83d\udebc|\ud83d\udebd|\ud83d\udebe|\ud83d\udec0|\ud83c\udde6|\ud83c\udde7|\ud83c\udde8|\ud83c\udde9|\ud83c\uddea|\ud83c\uddeb|\ud83c\uddec|\ud83c\udded|\ud83c\uddee|\ud83c\uddef|\ud83c\uddf0|\ud83c\uddf1|\ud83c\uddf2|\ud83c\uddf3|\ud83c\uddf4|\ud83c\uddf5|\ud83c\uddf6|\ud83c\uddf7|\ud83c\uddf8|\ud83c\uddf9|\ud83c\uddfa|\ud83c\uddfb|\ud83c\uddfc|\ud83c\uddfd|\ud83c\uddfe|\ud83c\uddff|\ud83c\udf0d|\ud83c\udf0e|\ud83c\udf10|\ud83c\udf12|\ud83c\udf16|\ud83c\udf17|\ue50a|\u3030|\u27b0|\u2797|\u2796|\u2795|\u2755|\u2754|\u2753|\u274e|\u274c|\u2728|\u270b|\u270a|\u2705|\u26ce|\u23f3|\u23f0|\u23ec|\u23eb|\u23ea|\u23e9|\u2122|\u27bf|\u00a9|\u00ae)|(?:(?:\ud83c\udc04|\ud83c\udd7f|\ud83c\ude1a|\ud83c\ude2f|\u3299|\u303d|\u2b55|\u2b50|\u2b1c|\u2b1b|\u2b07|\u2b06|\u2b05|\u2935|\u2934|\u27a1|\u2764|\u2757|\u2747|\u2744|\u2734|\u2733|\u2716|\u2714|\u2712|\u270f|\u270c|\u2709|\u2708|\u2702|\u26fd|\u26fa|\u26f5|\u26f3|\u26f2|\u26ea|\u26d4|\u26c5|\u26c4|\u26be|\u26bd|\u26ab|\u26aa|\u26a1|\u26a0|\u2693|\u267f|\u267b|\u3297|\u2666|\u2665|\u2663|\u2660|\u2653|\u2652|\u2651|\u2650|\u264f|\u264e|\u264d|\u264c|\u264b|\u264a|\u2649|\u2648|\u263a|\u261d|\u2615|\u2614|\u2611|\u260e|\u2601|\u2600|\u25fe|\u25fd|\u25fc|\u25fb|\u25c0|\u25b6|\u25ab|\u25aa|\u24c2|\u231b|\u231a|\u21aa|\u21a9|\u2199|\u2198|\u2197|\u2196|\u2195|\u2194|\u2139|\u2049|\u203c|\u2668)([\uFE0E\uFE0F]?)))/g,

    // used to find HTML special chars in attributes
    rescaper = /[&<>'"]/g,

    // nodes with type 1 which should **not** be parsed
    shouldntBeParsed = /IFRAME|NOFRAMES|NOSCRIPT|SCRIPT|SELECT|STYLE|TEXTAREA/,

    // just a private shortcut
    fromCharCode = String.fromCharCode;

  return twemoji;


  /////////////////////////
  //  private functions  //
  //     declaration     //
  /////////////////////////

  /**
   * Shortcut to create text nodes
   * @param   string  text used to create DOM text node
   * @return  Node  a DOM node with that text
   */
  function createText(text) {
    return document.createTextNode(text);
  }

  /**
   * Utility function to escape html attribute text
   * @param   string  text use in HTML attribute
   * @return  string  text encoded to use in HTML attribute
   */
  function escapeHTML(s) {
    return s.replace(rescaper, replacer);
  }

  /**
   * Default callback used to generate emoji src
   *  based on Twitter CDN
   * @param   string    the emoji codepoint string
   * @param   string    the default size to use, i.e. "36x36"
   * @param   string    optional "\uFE0F" variant char, ignored by default
   * @return  string    the image source to use
   */
  function defaultImageSrcGenerator(icon, options) {
    return ''.concat(options.base, options.size, '/', icon, options.ext);
  }

  /**
   * Given a generic DOM nodeType 1, walk through all children
   * and store every nodeType 3 (#text) found in the tree.
   * @param   Element a DOM Element with probably some text in it
   * @param   Array the list of previously discovered text nodes
   * @return  Array same list with new discovered nodes, if any
   */
  function grabAllTextNodes(node, allText) {
    var
      childNodes = node.childNodes,
      length = childNodes.length,
      subnode,
      nodeType;
    while (length--) {
      subnode = childNodes[length];
      nodeType = subnode.nodeType;
      // parse emoji only in text nodes
      if (nodeType === 3) {
        // collect them to process emoji later
        allText.push(subnode);
      }
      // ignore all nodes that are not type 1 or that
      // should not be parsed as script, style, and others
      else if (nodeType === 1 && !shouldntBeParsed.test(subnode.nodeName)) {
        grabAllTextNodes(subnode, allText);
      }
    }
    return allText;
  }

  /**
   * Used to both remove the possible variant
   *  and to convert utf16 into code points
   * @param   string    the emoji surrogate pair
   * @param   string    the optional variant char, if any
   */
  function grabTheRightIcon(icon, variant) {
    // if variant is present as \uFE0F
    return toCodePoint(
      variant === '\uFE0F' ?
        // the icon should not contain it
        icon.slice(0, -1) :
        // fix non standard OSX behavior
        (icon.length === 3 && icon.charAt(1) === '\uFE0F' ?
          icon.charAt(0) + icon.charAt(2) : icon)
    );
  }

  /**
   * DOM version of the same logic / parser:
   *  emojify all found sub-text nodes placing images node instead.
   * @param   Element   generic DOM node with some text in some child node
   * @param   Object    options  containing info about how to parse
    *
    *            .callback   Function  the callback to invoke per each found emoji.
    *            .base       string    the base url, by default twemoji.base
    *            .ext        string    the image extension, by default twemoji.ext
    *            .size       string    the assets size, by default twemoji.size
    *
   * @return  Element same generic node with emoji in place, if any.
   */
  function parseNode(node, options) {
    var
      allText = grabAllTextNodes(node, []),
      length = allText.length,
      attrib,
      attrname,
      modified,
      fragment,
      subnode,
      text,
      match,
      i,
      index,
      img,
      alt,
      icon,
      variant,
      src;
    while (length--) {
      modified = false;
      fragment = document.createDocumentFragment();
      subnode = allText[length];
      text = subnode.nodeValue;
      i = 0;
      while ((match = re.exec(text))) {
        index = match.index;
        if (index !== i) {
          fragment.appendChild(
            createText(text.slice(i, index))
          );
        }
        alt = match[0];
        icon = match[1];
        variant = match[2];
        i = index + alt.length;
        if (variant !== '\uFE0E') {
          src = options.callback(
            grabTheRightIcon(icon, variant),
            options,
            variant
          );
          if (src) {
            img = new Image();
            img.onerror = twemoji.onerror;
            img.setAttribute('draggable', 'false');
            attrib = options.attributes(icon, variant);
            for (attrname in attrib) {
              if (
                attrib.hasOwnProperty(attrname) &&
                // don't allow any handlers to be set + don't allow overrides
                attrname.indexOf('on') !== 0 &&
                !img.hasAttribute(attrname)
              ) {
                img.setAttribute(attrname, attrib[attrname]);
              }
            }
            img.className = options.className;
            img.alt = alt;
            img.src = src;
            modified = true;
            fragment.appendChild(img);
          }
        }
        if (!img) fragment.appendChild(createText(alt));
        img = null;
      }
      // is there actually anything to replace in here ?
      if (modified) {
        // any text left to be added ?
        if (i < text.length) {
          fragment.appendChild(
            createText(text.slice(i))
          );
        }
        // replace the text node only, leave intact
        // anything else surrounding such text
        subnode.parentNode.replaceChild(fragment, subnode);
      }
    }
    return node;
  }

  /**
   * String/HTML version of the same logic / parser:
   *  emojify a generic text placing images tags instead of surrogates pair.
   * @param   string    generic string with possibly some emoji in it
   * @param   Object    options  containing info about how to parse
   *
   *            .callback   Function  the callback to invoke per each found emoji.
   *            .base       string    the base url, by default twemoji.base
   *            .ext        string    the image extension, by default twemoji.ext
   *            .size       string    the assets size, by default twemoji.size
   *
   * @return  the string with <img tags> replacing all found and parsed emoji
   */
  function parseString(str, options) {
    return replace(str, function (match, icon, variant) {
      var
        ret = match,
        attrib,
        attrname,
        src;
      // verify the variant is not the FE0E one
      // this variant means "emoji as text" and should not
      // require any action/replacement
      // http://unicode.org/Public/UNIDATA/StandardizedVariants.html
      if (variant !== '\uFE0E') {
        src = options.callback(
          grabTheRightIcon(icon, variant),
          options,
          variant
        );
        if (src) {
          // recycle the match string replacing the emoji
          // with its image counter part
          ret = '<img '.concat(
            'class="', options.className, '" ',
            'draggable="false" ',
            // needs to preserve user original intent
            // when variants should be copied and pasted too
            'alt="',
            match,
            '"',
            ' src="',
            src,
            '"'
          );
          attrib = options.attributes(icon, variant);
          for (attrname in attrib) {
            if (
              attrib.hasOwnProperty(attrname) &&
              // don't allow any handlers to be set + don't allow overrides
              attrname.indexOf('on') !== 0 &&
              ret.indexOf(' ' + attrname + '=') === -1
            ) {
              ret = ret.concat(' ', attrname, '="', escapeHTML(attrib[attrname]), '"');
            }
          }
          ret = ret.concat('>');
        }
      }
      return ret;
    });
  }

  /**
   * Function used to actually replace HTML special chars
   * @param   string  HTML special char
   * @return  string  encoded HTML special char
   */
  function replacer(m) {
    return escaper[m];
  }

  /**
   * Default options.attribute callback
   * @return  null
   */
  function returnNull() {
    return null;
  }

  /**
   * Given a generic value, creates its squared counterpart if it's a number.
   *  As example, number 36 will return '36x36'.
   * @param   any     a generic value.
   * @return  any     a string representing asset size, i.e. "36x36"
   *                  only in case the value was a number.
   *                  Returns initial value otherwise.
   */
  function toSizeSquaredAsset(value) {
    return typeof value === 'number' ?
      value + 'x' + value :
      value;
  }


  /////////////////////////
  //  exported functions //
  //     declaration     //
  /////////////////////////

  function fromCodePoint(codepoint) {
    var code = typeof codepoint === 'string' ?
          parseInt(codepoint, 16) : codepoint;
    if (code < 0x10000) {
      return fromCharCode(code);
    }
    code -= 0x10000;
    return fromCharCode(
      0xD800 + (code >> 10),
      0xDC00 + (code & 0x3FF)
    );
  }

  function parse(what, how) {
    if (!how || typeof how === 'function') {
      how = {callback: how};
    }
    // if first argument is string, inject html <img> tags
    // otherwise use the DOM tree and parse text nodes only
    return (typeof what === 'string' ? parseString : parseNode)(what, {
      callback:   how.callback || defaultImageSrcGenerator,
      attributes: typeof how.attributes === 'function' ? how.attributes : returnNull,
      base:       typeof how.base === 'string' ? how.base : twemoji.base,
      ext:        how.ext || twemoji.ext,
      size:       how.folder || toSizeSquaredAsset(how.size || twemoji.size),
      className:  how.className || twemoji.className
    });
  }

  function replace(text, callback) {
    return String(text).replace(re, callback);
  }

  function test(text) {
    // IE6 needs a reset before too
    re.lastIndex = 0;
    var result = re.test(text);
    re.lastIndex = 0;
    return result;
  }

  function toCodePoint(unicodeSurrogates, sep) {
    var
      r = [],
      c = 0,
      p = 0,
      i = 0;
    while (i < unicodeSurrogates.length) {
      c = unicodeSurrogates.charCodeAt(i++);
      if (p) {
        r.push((0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00)).toString(16));
        p = 0;
      } else if (0xD800 <= c && c <= 0xDBFF) {
        p = c;
      } else {
        r.push(c.toString(16));
      }
    }
    return r.join(sep || '-');
  }

}());
if (!location.protocol) {
  twemoji.base = twemoji.base.replace(/^http:/, "");
}
module.exports = twemoji;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],71:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// @version 0.7.24
(function() {
  window.WebComponents = window.WebComponents || {
    flags: {}
  };
  var file = "webcomponents-lite.js";
  var script = document.querySelector('script[src*="' + file + '"]');
  var flags = {};
  if (!flags.noOpts) {
    location.search.slice(1).split("&").forEach(function(option) {
      var parts = option.split("=");
      var match;
      if (parts[0] && (match = parts[0].match(/wc-(.+)/))) {
        flags[match[1]] = parts[1] || true;
      }
    });
    if (script) {
      for (var i = 0, a; a = script.attributes[i]; i++) {
        if (a.name !== "src") {
          flags[a.name] = a.value || true;
        }
      }
    }
    if (flags.log && flags.log.split) {
      var parts = flags.log.split(",");
      flags.log = {};
      parts.forEach(function(f) {
        flags.log[f] = true;
      });
    } else {
      flags.log = {};
    }
  }
  if (flags.register) {
    window.CustomElements = window.CustomElements || {
      flags: {}
    };
    window.CustomElements.flags.register = flags.register;
  }
  WebComponents.flags = flags;
})();

(function(scope) {
  "use strict";
  var hasWorkingUrl = false;
  if (!scope.forceJURL) {
    try {
      var u = new URL("b", "http://a");
      u.pathname = "c%20d";
      hasWorkingUrl = u.href === "http://a/c%20d";
    } catch (e) {}
  }
  if (hasWorkingUrl) return;
  var relative = Object.create(null);
  relative["ftp"] = 21;
  relative["file"] = 0;
  relative["gopher"] = 70;
  relative["http"] = 80;
  relative["https"] = 443;
  relative["ws"] = 80;
  relative["wss"] = 443;
  var relativePathDotMapping = Object.create(null);
  relativePathDotMapping["%2e"] = ".";
  relativePathDotMapping[".%2e"] = "..";
  relativePathDotMapping["%2e."] = "..";
  relativePathDotMapping["%2e%2e"] = "..";
  function isRelativeScheme(scheme) {
    return relative[scheme] !== undefined;
  }
  function invalid() {
    clear.call(this);
    this._isInvalid = true;
  }
  function IDNAToASCII(h) {
    if ("" == h) {
      invalid.call(this);
    }
    return h.toLowerCase();
  }
  function percentEscape(c) {
    var unicode = c.charCodeAt(0);
    if (unicode > 32 && unicode < 127 && [ 34, 35, 60, 62, 63, 96 ].indexOf(unicode) == -1) {
      return c;
    }
    return encodeURIComponent(c);
  }
  function percentEscapeQuery(c) {
    var unicode = c.charCodeAt(0);
    if (unicode > 32 && unicode < 127 && [ 34, 35, 60, 62, 96 ].indexOf(unicode) == -1) {
      return c;
    }
    return encodeURIComponent(c);
  }
  var EOF = undefined, ALPHA = /[a-zA-Z]/, ALPHANUMERIC = /[a-zA-Z0-9\+\-\.]/;
  function parse(input, stateOverride, base) {
    function err(message) {
      errors.push(message);
    }
    var state = stateOverride || "scheme start", cursor = 0, buffer = "", seenAt = false, seenBracket = false, errors = [];
    loop: while ((input[cursor - 1] != EOF || cursor == 0) && !this._isInvalid) {
      var c = input[cursor];
      switch (state) {
       case "scheme start":
        if (c && ALPHA.test(c)) {
          buffer += c.toLowerCase();
          state = "scheme";
        } else if (!stateOverride) {
          buffer = "";
          state = "no scheme";
          continue;
        } else {
          err("Invalid scheme.");
          break loop;
        }
        break;

       case "scheme":
        if (c && ALPHANUMERIC.test(c)) {
          buffer += c.toLowerCase();
        } else if (":" == c) {
          this._scheme = buffer;
          buffer = "";
          if (stateOverride) {
            break loop;
          }
          if (isRelativeScheme(this._scheme)) {
            this._isRelative = true;
          }
          if ("file" == this._scheme) {
            state = "relative";
          } else if (this._isRelative && base && base._scheme == this._scheme) {
            state = "relative or authority";
          } else if (this._isRelative) {
            state = "authority first slash";
          } else {
            state = "scheme data";
          }
        } else if (!stateOverride) {
          buffer = "";
          cursor = 0;
          state = "no scheme";
          continue;
        } else if (EOF == c) {
          break loop;
        } else {
          err("Code point not allowed in scheme: " + c);
          break loop;
        }
        break;

       case "scheme data":
        if ("?" == c) {
          this._query = "?";
          state = "query";
        } else if ("#" == c) {
          this._fragment = "#";
          state = "fragment";
        } else {
          if (EOF != c && "\t" != c && "\n" != c && "\r" != c) {
            this._schemeData += percentEscape(c);
          }
        }
        break;

       case "no scheme":
        if (!base || !isRelativeScheme(base._scheme)) {
          err("Missing scheme.");
          invalid.call(this);
        } else {
          state = "relative";
          continue;
        }
        break;

       case "relative or authority":
        if ("/" == c && "/" == input[cursor + 1]) {
          state = "authority ignore slashes";
        } else {
          err("Expected /, got: " + c);
          state = "relative";
          continue;
        }
        break;

       case "relative":
        this._isRelative = true;
        if ("file" != this._scheme) this._scheme = base._scheme;
        if (EOF == c) {
          this._host = base._host;
          this._port = base._port;
          this._path = base._path.slice();
          this._query = base._query;
          this._username = base._username;
          this._password = base._password;
          break loop;
        } else if ("/" == c || "\\" == c) {
          if ("\\" == c) err("\\ is an invalid code point.");
          state = "relative slash";
        } else if ("?" == c) {
          this._host = base._host;
          this._port = base._port;
          this._path = base._path.slice();
          this._query = "?";
          this._username = base._username;
          this._password = base._password;
          state = "query";
        } else if ("#" == c) {
          this._host = base._host;
          this._port = base._port;
          this._path = base._path.slice();
          this._query = base._query;
          this._fragment = "#";
          this._username = base._username;
          this._password = base._password;
          state = "fragment";
        } else {
          var nextC = input[cursor + 1];
          var nextNextC = input[cursor + 2];
          if ("file" != this._scheme || !ALPHA.test(c) || nextC != ":" && nextC != "|" || EOF != nextNextC && "/" != nextNextC && "\\" != nextNextC && "?" != nextNextC && "#" != nextNextC) {
            this._host = base._host;
            this._port = base._port;
            this._username = base._username;
            this._password = base._password;
            this._path = base._path.slice();
            this._path.pop();
          }
          state = "relative path";
          continue;
        }
        break;

       case "relative slash":
        if ("/" == c || "\\" == c) {
          if ("\\" == c) {
            err("\\ is an invalid code point.");
          }
          if ("file" == this._scheme) {
            state = "file host";
          } else {
            state = "authority ignore slashes";
          }
        } else {
          if ("file" != this._scheme) {
            this._host = base._host;
            this._port = base._port;
            this._username = base._username;
            this._password = base._password;
          }
          state = "relative path";
          continue;
        }
        break;

       case "authority first slash":
        if ("/" == c) {
          state = "authority second slash";
        } else {
          err("Expected '/', got: " + c);
          state = "authority ignore slashes";
          continue;
        }
        break;

       case "authority second slash":
        state = "authority ignore slashes";
        if ("/" != c) {
          err("Expected '/', got: " + c);
          continue;
        }
        break;

       case "authority ignore slashes":
        if ("/" != c && "\\" != c) {
          state = "authority";
          continue;
        } else {
          err("Expected authority, got: " + c);
        }
        break;

       case "authority":
        if ("@" == c) {
          if (seenAt) {
            err("@ already seen.");
            buffer += "%40";
          }
          seenAt = true;
          for (var i = 0; i < buffer.length; i++) {
            var cp = buffer[i];
            if ("\t" == cp || "\n" == cp || "\r" == cp) {
              err("Invalid whitespace in authority.");
              continue;
            }
            if (":" == cp && null === this._password) {
              this._password = "";
              continue;
            }
            var tempC = percentEscape(cp);
            null !== this._password ? this._password += tempC : this._username += tempC;
          }
          buffer = "";
        } else if (EOF == c || "/" == c || "\\" == c || "?" == c || "#" == c) {
          cursor -= buffer.length;
          buffer = "";
          state = "host";
          continue;
        } else {
          buffer += c;
        }
        break;

       case "file host":
        if (EOF == c || "/" == c || "\\" == c || "?" == c || "#" == c) {
          if (buffer.length == 2 && ALPHA.test(buffer[0]) && (buffer[1] == ":" || buffer[1] == "|")) {
            state = "relative path";
          } else if (buffer.length == 0) {
            state = "relative path start";
          } else {
            this._host = IDNAToASCII.call(this, buffer);
            buffer = "";
            state = "relative path start";
          }
          continue;
        } else if ("\t" == c || "\n" == c || "\r" == c) {
          err("Invalid whitespace in file host.");
        } else {
          buffer += c;
        }
        break;

       case "host":
       case "hostname":
        if (":" == c && !seenBracket) {
          this._host = IDNAToASCII.call(this, buffer);
          buffer = "";
          state = "port";
          if ("hostname" == stateOverride) {
            break loop;
          }
        } else if (EOF == c || "/" == c || "\\" == c || "?" == c || "#" == c) {
          this._host = IDNAToASCII.call(this, buffer);
          buffer = "";
          state = "relative path start";
          if (stateOverride) {
            break loop;
          }
          continue;
        } else if ("\t" != c && "\n" != c && "\r" != c) {
          if ("[" == c) {
            seenBracket = true;
          } else if ("]" == c) {
            seenBracket = false;
          }
          buffer += c;
        } else {
          err("Invalid code point in host/hostname: " + c);
        }
        break;

       case "port":
        if (/[0-9]/.test(c)) {
          buffer += c;
        } else if (EOF == c || "/" == c || "\\" == c || "?" == c || "#" == c || stateOverride) {
          if ("" != buffer) {
            var temp = parseInt(buffer, 10);
            if (temp != relative[this._scheme]) {
              this._port = temp + "";
            }
            buffer = "";
          }
          if (stateOverride) {
            break loop;
          }
          state = "relative path start";
          continue;
        } else if ("\t" == c || "\n" == c || "\r" == c) {
          err("Invalid code point in port: " + c);
        } else {
          invalid.call(this);
        }
        break;

       case "relative path start":
        if ("\\" == c) err("'\\' not allowed in path.");
        state = "relative path";
        if ("/" != c && "\\" != c) {
          continue;
        }
        break;

       case "relative path":
        if (EOF == c || "/" == c || "\\" == c || !stateOverride && ("?" == c || "#" == c)) {
          if ("\\" == c) {
            err("\\ not allowed in relative path.");
          }
          var tmp;
          if (tmp = relativePathDotMapping[buffer.toLowerCase()]) {
            buffer = tmp;
          }
          if (".." == buffer) {
            this._path.pop();
            if ("/" != c && "\\" != c) {
              this._path.push("");
            }
          } else if ("." == buffer && "/" != c && "\\" != c) {
            this._path.push("");
          } else if ("." != buffer) {
            if ("file" == this._scheme && this._path.length == 0 && buffer.length == 2 && ALPHA.test(buffer[0]) && buffer[1] == "|") {
              buffer = buffer[0] + ":";
            }
            this._path.push(buffer);
          }
          buffer = "";
          if ("?" == c) {
            this._query = "?";
            state = "query";
          } else if ("#" == c) {
            this._fragment = "#";
            state = "fragment";
          }
        } else if ("\t" != c && "\n" != c && "\r" != c) {
          buffer += percentEscape(c);
        }
        break;

       case "query":
        if (!stateOverride && "#" == c) {
          this._fragment = "#";
          state = "fragment";
        } else if (EOF != c && "\t" != c && "\n" != c && "\r" != c) {
          this._query += percentEscapeQuery(c);
        }
        break;

       case "fragment":
        if (EOF != c && "\t" != c && "\n" != c && "\r" != c) {
          this._fragment += c;
        }
        break;
      }
      cursor++;
    }
  }
  function clear() {
    this._scheme = "";
    this._schemeData = "";
    this._username = "";
    this._password = null;
    this._host = "";
    this._port = "";
    this._path = [];
    this._query = "";
    this._fragment = "";
    this._isInvalid = false;
    this._isRelative = false;
  }
  function jURL(url, base) {
    if (base !== undefined && !(base instanceof jURL)) base = new jURL(String(base));
    this._url = url;
    clear.call(this);
    var input = url.replace(/^[ \t\r\n\f]+|[ \t\r\n\f]+$/g, "");
    parse.call(this, input, null, base);
  }
  jURL.prototype = {
    toString: function() {
      return this.href;
    },
    get href() {
      if (this._isInvalid) return this._url;
      var authority = "";
      if ("" != this._username || null != this._password) {
        authority = this._username + (null != this._password ? ":" + this._password : "") + "@";
      }
      return this.protocol + (this._isRelative ? "//" + authority + this.host : "") + this.pathname + this._query + this._fragment;
    },
    set href(href) {
      clear.call(this);
      parse.call(this, href);
    },
    get protocol() {
      return this._scheme + ":";
    },
    set protocol(protocol) {
      if (this._isInvalid) return;
      parse.call(this, protocol + ":", "scheme start");
    },
    get host() {
      return this._isInvalid ? "" : this._port ? this._host + ":" + this._port : this._host;
    },
    set host(host) {
      if (this._isInvalid || !this._isRelative) return;
      parse.call(this, host, "host");
    },
    get hostname() {
      return this._host;
    },
    set hostname(hostname) {
      if (this._isInvalid || !this._isRelative) return;
      parse.call(this, hostname, "hostname");
    },
    get port() {
      return this._port;
    },
    set port(port) {
      if (this._isInvalid || !this._isRelative) return;
      parse.call(this, port, "port");
    },
    get pathname() {
      return this._isInvalid ? "" : this._isRelative ? "/" + this._path.join("/") : this._schemeData;
    },
    set pathname(pathname) {
      if (this._isInvalid || !this._isRelative) return;
      this._path = [];
      parse.call(this, pathname, "relative path start");
    },
    get search() {
      return this._isInvalid || !this._query || "?" == this._query ? "" : this._query;
    },
    set search(search) {
      if (this._isInvalid || !this._isRelative) return;
      this._query = "?";
      if ("?" == search[0]) search = search.slice(1);
      parse.call(this, search, "query");
    },
    get hash() {
      return this._isInvalid || !this._fragment || "#" == this._fragment ? "" : this._fragment;
    },
    set hash(hash) {
      if (this._isInvalid) return;
      this._fragment = "#";
      if ("#" == hash[0]) hash = hash.slice(1);
      parse.call(this, hash, "fragment");
    },
    get origin() {
      var host;
      if (this._isInvalid || !this._scheme) {
        return "";
      }
      switch (this._scheme) {
       case "data":
       case "file":
       case "javascript":
       case "mailto":
        return "null";
      }
      host = this.host;
      if (!host) {
        return "";
      }
      return this._scheme + "://" + host;
    }
  };
  var OriginalURL = scope.URL;
  if (OriginalURL) {
    jURL.createObjectURL = function(blob) {
      return OriginalURL.createObjectURL.apply(OriginalURL, arguments);
    };
    jURL.revokeObjectURL = function(url) {
      OriginalURL.revokeObjectURL(url);
    };
  }
  scope.URL = jURL;
})(self);

if (typeof WeakMap === "undefined") {
  (function() {
    var defineProperty = Object.defineProperty;
    var counter = Date.now() % 1e9;
    var WeakMap = function() {
      this.name = "__st" + (Math.random() * 1e9 >>> 0) + (counter++ + "__");
    };
    WeakMap.prototype = {
      set: function(key, value) {
        var entry = key[this.name];
        if (entry && entry[0] === key) entry[1] = value; else defineProperty(key, this.name, {
          value: [ key, value ],
          writable: true
        });
        return this;
      },
      get: function(key) {
        var entry;
        return (entry = key[this.name]) && entry[0] === key ? entry[1] : undefined;
      },
      "delete": function(key) {
        var entry = key[this.name];
        if (!entry || entry[0] !== key) return false;
        entry[0] = entry[1] = undefined;
        return true;
      },
      has: function(key) {
        var entry = key[this.name];
        if (!entry) return false;
        return entry[0] === key;
      }
    };
    window.WeakMap = WeakMap;
  })();
}

(function(global) {
  if (global.JsMutationObserver) {
    return;
  }
  var registrationsTable = new WeakMap();
  var setImmediate;
  if (/Trident|Edge/.test(navigator.userAgent)) {
    setImmediate = setTimeout;
  } else if (window.setImmediate) {
    setImmediate = window.setImmediate;
  } else {
    var setImmediateQueue = [];
    var sentinel = String(Math.random());
    window.addEventListener("message", function(e) {
      if (e.data === sentinel) {
        var queue = setImmediateQueue;
        setImmediateQueue = [];
        queue.forEach(function(func) {
          func();
        });
      }
    });
    setImmediate = function(func) {
      setImmediateQueue.push(func);
      window.postMessage(sentinel, "*");
    };
  }
  var isScheduled = false;
  var scheduledObservers = [];
  function scheduleCallback(observer) {
    scheduledObservers.push(observer);
    if (!isScheduled) {
      isScheduled = true;
      setImmediate(dispatchCallbacks);
    }
  }
  function wrapIfNeeded(node) {
    return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(node) || node;
  }
  function dispatchCallbacks() {
    isScheduled = false;
    var observers = scheduledObservers;
    scheduledObservers = [];
    observers.sort(function(o1, o2) {
      return o1.uid_ - o2.uid_;
    });
    var anyNonEmpty = false;
    observers.forEach(function(observer) {
      var queue = observer.takeRecords();
      removeTransientObserversFor(observer);
      if (queue.length) {
        observer.callback_(queue, observer);
        anyNonEmpty = true;
      }
    });
    if (anyNonEmpty) dispatchCallbacks();
  }
  function removeTransientObserversFor(observer) {
    observer.nodes_.forEach(function(node) {
      var registrations = registrationsTable.get(node);
      if (!registrations) return;
      registrations.forEach(function(registration) {
        if (registration.observer === observer) registration.removeTransientObservers();
      });
    });
  }
  function forEachAncestorAndObserverEnqueueRecord(target, callback) {
    for (var node = target; node; node = node.parentNode) {
      var registrations = registrationsTable.get(node);
      if (registrations) {
        for (var j = 0; j < registrations.length; j++) {
          var registration = registrations[j];
          var options = registration.options;
          if (node !== target && !options.subtree) continue;
          var record = callback(options);
          if (record) registration.enqueue(record);
        }
      }
    }
  }
  var uidCounter = 0;
  function JsMutationObserver(callback) {
    this.callback_ = callback;
    this.nodes_ = [];
    this.records_ = [];
    this.uid_ = ++uidCounter;
  }
  JsMutationObserver.prototype = {
    observe: function(target, options) {
      target = wrapIfNeeded(target);
      if (!options.childList && !options.attributes && !options.characterData || options.attributeOldValue && !options.attributes || options.attributeFilter && options.attributeFilter.length && !options.attributes || options.characterDataOldValue && !options.characterData) {
        throw new SyntaxError();
      }
      var registrations = registrationsTable.get(target);
      if (!registrations) registrationsTable.set(target, registrations = []);
      var registration;
      for (var i = 0; i < registrations.length; i++) {
        if (registrations[i].observer === this) {
          registration = registrations[i];
          registration.removeListeners();
          registration.options = options;
          break;
        }
      }
      if (!registration) {
        registration = new Registration(this, target, options);
        registrations.push(registration);
        this.nodes_.push(target);
      }
      registration.addListeners();
    },
    disconnect: function() {
      this.nodes_.forEach(function(node) {
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          var registration = registrations[i];
          if (registration.observer === this) {
            registration.removeListeners();
            registrations.splice(i, 1);
            break;
          }
        }
      }, this);
      this.records_ = [];
    },
    takeRecords: function() {
      var copyOfRecords = this.records_;
      this.records_ = [];
      return copyOfRecords;
    }
  };
  function MutationRecord(type, target) {
    this.type = type;
    this.target = target;
    this.addedNodes = [];
    this.removedNodes = [];
    this.previousSibling = null;
    this.nextSibling = null;
    this.attributeName = null;
    this.attributeNamespace = null;
    this.oldValue = null;
  }
  function copyMutationRecord(original) {
    var record = new MutationRecord(original.type, original.target);
    record.addedNodes = original.addedNodes.slice();
    record.removedNodes = original.removedNodes.slice();
    record.previousSibling = original.previousSibling;
    record.nextSibling = original.nextSibling;
    record.attributeName = original.attributeName;
    record.attributeNamespace = original.attributeNamespace;
    record.oldValue = original.oldValue;
    return record;
  }
  var currentRecord, recordWithOldValue;
  function getRecord(type, target) {
    return currentRecord = new MutationRecord(type, target);
  }
  function getRecordWithOldValue(oldValue) {
    if (recordWithOldValue) return recordWithOldValue;
    recordWithOldValue = copyMutationRecord(currentRecord);
    recordWithOldValue.oldValue = oldValue;
    return recordWithOldValue;
  }
  function clearRecords() {
    currentRecord = recordWithOldValue = undefined;
  }
  function recordRepresentsCurrentMutation(record) {
    return record === recordWithOldValue || record === currentRecord;
  }
  function selectRecord(lastRecord, newRecord) {
    if (lastRecord === newRecord) return lastRecord;
    if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord)) return recordWithOldValue;
    return null;
  }
  function Registration(observer, target, options) {
    this.observer = observer;
    this.target = target;
    this.options = options;
    this.transientObservedNodes = [];
  }
  Registration.prototype = {
    enqueue: function(record) {
      var records = this.observer.records_;
      var length = records.length;
      if (records.length > 0) {
        var lastRecord = records[length - 1];
        var recordToReplaceLast = selectRecord(lastRecord, record);
        if (recordToReplaceLast) {
          records[length - 1] = recordToReplaceLast;
          return;
        }
      } else {
        scheduleCallback(this.observer);
      }
      records[length] = record;
    },
    addListeners: function() {
      this.addListeners_(this.target);
    },
    addListeners_: function(node) {
      var options = this.options;
      if (options.attributes) node.addEventListener("DOMAttrModified", this, true);
      if (options.characterData) node.addEventListener("DOMCharacterDataModified", this, true);
      if (options.childList) node.addEventListener("DOMNodeInserted", this, true);
      if (options.childList || options.subtree) node.addEventListener("DOMNodeRemoved", this, true);
    },
    removeListeners: function() {
      this.removeListeners_(this.target);
    },
    removeListeners_: function(node) {
      var options = this.options;
      if (options.attributes) node.removeEventListener("DOMAttrModified", this, true);
      if (options.characterData) node.removeEventListener("DOMCharacterDataModified", this, true);
      if (options.childList) node.removeEventListener("DOMNodeInserted", this, true);
      if (options.childList || options.subtree) node.removeEventListener("DOMNodeRemoved", this, true);
    },
    addTransientObserver: function(node) {
      if (node === this.target) return;
      this.addListeners_(node);
      this.transientObservedNodes.push(node);
      var registrations = registrationsTable.get(node);
      if (!registrations) registrationsTable.set(node, registrations = []);
      registrations.push(this);
    },
    removeTransientObservers: function() {
      var transientObservedNodes = this.transientObservedNodes;
      this.transientObservedNodes = [];
      transientObservedNodes.forEach(function(node) {
        this.removeListeners_(node);
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          if (registrations[i] === this) {
            registrations.splice(i, 1);
            break;
          }
        }
      }, this);
    },
    handleEvent: function(e) {
      e.stopImmediatePropagation();
      switch (e.type) {
       case "DOMAttrModified":
        var name = e.attrName;
        var namespace = e.relatedNode.namespaceURI;
        var target = e.target;
        var record = new getRecord("attributes", target);
        record.attributeName = name;
        record.attributeNamespace = namespace;
        var oldValue = e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;
        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          if (!options.attributes) return;
          if (options.attributeFilter && options.attributeFilter.length && options.attributeFilter.indexOf(name) === -1 && options.attributeFilter.indexOf(namespace) === -1) {
            return;
          }
          if (options.attributeOldValue) return getRecordWithOldValue(oldValue);
          return record;
        });
        break;

       case "DOMCharacterDataModified":
        var target = e.target;
        var record = getRecord("characterData", target);
        var oldValue = e.prevValue;
        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          if (!options.characterData) return;
          if (options.characterDataOldValue) return getRecordWithOldValue(oldValue);
          return record;
        });
        break;

       case "DOMNodeRemoved":
        this.addTransientObserver(e.target);

       case "DOMNodeInserted":
        var changedNode = e.target;
        var addedNodes, removedNodes;
        if (e.type === "DOMNodeInserted") {
          addedNodes = [ changedNode ];
          removedNodes = [];
        } else {
          addedNodes = [];
          removedNodes = [ changedNode ];
        }
        var previousSibling = changedNode.previousSibling;
        var nextSibling = changedNode.nextSibling;
        var record = getRecord("childList", e.target.parentNode);
        record.addedNodes = addedNodes;
        record.removedNodes = removedNodes;
        record.previousSibling = previousSibling;
        record.nextSibling = nextSibling;
        forEachAncestorAndObserverEnqueueRecord(e.relatedNode, function(options) {
          if (!options.childList) return;
          return record;
        });
      }
      clearRecords();
    }
  };
  global.JsMutationObserver = JsMutationObserver;
  if (!global.MutationObserver) {
    global.MutationObserver = JsMutationObserver;
    JsMutationObserver._isPolyfilled = true;
  }
})(self);

(function() {
  var needsTemplate = typeof HTMLTemplateElement === "undefined";
  if (/Trident/.test(navigator.userAgent)) {
    (function() {
      var importNode = document.importNode;
      document.importNode = function() {
        var n = importNode.apply(document, arguments);
        if (n.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          var f = document.createDocumentFragment();
          f.appendChild(n);
          return f;
        } else {
          return n;
        }
      };
    })();
  }
  var needsCloning = function() {
    if (!needsTemplate) {
      var t = document.createElement("template");
      var t2 = document.createElement("template");
      t2.content.appendChild(document.createElement("div"));
      t.content.appendChild(t2);
      var clone = t.cloneNode(true);
      return clone.content.childNodes.length === 0 || clone.content.firstChild.content.childNodes.length === 0;
    }
  }();
  var TEMPLATE_TAG = "template";
  var TemplateImpl = function() {};
  if (needsTemplate) {
    var contentDoc = document.implementation.createHTMLDocument("template");
    var canDecorate = true;
    var templateStyle = document.createElement("style");
    templateStyle.textContent = TEMPLATE_TAG + "{display:none;}";
    var head = document.head;
    head.insertBefore(templateStyle, head.firstElementChild);
    TemplateImpl.prototype = Object.create(HTMLElement.prototype);
    TemplateImpl.decorate = function(template) {
      if (template.content) {
        return;
      }
      template.content = contentDoc.createDocumentFragment();
      var child;
      while (child = template.firstChild) {
        template.content.appendChild(child);
      }
      template.cloneNode = function(deep) {
        return TemplateImpl.cloneNode(this, deep);
      };
      if (canDecorate) {
        try {
          Object.defineProperty(template, "innerHTML", {
            get: function() {
              var o = "";
              for (var e = this.content.firstChild; e; e = e.nextSibling) {
                o += e.outerHTML || escapeData(e.data);
              }
              return o;
            },
            set: function(text) {
              contentDoc.body.innerHTML = text;
              TemplateImpl.bootstrap(contentDoc);
              while (this.content.firstChild) {
                this.content.removeChild(this.content.firstChild);
              }
              while (contentDoc.body.firstChild) {
                this.content.appendChild(contentDoc.body.firstChild);
              }
            },
            configurable: true
          });
        } catch (err) {
          canDecorate = false;
        }
      }
      TemplateImpl.bootstrap(template.content);
    };
    TemplateImpl.bootstrap = function(doc) {
      var templates = doc.querySelectorAll(TEMPLATE_TAG);
      for (var i = 0, l = templates.length, t; i < l && (t = templates[i]); i++) {
        TemplateImpl.decorate(t);
      }
    };
    document.addEventListener("DOMContentLoaded", function() {
      TemplateImpl.bootstrap(document);
    });
    var createElement = document.createElement;
    document.createElement = function() {
      "use strict";
      var el = createElement.apply(document, arguments);
      if (el.localName === "template") {
        TemplateImpl.decorate(el);
      }
      return el;
    };
    var escapeDataRegExp = /[&\u00A0<>]/g;
    function escapeReplace(c) {
      switch (c) {
       case "&":
        return "&amp;";

       case "<":
        return "&lt;";

       case ">":
        return "&gt;";

       case " ":
        return "&nbsp;";
      }
    }
    function escapeData(s) {
      return s.replace(escapeDataRegExp, escapeReplace);
    }
  }
  if (needsTemplate || needsCloning) {
    var nativeCloneNode = Node.prototype.cloneNode;
    TemplateImpl.cloneNode = function(template, deep) {
      var clone = nativeCloneNode.call(template, false);
      if (this.decorate) {
        this.decorate(clone);
      }
      if (deep) {
        clone.content.appendChild(nativeCloneNode.call(template.content, true));
        this.fixClonedDom(clone.content, template.content);
      }
      return clone;
    };
    TemplateImpl.fixClonedDom = function(clone, source) {
      if (!source.querySelectorAll) return;
      var s$ = source.querySelectorAll(TEMPLATE_TAG);
      var t$ = clone.querySelectorAll(TEMPLATE_TAG);
      for (var i = 0, l = t$.length, t, s; i < l; i++) {
        s = s$[i];
        t = t$[i];
        if (this.decorate) {
          this.decorate(s);
        }
        t.parentNode.replaceChild(s.cloneNode(true), t);
      }
    };
    var originalImportNode = document.importNode;
    Node.prototype.cloneNode = function(deep) {
      var dom = nativeCloneNode.call(this, deep);
      if (deep) {
        TemplateImpl.fixClonedDom(dom, this);
      }
      return dom;
    };
    document.importNode = function(element, deep) {
      if (element.localName === TEMPLATE_TAG) {
        return TemplateImpl.cloneNode(element, deep);
      } else {
        var dom = originalImportNode.call(document, element, deep);
        if (deep) {
          TemplateImpl.fixClonedDom(dom, element);
        }
        return dom;
      }
    };
    if (needsCloning) {
      HTMLTemplateElement.prototype.cloneNode = function(deep) {
        return TemplateImpl.cloneNode(this, deep);
      };
    }
  }
  if (needsTemplate) {
    window.HTMLTemplateElement = TemplateImpl;
  }
})();

(function(scope) {
  "use strict";
  if (!(window.performance && window.performance.now)) {
    var start = Date.now();
    window.performance = {
      now: function() {
        return Date.now() - start;
      }
    };
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function() {
      var nativeRaf = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
      return nativeRaf ? function(callback) {
        return nativeRaf(function() {
          callback(performance.now());
        });
      } : function(callback) {
        return window.setTimeout(callback, 1e3 / 60);
      };
    }();
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function() {
      return window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || function(id) {
        clearTimeout(id);
      };
    }();
  }
  var workingDefaultPrevented = function() {
    var e = document.createEvent("Event");
    e.initEvent("foo", true, true);
    e.preventDefault();
    return e.defaultPrevented;
  }();
  if (!workingDefaultPrevented) {
    var origPreventDefault = Event.prototype.preventDefault;
    Event.prototype.preventDefault = function() {
      if (!this.cancelable) {
        return;
      }
      origPreventDefault.call(this);
      Object.defineProperty(this, "defaultPrevented", {
        get: function() {
          return true;
        },
        configurable: true
      });
    };
  }
  var isIE = /Trident/.test(navigator.userAgent);
  if (!window.CustomEvent || isIE && typeof window.CustomEvent !== "function") {
    window.CustomEvent = function(inType, params) {
      params = params || {};
      var e = document.createEvent("CustomEvent");
      e.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
      return e;
    };
    window.CustomEvent.prototype = window.Event.prototype;
  }
  if (!window.Event || isIE && typeof window.Event !== "function") {
    var origEvent = window.Event;
    window.Event = function(inType, params) {
      params = params || {};
      var e = document.createEvent("Event");
      e.initEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable));
      return e;
    };
    window.Event.prototype = origEvent.prototype;
  }
})(window.WebComponents);

window.HTMLImports = window.HTMLImports || {
  flags: {}
};

(function(scope) {
  var IMPORT_LINK_TYPE = "import";
  var useNative = Boolean(IMPORT_LINK_TYPE in document.createElement("link"));
  var hasShadowDOMPolyfill = Boolean(window.ShadowDOMPolyfill);
  var wrap = function(node) {
    return hasShadowDOMPolyfill ? window.ShadowDOMPolyfill.wrapIfNeeded(node) : node;
  };
  var rootDocument = wrap(document);
  var currentScriptDescriptor = {
    get: function() {
      var script = window.HTMLImports.currentScript || document.currentScript || (document.readyState !== "complete" ? document.scripts[document.scripts.length - 1] : null);
      return wrap(script);
    },
    configurable: true
  };
  Object.defineProperty(document, "_currentScript", currentScriptDescriptor);
  Object.defineProperty(rootDocument, "_currentScript", currentScriptDescriptor);
  var isIE = /Trident/.test(navigator.userAgent);
  function whenReady(callback, doc) {
    doc = doc || rootDocument;
    whenDocumentReady(function() {
      watchImportsLoad(callback, doc);
    }, doc);
  }
  var requiredReadyState = isIE ? "complete" : "interactive";
  var READY_EVENT = "readystatechange";
  function isDocumentReady(doc) {
    return doc.readyState === "complete" || doc.readyState === requiredReadyState;
  }
  function whenDocumentReady(callback, doc) {
    if (!isDocumentReady(doc)) {
      var checkReady = function() {
        if (doc.readyState === "complete" || doc.readyState === requiredReadyState) {
          doc.removeEventListener(READY_EVENT, checkReady);
          whenDocumentReady(callback, doc);
        }
      };
      doc.addEventListener(READY_EVENT, checkReady);
    } else if (callback) {
      callback();
    }
  }
  function markTargetLoaded(event) {
    event.target.__loaded = true;
  }
  function watchImportsLoad(callback, doc) {
    var imports = doc.querySelectorAll("link[rel=import]");
    var parsedCount = 0, importCount = imports.length, newImports = [], errorImports = [];
    function checkDone() {
      if (parsedCount == importCount && callback) {
        callback({
          allImports: imports,
          loadedImports: newImports,
          errorImports: errorImports
        });
      }
    }
    function loadedImport(e) {
      markTargetLoaded(e);
      newImports.push(this);
      parsedCount++;
      checkDone();
    }
    function errorLoadingImport(e) {
      errorImports.push(this);
      parsedCount++;
      checkDone();
    }
    if (importCount) {
      for (var i = 0, imp; i < importCount && (imp = imports[i]); i++) {
        if (isImportLoaded(imp)) {
          newImports.push(this);
          parsedCount++;
          checkDone();
        } else {
          imp.addEventListener("load", loadedImport);
          imp.addEventListener("error", errorLoadingImport);
        }
      }
    } else {
      checkDone();
    }
  }
  function isImportLoaded(link) {
    return useNative ? link.__loaded || link.import && link.import.readyState !== "loading" : link.__importParsed;
  }
  if (useNative) {
    new MutationObserver(function(mxns) {
      for (var i = 0, l = mxns.length, m; i < l && (m = mxns[i]); i++) {
        if (m.addedNodes) {
          handleImports(m.addedNodes);
        }
      }
    }).observe(document.head, {
      childList: true
    });
    function handleImports(nodes) {
      for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {
        if (isImport(n)) {
          handleImport(n);
        }
      }
    }
    function isImport(element) {
      return element.localName === "link" && element.rel === "import";
    }
    function handleImport(element) {
      var loaded = element.import;
      if (loaded) {
        markTargetLoaded({
          target: element
        });
      } else {
        element.addEventListener("load", markTargetLoaded);
        element.addEventListener("error", markTargetLoaded);
      }
    }
    (function() {
      if (document.readyState === "loading") {
        var imports = document.querySelectorAll("link[rel=import]");
        for (var i = 0, l = imports.length, imp; i < l && (imp = imports[i]); i++) {
          handleImport(imp);
        }
      }
    })();
  }
  whenReady(function(detail) {
    window.HTMLImports.ready = true;
    window.HTMLImports.readyTime = new Date().getTime();
    var evt = rootDocument.createEvent("CustomEvent");
    evt.initCustomEvent("HTMLImportsLoaded", true, true, detail);
    rootDocument.dispatchEvent(evt);
  });
  scope.IMPORT_LINK_TYPE = IMPORT_LINK_TYPE;
  scope.useNative = useNative;
  scope.rootDocument = rootDocument;
  scope.whenReady = whenReady;
  scope.isIE = isIE;
})(window.HTMLImports);

(function(scope) {
  var modules = [];
  var addModule = function(module) {
    modules.push(module);
  };
  var initializeModules = function() {
    modules.forEach(function(module) {
      module(scope);
    });
  };
  scope.addModule = addModule;
  scope.initializeModules = initializeModules;
})(window.HTMLImports);

window.HTMLImports.addModule(function(scope) {
  var CSS_URL_REGEXP = /(url\()([^)]*)(\))/g;
  var CSS_IMPORT_REGEXP = /(@import[\s]+(?!url\())([^;]*)(;)/g;
  var path = {
    resolveUrlsInStyle: function(style, linkUrl) {
      var doc = style.ownerDocument;
      var resolver = doc.createElement("a");
      style.textContent = this.resolveUrlsInCssText(style.textContent, linkUrl, resolver);
      return style;
    },
    resolveUrlsInCssText: function(cssText, linkUrl, urlObj) {
      var r = this.replaceUrls(cssText, urlObj, linkUrl, CSS_URL_REGEXP);
      r = this.replaceUrls(r, urlObj, linkUrl, CSS_IMPORT_REGEXP);
      return r;
    },
    replaceUrls: function(text, urlObj, linkUrl, regexp) {
      return text.replace(regexp, function(m, pre, url, post) {
        var urlPath = url.replace(/["']/g, "");
        if (linkUrl) {
          urlPath = new URL(urlPath, linkUrl).href;
        }
        urlObj.href = urlPath;
        urlPath = urlObj.href;
        return pre + "'" + urlPath + "'" + post;
      });
    }
  };
  scope.path = path;
});

window.HTMLImports.addModule(function(scope) {
  var xhr = {
    async: true,
    ok: function(request) {
      return request.status >= 200 && request.status < 300 || request.status === 304 || request.status === 0;
    },
    load: function(url, next, nextContext) {
      var request = new XMLHttpRequest();
      if (scope.flags.debug || scope.flags.bust) {
        url += "?" + Math.random();
      }
      request.open("GET", url, xhr.async);
      request.addEventListener("readystatechange", function(e) {
        if (request.readyState === 4) {
          var redirectedUrl = null;
          try {
            var locationHeader = request.getResponseHeader("Location");
            if (locationHeader) {
              redirectedUrl = locationHeader.substr(0, 1) === "/" ? location.origin + locationHeader : locationHeader;
            }
          } catch (e) {
            console.error(e.message);
          }
          next.call(nextContext, !xhr.ok(request) && request, request.response || request.responseText, redirectedUrl);
        }
      });
      request.send();
      return request;
    },
    loadDocument: function(url, next, nextContext) {
      this.load(url, next, nextContext).responseType = "document";
    }
  };
  scope.xhr = xhr;
});

window.HTMLImports.addModule(function(scope) {
  var xhr = scope.xhr;
  var flags = scope.flags;
  var Loader = function(onLoad, onComplete) {
    this.cache = {};
    this.onload = onLoad;
    this.oncomplete = onComplete;
    this.inflight = 0;
    this.pending = {};
  };
  Loader.prototype = {
    addNodes: function(nodes) {
      this.inflight += nodes.length;
      for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {
        this.require(n);
      }
      this.checkDone();
    },
    addNode: function(node) {
      this.inflight++;
      this.require(node);
      this.checkDone();
    },
    require: function(elt) {
      var url = elt.src || elt.href;
      elt.__nodeUrl = url;
      if (!this.dedupe(url, elt)) {
        this.fetch(url, elt);
      }
    },
    dedupe: function(url, elt) {
      if (this.pending[url]) {
        this.pending[url].push(elt);
        return true;
      }
      var resource;
      if (this.cache[url]) {
        this.onload(url, elt, this.cache[url]);
        this.tail();
        return true;
      }
      this.pending[url] = [ elt ];
      return false;
    },
    fetch: function(url, elt) {
      flags.load && console.log("fetch", url, elt);
      if (!url) {
        setTimeout(function() {
          this.receive(url, elt, {
            error: "href must be specified"
          }, null);
        }.bind(this), 0);
      } else if (url.match(/^data:/)) {
        var pieces = url.split(",");
        var header = pieces[0];
        var body = pieces[1];
        if (header.indexOf(";base64") > -1) {
          body = atob(body);
        } else {
          body = decodeURIComponent(body);
        }
        setTimeout(function() {
          this.receive(url, elt, null, body);
        }.bind(this), 0);
      } else {
        var receiveXhr = function(err, resource, redirectedUrl) {
          this.receive(url, elt, err, resource, redirectedUrl);
        }.bind(this);
        xhr.load(url, receiveXhr);
      }
    },
    receive: function(url, elt, err, resource, redirectedUrl) {
      this.cache[url] = resource;
      var $p = this.pending[url];
      for (var i = 0, l = $p.length, p; i < l && (p = $p[i]); i++) {
        this.onload(url, p, resource, err, redirectedUrl);
        this.tail();
      }
      this.pending[url] = null;
    },
    tail: function() {
      --this.inflight;
      this.checkDone();
    },
    checkDone: function() {
      if (!this.inflight) {
        this.oncomplete();
      }
    }
  };
  scope.Loader = Loader;
});

window.HTMLImports.addModule(function(scope) {
  var Observer = function(addCallback) {
    this.addCallback = addCallback;
    this.mo = new MutationObserver(this.handler.bind(this));
  };
  Observer.prototype = {
    handler: function(mutations) {
      for (var i = 0, l = mutations.length, m; i < l && (m = mutations[i]); i++) {
        if (m.type === "childList" && m.addedNodes.length) {
          this.addedNodes(m.addedNodes);
        }
      }
    },
    addedNodes: function(nodes) {
      if (this.addCallback) {
        this.addCallback(nodes);
      }
      for (var i = 0, l = nodes.length, n, loading; i < l && (n = nodes[i]); i++) {
        if (n.children && n.children.length) {
          this.addedNodes(n.children);
        }
      }
    },
    observe: function(root) {
      this.mo.observe(root, {
        childList: true,
        subtree: true
      });
    }
  };
  scope.Observer = Observer;
});

window.HTMLImports.addModule(function(scope) {
  var path = scope.path;
  var rootDocument = scope.rootDocument;
  var flags = scope.flags;
  var isIE = scope.isIE;
  var IMPORT_LINK_TYPE = scope.IMPORT_LINK_TYPE;
  var IMPORT_SELECTOR = "link[rel=" + IMPORT_LINK_TYPE + "]";
  var importParser = {
    documentSelectors: IMPORT_SELECTOR,
    importsSelectors: [ IMPORT_SELECTOR, "link[rel=stylesheet]:not([type])", "style:not([type])", "script:not([type])", 'script[type="application/javascript"]', 'script[type="text/javascript"]' ].join(","),
    map: {
      link: "parseLink",
      script: "parseScript",
      style: "parseStyle"
    },
    dynamicElements: [],
    parseNext: function() {
      var next = this.nextToParse();
      if (next) {
        this.parse(next);
      }
    },
    parse: function(elt) {
      if (this.isParsed(elt)) {
        flags.parse && console.log("[%s] is already parsed", elt.localName);
        return;
      }
      var fn = this[this.map[elt.localName]];
      if (fn) {
        this.markParsing(elt);
        fn.call(this, elt);
      }
    },
    parseDynamic: function(elt, quiet) {
      this.dynamicElements.push(elt);
      if (!quiet) {
        this.parseNext();
      }
    },
    markParsing: function(elt) {
      flags.parse && console.log("parsing", elt);
      this.parsingElement = elt;
    },
    markParsingComplete: function(elt) {
      elt.__importParsed = true;
      this.markDynamicParsingComplete(elt);
      if (elt.__importElement) {
        elt.__importElement.__importParsed = true;
        this.markDynamicParsingComplete(elt.__importElement);
      }
      this.parsingElement = null;
      flags.parse && console.log("completed", elt);
    },
    markDynamicParsingComplete: function(elt) {
      var i = this.dynamicElements.indexOf(elt);
      if (i >= 0) {
        this.dynamicElements.splice(i, 1);
      }
    },
    parseImport: function(elt) {
      elt.import = elt.__doc;
      if (window.HTMLImports.__importsParsingHook) {
        window.HTMLImports.__importsParsingHook(elt);
      }
      if (elt.import) {
        elt.import.__importParsed = true;
      }
      this.markParsingComplete(elt);
      if (elt.__resource && !elt.__error) {
        elt.dispatchEvent(new CustomEvent("load", {
          bubbles: false
        }));
      } else {
        elt.dispatchEvent(new CustomEvent("error", {
          bubbles: false
        }));
      }
      if (elt.__pending) {
        var fn;
        while (elt.__pending.length) {
          fn = elt.__pending.shift();
          if (fn) {
            fn({
              target: elt
            });
          }
        }
      }
      this.parseNext();
    },
    parseLink: function(linkElt) {
      if (nodeIsImport(linkElt)) {
        this.parseImport(linkElt);
      } else {
        linkElt.href = linkElt.href;
        this.parseGeneric(linkElt);
      }
    },
    parseStyle: function(elt) {
      var src = elt;
      elt = cloneStyle(elt);
      src.__appliedElement = elt;
      elt.__importElement = src;
      this.parseGeneric(elt);
    },
    parseGeneric: function(elt) {
      this.trackElement(elt);
      this.addElementToDocument(elt);
    },
    rootImportForElement: function(elt) {
      var n = elt;
      while (n.ownerDocument.__importLink) {
        n = n.ownerDocument.__importLink;
      }
      return n;
    },
    addElementToDocument: function(elt) {
      var port = this.rootImportForElement(elt.__importElement || elt);
      port.parentNode.insertBefore(elt, port);
    },
    trackElement: function(elt, callback) {
      var self = this;
      var done = function(e) {
        elt.removeEventListener("load", done);
        elt.removeEventListener("error", done);
        if (callback) {
          callback(e);
        }
        self.markParsingComplete(elt);
        self.parseNext();
      };
      elt.addEventListener("load", done);
      elt.addEventListener("error", done);
      if (isIE && elt.localName === "style") {
        var fakeLoad = false;
        if (elt.textContent.indexOf("@import") == -1) {
          fakeLoad = true;
        } else if (elt.sheet) {
          fakeLoad = true;
          var csr = elt.sheet.cssRules;
          var len = csr ? csr.length : 0;
          for (var i = 0, r; i < len && (r = csr[i]); i++) {
            if (r.type === CSSRule.IMPORT_RULE) {
              fakeLoad = fakeLoad && Boolean(r.styleSheet);
            }
          }
        }
        if (fakeLoad) {
          setTimeout(function() {
            elt.dispatchEvent(new CustomEvent("load", {
              bubbles: false
            }));
          });
        }
      }
    },
    parseScript: function(scriptElt) {
      var script = document.createElement("script");
      script.__importElement = scriptElt;
      script.src = scriptElt.src ? scriptElt.src : generateScriptDataUrl(scriptElt);
      scope.currentScript = scriptElt;
      this.trackElement(script, function(e) {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        scope.currentScript = null;
      });
      this.addElementToDocument(script);
    },
    nextToParse: function() {
      this._mayParse = [];
      return !this.parsingElement && (this.nextToParseInDoc(rootDocument) || this.nextToParseDynamic());
    },
    nextToParseInDoc: function(doc, link) {
      if (doc && this._mayParse.indexOf(doc) < 0) {
        this._mayParse.push(doc);
        var nodes = doc.querySelectorAll(this.parseSelectorsForNode(doc));
        for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {
          if (!this.isParsed(n)) {
            if (this.hasResource(n)) {
              return nodeIsImport(n) ? this.nextToParseInDoc(n.__doc, n) : n;
            } else {
              return;
            }
          }
        }
      }
      return link;
    },
    nextToParseDynamic: function() {
      return this.dynamicElements[0];
    },
    parseSelectorsForNode: function(node) {
      var doc = node.ownerDocument || node;
      return doc === rootDocument ? this.documentSelectors : this.importsSelectors;
    },
    isParsed: function(node) {
      return node.__importParsed;
    },
    needsDynamicParsing: function(elt) {
      return this.dynamicElements.indexOf(elt) >= 0;
    },
    hasResource: function(node) {
      if (nodeIsImport(node) && node.__doc === undefined) {
        return false;
      }
      return true;
    }
  };
  function nodeIsImport(elt) {
    return elt.localName === "link" && elt.rel === IMPORT_LINK_TYPE;
  }
  function generateScriptDataUrl(script) {
    var scriptContent = generateScriptContent(script);
    return "data:text/javascript;charset=utf-8," + encodeURIComponent(scriptContent);
  }
  function generateScriptContent(script) {
    return script.textContent + generateSourceMapHint(script);
  }
  function generateSourceMapHint(script) {
    var owner = script.ownerDocument;
    owner.__importedScripts = owner.__importedScripts || 0;
    var moniker = script.ownerDocument.baseURI;
    var num = owner.__importedScripts ? "-" + owner.__importedScripts : "";
    owner.__importedScripts++;
    return "\n//# sourceURL=" + moniker + num + ".js\n";
  }
  function cloneStyle(style) {
    var clone = style.ownerDocument.createElement("style");
    clone.textContent = style.textContent;
    path.resolveUrlsInStyle(clone);
    return clone;
  }
  scope.parser = importParser;
  scope.IMPORT_SELECTOR = IMPORT_SELECTOR;
});

window.HTMLImports.addModule(function(scope) {
  var flags = scope.flags;
  var IMPORT_LINK_TYPE = scope.IMPORT_LINK_TYPE;
  var IMPORT_SELECTOR = scope.IMPORT_SELECTOR;
  var rootDocument = scope.rootDocument;
  var Loader = scope.Loader;
  var Observer = scope.Observer;
  var parser = scope.parser;
  var importer = {
    documents: {},
    documentPreloadSelectors: IMPORT_SELECTOR,
    importsPreloadSelectors: [ IMPORT_SELECTOR ].join(","),
    loadNode: function(node) {
      importLoader.addNode(node);
    },
    loadSubtree: function(parent) {
      var nodes = this.marshalNodes(parent);
      importLoader.addNodes(nodes);
    },
    marshalNodes: function(parent) {
      return parent.querySelectorAll(this.loadSelectorsForNode(parent));
    },
    loadSelectorsForNode: function(node) {
      var doc = node.ownerDocument || node;
      return doc === rootDocument ? this.documentPreloadSelectors : this.importsPreloadSelectors;
    },
    loaded: function(url, elt, resource, err, redirectedUrl) {
      flags.load && console.log("loaded", url, elt);
      elt.__resource = resource;
      elt.__error = err;
      if (isImportLink(elt)) {
        var doc = this.documents[url];
        if (doc === undefined) {
          doc = err ? null : makeDocument(resource, redirectedUrl || url);
          if (doc) {
            doc.__importLink = elt;
            this.bootDocument(doc);
          }
          this.documents[url] = doc;
        }
        elt.__doc = doc;
      }
      parser.parseNext();
    },
    bootDocument: function(doc) {
      this.loadSubtree(doc);
      this.observer.observe(doc);
      parser.parseNext();
    },
    loadedAll: function() {
      parser.parseNext();
    }
  };
  var importLoader = new Loader(importer.loaded.bind(importer), importer.loadedAll.bind(importer));
  importer.observer = new Observer();
  function isImportLink(elt) {
    return isLinkRel(elt, IMPORT_LINK_TYPE);
  }
  function isLinkRel(elt, rel) {
    return elt.localName === "link" && elt.getAttribute("rel") === rel;
  }
  function hasBaseURIAccessor(doc) {
    return !!Object.getOwnPropertyDescriptor(doc, "baseURI");
  }
  function makeDocument(resource, url) {
    var doc = document.implementation.createHTMLDocument(IMPORT_LINK_TYPE);
    doc._URL = url;
    var base = doc.createElement("base");
    base.setAttribute("href", url);
    if (!doc.baseURI && !hasBaseURIAccessor(doc)) {
      Object.defineProperty(doc, "baseURI", {
        value: url
      });
    }
    var meta = doc.createElement("meta");
    meta.setAttribute("charset", "utf-8");
    doc.head.appendChild(meta);
    doc.head.appendChild(base);
    doc.body.innerHTML = resource;
    if (window.HTMLTemplateElement && HTMLTemplateElement.bootstrap) {
      HTMLTemplateElement.bootstrap(doc);
    }
    return doc;
  }
  if (!document.baseURI) {
    var baseURIDescriptor = {
      get: function() {
        var base = document.querySelector("base");
        return base ? base.href : window.location.href;
      },
      configurable: true
    };
    Object.defineProperty(document, "baseURI", baseURIDescriptor);
    Object.defineProperty(rootDocument, "baseURI", baseURIDescriptor);
  }
  scope.importer = importer;
  scope.importLoader = importLoader;
});

window.HTMLImports.addModule(function(scope) {
  var parser = scope.parser;
  var importer = scope.importer;
  var dynamic = {
    added: function(nodes) {
      var owner, parsed, loading;
      for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {
        if (!owner) {
          owner = n.ownerDocument;
          parsed = parser.isParsed(owner);
        }
        loading = this.shouldLoadNode(n);
        if (loading) {
          importer.loadNode(n);
        }
        if (this.shouldParseNode(n) && parsed) {
          parser.parseDynamic(n, loading);
        }
      }
    },
    shouldLoadNode: function(node) {
      return node.nodeType === 1 && matches.call(node, importer.loadSelectorsForNode(node));
    },
    shouldParseNode: function(node) {
      return node.nodeType === 1 && matches.call(node, parser.parseSelectorsForNode(node));
    }
  };
  importer.observer.addCallback = dynamic.added.bind(dynamic);
  var matches = HTMLElement.prototype.matches || HTMLElement.prototype.matchesSelector || HTMLElement.prototype.webkitMatchesSelector || HTMLElement.prototype.mozMatchesSelector || HTMLElement.prototype.msMatchesSelector;
});

(function(scope) {
  var initializeModules = scope.initializeModules;
  var isIE = scope.isIE;
  if (scope.useNative) {
    return;
  }
  initializeModules();
  var rootDocument = scope.rootDocument;
  function bootstrap() {
    window.HTMLImports.importer.bootDocument(rootDocument);
  }
  if (document.readyState === "complete" || document.readyState === "interactive" && !window.attachEvent) {
    bootstrap();
  } else {
    document.addEventListener("DOMContentLoaded", bootstrap);
  }
})(window.HTMLImports);

window.CustomElements = window.CustomElements || {
  flags: {}
};

(function(scope) {
  var flags = scope.flags;
  var modules = [];
  var addModule = function(module) {
    modules.push(module);
  };
  var initializeModules = function() {
    modules.forEach(function(module) {
      module(scope);
    });
  };
  scope.addModule = addModule;
  scope.initializeModules = initializeModules;
  scope.hasNative = Boolean(document.registerElement);
  scope.isIE = /Trident/.test(navigator.userAgent);
  scope.useNative = !flags.register && scope.hasNative && !window.ShadowDOMPolyfill && (!window.HTMLImports || window.HTMLImports.useNative);
})(window.CustomElements);

window.CustomElements.addModule(function(scope) {
  var IMPORT_LINK_TYPE = window.HTMLImports ? window.HTMLImports.IMPORT_LINK_TYPE : "none";
  function forSubtree(node, cb) {
    findAllElements(node, function(e) {
      if (cb(e)) {
        return true;
      }
      forRoots(e, cb);
    });
    forRoots(node, cb);
  }
  function findAllElements(node, find, data) {
    var e = node.firstElementChild;
    if (!e) {
      e = node.firstChild;
      while (e && e.nodeType !== Node.ELEMENT_NODE) {
        e = e.nextSibling;
      }
    }
    while (e) {
      if (find(e, data) !== true) {
        findAllElements(e, find, data);
      }
      e = e.nextElementSibling;
    }
    return null;
  }
  function forRoots(node, cb) {
    var root = node.shadowRoot;
    while (root) {
      forSubtree(root, cb);
      root = root.olderShadowRoot;
    }
  }
  function forDocumentTree(doc, cb) {
    _forDocumentTree(doc, cb, []);
  }
  function _forDocumentTree(doc, cb, processingDocuments) {
    doc = window.wrap(doc);
    if (processingDocuments.indexOf(doc) >= 0) {
      return;
    }
    processingDocuments.push(doc);
    var imports = doc.querySelectorAll("link[rel=" + IMPORT_LINK_TYPE + "]");
    for (var i = 0, l = imports.length, n; i < l && (n = imports[i]); i++) {
      if (n.import) {
        _forDocumentTree(n.import, cb, processingDocuments);
      }
    }
    cb(doc);
  }
  scope.forDocumentTree = forDocumentTree;
  scope.forSubtree = forSubtree;
});

window.CustomElements.addModule(function(scope) {
  var flags = scope.flags;
  var forSubtree = scope.forSubtree;
  var forDocumentTree = scope.forDocumentTree;
  function addedNode(node, isAttached) {
    return added(node, isAttached) || addedSubtree(node, isAttached);
  }
  function added(node, isAttached) {
    if (scope.upgrade(node, isAttached)) {
      return true;
    }
    if (isAttached) {
      attached(node);
    }
  }
  function addedSubtree(node, isAttached) {
    forSubtree(node, function(e) {
      if (added(e, isAttached)) {
        return true;
      }
    });
  }
  var hasThrottledAttached = window.MutationObserver._isPolyfilled && flags["throttle-attached"];
  scope.hasPolyfillMutations = hasThrottledAttached;
  scope.hasThrottledAttached = hasThrottledAttached;
  var isPendingMutations = false;
  var pendingMutations = [];
  function deferMutation(fn) {
    pendingMutations.push(fn);
    if (!isPendingMutations) {
      isPendingMutations = true;
      setTimeout(takeMutations);
    }
  }
  function takeMutations() {
    isPendingMutations = false;
    var $p = pendingMutations;
    for (var i = 0, l = $p.length, p; i < l && (p = $p[i]); i++) {
      p();
    }
    pendingMutations = [];
  }
  function attached(element) {
    if (hasThrottledAttached) {
      deferMutation(function() {
        _attached(element);
      });
    } else {
      _attached(element);
    }
  }
  function _attached(element) {
    if (element.__upgraded__ && !element.__attached) {
      element.__attached = true;
      if (element.attachedCallback) {
        element.attachedCallback();
      }
    }
  }
  function detachedNode(node) {
    detached(node);
    forSubtree(node, function(e) {
      detached(e);
    });
  }
  function detached(element) {
    if (hasThrottledAttached) {
      deferMutation(function() {
        _detached(element);
      });
    } else {
      _detached(element);
    }
  }
  function _detached(element) {
    if (element.__upgraded__ && element.__attached) {
      element.__attached = false;
      if (element.detachedCallback) {
        element.detachedCallback();
      }
    }
  }
  function inDocument(element) {
    var p = element;
    var doc = window.wrap(document);
    while (p) {
      if (p == doc) {
        return true;
      }
      p = p.parentNode || p.nodeType === Node.DOCUMENT_FRAGMENT_NODE && p.host;
    }
  }
  function watchShadow(node) {
    if (node.shadowRoot && !node.shadowRoot.__watched) {
      flags.dom && console.log("watching shadow-root for: ", node.localName);
      var root = node.shadowRoot;
      while (root) {
        observe(root);
        root = root.olderShadowRoot;
      }
    }
  }
  function handler(root, mutations) {
    if (flags.dom) {
      var mx = mutations[0];
      if (mx && mx.type === "childList" && mx.addedNodes) {
        if (mx.addedNodes) {
          var d = mx.addedNodes[0];
          while (d && d !== document && !d.host) {
            d = d.parentNode;
          }
          var u = d && (d.URL || d._URL || d.host && d.host.localName) || "";
          u = u.split("/?").shift().split("/").pop();
        }
      }
      console.group("mutations (%d) [%s]", mutations.length, u || "");
    }
    var isAttached = inDocument(root);
    mutations.forEach(function(mx) {
      if (mx.type === "childList") {
        forEach(mx.addedNodes, function(n) {
          if (!n.localName) {
            return;
          }
          addedNode(n, isAttached);
        });
        forEach(mx.removedNodes, function(n) {
          if (!n.localName) {
            return;
          }
          detachedNode(n);
        });
      }
    });
    flags.dom && console.groupEnd();
  }
  function takeRecords(node) {
    node = window.wrap(node);
    if (!node) {
      node = window.wrap(document);
    }
    while (node.parentNode) {
      node = node.parentNode;
    }
    var observer = node.__observer;
    if (observer) {
      handler(node, observer.takeRecords());
      takeMutations();
    }
  }
  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
  function observe(inRoot) {
    if (inRoot.__observer) {
      return;
    }
    var observer = new MutationObserver(handler.bind(this, inRoot));
    observer.observe(inRoot, {
      childList: true,
      subtree: true
    });
    inRoot.__observer = observer;
  }
  function upgradeDocument(doc) {
    doc = window.wrap(doc);
    flags.dom && console.group("upgradeDocument: ", doc.baseURI.split("/").pop());
    var isMainDocument = doc === window.wrap(document);
    addedNode(doc, isMainDocument);
    observe(doc);
    flags.dom && console.groupEnd();
  }
  function upgradeDocumentTree(doc) {
    forDocumentTree(doc, upgradeDocument);
  }
  var originalCreateShadowRoot = Element.prototype.createShadowRoot;
  if (originalCreateShadowRoot) {
    Element.prototype.createShadowRoot = function() {
      var root = originalCreateShadowRoot.call(this);
      window.CustomElements.watchShadow(this);
      return root;
    };
  }
  scope.watchShadow = watchShadow;
  scope.upgradeDocumentTree = upgradeDocumentTree;
  scope.upgradeDocument = upgradeDocument;
  scope.upgradeSubtree = addedSubtree;
  scope.upgradeAll = addedNode;
  scope.attached = attached;
  scope.takeRecords = takeRecords;
});

window.CustomElements.addModule(function(scope) {
  var flags = scope.flags;
  function upgrade(node, isAttached) {
    if (node.localName === "template") {
      if (window.HTMLTemplateElement && HTMLTemplateElement.decorate) {
        HTMLTemplateElement.decorate(node);
      }
    }
    if (!node.__upgraded__ && node.nodeType === Node.ELEMENT_NODE) {
      var is = node.getAttribute("is");
      var definition = scope.getRegisteredDefinition(node.localName) || scope.getRegisteredDefinition(is);
      if (definition) {
        if (is && definition.tag == node.localName || !is && !definition.extends) {
          return upgradeWithDefinition(node, definition, isAttached);
        }
      }
    }
  }
  function upgradeWithDefinition(element, definition, isAttached) {
    flags.upgrade && console.group("upgrade:", element.localName);
    if (definition.is) {
      element.setAttribute("is", definition.is);
    }
    implementPrototype(element, definition);
    element.__upgraded__ = true;
    created(element);
    if (isAttached) {
      scope.attached(element);
    }
    scope.upgradeSubtree(element, isAttached);
    flags.upgrade && console.groupEnd();
    return element;
  }
  function implementPrototype(element, definition) {
    if (Object.__proto__) {
      element.__proto__ = definition.prototype;
    } else {
      customMixin(element, definition.prototype, definition.native);
      element.__proto__ = definition.prototype;
    }
  }
  function customMixin(inTarget, inSrc, inNative) {
    var used = {};
    var p = inSrc;
    while (p !== inNative && p !== HTMLElement.prototype) {
      var keys = Object.getOwnPropertyNames(p);
      for (var i = 0, k; k = keys[i]; i++) {
        if (!used[k]) {
          Object.defineProperty(inTarget, k, Object.getOwnPropertyDescriptor(p, k));
          used[k] = 1;
        }
      }
      p = Object.getPrototypeOf(p);
    }
  }
  function created(element) {
    if (element.createdCallback) {
      element.createdCallback();
    }
  }
  scope.upgrade = upgrade;
  scope.upgradeWithDefinition = upgradeWithDefinition;
  scope.implementPrototype = implementPrototype;
});

window.CustomElements.addModule(function(scope) {
  var isIE = scope.isIE;
  var upgradeDocumentTree = scope.upgradeDocumentTree;
  var upgradeAll = scope.upgradeAll;
  var upgradeWithDefinition = scope.upgradeWithDefinition;
  var implementPrototype = scope.implementPrototype;
  var useNative = scope.useNative;
  function register(name, options) {
    var definition = options || {};
    if (!name) {
      throw new Error("document.registerElement: first argument `name` must not be empty");
    }
    if (name.indexOf("-") < 0) {
      throw new Error("document.registerElement: first argument ('name') must contain a dash ('-'). Argument provided was '" + String(name) + "'.");
    }
    if (isReservedTag(name)) {
      throw new Error("Failed to execute 'registerElement' on 'Document': Registration failed for type '" + String(name) + "'. The type name is invalid.");
    }
    if (getRegisteredDefinition(name)) {
      throw new Error("DuplicateDefinitionError: a type with name '" + String(name) + "' is already registered");
    }
    if (!definition.prototype) {
      definition.prototype = Object.create(HTMLElement.prototype);
    }
    definition.__name = name.toLowerCase();
    if (definition.extends) {
      definition.extends = definition.extends.toLowerCase();
    }
    definition.lifecycle = definition.lifecycle || {};
    definition.ancestry = ancestry(definition.extends);
    resolveTagName(definition);
    resolvePrototypeChain(definition);
    overrideAttributeApi(definition.prototype);
    registerDefinition(definition.__name, definition);
    definition.ctor = generateConstructor(definition);
    definition.ctor.prototype = definition.prototype;
    definition.prototype.constructor = definition.ctor;
    if (scope.ready) {
      upgradeDocumentTree(document);
    }
    return definition.ctor;
  }
  function overrideAttributeApi(prototype) {
    if (prototype.setAttribute._polyfilled) {
      return;
    }
    var setAttribute = prototype.setAttribute;
    prototype.setAttribute = function(name, value) {
      changeAttribute.call(this, name, value, setAttribute);
    };
    var removeAttribute = prototype.removeAttribute;
    prototype.removeAttribute = function(name) {
      changeAttribute.call(this, name, null, removeAttribute);
    };
    prototype.setAttribute._polyfilled = true;
  }
  function changeAttribute(name, value, operation) {
    name = name.toLowerCase();
    var oldValue = this.getAttribute(name);
    operation.apply(this, arguments);
    var newValue = this.getAttribute(name);
    if (this.attributeChangedCallback && newValue !== oldValue) {
      this.attributeChangedCallback(name, oldValue, newValue);
    }
  }
  function isReservedTag(name) {
    for (var i = 0; i < reservedTagList.length; i++) {
      if (name === reservedTagList[i]) {
        return true;
      }
    }
  }
  var reservedTagList = [ "annotation-xml", "color-profile", "font-face", "font-face-src", "font-face-uri", "font-face-format", "font-face-name", "missing-glyph" ];
  function ancestry(extnds) {
    var extendee = getRegisteredDefinition(extnds);
    if (extendee) {
      return ancestry(extendee.extends).concat([ extendee ]);
    }
    return [];
  }
  function resolveTagName(definition) {
    var baseTag = definition.extends;
    for (var i = 0, a; a = definition.ancestry[i]; i++) {
      baseTag = a.is && a.tag;
    }
    definition.tag = baseTag || definition.__name;
    if (baseTag) {
      definition.is = definition.__name;
    }
  }
  function resolvePrototypeChain(definition) {
    if (!Object.__proto__) {
      var nativePrototype = HTMLElement.prototype;
      if (definition.is) {
        var inst = document.createElement(definition.tag);
        nativePrototype = Object.getPrototypeOf(inst);
      }
      var proto = definition.prototype, ancestor;
      var foundPrototype = false;
      while (proto) {
        if (proto == nativePrototype) {
          foundPrototype = true;
        }
        ancestor = Object.getPrototypeOf(proto);
        if (ancestor) {
          proto.__proto__ = ancestor;
        }
        proto = ancestor;
      }
      if (!foundPrototype) {
        console.warn(definition.tag + " prototype not found in prototype chain for " + definition.is);
      }
      definition.native = nativePrototype;
    }
  }
  function instantiate(definition) {
    return upgradeWithDefinition(domCreateElement(definition.tag), definition);
  }
  var registry = {};
  function getRegisteredDefinition(name) {
    if (name) {
      return registry[name.toLowerCase()];
    }
  }
  function registerDefinition(name, definition) {
    registry[name] = definition;
  }
  function generateConstructor(definition) {
    return function() {
      return instantiate(definition);
    };
  }
  var HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
  function createElementNS(namespace, tag, typeExtension) {
    if (namespace === HTML_NAMESPACE) {
      return createElement(tag, typeExtension);
    } else {
      return domCreateElementNS(namespace, tag);
    }
  }
  function createElement(tag, typeExtension) {
    if (tag) {
      tag = tag.toLowerCase();
    }
    if (typeExtension) {
      typeExtension = typeExtension.toLowerCase();
    }
    var definition = getRegisteredDefinition(typeExtension || tag);
    if (definition) {
      if (tag == definition.tag && typeExtension == definition.is) {
        return new definition.ctor();
      }
      if (!typeExtension && !definition.is) {
        return new definition.ctor();
      }
    }
    var element;
    if (typeExtension) {
      element = createElement(tag);
      element.setAttribute("is", typeExtension);
      return element;
    }
    element = domCreateElement(tag);
    if (tag.indexOf("-") >= 0) {
      implementPrototype(element, HTMLElement);
    }
    return element;
  }
  var domCreateElement = document.createElement.bind(document);
  var domCreateElementNS = document.createElementNS.bind(document);
  var isInstance;
  if (!Object.__proto__ && !useNative) {
    isInstance = function(obj, ctor) {
      if (obj instanceof ctor) {
        return true;
      }
      var p = obj;
      while (p) {
        if (p === ctor.prototype) {
          return true;
        }
        p = p.__proto__;
      }
      return false;
    };
  } else {
    isInstance = function(obj, base) {
      return obj instanceof base;
    };
  }
  function wrapDomMethodToForceUpgrade(obj, methodName) {
    var orig = obj[methodName];
    obj[methodName] = function() {
      var n = orig.apply(this, arguments);
      upgradeAll(n);
      return n;
    };
  }
  wrapDomMethodToForceUpgrade(Node.prototype, "cloneNode");
  wrapDomMethodToForceUpgrade(document, "importNode");
  document.registerElement = register;
  document.createElement = createElement;
  document.createElementNS = createElementNS;
  scope.registry = registry;
  scope.instanceof = isInstance;
  scope.reservedTagList = reservedTagList;
  scope.getRegisteredDefinition = getRegisteredDefinition;
  document.register = document.registerElement;
});

(function(scope) {
  var useNative = scope.useNative;
  var initializeModules = scope.initializeModules;
  var isIE = scope.isIE;
  if (useNative) {
    var nop = function() {};
    scope.watchShadow = nop;
    scope.upgrade = nop;
    scope.upgradeAll = nop;
    scope.upgradeDocumentTree = nop;
    scope.upgradeSubtree = nop;
    scope.takeRecords = nop;
    scope.instanceof = function(obj, base) {
      return obj instanceof base;
    };
  } else {
    initializeModules();
  }
  var upgradeDocumentTree = scope.upgradeDocumentTree;
  var upgradeDocument = scope.upgradeDocument;
  if (!window.wrap) {
    if (window.ShadowDOMPolyfill) {
      window.wrap = window.ShadowDOMPolyfill.wrapIfNeeded;
      window.unwrap = window.ShadowDOMPolyfill.unwrapIfNeeded;
    } else {
      window.wrap = window.unwrap = function(node) {
        return node;
      };
    }
  }
  if (window.HTMLImports) {
    window.HTMLImports.__importsParsingHook = function(elt) {
      if (elt.import) {
        upgradeDocument(wrap(elt.import));
      }
    };
  }
  function bootstrap() {
    upgradeDocumentTree(window.wrap(document));
    window.CustomElements.ready = true;
    var requestAnimationFrame = window.requestAnimationFrame || function(f) {
      setTimeout(f, 16);
    };
    requestAnimationFrame(function() {
      setTimeout(function() {
        window.CustomElements.readyTime = Date.now();
        if (window.HTMLImports) {
          window.CustomElements.elapsed = window.CustomElements.readyTime - window.HTMLImports.readyTime;
        }
        document.dispatchEvent(new CustomEvent("WebComponentsReady", {
          bubbles: true
        }));
      });
    });
  }
  if (document.readyState === "complete" || scope.flags.eager) {
    bootstrap();
  } else if (document.readyState === "interactive" && !window.attachEvent && (!window.HTMLImports || window.HTMLImports.ready)) {
    bootstrap();
  } else {
    var loadEvent = window.HTMLImports && !window.HTMLImports.ready ? "HTMLImportsLoaded" : "DOMContentLoaded";
    window.addEventListener(loadEvent, bootstrap);
  }
})(window.CustomElements);

(function(scope) {
  var style = document.createElement("style");
  style.textContent = "" + "body {" + "transition: opacity ease-in 0.2s;" + " } \n" + "body[unresolved] {" + "opacity: 0; display: block; overflow: hidden; position: relative;" + " } \n";
  var head = document.querySelector("head");
  head.insertBefore(style, head.firstChild);
})(window.WebComponents);
},{}]},{},[41])(41)
});