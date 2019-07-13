const emailLookup = function (email, users) {
  for (let account in users) {
    let user = users[account];
    if (email === user.email) {
      return user;
    }
  }
  return null;
};



module.exports = emailLookup;