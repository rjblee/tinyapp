const bcrypt = require('bcrypt');

const canYouLogin = function (email, password, users) {

  for (let usersKey in users) {
  
    if (email === users[usersKey].email && bcrypt.compareSync(password, users[usersKey].password)) {
        let matchedUser = users[usersKey];
        return matchedUser;
    } 
  }
  return false;
}

module.exports = canYouLogin;