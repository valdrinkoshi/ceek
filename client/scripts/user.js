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

var EmploymentType = t.struct({
  permanent: t.Bool,
  contract: t.Bool,
  partTime: t.Bool,
  inter: t.Bool
});

var RoleType = t.struct({
  developer: t.Bool,
  fullStackDeveloper: t.Bool,
  frontEndDeveloper: t.Bool,
  moneyForNothing: t.Bool,
  doesntMatter: t.Bool,
  okay: t.Bool
});


function getBootStrapClassName (size, value) {
  return ['col', size, value].join('-');
};

//tentative for dynamic 2 columns layout, this is probably the wrong way to do it!
var twoColumnsLayout = function(locals){
  //layouts in two columns
  var bootstrapColumnWidth = 12;
  var totColumns = 2;
  var value = bootstrapColumnWidth/totColumns;
  var bootstrapClassName = getBootStrapClassName("md", value);
  var order = locals.order || Object.keys(locals.inputs);
  var totInputs = order.length;
  var totRows = totInputs/totColumns;
  var inputPerColumn = totInputs/totRows;
  var inputInCurrentColumn = 0;
  var groupedControls = [[]];
  console.log(bootstrapClassName);
  for (var i = 0; i < order.length; i++) {
      var currentChild = (<div className={bootstrapClassName}>{locals.inputs[order[i]]}</div>);
      if (inputInCurrentColumn == inputPerColumn) {
        groupedControls.push([]);
        inputInCurrentColumn = 0;
      }
      groupedControls[groupedControls.length-1].push(currentChild);
      inputInCurrentColumn++;
  }
  var layoutNodes = [];
  for (var i = 0; i < groupedControls.length; i++) {
    var currentColumn = (<div className="row">{groupedControls[i]}</div>);
    layoutNodes.push(currentColumn);
  }
  return (
    <div>
      {layoutNodes}
    </div>
  );
};

var Profile = t.struct({
  firstName: t.Str,
  lastName: t.Str,
  emailAddress: t.Str,
  summary: t.Str,
  employmentType: EmploymentType,
  roleType: RoleType,
  education: t.maybe(t.list(Education))
});

var options = {
  fields: {
    firstName: {
      disabled: true,
    },
    emailAddress: {
      type: 'static'
    },
    roleType: {
      template: twoColumnsLayout
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
            firstName: response.get('firstName'),
            lastName: response.get('lastName'),
            emailAddress: response.get('emailAddress'),
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
        console.log(response);
      },
      function(error) {
        console.log(error);
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
