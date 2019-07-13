const emailLookup = function (email, users) {
  for (let id in users) {
    let user = users[id];
    if (email === user.email) {
      return user;
    }
  }
  return null;
};


module.exports = emailLookup;