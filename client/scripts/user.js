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
      linkedInCVStepStatus: 'default',
      showErrorModal: false
    };
  },

  componentWillMount() {
    if (this.props.formDef) {
      this.setFormDef(this.props.formDef, this.props.userProfileData);
    }
  },

  componentWillReceiveProps(nextProps) {
    this.setFormDef(nextProps.formDef, nextProps.userProfileData);
  },

  getStepId(id) {
    var stepString = 'step';
    return stepString + id;
  },

  setFormDef (formDef, userProfileData) {
    var formDefs = [];
    var formOptions = [];
    //by default, the active key is the last object
    var activeKey = formDef.length + 1;
    for (var i = 0; i < formDef.length; i++) {
      var formDefinition = formGenerationUtils.generateForm(formDef[i]);
      var options = formGenerationUtils.generateOptions(formDef[i]);
      var status = 'default';
      var validatedForm = t.validate(userProfileData, formDefinition, options);
      if (validatedForm.isValid()) {
        status = 'success';
      } else {
        //if the form is not valid and the value hasn't changed, we set the active key as the one of the first non-valid form
        if (activeKey === formDef.length + 1) {
          activeKey = i+1;
        }
      }
      formDefs.push({
        stepTitle: formDef[i].stepTitle,
        def: formDefinition,
        status: status
      });
      formOptions.push(options);
    }
    var newState = jQuery.extend({}, this.state);
    newState.formDef = formDefs;
    newState.options = formOptions;
    newState.value = userProfileData;
    newState.activeKey = activeKey;
    //if a linkedin cv file has been already uploaded
    if (userProfileData.linkedInCVFileUrl) {
      //newState.activeKey = 1;
      newState.linkedInCVStepStatus = 'success';
    } else {
      newState.activeKey = 0;
    }
    this.setState(newState);
  },

  uploadFile (file) {
    if (file) {
      var fileName = file.name.replace(/[^a-zA-Z0-9_.]/g, '_');
      var parseFile = new Parse.File(fileName, file);
      return parseFile.save()
    }
  },

  uploadLICV (event) {
    event.preventDefault();
    var _this = this;
    var file = React.findDOMNode(this.refs.fileToUpload).files[0];
    var uploadFilePromise = this.uploadFile(file);
    if (uploadFilePromise) {
      uploadFilePromise.then(function(parseFile) {
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
    }
  },

  uploadNewProfilePic (file) {
    event.preventDefault();
    var _this = this;
    var uploadFilePromise = this.uploadFile(file);
    if (uploadFilePromise) {
      uploadFilePromise.then(function(parseFile) {
        var data = {pictureUrl: parseFile.url()};
        Services.PostProfile(JSON.stringify(data), 'static').then(function (data) {
          _this.setState({
            value: data.userProfileData
          });
          console.log(data);
        },
        function (error) {
          newState.formDef[stepIndex].status = 'danger';
        });
      });
    }
  },

  handlePanelSelect(activeKey) {
    this.setState({activeKey: activeKey});
  },

  save(stepId) {
    // call getValue() to get the values of the form
    var validationResult = this.refs[stepId].validate();
    var value = validationResult.value;
    // if validation fails, value will be null
    if (validationResult && validationResult.errors.length === 0) {
      console.log(value);
      var _this = this;
      var stepIndex = parseInt(stepId.replace('step', ''));
      var newState = jQuery.extend(true, {}, _this.state);
      this.props.setProfileData(JSON.stringify(value), stepId).then(null,
      function (error) {
        newState.formDef[stepIndex].status = 'danger';
      });
    } else {
      this.setState({
        showErrorModal: true,
        value: value
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

  closeErrorModal() {
    this.setState({showErrorModal: false});
  },

  goToProfileView() {
    this.transitionTo('/profileview');
  },

  render() {
    var output;
    var viewProfileButton = <button className='ceek-button text-uppercase' onClick={this.goToProfileView}>view profile</button>;
    var formDef = this.state.formDef;
    var formValue = this.state.value;
    if (formDef) {
      var _this = this;
      var steps = formDef.map(function (formDef, index) {
        var stepId = _this.getStepId(index);
        var evtKey = index+1;
        var header = _this.getHeader(formDef.stepTitle, formDef.status);
        if (formDef.status !== 'success') {
          viewProfileButton = undefined;
        }
        return (
          <Panel className={_this.getCustomPanelClasses(evtKey)} key={stepId} eventKey={evtKey} collapsible header={header}>
            <Form
              ref={stepId}
              type={formDef.def}
              options={_this.state.options[index]}
              value={formValue}
            />
            <button className='ceek-button text-uppercase' onClick={_this.save.bind(_this, stepId)}>Save</button>
          </Panel>
        );
      });
      output =
        <div>
          <Modal show={this.state.showErrorModal}>
            <Modal.Header bsStyle='danger'>Error</Modal.Header>
            <Modal.Body>Please correct the marked field(s)</Modal.Body>
            <Modal.Footer><Button onClick={this.closeErrorModal}>Close</Button></Modal.Footer>
          </Modal>
          <UserProfileHeader newPictureUploaded={this.uploadNewProfilePic} pictureUrl={formValue.pictureUrl} firstName={formValue.firstName} lastName={formValue.lastName} emailAddress={formValue.emailAddress} />
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
                <input className='ceek-button text-uppercase' type='submit' value='upload' />
              </form>
            </Panel>
            {steps}
          </PanelGroup>
          {viewProfileButton}
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