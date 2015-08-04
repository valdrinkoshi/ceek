var useCloudCode = false;

var AdminServices = {};

AdminServices.GetUsers = function (filters) {
  var getUsersPromise = jQuery.Deferred();
  if (useCloudCode) {
    Parse.Cloud.run('GetUsers', filters).then(function (data) {
      getUsersPromise.resolve(data);
    });
  } else {
    if (!filters) {
      filters = {};
    }
    filters.sessionToken = Parse.User.current().getSessionToken();
    $.get('users', filters, function (data) {
      getUsersPromise.resolve(data);
    });
  }
  return getUsersPromise;
};

module.exports = AdminServices;