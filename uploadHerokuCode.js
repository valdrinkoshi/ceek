var https = require('https');
var fs = require('fs');
var url = require('url')

var sourcesFileName = process.argv[2] || '';
var authToken = process.argv[3] || '';
if (!sourcesFileName || !authToken) {
  console.error('>Usage:', process.argv[0], process.argv[1], '<sourcesFileName>', '<authToken>');
  console.error('>You can use heroku auth:token to generate a new auth token.');
  console.error('>Generate the source file using: tar czfv source.tgz ./<sourcedir>');
  return;
}

var herokuAPIBaseUrl = 'https://api.heroku.com/apps';
var herokuAPIAppBaseUrl = herokuAPIBaseUrl + '/apps';
var herokuAppName = 'boiling-stream-7630';
var herokuAPIAppBaseUrl = herokuAPIBaseUrl + '/' + herokuAppName;
var authToken = 'dcd6e4a5-e084-482a-ad65-e799aa25f630';
var authHeader = 'Bearer ' + authToken;

var sourcesFileName = 'source.tgz';

function getSourcesUrls () {
  var options = url.parse(herokuAPIAppBaseUrl+'/sources');
  options.method = 'POST';
  options.headers = {
    'Accept': 'application/vnd.heroku+json; version=3',
    'Authorization': authHeader
  };
  console.log('>Requesting /sources');
  var postReq = https.request(options, function(res) {
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function () {
      if (data) {
        var body = JSON.parse(data);
        if (body && body.source_blob && body.source_blob.put_url) {
          console.log('>/sources received');
          console.log('>/sources put_url:', body.source_blob.put_url);
          console.log('>/sources get_url:', body.source_blob.get_url);
          putSource3(body.source_blob.put_url, body.source_blob.get_url);
        }
      }
    });
    res.on('err', function (err) {
      console.log('error', err);
    });
  });
  postReq.end();
};

getSourcesUrls();

function getFilesizeInBytes(filename) {
 var stats = fs.statSync(filename)
 var fileSizeInBytes = stats["size"]
 return fileSizeInBytes
}

function putSource3 (putUrl, getUrl) {
  console.log('>Uploading sources to:', putUrl);
  var options = url.parse(putUrl);
  options.method = 'PUT';
  var putReq = https.request(options, function(res) {
      res.on('data', function (chunk) {
          console.log('data');
      });
      res.on('end', function () {
          console.log('>Upload complete');
          postBuilds(getUrl)
      });
      res.on('err', function (err) {
          console.log('error', err);
      });
  });
  putReq.setHeader('Content-Length', getFilesizeInBytes(sourcesFileName));
  putReq.removeHeader('Transfer-Encoding');
  putReq.removeHeader('Connection');
  fs.createReadStream(sourcesFileName).pipe(putReq);
}

function postBuilds (getUrl) {
  console.log('>Requesting /builds');
  var data = JSON.stringify({'source_blob': {'url': getUrl, 'version': Date.now().toString()}});
  console.log('>/builds with data:', data);
  var options = url.parse(herokuAPIAppBaseUrl+'/builds');
  options.method = 'POST';
  options.headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.heroku+json; version=3',
    'Authorization': authHeader,
    'Content-Length':data.length
  };
  var postReq = https.request(options, function(res) {
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function () {
      if (data) {
        console.log('>/builds received');
        console.log('>/builds data:', data);
      }
    });
    res.on('err', function (err) {
      console.log('error', err);
    });
  });
  postReq.end(data);
}