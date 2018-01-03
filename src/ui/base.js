/**
 * @class Layer.UI
 * @static
 *
 * The layerUI contains utilities for working with the layerUI components.
 *
 * The key method to know here is the `init()` method.  Any use of the library will need a call:
 *
 * ```
 * Layer.UI.init({
 *   appId: 'layer:///apps/staging/my-app-id'
 * });
 * ```
 *
 * Or
 *
 * Layer.UI.init({
 *   appId: 'layer:///apps/staging/my-app-id'
 * });
 * ```
 *
 * See layerUI.settings for more options to Layer.UI.init.
 *
 * One other property deserving special mention: layerUI.adapters.  Adapters help you to use these widgets within other UI frameworks.
 * It is not required to use an adapter, but it solves many inconsistencies in how these frameworks handle webcomponents built using this framework.
 *
 * While there are many other methods defined here, for new projects ignore everything except layerUI.settings, Layer.UI.init and layerUI.adapters.
 */
import { LayerError } from '../core';
import Constants from './constants';
import { animatedScrollTo, animatedScrollLeftTo } from './utils/animated-scroll';
import ComponentServices, { ComponentsHash } from './component-services';
import Settings from './settings';
import MessageHandlers from './handlers/message/message-handlers';
import TextHandlers from './handlers/text/text-handlers';
import ListSeparatorManager from './utils/list-separator-manager';
import Adapters from './adapters';
import MessageActions from './message-actions';

/*
 * NOTES TO MAINTAINER:
 *
 * * Avoid using `this`, rather use `Layer.UI` instead.  Otherwise usage such as:
 *   `import { registerMessage } from '@layerhq/web-xdk'` will give developers a method that
 *   needs scope but won't have it.
 */
const layerUI = {
  Constants,
  animatedScrollTo,
  animatedScrollLeftTo,
  settings: Settings,
  buildStyle: ComponentServices.buildStyle,
  buildAndRegisterTemplate: ComponentServices.buildAndRegisterTemplate,
  registerTemplate: ComponentServices.registerTemplate,
  MessageHandlers,
  TextHandlers,
  components: ComponentsHash,   // backwards compatability
  ComponentsHash,
  ListSeparatorManager,
  adapters: Adapters,
  utils: {},
  MessageActions,
};



/**
 * Array of mime types that are used in Status messages (not rendered as sent nor received)
 *
 * @property {String[]} statusMimeTypes
 * @protected
 */
layerUI.statusMimeTypes = [];

/**
 * Register a Message Type Model to be treated as a Status Message instead of a Message Sent/Received.
 *
 * A Status Message is rendered without Avatar, sender, timestamp, etc...
 *
 * ```
 * Layer.UI.registerStatusModel(MyModelClass);
 * ```
 *
 * @method registerStatusModel
 * @param {Function} StatusModel    Pass in the Class Definition for a Layer.Core.MessageTypeModel subclass
 */
layerUI.registerStatusModel = StatusModel => layerUI.statusMimeTypes.push(StatusModel.MIMEType);

/**
 * Register a UI Component.
 *
 * See Layer.UI.Component for more details.
 *
 * @method registerComponent
 * @static
 * @param {String} tagName    Tag name that is being defined (`layer-avatar`)
 * @param {Object} classDef    Definition of your class
 * @param {Object} classDef.properties    Definition of your class properties
 * @param {Object} classDef.methods    Definition of your class methods
 * @param {String[]} classDef.events    Array of events to listen for and repackage as event handler properties
 * @param {Mixed} classDef.template     A `<template />` node or a template string such as `<div><button /></div>`
 * @param {String} classDef.style       A String with CSS styles for this widget
 */

module.exports = layerUI;

