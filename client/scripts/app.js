var App = React.createClass({
  mixins: [ReactRouter.State, ReactRouter.Navigation],
  getInitialState: function() {
    return {
      loggedIn: false,
    };
  },
  handleSelect: function (selectedKey) {
    console.log(selectedKey);
    if (selectedKey === 3) {
    }
  },
  handleLogin: function () {
    var isAuthorized = true;
    if (isAuthorized) {
      this.transitionTo("user/:id", {id: "EM"})
    } else {
      this.transitionTo("/")
    }
    this.setState({loggedIn: isAuthorized})
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
        <RouteHandler/>
      </div>
    )
  }
});

var routes = [
<Route handler={App}>
  <Route name="/" handler={User}/>
</Route>
];

if (!Parse.User.current()) {
  window.location.href='/authorize';
} else {
  ReactRouter.run(routes, function (Handler, state) {
    React.render(<Handler/>, document.body);
  });
}