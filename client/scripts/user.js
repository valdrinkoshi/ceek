var React = require('react');
var ReactRouter = require('react-router');

var User = React.createClass({
  mixins: [ReactRouter.State, ReactRouter.Navigation],
  getInitialState: function() {
    return {user: {}};
  },
  componentDidMount: function() {
    var _this = this;
    if (Parse.User.current()) {
      Parse.Cloud.run('getUserProfileData', {}).then(
      function(response) {
        _this.setState({
          user: {
            firstName: response.get('firstName'),
            emailAddress: response.get('emailAddress'),
            summary: response.get('summary')
          }
        });
      },
      function(error) {
        console.log(error);
        alert('There was an error getting your LinkedIn details, ' + 'please check the console for more information.');
      });
    } else {
      this.transitionTo("/");
    }
  },
  render () {
    return (
      <div>
        <ListGroup>
          <ListGroupItem>{this.state.user.firstName}</ListGroupItem>
          <ListGroupItem>{this.state.user.emailAddress}</ListGroupItem>
          <ListGroupItem>{this.state.user.summary}</ListGroupItem>
        </ListGroup>
      </div>
    )
  }
});
module.exports = User;
