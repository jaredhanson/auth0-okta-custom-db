function remove(id, callback) {
  // This script remove a user from your existing database.
  // It is executed whenever a user is deleted from the API or Auth0 dashboard.
  //
  // There are two ways that this script can finish:
  // 1. The user was removed successfully:
  //     callback(null);
  // 2. Something went wrong while trying to reach your database:
  //     callback(new Error("my error message"));

  var fetch = require('node-fetch@2.6.0');
  
  var comps = id.split('|');
  if (comps.length === 2 && comps[0] === 'auth0') {
    id = comps[1];
  }
  
  var url = configuration.OKTA_CLIENT_ORGURL + 'api/v1/users/' + id + '/lifecycle/deactivate';
  
  fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'SSWS ' + configuration.OKTA_CLIENT_TOKEN,
    	'Accept': 'application/json'
    }
  })
  .then(function(response) {
    if (response.status === 404) {
      // deativate returns a 404 for users already in deactivated state
      return Promise.resolve({});
    } else if (response.status !== 200) {
      return response.json()
      	.then(function(json) {
        	return Promise.reject(new Error(json.errorSummary));
      	});
    }
    
    // success
    return response.json();
  })
  .then(function(json) {
    const url = configuration.OKTA_CLIENT_ORGURL + 'api/v1/users/' + id;
    
    return fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': 'SSWS ' + configuration.OKTA_CLIENT_TOKEN,
    	  'Accept': 'application/json'
      }
    });
  })
  .then(function(response) {
    if (response.status === 404) {
      return callback();
    } else if (response.status !== 204) {
      return response.json()
      	.then(function(json) {
        	return Promise.reject(new Error(json.errorSummary));
      	});
    }
    
    // success
    return callback();
  })
  .catch(function(error) {
  	return callback(error);
  });
  
  //const msg = 'Please implement the Delete script for this database ' +
  //  'connection at https://manage.auth0.com/#/connections/database';
  //return callback(new Error(msg));
}
