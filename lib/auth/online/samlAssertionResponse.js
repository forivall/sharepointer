/*
 Plucks a SAML assertion off a response body from the federated auth service
 */

var head = require('lodash/head'),
constants = require('../../constants');
module.exports = function(client, httpOpts, xmlResponse, waterfallCb){
  var assertion = xmlResponse.match(/<saml:Assertion(.|\n)+<\/saml:Assertion>/);
  if (!assertion || !assertion.length){
    return waterfallCb('No assertion found in response');
  }

  assertion = head(assertion);
  return waterfallCb(null, client, httpOpts, constants.STS_LOGIN_URL, client.url, assertion);
};
