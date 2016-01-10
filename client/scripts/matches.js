var React = require('react');
var classNames = require('classnames');
var UserView = require('UserView');
var ExpirationDateCountDown = require('ExpirationDateCountDown');
var BaseCard = require('Cards').BaseCard;
var CardsContainer = require('Cards').CardsContainer;

var CompanyMatchesCard = React.createClass({
  getInitialState() {
    return {
      showUserDetail: false
    };
  },
  toggleUserDetail() {
    this.setState({
      showUserDetail: !this.state.showUserDetail
    });
  },
  componentWillMount() {
    this.setState({
      userInfo: this.props.userInfo
    });
  },
  like(userId, like, reason) {
    var _this= this;
    jQuery.get('/likeu/'+userId, {matchId: this.props.matchId, like: like, reason: JSON.stringify(reason)}, function (data) {
      var newUserInfo = jQuery.extend({}, _this.state.userInfo);
      newUserInfo.like = like;
      _this.setState({
        userInfo: newUserInfo
      });
      console.log(data);
    });
  },
  render() {
    var userInfo = this.state.userInfo;
    var skillset;
    if (Array.isArray(userInfo.skills) && userInfo.skills.length > 0) {
      userInfo.skills = userInfo.skills.slice(0, 5);
      skillset = userInfo.skills.map(function (skill, i) {
        return <span key={i} className='user-card-skill'>{skill}</span>
      }, this);
    }
    var likeInfo = {
      like: userInfo.like,
      mutual: userInfo.mutual,
    };
    var rejectionConfirmationHeader = <div className='base-card-custom-content'>Not interested in <span className='user-card-rej-confirmation-header-name'>{userInfo.firstName}</span>?</div>;
    var rejectionConfirmationContent = <div>Please share with us the reason(s) for passing this candidate. Your feedback helps us to find better matches for you soon.</div>; 
    return (
      <BaseCard likeInfo={likeInfo} rejectionReasonFormConfig={this.props.rejectionFormConfig} rejectionConfirmationHeader={rejectionConfirmationHeader} rejectionConfirmationContent={rejectionConfirmationContent} rejectionDialogConfirmationText='Pass this candidate' requestText='Request interview' onLike={this.like.bind(this, userInfo.id, true, {})} onReject={this.like.bind(this, userInfo.id, false)}>
        <div className='user-card-user-pic-container'>
          <img className='user-card-user-pic' src={userInfo.pictureUrl} />
        </div>
        <div className='base-card-title'>
          <span className='user-card-user-first-name'>{userInfo.firstName}, </span>
          <span className='user-card-user-headline'>{userInfo.headline}</span>
        </div>
        <div className='user-card-skillset'>
          {skillset}
        </div>
        <p className='base-card-details'>{userInfo.summary}</p>
        <a className='base-card-details-link' onClick={this.toggleUserDetail}>View profile details</a>
        <Modal className='user-card-dialog' show={this.state.showUserDetail}>
          <Modal.Header>User</Modal.Header>
          <Modal.Body><UserView userData={userInfo} showStatusButton={false} /></Modal.Body>
          <Modal.Footer><Button onClick={this.toggleUserDetail}>Close</Button></Modal.Footer>
        </Modal>
      </BaseCard>
    );
  }
});

var CompanyMatches = React.createClass({
  render() {
    var users = this.props.userData.map(function (user, i) {
      return <CompanyMatchesCard key={user.id} matchId={this.props.matchId} rejectionFormConfig={this.props.rejectionFormConfig} userInfo={user} />;
    }, this);
    var otherUsers = this.props.otherUserData.map(function (user, i) {
      return <CompanyMatchesCard key={user.id} matchId={this.props.matchId} userInfo={user} />;
    }, this);
    var newCardsHeaderContent = (
      <div className='match-header'>
        <span>New Candidates for </span>
        <span className='job-title'>{this.props.jobInfo.title}</span>
        <span>, please respond in </span>
        <ExpirationDateCountDown expirationDate={this.props.expirationDate}/>
      </div>
    );
    return (
      <CardsContainer newCards={users} acceptedCards={otherUsers} newCardsHeaderContent={newCardsHeaderContent} />
    );
  }
});

module.exports = {
  CompanyMatches: CompanyMatches
};
