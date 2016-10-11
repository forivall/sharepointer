var request = require('request'),
assign = require('lodash/assign');

module.exports = function(client, httpOpts, cb){
  httpOpts = assign({}, httpOpts, client.baseHTTPOptions, {
    auth : {
      username: client.auth.username,
      password: client.auth.password,
      sendImmediately: true
    },
    json : httpOpts.json || true
  }, httpOpts);
  return request(httpOpts, cb);
};
