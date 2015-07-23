var React = require('react');
var ReactRouter = require('react-router');
var t = require('tcomb-form');
var Form = t.form.Form;
var formGenerationUtils = require('./formGenerationUtils.js');

var User = React.createClass({
  mixins: [ReactRouter.State, ReactRouter.Navigation],

  getInitialState() {
    return {
      formDef: null,
      value: {}
    };
  },

  componentDidMount() {
    var _this = this;
    if (Parse.User.current()) {
      $.get('profile', {sessionToken: Parse.User.current().getSessionToken()}, function (response) {
        var formDef = formGenerationUtils.generateForm(response.formDef);
        var formOptions = formGenerationUtils.generateOptions(response.formDef);
        var userProfileData = response.userProfileData;
        _this.setState({
          formDef: formDef,
          options: formOptions,
          value: userProfileData
        });
      });
    } else {
      this.transitionTo("/");
    }
  },

  uploadLICV (event) {
    event.preventDefault();
    var _this = this;
    var file = React.findDOMNode(this.refs.fileToUpload).files[0];
    var fileName = file.name.replace(/[^a-zA-Z0-9_.]/g, '_');
    var parseFile = new Parse.File(fileName, file);
    parseFile.save().then(function(parseFile) {
      $.get('parseLICV', {sessionToken: Parse.User.current().getSessionToken(), url: parseFile.url()}, function (response) {
          _this.setState({
            value: response
          });
      });
    });
  },

  save() {
    // call getValue() to get the values of the form
    var value = this.refs.form.getValue();
    // if validation fails, value will be null
    if (value) {
      // value here is an instance of Person
      console.log(value);
      $.post('profile', {sessionToken: Parse.User.current().getSessionToken(), data: JSON.stringify(value)}, function (data) {
      });
    }
  },

  render() {
    var output;
    if (this.state.formDef) {
      output =
        <div>
          <form onSubmit={this.uploadLICV} encType='multipart/form-data'>
            <input type='file' ref='fileToUpload' accept='.pdf' name='fileToUpload' id='fileToUpload' />
            <input type='submit' value='upload cv' />
          </form>
          <Form
            ref='form'
            type={this.state.formDef}
            options={this.state.options}
            value={this.state.value}
          />
          <Button onClick={this.save}>Save</Button>
        </div>;
    } else {
      output = <div></div>;
    }
    return (
      <div>
        {output}
      </div>
    );
  }
});

module.exports = User;
