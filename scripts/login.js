function login(email, password, callback) {
  // This script should authenticate a user against the credentials stored in
  // your database.
  // It is executed when a user attempts to log in or immediately after signing
  // up (as a verification that the user was successfully signed up).
  //
  // Everything returned by this script will be set as part of the user profile
  // and will be visible by any of the tenant admins. Avoid adding attributes
  // with values such as passwords, keys, secrets, etc.
  //
  // The `password` parameter of this function is in plain text. It must be
  // hashed/salted to match whatever is stored in your database. For example:
  //
  //     var bcrypt = require('bcrypt@0.8.5');
  //     bcrypt.compare(password, dbPasswordHash, function(err, res)) { ... }
  //
  // There are three ways this script can finish:
  // 1. The user's credentials are valid. The returned user profile should be in
  // the following format: https://auth0.com/docs/users/normalized/auth0/normalized-user-profile-schema
  //     var profile = {
  //       user_id: ..., // user_id is mandatory
  //       email: ...,
  //       [...]
  //     };
  //     callback(null, profile);
  // 2. The user's credentials are invalid
  //     callback(new WrongUsernameOrPasswordError(email, "my error message"));
  // 3. Something went wrong while trying to reach your database
  //     callback(new Error("my error message"));
  //
  // A list of Node.js modules which can be referenced is available here:
  //
  //    https://tehsis.github.io/webtaskio-canirequire/

  var fetch = require('node-fetch@2.6.0');
  var qs = require('querystring');
  var jws = require('jws@3.2.2');
  
  const url = configuration.OKTA_CLIENT_ORGURL + 'oauth2/v1/token';
  
  const body = { grant_type: 'password',
                client_id: configuration.OKTA_CLIENT_CLIENTID,
                client_secret: configuration.OKTA_CLIENT_SECRET,
                username: email,
                password: password,
                scope: 'openid profile'
  };
  
  fetch(url, {
    method: 'POST',
    headers: {
    	'Content-Type': 'application/x-www-form-urlencoded',
    	'Accept': 'application/json'
    },
    body: qs.stringify(body),
  })
  .then(function(response) {
    if (response.status !== 200) {
      return response.json()
      	.then(function(json) {
        	return Promise.reject(new Error(json.error_description));
      	});
    }
    
    return response.json();
  })
  .then(function(json) {
    var dt = jws.decode(json.id_token, { json: true });
    if (!dt) {
    	return Promise.reject(new Error('Failed to decode ID token'));
    }
    
    var claims = dt.payload;
    var user = { id: claims.sub };
    user.name = claims.name;
    user.email = claims.preferred_username;
    return callback(null, user);
  })
  .catch(function(error) {
  	return callback(error);
  });
  
  
  //const msg = 'Please implement the Login script for this database connection ' +
  // 'at https://manage.auth0.com/#/connections/database';
  //return callback(new Error(msg));
}
