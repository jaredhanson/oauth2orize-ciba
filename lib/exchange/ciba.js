var merge = require('utils-merge');
var TokenError = require('../errors/tokenerror');


module.exports = function(options, issue) {
  if (typeof options == 'function') {
    issue = options;
    options = undefined;
  }
  options = options || {};
  
  if (!issue) { throw new TypeError('oauth2orize.tokenExchange exchange requires an issue callback'); }
  
  var userProperty = options.userProperty || 'user';
  
  // For maximum flexibility, multiple scope spearators can optionally be
  // allowed.  This allows the server to accept clients that separate scope
  // with either space or comma (' ', ',').  This violates the specification,
  // but achieves compatibility with existing client libraries that are already
  // deployed.
  var separators = options.scopeSeparator || ' ';
  if (!Array.isArray(separators)) {
    separators = [ separators ];
  }
  
  
  // https://tools.ietf.org/html/draft-ietf-oauth-token-exchange-05
  
  return function(req, res, next) {
    console.log('CIBA EXCHANGE');
    console.log(req.body)
    
    if (!req.body) { return next(new Error('OAuth2orize requires body parsing. Did you forget to use body-parser middleware?')); }
    
    // The 'user' property of `req` holds the authenticated user.  In the case
    // of the token endpoint, the property will contain the OAuth 2.0 client.
    var client = req[userProperty]
      , authReqID = req.body.auth_req_id;
    
    if (!authReqID) { return next(new TokenError('Missing required parameter: auth_req_id', 'invalid_request')); }
    
    function issued(err, accessToken, refreshToken, params) {
      console.log('ISSUED!');
      console.log(err);
      console.log(accessToken);
      
      if (err) { return next(err); }
      if (!accessToken) { return next(new TokenError('Invalid authorization request ID', 'invalid_grant')); }
      if (refreshToken && typeof refreshToken == 'object') {
        params = refreshToken;
        refreshToken = null;
      }

      var tok = {};
      tok.access_token = accessToken;
      if (refreshToken) { tok.refresh_token = refreshToken; }
      if (params) { merge(tok, params); }
      tok.token_type = tok.token_type || 'Bearer';

      var json = JSON.stringify(tok);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Pragma', 'no-cache');
      res.end(json);
    }
    
    try {
      var arity = issue.length;
      if (arity == 5) {
        issue(client, authReqID, req.body, req.authInfo, issued);
      } else if (arity == 4) {
        issue(client, authReqID, req.body, issued);
      } else { // arity == 3
        issue(client, authReqID, issued);
      }
    } catch (ex) {
      return next(ex);
    }
  }
}
