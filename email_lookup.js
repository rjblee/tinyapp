const emailLookup = function (email, users) {
  for (let id in users) {
    let user = users[id];
    if (email === user.email) {
      return user;
    }
  }
  return null;
};

  // const doesUserExist(email) {
  //   for (...) {
  //     // return true if found
  //   }
  //   return false
  // }

module.exports = emailLookup;