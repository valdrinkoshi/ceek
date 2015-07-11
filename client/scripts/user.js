var React = require('react');
var ReactRouter = require('react-router');
var t = require('tcomb-form');
var Form = t.form.Form;

var Education = t.struct({
  collegeName: t.Str,
  startDate: t.Dat,
  endDate: t.Dat,
  description: t.Str
});

var Profile = t.struct({
  name: t.Str,
  surname: t.Str,
  email: t.Str,
  summary: t.Str,
  education: t.maybe(t.list(Education))
});

var options = {
  fields: {
    name: {
    disabled: true,
      attrs: {
        className: 'form-control',
      }
    },
  email: {
      type: 'static'
  },
  summary: {
      type: 'textarea'
  }
  }
};

var User = React.createClass({
  mixins: [ReactRouter.State, ReactRouter.Navigation],
  getInitialState() {
    return {
      value: {}
    };
  },
  componentDidMount() {
    var _this = this;
    if (Parse.User.current()) {
      Parse.Cloud.run('getUserProfileData', {}).then(
      function(response) {
        _this.setState({
          value: {
            name: response.get('firstName'),
            surname: response.get('lastName'),
            email: response.get('emailAddress'),
            summary: response.get('summary'),
            education: response.get('education')
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
  save() {
  
    // call getValue() to get the values of the form
    var value = this.refs.form.getValue();
    // if validation fails, value will be null
    if (value) {
      // value here is an instance of Person
      console.log(value);
      Parse.Cloud.run('setUserProfileData', value).then(
      function(response) {
        alert("okp");
      },
      function(error) {
        console.log(error);
        alert('There was an error getting your LinkedIn details, ' + 'please check the console for more information.');
      });
    }
  },

  render() {
    return (
      <div>
        <Form
          ref="form"
          type={Profile}
          options={options}
          value={this.state.value}
        />
        <Button onClick={this.save}>Save</Button>
      </div>
    );
  }

});

module.exports = User;
