/**
 * This is a Container with direct access to all actions and state, and
 * is responsible for managing the UI of the left panel of the app.
 * That consists of the Conversation List Header and the Conversation List and all Dialogs.
 */

import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { connectQuery } from 'layer-react';
import * as MessengerActions from '../actions/messenger';
import { Layer, LayerReactUI } from '../get-layer';
import ConversationsListHeader from '../components/ConversationsListHeader';
import AnnouncementsList from '../components/announcements/MessageList';
import IdentitiesListDialog from '../components/IdentitiesListDialog';

const { Notifier, ConversationList } = LayerReactUI;

/**
 * Copy data from reducers into our properties
 */
function mapStateToProps({ app, announcementState, participantState, activeConversationState, router }) {
  return {
    user: app.user,
    appId: app.appId,
    ready: app.ready,
    showAnnouncements: announcementState.showAnnouncements,
    participantState,

    // Note: We might have an activeConversationId but no activeConversation during app initialization if the URL
    // references a Conversation
    activeConversation: activeConversationState.conversation,
    activeConversationId: router.params.conversationId ? `layer:///conversations/${router.params.conversationId}` : '',
  };
}

/**
 * Copy all actions into this.props.actions
 */
function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(MessengerActions, dispatch) };
}

/**
 * Setup all of the Queries whose data needs to be in our Redux State.
 *
 * Why are announcements the only thing here? Because Messages, Conversations and Users
 * are no longer needed in the redux state; the data is managed by the WebSDK UI Components.
 */
function getQueries() {
  return {
    announcements: Layer.Core.QueryBuilder.announcements()
  };
}


@connect(mapStateToProps, mapDispatchToProps)
@connectQuery({}, getQueries)
export default class Messenger extends Component {

  /**
   * Hide the Announcements Dialog
   */
  hideAnnouncements = (event) => {
    const { actions } = this.props;
    const { hideAnnouncements } = actions;
    if (event.target.parentNode.classList.contains('announcements-dialog')) {
      hideAnnouncements();
    }
  }

  /**
   * Hide the Participants Dialog
   */
  hideParticipants = (event) => {
    const { actions } = this.props;
    const { hideParticipants } = actions;
    if (event.target.parentNode.classList.contains('participants-dialog')) {
      hideParticipants();
    }
  }

  /**
   * Update the selected Conversation state
   */
  onConversationSelected = (event) => {
    const { actions } = this.props;
    actions.selectConversation(event.detail.item ? event.detail.item.toObject() : null);
  }

  /**
   * Update the selected Conversation state after selecting a notification
   */
  onNotificationClick = (event) => {
    const { actions } = this.props;
    actions.selectConversationId(event.detail.item.conversationId);
  }

  onMessageNotification = (event) => {
    if (event.detail.item.conversationId === this.props.activeConversationId && !event.detail.isBackground) {
      event.preventDefault();
    }
  }

  /**
   * After loading the app, see if we need to select the conversation ID to get the props.activeConversation.
   */
  componentDidMount() {
    if (this.props.activeConversationId && !this.props.activeConversation) {
      this.props.actions.selectConversationId(this.props.activeConversationId);
    }
  }

  /**
   * Render the left panel with the Conversation List and List Header
   */
  renderLeftPanel() {
    const {
      user,
      announcements,
      activeConversationId,
      actions,
      appId,
    } = this.props;

    if (navigator.userAgent.match(/android/i) || navigator.platform === 'iPhone' || navigator.platform === 'iPad') {
      document.body.classList.toggle('layer-show-conversation-list', !activeConversationId);
      document.body.classList.toggle('layer-show-conversation-view', activeConversationId);
    }
    return (
      <div className='left-panel' >
        <Notifier
          appId={appId}
          notifyInForeground="toast"
          onMessageNotification={this.onMessageNotification}
          onNotificationClick={this.onNotificationClick}></Notifier>
        <ConversationsListHeader
          user={user}
          appId={appId}
          unreadAnnouncements={Boolean(announcements.filter(item => item.isUnread).length)}
          onShowAnnouncements={actions.showAnnouncements}
          onShowParticipants={actions.showParticipants}
          onTogglePresence={actions.togglePresence} />
        <ConversationList
          appId={appId}
          selectedConversationId={activeConversationId}
          onConversationSelected={this.onConversationSelected} />
      </div>
    );
  }

  /**
   * Render the Announcements dialog.
   */
  renderAnnouncementDialog() {
    const { announcements, actions } = this.props;
    return (
      <div
        onClick={this.hideAnnouncements}
        className="announcements-dialog dialog">
        <div>
          <AnnouncementsList
            messages={announcements}
            onMarkMessageRead={actions.markMessageRead}/>
        </div>
      </div>
    );
  }

  /**
   * Render the Participants dialog.
   */
  renderParticipantDialog() {
    const { owner, participantState, actions, appId } = this.props;
    const selectedParticipants = participantState.participants;

    return (
      <div
        onClick={this.hideParticipants}
        className="participants-dialog dialog">
        <div>
          <IdentitiesListDialog
            appId={appId}
            selectedIdentities={selectedParticipants}
            onIdentitySelected={actions.addParticipant}
            onIdentityDeselected={actions.removeParticipant}
            onSave={actions.createConversation}/>
        </div>
      </div>
    );
  }

  /**
   * Render the Main UI
   */
  renderMessenger() {
    const {
      showAnnouncements,
      participantState,
      conversations,
      announcements,
    } = this.props;
    const { showParticipants } = participantState;

    // Render the left-panel which contains the Conversation List
    // and the right-panel which consists of the child components
    // (currently IndexRoute and Route with ActiveConversation)
    return (
      <div className='messenger'>
        {this.renderLeftPanel()}
        {this.props.children && React.cloneElement(this.props.children, {
          conversations
        })}
        {showAnnouncements ? this.renderAnnouncementDialog() : <span />}
        {showParticipants ? this.renderParticipantDialog() : <span />}
      </div>
    );
  }

  /**
   * Render every users favorite screen
   */
  renderEmptyScreen() {
    return (
      <div className='messenger'></div>
    );
  }

  /**
   * If we are ready, render the Messenger, else render a blank screen
   */
  render() {
    if (this.props.ready) {
      return this.renderMessenger();
    } else {
      return this.renderEmptyScreen();
    }
  }
}
