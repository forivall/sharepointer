/*
  Flexible middleware to generate SAML bodies from some placeholders in file `saml.xml`
 */

var fs = require('fs'),
clone = require('lodash/clone'),
path = require('path'),
saml = fs.readFileSync(path.join(__dirname, 'saml.xml')).toString(),
auth = fs.readFileSync(path.join(__dirname, 'auth.xml')).toString();

module.exports = function(client, httpOpts, toUrl, url, assertion, waterfallCb){
  var samlBody = clone(saml),
  authBody = clone(auth);

  authBody = authBody.replace('{username}', client.auth.username);
  authBody = authBody.replace('{password}', client.auth.password);
  // If an assertion was passed in, put it in the {auth} placeholder. Otherwise, username and password.
  samlBody = samlBody.replace('{auth}', assertion || authBody);
  samlBody = samlBody.replace('{url}', url);
  samlBody = samlBody.replace('{toUrl}', toUrl);
  return waterfallCb(null, client, httpOpts, toUrl, samlBody);
};
