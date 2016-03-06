var TokenRequest = Parse.Object.extend('TokenRequest');
var TokenStorage = Parse.Object.extend('TokenStorage');
var UserProfile = Parse.Object.extend('UserProfile');
var PublicProfile = Parse.Object.extend('PublicProfile');
var MatchesPage = Parse.Object.extend('MatchesPage');
var Job = Parse.Object.extend('Job');
var Like = Parse.Object.extend('Like');

var restrictedAcl = new Parse.ACL();
restrictedAcl.setPublicReadAccess(false);
restrictedAcl.setPublicWriteAccess(false);

var createPublicProfile = function (userId) {
  var publicProfile = new PublicProfile();
  publicProfile.setACL(restrictedAcl);
  publicProfile.set('userProfileId', userId);
  publicProfile.set('publicProfileId', undefined);
  publicProfile.set('visible', true);
  publicProfile.set('expireDate', new Date(Date.now()+86400000));
  return publicProfile.save(null, {useMasterKey: true});
};

module.exports = {
  TokenRequest: TokenRequest,
  TokenStorage: TokenStorage,
  UserProfile: UserProfile,
  PublicProfile: PublicProfile,
  MatchesPage: MatchesPage,
  Job: Job,
  Like: Like,
  restrictedAcl: restrictedAcl,
  createPublicProfile: createPublicProfile
};
