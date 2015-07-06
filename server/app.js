// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();
var querystring = require('querystring');
var _ = require('underscore');
var Buffer = require('buffer').Buffer;

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body

var linkedInClientId = '756jhxy8catk44';
var linkedInClientSecret = 'BPdKzczERTAvfusd';

var linkedInBaseUrl = 'https://www.linkedin.com';
var linkedInRedirectEndpoint = linkedInBaseUrl + '/uas/oauth2/authorization?';
var linkedInValidateEndpoint = linkedInBaseUrl + '/uas/oauth2/accessToken';
var linkedInUserEndpoint = linkedInBaseUrl + '/v1/people/~:(first-name,summary,specialties,positions,last-name,headline,location,industry,id,num-connections,picture-url,email-address,public-profile-url)?format=json';

var ceekOAuth2RedirecUri = "https://ceek.parseapp.com/oauthCallback";
if (process && process.env && process.env.LOCAL === "1") {
  ceekOAuth2RedirecUri = "http://localhost:3000/oauthCallback";
}

/**
 * In the Data Browser, set the Class Permissions for these 2 classes to
 *   disallow public access for Get/Find/Create/Update/Delete operations.
 * Only the master key should be able to query or write to these classes.
 */
var TokenRequest = Parse.Object.extend("TokenRequest");
var TokenStorage = Parse.Object.extend("TokenStorage");
var UserProfile = Parse.Object.extend("UserProfile");

var restrictedAcl = new Parse.ACL();
restrictedAcl.setPublicReadAccess(false);
restrictedAcl.setPublicWriteAccess(false);

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
    //params: { access_token: accessToken },
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
    // Use the master key because TokenStorage objects should be protected.
    return ts.save(null, { useMasterKey: true });
  }).then(function(tokenStorage) {
    return upsertLinkedInUser(accessToken, linkedInData);
  });
}

Parse.Cloud.define('getUserProfileData', function(request, response) {
  if (!request.user) {
    return response.error('Must be logged in.');
  }
  var query = new Parse.Query(TokenStorage);
  query.equalTo('user', request.user);
  query.ascending('createdAt');
  
  Parse.Promise.as().then(function() {
    return query.first({ useMasterKey: true });
  }).then(function(tokenData) {
    var linkedInId = tokenData.get('linkedInId');
    if (!linkedInId) {
      return Parse.Promise.error('No linkedInId data found.');
    }
    var userProfileQuery = new Parse.Query(UserProfile);
    userProfileQuery.equalTo('linkedInId', linkedInId);
    userProfileQuery.ascending('createdAt');
    return userProfileQuery.first({ useMasterKey: true });
  }).then(function(userDataResponse) {
    var userData = userDataResponse;
    response.success(userData);
  }, function(error) {
    response.error(error);
  });
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
