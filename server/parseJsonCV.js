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
var DATE_RANGE_TYPE_REGEXP = '\\(\\d+\s*(day|month|year)';

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


//find section headers and add all texts to the same group
var extractCV = function (sectionHeaderTs, subsectionHeaderTs, pages, textOnly) {
  var sections = [];
  for (var i = 0; i < pages.length; i++) {
    var currentPage = pages[i];
    var texts = currentPage[textsKey];
    var currentSection = null;
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
            var day = matches[1] || "1";
            var month = matches[2] || "January";
            var year = matches[3] || "1970";
            dates.push(day + " " + month + " " + year)
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
  console.log('>length', jsonCV);
  for (var i = 0; i < jsonCV.length; i++) {
    var section = jsonCV[i];
    console.log('>sectionType', section.sectionType);
    EXPERIENCE_SECTION
    if (section.sectionType === EXPERIENCE_SECTION) {
      console.log('>sectionType EXPERIENCE found');
      var experienceInfo = [];
      for (var j = 0; j < section.subsections.length; j++) {
        var subsectionHeader = section.subsections[j].subsectionHeaderT.split('at');
        experienceInfo.push({
          role: subsectionHeader[0],
          companyName: subsectionHeader[1]
        });
      }
      formattedData['experience'] = experienceInfo;
    } else if (section.sectionType === EDUCATION_SECTION) {
      console.log('>sectionType EDUCATION found');
      var educationInfo = [];
      for (var j = 0; j < section.subsections.length; j++) {
        educationInfo.push({
          collegeName: section.subsections[j].subsectionHeaderT
        });
      }
      formattedData['education'] = educationInfo;
    }
  }
  return formattedData;
};

module.exports = {
  parseCV: parseCV,
  formatJsonCV: formatJsonCV
};