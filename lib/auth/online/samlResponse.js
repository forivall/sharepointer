/*
  Parses a SAML response, plucking off the binary security token
  This then gets passed to yet another SharePoint login function
 */

var dotGet = require('lodash/get'),
xmlJs = require('xml2js'),
parser =  new xmlJs.Parser({"explicitArray":false}).parseString;

module.exports = function(client, httpOpts, samlResponseBody, waterfallCb){
  if (httpOpts.returnAssertion){
    return cb(null, samlResponseBody);
  }

  parser(samlResponseBody, function (err,ok){
    if (err) {
      waterfallCb(err);
      return;
    }
    var samlError = dotGet(ok, "S:Envelope.S:Body.S:Fault"),
      token = dotGet(ok, "S:Envelope.S:Body.wst:RequestSecurityTokenResponse.wst:RequestedSecurityToken.wsse:BinarySecurityToken._");
    if (samlError){
      console.error('Saml error detected on login');
      console.error(samlError);
      return waterfallCb(new Error('Error logging in - SAML fault detected'));
    }
    if (!token){
      console.error('No token in response body:');
      console.error(ok);
      return waterfallCb(new Error('No token found in response body'));
    }
    return waterfallCb(null, client, httpOpts, token);
  });


};
