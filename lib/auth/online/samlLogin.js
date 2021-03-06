/*
 Performs a SAML login request with a SOAP body passed by samlBody.js
 */
var constants = require('../../constants.js'),
request = require('request'),
defaultsDeep = require('lodash/defaultsDeep');

module.exports = function(client, httpOpts, authUrl, samlRequestBody, waterfallCb){
  var requestOpts = defaultsDeep({
    method: 'post',
    body : samlRequestBody,
    headers : {
      'content-type' : 'application/soap+xml; charset=utf-8',
      'accept' : '*'
    },
    secureOptions: require('constants').SSL_OP_NO_TLSv1_2,
    url : authUrl,
    timeout: constants.SP_ONLINE_TIMEOUT
  }, httpOpts, client.baseHTTPOptions);
  return request(requestOpts, function(error, response, samlResponseBody){
    if (error){
      return waterfallCb(error);
    }
    if (response.statusCode !== 200){
      return waterfallCb(new Error('Unexpected status code from SamlLogin at ' + authUrl + ' : ' + response.statusCode));
    }
    if (!samlResponseBody){
      return waterfallCb(new Error('No response body from SAML request'));
    }

    return waterfallCb(null, client, httpOpts, samlResponseBody);
  });
};
