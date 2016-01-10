var classNames = require('classnames');
var t = require('tcomb-form');
var Form = t.form.Form;
var formGenerationUtils = require('./formGenerationUtils.js');

/* CardsContainer */

var CardsContainer = React.createClass({
  render() {
    /*as tabs will be set to float: right, these tabs will render in the opposite order*/
    return (
      <div className='matches-page'>
        <TabbedArea defaultActiveKey={1}>
          <TabPane eventKey={2} tab={'Accepted (' + React.Children.count(this.props.acceptedCards) + ')'}>{this.props.acceptedCards}</TabPane>
          <TabPane eventKey={1} tab={'New (' + React.Children.count(this.props.newCards) + ')'}>
            {this.props.newCardsHeaderContent}
            <div className='cards-container-main-container'>
              {this.props.newCards}
            </div>
          </TabPane>
        </TabbedArea>
      </div>
    );
  }
});

/* BaseCard */
var BaseCard = React.createClass({
  getDefaultProps() {
    return {
      likeInfo: {},
      requestText: 'Accept',
      rejectText: 'No, thanks',
      likedText: 'Accepted',
      rejectedText: 'Rejected',
      rejectionDialogConfirmationText: 'Pass'
    }
  },
  getInitialState() {
    return {
      showRejectionDialogConfirmation: false
    };
  },
  toggleRejectionDialog() {
    this.setState({
      showRejectionDialogConfirmation: !this.state.showRejectionDialogConfirmation
    });
  },
  onRejectionDialogConfirm() {
    var rejectionReason = this.refs.rejectionForm.getValue();
    this.props.onReject(rejectionReason);
    this.toggleRejectionDialog();
  },
  render() {
    var likeButton;
    var rejectButton;
    var likedRibbon;
    var rejectedRibbon;
    var likeInfo = this.props.likeInfo;
    if (typeof likeInfo.like === 'undefined') {
      likeButton = <a onClick={this.props.onLike} className='base-card-details-button base-card-details-request'>{this.props.requestText}</a>;
      rejectButton = <a onClick={this.toggleRejectionDialog} className='base-card-details-button base-card-details-reject'>{this.props.rejectText}</a>;
    } else if (likeInfo.like === true) {
      likedRibbon = <div className='base-card-like-status base-card-like-status-requested'>Request sent</div>;
      if (likeInfo.mutual) {
        likedRibbon = <div className='base-card-like-status base-card-like-status-requested'>Accepted</div>;
      }
    } else if (likeInfo.like === false) {
      rejectedRibbon = <div className='base-card-like-status base-card-like-status-rejected'>Rejected</div>;
    }
    var classes = classNames('base-card-container', this.props.className);
    var rejectionReasonFormConfig;
    if (this.props.rejectionReasonFormConfig) {
      rejectionReasonFormConfig = formGenerationUtils.generateForm(this.props.rejectionReasonFormConfig)
    }
    return (
      <div className={classes}>
        {this.props.children}
        {likeButton}
        {rejectButton}
        {likedRibbon}
        {rejectedRibbon}
        <Modal className='base-card-rejection-confirmation-dialog' show={this.state.showRejectionDialogConfirmation}>
          <Modal.Header>
            {this.props.rejectionConfirmationHeader}
          </Modal.Header>
          <Modal.Body>
            <div className='base-card-rejection-confirmation-dialog-body'>
              {this.props.rejectionConfirmationContent}
              <Form
                ref='rejectionForm'
                type={rejectionReasonFormConfig}
              />
            </div>
          </Modal.Body>
          <Modal.Footer><a className='base-card-details-button base-card-details-reject base-card-rejection-confirm' onClick={this.onRejectionDialogConfirm}>{this.props.rejectionDialogConfirmationText}</a><a className='base-card-details-button base-card-details-reject' onClick={this.toggleRejectionDialog}>Cancel</a></Modal.Footer>
        </Modal>
      </div>
    );
  }
});

module.exports = {
  CardsContainer: CardsContainer,
  BaseCard: BaseCard
};
