// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();
var querystring = require('querystring');
var _ = require('underscore');
var fs = require('fs');
var http = require('http');
var formConfig = require('cloud/formConfig.js');
var rejectionReasonFormConfig = require('cloud/rejectionReasonFormConfig.js');
var formValidationUtils = require('cloud/formValidationUtils.js');
var Buffer = require('buffer').Buffer;
var parseExpressHttpsRedirect = require('parse-express-https-redirect');
var parseExpressCookieSession = require('parse-express-cookie-session');

var parseUtils = require('cloud/parseUtils.js');
var getObjectById = parseUtils.getObjectById;
var getObjectWithProperties = parseUtils.getObjectWithProperties;
var getObjectsWithProperties = parseUtils.getObjectsWithProperties;
var fail = parseUtils.fail;
var success = parseUtils.success;

var parseTypes = require('cloud/parseTypes.js');
var TokenRequest = parseTypes.TokenRequest;
var TokenStorage = parseTypes.TokenStorage;
var UserProfile = parseTypes.UserProfile;
var PublicProfile = parseTypes.PublicProfile;
var MatchesPage = parseTypes.MatchesPage;
var Job = parseTypes.Job;
var Like = parseTypes.Like;
var createPublicProfile = parseTypes.createPublicProfile;

var matchesUtils = require('cloud/matchesUtils.js');

var emailUtils = require('cloud/emailUtils.js');

var url = require('url');

var ADMIN_ROLE_NAME = 'admin';

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body
app.use(parseExpressHttpsRedirect());  // Require user to be on HTTPS.
app.use(express.cookieParser('ceek_cookie_sign'));
app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 } }));

var linkedInClientId = '756jhxy8catk44';
var linkedInClientSecret = 'BPdKzczERTAvfusd';

var linkedInBaseUrl = 'https://www.linkedin.com';
var linkedInRedirectEndpoint = linkedInBaseUrl + '/uas/oauth2/authorization?';
var linkedInValidateEndpoint = linkedInBaseUrl + '/uas/oauth2/accessToken';
var linkedInUserEndpoint = linkedInBaseUrl + '/v1/people/~:(first-name,summary,specialties,positions,last-name,headline,location,industry,id,num-connections,picture-url,email-address,public-profile-url)?format=json';

var ceekOAuth2RedirecUri = 'https://www.ceek.cc/oauthCallback';
var herokuMuleBaseUrl = 'https://boiling-stream-7630.herokuapp.com';
var herokuMuleUploadLICVService = herokuMuleBaseUrl + '/uploadLICV';

var isLocal = false;
if (process && process.env && process.env.CEEK_LOCAL === '1') {
  ceekOAuth2RedirecUri = 'http://localhost:3000/oauthCallback';
  herokuMuleBaseUrl = 'http://localhost:5000';
  isLocal = true;
}

var restrictedAcl = parseTypes.restrictedAcl;

// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
});

app.get('/authorize', function(req, res) {
  var tokenRequest = new TokenRequest();
  // Secure the object against public access.
  tokenRequest.setACL(restrictedAcl);
  /**
   * Save this request in a Parse Object for validation when LinkedIn responds
   * Use the master key because this class is protected
   */
  tokenRequest.save(null, { useMasterKey: true }).then(function(obj) {
    /**
     * Redirect the browser to LinkedIn for authorization.
     * This uses the objectId of the new TokenRequest as the 'state'
     *   variable in the LinkedIn redirect.
     */
    res.redirect(
      linkedInRedirectEndpoint + querystring.stringify({
        client_id: linkedInClientId,
        state: obj.id,
        redirect_uri: ceekOAuth2RedirecUri,
        scope: "r_basicprofile r_emailaddress",
        response_type: "code"
      })
    );
  }, function(error) {
    // If there's an error storing the request, render the error page.
    res.render('error', { errorMessage: 'Failed to save auth request.'});
  });

});

app.get('/oauthCallback', function(req, res) {
  var data = req.query;
  var token;
  /**
   * Validate that code and state have been passed in as query parameters.
   * Render an error page if this is invalid.
   */
  if (!(data && data.code && data.state)) {
    res.render('error', { errorMessage: 'Invalid auth response received.'});
    return;
  }
  var query = new Parse.Query(TokenRequest);
  /**
   * Check if the provided state object exists as a TokenRequest
   * Use the master key as operations on TokenRequest are protected
   */
  Parse.Cloud.useMasterKey();
  Parse.Promise.as().then(function() {
    return query.get(data.state);
  }).then(function(obj) {
    // Destroy the TokenRequest before continuing.
    return obj.destroy();
  }).then(function() {
    // Validate & Exchange the code parameter for an access token from LinkedIn
    return getLinkedInAccessToken(data.code);
  }).then(function(access) {
    /**
     * Process the response from LinkedIn, return either the getLinkedInUserDetails
     *   promise, or reject the promise.
     */
    var linkedInData = access.data;
    if (linkedInData) {
      token = linkedInData.access_token;
      return getLinkedInUserDetails(token);
    } else {
      return Parse.Promise.error("Invalid access request.");
    }
  }).then(function(userDataResponse) {
    /**
     * Process the users LinkedIn details, return either the upsertLinkedInUser
     *   promise, or reject the promise.
     */
    var userData = userDataResponse.data;
    if (userData && userData.emailAddress && userData.id) {
      return upsertLinkedInUser(token, userData);
    } else {
      return Parse.Promise.error("Unable to parse LinkedIn data");
    }
  }).then(function(user) {
    /**
     * Render a page which sets the current user on the client-side and then
     *   redirects to /index.html
     */
       Parse.Cloud.useMasterKey();
    res.render('store_auth', { sessionToken: user.getSessionToken() });
  }, function(error) {
    /**
     * If the error is an object error (e.g. from a Parse function) convert it
     *   to a string for display to the user.
     */
    if (error && error.code && error.error) {
      error = error.code + ' ' + error.error;
    }
    res.render('error', { errorMessage: JSON.stringify(error) });
  });

});

var getLinkedInUserDetails = function(accessToken) {
  var data = {
    method: 'GET',
    url: linkedInUserEndpoint,
    headers: {
      'User-Agent': 'Parse.com Cloud Code',
      'Authorization': 'Bearer ' + accessToken
    }};
  return Parse.Cloud.httpRequest(data);
}

var upsertLinkedInUser = function(accessToken, linkedInData) {
  var query = new Parse.Query(TokenStorage);
  query.equalTo('linkedInId', linkedInData.id);
  query.ascending('createdAt');
  // Check if this linkedInId has previously logged in, using the master key
  return query.first({ useMasterKey: true }).then(function(tokenData) {
    // If not, create a new user.
    if (typeof tokenData == "undefined") {
      var userProfile = new UserProfile();
      // Secure the object against public access.
      userProfile.setACL(restrictedAcl);
      linkedInData.linkedInId = linkedInData.id;
      linkedInData.onMarket = false; //by default the user is off the job market.
      delete linkedInData.id;
      userProfile.save(linkedInData, { useMasterKey: true });
      linkedInData.id = linkedInData.linkedInId;

      return newLinkedInUser(accessToken, linkedInData);
    }
    // If found, fetch the user.
    var user = tokenData.get('user');
    return user.fetch({ useMasterKey: true }).then(function(user) {
      // Update the accessToken if it is different.
      if (accessToken !== tokenData.get('accessToken')) {
        tokenData.set('accessToken', accessToken);
      }
      /**
       * This save will not use an API request if the token was not changed.
       * e.g. when a new user is created and upsert is called again.
       */
      return tokenData.save(null, { useMasterKey: true });
    }).then(function(obj) {
      // Return the user object.
      return Parse.Promise.as(user);
    });
  });
}

var getLinkedInAccessToken = function(code) {
  var body = querystring.stringify({
    client_id: linkedInClientId,
    client_secret: linkedInClientSecret,
    code: code,
    redirect_uri: ceekOAuth2RedirecUri,
    grant_type: "authorization_code"
  });
  return Parse.Cloud.httpRequest({
    method: 'POST',
    url: linkedInValidateEndpoint,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Parse.com Cloud Code',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body
  });
}

var newLinkedInUser = function(accessToken, linkedInData) {
  var user = new Parse.User();
  // Generate a random username and password.
  var username = new Buffer(24);
  var password = new Buffer(24);
  _.times(24, function(i) {
    username.set(i, _.random(0, 255));
    password.set(i, _.random(0, 255));
  });
  user.set("username", username.toString('base64'));
  user.set("password", password.toString('base64'));
  // Sign up the new User
  return user.signUp().then(function(user) {
    // create a new TokenStorage object to store the user+LinkedIn association.
    var ts = new TokenStorage();
    ts.set('linkedInId', linkedInData.id);
    ts.set('linkedInLogin', linkedInData.emailAddress);
    ts.set('accessToken', accessToken);
    ts.set('user', user);
    ts.setACL(restrictedAcl);
    var userRoleQuery = new Parse.Query(Parse.Role);
    userRoleQuery.equalTo('name', 'user');
    userRoleQuery.ascending('createdAt');
    return userRoleQuery.first({useMasterKey: true}).then(function (role) {
      var relation = role.relation('users');
      relation.add(user);
      role.save();
      // Use the master key because TokenStorage objects should be protected.
      return ts.save(null, { useMasterKey: true });
    });
  }).then(function(tokenStorage) {
    return upsertLinkedInUser(accessToken, linkedInData);
  });
}

var getUser = function(userId) {
  return getObjectById(Parse.User, userId);
}

var getUserProfile = function(user) {
  return Parse.Promise.as().then(function() {
    return getObjectWithProperties(TokenStorage, [{name: 'user', value: user}]);
  }).then(function(tokenData) {
    var linkedInId = tokenData.get('linkedInId');
    if (!linkedInId) {
      return Parse.Promise.error('No linkedInId data found.');
    }
    return getObjectWithProperties(UserProfile, [{name: 'linkedInId', value: linkedInId}]);
  }).then(function (userDataProfile) {
    //TODO: trim data?
    return Parse.Promise.as(userDataProfile);
  });
}

var getRole = function(roleName) {
  return getObjectWithProperties(Parse.Role, [{name: 'name', value: roleName}]);
}

var userHasRole = function(user, roleName) {
  return getRole(roleName).then(function (role) {
    if (role) {
      var usersRelation = role.relation('users');
      var usersRelationQuery = usersRelation.query();
      usersRelationQuery.equalTo(user.objectId);
      return usersRelationQuery.first({useMasterKey: true}).then(function (user) {
        if (user) {
          return true;
        } else {
          return false;
        }
      });
    } else {
      return false;
    }
  });
}

var userHasAdminPermission = function (user, response) {
  if (!user) {
    fail(response, 'Must be logged in.');
    return false;
  }
  return userHasRole(user, ADMIN_ROLE_NAME).then(function (isAdmin) {
    if (isAdmin) {
      return true;
    } else {
      fail(response, {msg: 'Admin permission needed'});
      return false;
    }
  });
}

function checkParams (request, response, params, requiredParams) {
  var receivedParams = params || {};
  return checkActualParams(response, requiredParams, receivedParams);
}

function checkActualParams (response, requiredParams, receivedParams) {
  console.log('>checkActualParams', receivedParams);
  for (var i = 0; i < requiredParams.length; i++) {
    var requireParam = requiredParams[i];
    //TODO validate parameter type (and convert?) requireParam.type
    if (!receivedParams.hasOwnProperty(requireParam.key)) {
      fail(response, {msg: 'Missing required params'});
      return null;
    }
  }
  return receivedParams;
}

var ParseLICV = function (user, request, response) {
  if (!user) {
    return fail(response, 'Must be logged in.');
  }
  var url;
  if (!Array.isArray(request.params) && typeof request.params === "object") {
    url = request.params.url;
  } else {
    url = request.query.url;
  }
  var query = querystring.stringify({
    'file_url': url
  });
  Parse.Cloud.httpRequest({
    method:'GET',
    url: herokuMuleUploadLICVService+'?'+query,
  }).then(function (data) {
    var formattedCV = data.data;
    getUserProfile(user).then(function (userProfile) {
      userProfile.set('education', formattedCV.education);
      userProfile.set('experience', formattedCV.experience);
      userProfile.set('skills', formattedCV.skills);
      userProfile.set('projects', formattedCV.projects);
      userProfile.set('linkedInCVFileUrl', url);
      userProfile.save(null, {useMasterKey: true});
      success(response, userProfile.attributes);
    });
  }, function (error) {
    console.log(error);
  });
}

Parse.Cloud.define('ParseLICV', function (request, response) {
  ParseLICV(request.user, request, response);
});

app.get('/parseLICV', function(request, response) {
  Parse.User.become(request.query.sessionToken).then(function (user) {
    ParseLICV(user, request, response);
  }, function(error) {
    fail(response, error);
  });
});

var GetProfile = function (user, request, response) {
  if (!user) {
    return fail(response, 'Must be logged in.');
  }
  getUserProfile(user).then(function(userDataResponse) {
    var userData = userDataResponse;
    success(response, {
      formDef: formConfig.formDefinition,
      userProfileData: userData.attributes
    });
  }, function(error) {
    fail(response, error);
  });
};

Parse.Cloud.define('GetProfile', function (request, response) {
  GetProfile(request.user, request, response);
});

app.get('/profile', function(request, response) {
  Parse.User.become(request.query.sessionToken).then(function (user) {
    GetProfile(user, request, response);
  }, function(error) {
      fail(response, error);
  });
});

var PostProfile = function (user, request, response, params) {
  var requiredParams = [{key: 'data', type: 'json'}, {key: 'stepId', type: 'string'}];
  var receivedParams = checkParams(request, response, params, requiredParams);
  if (!receivedParams) {
    return;
  }
  if (!user) {
    return fail(response, 'Must be logged in.');
  }
  getUserProfile(user).then(function(userDataResponse) {
    var formData = receivedParams.data;
    try {
      formData = JSON.parse(formData);
    } catch (e) {
      fail(response, {errorMessage: 'Invalid'})
    }
    var stepId = receivedParams.stepId;
    if (stepId === 'static') {
      var newData = {
        pictureUrl: userDataResponse.get('pictureUrl') || '', //default pic?
        onMarket: userDataResponse.get('onMarket')
      };
      for (var property in newData) {
        if (formData.hasOwnProperty(property)) { //TODO validate?
          newData[property] = formData[property];
        }
      }
      return userDataResponse.save(newData, { useMasterKey: true });
    } else {
      var formDef = formConfig.formDefinition[stepId.replace('step', '')];
      if (!formDef) {
        fail(response, {errorMessage: 'Invalid'})
      }
      var validatedForm = formValidationUtils.validateForm(formDef, formData);
      return userDataResponse.save(validatedForm, { useMasterKey: true });
    }
  }).then(function(userDataResponse) {
    success(response, {msg: 'All good!', userProfileData: userDataResponse.attributes});
  }, function(error) {
    fail(response, error);
  });
};

Parse.Cloud.define('PostProfile', function (request, response) {
  PostProfile(request.user, request, response, request.params);
});

app.post('/profile', function(request, response) {
  Parse.User.become(request.body.sessionToken).then(function (user) {
    PostProfile(user, request, response, request.body);
  }, function(error) {
    fail(response, error);
  });
});

app.get('/pprofile/:id', function(request, response) {
  var publicProfileId = request.params.id;
  getObjectWithProperties(PublicProfile, [
      {name: 'objectId', value: publicProfileId},
      {name: 'expireDate', value: new Date(), operator: 'greaterThan'},
      {name: 'visible', value: true}
  ]).then(function(publicProfileData) {
    if (publicProfileData) {
      var userProfileQuery = new Parse.Query(UserProfile);
      userProfileQuery.equalTo('objectId', publicProfileData.get('userProfileId'));
      userProfileQuery.ascending('createdAt');
      return userProfileQuery.first({ useMasterKey: true });
    } else {
      var errorMessage = {errorMessage: 'Profile Expired'};
      if (request.accepts('html')) {
        response.render('error', errorMessage);
      } else {
        fail(response, errorMessage);
      }
    }
  }).then(function (userDataProfile) {
    //TODO trim data?
    if (userDataProfile) {
      if (request.accepts('html')) {
        response.render('pprofile', userDataProfile.attributes);
      } else {
        success(response, userDataProfile.attributes);
      }
    } else {
      var errorMessage = {errorMessage: 'Profile lost'};
      if (request.accepts('html')) {
        response.render('error', errorMessage);
      } else {
        fail(response, errorMessage);
      }
    }
  });
});

var PostPProfile = function (user, request, response, params) {
  var requiredParams = [{key: 'userId', type: 'string'}];
  var receivedParams = checkParams(request, response, params, requiredParams);
  if (!receivedParams) {
    return;
  }
  userHasAdminPermission(user, response).then(function (isAdmin) {
    if (isAdmin) {
      var userId = receivedParams.userId;
      createPublicProfile(userId).then(
        function (publicProfile) {
          success(response, {publicProfileId: publicProfile.id});
        },
        function (object, error) {
          fail(response, {msg: error});
        }
      );
    }
  });
};

Parse.Cloud.define('PostPProfile', function (request, response) {
  PostPProfile(request.user, request, response, request.params);
});

app.post('/pprofile', function(request, response) {
  Parse.User.become(request.body.sessionToken).then(function (user) {
    PostPProfile(user, request, response, request.body);
  }, function (error) {
    fail(response, error);
  });
});

app.get('/matches/:id', function(request, response) {
  var errorMessage = {errorMessage: 'Something with this page went wrong'};
  var matchesPageId = request.params.id;
  getObjectWithProperties(MatchesPage, [
    {name: 'objectId', value: matchesPageId},
    {name: 'expireDate', value: new Date(), operator: 'greaterThan'},
    {name: 'visible', value: true},
  ], ['job']).then(function(matchesPage) {
    if (matchesPage) {
      getObjectsWithProperties(Like, [
        {name: 'matchesPageId', value: matchesPage.id},
      ], true).then (function (likes) {
        matchesPage = matchesPage.attributes;
        matchesPage.id = matchesPageId;
        matchesPage.job = matchesPage.job.attributes;
        var userProfilePromises = [];
        var userProfileIds = matchesPage.userProfileIds || [];
        var otherUserProfileIds = matchesPage.otherUserProfileIds || [];
        var allProfileIds = userProfileIds.concat(otherUserProfileIds);
        for (var i = 0; i < allProfileIds.length; i++) {
          var userProfileId = allProfileIds[i];
          userProfilePromises.push(getObjectById(UserProfile, userProfileId));
        }
        Parse.Promise.when(userProfilePromises).then(
          function () {
            if (arguments.length > 0) {
              var userProfiles = [];
              var otherUserProfiles = [];
              for (var i = 0; i < arguments.length; i++) {
                if (arguments[i]) {
                  //TODO: trim data?
                  var userProfile = arguments[i].attributes;
                  userProfile.id = arguments[i].id;
                  var like = _.find(likes, function (like) {
                    return like.get('userProfileId') === userProfile.id;
                  });
                  if (like) {
                    userProfile.like = like.get('like') || false;
                    userProfile.mutual = like.get('mutual') || false;
                  }
                  if (_.contains(userProfileIds, userProfile.id)) {
                    userProfiles.push(userProfile);
                  } else if (userProfile.mutual) {
                    otherUserProfiles.push(userProfile);
                  }
                }
              }
              matchesPage.userProfiles = userProfiles;
              matchesPage.otherUserProfiles = otherUserProfiles;
              matchesPage.formConfig = rejectionReasonFormConfig.companyRejectionFormConfig || {};
              if (request.accepts('html')) {
                response.render('matches', matchesPage);
              } else {
                success(response, matchesPage);
              }
            } else {
              fail(response, errorMessage);
            }
          },
          function (error) {
            if (request.accepts('html')) {
              response.render('error', errorMessage);
            } else {
              fail(response, errorMessage);
            }
          });
      });
    } else {
      var errorMessage = {errorMessage: 'Page lost'};
      if (request.accepts('html')) {
        response.render('error', errorMessage);
      } else {
        fail(response, errorMessage);
      }
    }
  });
});

var PostMatches = function (user, request, response, params) {
  var requiredParams = [{key: 'userProfileIds', type: 'json'}, {key: 'jobId', type: 'string'}];
  var receivedParams = checkParams(request, response, params, requiredParams);
  if (!receivedParams) {
    return;
  }
  userHasAdminPermission(user, response).then(function (isAdmin) {
    if (isAdmin) {
      var userProfileIds = JSON.parse(receivedParams.userProfileIds);
      var jobId = receivedParams.jobId;
      matchesUtils.createMatch(userProfileIds, jobId).then(
        function (matchesPage) {
          success(response, {matchesPageId: matchesPage.id});
        },
        function (error) {
          fail(response, {msg: error});
        }
      );
    }
  });
};

Parse.Cloud.define('PostMatches', function (request, response) {
  PostMatches(request.user, request, response, request.params);
});

app.post('/matches', function(request, response) {
  Parse.User.become(request.body.sessionToken).then(function (user) {
    PostMatches(user, request, response, request.body);
  }, function (error) {
    fail(response, error);
  });
});

var PostMail = function (user, request, response, params) {
  var requiredParams = [{key: 'to', type: 'email'}, {key: 'from', type: 'email'}, {key: 'subject', type: 'string'}, {key: 'text', type: 'string'}, {key: 'html', type: 'string'}];
  var receivedParams = checkParams(request, response, params, requiredParams);
  if (!receivedParams) {
    return;
  }
  userHasAdminPermission(user, response).then(function (isAdmin) {
    if (isAdmin) {
      emailUtils.sendEmail(receivedParams.to, receivedParams.from, receivedParams.subject, receivedParams.text, receivedParams.html,
        function() {
          success(response, {msg: 'Message Sent!'});
        },
        function(error) {
          fail(response, {msg: error});
        });
      return;
    }
  });
};

Parse.Cloud.define('PostMail', function (request, response) {
  PostMail(request.user, request, response, request.params);
});

app.post('/mail', function(request, response) {
  Parse.User.become(request.body.sessionToken).then(function (user) {
    PostMail(user, request, response, request.body);
  }, function (error) {
    fail(response, error);
  });
});

/* liking */

app.get('/likeu/:id', function(request, response) {
  var userProfileId = request.params.id;
  var matchId = request.query.matchId;
  var likeResp = request.query.like === "true" ? true : false;
  var likeReason = request.query.reason;
  getObjectWithProperties(Like, [
    {name: 'userProfileId', value: userProfileId},
    {name: 'matchesPageId', value: matchId}
  ]).then(function (like) {
    if (like) {
      success(response, {msg: 'Already liked!'});
    } else {
      getObjectWithProperties(MatchesPage, [
        {name: 'objectId', value: matchId},
        {name: 'userProfileIds', value: [userProfileId], operator: 'containedIn'},
        {name: 'expireDate', value: new Date(), operator: 'greaterThan'},
        {name: 'visible', value: true}
      ]).then(function(matchPageData) {
        if (matchPageData) {
          getObjectById(UserProfile, userProfileId)
          .then(function (userProfile) {
            var likeObj = new Like();
            likeObj.setACL(restrictedAcl);
            likeObj.set('userProfileId', userProfileId);
            likeObj.set('matchesPageId', matchId);
            likeObj.set('jobId', matchPageData.get('jobId'));
            likeObj.set('job', matchPageData.get('job'));
            likeObj.set('expireDate', new Date(Date.now()+86400000));
            likeObj.set('like', likeResp);
            if (likeReason) {
              try {
                likeReason = JSON.parse(likeReason);
                likeReason = formValidationUtils.validateForm(rejectionReasonFormConfig.companyRejectionFormConfig, likeReason);
                likeObj.set('companyReason', likeReason);
              } catch (e) {
                console.error(e);
              }
            }
            likeObj.save(null, {useMasterKey: true}).then(function () {
              //TODO send email
              if (!isLocal && userProfile.get('emailAddress') && likeResp) {
                //sendEmail(userProfile.get('emailAddress'), null, 'Somebody wants to interview you!', 'They saw your profile on ceek and they are interested in interviewing you!', '<b>They saw your profile on ceek and they are interested in interviewing you</b>');
              }
              success(response, {msg: 'You liked the user!'});
            });
          })
        } else {
          var errorMessage = {errorMessage: 'Match expired or this match does not exist'};
          fail(response, errorMessage);
        }
      });
    }
  })
});

var GetLikeJ = function (user, request, response) {
  if (!user) {
    return fail(response, 'Must be logged in.');
  }
  var likeId = request.params.id;
  var likeResp = request.query.like === "true" ? true : false;
  var likeReason = request.query.reason;
  getObjectById(Like, likeId).then(function(like) {
    if (like) {
      if (likeReason) {
        likeReason = formValidationUtils.validateForm(rejectionReasonFormConfig.candidateRejectionFormConfig, likeReason);
      }
      if (likeReason) {
        try {
          likeReason = JSON.parse(likeReason);
          likeReason = formValidationUtils.validateForm(rejectionReasonFormConfig.candidateRejectionFormConfig, likeReason);
        } catch (e) {
          console.error(e);
        }
      }
      like.save({'mutual': likeResp, candidateReason: likeReason}, {useMasterKey: true}).then(
      function () {
        success(response, {msg:'You liked the job!'});
      },
      function (error) {
        fail(response, error);
      });
    }
  }, function(error) {
    fail(response, error);
  });
};

Parse.Cloud.define('GetLikeJ', function (request, response) {
  GetLikes(request.user, request, response);
});

app.get('/likej/:id', function(request, response) {
  Parse.User.become(request.query.sessionToken).then(function (user) {
    GetLikeJ(user, request, response);
  }, function(error) {
      fail(response, error);
  });
});

var GetLikes = function (user, request, response) {
  if (!user) {
    return fail(response, 'Must be logged in.');
  }
  getUserProfile(user).then(function (userProfile) {
    getObjectsWithProperties(Like, [
      {name: 'userProfileId', value: userProfile.id},
      //{name: 'expireDate', value: new Date(), operator: 'greaterThan'},
      {name: 'like', value: true}
    ], true, ['job']).then(function(likes) {
      var outLikes = [];
      var otherOutLikes = [];
      for (var i = 0; i < likes.length; i++) {
        var like = likes[i].attributes;
        like.id = likes[i].id;
        like.job = likes[i].get('job').attributes;
        var expirationDate = likes[i].get('expireDate');
        var today = new Date();
        if (today > expirationDate && likes[i].get('mutual')) {
          otherOutLikes.push(like);
        } else {
          outLikes.push(like);
        }

      }
      success(response, {
        likes: outLikes,
        otherLikes: otherOutLikes,
        formConfig: rejectionReasonFormConfig.candidateRejectionFormConfig || {}
      });
    }, function(error) {
      fail(response, error);
    });
  }, function(error) {
      fail(response, error);
  });
};

Parse.Cloud.define('GetLikes', function (request, response) {
  GetLikes(request.user, request, response);
});

app.get('/likes', function(request, response) {
  Parse.User.become(request.query.sessionToken).then(function (user) {
    GetLikes(user, request, response);
  }, function(error) {
      fail(response, error);
  });
});

/*admin*/

var GetUsers = function (user, request, response, params) {
  userHasAdminPermission(user, response).then(function (isAdmin) {
    if (isAdmin) {
      var properties = [];
      if (params) {
        for (var param in params) {
          if (param === 'simpleTags') {
            properties.push({
              name: param,
              value: [params[param]],
              operator: 'containsAll'
            });
          } else {
            properties.push({
              name: param,
              value: params[param],
              operator: 'contains'
            });
          }
        }
      }
      getObjectsWithProperties(UserProfile, properties, true).then(function (users) {
        if (users) {
          success(response, users);
        } else {
          success(response, []);
        }
      }, function (object, error) {
        fail(response, error);
      });
    }
  });
};

Parse.Cloud.define('GetUsers', function (request, response) {
  GetUsers(request.user, request, response, request.params);
});

app.get('/users', function(request, response) {
  Parse.User.become(request.query.sessionToken).then(function (user) {
    delete request.query.sessionToken
    GetUsers(user, request, response, request.query);
  }, function (error) {
    fail(response, error);
  });
});

app.get('/admin', function(request, response) {
  if (Parse.User.current()) {
    Parse.User.current().fetch().then(function(user) {
        userHasAdminPermission(user, response).then(
        function (isAdmin) {
            var userProfilesQuery = new Parse.Query(UserProfile);
            userProfilesQuery.ascending('createdAt');
            var jobsQuery = new Parse.Query(Job);
            jobsQuery.ascending('createdAt');
            Parse.Promise.when(userProfilesQuery.find({useMasterKey: true}), jobsQuery.find({useMasterKey: true})).then(function (userProfiles, jobs) {
              if (userProfiles, jobs) {
                response.render('admin', {userProfiles: userProfiles, jobs: jobs});
              }
            });
        },
        function(error) {
          fail(response, {msg: 'Must be logged in!'})
        });
    });
  } else {
      fail(response, {msg: 'Must be logged in!'});
  }
});

// // Example reading from the request query string of an HTTP get request.
// app.get('/test', function(req, res) {
//   // GET http://example.parseapp.com/test?message=hello
//   res.send(req.query.message);
// });

// // Example reading from the request body of an HTTP post request.
// app.post('/test', function(req, res) {
//   // POST http://example.parseapp.com/test (with request body "message=hello")
//   res.send(req.body.message);
// });

// Attach the Express app to Cloud Code.
app.listen();
