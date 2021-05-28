function getByEmail(email, callback) {
  // This script should retrieve a user profile from your existing database,
  // without authenticating the user.
  // It is used to check if a user exists before executing flows that do not
  // require authentication (signup and password reset).
  //
  // There are three ways this script can finish:
  // 1. A user was successfully found. The profile should be in the following
  // format: https://auth0.com/docs/users/normalized/auth0/normalized-user-profile-schema.
  //     callback(null, profile);
  // 2. A user was not found
  //     callback(null);
  // 3. Something went wrong while trying to reach your database:
  //     callback(new Error("my error message"));

  var fetch = require('node-fetch@2.6.0');
  
  var url = configuration.OKTA_CLIENT_ORGURL + 'api/v1/users/' + encodeURIComponent(email);
  
  fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': 'SSWS ' + configuration.OKTA_CLIENT_TOKEN,
    	'Accept': 'application/json'
    }
  })
  .then(function(response) {
    if (response.status === 404) {
      return Promise.resolve();
    } else if (response.status !== 200) {
      return response.json()
      	.then(function(json) {
        	return Promise.reject(new Error(JSON.stringify(json)));
      	});
    }
    
    return response.json();
  })
  .then(function(json) {
    if (!json) {
      return callback(null);
    }
    
    var profile = { user_id: json.id };
    profile.given_name = json.firstName;
    profile.family_name = json.lastName;
    profile.email = json.email;
    
    return callback(null, profile);
  })
  .catch(function(error) {
  	return callback(error);
  });
  
  //const msg = 'Please implement the Get User script for this database connection ' +
  //  'at https://manage.auth0.com/#/connections/database';
  //return callback(new Error(msg));
}
