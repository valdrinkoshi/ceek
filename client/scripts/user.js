var React = require('react');
var ReactRouter = require('react-router');
var t = require('tcomb-form');
var Form = t.form.Form;
var Services = require('./Services.js');
var formGenerationUtils = require('./formGenerationUtils.js');
var UserProfileHeader = require('./UserProfileHeader');
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

  getHeader (title, status) {
    var glyph = 'minus-sign';
    if (status === 'success') {
      glyph = 'ok-sign';
    } else if (status === 'danger') {
      glyph = 'remove-sign';
    }
    return <div className='step-panel-header-container'><h4 className='step-panel-header-title'>{title}</h4><Glyphicon className='step-panel-header-icon' glyph={glyph}/></div>;
  },

  render() {
    var output;
    if (this.state.formDef) {
      var _this = this;
      var steps = this.state.formDef.map(function (formDef, index) {
        var stepId = 'step' + index;
        var evtKey = index+1;
        var header = _this.getHeader(formDef.stepTitle, formDef.status);
        return (
          <Panel className={_this.getCustomPanelClasses(evtKey)} key={stepId} eventKey={evtKey} collapsible header={header}>
            <Form
              ref={stepId}
              type={formDef.def}
              options={_this.state.options[index]}
              value={_this.state.value}
            />
            <button className='step-save-button text-uppercase' onClick={_this.save.bind(_this, stepId)}>Save</button>
          </Panel>
        );
      });
      output =
        <div className="container">
          <UserProfileHeader pictureUrl={this.state.value.pictureUrl} firstName={this.state.value.firstName} lastName={this.state.value.lastName} emailAddress={this.state.value.emailAddress} marketStatus={this.state.marketStatus} marketStatusText={this.state.marketStatusText} />
          <PanelGroup className={this.getCustomPanelClasses(0)} onSelect={this.handlePanelSelect} activeKey={this.state.activeKey} accordion>
            <Panel collapsible eventKey={0} header={this.getHeader('LinkedIn Profile PDF', this.state.linkedInCVStepStatus)}>
              <span className='steps-subtletext'>Import your LinkedIn profile, and we’ll help fill in your summary, work history, education and skills.</span>
              <ol className='upload-steps'>
                <li>Click <span className='upload-steps-important'>Profile</span> at the top of your LinkedIn homepage.</li>
                <li>Move your cursor over the Down arrow next to the <span className='upload-steps-important'>View profile as button</span>. Select <span className='upload-steps-important'>Save to PDF</span>.</li>
                <img className='upload-step-img' src='imgs/import_LinkedIn.png' />
                <li>The PDF file will be downloaded and saved to your computor. Return here and upload the PDF file below.</li>
              </ol>
              <form onSubmit={this.uploadLICV} encType='multipart/form-data'>
                <input type='file' ref='fileToUpload' accept='.pdf' name='fileToUpload' id='fileToUpload' />
                <input className='step-save-button text-uppercase' type='submit' value='upload' />
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