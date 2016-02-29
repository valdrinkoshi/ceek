var React = require('react');
var ReactRouter = require('react-router');
var CeekNav = require('CeekNav');
var SignUp = require('SignUp');
var User = require('User');
var UserView = require('UserView');
var UserMatches = require('UserMatches').UserMatches;
var BusyIndicator = require('BusyIndicator');


var Services = require('./Services.js');

var App = React.createClass({
  mixins: [ReactRouter.State, ReactRouter.Navigation],
  getInitialState: function() {
    return {
      loggedIn: this.isLoggedIn(),
      userProfileData: {},
      formDef: null,
      showBusyIndicator: false
    };
  },

  busyIndicatorTimeout: null,

  isLoggedIn: function () {
     return Parse.User.current() != null;
  },

  logout: function (selectedKey) {
    Parse.User.logOut();
    this.setState({
      loggedIn: this.isLoggedIn(),
      userProfileData: {},
      formDef: null,
      likesData: null
    });
    location.href = "/index.html";
  },

  toggleBusyIndicator() {
    if (this.state.showBusyIndicator === true) {
      this.setState({
        showBusyIndicator: false
      });
      clearTimeout(this.busyIndicatorTimeout);
    } else {
      var _this = this;
      this.busyIndicatorTimeout = setTimeout(function () {
        _this.setState({
          showBusyIndicator: true
        });
      }, 500);
    }
  },

  setProfileData(data, stepId) {
    this.toggleBusyIndicator();
    var _this = this;
    return Services.PostProfile(data, stepId).then(function (data) {
      return _this.setState({
        userProfileData: data.userProfileData,
        showBusyIndicator: false
      });
      clearTimeout(_this.busyIndicatorTimeout);
    });
  },

  parseLICV(parseFile) {
    this.toggleBusyIndicator();
    var _this = this;
    return Services.ParseLICV(parseFile.url()).then(function (response) {
      console.log(response);
      _this.toggleBusyIndicator();
      _this.setState({
        userProfileData: response
      });
      return response;
    });
  },

  changeMarketStatus() {
    this.toggleBusyIndicator();
    var _this = this;
    var newMarketStatus = !this.state.userProfileData.onMarket;
    Services.PostProfile(JSON.stringify({onMarket: newMarketStatus}), 'static').then(function (response) {
      _this.setState({
        userProfileData: response.userProfileData,
        showBusyIndicator: false
      });
      clearTimeout(_this.busyIndicatorTimeout);
    });
  },

  componentWillMount() {
    if (Parse.User.current()) {
      this.toggleBusyIndicator();
      var _this = this;
      var userProfileDataPromise = Services.GetProfile();
      var likesPromise = Services.GetLikes();
      jQuery.when(userProfileDataPromise, likesPromise).then(function (userProfileData, likesData) {
        _this.setState({
          userProfileData: userProfileData.userProfileData,
          formDef: userProfileData.formDef,
          likesData: likesData,
          showBusyIndicator: false
        });
        clearTimeout(_this.busyIndicatorTimeout);
      });
    }
  },

  render () {
    var navbarItems = [{text: 'matches', href: '/likes'}, {text: 'edit profile', href: '/profile'}, {text: 'view profile', href: '/profileview'}];
    if (!this.state.loggedIn) {
      navbarItems = [];
    }
    return (
      <div className="application">
        <CeekNav brand='Ceek' items={navbarItems} changeMarketStatus={this.changeMarketStatus} statusOnMarket={this.state.userProfileData.onMarket} loggedIn={this.state.loggedIn} logout={this.logout} />
        <div className='container'>
          <RouteHandler userProfileData={this.state.userProfileData} formDef={this.state.formDef} setProfileData={this.setProfileData} likesData={this.state.likesData} changeMarketStatus={this.changeMarketStatus} toggleBusyIndicator={this.toggleBusyIndicator} parseLICV={this.parseLICV} />
        </div>
        <BusyIndicator show={this.state.showBusyIndicator} />
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
