var useCloudCode = false;

var Services = {};

Services.GetProfile = function () {
  var getProfilePromise = jQuery.Deferred();
  if (useCloudCode) {
    Parse.Cloud.run('GetProfile', {}).then(function (data) {
      getProfilePromise.resolve(data);
    });
  } else {
    $.get('profile', {sessionToken: Parse.User.current().getSessionToken()}, function (data) {
      getProfilePromise.resolve(data);
    });
  }
  return getProfilePromise;
};

Services.PostProfile = function (value, stepId) {
  var postProfilePromise = jQuery.Deferred();
  if (useCloudCode) {
    Parse.Cloud.run('PostProfile', {data: value, stepId: stepId}).then(function (data) {
      postProfilePromise.resolve(data);
    });
  } else {
    $.post('profile', {sessionToken: Parse.User.current().getSessionToken(), data: value, stepId: stepId}, function (data) {
      postProfilePromise.resolve(data);
    });
  }
  return postProfilePromise;
};

Services.ParseLICV = function (url) {
  var parseLICVPromise = jQuery.Deferred();
  if (useCloudCode) {
    Parse.Cloud.run('ParseLICV', {url: url}).then(function (data) {
      parseLICVPromise.resolve(data);
    });
  } else {
    $.get('parseLICV', {sessionToken: Parse.User.current().getSessionToken(), url: url}, function (response) {
      parseLICVPromise.resolve(response);
    });
  }
  return parseLICVPromise;
};

Services.PostPProfile = function (userId) {
  var postPProfilePromise = jQuery.Deferred();
  if (useCloudCode) {
    Parse.Cloud.run('PostPProfile', {userId: userId}).then(function (data) {
      postPProfilePromise.resolve(data);
    });
  } else {
    $.post('pprofile', {sessionToken: Parse.User.current().getSessionToken(), userId: userId}, function (data) {
      postPProfilePromise.resolve(data);
    });
  }
  return postPProfilePromise;
};

module.exports = Services;