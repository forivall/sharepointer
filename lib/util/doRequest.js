var ResponseError = require('../errors').ResponseError;
var makeSharepointResponsesLessAwful = require('./odata');
module.exports = function(client){
  var verbosityFilter = require('./verbosityFilter')(client);
  return function doRequest(opts, cb){
    if (typeof opts === 'string'){
      opts = { url : opts, method : 'get' };
    }
    opts.url = client.url + opts.url;
    opts.method = opts.method || 'get';
    if (!client.httpClient){
      return cb('Error finding login information - please call login() again');
    }

    client.httpClient(client, opts, function(err, response, body){
      if (err){
        return cb(err);
      }
      if (response.statusCode.toString()[0] !== '2'){
        return cb(new ResponseError(response.statusCode, body));
      }

      body = makeSharepointResponsesLessAwful(body);
      body = verbosityFilter(body, opts.url);

      //TODO: Apply conveniences Here
      return cb(null, body);
    });
  };
};
