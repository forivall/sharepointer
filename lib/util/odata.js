var values = require('lodash/values');
module.exports = function(body){
  if (!body){
    return [];
  }

  if (!body.d){
    return body;
  }

  if (body.d.results){
    // SP returns { 1 : {}, 2 : {} }.. Yeah, great - that's a frickin' array, Microsoft.
    return values(body.d.results);
  }

  return body.d;
};
