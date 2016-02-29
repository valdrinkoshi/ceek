var React = require('react');
var ReactRouter = require('react-router');
var Services = require('./Services.js');
var UserProfileHeader = require('./UserProfileHeader.js');
var i18n = require('./formI18nUtils.js');
var classNames = require('classnames');
var Chartjs = require('react-chartjs');
var Doughnut = Chartjs.Doughnut;

var ProfileSection = React.createClass({
  render () {
    return (
      <div className='profile-view-section'>
        <h4 className='profile-view-section-title'>{this.props.title}</h4>
        {this.props.children}
      </div>
    );
  }
});

var ProfileProperty = React.createClass({
  getDefaultProps() {
    return {
      inline: true,
      i18nPrefix: ''
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
          var localizedPropertyName = i18n.getText(this.props.i18nPrefix + propName);
          if (!localizedPropertyName) {
            propName = propName.replace(/[A-Z]/g, function(a) {return ' ' + a});
            propName = propName[0].toUpperCase() + propName.substring(1);
          }
          properties.push(localizedPropertyName || propName);
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
      <div className='profile-property'>
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
      'col-lg-4': true,
      'history-profile-property-title': true
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
      description = <div className={classNames({'col-xs-12': true, 'col-sm-12': true, 'col-md-12': true, 'col-lg-12': true, 'history-profile-property-desc': true})}>{this.props.description}</div>;
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

var UserView = React.createClass({
  mixins: [ReactRouter.State, ReactRouter.Navigation],

  getDefaultProps() {
    return {
      showStatusButton: true
    }
  },

  getInitialState() {
    return {
      formDef: null
    };
  },

  componentWillReceiveProps(nextProps) {
    this.setState({
      formDef: nextProps.formDef,
      profileData: nextProps.userProfileData
    });
  },

  componentDidMount() {
    var _this = this;
    this.setState({
      formDef: this.props.formDef,
      profileData: this.props.userProfileData
    });
  },

  computeWorkStyle(data) {
    var totQuestions = 8;
    var questionPropertyNameBase = 'questionnaire_question';
    //default profile types
    var profileTypes = {
        '1': {
          value: 0,
          color: '#72D0F4',
          label: 'Driver',
          description: "Drivers are people who challenge the team to improve. They are dynamic and usually extroverted people who enjoy stimulating others for solving problems. They guide the team to what they perceive are the objectives. They are efficient, practical, and systematic."
        },
        '2': {
          value: 0,
          color: '#F5CE69',
          label: 'Implementer',
          description: "Implementers are the people who get things done. They turn the team's ideas and concepts into practical actions and plans. They are typically conservative, disciplined people who work systematically and efficiently and are very well organized."
        },
        '3': {
          value: 0,
          color: '#F7929C',
          label: 'Innovator',
          description: 'The innovators are often the creative generators of a team. They are investigative, interested and curious about things. The innovator prefers to be independent and tends to approach tasks in a scientific way. As a creative individual the innovator may play a crucial role in the way a team approaches tasks and solves problems.'
        },
        '4': {
          value: 0,
          color: '#9393F5',
          label: 'Investigator',
          description: "Investigators have a tendency to be reserved and critical. They will react to plans and ideas in a rational and sensible way. They favor a prudent approach to matters and will evaluate them according to their accuracy before acting"
        }
      };
      var mappings = {
        //questionnaire_question#
        '1': {
          //reply#->type#
          '1': '1',
          '2': '2',
          '3': '3',
          '4': '4'
        },
        '2': {
          '1': '4',
          '2': '2',
          '3': '1',
          '4': '3'
        },
        '3': {
          '1': '1',
          '2': '3',
          '3': '2',
          '4': '4'
        },
        '4': {
          '1': '2',
          '2': '4',
          '3': '1',
          '4': '2'
        },
        '5': {
          '1': '2',
          '2': '1',
          '3': '3',
          '4': '4'
        },
        '6': {
          '1': '3',
          '2': '1',
          '3': '2',
          '4': '4'
        },
        '7': {
          '1': '4',
          '2': '3',
          '3': '1',
          '4': '2'
        },
        '8': {
          '1': '2',
          '2': '4',
          '3': '3',
          '4': '1'
        }
      }

    data.questionnaire = true;
    var matchingTypes = jQuery.extend(true, {}, profileTypes);
    for (var i = 1; i < totQuestions+1; i++) {
      var question = questionPropertyNameBase+i;
      if (typeof data[question] === 'string' && data[question]) {
        var typeForQuestion = mappings[i][data[question]];
        matchingTypes[typeForQuestion].value += 1;
      } else {
        data.questionnaire = false
        return
      }
    }

    data.workStyleChartData = matchingTypes;
    data.mainWorkStyleData = {};
    var rankingTypes = Object.keys(profileTypes);
    rankingTypes.sort(function (a, b) {
      return matchingTypes[a].value - matchingTypes[b].value
    }).reverse();
    var maxScore = matchingTypes[rankingTypes[0]].value;
    if (maxScore > 3) {
      data.mainWorkStyleData[rankingTypes[0]] = profileTypes[rankingTypes[0]];
    } else if (maxScore == 3) {
      var nextMaxScore = matchingTypes[rankingTypes[1]].value;
      data.mainWorkStyleData[rankingTypes[0]] = profileTypes[rankingTypes[0]];
      if (nextMaxScore === 3) {
        data.mainWorkStyleData[rankingTypes[1]] = profileTypes[rankingTypes[1]];
      }
    } else {
      data.mainWorkStyleData = matchingTypes;
    }
  },

  formatDate(date) {
    if (!date) {
      return null;
    }
    date = new Date(date);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getUTCMonth()] + ' ' + date.getUTCFullYear();
  },

  formatDateRange(date1, date2) {
    var date1String = this.formatDate(date1);
    var date2String = this.formatDate(date2) || 'present';
    return date1String + ' - ' + date2String;
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
          return <HistoryProfileProperty key={i} title1={educationStep.collegeName} title2={educationStep.degree} title3={this.formatDateRange(educationStep.startDate, educationStep.endDate)} />;
        }, this);
      }

      var experience;
      if (data.experience) {
        experience = data.experience.map(function (experienceStep, i) {
          return <HistoryProfileProperty key={i} title1={experienceStep.companyName} title2={experienceStep.role} title3={this.formatDateRange(experienceStep.startDate, experienceStep.endDate)} description={experienceStep.description} />;
        }, this);
      }

      var contribution;
      if (data.contribution) {
        //FIXME can do much better than this
        var contributionOptions;
        try {
          contributionOptions = this.state.formDef[2].meta.props.contribution.meta.type.meta.type.meta.props.process.meta.props;
        } catch (e) {
          console.error('find a better way to get the enums options');
          contributionOptions = {};
        }
        contribution = data.contribution.map(function (contrib,i ) {
          return <span key={i} className='boxed-property'>{contributionOptions[contrib.process]} {contrib.percentage}%</span>
        });
      }

      this.computeWorkStyle(data);
      var questionnaire = <span>Can't determine work style</span>
      if (data.questionnaire) {
        var workStyleTitle = data.firstName + "'s work style";
        var workStyleDescriptionBase = 'Based on the questionnaire result, ' + data.firstName;
        var workStyleDescription = '';
        var workStyleIds = Object.keys(data.mainWorkStyleData);
        if (workStyleIds.length === 1) {
          workStyleDescription = workStyleDescriptionBase + "'s  dominant work style is " + data.mainWorkStyleData[workStyleIds[0]].label;
        } else if (workStyleIds.length === 2) {
          workStyleDescription = workStyleDescriptionBase + "'s  dominant work style is " + data.mainWorkStyleData[workStyleIds[0]].label + ", and the supporting work style is " + data.mainWorkStyleData[workStyleIds[1]].label;
        } else {
          workStyleDescription = workStyleDescriptionBase + " has a perfectly balanced among all the Ceek working styles"
        }

        var workStylesDetailedDescription = [];
        for (var workStyleId in data.mainWorkStyleData) {
          var workStyle = data.mainWorkStyleData[workStyleId]
          workStylesDetailedDescription.push(<span key={workStyleId} className='work-style-detail'>{workStyle.description}</span>)
        }
        questionnaire = (
          <div className='row'>
            <div className='col-xs-12 col-sm-12 col-md-3 col-lg-3'>
              <Doughnut width='150px' data={data.workStyleChartData} redraw />
            </div>
            <div className='work-style-desc-box col-xs-12 col-sm-12 col-md-9 col-lg-9'>
              <ProfileProperty name={workStyleTitle} inline={false}>
                <div>{workStyleDescription}.</div>
                <div>
                  {workStylesDetailedDescription}
                </div>
              </ProfileProperty>
            </div>
          </div>
          );
      }

      //FIXME can do much better than this
      var motivationOptions;
      try {
        motivationOptions = this.state.formDef[2].meta.props.projectWhy.meta.props;
      } catch (e) {
        console.error('find a better way to get the enums options');
        motivationOptions = {};
      }

      output =
        <div>
          <UserProfileHeader pictureUrl={data.pictureUrl} firstName={data.firstName} lastName={data.lastName} emailAddress={data.emailAddress} statusOnMarket={data.onMarket} changeMarketStatus={this.props.changeMarketStatus} showStatusButton={this.props.showStatusButton} />
          <ProfileSection title='Job Preferences'>
            <ProfileProperty name='Preferred working locations' i18nPrefix='locationPreference.'>{data.locationPreference}</ProfileProperty>
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
          <ProfileSection title='Sample Project'>
            <ProfileProperty name='Project link'>{data.projectLink}</ProfileProperty>
            <ProfileProperty name='Description' inline={false}>{data.projectDescription}</ProfileProperty>
            <ProfileProperty name='Motivation'>{motivationOptions[data.projectWhy]}</ProfileProperty>
            <ProfileProperty name='Team members'>{data.howMany}</ProfileProperty>
            <ProfileProperty name='Project process and individual contribution' inline={false}>
              {contribution}
            </ProfileProperty>
          </ProfileSection>
          <ProfileSection title='Work Style Test Result'>
            {questionnaire}
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
