var React = require('react');
var classNames = require('classnames');
var Services = require('./Services.js');
var ExpirationDateCountDown = require('ExpirationDateCountDown');
var BaseCard = require('Cards').BaseCard;
var CardsContainer = require('Cards').CardsContainer;

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
  like(likeId, like) {
    var _this= this;
    Services.GetLikeJ(likeId, like).then(function (data) {
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
    return (
      <BaseCard likeInfo={likeInfo} requestText='Accept request' onLike={this.like.bind(this, likeInfo.id, true)} onReject={this.like.bind(this, likeInfo.id, false)}>
        {expirationInfo}
        <div className='base-card-title'>
          <span>{likeInfo.job.title}</span>
          <span> &#124; </span>
          <span>{likeInfo.job.companyName}</span>
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
  componentWillMount () {
    var _this = this;
    Services.GetLikes().then(function (response) {
      _this.setState({
        likes: response.likes,
        otherLikes: response.otherLikes
      });
    });
  },

  render() {
    var likes = this.state.likes.map(function (like, i) {
      if (typeof like.mutual !== 'boolean') {
        like.like = undefined;
      } else {
        like.like = like.mutual;
      }
      like.expireDate = new Date(like.expireDate);
      return <UserMatchesCard key={like.id} likeInfo={like} />;
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
