var Login = React.createClass({
  mixins: [ReactRouter.State, ReactRouter.Navigation],
  login: function () {
    IN.User.authorize()
  },
  getProfileData: function(comment) {
    var _this = this;
    IN.API.Raw("/people/~:(first-name,summary,specialties,positions,last-name,headline,location,industry,id,num-connections,picture-url,email-address,public-profile-url)")
    .result(function (data) {
      //this.setState({data: data});
    })
    .error(function () {
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    IN.Event.on(IN, "auth", this.getProfileData);
  },
  render: function() {
    return (
        <div>
        <Button onClick={this.login}>Login with LinkedIn</Button>
        </div>
    );
  }
});