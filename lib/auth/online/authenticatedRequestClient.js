/*
 Performs Cookie-signed requests to the backend.
 Think of this as a HTTP client for the rest of the library.
 httpOpts get passed from the object model for lists, list items etc, and feed into request.
 */

var defaultsDeep = require('lodash/defaultsDeep'),
request = require('request'),
constants = require('../../constants.js');

module.exports = function(client, httpOpts, waterfallCb){
  //Remove the body from SP_ONLINE_SECURITY_OPTIONS before we defaultsDeep so we can update items.
  //Strings and JSON don't mix when doing deepExtends
  if(constants.SP_ONLINE_SECURITY_OPTIONS.hasOwnProperty('body')) {
    delete constants.SP_ONLINE_SECURITY_OPTIONS.body;
  }
  var requestOpts = defaultsDeep({
    headers: {
      'Cookie': 'FedAuth=' + client.FedAuth + '; rtFa=' + client.rtFa,
      'Accept' : 'application/json; odata=verbose',
      'Content-Type' : 'application/json; odata=verbose'
    },
    json : httpOpts.json || true,
    timeout: constants.SP_ONLINE_TIMEOUT
  }, constants.SP_ONLINE_SECURITY_OPTIONS, httpOpts, client.baseHTTPOptions);
  return request(requestOpts, waterfallCb);
};
