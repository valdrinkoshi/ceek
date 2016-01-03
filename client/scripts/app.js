var React = require('react');
var ReactRouter = require('react-router');
var SignUp = require('SignUp');
var User = require('User');
var UserView = require('UserView');
var UserMatches = require('UserMatches').UserMatches;

var App = React.createClass({
  mixins: [ReactRouter.State, ReactRouter.Navigation],
  getInitialState: function() {
    return {
      loggedIn: Parse.User.current() != null,
    };
  },
  handleSelect: function (selectedKey) {
    console.log(selectedKey);
    if (selectedKey === 3) {
      Parse.User.logOut();
      this.transitionTo("/");
    }
  },
  render () {
    var navbarContent = null;
    if (this.state.loggedIn) {
      navbarContent = (<div><Nav navbar onSelect={this.handleSelect}>
            <NavItem eventKey={1} >Link</NavItem>
            <NavItem eventKey={2} >Link</NavItem>
          </Nav>
          <Nav navbar right onSelect={this.handleSelect}>
            <NavItem eventKey={3} >Logout</NavItem>
          </Nav></div>);
    }
    return (
      <div className="application">
        <Navbar brand='Ceek' toggleNavKey={0}>
          {navbarContent}
        </Navbar>
        <div className='container'>
          <RouteHandler/>
        </div>
      </div>
    )
  }
});

module.exports = App;

var routes = [
<Route handler={App}>
  <Route name="/" handler={SignUp}/>
  <Route name="/profile" handler={User}/>
  <Route name="/profileview" handler={UserView}/>
  <Route name="/likes" handler={UserMatches}/>
</Route>
];

ReactRouter.run(routes, function (Handler, state) {
  React.render(<Handler/>, document.body);
});