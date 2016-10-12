
module.exports.ResponseError = ResponseError;
function ResponseError(statusCode, body) {
  this.name = 'ResponseError';
  this.message = statusCode + ' - ' + (JSON && JSON.stringify ? JSON.stringify(body) : body);
  this.body = body;
  this.statusCode = statusCode;

  if (Error.captureStackTrace) { // required for non-V8 environments
    Error.captureStackTrace(this);
  }
}
ResponseError.prototype = Object.create(Error.prototype);
ResponseError.prototype.constructor = ResponseError;
