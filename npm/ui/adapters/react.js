/**
 * Call this function to initialize all of the react components needed to handle the Layer UI for Web widgets.
 *
 * Before using this, please note that Layer.UI.init() must be called prior to calling Layer.UI.adapters.react().
 *
 * Initialize with:
 *
 * ```
 * import React from 'react';
 * import ReactDom from 'react-dom';
 * import '@layerhq/web-xdk/ui/adapters/react';
 * const { ConversationView, ConversationList, UserList, Notifier } = Layer.UI.adapters.react(React, ReactDom);
 * ```
 *
 * Calling this will expose the following React Components:
 *
 * * ConversationView: A wrapper around a Layer.UI.components.ConversationView
 * * ConversationsList: A wrapper around a Layer.UI.components.ConversationListPanel
 * * IdentitiesList: A wrapper around a Layer.UI.components.IdentityListPanel
 * * Notifier: A wrapper around a Layer.UI.components.misc.Notifier
 * * SendButton: A wrapper around a Layer.UI.components.SendButton
 * * FileUploadButton: A wrapper around a Layer.UI.components.FileUploadButton
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
 * To insure that Layer.UI.init() is called before Layer.UI.adapters.react(), and each is only called once, we
 * recommend puttings this code in its own module:
 *
 * ```
 * import React, { Component, PropTypes } from 'react';
 * import ReactDom from 'react-dom';
 * import '@layerhq/web-xdk/ui/adapters/react';
 * import Layer from '@layerhq/web-xdk';
 *
 * Layer.init({
 *   appId: 'layer:///apps/staging/my-app-id'
 * });
 * const LayerUIWidgets = Layer.UI.adapters.react(React, ReactDom);
 * module.exports = LayerUIWidgets;
 * ```
 *
 * Now anywhere you need access to the LayerUIWidgets library can import this module and expect everything to
 * evaluate at the correct time, correct order, and only evaluate once.
 *
 * ### Importing
 *
 * Not included with the standard build. To import:
 *
 * ```
 * import '@layerhq/web-xdk/ui/adapters/react';
 * ```
 *
 * @class Layer.UI.adapters.react
 * @singleton
 * @param {Object} React - Pass in the reactJS library
 * @param {Object} ReactDom - Pass in the ReactDom library
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _componentServices = require('../component-services');

var _index = require('./index');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }


var libraryResult = void 0;
function initReact(React, ReactDom) {
  if (libraryResult) return libraryResult;
  libraryResult = {};

  // Gather all UI Components flagged as Main Components; other components don't require special React Components for direct use.
  Object.keys(_componentServices.ComponentsHash).forEach(function (componentName) {
    return defineComponent(componentName);
  });

  function defineComponent(componentName) {
    var component = _componentServices.ComponentsHash[componentName];

    // Get the camel case Component name
    var className = (componentName.substring(0, 1).toUpperCase() + componentName.substring(1).replace(/-(.)/g, function (str, value) {
      return value.toUpperCase();
    })).replace(/^Layer/, '');

    libraryResult[className] = function (_React$Component) {
      _inherits(_class, _React$Component);

      function _class(props) {
        _classCallCheck(this, _class);

        var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, props));

        if (_this.props.replaceableContent && !_this.replaceableContent) {
          _this.replaceableContent = {};
          Object.keys(_this.props.replaceableContent).forEach(function (nodeName) {
            var value = _this.props.replaceableContent[nodeName];
            if (typeof value === 'function' && !value.replaceableIsSetup) {
              _this.replaceableContent[nodeName] = function (widget, parent) {
                var result = value(widget);
                if (result) {
                  if (typeof result === 'string') {
                    return result;
                  } else if (!(result instanceof HTMLElement)) {

                    // React does bad stuff if you give it a component without children to ReactDom.render()
                    if (!result.props.children) {
                      result = React.createElement('div', null, result);
                    }

                    // Render it
                    var tmpNode = parent || document.createElement('div');
                    widget.addEventListener('layer-widget-destroyed', function () {
                      return ReactDom.unmountComponentAtNode(tmpNode);
                    });
                    return ReactDom.render(result, tmpNode);
                  } else {
                    return result;
                  }
                }
              };
            } else {
              _this.replaceableContent[nodeName] = value;
            }
          });
        }
        return _this;
      }

      /**
       * On mounting, copy in all properties, and optionally setup a Query.
       *
       * Delay added to prevent Webcomponents property setters from being blown away in safari and firefox
       *
       * @method componentDidMount
       */


      _createClass(_class, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          var _this2 = this;

          this.node.componentDidMount = true;
          // Get the properties/attributes that match those used in this.props
          var props = component.properties.filter(function (property) {
            return property.propertyName in _this2.props || property.attributeName in _this2.props;
          });

          // Set the webcomponent properties
          props.forEach(function (propDef) {
            var value = propDef.propertyName in _this2.props ? _this2.props[propDef.propertyName] : _this2.props[propDef.attributeName];
            if (propDef.propertyName === 'replaceableContent' && _this2.replaceableContent) value = _this2.replaceableContent;
            if (propDef.type === HTMLElement && value) {
              value = _this2.handleReactDom(propDef, value);
            }
            if (!_this2.node.properties) _this2.node.properties = {};
            if (!_this2.node.properties._internalState) {
              _this2.node.properties[propDef.propertyName] = value;
            } else {
              _this2.node[propDef.propertyName] = value;
            }
          });

          // Browsers running the polyfil may not yet have initialized the component at this point.
          // Force them to be initialized so that by the time the parent component's didComponentMount
          // is called, this will be an initialized widget.
          if (!this.node._onAfterCreate) {
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent('HTMLImportsLoaded', true, true, null);
            document.dispatchEvent(evt);
          }

          // The webcomponents polyfil is unable to initilize a component thats in
          // a DocumentFragment so it must follow a more typical lifecycle
          if (this.node._onAfterCreate) this.node._onAfterCreate();

          this._setupStandardProps();
        }

        /**
         * Copy all properties into the dom node, but never let React recreate this widget.
         *
         * @method shouldComponentUpdate
         */

      }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps) {
          var _this3 = this;

          // Get the properties/attributes that match those used in this.props
          var props = component.properties.filter(function (property) {
            return nextProps[property.propertyName] !== undefined || nextProps[property.attributeName] !== undefined;
          });

          // Set the webcomponent properties if they have changed
          props.forEach(function (propDef) {
            var name = propDef.propertyName in _this3.props ? propDef.propertyName : propDef.attributeName;
            var value = nextProps[name];
            if (propDef.propertyName === 'replaceableContent' && _this3.replaceableContent) value = _this3.replaceableContent;
            if (propDef.type === HTMLElement && value) {
              value = _this3.handleReactDom(propDef, value);
            }

            if (value !== _this3.props[name]) {
              _this3.node[propDef.propertyName] = value;
            }
          }, this);

          this._setupStandardProps();
          return false;
        }
      }, {
        key: '_setupStandardProps',
        value: function _setupStandardProps() {
          var _this4 = this;

          // CSS Styles
          Object.keys(this.props.style || {}).forEach(function (styleName) {
            return _this4.node.style[styleName] = _this4.props.style[styleName];
          });

          // CSS Classes
          if (this.props.className) {
            var classNames = this.props.className.split(/\s+/);
            (this._addedClassNames || []).forEach(function (classNameInner) {
              if (classNames.indexOf(classNameInner) === -1) _this4.node.classList.remove(classNameInner);
            });

            classNames.forEach(function (classNameInner) {
              return _this4.node.classList.add(classNameInner);
            });
            this._addedClassNames = [].concat(classNames);
          }
        }

        /**
         * If the property type is HTMLElement, assume the value is a function that generates React Components, or it IS a React Component that need to be wrapped in an HTMLElement and set as the property value.
         *
         * @method handleReactDom
         * @param {Object} propDef
         * @param {Function|Object} value
         */

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

        /**
         * Render method should only be called once and creates the React element with the webcomponent.
         *
         * @method render
         */

      }, {
        key: 'render',
        value: function render() {
          var _this5 = this;

          return React.createElement(componentName, {
            ref: function ref(node) {
              _this5.node = node;
            },
            id: this.props.id,
            children: this.props.children
          });
        }
      }]);

      return _class;
    }(React.Component);
  }
  return libraryResult;
}

module.exports = initReact;
(0, _index.register)('react', initReact);