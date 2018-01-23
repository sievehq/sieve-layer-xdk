import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

import Login from '../Login'
import layer from '../../get-layer';
import config from '../../common/LayerConfiguration.json'
import '../../common/ui_web_style.css'

const LayerReactUI = layer.LayerReactUI
const Layer = layer.Layer
const layerClient = layer.layerClient

const LayerUIUtil = Layer.UI.UIUtils;
const { Notifier, ConversationList, ConversationView } = LayerReactUI

const utils = Layer.Utils;

class Messenger extends Component {
  constructor (props) {
    super (props)
    this.state = {
      conversationId: this.props.match.params.conversationId || null
    }
  }

  componentWillMount() {
    if (layerClient && !layerClient.user) {
      this.props.history.push({
        pathname: '/',
        previousLocation: { pathname: this.props.location.pathname }
      })
    }
  }

  onConversationSelected (e) {
    if (!e.detail.item) return
    const conversation = e.detail.item.toObject()
    this.props.history.push(`/conversations/${utils.uuid(conversation.id)}`)
  }

  componentWillReceiveProps (props) {
    if (this.props.match.params.conversationId !== props.match.params.conversationId) {
      this.setState({
        conversationId: props.match.params.conversationId || null
      })
    }
  }

  filterMessages () {}

  render() {
    const appId = config[0].app_id
    const activeConversationId = this.state.conversationId ? 'layer:///conversations/' + this.state.conversationId : ''
    const replaceableContent = ""

    return <div className="messenger">
      <div className="left-panel">
        <ConversationList
          appId={appId}
          selectedConversationId={this.state.conversationId ? activeConversationId : null}
          onConversationSelected={(e) => this.onConversationSelected(e)} />
      </div>
      <div className="right-panel">
        <ConversationView
          ref="conversationPanel"
          composeText={window.tmptext}
          queryFilter={this.filterMessages}
          replaceableContent={replaceableContent}
          onRenderListItem={LayerUIUtil.dateSeparator}
          conversationId={activeConversationId}
        />
      </div>
    </div>
  }
}

export default Messenger
