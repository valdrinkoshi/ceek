// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var ejs = require('ejs');
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

var candidateMatchTemplate = '<!doctype html> <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"> <head> <!-- NAME: 1 COLUMN --> <!--[if gte mso 15]> <xml> <o:OfficeDocumentSettings> <o:AllowPNG/> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml> <![endif]--> <meta charset="UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1"> <title>*|MC:SUBJECT|*</title> <style type="text/css"> p{ margin:10px 0; padding:0; } table{ border-collapse:collapse; } h1,h2,h3,h4,h5,h6{ display:block; margin:0; padding:0; } img,a img{ border:0; height:auto; outline:none; text-decoration:none; } body,#bodyTable,#bodyCell{ height:100%; margin:0; padding:0; width:100%; } #outlook a{ padding:0; } img{ -ms-interpolation-mode:bicubic; } table{ mso-table-lspace:0pt; mso-table-rspace:0pt; } .ReadMsgBody{ width:100%; } .ExternalClass{ width:100%; } p,a,li,td,blockquote{ mso-line-height-rule:exactly; } a[href^=tel],a[href^=sms]{ color:inherit; cursor:default; text-decoration:none; } p,a,li,td,body,table,blockquote{ -ms-text-size-adjust:100%; -webkit-text-size-adjust:100%; } .ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{ line-height:100%; } a[x-apple-data-detectors]{ color:inherit !important; text-decoration:none !important; font-size:inherit !important; font-family:inherit !important; font-weight:inherit !important; line-height:inherit !important; } #bodyCell{ padding:10px; } .templateContainer{ max-width:600px !important; } a.mcnButton{ display:block; } .mcnImage{ vertical-align:bottom; } .mcnTextContent{ word-break:break-word; } .mcnTextContent img{ height:auto !important; } .mcnDividerBlock{ table-layout:fixed !important; } /* @tab Page @section Background Style @tip Set the background color and top border for your email. You may want to choose colors that match your company s branding. */ body,#bodyTable{ /*@editable*/background-color:#fafafa; } /* @tab Page @section Background Style @tip Set the background color and top border for your email. You may want to choose colors that match your company s branding. */ #bodyCell{ /*@editable*/border-top:0; } /* @tab Page @section Email Border @tip Set the border for your email. */ .templateContainer{ /*@editable*/border:0; } /* @tab Page @section Heading 1 @tip Set the styling for all first-level headings in your emails. These should be the largest of your headings. @style heading 1 */ h1{ /*@editable*/color:#202020; /*@editable*/font-family:Helvetica; /*@editable*/font-size:26px; /*@editable*/font-style:normal; /*@editable*/font-weight:bold; /*@editable*/line-height:125%; /*@editable*/letter-spacing:normal; /*@editable*/text-align:left; } /* @tab Page @section Heading 2 @tip Set the styling for all second-level headings in your emails. @style heading 2 */ h2{ /*@editable*/color:#202020; /*@editable*/font-family:Helvetica; /*@editable*/font-size:22px; /*@editable*/font-style:normal; /*@editable*/font-weight:bold; /*@editable*/line-height:125%; /*@editable*/letter-spacing:normal; /*@editable*/text-align:left; } /* @tab Page @section Heading 3 @tip Set the styling for all third-level headings in your emails. @style heading 3 */ h3{ /*@editable*/color:#202020; /*@editable*/font-family:Helvetica; /*@editable*/font-size:20px; /*@editable*/font-style:normal; /*@editable*/font-weight:bold; /*@editable*/line-height:125%; /*@editable*/letter-spacing:normal; /*@editable*/text-align:left; } /* @tab Page @section Heading 4 @tip Set the styling for all fourth-level headings in your emails. These should be the smallest of your headings. @style heading 4 */ h4{ /*@editable*/color:#202020; /*@editable*/font-family:Helvetica; /*@editable*/font-size:18px; /*@editable*/font-style:normal; /*@editable*/font-weight:bold; /*@editable*/line-height:125%; /*@editable*/letter-spacing:normal; /*@editable*/text-align:left; } /* @tab Preheader @section Preheader Style @tip Set the background color and borders for your email s preheader area. */ #templatePreheader{ /*@editable*/background-color:#FAFAFA; /*@editable*/border-top:0; /*@editable*/border-bottom:0; /*@editable*/padding-top:9px; /*@editable*/padding-bottom:9px; } /* @tab Preheader @section Preheader Text @tip Set the styling for your email s preheader text. Choose a size and color that is easy to read. */ #templatePreheader .mcnTextContent,#templatePreheader .mcnTextContent p{ /*@editable*/color:#656565; /*@editable*/font-family:Helvetica; /*@editable*/font-size:12px; /*@editable*/line-height:150%; /*@editable*/text-align:left; } /* @tab Preheader @section Preheader Link @tip Set the styling for your email s preheader links. Choose a color that helps them stand out from your text. */ #templatePreheader .mcnTextContent a,#templatePreheader .mcnTextContent p a{ /*@editable*/color:#656565; /*@editable*/font-weight:normal; /*@editable*/text-decoration:underline; } /* @tab Header @section Header Style @tip Set the background color and borders for your email s header area. */ #templateHeader{ /*@editable*/background-color:#fc7070; /*@editable*/border-top:0; /*@editable*/border-bottom:0; /*@editable*/padding-top:9px; /*@editable*/padding-bottom:0; } /* @tab Header @section Header Text @tip Set the styling for your email s header text. Choose a size and color that is easy to read. */ #templateHeader .mcnTextContent,#templateHeader .mcnTextContent p{ /*@editable*/color:#202020; /*@editable*/font-family:Helvetica; /*@editable*/font-size:16px; /*@editable*/line-height:150%; /*@editable*/text-align:left; } /* @tab Header @section Header Link @tip Set the styling for your email s header links. Choose a color that helps them stand out from your text. */ #templateHeader .mcnTextContent a,#templateHeader .mcnTextContent p a{ /*@editable*/color:#2BAADF; /*@editable*/font-weight:normal; /*@editable*/text-decoration:underline; } /* @tab Body @section Body Style @tip Set the background color and borders for your email s body area. */ #templateBody{ /*@editable*/background-color:#FFFFFF; /*@editable*/border-top:0; /*@editable*/border-bottom:2px solid #EAEAEA; /*@editable*/padding-top:0; /*@editable*/padding-bottom:9px; } /* @tab Body @section Body Text @tip Set the styling for your email s body text. Choose a size and color that is easy to read. */ #templateBody .mcnTextContent,#templateBody .mcnTextContent p{ /*@editable*/color:#202020; /*@editable*/font-family:Helvetica; /*@editable*/font-size:16px; /*@editable*/line-height:150%; /*@editable*/text-align:left; } /* @tab Body @section Body Link @tip Set the styling for your email s body links. Choose a color that helps them stand out from your text. */ #templateBody .mcnTextContent a,#templateBody .mcnTextContent p a{ /*@editable*/color:#2BAADF; /*@editable*/font-weight:normal; /*@editable*/text-decoration:underline; } /* @tab Footer @section Footer Style @tip Set the background color and borders for your email s footer area. */ #templateFooter{ /*@editable*/background-color:#FAFAFA; /*@editable*/border-top:0; /*@editable*/border-bottom:0; /*@editable*/padding-top:9px; /*@editable*/padding-bottom:9px; } /* @tab Footer @section Footer Text @tip Set the styling for your email s footer text. Choose a size and color that is easy to read. */ #templateFooter .mcnTextContent,#templateFooter .mcnTextContent p{ /*@editable*/color:#656565; /*@editable*/font-family:Helvetica; /*@editable*/font-size:12px; /*@editable*/line-height:150%; /*@editable*/text-align:center; } /* @tab Footer @section Footer Link @tip Set the styling for your email s footer links. Choose a color that helps them stand out from your text. */ #templateFooter .mcnTextContent a,#templateFooter .mcnTextContent p a{ /*@editable*/color:#656565; /*@editable*/font-weight:normal; /*@editable*/text-decoration:underline; } @media only screen and (min-width:768px){ .templateContainer{ width:600px !important; } } @media only screen and (max-width: 480px){ body,table,td,p,a,li,blockquote{ -webkit-text-size-adjust:none !important; } } @media only screen and (max-width: 480px){ body{ width:100% !important; min-width:100% !important; } } @media only screen and (max-width: 480px){ #bodyCell{ padding-top:10px !important; } } @media only screen and (max-width: 480px){ .mcnImage{ width:100% !important; } } @media only screen and (max-width: 480px){ .mcnCaptionTopContent,.mcnCaptionBottomContent,.mcnTextContentContainer,.mcnBoxedTextContentContainer,.mcnImageGroupContentContainer,.mcnCaptionLeftTextContentContainer,.mcnCaptionRightTextContentContainer,.mcnCaptionLeftImageContentContainer,.mcnCaptionRightImageContentContainer,.mcnImageCardLeftTextContentContainer,.mcnImageCardRightTextContentContainer{ max-width:100% !important; width:100% !important; } } @media only screen and (max-width: 480px){ .mcnBoxedTextContentContainer{ min-width:100% !important; } } @media only screen and (max-width: 480px){ .mcnImageGroupContent{ padding:9px !important; } } @media only screen and (max-width: 480px){ .mcnCaptionLeftContentOuter .mcnTextContent,.mcnCaptionRightContentOuter .mcnTextContent{ padding-top:9px !important; } } @media only screen and (max-width: 480px){ .mcnImageCardTopImageContent,.mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent{ padding-top:18px !important; } } @media only screen and (max-width: 480px){ .mcnImageCardBottomImageContent{ padding-bottom:9px !important; } } @media only screen and (max-width: 480px){ .mcnImageGroupBlockInner{ padding-top:0 !important; padding-bottom:0 !important; } } @media only screen and (max-width: 480px){ .mcnImageGroupBlockOuter{ padding-top:9px !important; padding-bottom:9px !important; } } @media only screen and (max-width: 480px){ .mcnTextContent,.mcnBoxedTextContentColumn{ padding-right:18px !important; padding-left:18px !important; } } @media only screen and (max-width: 480px){ .mcnImageCardLeftImageContent,.mcnImageCardRightImageContent{ padding-right:18px !important; padding-bottom:0 !important; padding-left:18px !important; } } @media only screen and (max-width: 480px){ .mcpreview-image-uploader{ display:none !important; width:100% !important; } } @media only screen and (max-width: 480px){ /* @tab Mobile Styles @section Heading 1 @tip Make the first-level headings larger in size for better readability on small screens. */ h1{ /*@editable*/font-size:22px !important; /*@editable*/line-height:125% !important; } } @media only screen and (max-width: 480px){ /* @tab Mobile Styles @section Heading 2 @tip Make the second-level headings larger in size for better readability on small screens. */ h2{ /*@editable*/font-size:20px !important; /*@editable*/line-height:125% !important; } } @media only screen and (max-width: 480px){ /* @tab Mobile Styles @section Heading 3 @tip Make the third-level headings larger in size for better readability on small screens. */ h3{ /*@editable*/font-size:18px !important; /*@editable*/line-height:125% !important; } } @media only screen and (max-width: 480px){ /* @tab Mobile Styles @section Heading 4 @tip Make the fourth-level headings larger in size for better readability on small screens. */ h4{ /*@editable*/font-size:16px !important; /*@editable*/line-height:150% !important; } } @media only screen and (max-width: 480px){ /* @tab Mobile Styles @section Boxed Text @tip Make the boxed text larger in size for better readability on small screens. We recommend a font size of at least 16px. */ .mcnBoxedTextContentContainer .mcnTextContent,.mcnBoxedTextContentContainer .mcnTextContent p{ /*@editable*/font-size:14px !important; /*@editable*/line-height:150% !important; } } @media only screen and (max-width: 480px){ /* @tab Mobile Styles @section Preheader Visibility @tip Set the visibility of the email s preheader on small screens. You can hide it to save space. */ #templatePreheader{ /*@editable*/display:block !important; } } @media only screen and (max-width: 480px){ /* @tab Mobile Styles @section Preheader Text @tip Make the preheader text larger in size for better readability on small screens. */ #templatePreheader .mcnTextContent,#templatePreheader .mcnTextContent p{ /*@editable*/font-size:14px !important; /*@editable*/line-height:150% !important; } } @media only screen and (max-width: 480px){ /* @tab Mobile Styles @section Header Text @tip Make the header text larger in size for better readability on small screens. */ #templateHeader .mcnTextContent,#templateHeader .mcnTextContent p{ /*@editable*/font-size:16px !important; /*@editable*/line-height:150% !important; } } @media only screen and (max-width: 480px){ /* @tab Mobile Styles @section Body Text @tip Make the body text larger in size for better readability on small screens. We recommend a font size of at least 16px. */ #templateBody .mcnTextContent,#templateBody .mcnTextContent p{ /*@editable*/font-size:16px !important; /*@editable*/line-height:150% !important; } } @media only screen and (max-width: 480px){ /* @tab Mobile Styles @section Footer Text @tip Make the footer content text larger in size for better readability on small screens. */ #templateFooter .mcnTextContent,#templateFooter .mcnTextContent p{ /*@editable*/font-size:14px !important; /*@editable*/line-height:150% !important; } }</style></head> <body> <center> <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable"> <tr> <td align="center" valign="top" id="bodyCell"> <!-- BEGIN TEMPLATE // --> <!--[if gte mso 9]> <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;"> <tr> <td align="center" valign="top" width="600" style="width:600px;"> <![endif]--> <table border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer"> <tr> <td valign="top" id="templatePreheader"></td> </tr> <tr> <td valign="top" id="templateHeader"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;"> <tbody class="mcnTextBlockOuter"> <tr> <td valign="top" class="mcnTextBlockInner"> <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;" class="mcnTextContentContainer"> <tbody><tr> <td valign="top" class="mcnTextContent" style="padding: 9px 18px;color: #FFFFFF;font-family: Arial,  Helvetica Neue , Helvetica, sans-serif;font-size: 18px;font-weight: bold;text-align: center;">   </td> </tr> </tbody></table> </td> </tr> </tbody> </table></td> </tr> <tr> <td valign="top" id="templateBody"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;"> <tbody class="mcnTextBlockOuter"> <tr> <td valign="top" class="mcnTextBlockInner"> <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;" class="mcnTextContentContainer"> <tbody><tr> <td valign="top" class="mcnTextContent" style="padding-top:9px; padding-right: 18px; padding-bottom: 9px; padding-left: 18px;"> <h1><strong><span style="font-size:12px">Hi <%=candidateName%>,</span></strong></h1> <p><span style="font-size:12px"> Great news! <%=companyName%> has sent you an interview request. If you are interested in this opportunity, please accept the interview request immediately.<br> <%=companyName%> will contact you directly to set up the onsite interview. If you do not hear back from them within 2 weeks, please contact us at support@ceek.cc.<br> A Tip for getting hired successfully: Once you’re engaged with the hiring company, you need to move quickly. The longer you wait, the more candidates you’re going to be competing against.<br> <br> <strong>Best,<br> <br> Ceek Team</strong><br> <strong>Contact us:&nbsp;</strong>support@ceek.cc</span></p> </td> </tr> </tbody></table> </td> </tr> </tbody> </table></td> </tr> <tr> <td valign="top" id="templateFooter"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowBlock" style="min-width:100%;"> <tbody class="mcnFollowBlockOuter"> <tr> <td align="center" valign="top" style="padding:9px" class="mcnFollowBlockInner"> <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentContainer" style="min-width:100%;"> <tbody><tr> <td align="center" style="padding-left:9px;padding-right:9px;"> <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;" class="mcnFollowContent"> <tbody><tr> <td align="center" valign="top" style="padding-top:9px; padding-right:9px; padding-left:9px;"> <table align="center" border="0" cellpadding="0" cellspacing="0"> <tbody><tr> <td align="center" valign="top"> <!--[if mso]> <table align="center" border="0" cellspacing="0" cellpadding="0"> <tr> <![endif]--> <!--[if mso]> <td align="center" valign="top"> <![endif]--> <table align="left" border="0" cellpadding="0" cellspacing="0" style="display:inline;"> <tbody><tr> <td valign="top" style="padding-right:10px; padding-bottom:9px;" class="mcnFollowContentItemContainer"> <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem"> <tbody><tr> <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;"> <table align="left" border="0" cellpadding="0" cellspacing="0" width=""> <tbody><tr> <td align="center" valign="middle" width="24" class="mcnFollowIconContent"> <a href="https://www.linkedin.com/company/goceek" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/outline-dark-linkedin-48.png" style="display:block;" height="24" width="24" class=""></a> </td> </tr> </tbody></table> </td> </tr> </tbody></table> </td> </tr> </tbody></table> <!--[if mso]> </td> <![endif]--> <!--[if mso]> <td align="center" valign="top"> <![endif]--> <table align="left" border="0" cellpadding="0" cellspacing="0" style="display:inline;"> <tbody><tr> <td valign="top" style="padding-right:10px; padding-bottom:9px;" class="mcnFollowContentItemContainer"> <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem"> <tbody><tr> <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;"> <table align="left" border="0" cellpadding="0" cellspacing="0" width=""> <tbody><tr> <td align="center" valign="middle" width="24" class="mcnFollowIconContent"> <a href="https://twitter.com/goceek" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/outline-dark-twitter-48.png" style="display:block;" height="24" width="24" class=""></a> </td> </tr> </tbody></table> </td> </tr> </tbody></table> </td> </tr> </tbody></table> <!--[if mso]> </td> <![endif]--> <!--[if mso]> <td align="center" valign="top"> <![endif]--> <table align="left" border="0" cellpadding="0" cellspacing="0" style="display:inline;"> <tbody><tr> <td valign="top" style="padding-right:0; padding-bottom:9px;" class="mcnFollowContentItemContainer"> <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem"> <tbody><tr> <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;"> <table align="left" border="0" cellpadding="0" cellspacing="0" width=""> <tbody><tr> <td align="center" valign="middle" width="24" class="mcnFollowIconContent"> <a href="https://www.facebook.com/goceek" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/outline-dark-facebook-48.png" style="display:block;" height="24" width="24" class=""></a> </td> </tr> </tbody></table> </td> </tr> </tbody></table> </td> </tr> </tbody></table> <!--[if mso]> </td> <![endif]--> <!--[if mso]> </tr> </table> <![endif]--> </td> </tr> </tbody></table> </td> </tr> </tbody></table> </td> </tr> </tbody></table> </td> </tr> </tbody> </table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnDividerBlock" style="min-width:100%;"> <tbody class="mcnDividerBlockOuter"> <tr> <td class="mcnDividerBlockInner" style="min-width: 100%; padding: 10px 18px 25px;"> <table class="mcnDividerContent" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;border-top-width: 2px;border-top-style: solid;border-top-color: #EEEEEE;"> <tbody><tr> <td> <span></span> </td> </tr> </tbody></table> <!-- <td class="mcnDividerBlockInner" style="padding: 18px;"> <hr class="mcnDividerContent" style="border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;" /> --> </td> </tr> </tbody> </table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;"> <tbody class="mcnTextBlockOuter"> <tr> <td valign="top" class="mcnTextBlockInner"> <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;" class="mcnTextContentContainer"> <tbody><tr> <td valign="top" class="mcnTextContent" style="padding-top:9px; padding-right: 18px; padding-bottom: 9px; padding-left: 18px;"> <span style="font-size:12px"><em>Copyright © 2016 CEEK. All rights reserved.</em></span><br> <br> <br> <br> <br> &nbsp; </td> </tr> </tbody></table> </td> </tr> </tbody> </table></td> </tr> </table> <!--[if gte mso 9]> </td> </tr> </table> <![endif]--> <!-- // END TEMPLATE --> </td> </tr> </table> </center> </body> </html>';
var candidateMatchTemplateText = 'Hi <%=candidateName%>,\n \n Great news! <%=companyName%> has sent you an interview request. If you are interested in this opportunity, please accept the interview request immediately.\n <%=companyName%> will contact you directly to set up the onsite interview. If you do not hear back from them within 2 weeks, please contact us at support@ceek.cc.\n A Tip for getting hired successfully: Once you’re engaged with the hiring company, you need to move quickly. The longer you wait, the more candidates you’re going to be competing against.\n Best,\n \n Ceek Team\n Ceek.cc';

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
      ], ['job']).then(function(matchPageData) {
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
              if (!isLocal && userProfile.get('emailAddress') && likeResp) {
                var matchEmailData = {candidateName: userProfile.get('firstName'), companyName: matchPageData.get('job').get('companyName')};
                var text = ejs.render(candidateMatchTemplateText, matchEmailData);
                var html = ejs.render(candidateMatchTemplate, matchEmailData);
                emailUtils.sendEmail(userProfile.get('emailAddress'), null, 'Interview Request from ' + matchEmailData.companyName, text, html);
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
