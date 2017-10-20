/**
 * This Component renders a dialog for selecting users for a new Conversation.
 */
import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { LayerReactUI } from '../get-layer';

const { IdentityList } = LayerReactUI;

export default class IdentitiesListDialog extends Component {

  onSave = () => {
    if (this.props.selectedIdentities.length) this.props.onSave();
  }

  /**
   * Extract the Identity object before forwarding the callback up to the parent.
   */
  onIdentitySelected = (event) => {
    const { actions } = this.props;
    const identity  = event.detail.item.toObject();
    if (this.props.onIdentitySelected) this.props.onIdentitySelected(identity);
  }

  /**
   * Extract the identity object before forwarding the callback up to the parent.
   */
  onIdentityDeselected = (event) => {
    const { actions } = this.props;
    const identity = event.detail.item.toObject();
    if (this.props.onIdentitySelected) this.props.onIdentityDeselected(identity);
  }


  /**
   * Render the Identity List Dialog
   */
  render() {
    const { selectedIdentities, appId } = this.props;
    return (
      <div className="participant-list-container dialog-container">
        <div className="panel-header">
          <span className="title">Select Participants</span>
        </div>
        <IdentityList
          appId={appId}
          onIdentitySelected={this.onIdentitySelected}
          onIdentityDeselected={this.onIdentityDeselected}
          selectedIdentities={selectedIdentities}
        />
        <div className="button-panel">
          <button onClick={this.onSave} className="button-ok">OK</button>
        </div>
      </div>
    );
  }
}
