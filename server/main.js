require('cloud/app.js');
require('cloud/jobs.js');
require('cloud/matchesjob.js');
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});
