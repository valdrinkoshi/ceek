var React = require('react');
var classNames = require('classnames');

var UserProfileHeader = React.createClass({

  pictureChanged() {
    var file = React.findDOMNode(this.refs.profilePicToUpload).files[0];
    this.props.newPictureUploaded(file)
  },

  getDefaultProps() {
    return {
      showStatusButton: false,
      statusOnMarket: false
    };
  },

  render() {
    var profilePic;
    var statusButton;
    if (typeof this.props.newPictureUploaded === 'function') {
      profilePic = (
        <div className='profile-header-pic-container profile-header-pic-upload'>
          <img className='profile-header-pic' src={this.props.pictureUrl} />
          <form>
            <input onChange={this.pictureChanged} type='file' ref='profilePicToUpload' accept='image/*' name='profilePicToUpload' />
          </form>
        </div>
        );
    } else {
      profilePic = <div className='profile-header-pic-container'>
          <img className='profile-header-pic' src={this.props.pictureUrl} />
        </div>
    }
    if (this.props.showStatusButton) {
      var statusButtonText = 'start job matching';
      if (this.props.statusOnMarket) {
        statusButtonText = 'stop job matching';
      }
      statusButton = (
      <button className='ceek-button profile-header-mkt-status-btn text-uppercase' onClick={this.props.changeMarketStatus}>
        {statusButtonText}
        </button>
        );
    }
    return (
      <div className='profile-header'>
        {profilePic}
        <div className='profile-header-basic-info'>
          <span className='profile-header-name'>{this.props.firstName} {this.props.lastName}</span>
          <span className='profile-header-email'>{this.props.emailAddress}</span>
        </div>
        {statusButton}
      </div>
    );
  }
});

module.exports = UserProfileHeader;
