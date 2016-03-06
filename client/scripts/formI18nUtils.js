//i18 utils

var DEFAULT_LOCALE = 'en_US';
var i18n = {
  'en_US': {
    'firstName': 'Name',
    'locationPreference': 'In which locations would you like to work?',
    'locationPreference.eastBay': 'East Bay',
    'locationPreference.southBay': 'South Bay',
    'locationPreference.northBay': 'North Bay',
    'locationPreference.sanFrancisco': 'San Francisco',
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
    'questionnaire.question5': '5. When communicating a new idea, which one do you often use',
    'questionnaire.question6': '6. When you explain an idea, you are most often being',
    'questionnaire.question7': '7. Which work situation do you prefer the most?',
    'questionnaire.question8': '8. If you were to win a contest, it would be for'
  }
};

function getText(key, locale) {
  if (!locale) {
    locale = DEFAULT_LOCALE;
  }
  return i18n[locale][key] || '';
}

module.exports = {
  getText: getText
}
