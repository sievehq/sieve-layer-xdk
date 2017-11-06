import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import * as Layer from '@layerhq/web-xdk';
import { appId } from '../common/identityServices';

// initialize lauerUI with your appID and layer sdk
const layerClient = Layer.init({
  appId,
  mixins: {

  }
});

const LayerReactUI = Layer.UI.adapters.react(React, ReactDom);
module.exports = { LayerReactUI, Layer, layerClient };

// Optional but handy for debugging via javascript console
global.client = layerClient;