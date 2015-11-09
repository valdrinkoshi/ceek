var querystring = require('querystring');
var http = require('http');
var _ = require('underscore');
var url = require('url');

var spotlightHost = 'spotlight.dbpedia.org';
var spotlightBasePath = '/rest';
var spotlightBaseUrl = 'http://' + spotlightHost + '/rest';
var spotlightAnnotatationUrl = spotlightBaseUrl + '/annotate';
var spotlightAnnotatationPath = '/annotate';

var DEFAULT_CONFIDENCE = 0.2;
var DEFAULT_SUPPORT = 20;

var CEEK_TYPES = {
  "programming_language" : ["DBpedia:ProgrammingLanguage", "Freebase:/computer/programming_language"],
  "computer": ["Freebase:/computer"],
  "profession": ["Freebase:/people/profession"]
}

/* filter results */
function filter (results) {
  var filteredResults = {
    resources: [],
    simpleTags: [],
    otherResources: []
  };
  if (Array.isArray(results.Resources)) {
    var resources = results.Resources;
    resources = _.uniq(resources, false, function (resource) {
      return resource['@URI'];
    });
    for (var i = 0; i < resources.length; i++) {
      var currentResource = resources[i];
      var types = currentResource['@types'].split(',');
      var ceekTypes = [];

      for (var ceekType in CEEK_TYPES) {
        var currentCeekType = CEEK_TYPES[ceekType];
        for (var j = 0; j < types.length; j++) {
          var type = types[j];
          if (_.contains(currentCeekType, type)) {
            ceekTypes.push(ceekType);
            break;
          }
        }
      }

      //take the last part of the path, remove any appended _(text). E.g.: 'IOS_%28Apple%29' becomes 'IOS'
      var simpleName = _.last(url.parse(currentResource['@URI']).pathname.split('/')).replace(/_\%28[\S\s]+\%29/i, '').toLowerCase();
      var surfaceForm = currentResource['@surfaceForm'].toLowerCase().replace(' ', '_');
      var filteredResult = {
        "uri": currentResource['@URI'],
        "simpleName": simpleName,
        "surfaceForm": surfaceForm,
        "types": types,
        "ceekTypes": ceekTypes
      };

      if (ceekTypes.length > 0) {
        filteredResults.resources.push(filteredResult);
        filteredResults.simpleTags.push(filteredResult.simpleName);
        //if the surfaceForm and simpleName differ, it's a good idea to have it added to the list of simple tags, the surfaceForm is probably an alternative way to say the same thing
        if (surfaceForm !== simpleName) {
          filteredResults.simpleTags.push(surfaceForm);
        }
      } else {
        filteredResults.otherResources.push(filteredResult);
      }
    }
  }
  return filteredResults;
};


/* annotate text */
function annotate (text, confidence, support) {
  return performRequest(spotlightAnnotatationPath, text, confidence, support);
};

function performRequest (path, text, confidence, support) {
  var queryString = querystring.stringify({
    text: text,
    confidence: confidence || DEFAULT_CONFIDENCE,
    support: support || DEFAULT_SUPPORT
  });

  var promise = new Parse.Promise();
  var requestData = {
    hostname: spotlightHost,
    path: spotlightBasePath + path + '?' + queryString,
    headers: {
      'Accept': 'application/json'
    }
  };

  var data = {
    method: 'GET',
    url: spotlightAnnotatationUrl+'?'+queryString,
    headers: {
      'Accept': 'application/json'
    }
  };

  var request = http.request(requestData, function (response) {
    response.setEncoding('utf8');
    var data = '';
    response.on('error', function (error) {
      promise.reject(error);
    });
    response.on('data', function (chunk) {
      data += chunk;
    });
    response.on('end', function() {
      try {
        promise.resolve(JSON.parse(data));
      } catch (e) {
        promise.reject(e);
      }
    });
  });

  request.on('error', function(e) {
    promise.reject(e);
  });

  request.end();
  return promise;
};

module.exports = {
  annotate: annotate,
  filter: filter
};