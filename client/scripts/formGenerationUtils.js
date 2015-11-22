var t = require('tcomb-form');
var customLayouts = require('./customLayout.js');

var i18n = {
  'firstName': 'Name',
  'locationPreference': 'In which locations would you like to work?',
  'roleType': 'What are your ideal roles?',
  'employmentType': 'Employment type?',
  'employmentType.permanent': 'Permanent (full time)',
  'dontContact': "Don't contact these companies",
  'summary': "More about you",
  'experience': 'Work experience',
  'experience.companyName': 'Company',
  'experience.role': 'Title',
  'education.collegeName': 'University',
  'education.degree': 'Major',
  'portfolio.description': 'Description',
  'portfolio.why': 'Why did you create this project?',
  'portfolio.howMany': 'How many team members?',
  'contribution': 'The process and your contribution',
  'contribution.process': 'Process (Plan, Architecture, Develop, Test, ...)',
  'contribution.percentage': 'Contribution %',
  'questionnaire.question1': '1. Which type fits you the best?',
  'questionnaire.question2': '2. When I am assigned a new project, I begin with',
  'questionnaire.question3': '3. Which is your style when working on a project?',
  'questionnaire.question4': '4. When you are solving a difficult problem, which one do you rely on the most?',
  'questionnaire.question5': '5. When communicating a new idea, which is do you often use',
  'questionnaire.question6': '6. When you explain an idea, you are most often being',
  'questionnaire.question7': '7. Which work situation do you prefer the most?',
  'questionnaire.question8': '8. If you were to win a contest, it would be for'

};

function generateForm (formDefinition) {
  return generateField(formDefinition.meta);
};

function generateOptions (formDefinition) {
  return generateFieldOptions(formDefinition.meta);
};

function getFieldByName (fieldName) {
  if (t.hasOwnProperty(fieldName)) {
    return t[fieldName]
  } else {
    throw 'Nope';
  }
};

function getOptions (fieldMeta) {
  var options;
  if (fieldMeta.options) {
    options = {};
    for (var option in fieldMeta.options) {
      switch (option) {
        case 'template':
          var functionName = fieldMeta.options[option][0];
          options[option] = customLayouts[functionName].apply(null, fieldMeta.options[option].slice(1));
          break;
        case 'factory':
          if (fieldMeta.options[option] === 't.form.Radio') {
            options[option] = t.form.Radio;
          } else {
            throw 'This factory does not exist';
          }
          break;
        case 'label':
          options[option] = i18n[fieldMeta.options[option]];
          break;
        default:
          options[option] = fieldMeta.options[option];
          break;
      };
    }
  };
  return options;
};

function generateFieldOptions (fieldMeta) {
  switch (fieldMeta.kind) {
    case 'enums':
    case 'irreducible':
      return getOptions(fieldMeta);
    case 'struct':
      var options = getOptions(fieldMeta);
      var props = fieldMeta.props;
      for (var prop in props) {
        var fieldOptions = generateFieldOptions(props[prop].meta);
        if (fieldOptions) {
          if (!options) {
            options = {};
          }
          if (!options.fields) {
            options.fields = {};
          }
          options.fields[prop] = fieldOptions;
        }
      }
      return options;
    case 'maybe':
      return generateFieldOptions(fieldMeta.type.meta);
      break;
    case 'list':
      var listOptions = getOptions(fieldMeta) || {};
      listOptions.item = generateFieldOptions(fieldMeta.type.meta);
      return listOptions;
      break;
  }
};

function generateField (fieldMeta) {
  switch (fieldMeta.kind) {
    case 'irreducible':
      return getFieldByName(fieldMeta.name);
    case 'struct':
      var struct = {};
      var props = fieldMeta.props;
      for (var prop in props) {
        struct[prop] = generateField(props[prop].meta);
      }
      return t.struct(struct);
    case 'maybe':
      return t.maybe(generateField(fieldMeta.type.meta));
      break;
    case 'list':
      return t.list(generateField(fieldMeta.type.meta));
      break;
    case 'enums':
      return t.enums(fieldMeta.props);
      break;
  }
};

module.exports = {
  generateForm: generateForm,
  generateOptions: generateOptions
};