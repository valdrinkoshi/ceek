var React = require('react');
var ReactRouter = require('react-router');
var t = require('tcomb-form');
var Form = t.form.Form;
var Services = require('./Services.js');
var formGenerationUtils = require('./formGenerationUtils.js');
var classNames = require('classnames');

var User = React.createClass({
  mixins: [ReactRouter.State, ReactRouter.Navigation],

  getInitialState() {
    return {
      formDef: null,
      value: {},
      activeKey: 0,
      linkedInCVStepStatus: 'danger',
      marketStatus: 'success',
      marketStatusText: 'On Market'
    };
  },

  componentDidMount() {
    var _this = this;
    if (Parse.User.current()) {
      Services.GetProfile().then(function (response) {
        _this.setFormDef(response.formDef, response.userProfileData);
      });
    } else {
      this.transitionTo("/");
    }
  },

  setFormDef (formDef, userProfileData) {
    var formDefs = [];
    var formOptions = [];
    for (var i = 0; i < formDef.length; i++) {
      formDefs.push({
        stepTitle: formDef[i].stepTitle,
        def: formGenerationUtils.generateForm(formDef[i]),
        status: 'default'
      });
      formOptions.push(formGenerationUtils.generateOptions(formDef[i]));
    }
    var newState = jQuery.extend({}, this.state);
    newState.formDef = formDefs;
    newState.options = formOptions;
    newState.value = userProfileData;
    //if a linkedin cv file has been already uploaded
    if (userProfileData.linkedInCVFileUrl) {
      newState.activeKey = 1;
      newState.linkedInCVStepStatus = 'success';
    }
    this.setState(newState);
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
          activeKey: 1,
          linkedInCVStepStatus: 'success',
          value: response
        });
      }, function () {
        _this.setState({
          linkedInCVStepStatus: 'danger'
        });
      });
    });
  },

  handlePanelSelect(activeKey) {
    this.setState({activeKey: activeKey});
  },

  getStatusState (onMarket) {
    var newState = {
      marketStatus: 'danger',
      marketStatusText: 'Off Market'
    };
    if (onMarket) {
      newState.marketStatus = 'success';
      newState.marketStatusText = 'On Market'
    }
    return newState;
  },

  changeMarketStatus(newStatus) {
    this.setState(this.getStatusState(newStatus === 'on'));
  },

  save(stepId) {
    // call getValue() to get the values of the form
    var value = this.refs[stepId].getValue();
    // if validation fails, value will be null
    if (value) {
      // value here is an instance of Person
      console.log(value);
      var _this = this;
      var stepIndex = parseInt(stepId.replace('step', ''));
      var newState = jQuery.extend(true, {}, _this.state);
      Services.PostProfile(JSON.stringify(value), stepId).then(function (data) {
        newState.formDef[stepIndex].status = 'success';
        newState.activeKey = stepIndex + 2;
        newState.value = data.userProfileData;
        _this.setState(newState);
        console.log(data);
      },
      function (error) {
        newState.formDef[stepIndex].status = 'danger';
      });
    }
  },

  getCustomPanelClasses (evtKey) {
    return classNames({
      'panel-selected': evtKey === this.state.activeKey,
    });
  },

  render() {
    var output;
    if (this.state.formDef) {
      var _this = this;
      var steps = this.state.formDef.map(function (formDef, index) {
        var stepId = 'step' + index;
        var evtKey = index+1;
        
        return (
          <Panel className={_this.getCustomPanelClasses(evtKey)} key={stepId} eventKey={evtKey} collapsible bsStyle={formDef.status} header={formDef.stepTitle}>
            <Form
              ref={stepId}
              type={formDef.def}
              options={_this.state.options[index]}
              value={_this.state.value}
            />
            <Button onClick={_this.save.bind(_this, stepId)}>Save</Button>
          </Panel>
        );
      });
      output =
        <div>
          <div className='profile-header'>
            <img className='profile-header-pic' src={this.state.value.pictureUrl} />
            <div className='profile-header-basic-info'>
              <span className='profile-header-name'>{this.state.value.firstName} {this.state.value.lastName}</span>
              <span className='profile-header-email'>{this.state.value.emailAddress}</span>
            </div>
            <DropdownButton className='profile-header-mkt-status-btn' bsSize="xsmall" onSelect={this.changeMarketStatus} bsStyle={this.state.marketStatus} title={this.state.marketStatusText}>
            <MenuItem eventKey="on">On market</MenuItem>
            <MenuItem eventKey="off">Off market</MenuItem>
          </DropdownButton>
          </div>
          <PanelGroup className={this.getCustomPanelClasses(0)} onSelect={this.handlePanelSelect} activeKey={this.state.activeKey} accordion>
            <Panel collapsible eventKey={0} header='LinkedIn Profile PDF' bsStyle={this.state.linkedInCVStepStatus}>
              <form onSubmit={this.uploadLICV} encType='multipart/form-data'>
                <input type='file' ref='fileToUpload' accept='.pdf' name='fileToUpload' id='fileToUpload' />
                <input type='submit' value='upload cv' />
              </form>
            </Panel>
            {steps}
          </PanelGroup>
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
