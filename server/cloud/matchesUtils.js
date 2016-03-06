var parseUtils = require('cloud/parseUtils.js');
var getObjectById = parseUtils.getObjectById;
var getObjectWithProperties = parseUtils.getObjectWithProperties;
var getObjectsWithProperties = parseUtils.getObjectsWithProperties;

var parseTypes = require('cloud/parseTypes.js');
var TokenRequest = parseTypes.TokenRequest;
var TokenStorage = parseTypes.TokenStorage;
var UserProfile = parseTypes.UserProfile;
var PublicProfile = parseTypes.PublicProfile;
var MatchesPage = parseTypes.MatchesPage;
var Job = parseTypes.Job;
var Like = parseTypes.Like;
var createPublicProfile = parseTypes.createPublicProfile;
var restrictedAcl = parseTypes.restrictedAcl;

var createMatch = function (userProfileIds, jobId) {
  var userPProfilePromises = [];
  for (var i = 0; i < userProfileIds.length; i++) {
    userPProfilePromises.push(createPublicProfile(userProfileIds[i]));
  }
  var matchPromise = new Parse.Promise();
  Parse.Promise.when(userPProfilePromises).then(
    function () {
      if (arguments.length > 0) {
        getObjectById(Job, jobId).then(function (job) {
          if (job) {
            var userPProfileIds = [];
            for (var i = 0; i < arguments.length; i++) {
              userPProfileIds.push(arguments[i].id);
            }
            getObjectWithProperties(MatchesPage, [{name: 'jobId', value: jobId}], ['job']).then(
            function (matchesPage) {
              //if a page already exists for this jobId, just update the object with the new profiles
              if (matchesPage) {
                var today = new Date();
                var expirationDate = matchesPage.get('expireDate');
                if (!(today > expirationDate)) {
                  return matchPromise.reject('This match has not expired yet.');
                }
                matchesPage.set('otherUserProfileIds', matchesPage.get('userProfileIds'));
                matchesPage.set('otherPublicProfileIds', matchesPage.get('publicProfileIds'));
              } else {
                matchesPage = new MatchesPage();
                matchesPage.setACL(restrictedAcl);
                matchesPage.set('jobId', jobId);
                matchesPage.set('job', job);
              }
              matchesPage.set('userProfileIds', userProfileIds);
              matchesPage.set('publicProfileIds', userPProfileIds);
              matchesPage.set('visible', true);
              matchesPage.set('matchesPageId', undefined);
              matchesPage.set('expireDate', new Date(Date.now()+86400000));

              return matchesPage.save(null, {
                useMasterKey: true,
                success: function (matchesPage) {
                  matchPromise.resolve(matchesPage);
                },
                error: function (error) {
                  matchPromise.reject(error);
                }
              });
            });
          } else {
            matchPromise.reject('Job lost!');
          }
        }, function (error) {
          matchPromise.reject(error);
        });
      }
    },
    function (error) {
      matchPromise.reject(error);
    }
  );
  return matchPromise;
};

module.exports = {
  createMatch: createMatch
};
