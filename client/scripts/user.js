var React = require('react');
var classNames = require('classnames');
var ReactRouter = require('react-router');
var t = require('tcomb-form');
var Form = t.form.Form;

var i18n = {
  'firstName': 'Name',
  'employmentType': 'This Employment Type',
  'employmentType.permanent': 'Permanent (full time)'
};

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

var LayoutRow = React.createClass({
  render () {
    return (
      <div className="row">
        {this.props.children}
      </div>
    );
  }
});

var LayoutColumn = React.createClass({
  getBootStrapClassName (screenSize, columnValue) {
    return ['col', screenSize, columnValue].join('-');
  },
  getBootStrapClassSet (config) {
    var classes = {};
    for (var screenSize in config) {
      classes[this.getBootStrapClassName(screenSize, config[screenSize])] = true;
    }
    return classNames(classes);
  },
  render () {
    var columnSpan = this.props.columnSpan || 6;
    var bootstrapClasses = this.getBootStrapClassSet({'xs': 12, 'sm': 12, 'md': columnSpan, 'lg': columnSpan}); 
    return (
      <div className={bootstrapClasses}>{this.props.children}</div>
    );
  }
});

//tentative for dynamic N columns layout, this is probably the wrong way to do it!
var getMultiColumnsLayout = function(totColumns){
  return function(locals){
    //layouts in two columns
    var bootstrapColumnWidth = 12;
    var columnSpan = bootstrapColumnWidth/totColumns;
    var order = locals.order || Object.keys(locals.inputs);
    var totInputs = order.length;
    var totRows = totInputs/totColumns;
    var inputPerColumn = totInputs/totRows;
    var inputInCurrentColumn = 0;
    var groupedControls = [[]];
    for (var i = 0; i < order.length; i++) {
      var currentChild = (<LayoutColumn key={i} columnSpan={columnSpan}>{locals.inputs[order[i]]}</LayoutColumn>);
      if (inputInCurrentColumn == inputPerColumn) {
        groupedControls.push([]);
        inputInCurrentColumn = 0;
      }
      groupedControls[groupedControls.length-1].push(currentChild);
      inputInCurrentColumn++;
    }
    var layoutNodes = groupedControls.map(function (controls, rowId) {
      return (
        <LayoutRow key={rowId}>
          {controls}
        </LayoutRow>
      );
    });
    return (
      <div>
        <fieldset>
          <legend>{locals.label}</legend>
          {layoutNodes}
        </fieldset>
      </div>
    );
  };
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
      label: i18n['firstName'],
      disabled: true,
    },
    employmentType: {
      label: i18n['employmentType'],
      fields: {
        permanent: {
          label: i18n['employmentType.permanent'],
        }
      }
    },
    emailAddress: {
      type: 'static'
    },
    roleType: {
      template: getMultiColumnsLayout(3)
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
          value: response.attributes
        });
      },
      function(error) {
        console.log(error);
        alert('There was an error getting your data');
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
        aler('There was an error saving your data');
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
