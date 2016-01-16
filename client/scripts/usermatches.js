var React = require('react');
var classNames = require('classnames');
var Services = require('./Services.js');
var ExpirationDateCountDown = require('ExpirationDateCountDown');
var BaseCard = require('Cards').BaseCard;
var CardsContainer = require('Cards').CardsContainer;
var t = require('tcomb-form');

var UserMatchesCard = React.createClass({
  getInitialState() {
    return {
      showJobDetail: false
    };
  },
  toggleJobDetail() {
    this.setState({
      showJobDetail: !this.state.showJobDetail
    });
  },
  componentWillMount() {
    this.setState({
      likeInfo: this.props.likeInfo
    });
  },
  like(likeId, like, reason) {
    var _this= this;
    Services.GetLikeJ(likeId, like, reason).then(function (data) {
      console.log(data);
      var newLikeInfo = jQuery.extend({}, _this.state.likeInfo);
      newLikeInfo.like = like;
      newLikeInfo.mutual = like;
      _this.setState({
        likeInfo: newLikeInfo
      });
    });
  },
  render() {
    var likeInfo = this.state.likeInfo;
    var description = likeInfo.job.description || '';
    if (description.length > 100) {
      description = description.substr(0, 100);
    }
    var expirationInfo = (
      <div className='company-card-expiration'>
        <span>Expires in: </span>
        <span><ExpirationDateCountDown expirationDate={likeInfo.expireDate}/></span>
      </div>
    );
    if (likeInfo.mutual || (typeof likeInfo.like === 'boolean' && !likeInfo.like)) {
      expirationInfo = undefined;
    }
    //rejectionConfirmationHeader,rejectionConfirmationContent,rejectionReasonType
    var userMatchesCardJob = (
      <span className='user-matches-card-job'>
        <span>{likeInfo.job.title}</span>
          <span> &#124; </span>
        <span>{likeInfo.job.companyName}</span>
      </span>
    );
    var rejectionConfirmationHeader = <div className='base-card-custom-content'>Not interested in {userMatchesCardJob}?</div>;
    var rejectionConfirmationContent = <div>Please share with us the reason(s) for passing this position. Your feedback helps us to find better matches for you soon.</div>;
    return (
      <BaseCard className='user-matches-card' rejectionConfirmationHeader={rejectionConfirmationHeader} rejectionConfirmationContent={rejectionConfirmationContent} rejectionReasonFormConfig={this.props.rejectionFormConfig} rejectionDialogConfirmationText='Pass this position' likeInfo={likeInfo} requestText='Accept request' onLike={this.like.bind(this, likeInfo.id, true, {})} onReject={this.like.bind(this, likeInfo.id, false)}>
        {expirationInfo}
        <div className='base-card-title'>
          {userMatchesCardJob}
        </div>
        <p className='base-card-details'>
          {description}
        </p>
        <a className='base-card-details-link' onClick={this.toggleJobDetail}>View job description</a>
        <Modal className='company-card-dialog' show={this.state.showJobDetail}>
          <Modal.Header>
            <span>{likeInfo.job.title}</span>
            <span> &#124; </span>
            <span>{likeInfo.job.companyName}</span>
          </Modal.Header>
          <Modal.Body>
            <div className='company-card-dialog-body'>
              {likeInfo.job.description}
            </div>
          </Modal.Body>
          <Modal.Footer><Button onClick={this.toggleJobDetail}>Close</Button></Modal.Footer>
        </Modal>
      </BaseCard>
    );
  }
});

var UserMatches = React.createClass({
  getInitialState() {
    return {
      likes: [],
      otherLikes: []
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.likesData) {
      var likesData = nextProps.likesData;
      this.setState({
        likes: likesData.likes,
        otherLikes: likesData.otherLikes,
        rejectionFormConfig: likesData.formConfig
      });
    }
  },

  componentWillMount () {
    if (this.props.likesData) {
      var likesData = this.props.likesData;
      this.setState({
        likes: likesData.likes,
        otherLikes: likesData.otherLikes,
        rejectionFormConfig: likesData.formConfig
      });
    }
  },

  componentWillMount () {
    if (this.props.likesData) {
      var likesData = this.props.likesData;
      this.setState({
        likes: likesData.likes,
        otherLikes: likesData.otherLikes,
        rejectionFormConfig: likesData.formConfig
      });
    }
  },

  render() {
    var likes = this.state.likes.map(function (like, i) {
      if (typeof like.mutual !== 'boolean') {
        like.like = undefined;
      } else {
        like.like = like.mutual;
      }
      like.expireDate = new Date(like.expireDate);
      return <UserMatchesCard key={like.id} likeInfo={like} rejectionFormConfig={this.state.rejectionFormConfig} />;
    }, this);
    var otherLikes = this.state.otherLikes.map(function (like, i) {
      like.like = like.mutual;
      like.expireDate = new Date(like.expireDate);
      return <UserMatchesCard key={like.id} likeInfo={like} />;
    }, this);
    return (
      <CardsContainer newCards={likes} acceptedCards={otherLikes} />
    );
  }
});

module.exports = {
  UserMatches: UserMatches
};
