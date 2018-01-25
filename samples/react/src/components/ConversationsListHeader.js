/**
 * This Component provides a title over the conversation list
 * and a button for creating a new Conversation.
 */
import React, { Component } from 'react';
import { LayerReactUI } from '../get-layer';

const { Presence } = LayerReactUI;

export default class ConversationListHeader extends Component {
  /**
   * Show the Participants Dialog
   */
  handleShowParticipants = (event) => {
    event.preventDefault();
    this.props.onShowParticipants();
  }

  /**
   * Show the Announcements Dialog
   */
  showAnnouncements = (event) => {
    event.preventDefault();
    this.props.onShowAnnouncements();
  }

  /**
   * Toggle presence between BUSY and AVAILABLE
   */
  togglePresence = (event) => {
    event.preventDefault();
    this.props.onTogglePresence();
  }

  render() {
    const { unreadAnnouncements, user, appId } = this.props;
    const announcementClasses = ['announcements-button'];
    if (unreadAnnouncements) announcementClasses.push('unread-announcements');
    return (
      <div className='panel-header conversations-header'>
        <Presence
          item={user}
          appId={appId}
          onPresenceClick={this.togglePresence} />

        <div className='title'>{user.displayName}'s Conversations</div>
        <a className={announcementClasses.join(' ')} onClick={this.showAnnouncements}>
          <i className="icon fa fa-bullhorn"></i>
        </a>
        <a href='#' onClick={this.handleShowParticipants}>
          <i className="icon fa fa-pencil-square-o"></i>
        </a>
      </div>
    );
  }
}
