var fs = require('fs');
var parseJsonCV = require('../parseJsonCV.js');
var _ = require('underscore');
var PDFParser = require("pdf2json/pdfparser.js");

var case1InputCVPath = 'spec/testfiles/AC.pdf';
var case1ParsedOutputCVPath = 'spec/testfiles/AC.json';
var case1FormattedOutputCVPath = 'spec/testfiles/ACFormatted.json';
var case1ParsedOutputCV = JSON.parse(fs.readFileSync(case1ParsedOutputCVPath));
var case1FormattedOutputCV =  JSON.parse(fs.readFileSync(case1FormattedOutputCVPath));

var case2InputCVPath = 'spec/testfiles/LP.pdf';
var case2ParsedOutputCVPath = 'spec/testfiles/LP.json';
var case2FormattedOutputCVPath = 'spec/testfiles/LPFormatted.json';
var case2ParsedOutputCV = JSON.parse(fs.readFileSync(case2ParsedOutputCVPath));
var case2FormattedOutputCV =  JSON.parse(fs.readFileSync(case2FormattedOutputCVPath));

describe('Case 1 CV', function() {
  var parsedCV = null;
  var formattedCV = null;
  beforeEach(function (done) {
    var pdfParser = new PDFParser();
    pdfParser.loadPDF(case1InputCVPath);
    pdfParser.on("pdfParser_dataReady", _.bind(_onPFBinDataReady, this));
    pdfParser.on("pdfParser_dataError", _.bind(_onPFBinDataError, this));
    function _onPFBinDataReady (data) {
      parsedCV = parseJsonCV.parseCV(data.data);
      formattedCV = parseJsonCV.formatJsonCV(parsedCV);
      done();
    }
    function _onPFBinDataError (data) {
      console.log("err", data);
    }
  });
  it("should parse properly", function(done) {
    expect(parsedCV).toEqual(case1ParsedOutputCV);
    expect(formattedCV).toEqual(case1FormattedOutputCV);
    done();
  });
});

describe('Case 2 CV', function() {
  var parsedCV = null;
  var formattedCV = null;
  beforeEach(function (done) {
    var pdfParser = new PDFParser();
    pdfParser.loadPDF(case2InputCVPath);
    pdfParser.on("pdfParser_dataReady", _.bind(_onPFBinDataReady, this));
    pdfParser.on("pdfParser_dataError", _.bind(_onPFBinDataError, this));
    function _onPFBinDataReady (data) {
      parsedCV = parseJsonCV.parseCV(data.data);
      formattedCV = parseJsonCV.formatJsonCV(parsedCV);
      done();
    }
    function _onPFBinDataError (data) {
      console.log("err", data);
    }
  });
  it("should parse properly", function(done) {
    expect(parsedCV).toEqual(case2ParsedOutputCV);
    expect(formattedCV).toEqual(case2FormattedOutputCV);
    done();
  });
});
