var React = require('react');
var classNames = require('classnames');

var UserProfileHeader = React.createClass({

  pictureChanged: function () {
    var file = React.findDOMNode(this.refs.profilePicToUpload).files[0];
    this.props.newPictureUploaded(file)
  },

  render() {
    var profilePic;
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
    return (
      <div className='profile-header'>
        {profilePic}
        <div className='profile-header-basic-info'>
          <span className='profile-header-name'>{this.props.firstName} {this.props.lastName}</span>
          <span className='profile-header-email'>{this.props.emailAddress}</span>
        </div>
        <DropdownButton className='profile-header-mkt-status-btn' bsSize="xsmall" onSelect={this.props.changeMarketStatus} bsStyle={this.props.marketStatus} title={this.props.marketStatusText}>
          <MenuItem eventKey="on">On market</MenuItem>
          <MenuItem eventKey="off">Off market</MenuItem>
        </DropdownButton>
      </div>
    );
  }
});

module.exports = UserProfileHeader;
