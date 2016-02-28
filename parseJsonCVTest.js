var fs = require('fs');
var parseJsonCV = require('./ceekmule/parseJsonCV.js');
var _ = require('underscore');
var PDFParser = require("pdf2json/pdfparser.js");

  var pdfParser = new PDFParser();
  pdfParser.on("pdfParser_dataReady", _.bind(_onPFBinDataReady, this));
  pdfParser.on("pdfParser_dataError", _.bind(_onPFBinDataError, this));
  function _onPFBinDataReady (data) {
    var parsedCV = parseJsonCV.parseCV(data.data)
    var formattedCV= parseJsonCV.formatJsonCV(parsedCV);
    //console.log(parsedCV);
    console.log(formattedCV);
  }

  function _onPFBinDataError (data) {
    console.log("err", data);
  }

pdfParser.loadPDF('ceekmule/spec/testfiles/LP.pdf');
