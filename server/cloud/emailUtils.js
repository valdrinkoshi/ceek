var DEFAULT_CEEK_MAIL_ADDRESS = 'do-not-reply@ceek.cc';

var Mailgun = require('mailgun');
Mailgun.initialize('mg.ceek.cc', 'key-51cd852db71e7753d513fb690c7e37e0');

var sendEmail = function (to, from, subject, text, html, successCallback, errorCallback) {
  if (!from) {
    from = DEFAULT_CEEK_MAIL_ADDRESS;
  }
  Mailgun.sendEmail({
    to: to,
    from: from,
    subject: subject,
    text: text,
    html: html
  }, {
    success: successCallback,
    error: errorCallback
  });
};

module.exports = {
  sendEmail: sendEmail
};
