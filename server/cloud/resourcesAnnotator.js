//resourcesAnnotator

var _ = require('underscore');
var annotator = require('./annotator.js');
var parseUtils = require('./parseUtils.js');

var UserProfile = Parse.Object.extend('UserProfile');
var Job = Parse.Object.extend('Job');

function annotateObjects (type, annotateFn) {
  var promise = new Parse.Promise();
  var promises = [];
  parseUtils.getObjectsWithProperties(type, null, true).then(
    function (data) {
      if (_.isArray(data) && _.isFunction(annotateFn)) {
        for (var i = 0; i < data.length; i++) {
          promises.push(annotateFn(data[i]));
        }
      }
    }
  );
  Parse.Promise.when(promises).then(
  function () {
    promise.resolve({});
  },
  function () {
    promise.reject({});
  })
  return promise;
};

function builtTextToAnnotate (object, fields) {
  var parts = [];
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    if (!_.isEmpty(object[field])) {
      parts.push(object[field]);
    }
  }
  var text = parts.join(' ');
  return text;
};

function annotateObject (object, fields) {
  var text = builtTextToAnnotate(object, fields);
  return annotate(text);
};

function annotate (text) {
  return annotator.annotate(text);
};

function annotateProfiles (req) {
  return annotateObjects(UserProfile, annotateProfile);
};

function annotateJobs () {
  return annotateObjects(Job, annotateJob);
};

function annotateProfile (profile) {
  var mainDescriptionText = builtTextToAnnotate(profile.attributes, ['headline', 'summary']);
  var text = mainDescriptionText;
  if (!_.isEmpty(profile.attributes.skills)) {
     text += ' ' + profile.attributes.skills.join(' ')
  }
  console.log(text);
  return annotate(text).then(function (data) {
    var filteredData = annotator.filter(data);
    console.log(filteredData);
    profile.save({tags: filteredData.resources, simpleTags: filteredData.simpleTags}, {useMasterKey: true});
  });
};

function annotateJob (job) {
  return annotateObject(job.attributes, ['title', 'description']).then(
    function (data) {
      var filteredData = annotator.filter(data);
      job.save({tags: filteredData.resources, simpleTags: filteredData.simpleTags}, {useMasterKey: true});
    },
    function (error) {
      console.error('err',error);
    }
  );
};

module.exports = {
  annotateJobs: annotateJobs,
  annotateProfiles: annotateProfiles,
  annotateJob: annotateJob,
  annotateProfile: annotateProfile
};