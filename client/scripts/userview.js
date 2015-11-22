var React = require('react');
var ReactRouter = require('react-router');
var Services = require('./Services.js');
var UserProfileHeader = require('./UserProfileHeader.js');
var classNames = require('classnames');

var ProfileSection = React.createClass({
  render () {
    return (
      <div>
        <h4>{this.props.title}</h4>
        {this.props.children}
      </div>
    );
  }
});

var ProfileProperty = React.createClass({
  getDefaultProps() {
    return {
      inline: true
    };
  },

  renderValue (value) {
    if (React.isValidElement(value)) {
      return value;
    } else if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'object' && value !== null) {
      var properties = [];
      for (var propName in value) {
        if (typeof value[propName] === 'boolean' && value[propName]) {
          properties.push(propName);
        }
      }
      return properties.join(', ');
    } else {
      return value;
    }
  },

  render () {
    var labelClasses = {
      'profile-prop-label': true,
      'profile-prop-label-inline': this.props.inline
    };
    var valueClasses = {
      'profile-prop-value': true,
      'profile-prop-value-inline': this.props.inline
    };
    var children;
    if (Array.isArray(this.props.children)) {
      children = this.props.children.map(function (child) {
        return this.renderValue(child);
      }, this);
    } else {
      children = this.renderValue(this.props.children);
    }
    
    return (
      <div>
        <label className={classNames(labelClasses)}>{this.props.name}:</label>
        <div className={classNames(valueClasses)}>
          {children}
        </div>
      </div>
    );
  }
});

var HistoryProfileProperty = React.createClass({
  render () {
    var rowClasses = {
      'col-xs-12': true,
      'col-sm-12': true,
      'col-md-4': true,
      'col-lg-4': true
    };

    var title1;
    var title2;
    var title3;
    var description;
    if (this.props.title1) {
      title1 = <span className={classNames(rowClasses)}>{this.props.title1}</span>;
    }
    if (this.props.title2) {
      title2 = <span className={classNames(rowClasses)}>{this.props.title2}</span>;
    }
    if (this.props.title3) {
      title3 = <span className={classNames(rowClasses)}>{this.props.title3}</span>;
    }
    if (this.props.description) {
      description = <div className={classNames({'col-xs-12': true, 'col-sm-12': true, 'col-md-12': true, 'col-lg-12': true})}>{this.props.description}</div>;
    }
    return (
      <div className='row history-profile-property'>
        {title1}
        {title2}
        {title3}
        {description}
      </div>
    );
  }
});

/*var ListProfileProperty = React.createClass({

});*/

var UserView = React.createClass({
  mixins: [ReactRouter.State, ReactRouter.Navigation],

  getInitialState() {
    return {
      formDef: null
    };
  },

  componentDidMount() {
    var _this = this;
    if (Parse.User.current()) {
      Services.GetProfile().then(function (response) {
        _this.setState({
          formDef: response.formDef,
          profileData: response.userProfileData
        });
      });
    } else {
      this.transitionTo("/");
    }
  },

  render() {
    var output;
    if (this.state.formDef) {
      var data = this.state.profileData;
      var skills;
      if (data.skills) {
        skills = data.skills.map(function (skill, i) {
          return <span key={i} className='boxed-property'>{skill}</span>
        });
      }

      var education;
      if (data.education) {
        education = data.education.map(function (educationStep, i) {
          return <HistoryProfileProperty key={i} title1={educationStep.collegeName} title2={educationStep.degree} title3={educationStep.startDate} />;
        });
      }

      var experience;
      if (data.experience) {
        experience = data.experience.map(function (experienceStep, i) {
          return <HistoryProfileProperty key={i} title1={experienceStep.companyName} title2={experienceStep.role} title3={experienceStep.startDate} description={experienceStep.description} />;
        });
      }

      var contribution;
      if (data.contribution) {
        contribution = data.contribution.map(function (contrib,i ) {
          return <span key={i} className='boxed-property'>{contrib.process} {contrib.percentage}%</span>
        });
      }
      output =
        <div className='container'>
          <UserProfileHeader pictureUrl={data.pictureUrl} firstName={data.firstName} lastName={data.lastName} emailAddress={data.emailAddress} marketStatus={data.marketStatus} marketStatusText={data.marketStatusText} />
          <ProfileSection title='Job Preferences'>
            <ProfileProperty name='Preferred working locations'>{data.locationPreference}</ProfileProperty>
            <ProfileProperty name='Ideal roles'>{data.roleType}</ProfileProperty>
            <ProfileProperty name='Employment type'>{data.employmentType}</ProfileProperty>
            <ProfileProperty name='Expected salary'>{data.expectedSalary}</ProfileProperty>
            <ProfileProperty name='Work authorization'>{data.workAuthorization}</ProfileProperty>
            <ProfileProperty name="Don't contact these companies">{data.dontContact}</ProfileProperty>
          </ProfileSection>
          <ProfileSection title='Personal Information'>
            <ProfileProperty name='Phone number'>{data.phoneNumber}</ProfileProperty>
            <ProfileProperty name='Current location'>{data.currentLocation}</ProfileProperty>
            <ProfileProperty name='GitHub'>{data.github}</ProfileProperty>
            <ProfileProperty name='Summary' inline={false}>{data.summary}</ProfileProperty>
            <ProfileProperty name='Skills' inline={false}>
              {skills}
            </ProfileProperty>
            <ProfileProperty name='Experience' inline={false}>
              {experience}
            </ProfileProperty>
            <ProfileProperty name='Education' inline={false}>
              {education}
            </ProfileProperty>
          </ProfileSection>
          <ProfileSection title='Portfolio'>
            <ProfileProperty name='Project link'>{data.projectLink}</ProfileProperty>
            <ProfileProperty name='Description' inline={false}>{data.projectDescription}</ProfileProperty>
            <ProfileProperty name='Motivation'>{data.projectWhy}</ProfileProperty>
            <ProfileProperty name='Team members'>{data.howMany}</ProfileProperty>
            <ProfileProperty name='Project process and individual contribution' inline={false}>
              {contribution}
            </ProfileProperty>
          </ProfileSection>
          <ProfileSection title='Questionnaire Result'>
            
          </ProfileSection>
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

module.exports = UserView;
