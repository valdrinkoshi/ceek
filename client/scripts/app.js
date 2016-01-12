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

  userProfileData: null,

  getProfileData() {
    if (this.userProfileData) {
      return jQuery.Deferred().resolve(this.userProfileData);
    }
    var _this = this;
    return Services.GetProfile().then(function (data) {
      _this.userProfileData = data;
      return _this.userProfileData;
    });
  },

  setProfileData(data, stepId) {
    var _this = this;
    return Services.PostProfile(data, stepId).then(function (data) {
      _this.userProfileData.userProfileData = data.userProfileData;
      return _this.userProfileData;
    });
  },

  getLikesData() {
    
  },

  render () {
    var navbarContent = null;
    if (this.state.loggedIn) {
      navbarContent = (<div><CeekNav brand='Ceek' items={[{text: 'likes', href: '/likes'}, {text: 'edit profile', href: '/profile'}, {text: 'view profile', href: '/profileview'}]} /></div>);
    }
    return (
      <div className="application">
        <CeekNav brand='Ceek' items={[{text: 'likes', href: '/likes'}, {text: 'edit profile', href: '/profile'}, {text: 'view profile', href: '/profileview'}]} />
        <div className='container'>
          <RouteHandler getProfileData={this.getProfileData} setProfileData={this.setProfileData}/>
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