import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';

import Layer from '@layerhq/web-xdk';

import { appId } from '../common/identityServices';
import '@layerhq/web-xdk/lib/ui/adapters/react';
import '@layerhq/web-xdk/lib/ui/messages/status/layer-status-message-view';
import '@layerhq/web-xdk/lib/ui/messages/receipt/layer-receipt-message-view';
import '@layerhq/web-xdk/lib/ui/messages/choice/layer-choice-message-view';
import '@layerhq/web-xdk/lib/ui/messages/carousel/layer-carousel-message-view';
import '@layerhq/web-xdk/lib/ui/messages/buttons/layer-buttons-message-view';
import '@layerhq/web-xdk/lib/ui/messages/file/layer-file-message-view';
import '@layerhq/web-xdk/lib/ui/messages/link/layer-link-message-view';
import '@layerhq/web-xdk/lib/ui/messages/location/layer-location-message-view';
import '@layerhq/web-xdk/lib/ui/messages/product/layer-product-message-view';
import '@layerhq/web-xdk/lib/ui/messages/feedback/layer-feedback-message-view';
import '@layerhq/web-xdk/lib/ui/components/layer-send-button';
import '@layerhq/web-xdk/lib/ui/components/layer-file-upload-button';
import '@layerhq/web-xdk/lib/ui/components/layer-notifier';
import '@layerhq/web-xdk/lib/ui/components/layer-conversation-list';
import '@layerhq/web-xdk/lib/ui/components/layer-identity-list';

// initialize lauerUI with your appID and layer sdk
const layerClient = Layer.init({
  appId,
  useEmojiImages: false,
  textHandlers: ['autolinker', 'emoji', 'newline'],
  mixins: {
    'layer-avatar': [
      {
        methods: {
          onCreate() {
            console.log("MIXIN 1");
          }
        }
      },
      {
        methods: {
          onCreate() {
            console.log("MIXIN 2");
          }
        }
      }
    ]
  }
});


const LayerReactUI = Layer.UI.adapters.react(React, ReactDom);
module.exports = { LayerReactUI, Layer, layerClient };

// Optional but handy for debugging via javascript console
global.client = layerClient;