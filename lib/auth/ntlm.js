var request = require('request'),
url = require('url'),
defaultsDeep = require('lodash/defaultsDeep'),
ntlm = require('httpntlm').ntlm,
async = require('async'),
agentkeepalive = require('agentkeepalive'),
HttpAgent = agentkeepalive,
HttpsAgent = agentkeepalive.HttpsAgent;

module.exports = function(client, httpOpts, cb) {
  var keepaliveAgent = url.parse(httpOpts.url).protocol === 'http:' ?
    new HttpAgent() : new HttpsAgent();
  return async.waterfall([
    function(waterfallCb) {
      var type1msg = ntlm.createType1Message(client.auth);
      var type1options = defaultsDeep({
        headers: {
          'Connection': 'keep-alive',
          'Authorization': type1msg
        },
        agent: keepaliveAgent,
        method: 'get'
      }, httpOpts, client.baseHTTPOptions);
      return request(type1options, waterfallCb);
    },

    function(res, body, waterfallCb) {
      if (!res.headers['www-authenticate']) {
        return callback(new Error('www-authenticate not found on response of second request'));
      }
      var type2msg = ntlm.parseType2Message(res.headers['www-authenticate']);
      var type3msg = ntlm.createType3Message(type2msg, client.auth);
      var type3opts = defaultsDeep({
        headers: {
          'Connection': 'Close',
          'Authorization': type3msg
        },
        allowRedirects: false,
        agent: keepaliveAgent,
        json: httpOpts.json || true
      }, httpOpts, client.baseHTTPOptions);
      return request(type3opts, waterfallCb);
    }
  ], cb);
};
