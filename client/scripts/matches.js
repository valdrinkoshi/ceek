var React = require('react');
var classNames = require('classnames');
var UserView = require('UserView');

var ExpirationDateCountDown = React.createClass({
  getInitialState () {
    return {
      hours: -1,
      minutes: -1
    };
  },
  computeRemainingTime () {
    var expirationDate = this.props.expirationDate;
    var today = new Date();
    var expired = true;
    var hours = 0;
    var minutes = 0;
    if (today < expirationDate) {
      var dateDiff = expirationDate - today;
      var diffSeconds = dateDiff/1000;
      var hoursInADay = (60*60);
      hours = Math.floor(diffSeconds/hoursInADay);
      minutes = Math.floor((diffSeconds%hoursInADay)/60);
      expired = false;
    }
    this.setState({
      hours: hours,
      minutes: minutes,
      expired: expired
    });
  },
  componentWillMount () {
    this.computeRemainingTime();
  },
  componentDidMount: function() {
    this.interval = setInterval(this.computeRemainingTime, 60000);
  },
  componentWillUnmount: function() {
    clearInterval(this.interval);
  },
  render () {
    return <div>Expires in {this.state.hours} hours and {this.state.minutes} minutes.</div>;
  },
});

var MatchesCard = React.createClass({
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
  like(userId, like) {
    var _this= this;
    jQuery.get('/likeu/'+userId, {matchId: this.props.matchId, like: like}, function (data) {
      var newUserInfo = jQuery.extend({}, _this.state.userInfo);
      newUserInfo.like = like;
      _this.setState({
        userInfo: newUserInfo
      })
      console.log(data);
    });
  },
  render() {
    var userInfo = this.state.userInfo;
    var skillset;
    if (Array.isArray(userInfo.skills) && userInfo.skills.length > 0) {
      userInfo.skills = userInfo.skills.slice(0, 5);
      skillset = userInfo.skills.map(function (skill) {
        return <span className='user-card-skill'>{skill}</span>
      }, this);
    }
    var likeButton;
    var rejectButton;
    var likedRibbon;
    var rejectedRibbon;
    if (typeof userInfo.like === 'undefined') {
      likeButton = <a onClick={this.like.bind(this, userInfo.id, true)} className='user-card-details-button user-card-details-request'>Request interview</a>;
      rejectButton = <a onClick={this.like.bind(this, userInfo.id, false)} className='user-card-details-button user-card-details-reject'>No, thanks</a>;
    } else if (userInfo.like === true) {
      likedRibbon = <div className='user-card-like-status user-card-like-status-requested'>Request sent</div>;
    } else if (userInfo.like === false) {
      rejectedRibbon = <div className='user-card-like-status user-card-like-status-rejected'>Rejected</div>;
    }
    return (
      <div className='user-card-container'>
        <div className='user-card-user-pic-container'>
          <img className='user-card-user-pic' src={userInfo.pictureUrl} />
        </div>
        <span className='user-card-user-first-name'>{userInfo.firstName}</span>
        <span className='user-card-user-headline'>{userInfo.headline}</span>
        <div className='user-card-skillset'>
          {skillset}
        </div>
        <p className='user-card-summary'>{userInfo.summary}</p>
        <a className='user-card-details-link' onClick={this.toggleUserDetail}>View profile details</a>
        {likeButton}
        {rejectButton}
        {likedRibbon}
        {rejectedRibbon}
        <Modal className='user-card-dialog' show={this.state.showUserDetail}>
          <Modal.Header>User</Modal.Header>
          <Modal.Body><UserView userData={userInfo} /></Modal.Body>
          <Modal.Footer><Button onClick={this.toggleUserDetail}>Close</Button></Modal.Footer>
        </Modal>
      </div>
    );
  }
});

var Matches = React.createClass({
  render() {
    var users = this.props.userData.map(function (user, i) {
      return <MatchesCard key={user.id} matchId={this.props.matchId} userInfo={user} />
    }, this);
    return (
      <div>
        <ExpirationDateCountDown expirationDate={this.props.expirationDate}/>
        {users}
      </div>
    );
  }
});

module.exports = Matches;
