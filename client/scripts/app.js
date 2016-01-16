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
      userProfileData: {},
      formDef: null
    };
  },
  handleSelect: function (selectedKey) {
    console.log(selectedKey);
    if (selectedKey === 3) {
      Parse.User.logOut();
      this.transitionTo("/");
    }
  },

  getProfileData() {
    if (this.userProfileData) {
      return jQuery.Deferred().resolve(this.userProfileData);
    }
    return this.userProfileDataPromise;
  },

  setProfileData(data, stepId) {
    var _this = this;
    return Services.PostProfile(data, stepId).then(function (data) {
      return _this.setState({userProfileData: data.userProfileData});
    });
  },

  getLikesData() {
    if (this.likesData) {
      return jQuery.Deferred().resolve(this.likesData);
    }
    return this.likesPromise;
  },

  changeMarketStatus() {
    var _this = this;
    var newMarketStatus = !this.state.userProfileData.onMarket;
    Services.PostProfile(JSON.stringify({onMarket: newMarketStatus}), 'static').then(function (response) {
      _this.setState({userProfileData: response.userProfileData});
    });
  },

  componentWillMount() {
    var _this = this;
    var userProfileDataPromise = Services.GetProfile();
    var likesPromise = Services.GetLikes();
    jQuery.when(userProfileDataPromise, likesPromise).then(function (userProfileData, likesData) {
      _this.setState({
        userProfileData: userProfileData.userProfileData,
        formDef: userProfileData.formDef,
        likesData: likesData
      });
    });
  },

  render () {
    var navbarContent = null;
    return (
      <div className="application">
        <CeekNav brand='Ceek' items={[{text: 'likes', href: '/likes'}, {text: 'edit profile', href: '/profile'}, {text: 'view profile', href: '/profileview'}]} changeMarketStatus={this.changeMarketStatus} statusOnMarket={this.state.userProfileData.onMarket} />
        <div className='container'>
          <RouteHandler userProfileData={this.state.userProfileData} formDef={this.state.formDef} setProfileData={this.setProfileData} likesData={this.state.likesData} changeMarketStatus={this.changeMarketStatus} />
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