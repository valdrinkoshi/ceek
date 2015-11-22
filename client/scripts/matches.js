var React = require('react');
var classNames = require('classnames');

var Matches = React.createClass({
  render() {
    var users = this.props.userData.map(function (user) {
      return <div>{user.firstName}</div>
    });
    return (
      <div>
        {users}
      </div>
    );
  }
});

module.exports = Matches;
