var fs = require('fs');

var parseCV = function (jsonCV) {
  var pages = jsonCV[pagesKey] || [];
  var g = extractCV([0, 19, 0, 0], [0, 16, 1, 0], pages, true);
  console.log("Okp!");
  return g;
}

var formImageKey = "formImage"
var pagesKey = "Pages";
var textsKey = "Texts";
var rKey = "R";
var tKey = "T";
var tsKey = "TS";

var compareTs = function (ts1, ts2) {
  if (ts1.length !== ts2.length) {
    return false;
  }
  for (var i =0; i < ts1.length; i++) {
    if (ts1[i] !== ts2[i]) {
      return false;
    }
  }
  return true;
};

var DATE_TYPE = 0;
var DATE_RANGE_TYPE = 1;
var TEXT_TYPE = 2;

var DATE_TYPE_REGEXP = '(\\d*)\s*(January|February|March|April|May|June|July|August|September|October|November|December)\\s*(\\d+)';
var DATE_RANGE_TYPE_REGEXP = '\\(\\d+\\s*(day|month|year)';

var matchSectionType = function (text) {
  if (new RegExp(DATE_TYPE_REGEXP, 'gi').test(text)) {
    return DATE_TYPE;
  } else if (new RegExp(DATE_RANGE_TYPE_REGEXP, 'gi').test(text)) {
    return DATE_RANGE_TYPE;
  }
  return TEXT_TYPE;
};

var EXPERIENCE_SECTION = 0;
var EDUCATION_SECTION = 1;
var PROJECTS_SECTION = 2;
var LANGUAGES_SECTION = 3;
var SKILLS_AND_EXPERTISE_SECTION = 4;
var PATENTS_SECTION = 5;
var EXPERTISE_SECTION = 5;
var NONE_SECTION = -1;

var matchSectionTitle = function (sectionTitle) {
  if (/experience/i.test(sectionTitle)) {
    return EXPERIENCE_SECTION;
  } else if (/language/i.test(sectionTitle)) {
    return LANGUAGES_SECTION;  
  } else if (/project/i.test(sectionTitle)) {
    return PROJECTS_SECTION;
  } else if (/patent/i.test(sectionTitle)) {
    return PATENTS_SECTION;
  } else if (/skills/i.test(sectionTitle)) {
    return SKILLS_AND_EXPERTISE_SECTION;
  } else if (/expertise/i.test(sectionTitle)) {
    return EXPERTISE_SECTION;
  } else if (/education/i.test(sectionTitle)) {
    return EDUCATION_SECTION;
  }
};

var serializeDate = function (month, day, year) {
  month = month || 'Jan';
  day = day || 1;
  year = year || 1970;
  return new Date([day, month, year].join(' ')).toString();
};

//find section headers and add all texts to the same group
var extractCV = function (sectionHeaderTs, subsectionHeaderTs, pages, textOnly) {
  var sections = [];
  var currentSection = null;
  for (var i = 0; i < pages.length; i++) {
    var currentPage = pages[i];
    var texts = currentPage[textsKey];
    for (var j = 0; j < texts.length; j++) {
      var text = texts[j];
      var r = text[rKey][0]; //TODO what to do with lines here?
      var t = unescape(r[tKey]);
      var ts = r[tsKey];
      var tt = textOnly ? t : r;
      if (compareTs(ts, sectionHeaderTs)) {
        console.log(">Group header found:", t);
        currentSection = {
          sectionHeaderT: tt,
          sectionType: matchSectionTitle(unescape(t)),
          sectionContent: [],
          subsections: [],
        };
        sections.push(currentSection)
      } else if (currentSection && compareTs(ts, subsectionHeaderTs)) {
        console.log(">Group subsection header found:", t);
        var subsection = {
          subsectionHeaderT: tt,
          subsectionContent: []
        };
        currentSection.subsections.push(subsection);
      } else if (currentSection && currentSection.subsections[currentSection.subsections.length-1]) {
        var sectionType = matchSectionType(t);
        var subsectionContent = {
          content: tt,
          type: sectionType,
        };
        if (sectionType === DATE_TYPE) {
          var dates = [];
          var matches;
          var dateRE = new RegExp(DATE_TYPE_REGEXP, 'ig');
          while ((matches = dateRE.exec(t)) !== null) {
            dates.push(serializeDate(matches[2], matches[1], matches[3]));
          }
          subsectionContent.dates = dates;
        }
      currentSection.subsections[currentSection.subsections.length-1].subsectionContent.push(subsectionContent);
      }
    }
  }
  return sections;
}

var formatJsonCV = function (jsonCV) {
  var formattedData = {};
  for (var i = 0; i < jsonCV.length; i++) {
    var section = jsonCV[i];
    console.log('>sectionType', section.sectionType);
    if (section.sectionType === EXPERIENCE_SECTION) {
      console.log('>sectionType EXPERIENCE found');
      var experienceInfo = [];
      for (var j = 0; j < section.subsections.length; j++) {
        var subsection = section.subsections[j];
        var subsectionHeaderT = subsection.subsectionHeaderT;
        var experienceObject = {
          description: ''
        };
        experienceInfo.push(experienceObject);
        var matches = /\s*([\S\s]+)\s+at\s+([\S\s]+)\s*/.exec(subsectionHeaderT);
        if (matches) {
          experienceObject.role = matches[1];
          experienceObject.companyName = matches[2];
        } else {//lousy tentative to split where ' at ' is
          var subsectionHeader = subsectionHeaderT.split(' at ');
          experienceObject.role = subsectionHeader[0];
          experienceObject.companyName = subsectionHeader[1];
        }
        for (var k = 0; k < subsection.subsectionContent.length; k++) {
          var subsectionContent = subsection.subsectionContent[k];
          if (subsectionContent.type === DATE_TYPE) {
            experienceObject.startDate = subsectionContent.dates[0];
            experienceObject.endDate = subsectionContent.dates[1];
          } else if (subsectionContent.type === TEXT_TYPE) {
            experienceObject.description += subsectionContent.content;
          }
        }
      }
      formattedData['experience'] = experienceInfo;
    } else if (section.sectionType === EDUCATION_SECTION) {
      console.log('>sectionType EDUCATION found');
      var educationInfo = [];
      for (var j = 0; j < section.subsections.length; j++) {
        var subsection = section.subsections[j];
        var educationObject = {
          collegeName: subsection.subsectionHeaderT,
          description: ''
        };
        educationInfo.push(educationObject);
        for (var k = 0; k < subsection.subsectionContent.length; k++) {
          var subsectionContent = subsection.subsectionContent[k];
          if (subsectionContent.type === TEXT_TYPE) {
            var matches = /\s*([\S\s]+),\s*([\S\s]+),\s*(\d+)\s*-\s*(\d+)\s*/.exec(subsectionContent.content);
            if (matches && matches.length === 5) {
              educationObject.degree = matches[1] + ' ' + matches[2];
              educationObject.startDate = serializeDate(null, null, matches[3]);
              educationObject.endDate = serializeDate(null, null, matches[4]);
            } else {
              educationObject.description += subsectionContent.content;
            }
          }
        }
      }
      formattedData['education'] = educationInfo;
    } else if (section.sectionType === SKILLS_AND_EXPERTISE_SECTION) {
      console.log('>sectionType SKILLS AND EXPERTISE found');
      var skillsInfo = [];
      for (var j = 0; j < section.subsections.length; j++) {
        var subsection = section.subsections[j];
        skillsInfo.push(subsection.subsectionHeaderT);
      }
      formattedData['skills'] = skillsInfo;
    }
  }
  return formattedData;
};

module.exports = {
  parseCV: parseCV,
  formatJsonCV: formatJsonCV
};