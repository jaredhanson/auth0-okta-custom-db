function create(user, callback) {
  // This script should create a user entry in your existing database. It will
  // be executed when a user attempts to sign up, or when a user is created
  // through the Auth0 dashboard or API.
  // When this script has finished executing, the Login script will be
  // executed immediately afterwards, to verify that the user was created
  // successfully.
  //
  // The user object will always contain the following properties:
  // * email: the user's email
  // * password: the password entered by the user, in plain text
  // * tenant: the name of this Auth0 account
  // * client_id: the client ID of the application where the user signed up, or
  //              API key if created through the API or Auth0 dashboard
  // * connection: the name of this database connection
  //
  // There are three ways this script can finish:
  // 1. A user was successfully created
  //     callback(null);
  // 2. This user already exists in your database
  //     callback(new ValidationError("user_exists", "my error message"));
  // 3. Something went wrong while trying to reach your database
  //     callback(new Error("my error message"));

  var fetch = require('node-fetch@2.6.0');
  
  const url = configuration.OKTA_CLIENT_ORGURL + 'api/v1/users';
  
  const body = {
    profile: {
      firstName: 'Unknown',
      lastName: 'Unknown',
      email: user.email,
      login: user.email
    },
    credentials: {
    	password: { value: user.password }
    }
  };
  
  fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'SSWS ' + configuration.OKTA_CLIENT_TOKEN,
    	'Content-Type': 'application/json',
    	'Accept': 'application/json'
    },
    body: JSON.stringify(body),
  })
  .then(function(response) {
    if (response.status !== 200) {
      return response.json()
      	.then(function(json) {
        	return Promise.reject(new Error(json.errorSummary));
      	});
    }
    
    return response.json();
  })
  .then(function(json) {
    return callback(null);
  })
  .catch(function(error) {
  	return callback(error);
  });
  
  //const msg = 'Please implement the Create script for this database connection ' +
  //  'at https://manage.auth0.com/#/connections/database';
  //return callback(new Error(msg));
}
