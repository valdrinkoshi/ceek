var SignUp = React.createClass({
  mixins: [ReactRouter.State, ReactRouter.Navigation],
  componentDidMount: function() {
    if (Parse.User.current()) {
      this.transitionTo("/profile");
    }
  },
  handleSignUp: function () {
    window.location.href = "/authorize";
  },
  render () {
    return (
      <div>
        <Button onClick={this.handleSignUp}>Sign in with LinkedIn</Button>
      </div>
    )
  }
});
