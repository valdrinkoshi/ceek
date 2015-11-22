var React = require('react');
var classNames = require('classnames');

var UserProfileHeader = React.createClass({

  render() {
    return (
      <div className='profile-header'>
        <img className='profile-header-pic' src={this.props.pictureUrl} />
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
