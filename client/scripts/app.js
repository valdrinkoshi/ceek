var React = require('react');
var ReactRouter = require('react-router');
var CeekNav = require('CeekNav');
var SignUp = require('SignUp');
var User = require('User');
var UserView = require('UserView');
var UserMatches = require('UserMatches').UserMatches;

var Services = require('./Services.js');

var App = React.createClass({
  mixins: [ReactRouter.State, ReactRouter.Navigation],
  getInitialState: function() {
    return {
      loggedIn: Parse.User.current() != null
    };
  },
  handleSelect: function (selectedKey) {
    console.log(selectedKey);
    if (selectedKey === 3) {
      Parse.User.logOut();
      this.transitionTo("/");
    }
  },

  userProfileDataPromise: null,
  userProfileData: null,
  likesPromise: null,
  likesData: null,

  getProfileData() {
    if (this.userProfileData) {
      return jQuery.Deferred().resolve(this.userProfileData);
    }
    return this.userProfileDataPromise;
  },

  setProfileData(data, stepId) {
    var _this = this;
    return Services.PostProfile(data, stepId).then(function (data) {
      _this.userProfileData.userProfileData = data.userProfileData;
      return _this.userProfileData;
    });
  },

  getLikesData() {
    if (this.likesData) {
      return jQuery.Deferred().resolve(this.likesData);
    }
    return this.likesPromise;
  },

  setNavItems(navItems) {
    this.setState({
      navItems: navItems
    });
  },

  componentWillMount() {
    var _this = this;
    this.userProfileDataPromise = Services.GetProfile().then(function (data) {
      _this.userProfileData = data;
      return _this.userProfileData;
    });
    this.likesPromise = Services.GetLikes().then(function (data) {
      _this.likesData = data;
      return _this.likesData;
    });
  },

  render () {
    var navbarContent = null;
    return (
      <div className="application">
        <CeekNav brand='Ceek' items={[{text: 'likes', href: '/likes'}, {text: 'edit profile', href: '/profile'}, {text: 'view profile', href: '/profileview'}]} />
        <div className='container'>
          <RouteHandler getProfileData={this.getProfileData} setProfileData={this.setProfileData} getLikesData={this.getLikesData} setNavItems={this.setNavItems}/>
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