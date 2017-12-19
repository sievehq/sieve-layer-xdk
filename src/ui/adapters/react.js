import layerUI from '../base';

/**
 * Call this function to initialize all of the react components needed to handle the Layer UI for Web widgets.
 *
 * Before using this, please note that layer.UI.init() must be called prior to calling layerUI.adapters.react().
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
 * * ConversationPanel: A wrapper around a Layer.UI.components.ConversationView
 * * ConversationsList: A wrapper around a layer.UI.components.ConversationsListPanel
 * * IdentitiesList: A wrapper around a layer.UI.components.IdentityListPanel
 * * Notifier: A wrapper around a layer.UI.components.misc.Notifier
 * * SendButton: A wrapper around a layer.UI.components.SendButton
 * * FileUploadButton: A wrapper around a layer.UI.components.FileUploadButton
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
 * @class layer.UI.adapters.react
 * @singleton
 * @param {Object} React - Pass in the reactJS library
 * @param {Object} ReactDom - Pass in the ReactDom library
 */
let libraryResult;
function initReact(React, ReactDom) {
  if (libraryResult) return libraryResult;
  libraryResult = {};

  // Gather all UI Components flagged as Main Components; other components don't require special React Components for direct use.
  Object.keys(layerUI.components)
  .forEach((componentName) => {
    const component = layerUI.components[componentName];

    // Get the camel case Component name
    const className = (componentName.substring(0, 1).toUpperCase() +
      componentName.substring(1)
      .replace(/-(.)/g, (str, value) => value.toUpperCase()))
        .replace(/^Layer/, '');

    libraryResult[className] = class extends React.Component {

      constructor(props) {
        super(props);

        if (this.props.replaceableContent && !this.replaceableContent) {
          this.replaceableContent = {};
          Object.keys(this.props.replaceableContent).forEach((nodeName) => {
            const value = this.props.replaceableContent[nodeName];
            if (typeof value === 'function' && !value.replaceableIsSetup) {
              this.replaceableContent[nodeName] = (widget, parent) => {
                let result = value(widget);
                if (result && !(result instanceof HTMLElement)) {

                  // React does bad stuff if you give it a component without children to ReactDom.render()
                  if (!result.props.children) {
                    result = React.createElement('div', null, result);
                  }

                  // Render it
                  const tmpNode = parent || document.createElement('div');
                  widget.addEventListener('layer-widget-destroyed', () => ReactDom.unmountComponentAtNode(tmpNode));
                  return ReactDom.render(result, tmpNode);
                } else {
                  return result;
                }
              };
            }
          });
        }
      }

      /**
       * On mounting, copy in all properties, and optionally setup a Query.
       *
       * Delay added to prevent Webcomponents property setters from being blown away in safari and firefox
       */
      componentDidMount() {
        this.node.componentDidMount = true;
        // Get the properties/attributes that match those used in this.props
        const props = component.properties.filter(property =>
          property.propertyName in this.props || property.attributeName in this.props);

        // Set the webcomponent properties
        props.forEach((propDef) => {
          let value = propDef.propertyName in this.props ?
            this.props[propDef.propertyName] : this.props[propDef.attributeName];
          if (propDef.propertyName === 'replaceableContent' && this.replaceableContent) value = this.replaceableContent;
          if (propDef.type === HTMLElement && value) {
            value = this.handleReactDom(propDef, value);
          }
          if (!this.node.properties) this.node.properties = {};
          if (!this.node.properties._internalState) {
            this.node.properties[propDef.propertyName] = value;
          } else {
            this.node[propDef.propertyName] = value;
          }
        });

        // Browsers running the polyfil may not yet have initialized the component at this point.
        // Force them to be initialized so that by the time the parent component's didComponentMount
        // is called, this will be an initialized widget.
        if (!this.node._onAfterCreate) {
          const evt = document.createEvent('CustomEvent');
          evt.initCustomEvent('HTMLImportsLoaded', true, true, null);
          document.dispatchEvent(evt);
        }

        // The webcomponents polyfil is unable to initilize a component thats in
        // a DocumentFragment so it must follow a more typical lifecycle
        if (this.node._onAfterCreate) this.node._onAfterCreate();

      }

      /**
       * Copy all properties into the dom node, but never let React recreate this widget.
       */
      shouldComponentUpdate(nextProps) {
        // Get the properties/attributes that match those used in this.props
        const props = component.properties.filter(property =>
          this.props[property.propertyName] || this.props[property.attributeName]);

        // Set the webcomponent properties if they have changed
        props.forEach((propDef) => {
          const name = propDef.propertyName in this.props ? propDef.propertyName : propDef.attributeName;
          let value = nextProps[name];
          if (propDef.propertyName === 'replaceableContent' && this.replaceableContent) value = this.replaceableContent;
          if (propDef.type === HTMLElement && value) {
            value = this.handleReactDom(propDef, value);
          }

          if (value !== this.props[name]) {
            this.node[propDef.propertyName] = value;
          }
        }, this);
        return false;
      }

      handleReactDom(propDef, value) {
        if (!this.layerUIGeneratedNodes) this.layerUIGeneratedNodes = {};

        if (Array.isArray(value)) {
          const array = [];
          if (!this.layerUIGeneratedNodes[propDef.propertyName]) {
            this.layerUIGeneratedNodes[propDef.propertyName] = array;
          }
          array.length = value.length;
          value.forEach((item, index) => {
            if (item.tagName) {
              array[index] = item;
            } else {
              const node = array[index] || document.createElement('div');
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


      render() {
        return React.createElement(componentName, {
          ref: (node) => { this.node = node; },
          id: this.props.id,
          children: this.props.children,
        });
      }
    }
  });
  return libraryResult;
}

module.exports = initReact;
layerUI.addAdapter('react', initReact);
