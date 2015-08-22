var express = require('express');
var app = express();
var _ = require('underscore');
var parseJsonCV = require('./parseJsonCV.js')
var http = require('http');
var PDFParser = require("pdf2json/pdfparser.js");

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index')
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/uploadLICV', function(req, res) {
  var pdfParser = new PDFParser();
  pdfParser.on("pdfParser_dataReady", _.bind(_onPFBinDataReady, this));
  pdfParser.on("pdfParser_dataError", _.bind(_onPFBinDataError, this));
  function _onPFBinDataReady (data) {
    var parsedCV = parseJsonCV.parseCV(data.data);
    var formattedCV = parseJsonCV.formatJsonCV(parsedCV);
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(formattedCV));
  }

  function _onPFBinDataError (data) {
    console.log("err", data);
  }

  var dataBuffer = new Buffer([]);
  var reqLICV = http.request(req.query.file_url, function (res) {
    res.on('data', function (data) {
      dataBuffer = Buffer.concat([dataBuffer, data]);
    });
    res.on('end', function (data) {
      pdfParser.parseBuffer(dataBuffer);
    });
    res.on('error', function (err) {
      console.log(err);
    });
  });
  reqLICV.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  reqLICV.end();
});
