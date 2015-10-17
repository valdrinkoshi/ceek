var React = require('react');
var ReactRouter = require('react-router');
var t = require('tcomb-form');
var Form = t.form.Form;
var Services = require('./Services.js');
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
      Services.GetProfile().then(function (response) {
        var formDef = formGenerationUtils.generateForm(response.formDef);
        var formOptions = formGenerationUtils.generateOptions(response.formDef);
        var userProfileData = response.userProfileData;
        _this.setState({
          formDef: formDef,
          options: formOptions,
          value: userProfileData
        });
      });
      Services.GetLikes().then(function (response) {
        _this.setState({
          likes: response.likes
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
      Services.ParseLICV(parseFile.url()).then(function (response) {
        console.log(response);
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
      Services.PostProfile(JSON.stringify(value)).then(function (data) {
        console.log(data);
      });
    }
  },

  likeBack(likeId, event) {
    Services.GetLikeJ(likeId).then(function (data) {
      console.log(data);
    });
  },

  render() {
    var output;
    var likes;
    var _this = this;
    if (this.state.likes) {
      likes = this.state.likes.map(function (like) {
        return <p key={like.id}>{like.jobId}<Button onClick={_this.likeBack.bind(_this, like.id)}>like back</Button></p>
      });
    }
    if (this.state.formDef) {
      output =
        <div>
          <h6>Likes</h6>
          {likes}
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
